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

// Event listeners
loadBtn.addEventListener('click', loadGist);
gistInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loadGist();
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

// Funkcja do formatowania daty
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
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
        showError('Proszę wpisać ID lub URL Gista');
        return;
    }
    
    const gistId = extractGistId(input);
    
    if (!gistId) {
        showError('Nieprawidłowy format ID lub URL Gista');
        return;
    }
    
    setLoading(true);
    hideAllSections();
    
    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Gist nie został znaleziony. Sprawdź czy ID jest poprawne.');
            } else if (response.status === 403) {
                throw new Error('Przekroczono limit żądań API. Spróbuj ponownie za chwilę.');
            } else {
                throw new Error(`Błąd HTTP: ${response.status}`);
            }
        }
        
        const gistData = await response.json();
        displayGist(gistData);
        
    } catch (error) {
        showError(`Błąd podczas ładowania Gista: ${error.message}`);
    } finally {
        setLoading(false);
    }
}

// Funkcja do wyświetlania informacji o Giście
function displayGist(gistData) {
    hideAllSections();
    
    // Wypełnianie informacji
    const title = gistData.description || 'Bez tytułu';
    gistTitle.textContent = title;
    
    gistAuthor.textContent = gistData.owner ? gistData.owner.login : 'Anonimowy';
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
    copyBtn.textContent = '📋 Kopiuj';
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
        button.textContent = '✓ Skopiowano';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    } catch (err) {
        showError('Nie udało się skopiować do schowka');
    }
}

// Obsługa parametrów URL (opcjonalne - załadowanie Gista z URL)
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gistParam = urlParams.get('gist');
    
    if (gistParam) {
        gistInput.value = gistParam;
        loadGist();
    }
    
    // Inicjalizacja zakładek
    initTabs();
    initSubTabs();
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

// Funkcja do pobierania pliku z Gista
async function fetchGistFile(gistId, fileType) {
    if (!gistId || gistId.trim() === '') {
        return null;
    }
    
    const id = extractGistId(gistId);
    if (!id) {
        throw new Error(`Nieprawidłowy format ID Gista dla ${fileType}`);
    }
    
    const response = await fetch(`https://api.github.com/gists/${id}`);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Gist ${fileType} nie został znaleziony`);
        } else if (response.status === 403) {
            throw new Error('Przekroczono limit żądań API');
        } else {
            throw new Error(`Błąd HTTP ${response.status} dla ${fileType}`);
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
    
    return targetFile ? targetFile.content : null;
}

// Główna funkcja ładowania Live Preview
async function loadPreview() {
    const htmlGistId = htmlGistInput.value.trim();
    const cssGistId = cssGistInput.value.trim();
    const jsGistId = jsGistInput.value.trim();
    
    if (!htmlGistId) {
        showError('Proszę podać przynajmniej HTML Gist ID');
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
            throw new Error('Nie znaleziono pliku HTML w podanym Giście');
        }
        
        // Utwórz tablice plików dla renderPreview
        const cssFiles = cssContent ? [{filename: 'styles.css', content: cssContent}] : [];
        const jsFiles = jsContent ? [{filename: 'script.js', content: jsContent}] : [];
        
        // Renderuj z oddzielnymi tagami dla każdego pliku
        renderPreview(htmlContent, cssFiles, jsFiles);
        
        // Pokaż kontener preview
        previewContainer.classList.remove('hidden');
        
    } catch (error) {
        showError(`Błąd podczas ładowania preview: ${error.message}`);
        previewContainer.classList.add('hidden');
    } finally {
        setLoading(false, loadPreviewBtn);
    }
}

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
<html lang="pl">
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
    
    // Renderuj w iframe
    previewFrame.srcdoc = fullHTML;
}

// Funkcja do ładowania Single Gist (automatycznie znajdzie HTML, CSS, JS)
async function loadSingleGist() {
    const gistId = singleGistInput.value.trim();
    
    if (!gistId) {
        showError('Proszę podać ID Gista');
        return;
    }
    
    const id = extractGistId(gistId);
    if (!id) {
        showError('Nieprawidłowy format ID Gista');
        return;
    }
    
    setLoading(true, loadSingleGistBtn);
    hideAllSections();
    
    try {
        const response = await fetch(`https://api.github.com/gists/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Gist nie został znaleziony');
            } else if (response.status === 403) {
                throw new Error('Przekroczono limit żądań API');
            } else {
                throw new Error(`Błąd HTTP ${response.status}`);
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
        
        // HTML: Użyj index.html jeśli istnieje, w przeciwnym razie pierwszy plik HTML
        if (htmlFiles.length > 0) {
            const indexFile = htmlFiles.find(f => f.filename.toLowerCase() === 'index.html');
            htmlContent = indexFile ? indexFile.content : htmlFiles[0].content;
        }
        
        if (!htmlContent) {
            throw new Error('Nie znaleziono pliku HTML w Giście. Upewnij się, że Gist zawiera plik .html lub .htm');
        }
        
        // Renderuj preview z tablicami plików (każdy plik = osobny tag <style> lub <script>)
        renderPreview(htmlContent, cssFiles, jsFiles);
        previewContainer.classList.remove('hidden');
        
    } catch (error) {
        showError(`Błąd podczas ładowania Gista: ${error.message}`);
        previewContainer.classList.add('hidden');
    } finally {
        setLoading(false, loadSingleGistBtn);
    }
}

// Funkcja do przełączania trybu pełnoekranowego
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Wejdź w tryb pełnoekranowy
        previewContainer.requestFullscreen().catch(err => {
            showError(`Nie udało się przejść w tryb pełnoekranowy: ${err.message}`);
        });
    } else {
        // Wyjdź z trybu pełnoekranowego
        document.exitFullscreen();
    }
}

// Zmiana ikony przycisku fullscreen w zależności od stanu
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fullscreenPreviewBtn.textContent = '⮾'; // Ikona "compress" w trybie fullscreen
        fullscreenPreviewBtn.title = 'Wyjdź z pełnego ekranu';
    } else {
        fullscreenPreviewBtn.textContent = '⛶'; // Ikona "expand" normalnie
        fullscreenPreviewBtn.title = 'Pełny ekran';
    }
});

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
