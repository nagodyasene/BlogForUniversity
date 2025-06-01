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
        this.initialPosition = {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY
        };
        
        // Make it absolutely positioned
        this.blogPost.style.position = 'absolute';
        this.blogPost.style.left = this.initialPosition.x + 'px';
        this.blogPost.style.top = this.initialPosition.y + 'px';
        this.blogPost.style.margin = '0';
        this.blogPost.style.zIndex = '1000';
        
        // Add some constraints to keep it on screen
        this.blogPost.style.maxWidth = '90vw';
        this.blogPost.style.maxHeight = '90vh';
        
        // Store initial size
        this.savedPosition = {
            x: this.initialPosition.x,
            y: this.initialPosition.y,
            width: rect.width,
            height: rect.height
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
            
            // Maximize
            this.blogPost.style.left = '5%';
            this.blogPost.style.top = '5%';
            this.blogPost.style.width = '90%';
            this.blogPost.style.height = '90%';
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
        
        // Apply constraints to keep blog post on screen
        const maxX = window.innerWidth - this.blogPost.offsetWidth;
        const maxY = window.innerHeight - this.blogPost.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
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
                transform: scale(1.02);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                transition: none;
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
        const centerX = (window.innerWidth - this.blogPost.offsetWidth) / 2;
        const centerY = (window.innerHeight - this.blogPost.offsetHeight) / 2;
        
        this.blogPost.style.left = Math.max(0, centerX) + 'px';
        this.blogPost.style.top = Math.max(0, centerY) + 'px';
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