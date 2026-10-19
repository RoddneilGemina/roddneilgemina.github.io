/**
 * RODDNEIL B. GEMINA: DEEP COSMIC BLACK & LUMINOUS CYAN PORTFOLIO ENGINE (js/main.js)
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
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // ==========================================================================
    // 1. SOUND EFFECTS DISABLED (Per user preference)
    // ==========================================================================
    function playSfx() {
        // Audio permanently disabled
    }

    // ==========================================================================
    // 1B. HERO DIRECT DISPLAY INITIALIZER (Intro Sequence Removed)
    // ==========================================================================
    const introCurtain = document.getElementById('intro-curtain-bg');
    if (introCurtain) {
        introCurtain.style.display = 'none';
        introCurtain.remove();
    }
    document.body.classList.remove('intro-active');
    document.body.classList.add('hero-entered');

    const heroNameContainer = document.getElementById('hero-name-container');
    const heroMetallicGlint = document.getElementById('hero-metallic-glint');
    const heroMainRole = document.getElementById('hero-main-role');
    const rolePart1 = document.getElementById('role-part1');
    const roleSep = document.getElementById('role-separator');
    const roleAccent = document.getElementById('role-accent');
    const roleCursor = document.getElementById('role-cursor');
    const rolePart1Glow = document.getElementById('role-part1-glow');
    const roleSepGlow = document.getElementById('role-separator-glow');
    const roleAccentGlow = document.getElementById('role-accent-glow');
    const heroSection = document.getElementById('hero');
    const heroContent = document.querySelector('.hero-split-grid') || document.querySelector('.hero-container');
    const portraitLineEmitter = document.getElementById('portrait-line-emitter');
    const portraitRoleDrawer = document.getElementById('portrait-role-drawer');

    if (rolePart1) rolePart1.textContent = 'Full-Stack Developer';
    if (rolePart1Glow) rolePart1Glow.textContent = 'Full-Stack Developer';
    if (roleSep) roleSep.style.display = 'inline';
    if (roleSepGlow) roleSepGlow.style.display = 'inline';
    if (roleAccent) roleAccent.textContent = 'Software Engineer';
    if (roleAccentGlow) roleAccentGlow.textContent = 'Software Engineer';
    if (roleCursor) roleCursor.style.display = 'none';
    if (heroMetallicGlint) heroMetallicGlint.style.display = 'none';
    if (portraitLineEmitter) portraitLineEmitter.classList.add('line-ignited');
    if (portraitRoleDrawer) portraitRoleDrawer.classList.add('drawer-open');
    if (heroSection) heroSection.classList.add('revealed');
    if (heroContent) heroContent.classList.add('hero-entered');
    if (heroNameContainer) {
        heroNameContainer.style.opacity = '1';
        heroNameContainer.style.transform = 'none';
        heroNameContainer.style.zIndex = '';
    }
    if (heroMainRole) {
        heroMainRole.style.opacity = '1';
        heroMainRole.style.transform = 'none';
        heroMainRole.style.zIndex = '';
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
    let currentThemeMode = 'dark';

    function initScannerBackground() {
        const scannerContainer = document.getElementById('hero-scanner-container');
        if (!scannerContainer || typeof Scanner === 'undefined') return;

        // Props specified from React Bits <Scanner /> component
        scannerInstance = Scanner.init(scannerContainer, {
            color1: '#7fa8ff',
            color2: '#edeae4',
            color3: '#374151',
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
    // 2B. REACT BITS DOTFIELD TACTILE TEXTURE OVERLAY
    // ==========================================================================
    let dotFieldInstance = null;

    function initDotFieldOverlay() {
        const dotFieldContainer = document.getElementById('hero-dotfield-container') || document.getElementById('global-dotfield-container');
        if (!dotFieldContainer || typeof DotField === 'undefined') return;

        dotFieldInstance = DotField.init(dotFieldContainer, {
            dotRadius: 1.2,
            dotSpacing: 16,
            cursorRadius: 280,
            cursorForce: 0.1,
            bulgeOnly: true,
            bulgeStrength: 52,
            glowRadius: 160,
            sparkle: false,
            waveAmplitude: 0,
            gradientFrom: 'rgba(127, 168, 255, 0.22)',
            gradientTo: 'rgba(237, 234, 228, 0.08)',
            glowColor: 'rgba(127, 168, 255, 0.12)'
        });
    }

    initDotFieldOverlay();

    // ==========================================================================
    // 2C. REACT BITS GRADIENT ASCII BACKGROUND (TECH PROFICIENCY SECTION)
    // ==========================================================================
    let techGradientASCIIInstance = null;

    function initTechGradientASCII() {
        const asciiContainer = document.getElementById('tech-gradient-ascii');
        if (!asciiContainer || typeof GradientASCII === 'undefined') return;

        // If already initialized by auto-init, store reference
        if (asciiContainer._gradientASCIIInstance) {
            techGradientASCIIInstance = asciiContainer._gradientASCIIInstance;
            return;
        }

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';

        techGradientASCIIInstance = GradientASCII.init(asciiContainer, {
            colors: ['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8'],
            shape: 'horizon',
            characters: ' =+xX0S8#@',
            cellSize: 18,
            density: 0.8,
            glyphOpacity: 0.85,
            glow: 0.25,
            depthOfField: 0,
            flicker: 0.2,
            softness: 0.5,
            scale: 1,
            flow: 0.5,
            speed: 1,
            gradientOpacity: 0.85,
            grain: 0.08,
            variation: 0,
            mouseInteraction: true,
            scrambleRadius: 0.1,
            clickEffect: 'wave',
            intro: true,
            lightMode: isLight,
            fontFamily: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
        });
        asciiContainer._gradientASCIIInstance = techGradientASCIIInstance;
    }

    initTechGradientASCII();

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
    // 3C. REACT BITS LOGOLOOP INITIALIZATION FOR TECH STACKS
    // ==========================================================================
    let logoLoopInstances = [];

    function initStackLogoLoops() {
        if (typeof LogoLoop === 'undefined') return;
        logoLoopInstances = LogoLoop.initAll('[data-logoloop="true"]');
    }

    initStackLogoLoops();

    // ==========================================================================
    // 4. SECTION VISIBILITY (INTRO ANIMATIONS REMOVED - FULLY VISIBLE ON LOAD)
    // ==========================================================================
    const revealSections = document.querySelectorAll(".reveal-on-scroll");
    revealSections.forEach(sec => {
        sec.classList.add("revealed");
    });

    // ==========================================================================
    // 5. THEME (COSMIC DARK LOCKED)
    // ==========================================================================
    const htmlElem = document.documentElement;
    htmlElem.setAttribute('data-theme', 'dark');
    localStorage.setItem('portfolio_theme', 'dark');
    currentThemeMode = 'dark';

    // ==========================================================================
    // 5B. FLUID NAVBAR SCROLL STATE & TRANSITIONS
    // ==========================================================================
    function initNavbarScrollState() {
        const siteHeader = document.querySelector('.site-header');
        if (!siteHeader) return;

        let ticking = false;
        const SCROLL_THRESHOLD = 20;

        function updateHeaderState() {
            const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            if (currentScrollY > SCROLL_THRESHOLD) {
                if (!siteHeader.classList.contains('scrolled')) {
                    siteHeader.classList.add('scrolled');
                }
            } else {
                if (siteHeader.classList.contains('scrolled')) {
                    siteHeader.classList.remove('scrolled');
                }
            }
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeaderState);
                ticking = true;
            }
        }, { passive: true });

        // Initial check on load
        updateHeaderState();
    }
    initNavbarScrollState();

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
            title: 'ICETT 2026: Fusion Rush AI Reasoning Tutor',
            type: 'Scopus Indexed Conference Paper (Singapore)',
            image: 'images/fusionrush.jpg',
            orientation: 'square',
            oneLiner: '14th International Conference on Educational and Information Technology (ICETT 2026, Singapore).',
            problem: 'Students struggle with abstract inference rules and formal proof derivation in Discrete Mathematics, leading to steep learning curves and high disengagement in fundamental computing courses.',
            goal: 'Provide an adaptive, gamified AI tutor that reinforces logical deduction through interactive levels, instant rule feedback, and intelligent hint generation.',
            contributions: 'Lead Researcher, Algorithm Architect & Full-Stack Developer',
            techStack: ['Python', 'FastAPI', 'AI Reasoning Engine', 'Discrete Math Parser', 'Web Frontend'],
            links: [
                { label: 'Conference Acceptance', url: 'https://icett.org/' }
            ]
        },
        p2: {
            title: 'PCSC 2026: Visual AI Logic Proof Parser',
            type: '26th Philippine Computing Science Congress Presentation',
            image: 'images/visualai.jpg',
            orientation: 'square',
            oneLiner: '26th Philippine Computing Science Congress (PCSC 2026, Davao City).',
            problem: 'Manual verification and grading of student handwritten discrete math proofs is time-consuming, prone to human inconsistency, and provides delayed feedback.',
            goal: 'Deliver a high-accuracy visual parsing pipeline using OCR and AST-based logical rule verification to scan, evaluate, and provide step-by-step scoring of handwritten proofs.',
            contributions: 'Lead Computer Vision Researcher & Presenter (PCSC 2026, Davao City)',
            techStack: ['Python', 'OpenCV', 'PyTorch', 'OCR Engine', 'AST Parser', 'Flask'],
            links: [
                { label: 'PCSC 2026 Congress', url: 'https://csp.org.ph/pcsc2026' }
            ]
        },
        p9: {
            title: 'Refertoire: Ensemble Repertoire Syncing App',
            type: 'Freelance Offline-First PWA & Android',
            image: 'images/refertoire.png',
            orientation: 'landscape',
            oneLiner: 'Never Forget a Piece. 100% Offline Resilience for musical ensembles.',
            problem: 'Choral ensembles and orchestras frequently perform in remote acoustic venues lacking dependable Wi-Fi, leaving musicians stranded when digital music scores fail to load or download.',
            goal: 'Provide a resilient offline-first PWA and Android package with an in-app package installer, squish-free dual-container PDF reader, instant sync, and Bluetooth foot-pedal page turning support.',
            contributions: 'Lead Full-Stack Engineer & Audio Tech Architect',
            techStack: ['Offline-First', 'PWA', 'Android APK', 'IndexedDB', 'Service Workers', 'PDF Reader', 'Tailwind CSS']
        },
        p10: {
            title: 'GigiPOS: Modern Multi-Branch Retail Platform',
            type: 'Enterprise Retail POS SaaS',
            image: 'images/gigipos.png',
            orientation: 'landscape',
            oneLiner: 'Run smarter retail with one unified dashboard for sales, inventory, and teams.',
            problem: 'Retail businesses operating across multiple brick-and-mortar branches suffer from fragmented inventory records, slow checkout bottlenecks, and lack of real-time multi-branch visibility.',
            goal: 'Architect an ultra-fast point of sale platform supporting 120+ branches with a 35s average checkout speed, 99.9% uptime SLA, and real-time branch synchronization.',
            contributions: 'Platform Architect & Full-Stack Developer',
            techStack: ['React', 'Node.js', 'PostgreSQL', 'Multi-Branch Sync', 'Redis', 'REST APIs', 'Cloud Architecture']
        },
        p11: {
            title: 'WhatSwap?!: Dynamic P2P Barter & Auction Marketplace',
            type: 'P2P Marketplace & Real-Time Auctions',
            image: 'images/whatswap.png',
            orientation: 'landscape',
            oneLiner: 'Discover a world of opportunities to trade, bid, and connect with unique items and effortless exchanges.',
            problem: 'Traditional e-commerce platforms force users into pure monetary transactions, leaving collectors and traders without a trusted ecosystem for item-to-item barter and dynamic bidding.',
            goal: 'Engineer an interactive trade and auction marketplace featuring multi-party barter negotiations, real-time socket bidding, and verified escrow transaction security.',
            contributions: 'Full-Stack Engineer & Systems Designer',
            techStack: ['Web App', 'Real-Time Auctions', 'WebSockets', 'P2P Barter Logic', 'PostgreSQL', 'Node.js', 'Express']
        },
        p12: {
            title: 'aicquire: AI-Powered Applicant Tracking System',
            type: 'HR Tech & Candidate Matching Platform',
            image: 'images/aicquire.png',
            orientation: 'landscape',
            oneLiner: 'The modern way of hiring: AI-driven applicant tracking, semantic matching, and streamlined workflows.',
            problem: 'Recruiting teams are overwhelmed by thousands of unstructured applicant resumes, resulting in sluggish hiring cycles, recruiter burnout, and missed top-tier talent.',
            goal: 'Build an AI-native applicant tracking system with 94% semantic candidate match scoring, multi-stage drag-and-drop Kanban hiring boards, and automated interview scheduling workflows.',
            contributions: 'Lead Full-Stack Developer & AI Systems Engineer',
            techStack: ['AI Matching Engine', 'NLP / LLM Parsing', 'React', 'TypeScript', 'Node.js', 'Kanban Pipelines', 'REST API']
        },
        p13: {
            title: 'ResuTex: Autonomous ATS Resume Studio & Compiler',
            type: 'Autonomous ATS Resume Studio & Compiler',
            image: 'images/resutex.png',
            orientation: 'landscape',
            oneLiner: '100% ATS Parsability. Authentic LaTeX Typesetting paired with ReportLab Python compiler and Gemini 3.8 Flash intelligence.',
            problem: 'Modern job applicants get rejected by ATS parsers due to invisible formatting artifacts, complex table grids, and non-standard layouts generated by generic rich-text editors.',
            goal: 'Deliver an autonomous split-screen studio generating single-column Harvard/MIT standard resumes with zero formatting artifacts, sub-second Python compilation, and Gemini 3.8 Flash bullet polish.',
            contributions: 'Creator & Lead AI Engineer',
            techStack: ['Python', 'ReportLab Compiler', 'Gemini 3.8 Flash', 'LaTeX Generation', 'AST Parsing', 'Figma Design System']
        },
        p8: {
            title: 'Nexchef: Live Cooking & Recipe Platform',
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

        // Also populate dedicated fields in projects.html modal if present
        const modalImg = document.getElementById('modal-project-image');
        if (modalImg && data.image) {
            modalImg.src = data.image;
            modalImg.alt = data.title;
        }
        const modalDesc = document.getElementById('modal-project-desc');
        if (modalDesc) modalDesc.textContent = data.oneLiner || '';
        const modalProblem = document.getElementById('modal-project-problem');
        if (modalProblem) modalProblem.textContent = data.problem || '';
        const modalGoal = document.getElementById('modal-project-goal');
        if (modalGoal) modalGoal.textContent = data.goal || '';
        const modalRole = document.getElementById('modal-project-role');
        if (modalRole) modalRole.textContent = data.contributions || '';
        const modalStack = document.getElementById('modal-project-stack');
        if (modalStack) {
            modalStack.innerHTML = (data.techStack || []).map(t => `<span class="tech-badge">${t}</span>`).join('');
        }
        const modalLinks = document.getElementById('modal-project-links');
        if (modalLinks) {
            if (data.links && data.links.length > 0) {
                modalLinks.innerHTML = data.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="sleek-btn-sm"><span>${l.label} ↗</span></a>`).join('');
            } else {
                modalLinks.innerHTML = '<span class="meta-val" style="color:var(--text-muted);font-size:0.8rem;">Internal Artifact / Proprietary</span>';
            }
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
        const trackedSections = [
        document.getElementById('hero'),
        document.getElementById('projects'),
        document.getElementById('expertise'),
        document.getElementById('conferences'),
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

            // Sync main navigation active links if using hash anchors
            const navLinks = document.querySelectorAll('.main-nav .nav-link');
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    if (href === '#' + currentSectionId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                }
            });
        }
    }

    window.addEventListener('scroll', updateActiveSectionMarker, { passive: true });
    updateActiveSectionMarker();


    window.openProjectModal = openProjectModal;

    // Delegated click & accessibility handling for all project cards & buttons
    document.addEventListener('click', (e) => {
        // Ignore if clicking close button inside modal
        if (e.target.closest('.dialog-close-btn, #close-modal-btn, #modal-close-action')) return;
        
        const btn = e.target.closest('.open-modal-btn, [data-project], [data-project-id]');
        if (btn) {
            const pId = btn.getAttribute('data-project') || btn.getAttribute('data-project-id');
            if (pId) openProjectModal(pId);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const btn = e.target.closest('.open-modal-btn, [data-project], [data-project-id]');
            if (btn && document.activeElement === btn) {
                e.preventDefault();
                const pId = btn.getAttribute('data-project') || btn.getAttribute('data-project-id');
                if (pId) openProjectModal(pId);
            }
        }
    });

});

// ==========================================================================
// QUICK CONNECT FORM HANDLER (MINIMAL UNCLUTTERED SEND)
// ==========================================================================
window.handleQuickConnect = function(passedVal) {
    let val = (typeof passedVal === 'string' ? passedVal : '').trim();
    const curvedWidget = document.getElementById('quick-connect-curved');
    if (!val && curvedWidget && curvedWidget.__curvedInputInstance) {
        val = curvedWidget.__curvedInputInstance.getValue().trim();
    }
    const messageInput = document.getElementById('quick-message');
    if (!val && messageInput) {
        val = messageInput.value.trim();
    }

    const feedback = document.getElementById('quick-feedback');

    if (!val) {
        if (curvedWidget && curvedWidget.querySelector('input')) {
            curvedWidget.querySelector('input').focus();
        } else if (messageInput) {
            messageInput.focus();
        }
        return;
    }

    if (feedback) {
        feedback.style.display = 'block';
        feedback.innerHTML = '<strong>Message Dispatched!</strong> Thank you for reaching out. I\'ll get back to you shortly.';
        setTimeout(() => {
            feedback.style.display = 'none';
        }, 5000);
    }

    if (curvedWidget && curvedWidget.__curvedInputInstance) {
        curvedWidget.__curvedInputInstance.clear();
    }
    if (messageInput) {
        messageInput.value = '';
    }
};
