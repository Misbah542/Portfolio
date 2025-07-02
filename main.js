/**
 * Main JavaScript for Android Developer Portfolio
 * Handles navigation, scrolling, animations, and PDF download
 * Author: Misbah ul Haque
 * 
 * Note: The portfolio starts with normal scrolling behavior.
 * 3D interaction is only activated when clicking the 3D button.
 */

// Portfolio data
let portfolioData = null;

// Ensure page starts at top
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Scroll to top on load
    window.scrollTo(0, 0);
    
    // Load portfolio data
    try {
        const response = await fetch('portfolio-data.json');
        portfolioData = await response.json();
        initializePortfolio();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        // Initialize with default data if JSON fails to load
        initializePortfolio();
    }
});

function initializePortfolio() {
    // DOM Elements
    const navbar = document.getElementById('navbar');
    const navItems = document.querySelectorAll('nav ul li');
    const sections = document.querySelectorAll('.section');
    const loader = document.getElementById('loader');
    const downloadBtn = document.getElementById('downloadResume');
    const sceneControl = document.getElementById('sceneControl');
    const canvas = document.getElementById('canvas');
    const terminalQuote = document.getElementById('terminalQuote');

    // State variables
    let isSceneInteractive = false;
    let lastScrollY = window.scrollY;
    let quoteIndex = 0;
    let quoteInterval = null;

    /**
     * Initialize the portfolio
     */
    function init() {
        // Hide loader after a delay
        setTimeout(() => {
            loader.classList.add('hidden');
            // Trigger initial animations
            updateActiveNav();
            observeSections();
            startQuoteRotation();
            updateSceneControlState();
        }, 1500);

        // Set up event listeners
        setupEventListeners();

        // Populate data if available
        if (portfolioData) {
            populateData();
        }
    }

    /**
     * Populate portfolio with data from JSON
     */
    function populateData() {
        // Update personal information
        const nameElements = document.querySelectorAll('h1.glitch-text, h1.terminal-name');
        nameElements.forEach(el => {
            if (portfolioData.personalInfo.name) {
                el.textContent = portfolioData.personalInfo.name;
            }
        });

        // Update other elements as needed
        // This can be extended to dynamically populate all sections
    }

    /**
     * Start terminal quote rotation
     */
    function startQuoteRotation() {
        if (!terminalQuote) return;

        // Default quotes if JSON fails to load
        const defaultQuotes = [
            "// TODO: Fix this bug... eventually 😅",
            "if (coffee.isEmpty()) { developer.crash() }",
            "// This code works, don't touch it!",
            "Android Studio: \"Indexing...\" Me: \"Still?!\"",
            "Jetpack Compose > XML (fight me)"
        ];

        const quotes = (portfolioData && portfolioData.terminalQuotes) ? portfolioData.terminalQuotes : defaultQuotes;
        
        // Set initial quote
        terminalQuote.textContent = quotes[0];

        // Rotate quotes every 3 seconds
        quoteInterval = setInterval(() => {
            quoteIndex = (quoteIndex + 1) % quotes.length;
            
            // Fade out
            terminalQuote.style.animation = 'fadeInOut 0.5s ease-in-out';
            
            setTimeout(() => {
                terminalQuote.textContent = quotes[quoteIndex];
            }, 250);
        }, 3000);
    }

    /**
     * Update 3D scene control state based on scroll position
     */
    function updateSceneControlState() {
        const terminalSection = document.getElementById('terminal');
        const scrollY = window.scrollY;
        const terminalHeight = terminalSection ? terminalSection.offsetHeight : 0;

        // Enable button only when on terminal page
        if (scrollY < terminalHeight - 100) {
            sceneControl.classList.remove('disabled');
        } else {
            sceneControl.classList.add('disabled');
            // Disable interaction if scrolled away
            if (isSceneInteractive) {
                toggleSceneInteraction();
            }
        }
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Navigation clicks
        navItems.forEach(item => {
            item.addEventListener('click', handleNavClick);
        });

        // Scroll events
        window.addEventListener('scroll', handleScroll);

        // Download resume button
        downloadBtn.addEventListener('click', downloadPDF);

        // Scene control button
        sceneControl.addEventListener('click', (e) => {
            if (!sceneControl.classList.contains('disabled')) {
                toggleSceneInteraction();
            } else {
                e.preventDefault();
            }
        });

        // Window resize
        window.addEventListener('resize', handleResize);

        // Terminal enter link
        const terminalLink = document.querySelector('.terminal-link');
        if (terminalLink) {
            terminalLink.addEventListener('click', (e) => {
                e.preventDefault();
                const homeSection = document.getElementById('home');
                if (homeSection) {
                    homeSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Prevent default touch behavior on canvas when interactive
        canvas.addEventListener('touchstart', (e) => {
            if (isSceneInteractive) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    /**
     * Handle navigation item clicks
     */
    function handleNavClick(e) {
        const sectionId = e.target.getAttribute('data-section');
        const section = document.getElementById(sectionId);
        
        if (section) {
            // Smooth scroll to section
            section.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * Handle scroll events
     */
    function handleScroll() {
        const scrollY = window.scrollY;
        
        // Update navbar style
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active navigation item
        updateActiveNav();

        // Update 3D control state
        updateSceneControlState();

        // Send scroll progress to 3D scene
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = scrollY / maxScroll;
        window.dispatchEvent(new CustomEvent('scrollProgress', { detail: { progress: scrollProgress, scrollY: scrollY } }));

        lastScrollY = scrollY;
    }

    /**
     * Update active navigation item based on scroll position
     */
    function updateActiveNav() {
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        sections.forEach((section, index) => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            
            if (scrollPosition >= top && scrollPosition <= bottom) {
                navItems.forEach(item => item.classList.remove('active'));
                if (navItems[index]) {
                    navItems[index].classList.add('active');
                }
            }
        });
    }

    /**
     * Set up intersection observer for content animations
     */
    function observeSections() {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const content = entry.target.querySelector('.content');
                    if (content) {
                        content.classList.add('visible');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Toggle 3D scene interaction mode
     */
    function toggleSceneInteraction() {
        isSceneInteractive = !isSceneInteractive;
        
        if (isSceneInteractive) {
            sceneControl.classList.add('active');
            canvas.classList.add('interactive');
            document.body.style.overflow = 'hidden';
            
            // Dispatch custom event for three-scene.js
            window.dispatchEvent(new CustomEvent('sceneInteractionEnabled'));
        } else {
            sceneControl.classList.remove('active');
            canvas.classList.remove('interactive');
            document.body.style.overflow = '';
            
            // Dispatch custom event for three-scene.js
            window.dispatchEvent(new CustomEvent('sceneInteractionDisabled'));
        }
    }

    /**
     * Download preset PDF resume
     */
    async function downloadPDF() {
        try {
            // Show loading state
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = '<span>Downloading...</span>';

            // Get PDF URL from portfolio data or use default
            const pdfUrl = portfolioData?.personalInfo?.resumePdfUrl || '/resume/Misbah_ul_Haque_Resume.pdf';

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'Misbah_ul_Haque_Resume.pdf';
            link.style.display = 'none';
            
            // Add to document, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Reset button state after a short delay
            setTimeout(() => {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Resume</span>
                `;
            }, 1000);

        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Resume download is currently unavailable. Please try again later.');
            
            // Reset button state
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Resume</span>
            `;
        }
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        // Update any responsive elements if needed
        updateActiveNav();
        updateSceneControlState();
    }

    /**
     * Utility function to debounce frequent events
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (quoteInterval) {
            clearInterval(quoteInterval);
        }
    });

    // Initialize the portfolio when DOM is ready
    init();
}