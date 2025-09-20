// Game Engine for Boolean Smoothie Shop

class GameEngine {
    constructor() {
        this.gameState = {
            level: 4, // Start at level 4 to test complex scenarios
            score: 0,
            servedCustomers: 0,
            currentCombo: 0,
            maxCombo: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            hearts: 3,
            maxHearts: 3,
            isPlaying: false,
            isPaused: false,
            startTime: null,
            timersDisabled: false
        };

        this.customers = [];
        this.activeCustomer = null;
        this.inventory = [];
        this.selectedPremises = [];
        this.gameLoop = null;
        this.tutorialStep = 0;

        // Bind methods to preserve 'this' context
        this.update = this.update.bind(this);
        this.serveCustomer = this.serveCustomer.bind(this);
        this.clearInventory = this.clearInventory.bind(this);

        this.achievements = new Set();
        this.timers = new Map();
    }

    // Initialize the game
    init() {
        console.log("Initializing Boolean Smoothie Shop Engine...");
        this.gameState.isPlaying = true;
        this.gameState.startTime = Date.now();

        // Generate initial customers
        this.generateCustomer();
        this.generateCustomer();

        // Start the game loop
        this.startGameLoop();

        // Update UI
        this.updateUI();

        // Show welcome tutorial
        this.showTutorial('welcome');
    }

    // Generate a new customer with a logical inference request
    generateCustomer() {
        if (this.customers.length >= this.getCurrentDifficultySettings().maxCustomers) {
            return;
        }

        const persona = this.getRandomPersona();
        const difficultySettings = this.getCurrentDifficultySettings();
        const availableRules = difficultySettings.availableRules;
        const selectedRule = availableRules[Math.floor(Math.random() * availableRules.length)];
        console.log('Selected rule:', selectedRule);
        console.log('Available rules:', availableRules);
        console.log('All templates:', Object.keys(window.GameData.INFERENCE_TEMPLATES));

        const template = window.GameData.INFERENCE_TEMPLATES[selectedRule];
        console.log('Template found:', template);

        if (!template) {
            console.error(`Template not found for rule: ${selectedRule}`);
            return;
        }

        // Generate premises and conclusion based on the template
        const customerRequest = this.generateInferenceRequest(template, selectedRule);

        const customer = {
            id: Date.now() + Math.random(),
            persona: persona,
            request: customerRequest,
            arrivalTime: Date.now(),
            patience: persona.patience,
            maxPatience: persona.patience,
            satisfied: false,
            timeoutWarning: false
        };

        this.customers.push(customer);

        // Set as active customer if none exists
        if (!this.activeCustomer) {
            this.setActiveCustomer(customer);
        }

        this.updateCustomerDisplay();
        console.log(`New customer ${persona.name} wants: ${customerRequest.explanation}`);
    }

    // Generate a specific inference request based on a template
    generateInferenceRequest(template, ruleKey) {
        const propositions = ['P', 'Q', 'R'];

        // For demo purposes, we'll use the template directly
        // In a full implementation, this would generate varied propositions
        const request = {
            rule: ruleKey,
            premises: [...template.premises], // Copy the array
            expectedConclusion: template.conclusion,
            explanation: template.explanation,
            context: template.examples[0]?.context || template.description,
            difficulty: template.difficulty,
            isMultiStep: template.isMultiStep || false,
            steps: template.steps || []
        };

        // For multi-step problems, track intermediate goals
        if (template.isMultiStep && template.steps) {
            request.intermediateResults = [];
            request.currentStep = 0;
            request.solutionPath = template.steps.map(step => ({
                rule: step.rule,
                premises: step.premises,
                expectedResult: step.result,
                completed: false
            }));
        }

        return request;
    }

    // Set a customer as the active customer
    setActiveCustomer(customer) {
        this.activeCustomer = customer;

        // Initialize inventory with customer's premises
        this.initializeInventory(customer);

        this.updateCustomerDisplay();

        // Update tutorial based on the rule
        if (customer && customer.request) {
            this.showTutorial(customer.request.rule);
        }
    }

    // Initialize inventory with customer premises
    initializeInventory(customer) {
        if (customer && customer.request && customer.request.premises) {
            this.inventory = [...customer.request.premises]; // Copy premises to inventory
            this.selectedPremises = []; // Clear any previous selections
            this.updateInventoryDisplay();
            this.updateSelectedPremisesDisplay();
            console.log(`Inventory initialized with premises: ${this.inventory.join(', ')}`);
            console.log(`Target conclusion: ${customer.request.expectedConclusion}`);
        }
    }

    // Handle serving a customer (check if target conclusion is in inventory)
    serveCustomer() {
        if (!this.activeCustomer) {
            this.showFeedback("No customer to serve!", "error");
            return;
        }

        const customer = this.activeCustomer;
        const targetConclusion = customer.request.expectedConclusion;
        const startTime = customer.arrivalTime;
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log('Checking inventory for target conclusion:');
        console.log('Current inventory:', this.inventory);
        console.log('Target conclusion:', targetConclusion);

        this.gameState.totalAnswers++;

        // Check if target conclusion exists in inventory
        if (this.inventory.includes(targetConclusion)) {
            this.handleCorrectAnswer(customer, responseTime);
        } else {
            this.handleIncorrectAnswer(customer, `Target conclusion "${targetConclusion}" not found in inventory`);
        }

        // Clear inventory and move to next customer
        this.clearInventory();
        this.removeCustomer(customer);
        this.generateCustomer(); // Generate a new customer
    }

    // Add item to inventory (when rule is applied)
    addToInventory(item) {
        if (!this.inventory.includes(item)) {
            this.inventory.push(item);
            this.updateInventoryDisplay();
            console.log(`Added "${item}" to inventory. Current inventory: ${this.inventory.join(', ')}`);
        }
    }

    // Check if target conclusion exists in inventory
    hasTargetConclusion() {
        if (!this.activeCustomer) return false;
        const target = this.activeCustomer.request.expectedConclusion;
        return this.inventory.includes(target);
    }

    // Handle a correct answer
    handleCorrectAnswer(customer, responseTime) {
        this.gameState.correctAnswers++;
        this.gameState.servedCustomers++;
        this.gameState.currentCombo++;
        this.gameState.maxCombo = Math.max(this.gameState.maxCombo, this.gameState.currentCombo);

        // Calculate score
        const baseScore = window.GameData.SCORING.basePoints.correct;
        const difficultyMultiplier = window.GameData.SCORING.bonuses.difficulty[customer.request.difficulty] || 1.0;
        const comboMultiplier = Math.min(
            1 + (this.gameState.currentCombo - 1) * window.GameData.SCORING.bonuses.combo.multiplier,
            window.GameData.SCORING.bonuses.combo.maxMultiplier
        );

        // Time bonus
        let timeBonus = 0;
        if (responseTime < 10000) {
            timeBonus = window.GameData.SCORING.bonuses.speed.fast;
        } else if (responseTime < 20000) {
            timeBonus = window.GameData.SCORING.bonuses.speed.medium;
        }

        const totalScore = Math.floor((baseScore + timeBonus) * difficultyMultiplier * comboMultiplier);
        this.gameState.score += totalScore;

        // Show feedback
        this.showFeedback(`Correct! +${totalScore} points`, "success");

        // Check for achievements
        this.checkAchievements();

        // Check for level up
        this.checkLevelUp();

        console.log(`Correct answer! Score: ${totalScore}, Combo: ${this.gameState.currentCombo}`);
    }

    // Handle an incorrect answer
    handleIncorrectAnswer(customer, error) {
        this.gameState.currentCombo = 0;
        const penalty = window.GameData.SCORING.basePoints.incorrect;
        this.gameState.score = Math.max(0, this.gameState.score + penalty);

        // Lose a heart for incorrect answer
        this.loseHeart(`Incorrect answer: ${error}`);

        this.showFeedback(`Incorrect: ${error}`, "error");
        console.log(`Incorrect answer: ${error}`);
    }

    // Remove a customer from the queue
    removeCustomer(customer) {
        const index = this.customers.indexOf(customer);
        if (index > -1) {
            this.customers.splice(index, 1);
        }

        // Set next active customer
        if (this.activeCustomer === customer) {
            this.activeCustomer = this.customers.length > 0 ? this.customers[0] : null;
            if (this.activeCustomer) {
                this.setActiveCustomer(this.activeCustomer);
            }
        }

        this.updateCustomerDisplay();
    }

    // Clear the inventory
    clearInventory() {
        this.inventory = [];
        this.selectedPremises = [];
        this.updateInventoryDisplay();
        this.updateSelectedPremisesDisplay();
    }

    // Apply an inference rule to selected premises
    applyRule(ruleKey) {
        if (this.selectedPremises.length === 0) {
            this.showFeedback("Please select premises first!", "error");
            return;
        }

        // Get the rule template
        const template = window.GameData.INFERENCE_TEMPLATES[ruleKey];
        if (!template) {
            this.showFeedback("Invalid rule selected!", "error");
            return;
        }

        // Apply rule logic (simplified for now)
        const result = this.applyInferenceRule(this.selectedPremises, ruleKey);
        if (result) {
            this.addToInventory(result);
            this.selectedPremises = []; // Clear selection after applying rule
            this.updateInventoryDisplay();
            this.updateSelectedPremisesDisplay(); // Update the selected premises display to show it's cleared
            this.showFeedback(`Applied ${template.name}: ${result}`, "success");
        } else {
            this.showFeedback("Rule cannot be applied to selected premises!", "error");
        }
    }

    // Apply inference rule logic to selected premises
    applyInferenceRule(premises, ruleKey) {
        if (!premises || premises.length === 0) return null;

        switch (ruleKey) {
            case 'modusPonens':
                // Look for P->Q and P, return Q
                const implication = premises.find(p => p.includes('➡️'));
                const antecedent = premises.find(p => !p.includes('➡️') && !p.includes('❌'));

                if (implication && antecedent) {
                    const [left, right] = implication.split('➡️');
                    if (left === antecedent) {
                        return right;
                    }
                }
                break;

            case 'simplification':
                // Look for P🥤Q (P AND Q), return P or Q
                const conjunction = premises.find(p => p.includes('🥤'));
                if (conjunction) {
                    const parts = conjunction.split('🥤');
                    return parts[0]; // Return first part for simplicity
                }
                break;

            case 'chainedModusPonens':
                // Complex chained modus ponens: 🍋➡️🍓, 🍓➡️🥝, 🍋 → 🥝
                const implications = premises.filter(p => p.includes('➡️'));
                const facts = premises.filter(p => !p.includes('➡️') && !p.includes('❌'));

                if (implications.length >= 2 && facts.length >= 1) {
                    // Find a chain: fact → intermediate → conclusion
                    for (const fact of facts) {
                        for (const impl1 of implications) {
                            const [left1, right1] = impl1.split('➡️');
                            if (left1 === fact) {
                                // Found first link, look for second
                                for (const impl2 of implications) {
                                    const [left2, right2] = impl2.split('➡️');
                                    if (left2 === right1) {
                                        return right2; // Final conclusion
                                    }
                                }
                            }
                        }
                    }
                }
                break;

            case 'complexDisjunction':
                // Complex disjunction chain: 🍋🔀🍓, 🍓🔀🥝, ❌🍋 → 🥝
                const disjunctions = premises.filter(p => p.includes('🔀'));
                const negations = premises.filter(p => p.includes('❌'));

                if (disjunctions.length >= 2 && negations.length >= 1) {
                    // Start with what's not negated
                    const negatedItem = negations[0].replace('❌', '');

                    // Find first disjunction that contains the negated item
                    for (const disj1 of disjunctions) {
                        const [left1, right1] = disj1.split('🔀');
                        if (left1 === negatedItem) {
                            // Take the right option, look for it in next disjunction
                            for (const disj2 of disjunctions) {
                                if (disj2 !== disj1) {
                                    const [left2, right2] = disj2.split('🔀');
                                    if (left2 === right1) {
                                        return right2;
                                    }
                                }
                            }
                        }
                    }
                }
                break;

            case 'mixedLogicChain':
                // Mixed logic: 🍋🥤🍓, 🍓➡️🥝, ❌🍋 → 🥝
                const mixture = premises.find(p => p.includes('🥤'));
                const mixedImplication = premises.find(p => p.includes('➡️'));
                const mixedNegation = premises.find(p => p.includes('❌'));

                if (mixture && mixedImplication) {
                    // Extract from mixture (avoiding negated item)
                    const mixParts = mixture.split('🥤');
                    const negatedItem = mixedNegation ? mixedNegation.replace('❌', '') : null;

                    // Choose the non-negated part
                    let extractedItem;
                    if (negatedItem && mixParts[0] === negatedItem) {
                        extractedItem = mixParts[1];
                    } else {
                        extractedItem = mixParts[0];
                    }

                    // Apply implication
                    const [implLeft, implRight] = mixedImplication.split('➡️');
                    if (implLeft === extractedItem) {
                        return implRight;
                    }
                }
                break;

            case 'addition':
                // From P, can derive P🔀Q (P OR Q) - but need another premise for Q
                if (premises.length >= 2) {
                    return premises[0] + '🔀' + premises[1];
                }
                break;

            case 'disjunctiveSyllogism':
                // P🔀Q and ❌P, return Q
                const disjunction = premises.find(p => p.includes('🔀'));
                const disjNegation = premises.find(p => p.includes('❌'));

                if (disjunction && disjNegation) {
                    const [left, right] = disjunction.split('🔀');
                    const negatedPart = disjNegation.replace('❌', '');
                    if (left === negatedPart) {
                        return right;
                    } else if (right === negatedPart) {
                        return left;
                    }
                }
                break;

            default:
                console.log(`Rule ${ruleKey} not implemented yet`);
                return null;
        }

        return null;
    }

    // Get current difficulty settings
    getCurrentDifficultySettings() {
        return window.GameData.DIFFICULTY_SETTINGS[this.gameState.level] || window.GameData.DIFFICULTY_SETTINGS[1];
    }

    // Get a random customer persona
    getRandomPersona() {
        const personas = window.GameData.CUSTOMER_PERSONAS;
        return personas[Math.floor(Math.random() * personas.length)];
    }

    // Check for level progression
    checkLevelUp() {
        const requiredCustomers = this.gameState.level * 5; // 5 customers per level
        if (this.gameState.servedCustomers >= requiredCustomers && this.gameState.level < 6) {
            this.gameState.level++;
            this.showFeedback(`Level Up! Welcome to ${this.getCurrentDifficultySettings().name}`, "success");
            this.showTutorial('levelUp');
            console.log(`Level up! Now level ${this.gameState.level}`);
        }
    }

    // Check for achievements
    checkAchievements() {
        // First Service achievement
        if (this.gameState.servedCustomers === 1 && !this.achievements.has('firstServe')) {
            this.unlockAchievement('firstServe');
        }

        // Perfect Combo achievement
        if (this.gameState.currentCombo === 10 && !this.achievements.has('perfectCombo')) {
            this.unlockAchievement('perfectCombo');
        }

        // More achievement checks can be added here
    }

    // Unlock an achievement
    unlockAchievement(achievementKey) {
        this.achievements.add(achievementKey);
        const achievement = window.GameData.ACHIEVEMENTS[achievementKey];
        if (achievement) {
            this.gameState.score += achievement.points;
            this.showFeedback(`Achievement Unlocked: ${achievement.name} (+${achievement.points} points)`, "success");
            console.log(`Achievement unlocked: ${achievement.name}`);
        }
    }

    // Main game loop
    update() {
        if (!this.gameState.isPlaying || this.gameState.isPaused) {
            return;
        }

        const currentTime = Date.now();

        // Update customer patience (unless timers are disabled)
        if (!this.gameState.timersDisabled) {
            this.customers.forEach(customer => {
                const elapsedTime = currentTime - customer.arrivalTime;
                const remainingPatience = Math.max(0, customer.maxPatience - elapsedTime);
                customer.patience = remainingPatience;

                // Timeout warning at 25% patience
                if (remainingPatience < customer.maxPatience * 0.25 && !customer.timeoutWarning) {
                    customer.timeoutWarning = true;
                    if (customer === this.activeCustomer) {
                        this.showTutorial('patience');
                    }
                }

                // Customer timeout
                if (remainingPatience <= 0) {
                    this.handleCustomerTimeout(customer);
                }
            });
        } else {
            // Keep patience at max when timers are disabled
            this.customers.forEach(customer => {
                customer.patience = customer.maxPatience;
            });
        }

        this.updateCustomerDisplay();
        this.updateUI();
    }

    // Handle customer timeout
    handleCustomerTimeout(customer) {
        this.gameState.currentCombo = 0;
        const penalty = window.GameData.SCORING.basePoints.timeout;
        this.gameState.score = Math.max(0, this.gameState.score + penalty);

        // Lose a heart for customer timeout
        this.loseHeart(`${customer.persona.name} left due to timeout`);

        this.showFeedback(`${customer.persona.name} left! ${penalty} points`, "error");
        this.removeCustomer(customer);
        this.generateCustomer();
    }

    // Lose a heart and check for game over
    loseHeart(reason) {
        if (this.gameState.hearts > 0) {
            this.gameState.hearts--;

            // Deduct points for losing a heart
            const heartPenalty = 50;
            this.gameState.score = Math.max(0, this.gameState.score - heartPenalty);

            console.log(`Lost a heart: ${reason}. Hearts remaining: ${this.gameState.hearts}`);

            // Check for game over
            if (this.gameState.hearts <= 0) {
                this.gameOver();
            }
        }
    }

    // Handle game over
    gameOver() {
        this.gameState.isPlaying = false;
        this.stopGameLoop();

        const stats = this.getStats();

        // Show game over feedback
        this.showFeedback(`Game Over! Final Score: ${this.gameState.score}`, "error");

        // Show game over screen after a short delay
        setTimeout(() => {
            const confirmed = confirm(
                `Game Over!\n\n` +
                `Final Score: ${stats.score}\n` +
                `Customers Served: ${stats.servedCustomers}\n` +
                `Accuracy: ${Math.round(stats.accuracy)}%\n` +
                `Max Combo: ${stats.maxCombo}\n\n` +
                `Would you like to play again?`
            );

            if (confirmed) {
                this.restartGame();
            } else {
                // Return to menu
                this.showMenu();
            }
        }, 2000);

        console.log('Game Over! Stats:', stats);
    }

    // Restart the game
    restartGame() {
        // Reset game state
        this.gameState = {
            level: 1,
            score: 0,
            servedCustomers: 0,
            currentCombo: 0,
            maxCombo: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            hearts: 3,
            maxHearts: 3,
            isPlaying: false,
            isPaused: false,
            startTime: null,
            timersDisabled: false
        };

        // Clear customers and reset UI
        this.customers = [];
        this.activeCustomer = null;
        this.inventory = [];
        this.selectedPremises = [];
        this.achievements.clear();
        this.timers.clear();

        // Restart the game
        this.init();
    }

    // Show menu screen
    showMenu() {
        const gameContainer = document.getElementById('game-container');
        const menuScreen = document.getElementById('menu-screen');

        if (gameContainer && menuScreen) {
            gameContainer.style.display = 'none';
            menuScreen.style.display = 'flex';
        }
    }

    // Start the game loop
    startGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.gameLoop = setInterval(this.update, 100); // Update every 100ms
    }

    // Stop the game loop
    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    // Update the user interface
    updateUI() {
        // Update score panel
        document.getElementById('current-score').textContent = this.gameState.score;
        document.getElementById('combo-multiplier').textContent = `${this.gameState.currentCombo}x`;
        document.getElementById('level').textContent = this.gameState.level;
        document.getElementById('served-customers').textContent = this.gameState.servedCustomers;

        // Update hearts display
        const heartsDisplay = document.getElementById('hearts-display');
        if (heartsDisplay) {
            const hearts = '❤️'.repeat(this.gameState.hearts) + '🤍'.repeat(this.gameState.maxHearts - this.gameState.hearts);
            heartsDisplay.textContent = hearts;
        }

        // Update accuracy
        const accuracy = this.gameState.totalAnswers > 0
            ? Math.round((this.gameState.correctAnswers / this.gameState.totalAnswers) * 100)
            : 100;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    }

    // Update customer display
    updateCustomerDisplay() {
        const customerQueue = document.getElementById('customer-queue');
        customerQueue.innerHTML = '';

        this.customers.forEach(customer => {
            const customerElement = this.createCustomerElement(customer);
            customerQueue.appendChild(customerElement);
        });
    }

    // Create a customer HTML element
    createCustomerElement(customer) {
        const div = document.createElement('div');
        div.className = `customer ${customer === this.activeCustomer ? 'active' : ''}`;
        div.onclick = () => this.setActiveCustomer(customer);

        const patiencePercent = (customer.patience / customer.maxPatience) * 100;

        const template = window.GameData.INFERENCE_TEMPLATES[customer.request.rule];
        const ruleName = template ? template.name : 'Unknown Rule';

        div.innerHTML = `
            <div class="customer-name">${customer.persona.avatar} ${customer.persona.name}</div>
            <div class="customer-request">${customer.request.context}</div>
            <div class="customer-premises">
                <strong>Premises:</strong> ${customer.request.premises.join(', ')}<br>
                <strong>Find:</strong> ${customer.request.expectedConclusion}
            </div>
            <div class="customer-rule">
                <strong>Rule:</strong> ${ruleName}
            </div>
            <div class="customer-solution">
                <strong>Answer:</strong> <span class="solution-formula">${customer.request.expectedConclusion}</span>
            </div>
            <div class="customer-patience">
                <div class="patience-bar" style="width: ${patiencePercent}%"></div>
            </div>
        `;

        return div;
    }

    // Show solution modal for a specific customer
    showSolution(customerId) {
        const customer = this.customers.find(c => c.id == customerId);
        if (!customer) {
            return;
        }

        const modal = document.getElementById('solution-modal');
        const title = document.getElementById('solution-title');
        const avatar = document.getElementById('solution-avatar');
        const name = document.getElementById('solution-name');
        const request = document.getElementById('solution-request');
        const technique = document.getElementById('solution-technique');
        const premises = document.getElementById('solution-premises');
        const ruleExplanation = document.getElementById('solution-rule-explanation');
        const result = document.getElementById('solution-result');

        if (!modal) {
            return;
        }

        // Update modal content
        title.textContent = `Recipe Solution for ${customer.persona.name}`;
        if (avatar) avatar.textContent = customer.persona.avatar;
        if (name) name.textContent = customer.persona.name;
        if (request) request.textContent = customer.request.context;

        const template = window.GameData.INFERENCE_TEMPLATES[customer.request.rule];
        if (technique) technique.textContent = template.name;

        if (premises) {
            premises.innerHTML = customer.request.premises.map(premise =>
                `<span class="premise-item">${premise}</span>`
            ).join(' ');
        }

        if (ruleExplanation) ruleExplanation.textContent = template.explanation;
        if (result) result.textContent = customer.request.expectedConclusion;

        // Show modal with a small delay to ensure all content is loaded
        setTimeout(() => {
            modal.classList.add('show');
            console.log('Modal should now be visible');
        }, 10);
    }

    // Generate step-by-step solution for a request
    generateSolution(request) {
        const template = window.GameData.INFERENCE_TEMPLATES[request.rule];
        const steps = [];
        let formula = '';

        switch (request.rule) {
            case 'modusPonens':
                steps.push(`Start with the recipe rule: ${request.premises[0]}`);
                steps.push(`We have the ingredient: ${request.premises[1]}`);
                steps.push(`Following the Classic Recipe technique, since we have ${request.premises[1]} and the rule says ${request.premises[0]}, we can serve ${request.expectedConclusion}`);
                formula = request.expectedConclusion;
                break;

            case 'modusTollens':
                steps.push(`Start with the recipe rule: ${request.premises[0]}`);
                steps.push(`Customer refuses: ${request.premises[1]}`);
                steps.push(`Using Reverse Logic, if customer won't accept ${request.expectedConclusion.replace('❌', '')}, then we cannot use ${request.expectedConclusion}`);
                formula = request.expectedConclusion;
                break;

            case 'hypotheticalSyllogism':
                steps.push(`First recipe rule: ${request.premises[0]}`);
                steps.push(`Second recipe rule: ${request.premises[1]}`);
                steps.push(`Using Recipe Chain technique, we can combine these rules to create a direct path: ${request.expectedConclusion}`);
                formula = request.expectedConclusion;
                break;

            case 'disjunctiveSyllogism':
                steps.push(`Recipe allows choice: ${request.premises[0]}`);
                steps.push(`Ingredient unavailable: ${request.premises[1]}`);
                steps.push(`Using Either-Or Choice, since we can't use ${request.premises[1].replace('❌', '')}, we must use ${request.expectedConclusion}`);
                formula = request.expectedConclusion;
                break;

            case 'simplification':
                steps.push(`Mixed ingredients available: ${request.premises[0]}`);
                steps.push(`Using Ingredient Split technique, we can extract individual components`);
                steps.push(`From the mix, we can serve just: ${request.expectedConclusion}`);
                formula = request.expectedConclusion;
                break;

            default:
                steps.push(`Apply the ${template.name} technique`);
                steps.push(`Follow the recipe rules to reach the conclusion`);
                formula = request.expectedConclusion;
        }

        return { steps, formula };
    }

    // Update inventory display
    updateInventoryDisplay() {
        const inventoryArea = document.getElementById('inventory-area');
        const placeholder = document.querySelector('.inventory-placeholder');
        const inventoryItems = document.getElementById('inventory-items');

        if (!inventoryArea || !inventoryItems) return;

        if (this.inventory.length === 0) {
            placeholder.style.display = 'block';
            inventoryItems.style.display = 'none';
        } else {
            placeholder.style.display = 'none';
            inventoryItems.style.display = 'flex';

            // Clear existing items
            inventoryItems.innerHTML = '';

            // Add inventory items
            this.inventory.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.className = 'inventory-item';
                itemElement.textContent = item;
                itemElement.dataset.premise = item;

                // Distinguish between original premises and derived items
                if (this.activeCustomer && this.activeCustomer.request.premises.includes(item)) {
                    itemElement.classList.add('premise');
                } else {
                    itemElement.classList.add('derived');
                }

                // Check if selected
                if (this.isPremiseSelected(item)) {
                    itemElement.classList.add('selected');
                }

                // Add click handler
                itemElement.addEventListener('click', () => {
                    this.togglePremiseSelection(item);
                });

                inventoryItems.appendChild(itemElement);
            });
        }

        console.log('Updated inventory display:', this.inventory);
    }

    // Toggle premise selection
    togglePremiseSelection(premise) {
        const index = this.selectedPremises.indexOf(premise);
        if (index > -1) {
            this.selectedPremises.splice(index, 1);
        } else {
            this.selectedPremises.push(premise);
        }
        console.log('Selected premises:', this.selectedPremises);
        this.updateInventoryDisplay();
        this.updateSelectedPremisesDisplay();
    }

    // Update selected premises display
    updateSelectedPremisesDisplay() {
        const premisesDisplay = document.getElementById('premises-display');
        if (!premisesDisplay) return;

        // Clear existing display
        premisesDisplay.innerHTML = '';

        if (this.selectedPremises.length === 0) {
            const noSelection = document.createElement('div');
            noSelection.className = 'no-selection';
            noSelection.textContent = 'Select ingredients from your inventory first';
            premisesDisplay.appendChild(noSelection);
        } else {
            this.selectedPremises.forEach(premise => {
                const premiseElement = document.createElement('div');
                premiseElement.className = 'selected-premise-item';
                premiseElement.textContent = premise;
                premisesDisplay.appendChild(premiseElement);
            });
        }
    }

    // Check if premise is selected
    isPremiseSelected(premise) {
        return this.selectedPremises.includes(premise);
    }

    // Get color for ingredient based on type
    getIngredientColor(symbol) {
        if (['🍋', '🍓', '🥝'].includes(symbol)) return '#e67e22'; // Orange for fruits
        if (['🥤', '🔀', '➡️', '🫙', '🍸'].includes(symbol)) return '#27ae60'; // Green for bar tools
        if (symbol === '❌') return '#e74c3c'; // Red for negation
        return '#95a5a6'; // Gray for unknown
    }

    // Show feedback message
    showFeedback(message, type) {
        const feedback = document.getElementById('feedback-message');
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
        feedback.classList.add('show');

        setTimeout(() => {
            feedback.classList.remove('show');
        }, 3000);
    }

    // Show tutorial message
    showTutorial(messageKey) {
        const tutorialContent = document.getElementById('tutorial-content');
        const message = window.GameData.TUTORIAL_MESSAGES[messageKey];
        if (message && tutorialContent) {
            tutorialContent.innerHTML = message;
        }
    }

    // Pause/unpause the game
    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        console.log(`Game ${this.gameState.isPaused ? 'paused' : 'resumed'}`);
    }

    // Toggle customer timers for testing
    toggleTimers() {
        this.gameState.timersDisabled = !this.gameState.timersDisabled;
        const button = document.getElementById('timer-toggle');
        if (button) {
            if (this.gameState.timersDisabled) {
                button.classList.add('disabled');
                button.title = 'Customer timers disabled (testing mode)';
                this.showFeedback('Customer timers disabled for testing', 'success');
            } else {
                button.classList.remove('disabled');
                button.title = 'Toggle customer timers for testing';
                this.showFeedback('Customer timers enabled', 'success');
            }
        }
        console.log(`Customer timers ${this.gameState.timersDisabled ? 'disabled' : 'enabled'}`);
    }

    // Get game statistics
    getStats() {
        const playTime = Date.now() - this.gameState.startTime;
        return {
            ...this.gameState,
            playTime: playTime,
            accuracy: this.gameState.totalAnswers > 0
                ? (this.gameState.correctAnswers / this.gameState.totalAnswers) * 100
                : 100,
            achievements: Array.from(this.achievements)
        };
    }
}

// Create global game engine instance
const gameEngine = new GameEngine();

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameEngine, gameEngine };
} else {
    // Browser environment - attach to window
    window.GameEngine = GameEngine;
    window.gameEngine = gameEngine;
}

// Initialize game engine when DOM is loaded (but don't auto-start the game)
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, game engine ready...");

    // Game engine is ready but won't auto-start - waiting for menu interaction
    if (typeof window.gameEngine === 'undefined') {
        console.error("Game engine not available!");
    } else {
        console.log("Boolean Smoothie Shop ready to start from menu!");
    }
});