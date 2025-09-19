// Animations and Visual Effects for Logic Mixology: Inference Bar

class AnimationEngine {
    constructor() {
        this.particles = [];
        this.activeAnimations = new Set();
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;

        // Animation settings
        this.settings = {
            particles: {
                maxCount: 100,
                fadeSpeed: 0.02,
                gravity: 0.1,
                friction: 0.98
            },
            transitions: {
                duration: 300,
                easing: 'ease-out'
            }
        };

        this.init();
    }

    init() {
        console.log("Initializing animation engine...");
        this.createCanvas();
        this.startAnimationLoop();
        this.setupTransitionHelpers();
    }

    // Create canvas for particle effects
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'animation-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    // Resize canvas to match window
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Start the main animation loop
    startAnimationLoop() {
        const animate = () => {
            this.update();
            this.render();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    // Update all animations and particles
    update() {
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });

        // Limit particle count
        if (this.particles.length > this.settings.particles.maxCount) {
            this.particles.splice(0, this.particles.length - this.settings.particles.maxCount);
        }
    }

    // Render all visual effects
    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render particles
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
    }

    // Create celebration particles for correct answers
    celebrateCorrectAnswer(x, y) {
        const colors = ['#27ae60', '#f39c12', '#3498db', '#e74c3c', '#9b59b6'];
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 4;
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push(new Particle({
                x: x || window.innerWidth / 2,
                y: y || window.innerHeight / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                color: color,
                size: 3 + Math.random() * 4,
                life: 1.0,
                type: 'celebration'
            }));
        }

        console.log("Created celebration particles");
    }

    // Create error particles for wrong answers
    showErrorEffect(x, y) {
        const particleCount = 15;
        const color = '#e74c3c';

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;

            this.particles.push(new Particle({
                x: x || window.innerWidth / 2,
                y: y || window.innerHeight / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 2 + Math.random() * 3,
                life: 0.8,
                type: 'error'
            }));
        }

        // Add screen shake effect
        this.screenShake(200);
    }

    // Create mixing particles when ingredients are added
    createMixingEffect(element) {
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const colors = ['#3498db', '#27ae60', '#e74c3c'];
        const particleCount = 8;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2;
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push(new Particle({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 1 + Math.random() * 2,
                life: 0.6,
                type: 'mixing'
            }));
        }
    }

    // Create level up effect
    levelUpEffect() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const particleCount = 50;
        const colors = ['#f39c12', '#e74c3c', '#9b59b6', '#3498db'];

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 3 + Math.random() * 5;
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push(new Particle({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                color: color,
                size: 4 + Math.random() * 6,
                life: 1.2,
                type: 'levelup'
            }));
        }

        // Add pulsing effect to game title
        const gameTitle = document.querySelector('.game-title');
        if (gameTitle) {
            this.pulseElement(gameTitle, 1000);
        }
    }

    // Screen shake effect
    screenShake(duration = 300) {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;

        const intensity = 3;
        const startTime = Date.now();

        const shake = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                const currentIntensity = intensity * (1 - progress);
                const offsetX = (Math.random() - 0.5) * currentIntensity * 2;
                const offsetY = (Math.random() - 0.5) * currentIntensity * 2;

                gameContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                requestAnimationFrame(shake);
            } else {
                gameContainer.style.transform = '';
            }
        };

        shake();
    }

    // Pulse animation for elements
    pulseElement(element, duration = 600) {
        if (!element) return;

        element.style.transition = `transform ${duration}ms ease-in-out`;
        element.style.transform = 'scale(1.1)';

        setTimeout(() => {
            element.style.transform = 'scale(1)';
            setTimeout(() => {
                element.style.transition = '';
            }, duration);
        }, duration / 2);
    }

    // Fade in animation
    fadeIn(element, duration = 300) {
        if (!element) return;

        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-in`;

        // Trigger reflow
        element.offsetHeight;

        element.style.opacity = '1';
    }

    // Fade out animation
    fadeOut(element, duration = 300) {
        if (!element) return;

        element.style.transition = `opacity ${duration}ms ease-out`;
        element.style.opacity = '0';

        setTimeout(() => {
            element.style.display = 'none';
            element.style.transition = '';
        }, duration);
    }

    // Slide in animation
    slideIn(element, direction = 'up', duration = 400) {
        if (!element) return;

        const transforms = {
            up: 'translateY(20px)',
            down: 'translateY(-20px)',
            left: 'translateX(20px)',
            right: 'translateX(-20px)'
        };

        element.style.transform = transforms[direction];
        element.style.opacity = '0';
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;

        // Trigger reflow
        element.offsetHeight;

        element.style.transform = 'translateY(0)';
        element.style.opacity = '1';
    }

    // Bounce animation
    bounceElement(element, intensity = 0.2, duration = 400) {
        if (!element) return;

        const keyframes = [
            { transform: 'scale(1)', offset: 0 },
            { transform: `scale(${1 + intensity})`, offset: 0.3 },
            { transform: `scale(${1 - intensity * 0.3})`, offset: 0.6 },
            { transform: 'scale(1)', offset: 1 }
        ];

        element.animate(keyframes, {
            duration: duration,
            easing: 'ease-out'
        });
    }

    // Number count up animation
    animateNumber(element, startValue, endValue, duration = 1000) {
        if (!element) return;

        const startTime = Date.now();
        const difference = endValue - startValue;

        const updateNumber = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + difference * easedProgress);

            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = endValue;
            }
        };

        updateNumber();
    }

    // Typewriter effect for text
    typewriterEffect(element, text, speed = 50) {
        if (!element) return;

        element.textContent = '';
        let i = 0;

        const typeChar = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeChar, speed);
            }
        };

        typeChar();
    }

    // Setup CSS transition helpers
    setupTransitionHelpers() {
        // Add CSS for common transitions
        const style = document.createElement('style');
        style.textContent = `
            .animate-fade-in {
                animation: fadeIn 0.3s ease-in-out;
            }

            .animate-fade-out {
                animation: fadeOut 0.3s ease-in-out;
            }

            .animate-slide-up {
                animation: slideUp 0.4s ease-out;
            }

            .animate-bounce {
                animation: bounce 0.4s ease-out;
            }

            .animate-pulse {
                animation: pulse 0.6s ease-in-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }

            @keyframes slideUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            @keyframes bounce {
                0% { transform: scale(1); }
                30% { transform: scale(1.2); }
                60% { transform: scale(0.9); }
                100% { transform: scale(1); }
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            .particle-burst {
                position: absolute;
                pointer-events: none;
                border-radius: 50%;
                animation: particleBurst 1s ease-out forwards;
            }

            @keyframes particleBurst {
                0% {
                    opacity: 1;
                    transform: scale(0);
                }
                100% {
                    opacity: 0;
                    transform: scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Clean up animations
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.canvas) {
            this.canvas.remove();
        }

        this.particles = [];
        this.activeAnimations.clear();
    }
}

// Particle class for particle effects
class Particle {
    constructor(options) {
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.vx = options.vx || 0;
        this.vy = options.vy || 0;
        this.color = options.color || '#ffffff';
        this.size = options.size || 2;
        this.life = options.life || 1.0;
        this.maxLife = this.life;
        this.type = options.type || 'default';
        this.gravity = options.gravity || 0.1;
        this.friction = options.friction || 0.98;
    }

    update() {
        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Apply physics
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Update life
        this.life -= 0.02;

        // Type-specific behavior
        switch (this.type) {
            case 'celebration':
                this.vy += this.gravity;
                break;
            case 'error':
                this.size *= 0.995;
                break;
            case 'mixing':
                this.vx *= 0.95;
                this.vy *= 0.95;
                break;
        }
    }

    render(ctx) {
        if (this.life <= 0) return;

        ctx.save();

        // Set alpha based on life
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;

        // Set color
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;

        // Draw particle based on type
        switch (this.type) {
            case 'celebration':
                this.renderStar(ctx);
                break;
            case 'error':
                this.renderX(ctx);
                break;
            default:
                this.renderCircle(ctx);
                break;
        }

        ctx.restore();
    }

    renderCircle(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    renderStar(ctx) {
        const spikes = 5;
        const outerRadius = this.size;
        const innerRadius = this.size * 0.5;

        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    renderX(ctx) {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size, this.y - this.size);
        ctx.lineTo(this.x + this.size, this.y + this.size);
        ctx.moveTo(this.x + this.size, this.y - this.size);
        ctx.lineTo(this.x - this.size, this.y + this.size);
        ctx.stroke();
    }
}

// Create global animation engine instance
const animationEngine = new AnimationEngine();

// Integration with game engine
if (typeof window !== 'undefined') {
    // Override game engine feedback to include animations
    const originalShowFeedback = window.gameEngine?.showFeedback;
    if (originalShowFeedback) {
        window.gameEngine.showFeedback = function(message, type) {
            originalShowFeedback.call(this, message, type);

            // Add particle effects based on feedback type
            if (type === 'success') {
                animationEngine.celebrateCorrectAnswer();
            } else if (type === 'error') {
                animationEngine.showErrorEffect();
            }
        };
    }
}

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnimationEngine, Particle, animationEngine };
} else {
    // Browser environment - attach to window
    window.AnimationEngine = AnimationEngine;
    window.Particle = Particle;
    window.animationEngine = animationEngine;
}