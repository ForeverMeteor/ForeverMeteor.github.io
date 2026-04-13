

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'awards']
let currentLanguage = 'en'
let configData = null

// Default language names
const langNames = {
    'en': 'English',
    'zh': '中文',
    'jp': '日本語'
};

function loadLanguage(lang) {
    currentLanguage = lang
    localStorage.setItem('language', lang)
    
    // Update language dropdown immediately to show current language
    document.getElementById('languageDropdown').innerHTML = langNames[lang] || 'Language';
    
    // Update UI elements with language-specific content
    if (configData && configData.languages && configData.languages[lang]) {
        const langConfig = configData.languages[lang];
        try {
            // Update page title
            if (document.getElementById('title')) {
                document.getElementById('title').innerHTML = langConfig.title || '';
            }
            // Update page-top-title (name at top left) - always show Chentao Zhang
            if (document.getElementById('page-top-title')) {
                document.getElementById('page-top-title').innerHTML = 'Chentao Zhang';
            }
            // Update top-section-bg-text
            if (document.getElementById('top-section-bg-text')) {
                document.getElementById('top-section-bg-text').innerHTML = langConfig['top-section-bg-text'] || '';
            }
            // Update home-subtitle
            if (document.getElementById('home-subtitle')) {
                document.getElementById('home-subtitle').innerHTML = langConfig['home-subtitle'] || '';
            }
            // Update copyright-text
            if (document.getElementById('copyright-text')) {
                document.getElementById('copyright-text').innerHTML = langConfig['copyright-text'] || '';
            }
            // Update template-text
            if (document.getElementById('template-text')) {
                document.getElementById('template-text').innerHTML = langConfig['template-text'] || '';
            }
            // Update license-link text
            if (document.getElementById('license-link')) {
                document.getElementById('license-link').innerHTML = langConfig['license-text'] || 'License';
            }
            // Navigation links remain in English always
            const homeLink = document.querySelector('#navbarResponsive a[href="#page-top"]');
            if (homeLink) {
                homeLink.innerHTML = 'HOME';
            }
            const publicationsLink = document.querySelector('#navbarResponsive a[href="#publications"]');
            if (publicationsLink) {
                publicationsLink.innerHTML = 'PUBLICATIONS';
            }
            const awardsLink = document.querySelector('#navbarResponsive a[href="#awards"]');
            if (awardsLink) {
                awardsLink.innerHTML = 'AWARDS';
            }
        } catch (error) {
            console.error('Error updating UI elements:', error);
        }
    }
    
    // Load language-specific markdown files
    loadMarkdownFiles(lang)
}

function loadMarkdownFiles(lang) {
    marked.use({ mangle: false, headerIds: false });
    section_names.forEach((name, idx) => {
        let mdFile = `${lang}/${name}.md`;
        // Add timestamp to avoid browser cache
        const timestamp = new Date().getTime();
        fetch(`${content_dir}${mdFile}?t=${timestamp}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${mdFile}: ${response.status}`);
                }
                return response.text();
            })
            .then(markdown => {
                const html = marked.parse(markdown);
                const element = document.getElementById(name + '-md');
                if (element) {
                    element.innerHTML = html;
                }
            })
            .then(() => {
                // MathJax
                try {
                    MathJax.typeset();
                } catch (error) {
                    console.error('Error typesetting MathJax:', error);
                }
            })
            .catch(error => {
                console.error(`Error loading ${mdFile}:`, error);
                // Fallback to English if current language fails
                if (lang !== 'en') {
                    console.log(`Falling back to English for ${name}`);
                    const enFile = `en/${name}.md`;
                    // Add timestamp to avoid browser cache
                    const timestamp = new Date().getTime();
                    fetch(`${content_dir}${enFile}?t=${timestamp}`)
                        .then(response => response.text())
                        .then(markdown => {
                            const html = marked.parse(markdown);
                            const element = document.getElementById(name + '-md');
                            if (element) {
                                element.innerHTML = html;
                            }
                        });
                }
            });
    });
}

window.addEventListener('DOMContentLoaded', event => {
    console.log('DOM loaded, initializing...');
    
    // Set default language display immediately
    document.getElementById('languageDropdown').innerHTML = langNames[currentLanguage] || 'Language';

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', (e) => {
            // Handle HOME link click to scroll to home-subtitle
            if (responsiveNavItem.getAttribute('href') === '#page-top') {
                e.preventDefault();
                const homeSubtitle = document.getElementById('home-subtitle');
                if (homeSubtitle) {
                    homeSubtitle.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            // Handle PUBLICATIONS link click to scroll to publications-subtitle
            else if (responsiveNavItem.getAttribute('href') === '#publications') {
                e.preventDefault();
                const publicationsSubtitle = document.getElementById('publications-subtitle');
                if (publicationsSubtitle) {
                    publicationsSubtitle.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            // Handle AWARDS link click to scroll to awards-subtitle
            else if (responsiveNavItem.getAttribute('href') === '#awards') {
                e.preventDefault();
                const awardsSubtitle = document.getElementById('awards-subtitle');
                if (awardsSubtitle) {
                    awardsSubtitle.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            
            // Don't collapse navbar when clicking language dropdown
            if (window.getComputedStyle(navbarToggler).display !== 'none' && !responsiveNavItem.classList.contains('dropdown-toggle')) {
                navbarToggler.click();
            }
        });
    });

    // Load config file
    console.log('Loading config file...');
    // Add timestamp to avoid browser cache
    const timestamp = new Date().getTime();
    fetch(`${content_dir}${config_file}?t=${timestamp}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch config: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            console.log('Config file loaded, parsing...');
            try {
                configData = jsyaml.load(text);
                console.log('Config parsed successfully:', configData);
                // Always load English on refresh
                const savedLang = 'en';
                console.log('Loading language:', savedLang);
                loadLanguage(savedLang);
                // Scroll to top after loading
                window.scrollTo(0, 0);
            } catch (error) {
                console.error('Error parsing config:', error);
                // Fallback to English if config parsing fails
                console.log('Falling back to English...');
                loadLanguage('en');
                // Scroll to top after loading
                window.scrollTo(0, 0);
            }
        })
        .catch(error => {
            console.error('Error loading config:', error);
            // Fallback to English if config loading fails
            console.log('Falling back to English...');
            loadLanguage('en');
        });

    // Add language switch event listeners
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('lang-switch')) {
            e.preventDefault(); // Prevent default link behavior
            const lang = e.target.dataset.lang;
            console.log('Switching to language:', lang);
            loadLanguage(lang);
            // Close dropdown after selection
            const dropdownElement = document.getElementById('languageDropdown');
            if (dropdownElement) {
                const dropdown = bootstrap.Dropdown.getInstance(dropdownElement);
                if (dropdown) {
                    dropdown.hide();
                }
            }
            // Collapse responsive navbar when toggler is visible
            const navbarToggler = document.body.querySelector('.navbar-toggler');
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        }
    });

}); 
