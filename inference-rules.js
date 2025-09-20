// Inference Rules Engine for Boolean Smoothie Shop

class InferenceEngine {
    constructor() {
        // Get characters from game data to ensure they match
        this.validOperators = new Set(['🥤', '🔀', '➡️', '❌', '🫙', '🍸']);
        this.validPropositions = new Set(['🍋', '🍓', '🥝']);

        // Add all characters that might appear in formulas
        this.allValidChars = new Set([...this.validOperators, ...this.validPropositions]);
    }

    // Parse a logical formula string into a structured representation
    parseFormula(formulaString) {
        if (!formulaString || formulaString.trim() === '') {
            return null;
        }

        // Remove whitespace and split into tokens (properly handle emojis)
        const cleanString = formulaString.replace(/\s+/g, '');
        const tokens = Array.from(cleanString).filter(token => token !== '');

        if (tokens.length === 0) {
            return null;
        }

        // For now, skip strict validation and just allow the parsing
        // We'll validate logic at the rule level instead
        console.log('Parsing formula:', formulaString, 'into tokens:', tokens);

        return {
            original: formulaString,
            tokens: tokens,
            normalized: this.normalizeFormula(tokens)
        };
    }

    // Normalize a formula for comparison (handles parentheses and operator precedence)
    normalizeFormula(tokens) {
        // For this demo, we'll use a simple string comparison approach
        // In a full implementation, this would involve proper parsing and normalization
        return tokens.join('');
    }

    // Check if two formulas are logically equivalent
    areEquivalent(formula1, formula2) {
        const parsed1 = this.parseFormula(formula1);
        const parsed2 = this.parseFormula(formula2);

        if (!parsed1 || !parsed2) {
            return false;
        }

        return parsed1.normalized === parsed2.normalized;
    }

    // Validate a specific inference rule
    validateInference(premises, conclusion, expectedRule) {
        const parsedPremises = premises.map(p => this.parseFormula(p)).filter(p => p !== null);
        const parsedConclusion = this.parseFormula(conclusion);

        if (parsedPremises.length !== premises.length || !parsedConclusion) {
            return { valid: false, error: "Invalid formula format" };
        }

        // Get the inference template for the expected rule
        const template = window.GameData.INFERENCE_TEMPLATES[expectedRule];
        if (!template) {
            return { valid: false, error: "Unknown inference rule" };
        }

        // Check if the premises and conclusion match the template
        const result = this.checkRuleApplication(parsedPremises, parsedConclusion, template);

        return {
            valid: result.valid,
            rule: expectedRule,
            explanation: template.explanation,
            error: result.error
        };
    }

    // Check if a specific rule is correctly applied
    checkRuleApplication(premises, conclusion, template) {
        switch (template.name) {
            case "Classic Recipe":
                return this.checkModusPonens(premises, conclusion);
            case "Reverse Logic":
                return this.checkModusTollens(premises, conclusion);
            case "Recipe Chain":
                return this.checkHypotheticalSyllogism(premises, conclusion);
            case "Either-Or Choice":
                return this.checkDisjunctiveSyllogism(premises, conclusion);
            case "Ingredient Split":
                return this.checkSimplification(premises, conclusion);
            default:
                return { valid: false, error: "Unsupported rule" };
        }
    }

    // Classic Recipe: 🍋➡️🍓, 🍋 ⊢ 🍓
    checkModusPonens(premises, conclusion) {
        if (premises.length !== 2) {
            return { valid: false, error: "Classic Recipe requires exactly 2 ingredients" };
        }

        // Look for ingredient➡️drink and ingredient patterns
        let recipePremise = null;
        let ingredientPremise = null;

        for (const premise of premises) {
            if (premise.tokens.includes('➡️')) {
                recipePremise = premise;
            } else if (premise.tokens.length === 1 && this.validPropositions.has(premise.tokens[0])) {
                ingredientPremise = premise;
            }
        }

        if (!recipePremise || !ingredientPremise) {
            return { valid: false, error: "Could not find recipe➡️drink and ingredient pattern" };
        }

        // Extract ingredient and drink from recipe➡️drink
        const arrowIndex = recipePremise.tokens.indexOf('➡️');
        const ingredient = recipePremise.tokens.slice(0, arrowIndex).join('');
        const drink = recipePremise.tokens.slice(arrowIndex + 1).join('');

        // Check if the ingredientPremise matches the ingredient of the recipe
        if (ingredientPremise.normalized !== ingredient) {
            return { valid: false, error: "Available ingredient doesn't match recipe requirement" };
        }

        // Check if the conclusion matches the drink
        if (conclusion.normalized !== drink) {
            return { valid: false, error: "Served drink doesn't match recipe result" };
        }

        return { valid: true };
    }

    // Reverse Logic: 🍋➡️🍓, ❌🍓 ⊢ ❌🍋
    checkModusTollens(premises, conclusion) {
        if (premises.length !== 2) {
            return { valid: false, error: "Reverse Logic requires exactly 2 premises" };
        }

        let recipePremise = null;
        let refusedDrinkPremise = null;

        for (const premise of premises) {
            if (premise.tokens.includes('➡️')) {
                recipePremise = premise;
            } else if (premise.tokens[0] === '❌' && premise.tokens.length === 2) {
                refusedDrinkPremise = premise;
            }
        }

        if (!recipePremise || !refusedDrinkPremise) {
            return { valid: false, error: "Could not find recipe➡️drink and ❌drink pattern" };
        }

        // Extract ingredient and drink from recipe➡️drink
        const arrowIndex = recipePremise.tokens.indexOf('➡️');
        const ingredient = recipePremise.tokens.slice(0, arrowIndex).join('');
        const drink = recipePremise.tokens.slice(arrowIndex + 1).join('');

        // Check if the refused premise matches ❌drink
        const expectedRefusedDrink = '❌' + drink;
        if (refusedDrinkPremise.normalized !== expectedRefusedDrink) {
            return { valid: false, error: "Customer refusal doesn't match expected drink" };
        }

        // Check if the conclusion matches ❌ingredient
        const expectedConclusion = '❌' + ingredient;
        if (conclusion.normalized !== expectedConclusion) {
            return { valid: false, error: "Conclusion doesn't avoid the right ingredient" };
        }

        return { valid: true };
    }

    // Recipe Chain: 🍋➡️🍓, 🍓➡️🥝 ⊢ 🍋➡️🥝
    checkHypotheticalSyllogism(premises, conclusion) {
        if (premises.length !== 2) {
            return { valid: false, error: "Recipe Chain requires exactly 2 recipe steps" };
        }

        // Both premises should be recipes
        const recipes = premises.filter(p => p.tokens.includes('➡️'));
        if (recipes.length !== 2) {
            return { valid: false, error: "Both premises must be recipe flows" };
        }

        // Extract components of both recipes
        const recipe1 = recipes[0];
        const recipe2 = recipes[1];

        const arrow1Index = recipe1.tokens.indexOf('➡️');
        const ingredient1 = recipe1.tokens.slice(0, arrow1Index).join('');
        const result1 = recipe1.tokens.slice(arrow1Index + 1).join('');

        const arrow2Index = recipe2.tokens.indexOf('➡️');
        const ingredient2 = recipe2.tokens.slice(0, arrow2Index).join('');
        const result2 = recipe2.tokens.slice(arrow2Index + 1).join('');

        // Debug logging to understand what's happening
        console.log('Recipe Chain Debug:');
        console.log('Recipe 1: ingredient1=', ingredient1, 'result1=', result1);
        console.log('Recipe 2: ingredient2=', ingredient2, 'result2=', result2);
        console.log('Comparing result1 === ingredient2:', result1 === ingredient2, '(', result1, '===', ingredient2, ')');
        console.log('Comparing result2 === ingredient1:', result2 === ingredient1, '(', result2, '===', ingredient1, ')');

        // Find the chain: one result should match the other ingredient
        let startIngredient, finalResult;

        if (result1 === ingredient2) {
            // 🍋➡️🍓, 🍓➡️🥝 pattern
            startIngredient = ingredient1;
            finalResult = result2;
        } else if (result2 === ingredient1) {
            // 🍓➡️🥝, 🍋➡️🍓 pattern
            startIngredient = ingredient2;
            finalResult = result1;
        } else {
            console.log('No chain found. result1=', JSON.stringify(result1), 'ingredient2=', JSON.stringify(ingredient2));
            console.log('result2=', JSON.stringify(result2), 'ingredient1=', JSON.stringify(ingredient1));
            return { valid: false, error: "No valid recipe chain found between the steps" };
        }

        // Check if conclusion matches the complete chain
        if (!conclusion.tokens.includes('➡️')) {
            return { valid: false, error: "Conclusion must be a recipe flow" };
        }

        const conclusionArrowIndex = conclusion.tokens.indexOf('➡️');
        const conclusionIngredient = conclusion.tokens.slice(0, conclusionArrowIndex).join('');
        const conclusionResult = conclusion.tokens.slice(conclusionArrowIndex + 1).join('');

        console.log('Expected: startIngredient=', startIngredient, 'finalResult=', finalResult);
        console.log('Conclusion: ingredient=', conclusionIngredient, 'result=', conclusionResult);

        if (conclusionIngredient !== startIngredient || conclusionResult !== finalResult) {
            return { valid: false, error: "Conclusion doesn't match expected recipe chain result" };
        }

        return { valid: true };
    }

    // Either-Or Choice: 🍋🔀🍓, ❌🍋 ⊢ 🍓
    checkDisjunctiveSyllogism(premises, conclusion) {
        if (premises.length !== 2) {
            return { valid: false, error: "Either-Or Choice requires exactly 2 premises" };
        }

        let choicePremise = null;
        let unavailablePremise = null;

        for (const premise of premises) {
            if (premise.tokens.includes('🔀')) {
                choicePremise = premise;
            } else if (premise.tokens[0] === '❌' && premise.tokens.length === 2) {
                unavailablePremise = premise;
            }
        }

        if (!choicePremise || !unavailablePremise) {
            return { valid: false, error: "Could not find ingredient🔀ingredient and ❌ingredient pattern" };
        }

        // Extract components of choice
        const choiceIndex = choicePremise.tokens.indexOf('🔀');
        const leftChoice = choicePremise.tokens.slice(0, choiceIndex).join('');
        const rightChoice = choicePremise.tokens.slice(choiceIndex + 1).join('');

        // Get the unavailable ingredient
        const unavailableIngredient = unavailablePremise.tokens[1];

        // Determine which ingredient should be used
        let expectedConclusion;
        if (leftChoice === unavailableIngredient) {
            expectedConclusion = rightChoice;
        } else if (rightChoice === unavailableIngredient) {
            expectedConclusion = leftChoice;
        } else {
            return { valid: false, error: "Unavailable ingredient doesn't match either choice" };
        }

        if (conclusion.normalized !== expectedConclusion) {
            return { valid: false, error: "Conclusion doesn't use the available ingredient" };
        }

        return { valid: true };
    }

    // Ingredient Split: 🍋🥤🍓 ⊢ 🍋 (or 🍓)
    checkSimplification(premises, conclusion) {
        if (premises.length !== 1) {
            return { valid: false, error: "Ingredient Split requires exactly 1 mixed drink" };
        }

        const premise = premises[0];
        if (!premise.tokens.includes('🥤')) {
            return { valid: false, error: "Premise must be a mixed drink combination" };
        }

        // Extract ingredients from the mix
        const mixIndex = premise.tokens.indexOf('🥤');
        const leftIngredient = premise.tokens.slice(0, mixIndex).join('');
        const rightIngredient = premise.tokens.slice(mixIndex + 1).join('');

        // Check if conclusion matches either ingredient
        if (conclusion.normalized !== leftIngredient && conclusion.normalized !== rightIngredient) {
            return { valid: false, error: "Conclusion must be one of the mixed ingredients" };
        }

        return { valid: true };
    }

    // Helper method to determine which rule applies to given premises and conclusion
    identifyRule(premises, conclusion) {
        const rules = ['modusPonens', 'modusTollens', 'hypotheticalSyllogism', 'disjunctiveSyllogism', 'simplification'];

        for (const ruleKey of rules) {
            const result = this.validateInference(premises, conclusion, ruleKey);
            if (result.valid) {
                return ruleKey;
            }
        }

        return null;
    }

    // Generate a hint for the current customer request
    generateHint(customerRequest) {
        const { premises, expectedConclusion, rule } = customerRequest;
        const template = window.GameData.INFERENCE_TEMPLATES[rule];

        if (!template) {
            return "I'm not sure how to help with this recipe.";
        }

        const hints = {
            modusPonens: `Look for a recipe flow (➡️) and its starting ingredient. If you have 🍋➡️🍓 and 🍋, you can serve 🍓.`,
            modusTollens: `Look for a recipe flow (➡️) and customer refusing the result. If you have 🍋➡️🍓 and ❌🍓, don't use 🍋.`,
            hypotheticalSyllogism: `Look for two recipe flows that chain together. If you have 🍋➡️🍓 and 🍓➡️🥝, you get 🍋➡️🥝.`,
            disjunctiveSyllogism: `Look for an ingredient choice (🔀) and one being unavailable. If you have 🍋🔀🍓 and ❌🍋, use 🍓.`,
            simplification: `Look for a mixed drink (🥤). You can serve either ingredient from 🍋🥤🍓.`
        };

        return hints[rule] || template.explanation;
    }
}

// Create global instance
const inferenceEngine = new InferenceEngine();

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InferenceEngine, inferenceEngine };
} else {
    // Browser environment - attach to window
    window.InferenceEngine = InferenceEngine;
    window.inferenceEngine = inferenceEngine;
}