const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const loader = require("../gist-preview-loader.js");

function sourceOrder(html, element) {
    const pattern = new RegExp(`<${element}[^>]*data-gist-source="([^"]+)"`, "gi");
    return [...html.matchAll(pattern)].map(match => match[1]);
}

function bootstrapSource(html) {
    const match = html.match(/<script data-gist-worker-bootstrap>([\s\S]*?)<\/script>/i);
    assert.ok(match, "preview should contain the Worker bootstrap");
    return match[1];
}

test("uses index.html resource order and skips unreferenced workers and tests", () => {
    const html = `<!doctype html><html><head>
        <link rel="stylesheet" href="style.css">
    </head><body>
        <script src="game-data.js"></script>
        <script async src="game-engine.js"></script>
        <script src="game-simulator.js" defer></script>
        <script src="balance-optimizer.js"></script>
        <script src="script.js"></script>
    </body></html>`;
    const files = [
        { filename: "script.js", content: "globalThis.pageLoaded = true;" },
        { filename: "balance-worker.js", content: 'importScripts("game-data.js", "game-engine.js"); self.onmessage = () => {};' },
        { filename: "tests_engine.test.js", content: "throw new Error('test must not run');" },
        { filename: "balance-optimizer.js", content: "globalThis.optimizerLoaded = true;" },
        { filename: "game-simulator.js", content: "globalThis.simulatorLoaded = true;" },
        { filename: "game-engine.js", content: "globalThis.engineLoaded = true;" },
        { filename: "game-data.js", content: "globalThis.dataLoaded = true;" },
        { filename: "style.css", content: "body { color: white; }" }
    ];

    const result = loader.buildPreviewDocument(html, files);

    assert.deepEqual(sourceOrder(result.html, "style"), ["style.css"]);
    assert.deepEqual(sourceOrder(result.html, "script"), [
        "game-data.js",
        "game-engine.js",
        "game-simulator.js",
        "balance-optimizer.js",
        "script.js"
    ]);
    assert.equal(result.matchedScripts, 5);
    assert.doesNotMatch(result.html, /data-gist-source="balance-worker\.js"/);
    assert.doesNotMatch(result.html, /data-gist-source="tests_engine\.test\.js"/);
    assert.doesNotMatch(result.html, /<script[^>]*\s(?:async|defer)(?:\s|=|>)/i);
});

test("executes the generated Worker bootstrap and resolves a relative Worker URL", () => {
    const files = [
        { filename: "game-data.js", content: "self.loadOrder = ['data'];" },
        { filename: "game-engine.js", content: "self.loadOrder.push('engine');" },
        {
            filename: "balance-worker.js",
            content: 'importScripts("game-data.js", "game-engine.js"); self.onmessage = () => self.postMessage(self.loadOrder);'
        }
    ];
    const result = loader.buildPreviewDocument("<html><head></head><body></body></html>", files);
    const createdBlobs = [];

    class NativeWorker {
        constructor(url, options) {
            this.url = url;
            this.options = options;
        }
    }
    class FakeBlob {
        constructor(parts, options) {
            this.source = parts.join("");
            this.options = options;
        }
    }
    const context = {
        window: { Worker: NativeWorker },
        Blob: FakeBlob,
        URL: {
            createObjectURL(blob) {
                createdBlobs.push(blob);
                return `blob:test-${createdBlobs.length}`;
            }
        }
    };

    vm.runInNewContext(bootstrapSource(result.html), context);

    const worker = new context.window.Worker("balance-worker.js");
    assert.equal(worker.url, "blob:test-1");
    assert.equal(createdBlobs.length, 1);
    assert.ok(createdBlobs[0].source.indexOf("['data']") < createdBlobs[0].source.indexOf("push('engine')"));
    assert.doesNotMatch(createdBlobs[0].source, /importScripts\s*\(\s*["']game-data\.js/);

    const externalWorker = new context.window.Worker("https://example.com/worker.js", { type: "module" });
    assert.equal(externalWorker.url, "https://example.com/worker.js");
    assert.deepEqual(externalWorker.options, { type: "module" });
});

test("resolves flattened Gist paths", () => {
    const result = loader.buildPreviewDocument(
        '<html><head></head><body><script src="scripts/app.js"></script></body></html>',
        [{ filename: "scripts_app.js", content: "globalThis.flattened = true;" }]
    );

    assert.deepEqual(sourceOrder(result.html, "script"), ["scripts_app.js"]);
});

test("preview iframe permits dialog forms without dropping script isolation", () => {
    const indexHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
    assert.match(indexHtml, /<iframe\b[^>]*sandbox="[^"]*allow-scripts[^"]*allow-forms[^"]*"/i);
    assert.doesNotMatch(indexHtml, /<iframe\b[^>]*sandbox="[^"]*allow-same-origin/i);
});
