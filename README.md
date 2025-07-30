# Community Page Generator

A Python app that generates HTML pages using JSON data and Jinja2 templates, with Flask development server for live preview.

## 📁 Project Structure

```
/
├── templates/
│   ├── base.html              # Main template structure
│   └── readme/                # Page-specific templates
│       ├── index.html
│       ├── readme_section.html
│       ├── readme_section_zh.html
│       ├── conduct_section.html
│       └── conduct_section_zh.html
├── readme/                    # Example page folder
│   ├── content.json          # Page content data
│   ├── style.css            # Page-specific CSS
│   ├── script.js            # Page-specific JavaScript
│   └── body.html            # Generated output (with inline CSS/JS)
├── app.py                   # Flask development server
├── generate.py              # Standalone generator script
└── requirements.txt         # Dependencies
```

## 🚀 Features

- **Flask Development Server**: Live preview without generating files
- **Multi-page Support**: Each page has its own folder with content, styles, and scripts
- **Inline Assets**: CSS and JS are embedded directly in generated HTML
- **Bilingual Support**: English and Chinese content with language switching
- **CLI Commands**: Flask commands for generation and page management

## 📋 Usage

### Development Server (Live Preview)
```bash
python app.py
# or
FLASK_APP=app.py flask run
```

Access at:
- `http://localhost:5000/` - Redirect to first page
- `http://localhost:5000/pages` - List all pages
- `http://localhost:5000/readme` - View specific page

### Generate Static HTML
```bash
# Generate all pages
FLASK_APP=app.py flask generate

# Generate specific page
FLASK_APP=app.py flask generate readme

# Alternative: standalone script
python generate.py [page_name]
```

### Page Management
```bash
# List available pages
FLASK_APP=app.py flask list-pages-cli

# Create new page
FLASK_APP=app.py flask new-page blog
```

### Installation
```bash
pip install -r requirements.txt
```

## 📄 Page Structure

Each page needs:
- `content.json` - Page content and configuration
- `style.css` - Page-specific styles 
- `script.js` - Page-specific JavaScript
- Templates in `templates/{page_name}/` folder

## 🔧 Development Workflow

### Live Development
1. Start Flask server: `python app.py`
2. Edit `content.json`, `style.css`, or `script.js`
3. Refresh browser to see changes instantly
4. No generation step needed for preview

### Production Build
1. Generate static files: `flask generate`
2. Use generated `body.html.erb` files for deployment
3. Files are self-contained with inline CSS/JS

### Adding New Pages
```bash
# Option 1: Use Flask command (creates template files)
flask new-page blog

# Option 2: Manual creation
mkdir blog
# Add content.json, style.css, script.js
# Create templates/blog/ folder with templates
```

## 🎨 Flask Routes

- `GET /` - Redirect to first available page
- `GET /pages` - List all available pages with links
- `GET/<page_name>` - Serve specific page dynamically

## 🔧 Flask Commands

- `flask generate [page]` - Generate static HTML files
- `flask list-pages-cli` - List available page folders
- `flask new-page <name>` - Create new page with template files
