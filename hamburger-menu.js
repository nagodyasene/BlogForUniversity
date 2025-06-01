// Hamburger menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const links = document.querySelector('.links');
    const body = document.body;

    // Check if elements exist before adding event listeners
    if (!hamburger || !links) {
        console.warn('Hamburger menu elements not found');
        return;
    }

    // Toggle the hamburger menu
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent the click from bubbling to document
        links.classList.toggle('active');
    });

    // Handle menu item interactions
    const navLinks = document.querySelectorAll('.links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Add a small delay to see the hover effect before navigation
            setTimeout(() => {
                links.classList.remove('active');
            }, 150);
        });
        
        // Add touch support for mobile devices
        link.addEventListener('touchstart', function() {
            const parentButton = this.closest('.about-button, .contact-button, .blog-button');
            if (parentButton) {
                parentButton.classList.add('touched');
            }
        }, { passive: true });

        link.addEventListener('touchend', function() {
            const buttons = document.querySelectorAll('.about-button, .contact-button, .blog-button');
            buttons.forEach(btn => {
                btn.classList.remove('touched');
            });
        }, { passive: true });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = hamburger.contains(event.target) || links.contains(event.target);
        
        if (!isClickInsideNav && links.classList.contains('active')) {
            links.classList.remove('active');
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 480) {
            links.classList.remove('active');
        }
    });
});
