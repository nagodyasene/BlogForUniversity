// Viewport Constraint System - Add this at the top of the file
class ViewportConstraintSystem {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupViewportConstraints();
        this.addResizeListener();
    }
    
    setupViewportConstraints() {
        // Get actual viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Set CSS custom properties for viewport dimensions
        document.documentElement.style.setProperty('--viewport-width', viewportWidth + 'px');
        document.documentElement.style.setProperty('--viewport-height', viewportHeight + 'px');
        
        // Apply constraints to body and html
        document.documentElement.style.maxWidth = viewportWidth + 'px';
        document.documentElement.style.maxHeight = viewportHeight + 'px';
        document.documentElement.style.overflow = 'hidden';
        
        document.body.style.maxWidth = viewportWidth + 'px';
        document.body.style.maxHeight = viewportHeight + 'px';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'relative';
        
        // Create a main container that acts as the boundary
        this.createViewportContainer();
        
        console.log(`🔒 Viewport locked to: ${viewportWidth}x${viewportHeight}`);
    }
    
    createViewportContainer() {
        // Check if container already exists
        let container = document.getElementById('viewport-container');
        
        if (!container) {
            // Create a container that wraps all content
            container = document.createElement('div');
            container.id = 'viewport-container';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: var(--viewport-width);
                height: var(--viewport-height);
                max-width: var(--viewport-width);
                max-height: var(--viewport-height);
                overflow: hidden;
                z-index: 1;
                pointer-events: none;
            `;
            
            // Move all body children into the container
            const bodyChildren = Array.from(document.body.children);
            bodyChildren.forEach(child => {
                if (child.id !== 'viewport-container') {
                    container.appendChild(child);
                }
            });
            
            document.body.appendChild(container);
            
            // Re-enable pointer events for the container content
            container.style.pointerEvents = 'auto';
        }
    }
    
    addResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.setupViewportConstraints();
            }, 100); // Debounce resize events
        });
    }
    
    // Method to get safe boundaries for any element
    getSafeBoundaries(elementWidth, elementHeight) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 10;
        
        return {
            minX: margin,
            minY: margin,
            maxX: viewportWidth - elementWidth - margin,
            maxY: viewportHeight - elementHeight - margin
        };
    }
}

// Initialize viewport constraint system BEFORE the blog drag system
const viewportConstraints = new ViewportConstraintSystem();

// Blog Post Drag System
class BlogDragSystem {
    constructor() {
        this.blogPost = null;
        this.titleBar = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.initialPosition = { x: 0, y: 0 };
        this.isMinimized = false;
        this.isMaximized = false;
        this.savedPosition = { x: 0, y: 0, width: 0, height: 0 };
        this.fixedWidth = 0;
        this.fixedHeight = 0;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupDragSystem());
        } else {
            this.setupDragSystem();
        }
    }
    
    setupDragSystem() {
        this.blogPost = document.querySelector('.blog-post');
        this.titleBar = document.querySelector('.macos-title-bar');
        
        if (!this.blogPost || !this.titleBar) {
            console.warn('Blog post or title bar not found');
            return;
        }
        
        // Make blog post absolutely positioned for dragging
        this.setupBlogPostForDragging();
        
        // Add event listeners
        this.addEventListeners();
        
        // Add visual feedback styles
        this.addDragStyles();
        
        // Setup macOS controls
        this.setupMacOSControls();
        
        // Setup hamburger menu z-index management
        this.setupHamburgerMenuZIndex();
    }
    
    setupBlogPostForDragging() {
        // Store initial position
        const rect = this.blogPost.getBoundingClientRect();
        
        // Get navbar bottom position
        const navbar = document.querySelector('.navigation-bar');
        let navbarBottom = 0;
        if (navbar) {
            const navbarRect = navbar.getBoundingClientRect();
            navbarBottom = navbarRect.bottom;
        }
        
        this.fixedWidth = rect.width;
        this.fixedHeight = rect.height;
        
        this.initialPosition = {
            x: rect.left + window.scrollX,
            y: Math.max(rect.top + window.scrollY, navbarBottom + 20)
        };
        
        // Make it absolutely positioned
        this.blogPost.style.position = 'absolute';
        this.blogPost.style.left = this.initialPosition.x + 'px';
        this.blogPost.style.top = this.initialPosition.y + 'px';
        this.blogPost.style.margin = '0';
        this.blogPost.style.zIndex = '1000';
        
        // Set fixed dimensions
        this.blogPost.style.width = this.fixedWidth + 'px';
        this.blogPost.style.minWidth = this.fixedWidth + 'px';
        this.blogPost.style.maxWidth = this.fixedWidth + 'px';
        this.blogPost.style.height = 'auto';
        this.blogPost.style.boxSizing = 'border-box';
        
        this.savedPosition = {
            x: this.initialPosition.x,
            y: this.initialPosition.y,
            width: this.fixedWidth,
            height: this.fixedHeight 
        };
    }
    
    setupMacOSControls() {
        const closeBtn = document.querySelector('.macos-control.close');
        const minimizeBtn = document.querySelector('.macos-control.minimize');
        const maximizeBtn = document.querySelector('.macos-control.maximize');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeBlogPost();
            });
        }
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.minimizeBlogPost();
            });
        }
        
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.maximizeBlogPost();
            });
        }
    }
    
    closeBlogPost() {
        this.blogPost.style.transform = 'scale(0)';
        this.blogPost.style.opacity = '0';
        setTimeout(() => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = './index.html';
            }
        }, 300);
    }
    
    minimizeBlogPost() {
        if (this.isMinimized) {
            // Restore
            this.blogPost.style.transform = 'scale(1)';
            this.blogPost.style.opacity = '1';
            this.isMinimized = false;
        } else {
            // Minimize
            this.blogPost.style.transform = 'scale(0.1)';
            this.blogPost.style.opacity = '0.3';
            this.isMinimized = true;
        }
    }
    
    maximizeBlogPost() {
        if (this.isMaximized) {
            // Restore to original size and position
            this.blogPost.style.left = this.savedPosition.x + 'px';
            this.blogPost.style.top = this.savedPosition.y + 'px';
            this.blogPost.style.width = this.savedPosition.width + 'px';
            this.blogPost.style.height = this.savedPosition.height + 'px';
            this.isMaximized = false;
        } else {
            // Save current position and size
            const rect = this.blogPost.getBoundingClientRect();
            this.savedPosition = {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            };
            
            // Get navbar height to position maximized window below it
            const navbar = document.querySelector('.navigation-bar');
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            
            // Calculate available space below navbar
            const availableHeight = window.innerHeight - navbarHeight;
            const topPosition = navbarHeight + (availableHeight * 0.05); // 5% margin from navbar
            
            // Maximize
            this.blogPost.style.left = '5%';
            this.blogPost.style.top = topPosition + 'px';
            this.blogPost.style.width = '90%';
            this.blogPost.style.height = (availableHeight * 0.9) + 'px'; // 90% of available height
            this.isMaximized = true;
        }
    }
    
    addEventListeners() {
        // Mouse events
        this.titleBar.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        
        // Touch events for mobile
        this.titleBar.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        document.addEventListener('touchend', () => this.endDrag());
        
        // Prevent text selection while dragging
        this.titleBar.addEventListener('selectstart', (e) => e.preventDefault());
        
        // Double-click to maximize/restore
        this.titleBar.addEventListener('dblclick', (e) => {
            e.preventDefault();
            this.maximizeBlogPost();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.metaKey || e.ctrlKey) {
                switch(e.key) {
                    case 'w':
                        e.preventDefault();
                        this.closeBlogPost();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.minimizeBlogPost();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.maximizeBlogPost();
                        break;
                }
            }
        });
    }
    
    startDrag(e) {
        // Don't start drag if we're minimized or if clicking on controls
        if (this.isMinimized || e.target.classList.contains('macos-control')) {
            return;
        }
        
        this.isDragging = true;
        
        // Get mouse/touch position
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        // Calculate offset from mouse to blog post position
        const rect = this.blogPost.getBoundingClientRect();
        this.dragOffset = {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
        
        // Add dragging class for visual feedback
        this.blogPost.classList.add('dragging');
        this.titleBar.style.cursor = 'grabbing';
        
        // Set z-index based on hamburger menu state
        const linksMenu = document.querySelector('.links');
        if (linksMenu && linksMenu.classList.contains('active')) {
            // If hamburger menu is open, keep blog post behind it even when dragging
            this.blogPost.style.zIndex = '900';
        } else {
            // Menu closed - keep blog post behind hamburger button even when dragging
            this.blogPost.style.zIndex = '950';
        }
        
        // Prevent default to avoid unwanted behaviors
        e.preventDefault();
    }
    
    drag(e) {
        if (!this.isDragging || this.isMaximized) return;
        
        // Get mouse/touch position
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        // Calculate new position
        let newX = clientX - this.dragOffset.x;
        let newY = clientY - this.dragOffset.y;
        
        // Get current dimensions
        const currentRect = this.blogPost.getBoundingClientRect();
        
        // Use the viewport constraint system for boundaries
        const boundaries = viewportConstraints.getSafeBoundaries(
            currentRect.width, 
            currentRect.height
        );
        
        // Get navbar constraint
        const navbar = document.querySelector('.navigation-bar');
        let navbarBottom = 0;
        if (navbar) {
            navbarBottom = navbar.getBoundingClientRect().bottom;
        }
        
        // Apply constraints
        newX = Math.max(boundaries.minX, Math.min(newX, boundaries.maxX));
        newY = Math.max(Math.max(boundaries.minY, navbarBottom + 10), Math.min(newY, boundaries.maxY));
        
        // Apply new position
        this.blogPost.style.left = newX + 'px';
        this.blogPost.style.top = newY + 'px';
        
        e.preventDefault();
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        // Remove dragging class
        this.blogPost.classList.remove('dragging');
        this.titleBar.style.cursor = 'grab';
        
        // Restore appropriate z-index based on hamburger menu state
        this.handleHamburgerMenuToggle();
    }
    
    addDragStyles() {
        // Add cursor style to title bar
        this.titleBar.style.cursor = 'grab';
        this.titleBar.style.userSelect = 'none';
        
        // Check if styles already exist to prevent memory leaks
        const existingStyles = document.getElementById('blog-drag-styles');
        if (existingStyles) {
            return; // Styles already added, no need to add again
        }
        
        // Add styles for dragging state
        const style = document.createElement('style');
        style.id = 'blog-drag-styles'; // Add ID for checking existence
        style.textContent = `
            .blog-post.dragging {
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                transition: none;
                z-index: 9999;
            }
            
            .blog-post.dragging .macos-title-bar {
                background-color: #e6e6e6;
            }
            
            .macos-title-bar {
                transition: background-color 0.2s ease;
            }
            
            .blog-post {
                transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.3s ease;
            }
            
            /* Prevent text selection while dragging */
            .blog-post.dragging * {
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
            }
            
            /* Enhanced control hover effects */
            .macos-control {
                position: relative;
                transition: all 0.2s ease;
            }
            
            .macos-control:hover {
                transform: scale(1.2);
            }
            
            .macos-control:active {
                transform: scale(0.9);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Method to reset position
    resetPosition() {
        this.blogPost.style.left = this.initialPosition.x + 'px';
        this.blogPost.style.top = this.initialPosition.y + 'px';
        this.blogPost.style.transform = 'scale(1)';
        this.blogPost.style.opacity = '1';
        this.isMinimized = false;
        this.isMaximized = false;
    }
    
    // Method to center the blog post
    centerPost() {
        // Get navbar height to position below it
        const navbar = document.querySelector('.navigation-bar');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        
        const centerX = (window.innerWidth - this.blogPost.offsetWidth) / 2;
        const availableHeight = window.innerHeight - navbarHeight;
        const centerY = navbarHeight + (availableHeight - this.blogPost.offsetHeight) / 2;
        
        this.blogPost.style.left = Math.max(0, centerX) + 'px';
        this.blogPost.style.top = Math.max(navbarHeight, centerY) + 'px';
    }
    
    setupHamburgerMenuZIndex() {
        const linksMenu = document.querySelector('.links');
        const hamburgerButton = document.querySelector('.hamburger');
        
        if (!linksMenu || !hamburgerButton) {
            return; // No hamburger menu found (probably desktop)
        }
        
        // Create a MutationObserver to watch for class changes on the links menu
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    this.handleHamburgerMenuToggle();
                }
            });
        });
        
        // Start observing the links menu for class changes
        observer.observe(linksMenu, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Also handle initial state
        this.handleHamburgerMenuToggle();
    }
    
    handleHamburgerMenuToggle() {
        const linksMenu = document.querySelector('.links');
        if (!linksMenu) return;
        
        if (linksMenu.classList.contains('active')) {
            // Menu is open - put blog post behind the menu
            this.blogPost.style.zIndex = '900'; // Lower than menu's 999
        } else {
            // Menu is closed - put blog post behind hamburger button (1001)
            this.blogPost.style.zIndex = this.isDragging ? '950' : '950'; // Lower than hamburger button's 1001
        }
    }
}

// Initialize systems
const blogDragSystem = new BlogDragSystem();

// Add utility to window
window.viewportConstraints = viewportConstraints;
window.blogDragSystem = blogDragSystem;

console.log(`
🎉 Enhanced Blog Drag System with Viewport Constraints Loaded!

New Features:
• 🔒 Viewport is locked to screen size
• 📐 All elements constrained within viewport
• 🚫 Page can never expand beyond screen
• 📱 Responsive to window resize

Utility functions:
• viewportConstraints.getSafeBoundaries(width, height) - Get safe boundaries for any element
• blogDragSystem.centerPost() - Center the post
• blogDragSystem.resetPosition() - Reset to original position
`); 