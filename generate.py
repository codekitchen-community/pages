#!/usr/bin/env python3
"""
HTML Generator for Community Pages

This script generates HTML pages from JSON data using Jinja2 templates.
It supports multiple pages, each with their own folder containing content.json,
style.css, script.js, and generates body.html with inline CSS/JS.
"""

import json
import os
import sys
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

def load_data(page_folder):
    """Load content data from JSON file in page folder."""
    content_file = Path(page_folder) / "content.json"
    if not content_file.exists():
        raise FileNotFoundError(f"content.json not found in {page_folder}")
    
    with open(content_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_css_content(page_folder):
    """Load CSS content from style.css in page folder."""
    css_file = Path(page_folder) / "style.css"
    if not css_file.exists():
        raise FileNotFoundError(f"style.css not found in {page_folder}")
    
    with open(css_file, 'r', encoding='utf-8') as f:
        return f.read()

def load_js_content(page_folder):
    """Load JavaScript content from script.js in page folder."""
    js_file = Path(page_folder) / "script.js"
    if not js_file.exists():
        raise FileNotFoundError(f"script.js not found in {page_folder}")
    
    with open(js_file, 'r', encoding='utf-8') as f:
        return f.read()

def setup_jinja_env(template_dir="templates"):
    """Setup Jinja2 environment with template directory."""
    return Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=True
    )

def generate_page_html(page_name, page_folder):
    """Generate HTML file for a specific page."""
    print(f"🔧 Generating {page_name} page...")
    
    # Load data and assets
    try:
        data = load_data(page_folder)
        css_content = load_css_content(page_folder)
        js_content = load_js_content(page_folder)
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        return False
    
    # Setup Jinja2 environment
    env = setup_jinja_env()
    
    # Load main template
    try:
        template = env.get_template('base.html')
    except Exception as e:
        print(f"❌ Error loading template: {e}")
        return False
    
    # Prepare template data
    template_data = {
        **data,
        'page_name': page_name,
        'css_content': css_content,
        'js_content': js_content
    }
    
    # Render template with data
    try:
        html_content = template.render(**template_data)
    except Exception as e:
        print(f"❌ Error rendering template: {e}")
        return False
    
    # Write HTML file
    output_file = Path(page_folder) / "body.html"
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"✅ Generated: {output_file}")
        return True
    except Exception as e:
        print(f"❌ Error writing HTML file: {e}")
        return False

def find_page_folders():
    """Find all page folders (directories containing content.json)."""
    page_folders = []
    current_dir = Path('.')
    
    for item in current_dir.iterdir():
        if item.is_dir() and (item / "content.json").exists():
            page_folders.append(item.name)
    
    return sorted(page_folders)

def generate_all_pages():
    """Generate HTML for all discovered page folders."""
    page_folders = find_page_folders()
    
    if not page_folders:
        print("❌ No page folders found. Each page should have a folder with content.json")
        return False
    
    print(f"📁 Found page folders: {', '.join(page_folders)}")
    
    success_count = 0
    for page_name in page_folders:
        if generate_page_html(page_name, page_name):
            success_count += 1
    
    print(f"✨ Generated {success_count}/{len(page_folders)} pages successfully!")
    return success_count == len(page_folders)

def generate_specific_page(page_name):
    """Generate HTML for a specific page."""
    page_folder = Path(page_name)
    
    if not page_folder.exists():
        print(f"❌ Page folder '{page_name}' not found")
        return False
    
    if not (page_folder / "content.json").exists():
        print(f"❌ content.json not found in '{page_name}' folder")
        return False
    
    return generate_page_html(page_name, page_folder)

def main():
    """Main function to generate HTML pages."""
    print("🚀 Community Page Generator")
    print("=" * 50)
    
    # Check command line arguments
    if len(sys.argv) > 1:
        page_name = sys.argv[1]
        print(f"Generating specific page: {page_name}")
        success = generate_specific_page(page_name)
    else:
        print("Generating all pages...")
        success = generate_all_pages()
    
    if success:
        print("\n🎉 Generation completed successfully!")
    else:
        print("\n💥 Generation failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()