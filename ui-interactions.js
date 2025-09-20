// UI Interactions for Boolean Smoothie Shop

class UIInteractions {
    constructor() {
        // Initialize interactions when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log("Initializing UI interactions...");
        this.setupButtons();
        this.setupKeyboardShortcuts();
        this.setupMobileSupport();
        this.setupLegendToggle();
        this.setupSolutionModal();
    }

    // Drag and drop functionality has been removed - now using premise selection system

    // Drag methods removed - using premise selection system

    // Drag method removed

    // Drag end method removed

    // All drag drop zone methods removed

    // All touch methods removed - using premise selection system

    // Ghost element and ingredient click methods removed - using premise selection system

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

        // Clear button (now clears selection)
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (window.gameEngine) {
                    window.gameEngine.selectedPremises = [];
                    window.gameEngine.updateInventoryDisplay();
                    window.gameEngine.updateSelectedPremisesDisplay();
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

        // Debug game over button
        const debugGameOverBtn = document.getElementById('debug-gameover');
        if (debugGameOverBtn) {
            debugGameOverBtn.addEventListener('click', () => {
                if (window.gameEngine && window.gameEngine.gameState.isPlaying) {
                    window.gameEngine.gameOver();
                    this.triggerVisualFeedback(debugGameOverBtn, 'button-click');
                }
            });
        }

        // Play button (menu)
        const playBtn = document.getElementById('play-button');
        console.log('Play button found:', playBtn);
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                console.log('Play button clicked!');
                this.startGame();
                this.triggerVisualFeedback(playBtn, 'button-click');
            });
        } else {
            console.error('Play button not found!');
        }

        // Rule buttons
        document.querySelectorAll('.rule-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const ruleKey = btn.getAttribute('data-rule');
                if (window.gameEngine && ruleKey) {
                    window.gameEngine.applyRule(ruleKey);
                    this.triggerVisualFeedback(btn, 'button-click');
                }
            });
        });

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

    // Start the game from menu
    startGame() {
        console.log('startGame() called');

        // Get infinite patience setting
        const infinitePatienceToggle = document.getElementById('infinite-patience-toggle');
        const infinitePatience = infinitePatienceToggle ? infinitePatienceToggle.checked : false;
        console.log('Infinite patience:', infinitePatience);

        // Hide menu and show game
        const menuScreen = document.getElementById('menu-screen');
        const gameContainer = document.getElementById('game-container');
        console.log('Menu screen:', menuScreen, 'Game container:', gameContainer);

        if (menuScreen && gameContainer) {
            console.log('Hiding menu, showing game');
            menuScreen.style.display = 'none';
            gameContainer.style.display = 'grid';
        }

        // Initialize game with settings
        console.log('Game engine:', window.gameEngine);
        if (window.gameEngine) {
            console.log('Initializing game engine');
            window.gameEngine.gameState.timersDisabled = infinitePatience;
            window.gameEngine.init();
        } else {
            console.error('Game engine not found!');
        }

        console.log(`Game started with infinite patience: ${infinitePatience}`);
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
                        window.gameEngine.clearInventory();
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
            window.gameEngine.addToInventory(symbol);

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
                    window.gameEngine.clearInventory();

                    // Add each character of the solution formula
                    for (const symbol of resultFormula) {
                        window.gameEngine.addToInventory(symbol);
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
        // Note: These methods were removed with drag-and-drop system
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