// Game Engine for Logic Mixology: Inference Bar

class GameEngine {
    constructor() {
        this.gameState = {
            level: 1,
            score: 0,
            servedCustomers: 0,
            currentCombo: 0,
            maxCombo: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            isPlaying: false,
            isPaused: false,
            startTime: null,
            timersDisabled: false
        };

        this.customers = [];
        this.activeCustomer = null;
        this.mixedFormula = [];
        this.gameLoop = null;
        this.tutorialStep = 0;

        // Bind methods to preserve 'this' context
        this.update = this.update.bind(this);
        this.serveCustomer = this.serveCustomer.bind(this);
        this.clearCounter = this.clearCounter.bind(this);

        this.achievements = new Set();
        this.timers = new Map();
    }

    // Initialize the game
    init() {
        console.log("Initializing Logic Mixology Bar Engine...");
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
        const template = window.GameData.INFERENCE_TEMPLATES[selectedRule];

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
        return {
            rule: ruleKey,
            premises: [...template.premises], // Copy the array
            expectedConclusion: template.conclusion,
            explanation: template.explanation,
            context: template.examples[0]?.context || template.description,
            difficulty: template.difficulty
        };
    }

    // Set a customer as the active customer
    setActiveCustomer(customer) {
        this.activeCustomer = customer;
        this.updateCustomerDisplay();

        // Update tutorial based on the rule
        if (customer && customer.request) {
            this.showTutorial(customer.request.rule);
        }
    }

    // Handle serving a customer with the current mixed formula
    serveCustomer() {
        if (!this.activeCustomer || this.mixedFormula.length === 0) {
            this.showFeedback("No customer to serve or empty formula!", "error");
            return;
        }

        const customer = this.activeCustomer;
        const formulaString = this.mixedFormula.join('');
        const startTime = customer.arrivalTime;
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Validate the inference
        console.log('Debugging validation:');
        console.log('Customer premises:', customer.request.premises);
        console.log('Your formula:', formulaString);
        console.log('Expected rule:', customer.request.rule);
        console.log('Expected conclusion:', customer.request.expectedConclusion);

        const validationResult = window.inferenceEngine.validateInference(
            customer.request.premises,
            formulaString,
            customer.request.rule
        );

        console.log('Validation result:', validationResult);

        this.gameState.totalAnswers++;

        if (validationResult.valid) {
            this.handleCorrectAnswer(customer, responseTime);
        } else {
            this.handleIncorrectAnswer(customer, validationResult.error);
        }

        // Clear the counter and move to next customer
        this.clearCounter();
        this.removeCustomer(customer);
        this.generateCustomer(); // Generate a new customer
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

    // Clear the mixing counter
    clearCounter() {
        this.mixedFormula = [];
        this.updateMixingDisplay();
    }

    // Add an ingredient to the mixing counter
    addIngredient(symbol) {
        this.mixedFormula.push(symbol);
        this.updateMixingDisplay();
        console.log(`Added ingredient: ${symbol}, Recipe: ${this.mixedFormula.join('')}`);
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
        if (this.gameState.servedCustomers >= requiredCustomers && this.gameState.level < 3) {
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

        this.showFeedback(`${customer.persona.name} left! ${penalty} points`, "error");
        this.removeCustomer(customer);
        this.generateCustomer();
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

    // Update mixing display
    updateMixingDisplay() {
        const mixingArea = document.getElementById('mixing-area');
        const placeholder = mixingArea.querySelector('.mixing-placeholder');
        const formulaDisplay = document.getElementById('mixed-formula');

        if (this.mixedFormula.length === 0) {
            placeholder.style.display = 'block';
            formulaDisplay.style.display = 'none';
        } else {
            placeholder.style.display = 'none';
            formulaDisplay.style.display = 'flex';
            formulaDisplay.innerHTML = this.mixedFormula.map(symbol =>
                `<span class="formula-element" style="background-color: ${this.getIngredientColor(symbol)}">${symbol}</span>`
            ).join('');
        }
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

// Auto-start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing game...");

    // Wait a bit for all scripts to load
    setTimeout(() => {
        if (typeof window.gameEngine !== 'undefined') {
            window.gameEngine.init();
        } else {
            console.error("Game engine not available!");
        }
    }, 100);
});