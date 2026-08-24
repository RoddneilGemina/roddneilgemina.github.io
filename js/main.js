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

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectCards.forEach(card => {
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
            desc: 'An end-to-end event management and ticketing platform ensuring smooth booking workflows, ticket distribution, and event organizer dashboard management.',
            highlights: [
                'Interactive event discovery and ticket tier purchasing.',
                'Organizer portal for attendance tracking and earnings metrics.',
                'Secure session management and database transactions.'
            ],
            tech: ['React', 'Node.js', 'Database Design', 'Full-Stack']
        },
        p4: {
            title: 'DishCover — Pantry & Inventory Management App',
            type: 'Web / Mobile App',
            desc: 'A smart pantry management app enabling users to track food item expiration dates, manage storage inventory, and minimize household food waste.',
            highlights: [
                'Expiration date tracking with smart alerts.',
                'Recipe suggestions based on available pantry items.',
                'Clean responsive dashboard for kitchen stock.'
            ],
            tech: ['Full-Stack', 'Inventory Logic', 'UI/UX', 'JavaScript']
        },
        p5: {
            title: 'CropConnect — Direct Farmer Fresh Produce E-Commerce',
            type: 'E-Commerce Platform',
            desc: 'A fresh produce e-commerce application bridging local farmers directly with consumers, empowering agricultural communities to list and sell fresh goods transparently.',
            highlights: [
                'Direct B2C produce catalog for fresh agricultural goods.',
                'Farmer inventory dashboard and price transparency features.',
                'Built with Django and Python backend framework.'
            ],
            tech: ['E-Commerce', 'Django / Python', 'Web Tech', 'AgriTech']
        },
        p6: {
            title: 'Bomberman BattleRoyale — Java PvP Game',
            type: 'Java Multiplayer Game',
            desc: 'A multiplayer arcade game in Java featuring real-time socket networking, arena shrinking mechanics, and battle-royale styled player-vs-player combat.',
            highlights: [
                'Real-time socket server handling concurrent player actions.',
                'Shrinking safe-zone grid logic and bomb explosion collision physics.',
                'Modular OOP architecture in pure Java.'
            ],
            tech: ['Java', 'Socket Networking', 'OOP Architecture', 'Game Loop']
        },
        p7: {
            title: 'E-Tanom — Academic AgriTech Platform',
            type: 'AgriTech Startup Concept',
            desc: 'An academic concept startup designed to assist local agricultural workers in adopting digital market trends and optimizing crop distribution channels.',
            highlights: [
                'Market trends dashboard for seasonal crop demand.',
                'Educational resources for local farming techniques.',
                'High-fidelity UX wireframes and user flow mapping.'
            ],
            tech: ['Startup Prototype', 'Web Platform', 'UI Design']
        },
        p8: {
            title: 'Nexchef — Live Step Cooking & Recipe Platform',
            type: 'Interactive Cooking Prototype',
            desc: 'An experimental culinary web application enabling users to share recipes and follow synchronized live step timers for precision home cooking.',
            highlights: [
                'Live step timer synchronization for multi-stage recipes.',
                'Community recipe sharing with ingredient scaling logic.',
                'Minimalist distraction-free cooking mode interface.'
            ],
            tech: ['JavaScript', 'Web Timers', 'UX Design']
        }
    };

    document.querySelectorAll('.open-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.getAttribute('data-project');
            const data = projectData[projectId];

            if (data && projectModal) {
                document.getElementById('modal-project-title').textContent = data.title;
                document.getElementById('modal-project-type').textContent = data.type;
                document.getElementById('modal-project-desc').textContent = data.desc;

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
    });

    if (closeModalBtn && projectModal) {
        closeModalBtn.addEventListener('click', () => projectModal.close());
    }

    if (modalCloseAction && projectModal) {
        modalCloseAction.addEventListener('click', () => projectModal.close());
    }

    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            const rect = projectModal.getBoundingClientRect();
            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!isInDialog) {
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
