// Elementy DOM
const gistInput = document.getElementById('gistInput');
const loadBtn = document.getElementById('loadBtn');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const gistInfo = document.getElementById('gistInfo');
const filesSection = document.getElementById('filesSection');
const filesContainer = document.getElementById('filesContainer');

// Elementy informacji o Giście
const gistTitle = document.getElementById('gistTitle');
const gistAuthor = document.getElementById('gistAuthor');
const gistCreated = document.getElementById('gistCreated');
const fileCount = document.getElementById('fileCount');
const gistDescription = document.getElementById('gistDescription');

// Elementy tokena GitHub
const githubTokenInput = document.getElementById('githubToken');
const saveTokenBtn = document.getElementById('saveTokenBtn');
const clearTokenBtn = document.getElementById('clearTokenBtn');
const tokenStatus = document.getElementById('tokenStatus');

// Klucz dla localStorage
const TOKEN_STORAGE_KEY = 'github_gist_token';

// Funkcje obsługi tokena
function saveToken() {
    const token = githubTokenInput.value.trim();
    if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        showTokenStatus('✓ Token saved successfully!', 'success');
        githubTokenInput.value = '••••••••••••••••';
    } else {
        showTokenStatus('⚠ Please enter a valid token', 'error');
    }
}

function loadToken() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
        githubTokenInput.value = '••••••••••••••••';
        showTokenStatus('✓ Token loaded from storage', 'success');
    }
}

function clearToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    githubTokenInput.value = '';
    showTokenStatus('✓ Token cleared', 'success');
    setTimeout(() => {
        tokenStatus.textContent = '';
        tokenStatus.className = 'token-status';
    }, 2000);
}

function showTokenStatus(message, type) {
    tokenStatus.textContent = message;
    tokenStatus.className = `token-status ${type}`;
}

function getAuthHeaders() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
        return {
            'Authorization': `Bearer ${token}`
        };
    }
    return {};
}

// Event listeners
loadBtn.addEventListener('click', loadGist);
gistInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loadGist();
    }
});

// Event listeners dla tokena
saveTokenBtn.addEventListener('click', saveToken);
clearTokenBtn.addEventListener('click', clearToken);
githubTokenInput.addEventListener('focus', () => {
    if (githubTokenInput.value === '••••••••••••••••') {
        githubTokenInput.value = '';
    }
});

// Funkcja do wyciągania ID Gista z URL lub bezpośredniego ID
function extractGistId(input) {
    input = input.trim();
    
    // Jeśli to pełny URL
    const urlPattern = /gist\.github\.com\/(?:[\w-]+\/)?([a-f0-9]+)/i;
    const match = input.match(urlPattern);
    
    if (match) {
        return match[1];
    }
    
    // Jeśli to samo ID (hex string)
    if (/^[a-f0-9]+$/i.test(input)) {
        return input;
    }
    
    return null;
}

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Funkcja do ukrywania/pokazywania sekcji
function hideAllSections() {
    errorSection.classList.add('hidden');
    gistInfo.classList.add('hidden');
    filesSection.classList.add('hidden');
}

// Funkcja do wyświetlania błędu
function showError(message) {
    hideAllSections();
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
}

// Funkcja do ustawienia stanu ładowania
function setLoading(isLoading) {
    if (isLoading) {
        loadBtn.classList.add('loading');
        loadBtn.disabled = true;
        gistInput.disabled = true;
    } else {
        loadBtn.classList.remove('loading');
        loadBtn.disabled = false;
        gistInput.disabled = false;
    }
}

// Główna funkcja ładowania Gista
async function loadGist() {
    const input = gistInput.value;
    
    if (!input) {
        showError('Please enter Gist ID or URL');
        return;
    }
    
    const gistId = extractGistId(input);
    
    if (!gistId) {
        showError('Invalid Gist ID or URL format');
        return;
    }
    
    setLoading(true);
    hideAllSections();
    
    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Gist not found. Please check if the ID is correct.');
            } else if (response.status === 403) {
                throw new Error('API rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`HTTP error: ${response.status}`);
            }
        }
        
        const gistData = await response.json();
        displayGist(gistData);
        
    } catch (error) {
        showError(`Error loading Gist: ${error.message}`);
    } finally {
        setLoading(false);
    }
}

// Funkcja do wyświetlania informacji o Giście
function displayGist(gistData) {
    hideAllSections();
    
    // Fill information
    const title = gistData.description || 'Untitled';
    gistTitle.textContent = title;
    
    gistAuthor.textContent = gistData.owner ? gistData.owner.login : 'Anonymous';
    gistCreated.textContent = formatDate(gistData.created_at);
    
    const files = Object.values(gistData.files);
    fileCount.textContent = files.length;
    
    if (gistData.description) {
        gistDescription.textContent = gistData.description;
        gistDescription.style.display = 'block';
    } else {
        gistDescription.style.display = 'none';
    }
    
    // Wyświetlanie plików
    filesContainer.innerHTML = '';
    files.forEach(file => {
        const fileCard = createFileCard(file);
        filesContainer.appendChild(fileCard);
    });
    
    // Pokazywanie sekcji
    gistInfo.classList.remove('hidden');
    filesSection.classList.remove('hidden');
}

// Funkcja do tworzenia karty pliku
function createFileCard(file) {
    const card = document.createElement('div');
    card.className = 'file-card';
    
    const header = document.createElement('div');
    header.className = 'file-header';
    
    const fileName = document.createElement('span');
    fileName.className = 'file-name';
    fileName.textContent = file.filename;
    
    const rightSection = document.createElement('div');
    rightSection.style.display = 'flex';
    rightSection.style.gap = '10px';
    rightSection.style.alignItems = 'center';
    
    if (file.language) {
        const language = document.createElement('span');
        language.className = 'file-language';
        language.textContent = file.language;
        rightSection.appendChild(language);
    }
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '📋 Copy';
    copyBtn.onclick = () => copyToClipboard(file.content, copyBtn);
    rightSection.appendChild(copyBtn);
    
    header.appendChild(fileName);
    header.appendChild(rightSection);
    
    const content = document.createElement('div');
    content.className = 'file-content';
    
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = file.content;
    pre.appendChild(code);
    content.appendChild(pre);
    
    card.appendChild(header);
    card.appendChild(content);
    
    return card;
}

// Funkcja do kopiowania do schowka
async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        const originalText = button.textContent;
        button.textContent = '✓ Copied';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    } catch (err) {
        showError('Failed to copy to clipboard');
    }
}

// Obsługa parametrów URL i hash routing
window.addEventListener('DOMContentLoaded', () => {
    // Załaduj token z localStorage jeśli istnieje
    loadToken();
    
    // Inicjalizacja zakładek
    initTabs();
    initSubTabs();
    
    // Obsługa hash routing: #/LivePreview/{gist_id}
    const hash = window.location.hash;
    const livePreviewMatch = hash.match(/#\/LivePreview\/([a-f0-9]+)/i);
    
    if (livePreviewMatch) {
        const gistId = livePreviewMatch[1];
        
        // Przełącz na zakładkę Live Preview
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector('[data-tab="preview"]').classList.add('active');
        document.getElementById('previewTab').classList.add('active');
        
        // Ustaw input i załaduj Gist z auto-fullscreen
        singleGistInput.value = gistId;
        shouldAutoFullscreen = true;
        loadSingleGist();
    } else {
        // Standardowa obsługa query params (?gist=...)
        const urlParams = new URLSearchParams(window.location.search);
        const gistParam = urlParams.get('gist');
        
        if (gistParam) {
            gistInput.value = gistParam;
            loadGist();
        }
    }
});

// ===== LIVE PREVIEW FUNCTIONALITY =====

// Elementy dla Live Preview
const singleGistInput = document.getElementById('singleGist');
const loadSingleGistBtn = document.getElementById('loadSingleGistBtn');
const htmlGistInput = document.getElementById('htmlGist');
const cssGistInput = document.getElementById('cssGist');
const jsGistInput = document.getElementById('jsGist');
const loadPreviewBtn = document.getElementById('loadPreviewBtn');
const previewContainer = document.getElementById('previewContainer');
const previewFrame = document.getElementById('previewFrame');
const fullscreenPreviewBtn = document.getElementById('fullscreenPreview');
const refreshPreviewBtn = document.getElementById('refreshPreview');

// Event listeners dla Live Preview
loadSingleGistBtn.addEventListener('click', loadSingleGist);
loadPreviewBtn.addEventListener('click', loadPreview);
fullscreenPreviewBtn.addEventListener('click', toggleFullscreen);
refreshPreviewBtn.addEventListener('click', () => {
    // Odśwież w zależności od tego, który tryb był użyty
    if (singleGistInput.value.trim()) {
        loadSingleGist();
    } else if (htmlGistInput.value.trim()) {
        loadPreview();
    }
});

// Inicjalizacja zakładek
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Ukryj wszystkie sekcje błędów i info przy zmianie zakładki
            hideAllSections();
            
            // Usuń active z wszystkich przycisków i contentu
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Dodaj active do klikniętego
            btn.classList.add('active');
            
            // Pokaż odpowiedni content
            if (tabName === 'single') {
                document.getElementById('singleTab').classList.add('active');
            } else if (tabName === 'preview') {
                document.getElementById('previewTab').classList.add('active');
            }
        });
    });
}

// Inicjalizacja sub-tabs (dla Live Preview)
function initSubTabs() {
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    const subTabContents = document.querySelectorAll('.sub-tab-content');
    
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const subTabName = btn.dataset.subtab;
            
            // Ukryj sekcje błędów przy zmianie sub-tab
            hideAllSections();
            
            // Usuń active z wszystkich sub-tab przycisków i contentu
            subTabBtns.forEach(b => b.classList.remove('active'));
            subTabContents.forEach(c => c.classList.remove('active'));
            
            // Dodaj active do klikniętego
            btn.classList.add('active');
            
            // Pokaż odpowiedni sub-tab content
            if (subTabName === 'single') {
                document.getElementById('singleGistSubtab').classList.add('active');
            } else if (subTabName === 'multiple') {
                document.getElementById('multipleGistsSubtab').classList.add('active');
            }
        });
    });
}

// Pomocnicza funkcja do pobierania zawartości pliku (obsługuje truncated files)
async function getFileContent(file) {
    // If file is truncated or too large, fetch from raw_url
    if (file.truncated || !file.content || file.size > 1000000) {
        const rawResponse = await fetch(file.raw_url, {
            headers: getAuthHeaders()
        });
        if (!rawResponse.ok) {
            throw new Error(`Failed to fetch raw file ${file.filename}: ${rawResponse.status}`);
        }
        return await rawResponse.text();
    }
    return file.content;
}

// Funkcja do pobierania pliku z Gista
async function fetchGistFile(gistId, fileType) {
    if (!gistId || gistId.trim() === '') {
        return null;
    }
    
    const id = extractGistId(gistId);
    if (!id) {
        throw new Error(`Invalid Gist ID format for ${fileType}`);
    }
    
    const response = await fetch(`https://api.github.com/gists/${id}`, {
        headers: getAuthHeaders()
    });
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`${fileType} Gist not found`);
        } else if (response.status === 403) {
            throw new Error('API rate limit exceeded');
        } else {
            throw new Error(`HTTP error ${response.status} for ${fileType}`);
        }
    }
    
    const gistData = await response.json();
    const files = Object.values(gistData.files);
    
    // Znajdź odpowiedni plik na podstawie rozszerzenia
    let targetFile = null;
    
    if (fileType === 'HTML') {
        targetFile = files.find(f => f.filename.endsWith('.html') || f.filename.endsWith('.htm'));
    } else if (fileType === 'CSS') {
        targetFile = files.find(f => f.filename.endsWith('.css'));
    } else if (fileType === 'JS') {
        targetFile = files.find(f => f.filename.endsWith('.js'));
    }
    
    // Jeśli nie znaleziono pliku z odpowiednim rozszerzeniem, weź pierwszy plik
    if (!targetFile && files.length > 0) {
        targetFile = files[0];
    }
    
    if (!targetFile) {
        return null;
    }
    
    // If file is truncated or too large, fetch from raw_url
    if (targetFile.truncated || !targetFile.content || targetFile.size > 1000000) {
        const rawResponse = await fetch(targetFile.raw_url, {
            headers: getAuthHeaders()
        });
        if (!rawResponse.ok) {
            throw new Error(`Failed to fetch raw file: ${rawResponse.status}`);
        }
        return await rawResponse.text();
    }
    
    return targetFile.content;
}

// Główna funkcja ładowania Live Preview
async function loadPreview() {
    const htmlGistId = htmlGistInput.value.trim();
    const cssGistId = cssGistInput.value.trim();
    const jsGistId = jsGistInput.value.trim();
    
    if (!htmlGistId) {
        showError('Please provide at least HTML Gist ID');
        return;
    }
    
    setLoading(true, loadPreviewBtn);
    hideAllSections();
    
    try {
        // Pobierz zawartość z Gistów
        const htmlContent = await fetchGistFile(htmlGistId, 'HTML');
        const cssContent = cssGistId ? await fetchGistFile(cssGistId, 'CSS') : null;
        const jsContent = jsGistId ? await fetchGistFile(jsGistId, 'JS') : null;
        
        if (!htmlContent) {
            throw new Error('HTML file not found in the provided Gist');
        }
        
        // Utwórz tablice plików dla renderPreview
        const cssFiles = cssContent ? [{filename: 'styles.css', content: cssContent}] : [];
        const jsFiles = jsContent ? [{filename: 'script.js', content: jsContent}] : [];
        
        // Renderuj z oddzielnymi tagami dla każdego pliku
        renderPreview(htmlContent, cssFiles, jsFiles);
        
        // Pokaż kontener preview
        previewContainer.classList.remove('hidden');
        
    } catch (error) {
        showError(`Error loading preview: ${error.message}`);
        previewContainer.classList.add('hidden');
    } finally {
        setLoading(false, loadPreviewBtn);
    }
}

// Zmienna do przechowywania aktualnego Blob URL
let currentBlobUrl = null;

// Funkcja do renderowania preview z tablicami plików
// cssFiles i jsFiles to tablice obiektów {filename, content}
function renderPreview(htmlContent, cssFiles = [], jsFiles = []) {
    let fullHTML = htmlContent;
    
    // Jeśli HTML nie zawiera podstawowej struktury, dodaj ją
    if (!htmlContent.includes('<html') && !htmlContent.includes('<HTML')) {
        // Utwórz oddzielne tagi <style> dla każdego pliku CSS
        const styleTags = cssFiles.map(file => 
            `    <!-- ${file.filename} -->\n    <style>\n${file.content}\n    </style>`
        ).join('\n');
        
        // Utwórz oddzielne tagi <script> dla każdego pliku JS
        const scriptTags = jsFiles.map(file =>
            `    <!-- ${file.filename} -->\n    <script>\n${file.content}\n    <\/script>`
        ).join('\n');
        
        fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
${styleTags}
</head>
<body>
    ${htmlContent}
${scriptTags}
</body>
</html>`;
    } else {
        // HTML ma już strukturę - wstrzyknij oddzielne tagi
        if (cssFiles.length > 0) {
            const styleTags = cssFiles.map(file => 
                `<!-- ${file.filename} -->\n<style>\n${file.content}\n</style>`
            ).join('\n');
            
            if (fullHTML.includes('</head>')) {
                fullHTML = fullHTML.replace('</head>', `${styleTags}\n</head>`);
            } else {
                fullHTML = `${styleTags}\n` + fullHTML;
            }
        }
        
        if (jsFiles.length > 0) {
            const scriptTags = jsFiles.map(file =>
                `<!-- ${file.filename} -->\n<script>\n${file.content}\n<\/script>`
            ).join('\n');
            
            if (fullHTML.includes('</body>')) {
                fullHTML = fullHTML.replace('</body>', `${scriptTags}\n</body>`);
            } else {
                fullHTML = fullHTML + `\n${scriptTags}`;
            }
        }
    }
    
    // Zwolnij stary Blob URL jeśli istnieje
    if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
    }
    
    // Utwórz nowy Blob URL (zamiast srcdoc, żeby uniknąć CSP restrictions)
    const blob = new Blob([fullHTML], { type: 'text/html' });
    currentBlobUrl = URL.createObjectURL(blob);
    
    // Renderuj w iframe używając Blob URL
    previewFrame.src = currentBlobUrl;
}

// Funkcja do ładowania Single Gist (automatycznie znajdzie HTML, CSS, JS)
async function loadSingleGist() {
    const gistId = singleGistInput.value.trim();
    
    if (!gistId) {
        showError('Please provide Gist ID');
        return;
    }
    
    const id = extractGistId(gistId);
    if (!id) {
        showError('Invalid Gist ID format');
        return;
    }
    
    setLoading(true, loadSingleGistBtn);
    hideAllSections();
    
    try {
        const response = await fetch(`https://api.github.com/gists/${id}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Gist not found');
            } else if (response.status === 403) {
                throw new Error('API rate limit exceeded');
            } else {
                throw new Error(`HTTP error ${response.status}`);
            }
        }
        
        const gistData = await response.json();
        const files = Object.values(gistData.files);
        
        // Znajdź i połącz wszystkie pliki HTML, CSS, JS
        let htmlContent = null;
        let cssContent = '';
        let jsContent = '';
        
        // Zbierz wszystkie pliki według typu
        const htmlFiles = [];
        const cssFiles = [];
        const jsFiles = [];
        
        files.forEach(file => {
            const filename = file.filename.toLowerCase();
            if (filename.endsWith('.html') || filename.endsWith('.htm')) {
                htmlFiles.push(file);
            } else if (filename.endsWith('.css')) {
                cssFiles.push(file);
            } else if (filename.endsWith('.js')) {
                jsFiles.push(file);
            }
        });
        
        // Znajdź wszystkie pliki .base64.txt (obrazki)
        const base64ImageFiles = files.filter(f => f.filename.endsWith('.base64.txt'));
        
        // Załaduj zawartość wszystkich plików .base64.txt i stwórz mapę obrazków
        const imageMap = {};
        if (base64ImageFiles.length > 0) {
            await Promise.all(
                base64ImageFiles.map(async (file) => {
                    // Przekonwertuj nazwę pliku: images_blue_block.png.base64.txt -> images/blue_block.png
                    const originalPath = file.filename
                        .replace('.base64.txt', '')  // Usuń .base64.txt
                        .replace(/_/g, '/');          // Zamień _ na /
                    
                    // Określ MIME type na podstawie rozszerzenia
                    const extension = originalPath.split('.').pop().toLowerCase();
                    const mimeTypes = {
                        'png': 'image/png',
                        'jpg': 'image/jpeg',
                        'jpeg': 'image/jpeg',
                        'gif': 'image/gif',
                        'svg': 'image/svg+xml',
                        'webp': 'image/webp'
                    };
                    const mimeType = mimeTypes[extension] || 'image/png';
                    
                    // Załaduj zawartość base64
                    let base64Content = await getFileContent(file);
                    base64Content = base64Content.trim();
                    
                    // Sprawdź czy base64Content już jest data URL (zaczyna się od "data:")
                    let dataUrl;
                    if (base64Content.startsWith('data:')) {
                        // Już jest pełny data URL, użyj bezpośrednio
                        dataUrl = base64Content;
                    } else {
                        // Tylko czysty base64, dodaj prefix
                        dataUrl = `data:${mimeType};base64,${base64Content}`;
                    }
                    
                    // Dodaj do mapy (zarówno z / jak i bez dla kompatybilności)
                    imageMap[originalPath] = dataUrl;
                    imageMap[originalPath.replace(/^images\//, '')] = dataUrl; // Również bez images/
                })
            );
        }
        
        // HTML: Użyj index.html jeśli istnieje, w przeciwnym razie pierwszy plik HTML
        if (htmlFiles.length > 0) {
            const indexFile = htmlFiles.find(f => f.filename.toLowerCase() === 'index.html');
            const targetHtmlFile = indexFile || htmlFiles[0];
            htmlContent = await getFileContent(targetHtmlFile);
        }
        
        if (!htmlContent) {
            throw new Error('HTML file not found in Gist. Make sure the Gist contains a .html or .htm file');
        }
        
        // Zamień wszystkie src obrazków na data URLs (jeśli są jakieś obrazki w mapie)
        if (Object.keys(imageMap).length > 0) {
            htmlContent = htmlContent.replace(/src=["']([^"']+)["']/gi, (match, imagePath) => {
                // Sprawdź czy ten obrazek jest w mapie
                if (imageMap[imagePath]) {
                    return `src="${imageMap[imagePath]}"`;
                }
                return match; // Jeśli nie ma w mapie, zostaw bez zmian
            });
            
            // Zamień również w CSS background-image: url(...)
            htmlContent = htmlContent.replace(/url\(["']?([^"')]+)["']?\)/gi, (match, imagePath) => {
                if (imageMap[imagePath]) {
                    return `url("${imageMap[imagePath]}")`;
                }
                return match;
            });
        }
        
        // Pobierz zawartość wszystkich plików CSS i JS (obsługa truncated files)
        const cssFilesWithContent = await Promise.all(
            cssFiles.map(async (file) => {
                let content = await getFileContent(file);
                
                // Zamień również obrazki w CSS
                if (Object.keys(imageMap).length > 0) {
                    content = content.replace(/url\(["']?([^"')]+)["']?\)/gi, (match, imagePath) => {
                        if (imageMap[imagePath]) {
                            return `url("${imageMap[imagePath]}")`;
                        }
                        return match;
                    });
                }
                
                return {
                    filename: file.filename,
                    content: content
                };
            })
        );
        
        const jsFilesWithContent = await Promise.all(
            jsFiles.map(async (file) => {
                let content = await getFileContent(file);
                
                // Zamień również obrazki w JavaScript
                if (Object.keys(imageMap).length > 0) {
                    // 1. Zamień .src = "path"
                    content = content.replace(/\.src\s*=\s*["']([^"']+)["']/gi, (match, imagePath) => {
                        if (imageMap[imagePath]) {
                            return `.src = "${imageMap[imagePath]}"`;
                        }
                        return match;
                    });
                    
                    // 2. Zamień ["src"] = "path"
                    content = content.replace(/\["src"\]\s*=\s*["']([^"']+)["']/gi, (match, imagePath) => {
                        if (imageMap[imagePath]) {
                            return `["src"] = "${imageMap[imagePath]}"`;
                        }
                        return match;
                    });
                    
                    // 3. Zamień url(...) w JavaScript (np. w tablicach colors)
                    content = content.replace(/url\(["']?([^"')]+)["']?\)/gi, (match, imagePath) => {
                        if (imageMap[imagePath]) {
                            return `url("${imageMap[imagePath]}")`;
                        }
                        return match;
                    });
                }
                
                return {
                    filename: file.filename,
                    content: content
                };
            })
        );
        
        // Renderuj preview z tablicami plików (każdy plik = osobny tag <style> lub <script>)
        renderPreview(htmlContent, cssFilesWithContent, jsFilesWithContent);
        previewContainer.classList.remove('hidden');
        
        // Jeśli flaga auto-fullscreen jest włączona, włącz tryb maximized
        if (shouldAutoFullscreen) {
            shouldAutoFullscreen = false; // Resetuj flagę
            setTimeout(() => {
                if (!isPreviewMaximized) {
                    toggleFullscreen();
                }
            }, 100); // Małe opóźnienie aby preview zdążył się załadować
        }
        
    } catch (error) {
        showError(`Error loading Gist: ${error.message}`);
        previewContainer.classList.add('hidden');
    } finally {
        setLoading(false, loadSingleGistBtn);
    }
}

// Stan trybu maximized (fake fullscreen)
let isPreviewMaximized = false;

// Flaga dla automatycznego fullscreen (z URL)
let shouldAutoFullscreen = false;

// Funkcja do przełączania trybu maximized (fake fullscreen bez browser fullscreen)
function toggleFullscreen() {
    isPreviewMaximized = !isPreviewMaximized;
    
    if (isPreviewMaximized) {
        // Enable maximized mode - hide everything except preview
        document.body.classList.add('preview-maximized');
        fullscreenPreviewBtn.textContent = '⮾';
        fullscreenPreviewBtn.title = 'Exit full view';
    } else {
        // Disable maximized mode - restore normal view
        document.body.classList.remove('preview-maximized');
        fullscreenPreviewBtn.textContent = '⛶';
        fullscreenPreviewBtn.title = 'Full view';
    }
}

// Zmodyfikowana funkcja setLoading aby obsługiwać różne przyciski
function setLoading(isLoading, button = loadBtn) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        if (button === loadBtn) {
            gistInput.disabled = true;
        }
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        if (button === loadBtn) {
            gistInput.disabled = false;
        }
    }
}
