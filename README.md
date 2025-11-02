# 📝 Gist Viewer

Prosta aplikacja webowa do wyświetlania zawartości GitHub Gistów. Idealne rozwiązanie do hostowania prywatnej treści na publicznej stronie!

## 🎯 Pomysł

Zamiast hostować prywatne repozytorium (co wymaga płatnego planu GitHub Pro dla GitHub Pages), możesz:
- Utworzyć **publiczne repozytorium** z tą stroną (GitHub Pages działa za darmo ✅)
- Przechowywać swoją **treść w Gistach** (mogą być publiczne lub secret)
- Udostępnić link do strony z parametrem `?gist=ID`

## ✨ Funkcjonalności

### 📄 Tryb Pojedynczego Gista
- 🔍 Pobieranie i wyświetlanie plików z GitHub Gist
- 📋 Kopiowanie zawartości plików jednym kliknięciem
- 👀 Podgląd wszystkich plików z Gista
- 🔗 Obsługa pełnych URLi lub samych ID Gistów

### 🚀 Tryb Live Preview
- 🌐 Połączenie HTML + CSS + JS z różnych Gistów w jedną działającą stronę
- ⚡ Live rendering w iframe
- 🎨 Oddzielne Gisty dla HTML, CSS i JS (CSS i JS opcjonalne)
- 🔄 Odświeżanie preview jednym kliknięciem
- 📱 Pełna responsywność strony

### Ogólne
- 🎨 Nowoczesny, responsywny design
- 🌙 Ciemny motyw
- ⚡ Szybkie ładowanie
- 📱 Mobile-friendly
- 🔄 Możliwość załadowania Gista z parametru URL

## 🚀 Jak używać

### 📄 Tryb: Pojedynczy Gist

**Metoda 1: Wpisywanie ręczne**

1. Otwórz stronę
2. Kliknij zakładkę "📄 Pojedynczy Gist"
3. Wklej ID Gista lub pełny URL w pole tekstowe
4. Kliknij "Załaduj Gist"

**Przykłady poprawnych formatów:**
```
abc123def456
https://gist.github.com/username/abc123def456
gist.github.com/username/abc123def456
```

**Metoda 2: Parametr URL**

Możesz bezpośrednio załadować Gista poprzez URL:
```
https://twoja-domena.github.io/gist-viewer/?gist=abc123def456
```

### 🚀 Tryb: Live Preview

**Rendering strony z oddzielnych Gistów**

1. Kliknij zakładkę "🚀 Live Preview"
2. Podaj ID Gista z kodem HTML (wymagane)
3. Opcjonalnie: Podaj ID Gista z CSS
4. Opcjonalnie: Podaj ID Gista z JavaScript
5. Kliknij "Załaduj Live Preview"
6. Strona automatycznie połączy wszystkie pliki i wyświetli działającą stronę!

**Przypadki użycia:**
- **Jeden Gist z 3 plikami**: Podaj to samo ID dla HTML, CSS i JS - aplikacja automatycznie wybierze odpowiednie pliki
- **Trzy oddzielne Gisty**: Każdy z HTML, CSS i JS w osobnym Giście
- **Tylko HTML**: Podaj tylko HTML Gist - CSS i JS pozostaw puste
- **HTML + CSS**: Stylizowana strona bez JavaScript

**Przykład:**
```
HTML Gist: abc123 (zawiera index.html)
CSS Gist: def456 (zawiera styles.css)  
JS Gist: ghi789 (zawiera script.js)
→ Wynik: Pełna działająca strona internetowa!
```

## 🔗 Bezpośrednie Linki do Live Preview

Możesz udostępnić bezpośredni link, który automatycznie załaduje Gist w trybie pełnoekranowym!

**Format URL:**
```
https://azornes.github.io/GistToPublicSite/#/LivePreview/{gist_id}
```

**Przykład:**
```
https://azornes.github.io/GistToPublicSite/#/LivePreview/abc123def456789
```

**Co się dzieje po kliknięciu takiego linku:**
1. ✅ Strona automatycznie przełącza się na zakładkę "🚀 Live Preview"
2. ✅ Ładuje podany Gist (HTML, CSS, JS)
3. ✅ Włącza tryb "fake fullscreen" - cała strona jako preview
4. ✅ Użytkownik od razu widzi tylko zawartość Gista (bez interfejsu)

**Aby wyjść z trybu fullscreen:**
- Kliknij ikonę **⮾** w prawym górnym rogu preview
- Lub odśwież stronę

**Przypadki użycia:**
- 🎮 Udostępnianie gier HTML5
- 📱 Demo aplikacji webowych
- 🎨 Portfolio interaktywnych projektów
- 📊 Prezentacje i infografiki
- 🎓 Interaktywne tutoriale

**Uwaga:** 
- Tryb fullscreen to "fake fullscreen" (CSS-based), więc pasek adresu przeglądarki pozostaje widoczny
- To zapewnia bezpieczeństwo - użytkownik zawsze wie na jakiej stronie jest
- Różni się od prawdziwego fullscreen (F11) który ukrywa cały interfejs przeglądarki

## 🔒 Prywatność

### Secret Gisty
- Utwórz "Secret" Gist na GitHub (nie "Public")
- Secret Gisty nie są indeksowane przez wyszukiwarki
- Dostępne tylko dla osób znających pełne ID
- Wystarczy udostępnić link z ID Gista

### Jak utworzyć Secret Gist:
1. Przejdź do https://gist.github.com/
2. Dodaj pliki
3. Kliknij **"Create secret gist"** (nie "Create public gist")
4. Skopiuj ID z URLa (długi losowy ciąg znaków)

## 💻 Technologie

- **HTML5** - struktura
- **CSS3** - stylizacja (gradient, animacje, responsywność)
- **Vanilla JavaScript** - logika (bez zewnętrznych zależności!)
- **GitHub Gist API** - pobieranie danych

## 📦 Deployment na GitHub Pages

1. **Fork lub sklonuj to repozytorium**
   ```bash
   git clone https://github.com/twoj-username/gist-viewer.git
   ```

2. **Push do GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Włącz GitHub Pages**
   - Przejdź do Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` / `(root)`
   - Zapisz

4. **Gotowe!** Strona będzie dostępna pod:
   ```
   https://twoj-username.github.io/nazwa-repo/
   ```

## 🎨 Customizacja

### Zmiana kolorów
Edytuj zmienne CSS w pliku `style.css`:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --background: #0f172a;
    /* ... */
}
```

### Zmiana języka
Aktualnie interfejs jest po polsku. Aby zmienić na inny język, edytuj teksty w plikach:
- `index.html` - etykiety i placeholdery
- `script.js` - komunikaty błędów

## 📝 Przykłady użycia

### Przypadek 1: Blog/Notatki
- **Tryb**: Pojedynczy Gist
- Każdy wpis = osobny Gist
- Link do strony: `yoursite.com/?gist=blog-post-1`
- Łatwa edycja w GitHub Gist

### Przypadek 2: Portfolio kodu
- **Tryb**: Pojedynczy Gist
- Różne projekty/snippety w Gistach
- Jedna strona do prezentacji wszystkich
- Profesjonalny wygląd

### Przypadek 3: Mini-aplikacje webowe
- **Tryb**: Live Preview
- HTML w jednym Giście, CSS w drugim, JS w trzecim
- Modularny kod - łatwa edycja każdego aspektu osobno
- Live demo bez potrzeby własnego hostingu
- Idealne dla prototypów i demo

### Przypadek 4: Interaktywne tutoriale
- **Tryb**: Live Preview
- Kod HTML w Giście (zawartość lekcji)
- CSS w Giście (stylizacja przykładów)
- JS w Giście (interaktywne przykłady)
- Łatwe aktualizacje bez zmiany głównej strony

### Przypadek 5: Landing pages
- **Tryb**: Live Preview
- Oddzielne Gisty dla struktury, stylu i funkcjonalności
- Szybkie A/B testing (zmiana Gista = nowa wersja)
- Współpraca zespołowa (każdy edytuje swój Gist)

### Przypadek 6: Dokumentacja
- **Tryb**: Pojedynczy Gist
- Dokumenty w Markdown
- Szybkie updates bez rebuildu strony
- Współdzielenie z zespołem

## 🔧 Struktura projektu

```
gist-viewer/
├── index.html      # Główna strona HTML
├── style.css       # Stylizacja
├── script.js       # Logika aplikacji
└── README.md       # Dokumentacja
```

## 🤝 Licencja

MIT License - możesz swobodnie używać i modyfikować!

## 💡 Tips & Tricks

1. **Limit API**: GitHub API ma limit 60 żądań/godzinę dla niezalogowanych użytkowników
2. **Secret Gisty**: Używaj długich, losowych ID dla lepszego bezpieczeństwa
3. **Szybkie udostępnianie**: Bookmark `yoursite.com/?gist=` i dodawaj ID na końcu
4. **Mobile**: Strona działa świetnie na telefonach!

## 🐛 Znane ograniczenia

- Brak syntax highlighting (można dodać bibliotekę jak Prism.js lub highlight.js)
- Limit 60 żądań/godzinę dla GitHub API (można zwiększyć używając Personal Access Token)
- Brak edycji plików (tylko odczyt)

## 🎯 Przyszłe ulepszenia

- [ ] Syntax highlighting dla kodu
- [ ] Ciemny/jasny motyw (przełącznik)
- [ ] Historia ostatnio oglądanych Gistów
- [x] Live preview dla HTML/CSS/JS ✅
- [ ] Pobieranie plików
- [ ] Edytor kodu inline
- [ ] Eksport połączonego HTML
- [ ] Wsparcie dla bibliotek CDN (automatyczne dodawanie)

---

**Stworzono z ❤️ dla społeczności GitHub**
