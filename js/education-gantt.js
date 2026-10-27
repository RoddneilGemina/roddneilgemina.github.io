/**
 * EDUCATION GANTT TIMELINE & CURSOR-TRACKING FLOATING CARD
 * Portfolio of Roddneil B. Gemina
 */

(() => {
    const EDU_DATA = {
        citu: {
            school: "Cebu Institute of Technology – University",
            period: "2022 — 2026",
            scope: "Bachelor of Science in Computer Science",
            scholarship: "Full CS Scholar",
            levels: "1st Year to 4th Year (Undergraduate)",
            desc: "Maintained consistent Dean's Lister honors, published Scopus-indexed research (ICETT 2026), and earned PhilNITS FE certification.",
            accent: "#7fa8ff",
            years: [2022, 2023, 2024, 2025, 2026]
        },
        pshs: {
            school: "Philippine Science High School – Central Visayas",
            period: "2016 — 2022",
            scope: "Specialized STEM Secondary Curriculum",
            scholarship: "DOST Scholar",
            levels: "Grades 7 to 12 (Junior & Senior High)",
            desc: "Graduated with Academic Honors under DOST scholarship; advanced intensive coursework in algorithms, mathematics, and natural sciences.",
            accent: "#fbbf24",
            years: [2016, 2017, 2018, 2019, 2020, 2021, 2022]
        }
    };

    function initEducationGantt() {
        const floatCard = document.getElementById('eduFloatCard');
        const ganttBlocks = document.querySelectorAll('.edu-gantt-block');
        const rulerTicks = document.querySelectorAll('.edu-ruler-mark');

        if (!floatCard || !ganttBlocks.length) return;

        // Ensure floatCard is a direct child of body so it escapes all transformed containers
        if (floatCard.parentElement !== document.body) {
            document.body.appendChild(floatCard);
        }

        const schoolEl = document.getElementById('floatSchool');
        const periodEl = document.getElementById('floatPeriod');
        const scopeEl = document.getElementById('floatScope');
        const levelsEl = document.getElementById('floatLevels');
        const descEl = document.getElementById('floatDesc');

        let activeBlock = null;
        let mouseX = 0;
        let mouseY = 0;
        let isVisible = false;

        function updateCardPosition() {
            if (!floatCard) return;

            const cardWidth = floatCard.offsetWidth || 320;
            const cardHeight = floatCard.offsetHeight || 185;
            const viewportW = window.innerWidth;
            const viewportH = window.innerHeight;

            // Center horizontally over cursor
            let posX = mouseX - (cardWidth / 2);

            // Clamp horizontal bounds within viewport margins
            if (posX < 16) posX = 16;
            if (posX + cardWidth > viewportW - 16) {
                posX = viewportW - cardWidth - 16;
            }

            // Position vertically ABOVE the cursor by default
            let posY = mouseY - cardHeight - 14;

            // If not enough room above cursor in viewport, flip to BELOW the cursor
            if (posY < 14) {
                posY = mouseY + 24;
            }

            // Clamp vertical bounds within viewport margins
            if (posY + cardHeight > viewportH - 14) {
                posY = viewportH - cardHeight - 14;
            }

            floatCard.style.transform = `translate3d(${Math.round(posX)}px, ${Math.round(posY)}px, 0)`;
        }

        function highlightRulerYears(years, accentColor) {
            rulerTicks.forEach(tick => {
                const yr = parseInt(tick.getAttribute('data-year'), 10);
                if (years && years.includes(yr)) {
                    tick.classList.add('is-active-year');
                    tick.style.setProperty('--tick-accent', accentColor || '#7fa8ff');
                } else {
                    tick.classList.remove('is-active-year');
                    tick.style.removeProperty('--tick-accent');
                }
            });
        }

        function populateCardData(dataKey) {
            const data = EDU_DATA[dataKey];
            if (!data) return;

            if (schoolEl) schoolEl.textContent = data.school;
            if (periodEl) {
                periodEl.textContent = data.period;
                periodEl.style.color = data.accent;
            }
            if (scopeEl) scopeEl.textContent = `${data.scope} · ${data.scholarship}`;
            if (levelsEl) levelsEl.textContent = data.levels;
            if (descEl) descEl.textContent = data.desc;

            floatCard.setAttribute('data-active-school', dataKey);
            floatCard.style.setProperty('--float-accent', data.accent);
            highlightRulerYears(data.years, data.accent);
        }

        function showCard(block, clientX, clientY) {
            activeBlock = block;
            isVisible = true;
            const eduId = block.getAttribute('data-edu-id');
            populateCardData(eduId);

            const rect = block.getBoundingClientRect();
            mouseX = (typeof clientX === 'number' && !isNaN(clientX) && clientX > 0) ? clientX : (rect.left + rect.width / 2);
            mouseY = (typeof clientY === 'number' && !isNaN(clientY) && clientY > 0) ? clientY : (rect.top + rect.height / 2);
            updateCardPosition();

            floatCard.classList.add('is-visible');
            floatCard.setAttribute('aria-hidden', 'false');
        }

        function hideCard() {
            activeBlock = null;
            isVisible = false;
            floatCard.classList.remove('is-visible');
            floatCard.setAttribute('aria-hidden', 'true');
            highlightRulerYears(null);
        }

        ganttBlocks.forEach(block => {
            // Mouse Enter
            block.addEventListener('mouseenter', (e) => {
                showCard(block, e.clientX, e.clientY);
            });

            // Mouse Move (follow cursor)
            block.addEventListener('mousemove', (e) => {
                if (typeof e.clientX === 'number' && !isNaN(e.clientX) && e.clientX > 0) {
                    mouseX = e.clientX;
                    mouseY = e.clientY;
                }
                if (!isVisible) {
                    showCard(block, e.clientX, e.clientY);
                } else {
                    updateCardPosition();
                }
            });

            // Mouse Leave
            block.addEventListener('mouseleave', () => {
                hideCard();
            });

            // Pointer events backup for devices with fine pointer
            block.addEventListener('pointerenter', (e) => {
                if (e.pointerType === 'mouse') {
                    showCard(block, e.clientX, e.clientY);
                }
            });

            block.addEventListener('pointermove', (e) => {
                if (e.pointerType === 'mouse') {
                    mouseX = e.clientX;
                    mouseY = e.clientY;
                    updateCardPosition();
                }
            });

            // Keyboard Focus & Blur
            block.addEventListener('focus', () => {
                const rect = block.getBoundingClientRect();
                showCard(block, rect.left + rect.width / 2, rect.top - 10);
            });

            block.addEventListener('blur', () => {
                hideCard();
            });

            // Mobile / Touch Tap toggle
            block.addEventListener('click', (e) => {
                if (window.innerWidth <= 860 || ('ontouchstart' in window)) {
                    e.stopPropagation();
                    if (isVisible && activeBlock === block) {
                        hideCard();
                    } else {
                        const rect = block.getBoundingClientRect();
                        const clickX = rect.left + rect.width / 2;
                        const clickY = rect.top;
                        showCard(block, clickX, clickY);
                    }
                }
            });
        });

        // Close when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (isVisible && !e.target.closest('.edu-gantt-block') && !e.target.closest('#eduFloatCard')) {
                hideCard();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEducationGantt);
    } else {
        initEducationGantt();
    }
})();
