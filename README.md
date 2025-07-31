# Community Pages

A Python app that generates HTML pages using JSON data and Jinja2 templates. Features a Flask development server for live preview and GitHub Actions for automated static HTML generation. The deployed pages are will be available at `https://codekitchen.community/<page_name>`.

## Project Structure

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

## Usage

Clone the repository and install dependencies:
```bash
git clone https://github.com/codekitchen-community/pages.git
cd pages
pip install -r requirements.txt
```

### Development
```bash
python app.py
# or
FLASK_APP=app.py flask run
```

Access at:
- `http://localhost:8000/` - Redirect to first page
- `http://localhost:8000/pages` - List all pages
- `http://localhost:8000/readme` - View specific page

### Generate Static HTML

Static HTML generation is handled automatically by GitHub Actions when you push to the main branch.

For manual generation:

```bash
# Generate all pages (standalone script)
python generate.py

# Generate specific page
python generate.py readme
```

### Page Management

```bash
# Create new page
FLASK_APP=app.py flask new-page blog
```

Each page needs:
- `content.json` - Page content and configuration
- `style.css` - Page-specific styles 
- `script.js` - Page-specific JavaScript
- Templates in `templates/{page_name}/` folder
