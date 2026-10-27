/**
 * RESEARCH PUBLICATIONS ACCORDION CONTROLLER
 * Portfolio of Roddneil B. Gemina
 * 
 * Features:
 * - One expanded row at a time (mutual exclusion)
 * - Auto-contracts other open research rows
 * - Accessible aria-expanded attributes
 * - Smooth GPU-accelerated CSS Grid height transition
 */

(() => {
    function initResearchAccordion() {
        const rows = document.querySelectorAll('.research-row-item');
        if (!rows.length) return;

        rows.forEach(row => {
            const trigger = row.querySelector('.research-expand-trigger');
            const drawer = row.querySelector('.research-case-study-drawer');
            if (!trigger || !drawer) return;

            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isCurrentlyExpanded = row.classList.contains('is-expanded');

                // Auto-contract ALL other rows (mutual exclusion)
                rows.forEach(otherRow => {
                    if (otherRow !== row) {
                        otherRow.classList.remove('is-expanded');
                        const otherTrigger = otherRow.querySelector('.research-expand-trigger');
                        if (otherTrigger) {
                            otherTrigger.setAttribute('aria-expanded', 'false');
                            const label = otherTrigger.querySelector('.trigger-label');
                            if (label) label.textContent = 'Expand Case Study';
                        }
                    }
                });

                // Toggle this row
                if (isCurrentlyExpanded) {
                    row.classList.remove('is-expanded');
                    trigger.setAttribute('aria-expanded', 'false');
                    const label = trigger.querySelector('.trigger-label');
                    if (label) label.textContent = 'Expand Case Study';
                } else {
                    row.classList.add('is-expanded');
                    trigger.setAttribute('aria-expanded', 'true');
                    const label = trigger.querySelector('.trigger-label');
                    if (label) label.textContent = 'Collapse Case Study';
                }
            });
        });

        console.log('[ResearchAccordion] Initialized on', rows.length, 'research items');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initResearchAccordion);
    } else {
        initResearchAccordion();
    }
})();
