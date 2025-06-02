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
    }
    
    setupBlogPostForDragging() {
        // Store initial position
        const rect = this.blogPost.getBoundingClientRect();
        
        // Get navbar bottom position for accurate positioning
        const navbar = document.querySelector('.navigation-bar');
        let navbarBottom = 0;
        if (navbar) {
            const navbarRect = navbar.getBoundingClientRect();
            navbarBottom = navbarRect.bottom;
        }
        
        // Ensure initial position is below navbar with margin
        const margin = 20;
        const safeY = Math.max(rect.top, navbarBottom + margin);
        
        this.initialPosition = {
            x: rect.left + window.scrollX,
            y: safeY + window.scrollY
        };
        
        // Store the exact initial width and height BEFORE making it absolute
        this.fixedWidth = rect.width;
        this.fixedHeight = rect.height;
        
        // Make it absolutely positioned
        this.blogPost.style.position = 'absolute';
        this.blogPost.style.left = this.initialPosition.x + 'px';
        this.blogPost.style.top = this.initialPosition.y + 'px';
        this.blogPost.style.margin = '0';
        this.blogPost.style.zIndex = '1000';
        
        // Set fixed dimensions to prevent resizing/wrapping
        this.blogPost.style.width = this.fixedWidth + 'px';
        this.blogPost.style.minWidth = this.fixedWidth + 'px';
        this.blogPost.style.maxWidth = this.fixedWidth + 'px';
        this.blogPost.style.height = 'auto';
        this.blogPost.style.boxSizing = 'border-box';
        
        // IMPORTANT: Ensure it can't overflow the viewport
        this.blogPost.style.maxWidth = Math.min(this.fixedWidth, window.innerWidth - 20) + 'px';
        
        // Store initial size and position for maximize/restore functionality
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
        
        // Get navbar bottom position for accurate constraint
        const navbar = document.querySelector('.navigation-bar');
        let navbarBottom = 0;
        if (navbar) {
            const navbarRect = navbar.getBoundingClientRect();
            navbarBottom = navbarRect.bottom;
        }
        
        // Use the current actual dimensions for boundary calculations
        const currentRect = this.blogPost.getBoundingClientRect();
        const postWidth = currentRect.width;
        const postHeight = currentRect.height;
        
        // Apply strict constraints with safety margins
        const margin = 10;
        const minX = margin;
        const minY = navbarBottom + margin;
        const maxX = window.innerWidth - postWidth - margin;
        const maxY = window.innerHeight - postHeight - margin;
        
        // Ensure values are valid
        const safeMaxX = Math.max(minX, maxX);
        const safeMaxY = Math.max(minY, maxY);
        
        newX = Math.max(minX, Math.min(newX, safeMaxX));
        newY = Math.max(minY, Math.min(newY, safeMaxY));
        
        // Apply new position
        this.blogPost.style.left = newX + 'px';
        this.blogPost.style.top = newY + 'px';
        
        // Prevent default to avoid scrolling on mobile
        e.preventDefault();
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        // Remove dragging class
        this.blogPost.classList.remove('dragging');
        this.titleBar.style.cursor = 'grab';
    }
    
    addDragStyles() {
        // Add cursor style to title bar
        this.titleBar.style.cursor = 'grab';
        this.titleBar.style.userSelect = 'none';
        
        // Add styles for dragging state
        const style = document.createElement('style');
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
}

// Initialize the drag system
const blogDragSystem = new BlogDragSystem();

// Add some utility methods to window for debugging/testing
window.blogDragSystem = blogDragSystem;

// Add help text to console
console.log(`
🎉 Blog Drag System Loaded!

Features:
• Drag the title bar to move the blog post
• Double-click the title bar to maximize/restore
• Click the red button to close
• Click the yellow button to minimize/restore
• Click the green button to maximize/restore

Keyboard shortcuts:
• Cmd/Ctrl + W: Close
• Cmd/Ctrl + M: Minimize/Restore
• Cmd/Ctrl + Enter: Maximize/Restore

Utility functions:
• blogDragSystem.centerPost() - Center the post
• blogDragSystem.resetPosition() - Reset to original position
`); 