/**
 * Main JavaScript for Android Developer Portfolio
 * Handles navigation, scrolling, animations, and PDF generation
 * Author: Misbah ul Haque
 * 
 * Note: The portfolio starts with normal scrolling behavior.
 * 3D interaction is only activated when clicking the 3D button.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // DOM Elements
    const navbar = document.getElementById('navbar');
    const navItems = document.querySelectorAll('nav ul li');
    const sections = document.querySelectorAll('.section');
    const loader = document.getElementById('loader');
    const downloadBtn = document.getElementById('downloadResume');
    const sceneControl = document.getElementById('sceneControl');
    const canvas = document.getElementById('canvas');

    // State variables
    let isSceneInteractive = false;
    let lastScrollY = window.scrollY;

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
        }, 1500);

        // Set up event listeners
        setupEventListeners();
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
        downloadBtn.addEventListener('click', generatePDF);

        // Scene control button
        sceneControl.addEventListener('click', toggleSceneInteraction);

        // Window resize
        window.addEventListener('resize', handleResize);

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
     * Generate PDF of resume
     */
    async function generatePDF() {
        try {
            // Show loading state
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = '<span>Generating...</span>';

            // Get resume content
            const resumeSection = document.getElementById('resume');
            const homeSection = document.getElementById('home');
            
            // Create a temporary container for PDF content
            const pdfContainer = document.createElement('div');
            pdfContainer.style.position = 'absolute';
            pdfContainer.style.left = '-9999px';
            pdfContainer.style.width = '210mm'; // A4 width
            pdfContainer.style.padding = '20mm';
            pdfContainer.style.background = 'white';
            pdfContainer.style.color = 'black';
            document.body.appendChild(pdfContainer);

            // Add content to PDF container
            pdfContainer.innerHTML = `
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #4CAF50; font-size: 36px; margin-bottom: 10px;">Misbah ul Haque</h1>
                    <p style="font-size: 20px; color: #666; margin-bottom: 20px;">Experienced Android Developer</p>
                    <p style="color: #333; margin-bottom: 5px;">📧 misbahul8@gmail.com | 📱 +91-8376069521</p>
                    <p style="color: #333;">🔗 linkedin.com/in/Misbah542 | 💻 github.com/Misbah542</p>
                </div>
                <hr style="border: 1px solid #ddd; margin: 30px 0;">
                ${document.getElementById('resumeContent').innerHTML}
            `;

            // Style the content for PDF
            const styles = pdfContainer.querySelectorAll('*');
            styles.forEach(el => {
                if (el.tagName === 'H2') {
                    el.style.color = '#4CAF50';
                    el.style.fontSize = '24px';
                    el.style.marginTop = '30px';
                }
                if (el.tagName === 'H3') {
                    el.style.color = '#333';
                    el.style.fontSize = '20px';
                    el.style.marginTop = '20px';
                }
                if (el.tagName === 'H4') {
                    el.style.color = '#555';
                    el.style.fontSize = '18px';
                }
                if (el.classList.contains('skill-grid')) {
                    el.style.display = 'grid';
                    el.style.gridTemplateColumns = 'repeat(3, 1fr)';
                    el.style.gap = '15px';
                }
                if (el.classList.contains('skill-item')) {
                    el.style.background = '#f5f5f5';
                    el.style.padding = '15px';
                    el.style.borderRadius = '8px';
                    el.style.border = 'none';
                }
            });

            // Use html2canvas to capture the content
            const canvas = await html2canvas(pdfContainer, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            // Create PDF using jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add image to PDF, handling multiple pages if needed
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Save the PDF
            pdf.save('Misbah_ul_Haque_Resume.pdf');

            // Clean up
            document.body.removeChild(pdfContainer);

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

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Sorry, there was an error generating the PDF. Please try again.');
            
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

    // Initialize the portfolio when DOM is ready
    init();
});