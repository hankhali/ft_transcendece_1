class BackgroundEffects {
    private starfield: HTMLElement | null;
    private backgroundContainer: HTMLElement | null;
    private ball: HTMLElement | null;
    private glowEffect: HTMLElement | null;
    private appContainer: HTMLElement | null;
    private trailInterval: number | null = null;
    private animationFrameId: number | null = null;
    private shakeOffset: number = 0;
    private isAnimating: boolean = false;

    constructor() {
        this.starfield = document.getElementById('starfield');
        this.backgroundContainer = document.querySelector('.background-animation-container');
        this.ball = document.querySelector('.ball');
        this.glowEffect = document.querySelector('.glow-effect');
        this.appContainer = document.getElementById('app');
    }

    public init(): void {
        if (this.starfield) {
            this.createStars();
        }

        if (this.ball && this.backgroundContainer) {
            this.trailInterval = window.setInterval(() => this.createTrail(), 100);
        }

        if (this.appContainer) {
            this.isAnimating = true;
            this.cameraShake();
        }

        if (this.glowEffect) {
            this.updateGlow();
        }
    }

    public destroy(): void {
        if (this.trailInterval !== null) {
            clearInterval(this.trailInterval);
        }
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.isAnimating = false;
    }

    private createTrail(): void {
        if (!this.ball || !this.backgroundContainer) return;

        const trail = document.createElement('div');
        trail.className = 'trail';

        const ballRect = this.ball.getBoundingClientRect();
        const containerRect = this.backgroundContainer.getBoundingClientRect();

        // Calculate position relative to the background-animation-container
        trail.style.left = (ballRect.left - containerRect.left + (ballRect.width / 2)) + 'px';
        trail.style.bottom = (window.innerHeight - ballRect.bottom - containerRect.top + (ballRect.height / 2)) + 'px';

        this.backgroundContainer.appendChild(trail);

        // Remove trail after animation
        setTimeout(() => {
            if (trail.parentNode) {
                trail.parentNode.removeChild(trail);
            }
        }, 800);
    }

    private createStars(): void {
        if (!this.starfield) return;
        
        // Clear existing stars
        this.starfield.innerHTML = '';
        
        // Create 100 stars
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random position
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            
            // Random size
            const size = Math.random() * 3 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            
            // Random animation delay
            star.style.animationDelay = `${Math.random() * 5}s`;
            
            this.starfield.appendChild(star);
        }
    }

    private cameraShake(): void {
        if (!this.appContainer || !this.isAnimating) return;

        // Subtle camera shake effect
        this.shakeOffset = Math.sin(Date.now() / 100) * 0.5;
        this.appContainer.style.transform = `translateX(${this.shakeOffset}px)`;
        
        this.animationFrameId = requestAnimationFrame(() => this.cameraShake());
    }

    private updateGlow(): void {
        if (!this.glowEffect) return;
        
        // Update glow effect based on ball position
        if (this.ball) {
            const ballRect = this.ball.getBoundingClientRect();
            this.glowEffect.style.background = `radial-gradient(circle at ${ballRect.left + ballRect.width / 2}px ${ballRect.top + ballRect.height / 2}px, rgba(0, 255, 255, 0.1), transparent 200px)`;
        }
        
        requestAnimationFrame(() => this.updateGlow());
    }
}

// Initialize the background effects when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const backgroundEffects = new BackgroundEffects();
    backgroundEffects.init();
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        backgroundEffects.destroy();
    });
});
