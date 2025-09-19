// UI Interactions for Logic Mixology: Inference Bar

class UIInteractions {
    constructor() {
        this.isDragging = false;
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
        this.ghostElement = null;

        // Touch support for mobile
        this.isTouchDevice = 'ontouchstart' in window;

        // Initialize interactions when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log("Initializing UI interactions...");
        this.setupDragAndDrop();
        this.setupButtons();
        this.setupKeyboardShortcuts();
        this.setupMobileSupport();
        this.setupLegendToggle();
        this.setupSolutionModal();
    }

    // Set up drag and drop functionality
    setupDragAndDrop() {
        // Get all draggable ingredients
        const ingredients = document.querySelectorAll('.ingredient[draggable="true"]');
        const mixingArea = document.getElementById('mixing-area');

        // Add event listeners to ingredients
        ingredients.forEach(ingredient => {
            // Desktop drag events
            ingredient.addEventListener('dragstart', (e) => this.handleDragStart(e));
            ingredient.addEventListener('drag', (e) => this.handleDrag(e));
            ingredient.addEventListener('dragend', (e) => this.handleDragEnd(e));

            // Mobile touch events
            if (this.isTouchDevice) {
                ingredient.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
                ingredient.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
                ingredient.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
            }

            // Click event for non-drag interaction (backup)
            ingredient.addEventListener('click', (e) => this.handleIngredientClick(e));
        });

        // Set up drop zone
        if (mixingArea) {
            mixingArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            mixingArea.addEventListener('drop', (e) => this.handleDrop(e));
            mixingArea.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            mixingArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        }
    }

    // Handle drag start
    handleDragStart(e) {
        this.isDragging = true;
        this.draggedElement = e.target;

        const symbol = e.target.dataset.symbol;
        const type = e.target.dataset.type;

        // Set drag data
        e.dataTransfer.setData('text/plain', symbol);
        e.dataTransfer.setData('application/json', JSON.stringify({ symbol, type }));
        e.dataTransfer.effectAllowed = 'copy';

        // Style the dragged element
        e.target.style.opacity = '0.5';

        console.log(`Started dragging: ${symbol}`);
    }

    // Handle drag
    handleDrag(e) {
        // Update drag position for visual feedback
        if (this.ghostElement) {
            this.ghostElement.style.left = e.clientX + 'px';
            this.ghostElement.style.top = e.clientY + 'px';
        }
    }

    // Handle drag end
    handleDragEnd(e) {
        this.isDragging = false;
        e.target.style.opacity = '1';
        this.draggedElement = null;

        // Clean up ghost element
        if (this.ghostElement) {
            this.ghostElement.remove();
            this.ghostElement = null;
        }

        console.log("Drag ended");
    }

    // Handle drag over drop zone
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    // Handle drag enter drop zone
    handleDragEnter(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    }

    // Handle drag leave drop zone
    handleDragLeave(e) {
        // Only remove the class if we're actually leaving the drop zone
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.target.classList.remove('drag-over');
        }
    }

    // Handle drop in mixing area
    handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('drag-over');

        const symbol = e.dataTransfer.getData('text/plain');
        if (symbol && window.gameEngine) {
            window.gameEngine.addIngredient(symbol);
            this.triggerVisualFeedback(e.target, 'drop-success');
        }

        console.log(`Dropped ingredient: ${symbol}`);
    }

    // Handle touch start (mobile)
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const element = e.target;

        this.isDragging = true;
        this.draggedElement = element;
        this.dragOffset = {
            x: touch.clientX - element.getBoundingClientRect().left,
            y: touch.clientY - element.getBoundingClientRect().top
        };

        // Create ghost element for mobile dragging
        this.createGhostElement(element, touch.clientX, touch.clientY);

        element.style.opacity = '0.5';
    }

    // Handle touch move (mobile)
    handleTouchMove(e) {
        if (!this.isDragging || !this.ghostElement) return;

        e.preventDefault();
        const touch = e.touches[0];

        this.ghostElement.style.left = (touch.clientX - this.dragOffset.x) + 'px';
        this.ghostElement.style.top = (touch.clientY - this.dragOffset.y) + 'px';

        // Check if we're over the mixing area
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const mixingArea = document.getElementById('mixing-area');

        if (mixingArea && mixingArea.contains(elementBelow)) {
            mixingArea.classList.add('drag-over');
        } else {
            mixingArea?.classList.remove('drag-over');
        }
    }

    // Handle touch end (mobile)
    handleTouchEnd(e) {
        if (!this.isDragging) return;

        e.preventDefault();
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const mixingArea = document.getElementById('mixing-area');

        // Check if dropped in mixing area
        if (mixingArea && mixingArea.contains(elementBelow)) {
            const symbol = this.draggedElement.dataset.symbol;
            if (symbol && window.gameEngine) {
                window.gameEngine.addIngredient(symbol);
                this.triggerVisualFeedback(mixingArea, 'drop-success');
            }
        }

        // Cleanup
        this.isDragging = false;
        this.draggedElement.style.opacity = '1';
        this.draggedElement = null;
        mixingArea?.classList.remove('drag-over');

        if (this.ghostElement) {
            this.ghostElement.remove();
            this.ghostElement = null;
        }
    }

    // Create ghost element for mobile dragging
    createGhostElement(originalElement, x, y) {
        this.ghostElement = originalElement.cloneNode(true);
        this.ghostElement.style.position = 'fixed';
        this.ghostElement.style.pointerEvents = 'none';
        this.ghostElement.style.zIndex = '9999';
        this.ghostElement.style.opacity = '0.7';
        this.ghostElement.style.transform = 'scale(1.1)';
        this.ghostElement.style.left = (x - this.dragOffset.x) + 'px';
        this.ghostElement.style.top = (y - this.dragOffset.y) + 'px';

        document.body.appendChild(this.ghostElement);
    }

    // Handle ingredient click (backup interaction)
    handleIngredientClick(e) {
        // If drag and drop isn't working, allow click to add ingredients
        if (!this.isDragging) {
            const symbol = e.target.dataset.symbol;
            if (symbol && window.gameEngine) {
                window.gameEngine.addIngredient(symbol);
                this.triggerVisualFeedback(e.target, 'click-success');
                console.log(`Clicked ingredient: ${symbol}`);
            }
        }
    }

    // Set up button interactions
    setupButtons() {
        // Serve button
        const serveBtn = document.getElementById('serve-btn');
        if (serveBtn) {
            serveBtn.addEventListener('click', () => {
                if (window.gameEngine) {
                    window.gameEngine.serveCustomer();
                    this.triggerVisualFeedback(serveBtn, 'button-click');
                }
            });
        }

        // Clear button
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (window.gameEngine) {
                    window.gameEngine.clearCounter();
                    this.triggerVisualFeedback(clearBtn, 'button-click');
                }
            });
        }

        // Timer toggle button
        const timerToggleBtn = document.getElementById('timer-toggle');
        if (timerToggleBtn) {
            timerToggleBtn.addEventListener('click', () => {
                if (window.gameEngine) {
                    window.gameEngine.toggleTimers();
                    this.triggerVisualFeedback(timerToggleBtn, 'button-click');
                }
            });
        }

        // Add hover effects
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });
    }

    // Set up keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'enter':
                case ' ':
                    e.preventDefault();
                    if (window.gameEngine) {
                        window.gameEngine.serveCustomer();
                    }
                    break;

                case 'escape':
                case 'c':
                    e.preventDefault();
                    if (window.gameEngine) {
                        window.gameEngine.clearCounter();
                    }
                    break;

                case 'p':
                    e.preventDefault();
                    if (window.gameEngine) {
                        window.gameEngine.togglePause();
                    }
                    break;

                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                    e.preventDefault();
                    const customerIndex = parseInt(e.key) - 1;
                    if (window.gameEngine && window.gameEngine.customers[customerIndex]) {
                        window.gameEngine.setActiveCustomer(window.gameEngine.customers[customerIndex]);
                    }
                    break;

                // Quick ingredient shortcuts
                case 'q':
                    e.preventDefault();
                    this.addIngredientBySymbol('🍋');
                    break;
                case 'w':
                    e.preventDefault();
                    this.addIngredientBySymbol('🍓');
                    break;
                case 'e':
                    e.preventDefault();
                    this.addIngredientBySymbol('🥝');
                    break;
                case 'a':
                    e.preventDefault();
                    this.addIngredientBySymbol('🥤');
                    break;
                case 's':
                    e.preventDefault();
                    this.addIngredientBySymbol('🔀');
                    break;
                case 'd':
                    e.preventDefault();
                    this.addIngredientBySymbol('➡️');
                    break;
                case 'n':
                    e.preventDefault();
                    this.addIngredientBySymbol('❌');
                    break;
            }
        });

        // Show keyboard shortcuts hint
        this.showKeyboardHints();
    }

    // Add ingredient by symbol (for keyboard shortcuts)
    addIngredientBySymbol(symbol) {
        if (window.gameEngine) {
            window.gameEngine.addIngredient(symbol);

            // Find and flash the corresponding ingredient button
            const ingredientBtn = document.querySelector(`.ingredient[data-symbol="${symbol}"]`);
            if (ingredientBtn) {
                this.triggerVisualFeedback(ingredientBtn, 'keyboard-shortcut');
            }
        }
    }

    // Show keyboard shortcuts in tutorial
    showKeyboardHints() {
        const hints = `
            <strong>Keyboard Shortcuts:</strong><br>
            Q/W/E = 🍋/🍓/🥝 fruits | A/S/D = 🥤/🔀/➡️ bar tools | N = ❌ unavailable<br>
            ENTER/SPACE = Serve | ESC/C = Clear | P = Pause | L = Toggle Legend | 1-5 = Select customer
        `;

        // Add hints to tutorial after a delay
        setTimeout(() => {
            const tutorialContent = document.getElementById('tutorial-content');
            if (tutorialContent) {
                tutorialContent.innerHTML += `<br><small>${hints}</small>`;
            }
        }, 5000);
    }

    // Set up mobile-specific features
    setupMobileSupport() {
        if (this.isTouchDevice) {
            // Prevent default touch behaviors that might interfere
            document.addEventListener('touchmove', (e) => {
                if (this.isDragging) {
                    e.preventDefault();
                }
            }, { passive: false });

            // Add mobile-specific styles
            document.body.classList.add('touch-device');
        }

        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.adjustLayoutForMobile();
            }, 100);
        });
    }

    // Set up legend toggle functionality
    setupLegendToggle() {
        const legendHeader = document.getElementById('legend-header');
        const legendContent = document.getElementById('legend-content');
        const legendToggle = document.getElementById('legend-toggle');

        if (legendHeader && legendContent && legendToggle) {
            legendHeader.addEventListener('click', () => {
                const isVisible = legendContent.classList.contains('visible');

                if (isVisible) {
                    legendContent.classList.remove('visible');
                    legendContent.classList.add('hidden');
                    legendToggle.classList.add('collapsed');
                    legendToggle.textContent = '▲';
                } else {
                    legendContent.classList.remove('hidden');
                    legendContent.classList.add('visible');
                    legendToggle.classList.remove('collapsed');
                    legendToggle.textContent = '▼';
                }
            });

            // Add keyboard shortcut for legend toggle
            document.addEventListener('keydown', (e) => {
                if (e.key.toLowerCase() === 'l' && !e.target.matches('input, textarea')) {
                    e.preventDefault();
                    legendHeader.click(); // Trigger the click event
                }
            });
        }
    }

    // Adjust layout for mobile devices
    adjustLayoutForMobile() {
        const gameContainer = document.querySelector('.game-container');
        if (window.innerWidth < 768 && gameContainer) {
            gameContainer.style.gridTemplateAreas = `
                "score score"
                "ingredients ingredients"
                "workspace customers"
                "tutorial tutorial"
            `;
        }
    }

    // Trigger visual feedback for interactions
    triggerVisualFeedback(element, type) {
        const originalTransform = element.style.transform;

        switch (type) {
            case 'drop-success':
                element.style.backgroundColor = 'rgba(39, 174, 96, 0.3)';
                element.style.transform = 'scale(1.05)';
                break;

            case 'click-success':
                element.style.transform = 'scale(0.95)';
                break;

            case 'button-click':
                element.style.transform = 'scale(0.95)';
                break;

            case 'keyboard-shortcut':
                element.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.6)';
                element.style.transform = 'scale(1.1)';
                break;
        }

        // Reset after animation
        setTimeout(() => {
            element.style.backgroundColor = '';
            element.style.boxShadow = '';
            element.style.transform = originalTransform;
        }, 200);
    }

    // Handle window resize
    handleResize() {
        this.adjustLayoutForMobile();
    }

    // Set up solution modal interactions
    setupSolutionModal() {
        const modal = document.getElementById('solution-modal');
        const overlay = document.getElementById('solution-overlay');
        const closeBtn = document.getElementById('solution-close');
        const applySolutionBtn = document.getElementById('apply-solution');
        const showHintBtn = document.getElementById('show-hint');

        // Close modal handlers
        const closeModal = () => {
            modal.classList.remove('show');
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });

        // Apply solution button
        if (applySolutionBtn) {
            applySolutionBtn.addEventListener('click', () => {
                const resultElement = document.getElementById('solution-result');
                const resultFormula = resultElement ? resultElement.textContent : '';
                if (resultFormula && window.gameEngine) {
                    // Clear current formula and apply the solution
                    window.gameEngine.clearCounter();

                    // Add each character of the solution formula
                    for (const symbol of resultFormula) {
                        window.gameEngine.addIngredient(symbol);
                    }

                    closeModal();
                    this.triggerVisualFeedback(applySolutionBtn, 'button-click');
                }
            });
        }

        // Show hint button
        if (showHintBtn) {
            showHintBtn.addEventListener('click', () => {
                const ruleExplanation = document.getElementById('solution-rule-explanation');
                const result = document.getElementById('solution-result');

                // Highlight the rule explanation as the hint
                if (ruleExplanation) {
                    ruleExplanation.style.backgroundColor = '#fff3cd';
                    ruleExplanation.style.border = '2px solid #ffc107';
                    ruleExplanation.style.borderRadius = '4px';
                    ruleExplanation.style.padding = '8px';
                    ruleExplanation.style.fontWeight = 'bold';
                }

                // Highlight the result
                if (result) {
                    result.style.backgroundColor = '#d4edda';
                    result.style.border = '2px solid #28a745';
                    result.style.borderRadius = '4px';
                    result.style.padding = '8px';
                    result.style.fontSize = '18px';
                    result.style.fontWeight = 'bold';
                }

                // Show feedback
                if (window.gameEngine) {
                    window.gameEngine.showFeedback('Hint: Focus on the highlighted rule and result!', 'success');
                }

                this.triggerVisualFeedback(showHintBtn, 'button-click');
            });
        }
    }

    // Clean up event listeners
    destroy() {
        // Remove event listeners to prevent memory leaks
        document.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
    }
}

// Initialize UI interactions
const uiInteractions = new UIInteractions();

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIInteractions, uiInteractions };
} else {
    // Browser environment - attach to window
    window.UIInteractions = UIInteractions;
    window.uiInteractions = uiInteractions;
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.uiInteractions) {
        window.uiInteractions.handleResize();
    }
});