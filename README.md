# 📝 Gist Viewer

A simple web application for displaying GitHub Gist content. Perfect solution for hosting private content on a public website!

## 🎯 The Idea

Instead of hosting a private repository (which requires a paid GitHub Pro plan for GitHub Pages), you can:
- Create a **public repository** with this page (GitHub Pages works for free ✅)
- Store your **content in Gists** (they can be public or secret)
- Share a link to the page with the `?gist=ID` parameter

## 🎮 Live Demo - Example Projects

Try these example projects to see the Live Preview in action:

- 🏠 **[Main Page](https://azornes.github.io/GistToPublicSite/)** - Home page with all features
- 🎮 **[Tetris Game](https://azornes.github.io/GistToPublicSite/#/LivePreview/b6c690256541efd8ea50b6bc2c322921)** - Classic Tetris with colorful blocks
- 🐍 **[Snake Game](https://azornes.github.io/GistToPublicSite/#/LivePreview/f8971bd3c3105bf1b90c5a955c6a0626)** - Retro Snake game

**Click any link above to see how HTML5 games can be hosted using Gists!**

## ✨ Features

### 📄 Single Gist Mode
- 🔍 Fetching and displaying files from GitHub Gist
- 📋 Copy file contents with one click
- 👀 Preview all files from the Gist
- 🔗 Support for full URLs or just Gist IDs

### 🚀 Live Preview Mode
- 🌐 Combine HTML + CSS + JS from different Gists into one working page
- ⚡ Live rendering in iframe
- 🎨 Separate Gists for HTML, CSS, and JS (CSS and JS optional)
- 🔄 Refresh preview with one click
- 📱 Full page responsiveness

### General
- 🎨 Modern, responsive design
- 🌙 Dark theme
- ⚡ Fast loading
- 📱 Mobile-friendly
- 🔄 Ability to load Gist from URL parameter

## 🚀 How to Use

### 📄 Mode: Single Gist

**Method 1: Manual Input**

1. Open the page
2. Click the "📄 Single Gist" tab
3. Paste Gist ID or full URL in the text field
4. Click "Load Gist"

**Examples of valid formats:**
```
abc123def456
https://gist.github.com/username/abc123def456
gist.github.com/username/abc123def456
```

**Method 2: URL Parameter**

You can directly load a Gist via URL:
```
https://your-domain.github.io/gist-viewer/?gist=abc123def456
```

### 🚀 Mode: Live Preview

**Rendering a page from separate Gists**

1. Click the "🚀 Live Preview" tab
2. Provide Gist ID with HTML code (required)
3. Optionally: Provide Gist ID with CSS
4. Optionally: Provide Gist ID with JavaScript
5. Click "Load Live Preview"
6. The page will automatically combine all files and display a working page!

**Use Cases:**
- **One Gist with 3 files**: Provide the same ID for HTML, CSS, and JS - the app will automatically select appropriate files
- **Three separate Gists**: Each with HTML, CSS, and JS in separate Gists
- **HTML only**: Provide only HTML Gist - leave CSS and JS empty
- **HTML + CSS**: Styled page without JavaScript

**Example:**
```
HTML Gist: abc123 (contains index.html)
CSS Gist: def456 (contains styles.css)  
JS Gist: ghi789 (contains script.js)
→ Result: Full working website!
```

## 🔗 Direct Links to Live Preview

You can share a direct link that automatically loads the Gist in fullscreen mode!

**URL Format:**
```
https://azornes.github.io/GistToPublicSite/#/LivePreview/{gist_id}
```

**Example:**
```
https://azornes.github.io/GistToPublicSite/#/LivePreview/f8971bd3c3105bf1b90c5a955c6a0626
```

**What happens after clicking such a link:**
1. ✅ Page automatically switches to "🚀 Live Preview" tab
2. ✅ Loads the specified Gist (HTML, CSS, JS)
3. ✅ Enables "fake fullscreen" mode - entire page as preview
4. ✅ User immediately sees only the Gist content (without interface)

**To exit fullscreen mode:**
- Click the **⮾** icon in the top right corner of preview
- Or refresh the page

**Use Cases:**
- 🎮 Sharing HTML5 games
- 📱 Web app demos
- 🎨 Portfolio of interactive projects
- 📊 Presentations and infographics
- 🎓 Interactive tutorials

**Note:** 
- Fullscreen mode is "fake fullscreen" (CSS-based), so the browser address bar remains visible
- This ensures security - user always knows which site they're on
- Different from true fullscreen (F11) which hides the entire browser interface

## 🔒 Privacy

### Secret Gists
- Create a "Secret" Gist on GitHub (not "Public")
- Secret Gists are not indexed by search engines
- Accessible only to people who know the full ID
- Just share the link with the Gist ID

### How to create a Secret Gist:
1. Go to https://gist.github.com/
2. Add files
3. Click **"Create secret gist"** (not "Create public gist")
4. Copy ID from URL (long random string)

## 💻 Technologies

- **HTML5** - structure
- **CSS3** - styling (gradient, animations, responsiveness)
- **Vanilla JavaScript** - logic (no external dependencies!)
- **GitHub Gist API** - data fetching

## 📦 Deployment on GitHub Pages

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/your-username/gist-viewer.git
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` / `(root)`
   - Save

4. **Done!** The page will be available at:
   ```
   https://your-username.github.io/repo-name/
   ```

## 🎨 Customization

### Changing Colors
Edit CSS variables in `style.css`:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --background: #0f172a;
    /* ... */
}
```

### Changing Language
Currently the interface is in Polish. To change to another language, edit texts in files:
- `index.html` - labels and placeholders
- `script.js` - error messages

## 📝 Usage Examples

### Case 1: Blog/Notes
- **Mode**: Single Gist
- Each post = separate Gist
- Link to page: `yoursite.com/?gist=blog-post-1`
- Easy editing in GitHub Gist

### Case 2: Code Portfolio
- **Mode**: Single Gist
- Different projects/snippets in Gists
- One page to present everything
- Professional look

### Case 3: Mini Web Applications
- **Mode**: Live Preview
- HTML in one Gist, CSS in another, JS in third
- Modular code - easy editing of each aspect separately
- Live demo without own hosting
- Ideal for prototypes and demos

### Case 4: Interactive Tutorials
- **Mode**: Live Preview
- HTML code in Gist (lesson content)
- CSS in Gist (example styling)
- JS in Gist (interactive examples)
- Easy updates without changing main page

### Case 5: Landing Pages
- **Mode**: Live Preview
- Separate Gists for structure, style, and functionality
- Quick A/B testing (change Gist = new version)
- Team collaboration (everyone edits their Gist)

### Case 6: Documentation
- **Mode**: Single Gist
- Documents in Markdown
- Quick updates without rebuilding page
- Sharing with team

## 🔧 Project Structure

```
gist-viewer/
├── index.html      # Main HTML page
├── style.css       # Styling
├── script.js       # Application logic
└── README.md       # Documentation
```

## 🤝 License

MIT License - you can freely use and modify!

## 💡 Tips & Tricks

1. **API Limit**: GitHub API has a limit of 60 requests/hour for unauthenticated users
2. **Secret Gists**: Use long, random IDs for better security
3. **Quick Sharing**: Bookmark `yoursite.com/?gist=` and add ID at the end
4. **Mobile**: The page works great on phones!

## 🐛 Known Limitations

- No syntax highlighting (can add library like Prism.js or highlight.js)
- 60 requests/hour limit for GitHub API (can increase using Personal Access Token)
- No file editing (read-only)

## 🎯 Future Improvements

- [ ] Syntax highlighting for code
- [ ] Dark/light theme (toggle)
- [ ] History of recently viewed Gists
- [x] Live preview for HTML/CSS/JS ✅
- [ ] File downloads
- [ ] Inline code editor
- [ ] Combined HTML export
- [ ] CDN library support (automatic adding)

---

**Created with ❤️ for the GitHub community**
