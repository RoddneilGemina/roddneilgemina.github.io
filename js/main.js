/**
 * RODDNEIL B. GEMINA — SUMMER BEACH & UNDERWATER PORTFOLIO LOGIC (js/main.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. FLOATING BUBBLES ENGINE (SPAWNS ONLY WHEN FULLY UNDERWATER)
    // ----------------------------------------------------------------------
    const bubblesContainer = document.getElementById('bubbles-container');
    const heroSection = document.getElementById('hero');

    function createBubbles() {
        if (!bubblesContainer || bubblesContainer.children.length > 0) return;

        const numberOfBubbles = 30;
        for (let i = 0; i < numberOfBubbles; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';

            const size = Math.random() * 24 + 8; // 8px to 32px
            const left = Math.random() * 96 + 2; // 2% to 98%
            const duration = Math.random() * 9 + 7; // 7s to 16s
            const delay = Math.random() * 10; // 0s to 10s

            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${left}%`;
            bubble.style.animationDuration = `${duration}s`;
            bubble.style.animationDelay = `${delay}s`;

            bubblesContainer.appendChild(bubble);
        }
    }

    function removeBubbles() {
        if (bubblesContainer) {
            bubblesContainer.innerHTML = '';
        }
    }

    // INTERSECTION OBSERVER: TRIGGER BUBBLES ONLY WHEN SCREEN IS UNDER WATER (PAST HERO / ISLAND)
    if (heroSection && bubblesContainer) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // When hero/island is NOT intersecting (scrolled down underwater), activate bubbles!
                if (!entry.isIntersecting) {
                    bubblesContainer.classList.add('underwater-active');
                    createBubbles();
                } else {
                    // When hero/island is visible again at top, deactivate bubbles & stop spawning!
                    bubblesContainer.classList.remove('underwater-active');
                    removeBubbles();
                }
            });
        }, {
            root: null,
            threshold: 0.05 // Triggers as soon as island leaves or returns
        });

        heroObserver.observe(heroSection);
    }

    // ----------------------------------------------------------------------
    // 2. THEME CONTROLLER & PERSISTENCE
    // ----------------------------------------------------------------------
    const themeSelector = document.getElementById('theme-selector');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('summer_theme') || 'summer';
    htmlElement.setAttribute('data-theme', savedTheme);
    if (themeSelector) {
        themeSelector.value = savedTheme;

        themeSelector.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            htmlElement.setAttribute('data-theme', selectedTheme);
            localStorage.setItem('summer_theme', selectedTheme);
        });
    }

    // ----------------------------------------------------------------------
    // 3. MOBILE NAVIGATION MENU
    // ----------------------------------------------------------------------
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('mobile-active');
            });
        });
    }

    // ----------------------------------------------------------------------
    // 4. INTERACTIVE PROJECT FILTERING
    // ----------------------------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardCategories = card.getAttribute('data-category').split(' ');

                if (filterValue === 'all' || cardCategories.includes(filterValue)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ----------------------------------------------------------------------
    // 5. PROJECT DETAILS DIALOG / MODAL SYSTEM
    // ----------------------------------------------------------------------
    const projectModal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-project-title');
    const modalType = document.getElementById('modal-project-type');
    const modalDesc = document.getElementById('modal-project-desc');
    const modalHighlights = document.getElementById('modal-project-highlights');
    const modalTechTags = document.getElementById('modal-tech-tags');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalCloseAction = document.getElementById('modal-close-action');

    const projectDetailsData = {
        p1: {
            title: 'Fusion Rush: Enhancing Proficiency in Boolean Logic Algebra',
            type: 'Scopus-Indexed Research & AI App (2025-2026)',
            desc: 'A supplementary learning software providing AI tutoring services and gamified learning about the Rules of Inference in Discrete Mathematics. Deployed and tested by students in coordination with CIT-U CCS instructors.',
            highlights: [
                'Co-authored research paper accepted in Scopus-indexed conference: International Conference on Education and Training Technologies (ICETT) 2026.',
                'Designed adaptive learning algorithms to guide students through Discrete Math logic proofs.',
                'Led full-stack software and AI development for the interactive gamified system.',
                'Tested and evaluated in production classrooms at CIT-U College of Computer Studies.'
            ],
            tech: ['AI Development', 'Python', 'Scopus ICETT 2026', 'Discrete Mathematics', 'Gamification', 'Full-Stack']
        },
        p2: {
            title: 'Bridging the Gap: Visual AI to Accurately Parse Logic Proofs',
            type: 'National Congress Paper & Visual AI System (2026)',
            desc: 'A system utilizing computer vision and Visual AI to scan, parse, and evaluate the validity and scoring of handwritten Discrete Mathematics logic proofs under the Rules of Inference topic.',
            highlights: [
                'Personally presented research paper at the Philippine Computing Science Congress (PCSC) 2026 held in Davao.',
                'Engineered OCR and Visual AI pipelines to parse structured handwritten mathematical symbols.',
                'Implemented automated step-by-step logic rule validation algorithms.',
                'Built end-to-end software pipeline connecting image capture with scoring feedback.'
            ],
            tech: ['Visual AI', 'Handwriting Recognition', 'Python', 'PCSC 2026 Davao', 'Logic Verification']
        },
        p3: {
            title: 'TakeIt — Event Management & Ticketing System',
            type: 'Full-Stack Web Application (2024)',
            desc: 'An event management and digital ticketing web system ensuring a fluid process for event creation, booking, ticket allocation, and attendee management.',
            highlights: [
                'Architected clean booking workflows for event organizers and attendees.',
                'Engineered responsive database schemas for ticket inventory and user transactions.',
                'Streamlined user check-in verification processes.'
            ],
            tech: ['React', 'Node.js', 'JavaScript', 'Database Management', 'Full-Stack']
        },
        p4: {
            title: 'DishCover — Pantry Management & Waste Reduction App',
            type: 'Pantry & Storage App (2024)',
            desc: 'A smart pantry management application that enables users to track food storage inventory, receive expiration date warnings, and plan household meals.',
            highlights: [
                'Designed expiration date tracking algorithms to notify users of impending food spoilage.',
                'Integrated inventory storage dashboards with intuitive category filtering.',
                'Created user-friendly mobile and web UI interfaces for quick item entry.'
            ],
            tech: ['Full-Stack', 'UI/UX Design', 'JavaScript', 'Storage Tracking']
        },
        p5: {
            title: 'CropConnect — Direct Produce E-Commerce for Farmers',
            type: 'AgriTech Marketplace (2024)',
            desc: 'A fresh goods e-commerce platform giving local farmers a direct channel to sell their produce directly to consumers without middleman markups.',
            highlights: [
                'Empowered local agricultural communities by providing digital storefront tools.',
                'Implemented secure shopping cart, product cataloging, and direct farmer-to-consumer order tracking.',
                'Built responsive web interfaces optimized for low-bandwidth mobile connections.'
            ],
            tech: ['Django', 'Python', 'HTML5/CSS3', 'E-Commerce Logic', 'AgriTech']
        },
        p6: {
            title: 'Bomberman BattleRoyale — Java PvP Multiplayer Game',
            type: 'Java Multiplayer Game (2024)',
            desc: 'A real-time Java multiplayer arcade game featuring classic bomb placement mechanics coupled with a shrinking arena battle-royale PvP mode.',
            highlights: [
                'Built custom Java multi-threaded TCP/UDP socket networking for zero-lag player synchronization.',
                'Implemented tile grid collision detection, bomb explosion radius math, and power-up drops.',
                'Engineered Object-Oriented game loops and custom 2D graphics rendering.'
            ],
            tech: ['Java', 'Socket Networking', 'Object-Oriented Design', 'CodeChum Certified Java']
        },
        p7: {
            title: 'E-Tanom — Academic Concept AgriTech Startup',
            type: 'Startup Concept & Prototype (2024)',
            desc: 'An academic concept startup platform designed to assist local farmers in adapting to modern digital agricultural trends and market expansion.',
            highlights: [
                'Researched digital market adoption barriers among regional farming communities.',
                'Designed prototype interface workflows for crop demand forecasting.',
                'Presented business and technical architecture concepts in academic competitions.'
            ],
            tech: ['Startup Prototype', 'AgriTech', 'UI/UX Design', 'Market Analysis']
        },
        p8: {
            title: 'Nexchef — Live Step Cooking & Recipe Platform',
            type: 'Culinary Web Prototype (2024)',
            desc: 'An experimental culinary app allowing users to share signature recipes and follow live synchronized timers guiding step-by-step cooking instructions.',
            highlights: [
                'Built multi-timer tracking components for parallel recipe cooking steps.',
                'Designed clean community recipe creation and media sharing interface.',
                'Optimized web app response speed for touch screen kitchen devices.'
            ],
            tech: ['JavaScript', 'HTML5/CSS3', 'Web Timers', 'UI/UX']
        }
    };

    // Open Modal Handlers
    document.querySelectorAll('.open-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.getAttribute('data-project');
            const data = projectDetailsData[projectId];

            if (data && projectModal) {
                modalTitle.textContent = data.title;
                modalType.textContent = data.type;
                modalDesc.textContent = data.desc;

                modalHighlights.innerHTML = '';
                data.highlights.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    modalHighlights.appendChild(li);
                });

                modalTechTags.innerHTML = '';
                data.tech.forEach(t => {
                    const span = document.createElement('span');
                    span.className = 'skill-tag';
                    span.innerHTML = `<span class="tag-dot"></span>${t}`;
                    modalTechTags.appendChild(span);
                });

                projectModal.showModal();
            }
        });
    });

    const closeModal = () => {
        if (projectModal) projectModal.close();
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalCloseAction) modalCloseAction.addEventListener('click', closeModal);

    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            const dialogBounds = projectModal.getBoundingClientRect();
            if (
                e.clientX < dialogBounds.left ||
                e.clientX > dialogBounds.right ||
                e.clientY < dialogBounds.top ||
                e.clientY > dialogBounds.bottom
            ) {
                closeModal();
            }
        });
    }

    // ----------------------------------------------------------------------
    // 6. CONTACT FORM VALIDATION & INTERACTION
    // ----------------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('sender-name')?.value.trim();
            const email = document.getElementById('sender-email')?.value.trim();
            const message = document.getElementById('message-text')?.value.trim();

            if (!name || !email || !message) {
                if (formFeedback) {
                    formFeedback.className = 'form-feedback error';
                    formFeedback.textContent = 'Please complete all required fields (*).';
                }
                return;
            }

            if (formFeedback) {
                formFeedback.className = 'form-feedback success';
                formFeedback.textContent = `Thank you, ${name}! Your message has been sent to Roddneil.`;
            }

            contactForm.reset();
        });
    }

    // ----------------------------------------------------------------------
    // 7. COPY EMAIL TO CLIPBOARD
    // ----------------------------------------------------------------------
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const emailLink = document.getElementById('email-link');

    if (copyEmailBtn && emailLink) {
        copyEmailBtn.addEventListener('click', () => {
            const emailText = emailLink.textContent.trim();
            navigator.clipboard.writeText(emailText).then(() => {
                const originalText = copyEmailBtn.innerHTML;
                copyEmailBtn.innerHTML = '<span>✓ Copied!</span>';
                setTimeout(() => {
                    copyEmailBtn.innerHTML = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Copy email failed: ', err);
            });
        });
    }

    // ----------------------------------------------------------------------
    // 8. ACTIVE NAV HIGHLIGHT ON SCROLL
    // ----------------------------------------------------------------------
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => navObserver.observe(section));

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
