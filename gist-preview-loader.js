(function exposeGistPreviewLoader(root, factory) {
    const loader = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = loader;
    root.GistPreviewLoader = loader;
})(typeof globalThis !== "undefined" ? globalThis : this, function createGistPreviewLoader() {
    "use strict";

    function normalizedPath(value) {
        return String(value || "")
            .trim()
            .replace(/[?#].*$/, "")
            .replaceAll("\\", "/")
            .replace(/^\.\//, "")
            .replace(/^\/+/, "")
            .toLowerCase();
    }

    function basename(value) {
        return normalizedPath(value).split("/").pop() || "";
    }

    function isExternalReference(value) {
        return /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(String(value || "").trim());
    }

    function fileAliases(filename) {
        const normalized = normalizedPath(filename);
        return [...new Set([normalized, basename(normalized)])].filter(Boolean);
    }

    function referenceAliases(reference) {
        const normalized = normalizedPath(reference);
        return [...new Set([normalized, normalized.replaceAll("/", "_"), basename(normalized)])].filter(Boolean);
    }

    function createFileLookup(files) {
        const lookup = new Map();
        files.forEach(file => fileAliases(file.filename).forEach(alias => {
            if (!lookup.has(alias)) lookup.set(alias, file);
        }));
        return lookup;
    }

    function resolveFile(reference, lookup) {
        if (!reference || isExternalReference(reference)) return null;
        for (const alias of referenceAliases(reference)) {
            if (lookup.has(alias)) return lookup.get(alias);
        }
        return null;
    }

    function getAttribute(attributes, name) {
        const match = String(attributes || "").match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
        return match ? (match[1] ?? match[2] ?? match[3] ?? "") : null;
    }

    function removeAttribute(attributes, name) {
        return String(attributes || "").replace(new RegExp(`\\s${name}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`, "ig"), "");
    }

    function escapeAttribute(value) {
        return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    }

    function escapeInlineScript(source) {
        return String(source).replace(/<\/script/gi, "<\\/script");
    }

    function escapeInlineStyle(source) {
        return String(source).replace(/<\/style/gi, "<\\/style");
    }

    function isWorkerFile(file) {
        return /\bimportScripts\s*\(|\bself\.(?:onmessage\s*=|addEventListener\s*\(\s*["']message["'])/.test(file.content || "");
    }

    function isTestFile(file) {
        const name = normalizedPath(file.filename);
        return /(?:^|[_/.-])tests?(?:[_/.-]|$)|(?:^|[_.-])spec(?:[_.-]|$)/i.test(name);
    }

    function buildWorkerBundle(entryFile, lookup) {
        const visited = new Set();
        function bundle(file) {
            const key = normalizedPath(file.filename);
            if (visited.has(key)) return "";
            visited.add(key);
            return String(file.content || "").replace(/\bimportScripts\s*\(([^;]*?)\)\s*;?/g, (statement, argumentsSource) => {
                const references = [];
                String(argumentsSource).replace(/(["'])(.*?)\1/g, (_match, _quote, reference) => {
                    references.push(reference);
                    return _match;
                });
                if (!references.length) return statement;
                const localSources = [];
                const externalReferences = [];
                references.forEach(reference => {
                    const dependency = resolveFile(reference, lookup);
                    if (dependency) localSources.push(`\n/* ${dependency.filename} */\n${bundle(dependency)}\n`);
                    else externalReferences.push(reference);
                });
                if (externalReferences.length) {
                    localSources.push(`\nimportScripts(${externalReferences.map(reference => JSON.stringify(reference)).join(", ")});\n`);
                }
                return localSources.join("");
            });
        }
        return bundle(entryFile);
    }

    function workerSourceMap(files, lookup) {
        const sources = {};
        files.filter(isWorkerFile).forEach(file => {
            const source = buildWorkerBundle(file, lookup);
            referenceAliases(file.filename).forEach(alias => { sources[alias] = source; });
        });
        return sources;
    }

    function workerBootstrap(sources) {
        if (!Object.keys(sources).length) return "";
        const serialized = JSON.stringify(sources).replaceAll("<", "\\u003c");
        return `<script data-gist-worker-bootstrap>
(() => {
    const sources = ${serialized};
    const NativeWorker = window.Worker;
    if (typeof NativeWorker !== "function") return;
    const normalize = value => String(value || "").replace(/[?#].*$/, "").replace(/\\\\/g, "/").replace(/^\\.\\//, "").replace(/^\\/+/, "").toLowerCase();
    window.Worker = class GistPreviewWorker extends NativeWorker {
        constructor(url, options) {
            const raw = String(url || "");
            const key = /^(?:blob:|data:|https?:|\/\/)/i.test(raw) ? "" : normalize(raw);
            const source = sources[key] || sources[key.split("/").pop()];
            if (!source) {
                super(url, options);
                return;
            }
            const objectUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
            super(objectUrl, options);
        }
    };
})();
<\/script>`;
    }

    function ensureDocument(htmlContent) {
        if (/<html\b/i.test(htmlContent)) return htmlContent;
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${htmlContent}</body></html>`;
    }

    function insertBeforeClosingTag(html, tagName, content) {
        if (!content) return html;
        const closing = new RegExp(`</${tagName}>`, "i");
        return closing.test(html) ? html.replace(closing, `${content}\n</${tagName}>`) : `${html}\n${content}`;
    }

    function insertAfterOpeningHead(html, content) {
        if (!content) return html;
        return /<head\b[^>]*>/i.test(html)
            ? html.replace(/<head\b[^>]*>/i, match => `${match}\n${content}`)
            : `${content}\n${html}`;
    }

    function fallbackPageScripts(files) {
        return files
            .filter(file => /\.js$/i.test(file.filename) && !isWorkerFile(file) && !isTestFile(file))
            .sort((left, right) => left.filename.localeCompare(right.filename, undefined, { numeric: true, sensitivity: "base" }));
    }

    function buildPreviewDocument(htmlContent, files) {
        const lookup = createFileLookup(files);
        const usedStyles = new Set();
        const usedScripts = new Set();
        let matchedStyles = 0;
        let matchedScripts = 0;
        let documentHtml = ensureDocument(String(htmlContent || ""));

        documentHtml = documentHtml.replace(/<link\b([^>]*?)>/gi, (tag, attributes) => {
            const relation = getAttribute(attributes, "rel");
            const reference = getAttribute(attributes, "href");
            if (!relation?.split(/\s+/).some(value => value.toLowerCase() === "stylesheet")) return tag;
            const file = resolveFile(reference, lookup);
            if (!file || !/\.css$/i.test(file.filename)) return tag;
            matchedStyles += 1;
            usedStyles.add(normalizedPath(file.filename));
            return `<style data-gist-source="${escapeAttribute(file.filename)}">\n${escapeInlineStyle(file.content)}\n</style>`;
        });

        documentHtml = documentHtml.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, (tag, attributes) => {
            const reference = getAttribute(attributes, "src");
            if (!reference) return tag;
            const file = resolveFile(reference, lookup);
            if (!file || !/\.js$/i.test(file.filename)) return tag;
            matchedScripts += 1;
            usedScripts.add(normalizedPath(file.filename));
            const cleanedAttributes = removeAttribute(removeAttribute(removeAttribute(attributes, "src"), "async"), "defer");
            return `<script${cleanedAttributes} data-gist-source="${escapeAttribute(file.filename)}">\n${escapeInlineScript(file.content)}\n<\/script>`;
        });

        if (matchedStyles === 0) {
            const styles = files.filter(file => /\.css$/i.test(file.filename))
                .sort((left, right) => left.filename.localeCompare(right.filename, undefined, { numeric: true, sensitivity: "base" }))
                .map(file => `<style data-gist-source="${escapeAttribute(file.filename)}">\n${escapeInlineStyle(file.content)}\n</style>`)
                .join("\n");
            documentHtml = insertBeforeClosingTag(documentHtml, "head", styles);
        }

        if (matchedScripts === 0) {
            const scripts = fallbackPageScripts(files)
                .map(file => `<script data-gist-source="${escapeAttribute(file.filename)}">\n${escapeInlineScript(file.content)}\n<\/script>`)
                .join("\n");
            documentHtml = insertBeforeClosingTag(documentHtml, "body", scripts);
        }

        documentHtml = insertAfterOpeningHead(documentHtml, workerBootstrap(workerSourceMap(files, lookup)));
        return { html: documentHtml, matchedStyles, matchedScripts, usedStyles: [...usedStyles], usedScripts: [...usedScripts] };
    }

    return {
        normalizedPath, createFileLookup, resolveFile, isWorkerFile, isTestFile,
        buildWorkerBundle, buildPreviewDocument
    };
});
