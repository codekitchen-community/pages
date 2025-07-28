// Preferences management
const STORAGE_KEYS = {
    LANGUAGE: 'codekitchen_language',
    THEME: 'codekitchen_theme'
};

function savePreference(key, value) {
    try {
        localStorage.setItem(key, value);
        console.log(`Saved preference: ${key} = ${value}`);
    } catch (e) {
        console.warn('Failed to save preference to localStorage:', e);
    }
}

function loadPreference(key, defaultValue) {
    try {
        const saved = localStorage.getItem(key);
        if (saved !== null) {
            console.log(`Loaded preference: ${key} = ${saved}`);
            return saved;
        }
    } catch (e) {
        console.warn('Failed to load preference from localStorage:', e);
    }
    return defaultValue;
}

// Detect browser locale and set default language
function detectBrowserLocale() {
    const browserLang = navigator.language || navigator.userLanguage;
    console.log('Browser language detected:', browserLang);
    
    // Check for English variants
    if (browserLang.toLowerCase().startsWith('en')) {
        return 'en';
    }
    
    // Check for Chinese variants (zh, zh-CN, zh-TW, zh-HK, etc.)
    if (browserLang.toLowerCase().startsWith('zh')) {
        return 'zh';
    }
    
    // Default to Chinese for all other languages
    return 'zh';
}

// Initialize preferences: saved preference > browser locale > default
function initializePreferences() {
    const savedLanguage = loadPreference(STORAGE_KEYS.LANGUAGE, null);
    const savedTheme = loadPreference(STORAGE_KEYS.THEME, 'light');
    
    const language = savedLanguage || detectBrowserLocale();
    const theme = savedTheme;
    
    console.log('Initializing with preferences:', { language, theme });
    return { language, theme };
}

const preferences = initializePreferences();
let currentLanguage = preferences.language;
let currentTheme = preferences.theme;
let outlineOpen = false;
let currentTab = 'readme';

function showContent(tabName) {
    console.log('showContent called with:', tabName); // Debug log
    
    // Remove active state from all tabs
    document.querySelectorAll('.readme-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Hide all main content sections
    const readmeContent = document.getElementById('readme-content');
    const conductContent = document.getElementById('conduct-content');
    
    if (readmeContent) readmeContent.style.display = 'none';
    if (conductContent) conductContent.style.display = 'none';
    
    // Show selected content
    if (tabName === 'readme') {
        if (readmeContent) {
            readmeContent.style.display = 'block';
            currentTab = 'readme';
            if (currentLanguage === 'en') {
                document.getElementById('readme-chinese').classList.remove('active');
                document.getElementById('readme-english').classList.add('active');
            } else {
                document.getElementById('readme-english').classList.remove('active');
                document.getElementById('readme-chinese').classList.add('active');
            }
        }
    } else if (tabName === 'conduct') {
        if (conductContent) {
            conductContent.style.display = 'block';
            currentTab = 'conduct';
            if (currentLanguage === 'en') {
                // Switch to Chinese
                document.getElementById('conduct-chinese').classList.remove('active');
                document.getElementById('conduct-english').classList.add('active');
            } else {
                // Switch to English
                document.getElementById('conduct-english').classList.remove('active');
                document.getElementById('conduct-chinese').classList.add('active');
            }
        }
    }
    
    // Set active tab for the clicked button
    if (event && event.target) {
        const clickedButton = event.target.closest('.readme-tab');
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
    } else {
        // Fallback: find the button by onclick attribute
        const targetButton = document.querySelector(`[onclick*="showContent('${tabName}')"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }
    
    // Close outline if open
    if (outlineOpen) {
        closeOutline();
    }
}

function toggleOutline() {
    const menu = document.getElementById('outline-menu');
    
    if (outlineOpen) {
        closeOutline();
    } else {
        openOutline();
    }
}

function openOutline() {
    const menu = document.getElementById('outline-menu');
    
    generateOutline();
    menu.classList.add('open');
    outlineOpen = true;
    
    // Close when clicking outside
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
    }, 10);
}

function closeOutline() {
    const menu = document.getElementById('outline-menu');
    
    menu.classList.remove('open');
    outlineOpen = false;
    
    // Remove outside click listener
    document.removeEventListener('click', handleOutsideClick);
}

function handleOutsideClick(event) {
    const dropdown = document.querySelector('.outline-dropdown');
    if (!dropdown || !dropdown.contains(event.target)) {
        closeOutline();
    }
}

function generateOutline() {
    const outlineContent = document.getElementById('outline-content');
    
    // Determine which content is currently active
    let activeContent;
    if (currentTab === 'conduct') {
        if (currentLanguage === 'en') {
            activeContent = document.getElementById('conduct-english');
        } else {
            activeContent = document.getElementById('conduct-chinese');
        }
    } else {
        // For README tab, use the appropriate language content
        if (currentLanguage === 'en') {
            activeContent = document.getElementById('readme-english');
        } else {
            activeContent = document.getElementById('readme-chinese');
        }
    }
    
    if (!activeContent) return;
    
    const headings = activeContent.querySelectorAll('h1, h2, h3');
    
    outlineContent.innerHTML = '';
    
    headings.forEach(heading => {
        const item = document.createElement('div');
        item.className = `outline-menu-item ${heading.tagName.toLowerCase()}`;
        item.textContent = heading.textContent.replace('#', '').trim();
        
        // Create anchor ID if it doesn't exist
        if (!heading.id) {
            const anchorLink = heading.querySelector('.anchor');
            if (anchorLink) {
                const href = anchorLink.getAttribute('href');
                if (href) {
                    heading.id = href.substring(1);
                }
            }
        }
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            heading.scrollIntoView({ behavior: 'smooth' });
            closeOutline();
        });
        
        outlineContent.appendChild(item);
    });
}

function updateOutlineLanguage() {
    const outlineTitle = document.getElementById('outline-title');
    if (currentLanguage === 'zh') {
        outlineTitle.textContent = '大纲';
    } else {
        outlineTitle.textContent = 'Outline';
    }
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        currentTheme = 'dark';
    } else {
        body.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
        currentTheme = 'light';
    }
    
    // Save theme preference
    savePreference(STORAGE_KEYS.THEME, currentTheme);
}

function toggleLanguage() {
    const langText = document.getElementById('lang-text');
    
    if (currentLanguage === 'en') {
        // Switch to Chinese
        document.getElementById('readme-english').classList.remove('active');
        document.getElementById('readme-chinese').classList.add('active');
        document.getElementById('conduct-english').classList.remove('active');
        document.getElementById('conduct-chinese').classList.add('active');
        langText.textContent = 'English';
        currentLanguage = 'zh';
        
        // Update tab text
        document.getElementById('readme-tab').textContent = '说明文档';
        document.getElementById('conduct-tab').textContent = '行为准则';
        document.getElementById('blog-tab').textContent = '博客';
        document.getElementById('home-tab').textContent = '返回社区';
    } else {
        // Switch to English
        document.getElementById('readme-chinese').classList.remove('active');
        document.getElementById('readme-english').classList.add('active');
        document.getElementById('conduct-chinese').classList.remove('active');
        document.getElementById('conduct-english').classList.add('active');
        langText.textContent = '中文';
        currentLanguage = 'en';
        
        // Update tab text
        document.getElementById('readme-tab').textContent = 'README';
        document.getElementById('conduct-tab').textContent = 'Code of Conduct';
        document.getElementById('blog-tab').textContent = 'Blog';
        document.getElementById('home-tab').textContent = 'Back to Community';
    }
    
    // Save language preference
    savePreference(STORAGE_KEYS.LANGUAGE, currentLanguage);
    
    // Restore the correct content based on current tab
    setTimeout(() => {
        if (currentTab === 'readme') {
            showContent('readme');
        } else if (currentTab === 'conduct') {
            showContent('conduct');
        }
    }, 0);
    
    // Update outline language
    updateOutlineLanguage();
    
    // Regenerate outline if it's open
    if (outlineOpen) {
        generateOutline();
    }
}

// Initialize page based on saved preferences and detected language/theme
function initializePage() {
    console.log('Initializing page with preferences:', { language: currentLanguage, theme: currentTheme });
    
    // Apply saved theme
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (currentTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.textContent = '☀️';
    } else {
        body.removeAttribute('data-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
    }
    
    // Set initial UI text and language button
    const langText = document.getElementById('lang-text');
    
    if (currentLanguage === 'zh') {
        // Show Chinese content by default
        document.getElementById('readme-english')?.classList.remove('active');
        document.getElementById('readme-chinese')?.classList.add('active');
        document.getElementById('conduct-english')?.classList.remove('active');
        document.getElementById('conduct-chinese')?.classList.add('active');
        
        // Set UI text to Chinese
        if (langText) langText.textContent = 'English';
        document.getElementById('readme-tab').textContent = '说明文档';
        document.getElementById('conduct-tab').textContent = '行为准则';
        document.getElementById('blog-tab').textContent = '博客';
        document.getElementById('home-tab').textContent = '返回社区';
    } else {
        // Show English content by default
        document.getElementById('readme-chinese')?.classList.remove('active');
        document.getElementById('readme-english')?.classList.add('active');
        document.getElementById('conduct-chinese')?.classList.remove('active');
        document.getElementById('conduct-english')?.classList.add('active');
        
        // Set UI text to English
        if (langText) langText.textContent = '中文';
        document.getElementById('readme-tab').textContent = 'README';
        document.getElementById('conduct-tab').textContent = 'Code of Conduct';
        document.getElementById('blog-tab').textContent = 'Blog';
        document.getElementById('home-tab').textContent = 'Back to Community';
    }
    
    // Update outline language
    updateOutlineLanguage();
}

// Star Tornado Animation
function createStarTornado() {
    // Create container for stars
    const container = document.createElement('div');
    container.className = 'star-tornado-container';
    document.body.appendChild(container);
    
    // Star symbols array for variety
    const starSymbols = ['⭐', '✨', '🌟', '💫', '⭐', '✨'];
    
    // Create multiple star particles
    const numStars = 80;
    
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star-particle';
        star.textContent = starSymbols[Math.floor(Math.random() * starSymbols.length)];
        
        // Random starting position across the screen bottom
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 50; // Start below the screen
        
        star.style.left = startX + 'px';
        star.style.top = startY + 'px';
        
        // Random size variation - much bigger
        const size = 40 + Math.random() * 60;
        star.style.fontSize = size + 'px';
        
        // Choose random animation from 5 different float patterns
        const animations = ['starFloat1', 'starFloat2', 'starFloat3', 'starFloat4', 'starFloat5'];
        const animation = animations[Math.floor(Math.random() * animations.length)];
        
        // Random duration between 2.5s and 5s - faster
        const duration = 2.5 + Math.random() * 2.5;
        
        // Random delay up to 2s - quicker spread
        const delay = Math.random() * 2;
        
        star.style.animation = `${animation} ${duration}s ease-out ${delay}s forwards`;
        
        // Random rotation for variety
        const rotation = Math.random() * 360;
        star.style.transform = `rotate(${rotation}deg)`;
        
        container.appendChild(star);
    }
    
    // Add some extra sparkles that appear later
    setTimeout(() => {
        for (let i = 0; i < 50; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'star-particle';
            sparkle.textContent = '✨';
            
            const x = Math.random() * window.innerWidth;
            const y = window.innerHeight + 50; // Start below screen like main stars
            
            sparkle.style.left = x + 'px';
            sparkle.style.top = y + 'px';
            sparkle.style.fontSize = (35 + Math.random() * 45) + 'px';
            
            // Use random animation for sparkles too
            const sparkleAnimations = ['starFloat1', 'starFloat2', 'starFloat3', 'starFloat4', 'starFloat5'];
            const sparkleAnimation = sparkleAnimations[Math.floor(Math.random() * sparkleAnimations.length)];
            const sparkleDuration = 2 + Math.random() * 2.5;
            
            sparkle.style.animation = `${sparkleAnimation} ${sparkleDuration}s ease-out forwards`;
            
            container.appendChild(sparkle);
        }
    }, 500);
    
    // Clean up after animation completes
    setTimeout(() => {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }, 8000);
    
    // Add button press effect
    const starButton = document.querySelector('.star-button');
    if (starButton) {
        starButton.style.transform = 'scale(0.9)';
        setTimeout(() => {
            starButton.style.transform = '';
        }, 150);
    }
}

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page with detected language
    initializePage();
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            if (target) {
                // Update URL hash
                history.pushState(null, null, href);
                
                // Smooth scroll to target
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add hover effects to headings
    document.querySelectorAll('h1, h2, h3').forEach(heading => {
        heading.addEventListener('mouseenter', function() {
            const anchor = this.querySelector('.anchor');
            if (anchor) {
                anchor.style.opacity = '1';
            }
        });
        
        heading.addEventListener('mouseleave', function() {
            const anchor = this.querySelector('.anchor');
            if (anchor) {
                anchor.style.opacity = '0';
            }
        });
    });
});