/**
 * RODDNEIL B. GEMINA — DEEP COSMIC BLACK & LUMINOUS CYAN PORTFOLIO ENGINE (js/main.js)
 * Features:
 * 1. Web Audio API Synthesized High-Tech SFX
 * 2. Three.js 3D Cosmic Space with Floating Polyhedrons & Cyan/Violet Ambient Lights
 * 3. Cyber Glitch-Decipher Typing Effects on Section Headers
 * 4. Smooth Ease-In Section Reveals with Staggered Child Elements
 * 5. Full Projects Overlay & Category Filtering (All 10 Projects & Researches)
 * 6. Interactive Modal with Screenshot/Video Switcher
 * 7. One-Click Email Clipboard Copy & Theme Mode Wave
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. SOUND EFFECTS DISABLED (Per user preference)
    // ==========================================================================
    function playSfx() {
        // Audio permanently disabled
    }

    // ==========================================================================
    // 1B. FULLSCREEN CINEMATIC INTRO SEQUENCE CONTROLLER
    // ==========================================================================
    const introCurtain = document.getElementById('intro-curtain-bg');
    const heroNameContainer = document.getElementById('hero-name-container');
    const heroNameWrapper = document.getElementById('hero-name-wrapper');
    const heroNameAura = document.getElementById('hero-name-aura');
    const heroMetallicGlint = document.getElementById('hero-metallic-glint');
    const heroMainRole = document.getElementById('hero-main-role');
    const rolePart1 = document.getElementById('role-part1');
    const roleSep = document.getElementById('role-separator');
    const roleAccent = document.getElementById('role-accent');
    const roleCursor = document.getElementById('role-cursor');
    const heroSection = document.getElementById('hero');
    const heroContent = document.querySelector('.hero-split-grid') || document.querySelector('.hero-container');
    const portraitLineEmitter = document.getElementById('portrait-line-emitter');
    const portraitRoleDrawer = document.getElementById('portrait-role-drawer');

    let introCompleted = false;

    if (introCurtain && heroNameContainer && heroMainRole) {
        document.body.classList.add('intro-active');
        window.scrollTo(0, 0);

        // Pre-fill text momentarily to compute precise rendered bounding box dimensions
        const part1Text = 'Full-Stack Developer';
        const part2Text = 'Software Engineer';
        if (rolePart1) rolePart1.textContent = part1Text;
        if (roleSep) roleSep.style.display = 'inline';
        if (roleAccent) roleAccent.textContent = part2Text;

        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;

        const nameTargetEl = heroNameWrapper || heroNameContainer;
        const nameRect = nameTargetEl.getBoundingClientRect();
        const roleRect = heroMainRole.getBoundingClientRect();

        const nameTargetX = Math.round(viewportCenterX - (nameRect.left + nameRect.width / 2));
        const nameTargetY = Math.round((viewportCenterY - 32) - (nameRect.top + nameRect.height / 2));

        const roleTargetX = Math.round(viewportCenterX - (roleRect.left + roleRect.width / 2));
        const roleTargetY = Math.round((viewportCenterY + 30) - (roleRect.top + roleRect.height / 2));

        // Clear text before starting cinematic entrance
        if (rolePart1) rolePart1.textContent = '';
        if (roleSep) roleSep.style.display = 'none';
        if (roleAccent) roleAccent.textContent = '';

        // Position initial elements in the center of pitch-black screen
        heroNameContainer.style.zIndex = '9998';
        heroMainRole.style.zIndex = '9998';
        heroNameContainer.style.transformOrigin = 'center center';
        heroNameContainer.style.transform = `translate3d(${nameTargetX}px, ${nameTargetY}px, 0) scale(0.88)`;
        heroMainRole.style.transform = `translate3d(${roleTargetX}px, ${roleTargetY}px, 0)`;
        heroNameContainer.style.opacity = '0';
        heroMainRole.style.opacity = '0';

        // 1. Pitch-black void: Name fades in and grows smoothly
        setTimeout(() => {
            if (introCompleted) return;
            heroNameContainer.style.transition = 'opacity 1.25s cubic-bezier(0.16, 1, 0.3, 1), transform 1.25s cubic-bezier(0.16, 1, 0.3, 1)';
            heroNameContainer.style.opacity = '1';
            heroNameContainer.style.transform = `translate3d(${nameTargetX}px, ${nameTargetY}px, 0) scale(1)`;
            if (heroNameAura) heroNameAura.classList.add('active');

            // 2. Metallic glint and typing of role in tandem
            setTimeout(() => {
                if (introCompleted) return;

                // Specular reflection glint sliding across typography
                if (heroMetallicGlint) heroMetallicGlint.classList.add('sliding');

                // Simultaneously begin typing role
                heroMainRole.style.transition = 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
                heroMainRole.style.opacity = '1';

                let i = 0;
                function typePart1() {
                    if (introCompleted) return;
                    if (rolePart1 && i < part1Text.length) {
                        rolePart1.textContent += part1Text[i];
                        i++;
                        setTimeout(typePart1, 26);
                    } else {
                        if (roleSep) roleSep.style.display = 'inline';
                        let j = 0;
                        setTimeout(function typePart2() {
                            if (introCompleted) return;
                            if (roleAccent && j < part2Text.length) {
                                roleAccent.textContent += part2Text[j];
                                j++;
                                setTimeout(typePart2, 26);
                            } else {
                                // Typing complete: hide cursor smoothly
                                if (roleCursor) {
                                    roleCursor.style.opacity = '0';
                                    setTimeout(() => { if (roleCursor) roleCursor.style.display = 'none'; }, 280);
                                }

                                // 3. Pause for reading, then smoothly glide to resting position on the LEFT side
                                setTimeout(() => {
                                    startMoveToLeftColumn();
                                }, 550);
                            }
                        }, 70);
                    }
                }

                typePart1();
            }, 450);
        }, 320);

        function startMoveToLeftColumn() {
            if (introCompleted) return;

            // Smooth glide from center to left column resting position
            const glideDuration = 'transform 1.35s cubic-bezier(0.16, 1, 0.3, 1)';
            heroNameContainer.style.transition = glideDuration;
            heroMainRole.style.transition = glideDuration;
            heroNameContainer.style.transform = 'translate3d(0, 0, 0) scale(1)';
            heroMainRole.style.transform = 'translate3d(0, 0, 0)';

            // Curtain dissolves revealing background
            if (introCurtain) introCurtain.style.opacity = '0';

            // Softly fade backlight aura
            if (heroNameAura) {
                heroNameAura.style.transition = 'opacity 1.4s ease';
                heroNameAura.style.opacity = '0';
            }

            // Stagger in surrounding hero elements on the left & right
            if (heroContent) heroContent.classList.add('hero-entered');
            if (heroSection) heroSection.classList.add('revealed');

            // 4. Picture's OWN INTRO: As left side settles, laser line draws across picture and role unfolds!
            setTimeout(() => {
                if (portraitLineEmitter) portraitLineEmitter.classList.add('line-ignited');
                setTimeout(() => {
                    if (portraitRoleDrawer) portraitRoleDrawer.classList.add('drawer-open');
                }, 350);
            }, 600);

            // Clean up intro transition styles
            setTimeout(() => {
                introCompleted = true;
                heroNameContainer.style.transition = '';
                heroMainRole.style.transition = '';
                heroNameContainer.style.transform = '';
                heroMainRole.style.transform = '';
                heroNameContainer.style.zIndex = '';
                heroMainRole.style.zIndex = '';
                if (heroMetallicGlint) heroMetallicGlint.style.display = 'none';
                document.body.classList.remove('intro-active');
                if (introCurtain) introCurtain.style.display = 'none';
            }, 1450);
        }
    } else {
        if (rolePart1) rolePart1.textContent = 'Full-Stack Developer';
        if (roleSep) roleSep.style.display = 'inline';
        if (roleAccent) roleAccent.textContent = 'Software Engineer';
        if (roleCursor) roleCursor.style.display = 'none';
        if (portraitLineEmitter) portraitLineEmitter.classList.add('line-ignited');
        if (portraitRoleDrawer) portraitRoleDrawer.classList.add('drawer-open');
        if (heroSection) heroSection.classList.add('revealed');
        if (heroContent) heroContent.classList.add('hero-entered');
    }

    // ==========================================================================
    // 1C. HERO PORTRAIT 3D MOUSE TILT CONTROLLER
    // ==========================================================================
    const portraitContainer = document.getElementById('hero-portrait-container');
    const heroSecElem = document.getElementById('hero');

    if (portraitContainer) {
        let currentRotX = 0;
        let currentRotY = 0;
        let currentScale = 1;
        let targetRotX = 0;
        let targetRotY = 0;
        let targetScale = 1;
        let isDirectlyHovering = false;
        let tiltRafId = null;

        function updatePortraitTiltPhysics() {
            const lerpFactor = isDirectlyHovering ? 0.14 : 0.08;
            currentRotX += (targetRotX - currentRotX) * lerpFactor;
            currentRotY += (targetRotY - currentRotY) * lerpFactor;
            currentScale += (targetScale - currentScale) * lerpFactor;

            portraitContainer.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale3d(${currentScale.toFixed(3)}, ${currentScale.toFixed(3)}, ${currentScale.toFixed(3)})`;

            const diff = Math.abs(targetRotX - currentRotX) + Math.abs(targetRotY - currentRotY) + Math.abs(targetScale - currentScale);
            if (diff > 0.005 || isDirectlyHovering) {
                tiltRafId = requestAnimationFrame(updatePortraitTiltPhysics);
            } else {
                tiltRafId = null;
                if (!isDirectlyHovering) {
                    portraitContainer.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                }
            }
        }

        function triggerTiltFrame() {
            if (!tiltRafId) {
                tiltRafId = requestAnimationFrame(updatePortraitTiltPhysics);
            }
        }

        // Direct hover on portrait: high-amplitude 3D tilt
        portraitContainer.addEventListener('mouseenter', () => {
            if (document.body.classList.contains('intro-active')) return;
            isDirectlyHovering = true;
            targetScale = 1.05;
            triggerTiltFrame();
        });

        portraitContainer.addEventListener('mousemove', (e) => {
            if (document.body.classList.contains('intro-active')) return;
            isDirectlyHovering = true;
            const rect = portraitContainer.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const normX = (e.clientX - centerX) / (rect.width / 2);
            const normY = (e.clientY - centerY) / (rect.height / 2);

            const maxTilt = 20;
            targetRotX = Math.max(-maxTilt, Math.min(maxTilt, -normY * maxTilt));
            targetRotY = Math.max(-maxTilt, Math.min(maxTilt, normX * maxTilt));
            targetScale = 1.05;

            triggerTiltFrame();
        });

        portraitContainer.addEventListener('mouseleave', () => {
            isDirectlyHovering = false;
            targetRotX = 0;
            targetRotY = 0;
            targetScale = 1;
            triggerTiltFrame();
        });

        // Ambient mouse parallax tracking across the hero section
        if (heroSecElem) {
            heroSecElem.addEventListener('mousemove', (e) => {
                if (document.body.classList.contains('intro-active') || isDirectlyHovering) return;
                const rect = portraitContainer.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
                const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

                const maxAmbientTilt = 7;
                targetRotX = Math.max(-maxAmbientTilt, Math.min(maxAmbientTilt, -deltaY * maxAmbientTilt));
                targetRotY = Math.max(-maxAmbientTilt, Math.min(maxAmbientTilt, deltaX * maxAmbientTilt));
                targetScale = 1.0;

                triggerTiltFrame();
            });

            heroSecElem.addEventListener('mouseleave', () => {
                if (isDirectlyHovering) return;
                targetRotX = 0;
                targetRotY = 0;
                targetScale = 1;
                triggerTiltFrame();
            });
        }

        // Mobile touch support
        portraitContainer.addEventListener('touchmove', (e) => {
            if (document.body.classList.contains('intro-active')) return;
            if (e.touches && e.touches.length > 0) {
                isDirectlyHovering = true;
                const touch = e.touches[0];
                const rect = portraitContainer.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const normX = (touch.clientX - centerX) / (rect.width / 2);
                const normY = (touch.clientY - centerY) / (rect.height / 2);

                const maxTilt = 15;
                targetRotX = Math.max(-maxTilt, Math.min(maxTilt, -normY * maxTilt));
                targetRotY = Math.max(-maxTilt, Math.min(maxTilt, normX * maxTilt));
                targetScale = 1.03;

                triggerTiltFrame();
            }
        }, { passive: true });

        portraitContainer.addEventListener('touchend', () => {
            isDirectlyHovering = false;
            targetRotX = 0;
            targetRotY = 0;
            targetScale = 1;
            triggerTiltFrame();
        });
    }

    // ==========================================================================
    // 2. REACT BITS SCANNER WEBGL BACKGROUND (HERO SECTION)
    // ==========================================================================
    let scannerInstance = null;
    let currentThemeMode = localStorage.getItem('portfolio_theme') || 'dark';

    function initScannerBackground() {
        const scannerContainer = document.getElementById('hero-scanner-container');
        if (!scannerContainer || typeof Scanner === 'undefined') return;

        // Props specified from React Bits <Scanner /> component
        scannerInstance = Scanner.init(scannerContainer, {
            color1: '#5227FF',
            color2: '#FF9FFC',
            color3: '#FFFFFF',
            speed: 0.5,
            sweepSpeed: 0.25,
            sweepWidth: 1.6,
            sweepFalloff: 6,
            scale: 1.5,
            frequency: 2,
            ripple: 0.22,
            bandDensity: 11,
            lineSharpness: 5.5,
            glow: 0.22,
            scanDirection: 'vertical',
            colorSpread: 0.7,
            brightness: 1.0,
            contrast: 1.15,
            softness: 1.4,
            vignette: 0.45,
            scanline: true,
            grain: true,
            grainIntensity: 0.05,
            opacity: 1.0,
            mouseInteraction: true,
            mouseRadius: 0.5,
            mouseStrength: 0.5
        });
    }

    initScannerBackground();

    // ==========================================================================
    // 3. CYBER GLITCH-DECIPHER TYPING EFFECT ON SECTION HEADERS
    // ==========================================================================
    const GLITCH_GLYPHS = '0123456789ABCDEF$#@%&*+-/<>~!?';

    function glitchDecipher(element, targetText, duration = 650) {
        if (!element || element.dataset.deciphering === 'true') return;
        element.dataset.deciphering = 'true';

        // Clean raw HTML entities if present in attributes so characters align 1:1
        const rawText = targetText || element.getAttribute('data-text') || element.textContent;
        const originalText = rawText.replace(/&amp;/g, '&').trim();
        const totalSteps = 22;
        const stepInterval = Math.max(16, Math.floor(duration / totalSteps));
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / totalSteps;
            const revealedLength = Math.floor(progress * originalText.length);

            let output = '';
            for (let i = 0; i < originalText.length; i++) {
                const char = originalText[i];
                // CRITICAL: Whitespace is ALWAYS preserved as a non-collapsing space
                // so text never gets compressed or snaps layout during glitching
                if (char === ' ') {
                    output += '<span class="decipher-char decipher-space">&nbsp;</span>';
                } else if (i < revealedLength) {
                    output += `<span class="decipher-char">${char}</span>`;
                } else {
                    const randomGlyph = GLITCH_GLYPHS[Math.floor(Math.random() * GLITCH_GLYPHS.length)];
                    output += `<span class="decipher-char decipher-scrambled">${randomGlyph}</span>`;
                }
            }

            element.innerHTML = output;

            if (currentStep >= totalSteps) {
                clearInterval(timer);
                element.textContent = originalText;
                element.dataset.deciphering = 'false';
            }
        }, stepInterval);
    }

    // Initialize Decipher On Scroll & Hover
    const glitchElements = document.querySelectorAll('.cyber-glitch-text');

    const glitchObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.getAttribute('data-text') || target.textContent.trim();
                glitchDecipher(target, text);
            }
        });
    }, { threshold: 0.4 });

    glitchElements.forEach(el => {
        glitchObserver.observe(el);
        el.addEventListener('mouseenter', () => {
            const text = el.getAttribute('data-text') || el.textContent.trim();
            glitchDecipher(el, text, 500);
        });
    });

    // ==========================================================================
    // 3B. GOOGLE AI STUDIO FROSTED GLASS MOUSE-TRACKING SPOTLIGHT
    // ==========================================================================
    document.addEventListener('pointermove', (e) => {
        // Performance optimization: skip moving carousel cards to prevent layout thrashing
        if (e.target.closest('.carousel-card')) return;

        const card = e.target.closest('.glass-card, .pill-card, .contact-horizontal-card, .modal-screenshot-container');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    }, { passive: true });

    document.addEventListener('pointerout', (e) => {
        const card = e.target.closest('.glass-card, .pill-card, .contact-horizontal-card, .modal-screenshot-container');
        if (card && (!e.relatedTarget || !card.contains(e.relatedTarget))) {
            card.style.removeProperty('--mouse-x');
            card.style.removeProperty('--mouse-y');
        }
    }, { passive: true });

    // ==========================================================================
    // 3C. INTERACTIVE TECH STACK LOGO MATRIX WITH IN-BOX 10-BAR FILLING ANIMATION
    // ==========================================================================
    function initStackHighlightBox() {
        const gridWrapper = document.getElementById('stack-grid-wrapper');
        const highlightBox = document.getElementById('stack-highlight-box');
        const stackCells = document.querySelectorAll('.stack-square-cell');
        const filterTabs = document.querySelectorAll('.stack-filter-tab');

        if (!gridWrapper || !highlightBox || stackCells.length === 0) return;

        let activeCell = null;
        let isHovered = false;
        let activeBarTimers = [];

        function clearBarTimers() {
            activeBarTimers.forEach(t => clearTimeout(t));
            activeBarTimers = [];
        }

        function resetCellMeter(cell) {
            if (!cell) return;
            cell.classList.remove('is-hovered');
            const segments = cell.querySelectorAll('.level-bar-segment');
            segments.forEach(seg => seg.classList.remove('is-filled'));
            const levelEl = cell.querySelector('.stack-cell-level');
            const target = cell.getAttribute('data-level') || '8';
            if (levelEl) {
                levelEl.textContent = `Level ${target}/10`;
            }
        }

        function animateCellMeter(cell) {
            clearBarTimers();

            const segments = cell.querySelectorAll('.level-bar-segment');
            const levelEl = cell.querySelector('.stack-cell-level');
            const target = Math.max(1, Math.min(10, parseInt(cell.getAttribute('data-level'), 10) || 8));

            // Reset segments in this cell
            segments.forEach(seg => seg.classList.remove('is-filled'));
            if (levelEl) levelEl.textContent = 'Level 0/10';

            // Sequential progressive bar-by-bar fill from bottom to top
            for (let i = 0; i < target; i++) {
                const timer = setTimeout(() => {
                    if (segments[i]) {
                        segments[i].classList.add('is-filled');
                    }
                    if (levelEl) {
                        levelEl.textContent = `Level ${i + 1}/10`;
                    }
                }, i * 26); // 26ms stagger = 260ms for 10 bars
                activeBarTimers.push(timer);
            }
        }

        function updateHighlightPosition(cell) {
            if (!cell || cell.classList.contains('is-dimmed') || cell.classList.contains('is-hidden')) {
                highlightBox.classList.remove('is-active');
                if (activeCell) resetCellMeter(activeCell);
                clearBarTimers();
                return;
            }

            if (activeCell && activeCell !== cell) {
                resetCellMeter(activeCell);
            }

            activeCell = cell;
            cell.classList.add('is-hovered');

            const wrapperRect = gridWrapper.getBoundingClientRect();
            const cellRect = cell.getBoundingClientRect();

            const cellLeft = cellRect.left - wrapperRect.left;
            const cellTop = cellRect.top - wrapperRect.top;
            const cellWidth = cellRect.width;
            const cellHeight = cellRect.height;

            highlightBox.style.width = `${cellWidth}px`;
            highlightBox.style.height = `${cellHeight}px`;
            highlightBox.style.transform = `translate3d(${cellLeft}px, ${cellTop}px, 0)`;
            highlightBox.classList.add('is-active');

            animateCellMeter(cell);
        }

        stackCells.forEach(cell => {
            cell.addEventListener('mouseenter', () => {
                isHovered = true;
                updateHighlightPosition(cell);
            });

            cell.addEventListener('focus', () => {
                isHovered = true;
                updateHighlightPosition(cell);
            });
        });

        gridWrapper.addEventListener('mouseleave', () => {
            isHovered = false;
            highlightBox.classList.remove('is-active');
            if (activeCell) {
                resetCellMeter(activeCell);
                activeCell = null;
            }
            clearBarTimers();
        });

        // Recalculate if window resizes or zoom changes
        window.addEventListener('resize', () => {
            if (isHovered && activeCell) {
                updateHighlightPosition(activeCell);
            }
        }, { passive: true });

        // Category Filter Tabs (dims non-matching cells so grid dividing lines remain intact)
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.getAttribute('data-filter');

                filterTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                // Hide highlight box during transition
                highlightBox.classList.remove('is-active');
                if (activeCell) resetCellMeter(activeCell);
                activeCell = null;
                isHovered = false;
                clearBarTimers();

                stackCells.forEach(cell => {
                    const cat = cell.getAttribute('data-category');
                    if (filter === 'all' || cat === filter) {
                        cell.classList.remove('is-dimmed');
                    } else {
                        cell.classList.add('is-dimmed');
                    }
                });
            });
        });
    }

    initStackHighlightBox();

    // ==========================================================================
    // 4. SMOOTH EASE-UP FADE-IN SECTION REVEALS (FIRST-TIME SCROLL HIGHLIGHT)
    // ==========================================================================
    const revealSections = document.querySelectorAll('.reveal-on-scroll');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                section.classList.add('revealed');

                // Trigger subtle high-tech decipher audio
                playSfx('decipher');

                // Trigger cyber glitch-decipher animation on section header if present
                const glitchHeader = section.querySelector('.cyber-glitch-text');
                if (glitchHeader) {
                    const text = glitchHeader.getAttribute('data-text') || glitchHeader.textContent.trim();
                    glitchDecipher(glitchHeader, text, 450);
                }

                // First time only - unobserve so the entrance transition highlights once
                observer.unobserve(section);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -50px 0px'
    });

    revealSections.forEach(sec => {
        // Hero is handled via the intro sequence
        if (sec.id !== 'hero') {
            revealObserver.observe(sec);
        }
    });

    // ==========================================================================
    // 5. THEME TOGGLE (COSMIC DARK / LIGHT SLATE)
    // ==========================================================================
    const themeToggleBtn = document.getElementById('theme-virus-toggle');
    const themeRippleOverlay = document.getElementById('theme-ripple-overlay');
    const htmlElem = document.documentElement;

    function applyTheme(theme) {
        htmlElem.setAttribute('data-theme', theme);
        localStorage.setItem('portfolio_theme', theme);
        currentThemeMode = theme;

        const label = themeToggleBtn ? themeToggleBtn.querySelector('.theme-label') : null;
        if (label) {
            label.textContent = (theme === 'dark') ? 'Cosmic Dark' : 'Light Slate';
        }

        // Update Scanner settings if initialized
        if (scannerInstance) {
            if (theme === 'light') {
                scannerInstance.setProps({
                    opacity: 0.85,
                    contrast: 1.25,
                    brightness: 0.95
                });
            } else {
                scannerInstance.setProps({
                    opacity: 1.0,
                    contrast: 1.15,
                    brightness: 1.0
                });
            }
        }
    }

    // Set Initial Theme
    applyTheme(currentThemeMode);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            playSfx('cyber');
            const newTheme = (currentThemeMode === 'dark') ? 'light' : 'dark';

            // Circular Wave Ripple Effect
            if (themeRippleOverlay) {
                const rect = themeToggleBtn.getBoundingClientRect();
                const originX = rect.left + rect.width / 2;
                const originY = rect.top + rect.height / 2;

                themeRippleOverlay.style.background = (newTheme === 'dark')
                    ? `radial-gradient(circle at ${originX}px ${originY}px, #05070c 0%, rgba(5,7,12,0.95) 70%, transparent 100%)`
                    : `radial-gradient(circle at ${originX}px ${originY}px, #f8fafc 0%, rgba(248,250,252,0.95) 70%, transparent 100%)`;

                themeRippleOverlay.style.opacity = '1';
                setTimeout(() => {
                    applyTheme(newTheme);
                    setTimeout(() => {
                        themeRippleOverlay.style.opacity = '0';
                    }, 200);
                }, 150);
            } else {
                applyTheme(newTheme);
            }
        });
    }

    // Mobile Navigation Drawer Toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            const isOpened = mainNav.classList.toggle('active');
            mobileMenuToggle.setAttribute('aria-expanded', isOpened ? 'true' : 'false');
        });

        document.querySelectorAll('.main-nav .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ==========================================================================
    // 6. ALL PROJECTS OVERLAY DIALOG & CATEGORY FILTERING
    // ==========================================================================
    const allProjectsDialog = document.getElementById('all-projects-dialog');
    const openAllProjectsBtn = document.getElementById('open-all-projects-btn');
    const closeOverlayBtn = document.getElementById('close-overlay-btn');
    const overlayCloseAction = document.getElementById('overlay-close-action');

    function applyProjectImageOrientations() {
        document.querySelectorAll('.project-media-img').forEach(img => {
            const check = () => {
                if (img.naturalHeight > img.naturalWidth) {
                    img.classList.add('portrait-img');
                    img.setAttribute('data-orientation', 'portrait');
                } else {
                    img.classList.remove('portrait-img');
                    img.setAttribute('data-orientation', 'landscape');
                }
            };
            if (img.complete && img.naturalWidth > 0) {
                check();
            } else {
                img.addEventListener('load', check);
            }
        });
    }
    applyProjectImageOrientations();

    if (openAllProjectsBtn && allProjectsDialog) {
        openAllProjectsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            applyProjectImageOrientations();
            allProjectsDialog.showModal();
            playSfx('click');
        });
    }

    if (closeOverlayBtn && allProjectsDialog) {
        closeOverlayBtn.addEventListener('click', () => {
            allProjectsDialog.close();
            playSfx('click');
        });
    }

    if (overlayCloseAction && allProjectsDialog) {
        overlayCloseAction.addEventListener('click', () => {
            allProjectsDialog.close();
            playSfx('click');
        });
    }

    if (allProjectsDialog) {
        allProjectsDialog.addEventListener('click', (e) => {
            if (e.target === allProjectsDialog) allProjectsDialog.close();
        });
    }

    // Category Filtering in Overlay
    const overlayFilterButtons = document.querySelectorAll('#all-projects-dialog .filter-btn');
    const overlayProjectCards = document.querySelectorAll('#all-projects-dialog .project-card');

    overlayFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            playSfx('click');
            overlayFilterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            overlayProjectCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ==========================================================================
    // 7. INTERACTIVE PROJECT DETAIL MODAL DIALOG (WITH MEDIA & VIDEO)
    // ==========================================================================
    const projectModal = document.getElementById('project-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalCloseAction = document.getElementById('modal-close-action');

    const projectData = {
        p1: {
            title: 'Fusion Rush: Gamified Boolean Logic & AI Tutoring',
            type: 'Scopus ICETT 2026 Paper',
            image: 'images/fusionrush.jpg',
            orientation: 'square',
            oneLiner: 'Gamified discrete math AI tutoring platform accepted at Scopus-indexed ICETT 2026.',
            problem: 'Students struggle with abstract inference rules and formal proof derivation in Discrete Mathematics, leading to steep learning curves and high disengagement in fundamental computing courses.',
            goal: 'Provide an adaptive, gamified AI tutor that reinforces logical deduction through interactive levels, instant rule feedback, and intelligent hint generation.',
            contributions: 'Lead Researcher, Algorithm Architect & Full-Stack Developer',
            techStack: ['Python', 'FastAPI', 'AI Reasoning Engine', 'Discrete Math Parser', 'Web Frontend'],
            links: [
                { label: 'Conference Acceptance', url: 'https://icett.org/' }
            ]
        },
        p2: {
            title: 'Visual AI Logic Proof Parser & Evaluator',
            type: 'PCSC 2026 Davao Presentation',
            image: 'images/visualai.jpg',
            orientation: 'square',
            oneLiner: 'Computer vision model scanning and scoring handwritten discrete math proofs.',
            problem: 'Manual verification and grading of student handwritten discrete math proofs is time-consuming, prone to human inconsistency, and provides delayed feedback.',
            goal: 'Deliver a high-accuracy visual parsing pipeline using OCR and AST-based logical rule verification to scan, evaluate, and provide step-by-step scoring of handwritten proofs.',
            contributions: 'Lead Computer Vision Researcher & Presenter (PCSC 2026, Davao City)',
            techStack: ['Python', 'OpenCV', 'PyTorch', 'OCR Engine', 'AST Parser', 'Flask'],
            links: [
                { label: 'PCSC 2026 Congress', url: 'https://csp.org.ph/pcsc2026' }
            ]
        },
        p9: {
            title: 'Refertoire — Sheet Music Repertoire Manager',
            type: 'Freelance Offline-First App',
            image: 'images/refertoire.jpg',
            orientation: 'landscape',
            oneLiner: 'Keep your ensemble’s entire sheet music repertoire synced, organized, and available 100% offline.',
            problem: 'Choral ensembles and orchestras frequently perform in remote acoustic venues lacking dependable Wi-Fi, leaving musicians stranded when digital music sheets fail to download.',
            goal: 'Provide a resilient offline-first PWA with IndexedDB local caching, instant search across gigabytes of scores, and Bluetooth foot-pedal page turning support.',
            contributions: 'Lead Full-Stack Engineer & Audio Tech Architect',
            techStack: ['Offline-First', 'PWA', 'IndexedDB', 'Service Workers', 'Vanilla JS', 'Tailwind']
        },
        p8: {
            title: 'Nexchef — Live Cooking & Recipe Platform',
            type: 'Freelance Mobile App',
            image: 'images/nexchef.png',
            orientation: 'portrait',
            oneLiner: 'Mobile app allowing users to share recipes and record live steps with synchronized timers.',
            problem: 'Home cooks struggle to juggle multiple recipe timers while following written instructions with messy hands, leading to overcooked food and frustrating culinary workflows.',
            goal: 'Design an intuitive mobile culinary interface featuring concurrent recipe step timers, audio milestone alerts, and interactive community recipe fork trees.',
            contributions: 'Mobile Architect & UI/UX Lead',
            techStack: ['Mobile App', 'Live Timers', 'UI/UX Design', 'React Native / Mobile UI']
        },
        p3: {
            title: 'TakeIt: Event Management & Ticketing',
            type: 'Freelance Web App',
            image: 'images/takeit.png',
            orientation: 'portrait',
            oneLiner: 'End-to-end event management and ticketing platform ensuring smooth booking workflows.',
            problem: 'Local event organizers face high intermediary ticketing commission fees and clunky manual badge validation at entry gates.',
            goal: 'Deliver a scalable direct-to-consumer ticketing web application featuring instant cryptographic QR ticket generation, real-time ticket scanning, and financial reporting.',
            contributions: 'Full-Stack Developer',
            techStack: ['React', 'Node.js', 'Express', 'SQL', 'QR Verification', 'REST API']
        },
        p4: {
            title: 'DishCover: Smart Pantry & Food Tracker',
            type: 'Pantry & Inventory App',
            image: 'images/dishcover.png',
            orientation: 'portrait',
            oneLiner: 'Smart pantry management app enabling users to track expiration dates and prevent food waste.',
            problem: 'Households waste hundreds of dollars each month throwing away expired groceries due to poor visibility into pantry inventory.',
            goal: 'Create an intelligent grocery inventory app tracking shelf-life dates, sending automated push notifications before expiration, and recommending recipes based on available ingredients.',
            contributions: 'Full-Stack Developer & UI Designer',
            techStack: ['JavaScript', 'HTML5', 'CSS3', 'Local Storage', 'Notification APIs']
        },
        p5: {
            title: 'CropConnect: Direct Farmer Fresh Produce',
            type: 'AgriTech Marketplace',
            image: 'images/cropconnect.png',
            orientation: 'portrait',
            oneLiner: 'Fresh produce e-commerce app connecting farmers directly to consumers with fair pricing.',
            problem: 'Agricultural smallholders lose substantial margins to multi-layered middlemen while consumers face inflated prices for non-fresh produce.',
            goal: 'Architect a transparent direct-to-consumer marketplace with automated logistics scheduling, farm gate pricing transparency, and produce quality verification.',
            contributions: 'Backend Lead & Full-Stack Developer',
            techStack: ['Django', 'Python', 'PostgreSQL', 'Tailwind CSS', 'REST APIs']
        },
        p6: {
            title: 'Bomberman BattleRoyale: Java PvP',
            type: 'Java Multiplayer Game',
            image: 'images/bomberman.png',
            orientation: 'square',
            oneLiner: 'Real-time multiplayer arcade game in Java featuring multi-threaded sockets and shrinking battle zones.',
            problem: 'Engineering network games with concurrent client loops often encounters thread contention, desynchronized entity state, and packet stutter under jittery network conditions.',
            goal: 'Demonstrate fundamental multithreaded systems programming and object-oriented design patterns by building a low-latency TCP/UDP client-server game with predictive arena shrinking and collision physics.',
            contributions: 'Game Architect & Network Engineer',
            techStack: ['Java', 'Multithreading', 'Sockets (TCP/UDP)', 'Swing', 'OOP Design Patterns']
        }
    };

    let activeModalProject = null;
    const modalMediaContainer = document.getElementById('modal-project-media');
    const modalCaseStudyContainer = document.getElementById('modal-case-study');
    const tabBtnPreview = document.getElementById('tab-btn-preview');
    const tabBtnCaseStudy = document.getElementById('tab-btn-casestudy');

    function switchModalTab(tabName) {
        if (!modalMediaContainer || !modalCaseStudyContainer) return;
        if (tabName === 'preview') {
            modalMediaContainer.classList.add('active');
            modalMediaContainer.style.display = 'flex';
            modalCaseStudyContainer.classList.remove('active');
            modalCaseStudyContainer.style.display = 'none';
            if (tabBtnPreview) tabBtnPreview.classList.add('active');
            if (tabBtnCaseStudy) tabBtnCaseStudy.classList.remove('active');
        } else {
            modalMediaContainer.classList.remove('active');
            modalMediaContainer.style.display = 'none';
            modalCaseStudyContainer.classList.add('active');
            modalCaseStudyContainer.style.display = 'block';
            if (tabBtnPreview) tabBtnPreview.classList.remove('active');
            if (tabBtnCaseStudy) tabBtnCaseStudy.classList.add('active');
        }
    }

    if (tabBtnPreview) {
        tabBtnPreview.addEventListener('click', () => switchModalTab('preview'));
    }
    if (tabBtnCaseStudy) {
        tabBtnCaseStudy.addEventListener('click', () => switchModalTab('casestudy'));
    }

    function openProjectModal(projectId) {
        const data = projectData[projectId];
        if (!data || !projectModal) return;

        activeModalProject = data;

        const modalContainer = projectModal.querySelector('.modal-screenshot-container');
        const initialOrient = data.orientation || 'portrait';
        if (modalContainer) {
            modalContainer.setAttribute('data-orientation', initialOrient);
        }

        const typeBadge = document.getElementById('modal-project-type');
        const titleHeading = document.getElementById('modal-project-title');
        if (typeBadge) typeBadge.textContent = data.type;
        if (titleHeading) titleHeading.textContent = data.title;

        // Populate Screenshot Preview Tab
        if (modalMediaContainer && data.image) {
            modalMediaContainer.innerHTML = `
                <img src="${data.image}" 
                     alt="${data.title} Screenshot" 
                     class="modal-screenshot-img ${initialOrient}-screenshot" 
                     data-orientation="${initialOrient}">
            `;

            const img = modalMediaContainer.querySelector('img');
            if (img) {
                const applyOrientation = () => {
                    const ratio = img.naturalWidth / img.naturalHeight;
                    let orient = 'landscape';
                    if (ratio < 0.78) {
                        orient = 'portrait';
                    } else if (ratio >= 0.78 && ratio <= 1.18) {
                        orient = 'square';
                    } else {
                        orient = 'landscape';
                    }
                    img.className = `modal-screenshot-img ${orient}-screenshot`;
                    img.setAttribute('data-orientation', orient);
                    if (modalContainer) {
                        modalContainer.setAttribute('data-orientation', orient);
                    }
                };

                if (img.complete && img.naturalWidth > 0) {
                    applyOrientation();
                } else {
                    img.onload = applyOrientation;
                }
            }
        }

        // Populate Architectural Case Study Tab
        if (modalCaseStudyContainer) {
            modalCaseStudyContainer.innerHTML = `
                <div class="case-study-block">
                    <span class="case-study-label">
                        <svg style="width:14px;height:14px;fill:currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        Problem Statement
                    </span>
                    <p class="case-study-text">${data.problem || data.oneLiner}</p>
                </div>

                <div class="case-study-block">
                    <span class="case-study-label">
                        <svg style="width:14px;height:14px;fill:currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>
                        Engineering Objective &amp; Architecture
                    </span>
                    <p class="case-study-text">${data.goal || data.oneLiner}</p>
                </div>

                <div class="case-study-block">
                    <span class="case-study-label">
                        <svg style="width:14px;height:14px;fill:currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9z"/></svg>
                        Core Technologies &amp; Tooling
                    </span>
                    <div class="case-study-tech-pills">
                        ${(data.techStack || []).map(t => `<span class="tech-badge">${t}</span>`).join('')}
                    </div>
                </div>

                <div class="case-study-block">
                    <span class="case-study-label">
                        <svg style="width:14px;height:14px;fill:currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        Engineering Role &amp; Contributions
                    </span>
                    <p class="case-study-text">${data.contributions || 'Lead Systems Architect & Full-Stack Developer'}</p>
                </div>

                ${(data.links && data.links.length > 0) ? `
                <div class="case-study-actions">
                    ${data.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="btn-hero-primary" style="padding: 6px 16px; font-size: 0.8rem;"><span>${l.label} ↗</span></a>`).join('')}
                </div>` : ''}
            `;
        }

        // Reset to preview tab on open
        switchModalTab('preview');

        if (!projectModal.open) {
            projectModal.showModal();
        }
    }

    if (closeModalBtn && projectModal) {
        closeModalBtn.addEventListener('click', () => {
            projectModal.close();
            playSfx('click');
        });
    }

    if (modalCloseAction && projectModal) {
        modalCloseAction.addEventListener('click', () => {
            projectModal.close();
            playSfx('click');
        });
    }

    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                projectModal.close();
                playSfx('click');
            }
        });
    }

    // ==========================================================================
    // 8. ONE-CLICK EMAIL COPY & TOOLTIP
    // ==========================================================================
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const copyBtnText = document.getElementById('copy-btn-text');

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            playSfx('click');
            const email = 'roddneilgemina@gmail.com';
            navigator.clipboard.writeText(email).then(() => {
                if (copyBtnText) {
                    copyBtnText.textContent = 'Copied!';
                    copyEmailBtn.style.borderColor = 'var(--color-cyan)';
                    copyEmailBtn.style.color = 'var(--color-cyan)';
                    setTimeout(() => {
                        copyBtnText.textContent = 'Copy';
                        copyEmailBtn.style.borderColor = '';
                        copyEmailBtn.style.color = '';
                    }, 2200);
                }
            }).catch(() => {
                prompt('Copy this email:', email);
            });
        });
    }

    // Dynamic Current Year in Footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ==========================================================================
    // 9. SECTION TRACKER (RIGHT-SIDE BLUE/CYAN BOOKMARKS)
    // ==========================================================================
    const trackerDots = document.querySelectorAll('.tracker-dot');
    const trackedSections = [
        document.getElementById('hero'),
        document.getElementById('projects'),
        document.getElementById('expertise'),
        document.getElementById('philosophy'),
        document.getElementById('experience'),
        document.getElementById('research'),
        document.getElementById('volunteering'),
        document.getElementById('contact')
    ].filter(Boolean);

    function updateActiveSectionMarker() {
        const scrollPosition = window.scrollY + window.innerHeight * 0.35;
        let currentSectionId = '';

        trackedSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        // Fallback for very bottom of the page
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 80) {
            currentSectionId = 'contact';
        } else if (!currentSectionId && window.scrollY < 300) {
            currentSectionId = 'hero';
        }

        if (currentSectionId) {
            document.documentElement.setAttribute('data-active-section', currentSectionId);

            trackerDots.forEach(dot => {
                if (dot.getAttribute('data-section') === currentSectionId) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            // Sync main navigation active links
            const navLinks = document.querySelectorAll('.main-nav .nav-link');
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === '#' + currentSectionId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }

    window.addEventListener('scroll', updateActiveSectionMarker, { passive: true });
    updateActiveSectionMarker();

    // Smooth scroll and sound on tracker dot click
    trackerDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            playSfx('click');
            const targetId = dot.getAttribute('data-section');
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                document.documentElement.setAttribute('data-active-section', targetId);
                targetEl.scrollIntoView({ behavior: 'smooth' });
                trackerDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            }
        });
    });

    // ==========================================================================
    // 10. PROJECT CAROUSEL MODAL CLICK & ACCESSIBILITY
    // ==========================================================================
    document.querySelectorAll('.open-modal-btn, #overlay-projects-grid .project-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const pId = btn.getAttribute('data-project') || btn.getAttribute('data-project-id');
            if (pId) openProjectModal(pId);
        });

        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const pId = btn.getAttribute('data-project') || btn.getAttribute('data-project-id');
                if (pId) openProjectModal(pId);
            }
        });
    });

});
