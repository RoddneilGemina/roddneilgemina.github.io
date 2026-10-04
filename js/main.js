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
    const heroNameAura = document.getElementById('hero-name-aura');
    const heroMetallicGlint = document.getElementById('hero-metallic-glint');
    const heroMainRole = document.getElementById('hero-main-role');
    const rolePart1 = document.getElementById('role-part1');
    const roleSep = document.getElementById('role-separator');
    const roleAccent = document.getElementById('role-accent');
    const roleCursor = document.getElementById('role-cursor');
    const heroSection = document.getElementById('hero');
    const heroContent = document.querySelector('.hero-centered-content');

    let introCompleted = false;

    if (introCurtain && heroNameContainer && heroMainRole) {
        document.body.classList.add('intro-active');
        window.scrollTo(0, 0);

        // Calculate offset to place the hero name and role vertically centered in the viewport
        const nameRect = heroNameContainer.getBoundingClientRect();
        const roleRect = heroMainRole.getBoundingClientRect();
        const viewportCenterY = window.innerHeight / 2;
        const nameCenterY = nameRect.top + (nameRect.height / 2);
        const centerOffsetY = Math.round(viewportCenterY - nameCenterY - 18);
        const roleIntroOffsetY = Math.round(centerOffsetY - (roleRect.top - (nameRect.bottom + 16)));

        // Position in center of pitch black screen above curtain (z-index: 9995)
        heroNameContainer.style.zIndex = '9995';
        heroMainRole.style.zIndex = '9995';
        heroNameContainer.style.transformOrigin = 'center center';
        heroNameContainer.style.transform = `translate3d(0, ${centerOffsetY}px, 0) scale(0.88)`;
        heroMainRole.style.transform = `translate3d(0, ${roleIntroOffsetY}px, 0)`;
        heroNameContainer.style.opacity = '0';
        heroMainRole.style.opacity = '0';

        // 1. Pitch-black void: Name fades and grows
        setTimeout(() => {
            if (introCompleted) return;
            // Name fades in and grows smoothly
            heroNameContainer.style.transition = 'opacity 1.25s cubic-bezier(0.16, 1, 0.3, 1), transform 1.25s cubic-bezier(0.16, 1, 0.3, 1)';
            heroNameContainer.style.opacity = '1';
            heroNameContainer.style.transform = `translate3d(0, ${centerOffsetY}px, 0) scale(1)`;
            if (heroNameAura) heroNameAura.classList.add('active');

            // 2. Metallic glint and typing of role/subtitle go together in tandem
            setTimeout(() => {
                if (introCompleted) return;

                // Trigger metallic reflection glint sliding across the name
                if (heroMetallicGlint) heroMetallicGlint.classList.add('sliding');

                // Simultaneously begin typing the role / subtitle
                heroMainRole.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                heroMainRole.style.opacity = '1';

                const part1Text = 'Full-Stack Developer';
                const part2Text = 'Software Engineer';
                let i = 0;

                function typePart1() {
                    if (introCompleted) return;
                    if (rolePart1 && i < part1Text.length) {
                        rolePart1.textContent += part1Text[i];
                        i++;
                        setTimeout(typePart1, 35);
                    } else {
                        // Show separator '&' in dimmed cyan
                        if (roleSep) roleSep.style.display = 'inline';
                        let j = 0;
                        setTimeout(function typePart2() {
                            if (introCompleted) return;
                            if (roleAccent && j < part2Text.length) {
                                roleAccent.textContent += part2Text[j];
                                j++;
                                setTimeout(typePart2, 35);
                            } else {
                                // Typing complete: hide cursor smoothly
                                if (roleCursor) {
                                    roleCursor.style.opacity = '0';
                                    setTimeout(() => { if (roleCursor) roleCursor.style.display = 'none'; }, 300);
                                }

                                // Pause for reading, then smoothly glide into final resting position
                                setTimeout(() => {
                                    startMoveToRestingPosition();
                                }, 650);
                            }
                        }, 100);
                    }
                }

                typePart1();
            }, 450);
        }, 320);

        function startMoveToRestingPosition() {
            if (introCompleted) return;
            introCompleted = true;

            // Glide smoothly from centerOffsetY to 0
            const glideDuration = 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
            heroNameContainer.style.transition = glideDuration;
            heroMainRole.style.transition = glideDuration;
            heroNameContainer.style.transform = 'translate3d(0, 0, 0) scale(1)';
            heroMainRole.style.transform = 'translate3d(0, 0, 0)';

            // Obvious slow fade of black curtain to reveal 3D cosmic background
            introCurtain.style.opacity = '0';

            // Softly fade backlight aura
            if (heroNameAura) {
                heroNameAura.style.transition = 'opacity 1.4s ease';
                heroNameAura.style.opacity = '0';
            }

            // Stagger in surrounding hero elements (status pill, summary, CTAs)
            if (heroContent) heroContent.classList.add('hero-entered');
            if (heroSection) heroSection.classList.add('revealed');

            // Complete transition cleanly with zero blinks or snaps
            setTimeout(() => {
                heroNameContainer.style.transition = '';
                heroMainRole.style.transition = '';
                heroNameContainer.style.transform = '';
                heroMainRole.style.transform = '';
                heroNameContainer.style.zIndex = '';
                heroMainRole.style.zIndex = '';
                if (heroMetallicGlint) heroMetallicGlint.style.display = 'none';
                document.body.classList.remove('intro-active');
                introCurtain.style.display = 'none';
            }, 1450);
        }
    } else {
        if (rolePart1) rolePart1.textContent = 'Full-Stack Developer';
        if (roleSep) roleSep.style.display = 'inline';
        if (roleAccent) roleAccent.textContent = 'Software Engineer';
        if (roleCursor) roleCursor.style.display = 'none';
        if (heroSection) heroSection.classList.add('revealed');
        if (heroContent) heroContent.classList.add('hero-entered');
    }

    // ==========================================================================
    // 2. THREE.JS 3D COSMIC BACKGROUND (POLYHEDRONS & STARDUST PARTICLES)
    // ==========================================================================
    let threeScene, threeCamera, threeRenderer;
    let cosmicMeshArray = [];
    let starParticles;
    let targetMouseX = 0, targetMouseY = 0, currentMouseX = 0, currentMouseY = 0;
    let currentThemeMode = localStorage.getItem('portfolio_theme') || 'dark';

    function init3DBackdrop() {
        const canvas = document.getElementById('canvas-3d-bg');
        if (!canvas || typeof THREE === 'undefined') return;

        threeScene = new THREE.Scene();
        threeCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        threeCamera.position.set(0, 0, 35);

        threeRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        threeRenderer.setSize(window.innerWidth, window.innerHeight);
        threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Ambient & Directional Luminous Cyan / Subtle Violet Lights
        const ambientLight = new THREE.AmbientLight(0x0a0f1d, 1.2);
        threeScene.add(ambientLight);

        const cyanLight = new THREE.PointLight(0x00F0FF, 1.8, 80);
        cyanLight.position.set(20, 25, 20);
        threeScene.add(cyanLight);

        const violetLight = new THREE.PointLight(0x8b5cf6, 2.0, 90);
        violetLight.position.set(-25, -20, 15);
        threeScene.add(violetLight);

        // Geometries for cosmic floating elements
        const boxGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
        const icosaGeo = new THREE.IcosahedronGeometry(1.2, 0);
        const octaGeo = new THREE.OctahedronGeometry(1.1, 0);
        const geos = [boxGeo, icosaGeo, octaGeo];

        // Cosmic Palette
        const DARK_MESH_COLORS = [
            0x00F0FF, // Cyan
            0x8b5cf6, // Violet
            0x0ea5e9, // Sky Blue
            0x1e293b, // Deep Slate
            0x334155  // Subtle Slate
        ];

        const LIGHT_MESH_COLORS = [
            0x0284c7,
            0x7c3aed,
            0xe2e8f0,
            0x38bdf8
        ];

        const activePalette = (currentThemeMode === 'light') ? LIGHT_MESH_COLORS : DARK_MESH_COLORS;

        // Generate ~80 Floating Cosmic Meshes with subtle wireframe/edges
        for (let i = 0; i < 75; i++) {
            const geo = geos[Math.floor(Math.random() * geos.length)];
            const colorHex = activePalette[Math.floor(Math.random() * activePalette.length)];
            
            const mat = new THREE.MeshStandardMaterial({
                color: colorHex,
                roughness: 0.25,
                metalness: 0.35,
                transparent: true,
                opacity: (currentThemeMode === 'light') ? 0.75 : 0.65,
                wireframe: Math.random() > 0.65
            });

            const mesh = new THREE.Mesh(geo, mat);

            mesh.position.set(
                (Math.random() - 0.5) * 65,
                (Math.random() - 0.5) * 45,
                (Math.random() - 0.5) * 35
            );

            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            mesh.userData = {
                rotSpeedX: (Math.random() - 0.5) * 0.008,
                rotSpeedY: (Math.random() - 0.5) * 0.01,
                rotSpeedZ: (Math.random() - 0.5) * 0.006,
                floatSpeed: Math.random() * 0.015 + 0.005,
                floatOffset: Math.random() * Math.PI * 2,
                baseY: mesh.position.y
            };

            cosmicMeshArray.push(mesh);
            threeScene.add(mesh);
        }

        // Add Cosmic Stardust Particle Cloud
        const particleCount = 280;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 90;
            positions[i + 1] = (Math.random() - 0.5) * 70;
            positions[i + 2] = (Math.random() - 0.5) * 50;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0x00F0FF,
            size: 0.6,
            transparent: true,
            opacity: 0.45
        });

        starParticles = new THREE.Points(particleGeo, particleMat);
        threeScene.add(starParticles);

        // Mouse Parallax Trackers
        window.addEventListener('mousemove', (e) => {
            targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                targetMouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
                targetMouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
            }
        });

        window.addEventListener('resize', () => {
            threeCamera.aspect = window.innerWidth / window.innerHeight;
            threeCamera.updateProjectionMatrix();
            threeRenderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Animation Loop
        let clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            // Smooth Mouse Camera Easing
            currentMouseX += (targetMouseX - currentMouseX) * 0.04;
            currentMouseY += (targetMouseY - currentMouseY) * 0.04;

            threeCamera.position.x = currentMouseX * 4;
            threeCamera.position.y = -currentMouseY * 3;
            threeCamera.lookAt(0, 0, 0);

            // Animate Cosmic Meshes
            cosmicMeshArray.forEach(mesh => {
                mesh.rotation.x += mesh.userData.rotSpeedX;
                mesh.rotation.y += mesh.userData.rotSpeedY;
                mesh.rotation.z += mesh.userData.rotSpeedZ;
                mesh.position.y = mesh.userData.baseY + Math.sin(elapsedTime * mesh.userData.floatSpeed * 6 + mesh.userData.floatOffset) * 1.2;
            });

            // Rotate star particles slowly
            if (starParticles) {
                starParticles.rotation.y = elapsedTime * 0.015;
            }

            threeRenderer.render(threeScene, threeCamera);
        }

        animate();
    }

    init3DBackdrop();

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
    // 3C. SCATTERED CARDS SPREAD ON SCROLL (SKILLS & TECH STACKS FIELD EXPANSION)
    // ==========================================================================
    const skillCategoryGroups = document.querySelectorAll('.skills-category-group');
    if (skillCategoryGroups.length > 0) {
        const spreadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-spread');
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        skillCategoryGroups.forEach(group => {
            spreadObserver.observe(group);
            // If already in view on page load (e.g. reload or anchor link)
            const rect = group.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                group.classList.add('is-spread');
            }
        });
    }

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

        // Update 3D canvas materials if initialized
        if (cosmicMeshArray.length > 0) {
            cosmicMeshArray.forEach(mesh => {
                if (mesh.material) {
                    mesh.material.opacity = (theme === 'light') ? 0.75 : 0.65;
                }
            });
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
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 60) {
            currentSectionId = 'contact';
        } else if (!currentSectionId && window.scrollY < 300) {
            currentSectionId = 'hero';
        }

        if (currentSectionId) {
            trackerDots.forEach(dot => {
                if (dot.getAttribute('data-section') === currentSectionId) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
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
