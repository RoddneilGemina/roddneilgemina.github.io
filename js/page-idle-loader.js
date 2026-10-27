/**
 * PAGE IDLE SCREEN & FADE-IN LOADER CONTROLLER
 * Portfolio of Roddneil B. Gemina
 * 
 * Displays an idle black screen while all page resources (stylesheets, 
 * WebGL scripts, Three.js canvases, Google Fonts, and images) load.
 * Once all resources are ready (or safety timeout expires), executes a 
 * smooth, high-speed fade-in transition.
 */

(() => {
    let isDismissed = false;

    function dismissIdleScreen() {
        if (isDismissed) return;
        isDismissed = true;

        const curtain = document.getElementById('page-idle-curtain');
        if (!curtain) return;

        // Allow micro-task for WebGL contexts & GSAP layout calculations to settle
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                curtain.classList.add('loaded');
                document.body.classList.add('page-ready');

                // Fully remove from render tree after fade transition finishes
                setTimeout(() => {
                    curtain.style.display = 'none';
                    curtain.setAttribute('aria-hidden', 'true');
                }, 450);
            });
        });
    }

    // Trigger on complete load of all page assets
    if (document.readyState === 'complete') {
        dismissIdleScreen();
    } else {
        window.addEventListener('load', dismissIdleScreen);
    }

    // Safety fallback: Guarantee the screen never stays locked if an external CDN hangs
    setTimeout(dismissIdleScreen, 3000);
})();
