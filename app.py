#!/usr/bin/env python3
"""
Flask App for Community Pages

This Flask app serves HTML pages dynamically from JSON data and templates,
allowing preview without generating static files. Also includes CLI commands
for HTML generation.
"""

import json
import os
import sys
import click
from pathlib import Path
from flask import Flask, render_template, abort, redirect, url_for
from jinja2 import TemplateNotFound

# Import generator functions
from generate import (
    load_data, load_css_content, load_js_content, 
    find_page_folders, generate_page_html, generate_all_pages
)

app = Flask(__name__)

@app.route('/')
def index():
    """Redirect to first available page."""
    page_folders = find_page_folders()
    if page_folders:
        return redirect(url_for('serve_page', page_name=page_folders[0]))
    return "No pages found. Please create a page folder with content.json", 404

@app.route('/<page_name>')
def serve_page(page_name):
    """Serve a page dynamically from its folder contents."""
    page_folder = Path(page_name)
    
    # Check if page folder exists
    if not page_folder.exists():
        abort(404)
    
    # Check if content.json exists
    if not (page_folder / "content.json").exists():
        abort(404)
    
    try:
        # Load page data and assets
        data = load_data(page_folder)
        css_content = load_css_content(page_folder)
        js_content = load_js_content(page_folder)
        
        # Prepare template data
        template_data = {
            **data,
            'page_name': page_name,
            'css_content': css_content,
            'js_content': js_content
        }
        
        # Render template
        return render_template('base.html', **template_data)
        
    except FileNotFoundError as e:
        return f"Missing file: {e}", 404
    except TemplateNotFound as e:
        return f"Missing template: {e}", 404
    except json.JSONDecodeError as e:
        return f"Invalid JSON in content.json: {e}", 400
    except Exception as e:
        return f"Error loading page: {e}", 500

@app.route('/pages')
def list_pages():
    """List all available pages."""
    page_folders = find_page_folders()
    
    if not page_folders:
        return "No pages found", 404
    
    page_links = []
    for page_name in page_folders:
        page_folder = Path(page_name)
        try:
            data = load_data(page_folder)
            title = data.get('site', {}).get('title', page_name)
            page_links.append({
                'name': page_name,
                'title': title,
                'url': url_for('serve_page', page_name=page_name)
            })
        except:
            page_links.append({
                'name': page_name,
                'title': page_name,
                'url': url_for('serve_page', page_name=page_name)
            })
    
    # Simple HTML page listing
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Available Pages</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            h1 { color: #333; }
            .page-list { list-style: none; padding: 0; }
            .page-item { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 6px; }
            .page-item a { text-decoration: none; color: #0969da; font-weight: 600; }
            .page-item a:hover { text-decoration: underline; }
            .page-name { font-size: 12px; color: #666; margin-top: 5px; }
        </style>
    </head>
    <body>
        <h1>📄 Available Pages</h1>
        <ul class="page-list">
    '''
    
    for page in page_links:
        html += f'''
            <li class="page-item">
                <a href="{page['url']}">{page['title']}</a>
                <div class="page-name">/{page['name']}</div>
            </li>
        '''
    
    html += '''
        </ul>
        <p><small>💡 Add new pages by creating folders with content.json, style.css, and script.js files.</small></p>
    </body>
    </html>
    '''
    
    return html

# CLI Commands
@app.cli.command()
@click.argument('page_name', required=False)
def generate(page_name):
    """Generate static HTML files.
    
    Usage:
        flask generate          # Generate all pages
        flask generate readme   # Generate specific page
    """
    if page_name:
        click.echo(f"🔧 Generating {page_name} page...")
        success = generate_page_html(page_name, page_name)
        if success:
            click.echo(f"✅ Generated {page_name}/body.html")
        else:
            click.echo("❌ Generation failed")
            sys.exit(1)
    else:
        click.echo("🚀 Generating all pages...")
        success = generate_all_pages()
        if success:
            click.echo("✨ All pages generated successfully!")
        else:
            click.echo("💥 Generation failed!")
            sys.exit(1)

@app.cli.command()
def list_pages_cli():
    """List all available page folders."""
    page_folders = find_page_folders()
    
    if not page_folders:
        click.echo("❌ No page folders found.")
        click.echo("💡 Create a folder with content.json to add a page.")
        return
    
    click.echo("📁 Available pages:")
    for page_name in page_folders:
        page_folder = Path(page_name)
        try:
            data = load_data(page_folder)
            title = data.get('site', {}).get('title', page_name)
            click.echo(f"  • {page_name} - {title}")
        except:
            click.echo(f"  • {page_name} - (error loading)")

@app.cli.command()
@click.argument('page_name')
def new_page(page_name):
    """Create a new page folder with template files.
    
    Usage:
        flask new-page blog
    """
    page_folder = Path(page_name)
    
    if page_folder.exists():
        click.echo(f"❌ Page folder '{page_name}' already exists")
        return
    
    # Create page folder
    page_folder.mkdir()
    
    # Create basic content.json
    content = {
        "site": {
            "title": page_name.title(),
            "logo_url": "https://example.com/logo.png",
            "home_url": "https://example.com",
            "contact_email": "contact@example.com"
        },
        "readme": {
            "en": {
                "title": page_name.title(),
                "sections": [
                    {
                        "type": "highlight_box",
                        "content": f"Welcome to <strong>{page_name.title()}</strong> page."
                    }
                ]
            }
        },
        "ui_text": {
            "en": {
                "theme_toggle": "🌙",
                "language_switch": "中文",
                "readme_tab": "README",
                "conduct_tab": "Code of Conduct"
            }
        }
    }
    
    with open(page_folder / "content.json", 'w', encoding='utf-8') as f:
        json.dump(content, f, indent=2, ensure_ascii=False)
    
    # Create basic CSS
    css_content = """/* Page-specific styles */
body {
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    margin: 0;
    padding: 20px;
}

.container {
    max-width: 800px;
    margin: 0 auto;
}
"""
    
    with open(page_folder / "style.css", 'w', encoding='utf-8') as f:
        f.write(css_content)
    
    # Create basic JavaScript
    js_content = """// Page-specific JavaScript
console.log('Page loaded successfully');
"""
    
    with open(page_folder / "script.js", 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    # Create templates folder if it doesn't exist
    templates_folder = Path("templates") / page_name
    templates_folder.mkdir(parents=True, exist_ok=True)
    
    # Create basic template
    template_content = """<h1>{{ page_name.title() }}</h1>
<p>This is a basic template for the {{ page_name }} page.</p>
<p>Edit this template in templates/{{ page_name }}/content.html</p>
"""
    
    with open(templates_folder / "content.html", 'w', encoding='utf-8') as f:
        f.write(template_content)
    
    click.echo(f"✅ Created new page: {page_name}")
    click.echo(f"📁 Files created:")
    click.echo(f"  • {page_name}/content.json")
    click.echo(f"  • {page_name}/style.css")
    click.echo(f"  • {page_name}/script.js")
    click.echo(f"  • templates/{page_name}/content.html")
    click.echo(f"🌐 Preview at: http://localhost:8000/{page_name}")

if __name__ == '__main__':
    # Check if running with Flask CLI commands
    if len(sys.argv) > 1 and sys.argv[1] in ['generate', 'list-pages', 'new-page']:
        # This is handled by Flask CLI
        pass
    else:
        # Run the Flask dev server
        click.echo("🚀 Starting Flask development server...")
        click.echo("📄 Available endpoints:")
        click.echo("  • http://localhost:8000/ - Redirect to first page")
        click.echo("  • http://localhost:8000/pages - List all pages")
        click.echo("  • http://localhost:8000/<page_name> - View specific page")
        click.echo("")
        click.echo("🔧 Available commands:")
        click.echo("  • flask generate [page] - Generate static HTML")
        click.echo("  • flask list-pages - List available pages") 
        click.echo("  • flask new-page <name> - Create new page")
        click.echo("")
        app.run(debug=True, host='127.0.0.1', port=8000)