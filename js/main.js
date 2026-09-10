/**
 * RODDNEIL B. GEMINA — SUMMER BEACH & UNDERWATER PORTFOLIO LOGIC (js/main.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. FLOATING BUBBLES ENGINE (RELATIVE TO WATERY DEPTHS BACKGROUND)
    // ----------------------------------------------------------------------
    const bubblesContainer = document.getElementById('bubbles-container');

    function createBubbles() {
        if (!bubblesContainer || bubblesContainer.children.length > 0) return;

        const numberOfBubbles = 35;
        for (let i = 0; i < numberOfBubbles; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';

            const size = Math.random() * 24 + 8; // 8px to 32px
            const left = Math.random() * 96 + 2; // 2% to 98%
            const duration = Math.random() * 10 + 8; // 8s to 18s
            const delay = Math.random() * 12; // 0s to 12s

            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${left}%`;
            bubble.style.animationDuration = `${duration}s`;
            bubble.style.animationDelay = `${delay}s`;

            bubblesContainer.appendChild(bubble);
        }
    }

    // INITIALIZE BUBBLES CONTINUOUSLY RELATIVE TO WATERY DEPTHS BACKGROUND
    createBubbles();

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
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mainNav.classList.toggle('mobile-active');
            mobileMenuToggle.classList.toggle('active', isOpen);
            mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('mobile-active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mainNav.classList.remove('mobile-active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ----------------------------------------------------------------------
    // 4. INTERACTIVE PROJECTS OVERLAY & FILTERING
    // ----------------------------------------------------------------------
    const allProjectsDialog = document.getElementById('all-projects-dialog');
    const openAllProjectsBtn = document.getElementById('open-all-projects-btn');
    const closeOverlayBtn = document.getElementById('close-overlay-btn');
    const overlayCloseAction = document.getElementById('overlay-close-action');

    if (openAllProjectsBtn && allProjectsDialog) {
        openAllProjectsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            allProjectsDialog.showModal();
        });
    }

    if (closeOverlayBtn && allProjectsDialog) {
        closeOverlayBtn.addEventListener('click', () => allProjectsDialog.close());
    }

    if (overlayCloseAction && allProjectsDialog) {
        overlayCloseAction.addEventListener('click', () => allProjectsDialog.close());
    }

    if (allProjectsDialog) {
        allProjectsDialog.addEventListener('click', (e) => {
            if (e.target === allProjectsDialog) {
                allProjectsDialog.close();
            }
        });
    }

    // Category filtering inside the projects overlay
    const overlayFilterButtons = document.querySelectorAll('#all-projects-dialog .filter-btn');
    const overlayProjectCards = document.querySelectorAll('#all-projects-dialog .project-card');

    overlayFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
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

    // ----------------------------------------------------------------------
    // 5. PROJECT SPECIFICATION MODAL DIALOG
    // ----------------------------------------------------------------------
    const projectModal = document.getElementById('project-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalCloseAction = document.getElementById('modal-close-action');

    const projectData = {
        p1: {
            title: 'Fusion Rush: Gamified Boolean Logic & AI Tutoring',
            type: 'Scopus ICETT 2026 Paper',
            image: '',
            videoUrl: '',
            desc: 'AI tutoring software providing gamified learning on the Rules of Inference for Discrete Math. Deployed and tested by students in coordination with CIT-U instructors and accepted at the Scopus-indexed ICETT 2026 Conference.',
            highlights: [
                'Accepted paper at Scopus-indexed ICETT 2026 Conference.',
                'Gamified step-by-step logic solver algorithm for propositional calculus.',
                'Evaluated by Computer Science students and faculty with high usability ratings.'
            ],
            tech: ['Python', 'AI Tutoring', 'Discrete Math', 'Scopus ICETT 2026']
        },
        p2: {
            title: 'Visual AI Logic Proof Parser & Evaluator',
            type: 'PCSC 2026 Davao Presentation',
            image: '',
            videoUrl: '',
            desc: 'System using Visual AI to scan, parse, and evaluate validity and scoring of handwritten Discrete Math proofs. Presented at the Philippine Computing Science Congress (PCSC) 2026 in Davao.',
            highlights: [
                'Presented at PCSC 2026 national conference in Davao.',
                'Visual AI OCR engine trained to read handwritten logical symbols and line proofs.',
                'Automated step validation verifying rule application correctness.'
            ],
            tech: ['Visual AI', 'OCR Parsing', 'Logic Verification', 'PCSC 2026']
        },
        p3: {
            title: 'TakeIt — Event Management & Ticketing System',
            type: 'Web Application',
            image: '',
            videoUrl: '',
            desc: 'An end-to-end event management and ticketing platform ensuring smooth booking workflows, ticket distribution, and event organizer dashboard management.',
            highlights: [
                'Complete ticketing checkout flow with digital ticket generation.',
                'Organizer management dashboard for event metrics & attendee tracking.',
                'Optimized relational database schema for high event concurrency.'
            ],
            tech: ['React', 'Node.js', 'Database Design', 'Full-Stack']
        },
        p4: {
            title: 'DishCover — Pantry & Inventory Management App',
            type: 'Web / Mobile App',
            image: '',
            videoUrl: '',
            desc: 'A smart pantry management app enabling users to track food item expiration dates, manage storage inventory, and minimize household food waste.',
            highlights: [
                'Real-time expiration notification logic and category tracking.',
                'Recipe suggestions based on available pantry ingredients.',
                'Clean responsive UI for fast mobile item logging.'
            ],
            tech: ['Full-Stack', 'Inventory Logic', 'UI/UX', 'JavaScript']
        },
        p5: {
            title: 'CropConnect — Direct Farmer Fresh Produce E-Commerce',
            type: 'E-Commerce Platform',
            image: '',
            videoUrl: '',
            desc: 'A fresh produce e-commerce application bridging local farmers directly with consumers, empowering agricultural communities to list and sell fresh goods transparently.',
            highlights: [
                'Direct farmer-to-consumer marketplace architecture eliminating middlemen fees.',
                'Order processing, fresh inventory management, and price listings.',
                'Designed to empower agricultural workers with digital tools.'
            ],
            tech: ['E-Commerce', 'Django / Python', 'Web Tech', 'AgriTech']
        },
        p6: {
            title: 'Bomberman BattleRoyale — Java PvP Game',
            type: 'Java Multiplayer Game',
            image: '',
            videoUrl: '',
            desc: 'A multiplayer arcade game in Java featuring real-time socket networking, arena shrinking mechanics, and battle-royale styled player-vs-player combat.',
            highlights: [
                'Real-time multi-threaded Java socket client/server networking.',
                'Grid explosion collision algorithms and power-up spawn engine.',
                'Shrinking zone logic forcing high-stakes PvP endgame action.'
            ],
            tech: ['Java', 'Socket Networking', 'OOP Architecture', 'Game Loop']
        },
        p7: {
            title: 'E-Tanom — Academic AgriTech Platform',
            type: 'AgriTech Startup Concept',
            image: '',
            videoUrl: '',
            desc: 'An academic concept startup designed to assist local agricultural workers in adopting digital market trends and optimizing crop distribution channels.',
            highlights: [
                'AgriTech startup business model and digital platform prototype.',
                'Market trends dashboard for seasonal crop yield planning.',
                'User-friendly interface designed for accessible agricultural adoption.'
            ],
            tech: ['Startup Prototype', 'Web Platform', 'UI Design']
        },
        p8: {
            title: 'Nexchef — Live Step Cooking & Recipe Platform',
            type: 'Interactive Cooking Prototype',
            image: '',
            videoUrl: '',
            desc: 'An experimental culinary web application enabling users to share recipes and follow synchronized live step timers for precision home cooking.',
            highlights: [
                'Synchronized multi-timer execution engine for sequential cooking steps.',
                'Interactive recipe card layout with measurement adjusters.',
                'Community recipe publishing and rating UI.'
            ],
            tech: ['JavaScript', 'Web Timers', 'UX Design']
        },
        p9: {
            title: 'The Comparison of Aerated and Non-aerated Hydroponics',
            type: 'Agricultural Research (2021-2022)',
            image: '',
            videoUrl: '',
            desc: 'A comparative research paper evaluating the growth performance of aerated vs non-aerated hydroponics setups on water spinach plants over 30 days.',
            highlights: [
                'Facilitated procurement, setup, and daily data collection over 30 days.',
                'Evaluated dissolved oxygen impact on root development and leaf biomass yield.',
                'Conducted complete statistical data analysis and conclusions.'
            ],
            tech: ['AgriTech Research', 'Data Collection', 'PSHS-CVC', 'Experimental Design']
        }
    };

    let activeModalProject = null;

    const modalMediaContainer = document.getElementById('modal-project-media');
    const mediaTabBtns = document.querySelectorAll('.media-tab-btn');

    function renderModalMedia(tabType) {
        if (!activeModalProject || !modalMediaContainer) return;

        if (tabType === 'screenshot') {
            if (activeModalProject.image) {
                modalMediaContainer.innerHTML = `
                    <div class="modal-media-wrapper">
                        <img src="${activeModalProject.image}" alt="${activeModalProject.title} Screenshot Preview" class="modal-media-img">
                    </div>
                `;
            } else {
                modalMediaContainer.innerHTML = `
                    <div class="empty-media-box" style="min-height: 280px;">
                        <span>Placeholder</span>
                    </div>
                `;
            }
        } else if (tabType === 'video') {
            if (activeModalProject.videoUrl) {
                modalMediaContainer.innerHTML = `
                    <div class="modal-media-wrapper">
                        <video controls class="modal-media-video">
                            <source src="${activeModalProject.videoUrl}">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                `;
            } else {
                modalMediaContainer.innerHTML = `
                    <div class="empty-media-box" style="min-height: 280px;">
                        <span>Placeholder</span>
                    </div>
                `;
            }
        }
    }

    mediaTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mediaTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mediaType = btn.getAttribute('data-media-tab');
            renderModalMedia(mediaType);
        });
    });

    // Event delegation for opening project detail modal (.open-modal-btn)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.open-modal-btn');
        if (!btn) return;

        const projectId = btn.getAttribute('data-project');
        const data = projectData[projectId];
        activeModalProject = data;

        if (data && projectModal) {
            document.getElementById('modal-project-title').textContent = data.title;
            document.getElementById('modal-project-type').textContent = data.type;
            document.getElementById('modal-project-desc').textContent = data.desc;

            // Check if videoUrl is specified for this project
            const mediaTabGroup = document.getElementById('modal-media-tab-group');
            if (mediaTabGroup) {
                if (data.videoUrl && data.videoUrl.trim() !== '') {
                    mediaTabGroup.style.display = 'flex';
                } else {
                    mediaTabGroup.style.display = 'none';
                }
            }

            // Reset tabs to screenshot
            mediaTabBtns.forEach(b => b.classList.remove('active'));
            const defaultTab = document.querySelector('.media-tab-btn[data-media-tab="screenshot"]');
            if (defaultTab) defaultTab.classList.add('active');

            // Render media
            renderModalMedia('screenshot');

            const highlightsList = document.getElementById('modal-project-highlights');
            highlightsList.innerHTML = '';
            data.highlights.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                highlightsList.appendChild(li);
            });

            const techTagsContainer = document.getElementById('modal-tech-tags');
            techTagsContainer.innerHTML = '';
            data.tech.forEach(tech => {
                const span = document.createElement('span');
                span.className = 'skill-tag';
                span.innerHTML = `<span class="tag-dot"></span>${tech}`;
                techTagsContainer.appendChild(span);
            });

            projectModal.showModal();
        }
    });

    if (closeModalBtn && projectModal) {
        closeModalBtn.addEventListener('click', () => projectModal.close());
    }

    if (modalCloseAction && projectModal) {
        modalCloseAction.addEventListener('click', () => projectModal.close());
    }

    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                projectModal.close();
            }
        });
    }

    // ----------------------------------------------------------------------
    // 6. EMAIL COPY TO CLIPBOARD
    // ----------------------------------------------------------------------
    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const email = 'roddneilgemina@gmail.com';
            navigator.clipboard.writeText(email).then(() => {
                const span = copyEmailBtn.querySelector('span');
                const originalText = span.textContent;
                span.textContent = 'Copied!';
                copyEmailBtn.style.backgroundColor = 'var(--accent-coral)';
                copyEmailBtn.style.color = '#ffffff';
                setTimeout(() => {
                    span.textContent = originalText;
                    copyEmailBtn.style.backgroundColor = '';
                    copyEmailBtn.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy email: ', err);
            });
        });
    }
});
