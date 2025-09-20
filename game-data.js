// Game Data Configuration for Boolean Smoothie Shop

// Customer personas with different personalities and request styles
const CUSTOMER_PERSONAS = [
    {
        name: "Sarah",
        personality: "academic",
        patience: 60000, // 60 seconds
        dialogue: [
            "I need a smoothie made by the proper recipe, please.",
            "The ingredients must combine according to the rules.",
            "Make sure your blending technique is correct."
        ],
        avatar: "🤓"
    },
    {
        name: "Emily",
        personality: "eager",
        patience: 75000, // 75 seconds
        dialogue: [
            "I'm learning about smoothie recipes!",
            "Can you help me understand this blending technique?",
            "I think it's the classic recipe method, right?"
        ],
        avatar: "👩‍🎓"
    },
    {
        name: "Mike",
        personality: "challenging",
        patience: 50000, // 50 seconds
        dialogue: [
            "Let's see if you can handle this recipe.",
            "Not all smoothies are as simple as they seem.",
            "Show me you understand the blending rules."
        ],
        avatar: "👨‍🏫"
    },
    {
        name: "David",
        personality: "professional",
        patience: 65000, // 65 seconds
        dialogue: [
            "I need this smoothie for my meeting.",
            "Time is money, blend it right.",
            "The recipe must be followed exactly."
        ],
        avatar: "👨‍💼"
    },
    {
        name: "Jessica",
        personality: "curious",
        patience: 70000, // 70 seconds
        dialogue: [
            "I love learning about smoothie blending!",
            "Could you show me how this recipe works?",
            "Smoothie making is so fascinating!"
        ],
        avatar: "🧠"
    }
];

// Mixing technique templates for generating customer requests
const INFERENCE_TEMPLATES = {
    modusPonens: {
        name: "Classic Recipe",
        description: "If the recipe calls for ingredient A leading to drink B, and you have A, then serve B",
        premises: ["🍋➡️🍓", "🍋"],
        conclusion: "🍓",
        explanation: "From 🍋➡️🍓 recipe and having 🍋, we serve 🍓",
        difficulty: 1,
        examples: [
            {
                premises: ["🍋➡️🍓", "🍋"],
                conclusion: "🍓",
                context: "Recipe says: If you use lemon, then add strawberry. You have lemon available. Therefore, add strawberry to the smoothie."
            }
        ]
    },
    modusTollens: {
        name: "Reverse Logic",
        description: "If the recipe calls for A leading to B, but customer doesn't want B, then don't use A",
        premises: ["🍋➡️🍓", "❌🍓"],
        conclusion: "❌🍋",
        explanation: "From 🍋➡️🍓 recipe and customer refusing 🍓, we don't use 🍋",
        difficulty: 2,
        examples: [
            {
                premises: ["🍋➡️🍓", "❌🍓"],
                conclusion: "❌🍋",
                context: "Recipe says: If you use lemon, then add strawberry. Customer doesn't want strawberry. Therefore, don't use lemon."
            }
        ]
    },
    hypotheticalSyllogism: {
        name: "Recipe Chain",
        description: "If A leads to B, and B leads to C, then A leads directly to C",
        premises: ["🍋➡️🍓", "🍓➡️🥝"],
        conclusion: "🍋➡️🥝",
        explanation: "From 🍋➡️🍓 and 🍓➡️🥝, we get 🍋➡️🥝",
        difficulty: 3,
        examples: [
            {
                premises: ["🍋➡️🍓", "🍓➡️🥝"],
                conclusion: "🍋➡️🥝",
                context: "Recipe says: Lemon leads to strawberry, and strawberry leads to kiwi. Therefore, lemon leads directly to kiwi."
            }
        ]
    },
    disjunctiveSyllogism: {
        name: "Either-Or Choice",
        description: "If you can use either A or B, and A is unavailable, then use B",
        premises: ["🍋🔀🍓", "❌🍋"],
        conclusion: "🍓",
        explanation: "From 🍋🔀🍓 choice and no 🍋 available, we use 🍓",
        difficulty: 2,
        examples: [
            {
                premises: ["🍋🔀🍓", "❌🍋"],
                conclusion: "🍓",
                context: "Recipe allows either lemon or strawberry. Lemon is not available. Therefore, use strawberry."
            }
        ]
    },
    simplification: {
        name: "Ingredient Split",
        description: "If the recipe combines A and B together, you can use just A alone",
        premises: ["🍋🥤🍓"],
        conclusion: "🍋",
        explanation: "From 🍋🥤🍓 mixed together, we can serve just 🍋",
        difficulty: 1,
        examples: [
            {
                premises: ["🍋🥤🍓"],
                conclusion: "🍋",
                context: "Recipe combines lemon and strawberry together. You can serve just the lemon part."
            }
        ]
    },

    // Complex 3-premise scenarios
    chainedModusPonens: {
        name: "Double Recipe Chain",
        description: "Follow two recipe steps in sequence to reach the final ingredient",
        premises: ["🍋➡️🍓", "🍓➡️🥝", "🍋"],
        conclusion: "🥝",
        explanation: "From 🍋➡️🍓, 🍓➡️🥝, and having 🍋, we can serve 🥝",
        difficulty: 4,
        isMultiStep: true,
        steps: [
            { rule: "modusPonens", premises: ["🍋➡️🍓", "🍋"], result: "🍓" },
            { rule: "modusPonens", premises: ["🍓➡️🥝", "🍓"], result: "🥝" }
        ],
        examples: [
            {
                premises: ["🍋➡️🍓", "🍓➡️🥝", "🍋"],
                conclusion: "🥝",
                context: "Recipe chain: Lemon makes strawberry, strawberry makes kiwi. You have lemon. Follow the chain to make kiwi."
            }
        ]
    },

    complexDisjunction: {
        name: "Choice Elimination Chain",
        description: "Eliminate choices step by step to find the right ingredient",
        premises: ["🍋🔀🍓", "🍓🔀🥝", "❌🍋"],
        conclusion: "🥝",
        explanation: "From 🍋🔀🍓, 🍓🔀🥝, and no 🍋, we choose 🍓, then 🥝",
        difficulty: 4,
        isMultiStep: true,
        steps: [
            { rule: "disjunctiveSyllogism", premises: ["🍋🔀🍓", "❌🍋"], result: "🍓" },
            { rule: "disjunctiveSyllogism", premises: ["🍓🔀🥝", "🍓"], result: "🥝" }
        ],
        examples: [
            {
                premises: ["🍋🔀🍓", "🍓🔀🥝", "❌🍋"],
                conclusion: "🥝",
                context: "Customer wants either lemon or strawberry, and either strawberry or kiwi. Lemon is unavailable. Work through the choices."
            }
        ]
    },

    mixedLogicChain: {
        name: "Mixed Logic Challenge",
        description: "Combine different logical techniques to solve the recipe",
        premises: ["🍋🥤🍓", "🍓➡️🥝", "❌🍋"],
        conclusion: "🥝",
        explanation: "From 🍋🥤🍓 mix, 🍓➡️🥝 recipe, and no 🍋, we extract 🍓 then make 🥝",
        difficulty: 4,
        isMultiStep: true,
        steps: [
            { rule: "simplification", premises: ["🍋🥤🍓"], result: "🍓" },
            { rule: "modusPonens", premises: ["🍓➡️🥝", "🍓"], result: "🥝" }
        ],
        examples: [
            {
                premises: ["🍋🥤🍓", "🍓➡️🥝", "❌🍋"],
                conclusion: "🥝",
                context: "You have a lemon-strawberry mix, strawberry leads to kiwi, but lemon is spoiled. Extract strawberry from the mix and follow the recipe."
            }
        ]
    }
};

// Ingredient scenarios for generating varied drink problems
const PROPOSITIONS = {
    "🍋": {
        positive: ["Fresh lemons are available", "The lemon is ripe", "Customer likes citrus", "Lemon juice is squeezed", "Lemon garnish is ready"],
        negative: ["No lemons in stock", "The lemon is spoiled", "Customer dislikes citrus", "Lemon juice ran out", "No lemon garnish available"]
    },
    "🍓": {
        positive: ["Strawberries are fresh", "Strawberry syrup is ready", "Customer wants berry flavor", "Strawberries are muddled", "Berry garnish prepared"],
        negative: ["Strawberries are out of season", "No strawberry syrup", "Customer avoids berries", "Strawberries are not muddled", "No berry garnish available"]
    },
    "🥝": {
        positive: ["Kiwi is perfectly ripe", "Kiwi juice is available", "Customer enjoys exotic fruits", "Kiwi is sliced", "Tropical garnish ready"],
        negative: ["Kiwi is too hard", "No kiwi juice in stock", "Customer prefers common fruits", "Kiwi is not prepared", "No tropical garnish available"]
    }
};

// Bartender skill progression settings
const DIFFICULTY_SETTINGS = {
    1: {
        name: "Junior Bartender",
        availableRules: ["modusPonens", "simplification"],
        timerBonus: 1.5,
        scoreMultiplier: 1.0,
        maxCustomers: 2
    },
    2: {
        name: "Skilled Mixologist",
        availableRules: ["modusPonens", "modusTollens", "simplification", "disjunctiveSyllogism"],
        timerBonus: 1.3,
        scoreMultiplier: 1.2,
        maxCustomers: 3
    },
    3: {
        name: "Master Bartender",
        availableRules: ["modusPonens", "modusTollens", "hypotheticalSyllogism", "disjunctiveSyllogism", "simplification"],
        timerBonus: 1.0,
        scoreMultiplier: 1.5,
        maxCustomers: 4
    },
    4: {
        name: "Logic Expert",
        availableRules: ["modusPonens", "modusTollens", "hypotheticalSyllogism", "disjunctiveSyllogism", "simplification", "chainedModusPonens", "complexDisjunction", "mixedLogicChain"],
        timerBonus: 0.8,
        scoreMultiplier: 2.0,
        maxCustomers: 3
    },
    5: {
        name: "Master Reasoner",
        availableRules: ["modusPonens", "modusTollens", "hypotheticalSyllogism", "disjunctiveSyllogism", "simplification", "chainedModusPonens", "complexDisjunction", "mixedLogicChain"],
        timerBonus: 0.6,
        scoreMultiplier: 2.5,
        maxCustomers: 4
    },
    6: {
        name: "Logic Grandmaster",
        availableRules: ["modusPonens", "modusTollens", "hypotheticalSyllogism", "disjunctiveSyllogism", "simplification", "chainedModusPonens", "complexDisjunction", "mixedLogicChain"],
        timerBonus: 0.5,
        scoreMultiplier: 3.0,
        maxCustomers: 5
    }
};

// Scoring system configuration
const SCORING = {
    basePoints: {
        correct: 100,
        incorrect: -20,
        timeout: -10
    },
    bonuses: {
        speed: {
            fast: 50,    // < 10 seconds
            medium: 25,  // < 20 seconds
            slow: 0      // >= 20 seconds
        },
        combo: {
            multiplier: 0.2, // Each consecutive correct answer adds 20% bonus
            maxMultiplier: 3.0
        },
        difficulty: {
            1: 1.0,
            2: 1.3,
            3: 1.6,
            4: 2.0,
            5: 2.5,
            6: 3.0
        }
    },
    accuracy: {
        excellent: 90,  // 90%+
        good: 75,       // 75-89%
        average: 60     // 60-74%
    }
};

// Tutorial messages for different game states
const TUTORIAL_MESSAGES = {
    welcome: "Welcome to your bar! Drag ingredients to mix drinks that satisfy customer recipes and requests.",
    modusPonens: "Master the <span class='tutorial-rule'>Classic Recipe</span>: If recipe calls for 🍋➡️🍓 and you have 🍋, serve 🍓.",
    modusTollens: "Try <span class='tutorial-rule'>Reverse Logic</span>: If recipe calls for 🍋➡️🍓 but customer refuses 🍓, don't use 🍋.",
    hypotheticalSyllogism: "<span class='tutorial-rule'>Recipe Chain</span>: From 🍋➡️🍓 and 🍓➡️🥝, you get 🍋➡️🥝.",
    disjunctiveSyllogism: "<span class='tutorial-rule'>Either-Or Choice</span>: From 🍋🔀🍓 choice and no 🍋, serve 🍓.",
    simplification: "<span class='tutorial-rule'>Ingredient Split</span>: From 🍋🥤🍓 combo, you can serve just 🍋.",
    dragDrop: "Drag ingredients from the bar shelf to the mixing counter to create drink recipes.",
    serving: "Click 'Serve Drink' when your recipe matches what the customer wants!",
    patience: "Watch the patience bar - thirsty customers won't wait forever!",
    combo: "Make consecutive perfect drinks to build your mixing combo multiplier!",
    levelUp: "Excellent bartending! You've been promoted to the next skill level."
};

// Achievement definitions
const ACHIEVEMENTS = {
    firstServe: {
        name: "First Round",
        description: "Serve your first customer a perfect drink",
        icon: "🥇",
        points: 50
    },
    speedDemon: {
        name: "Flash Bartender",
        description: "Serve 5 customers in under 10 seconds each",
        icon: "⚡",
        points: 200
    },
    perfectCombo: {
        name: "Perfect Mixologist",
        description: "Make 10 perfect drinks in a row",
        icon: "🎯",
        points: 500
    },
    masterLogician: {
        name: "Recipe Master",
        description: "Use all 5 mixing techniques correctly",
        icon: "🧠",
        points: 300
    },
    patientBarista: {
        name: "Customer Keeper",
        description: "Never let a customer leave thirsty",
        icon: "⏰",
        points: 150
    }
};

// Sound effect mappings (placeholder for future audio integration)
const SOUND_EFFECTS = {
    correctAnswer: "correct.wav",
    wrongAnswer: "wrong.wav",
    customerArrive: "chime.wav",
    ingredientDrag: "click.wav",
    levelUp: "levelup.wav",
    timeout: "timeout.wav"
};

// Export all game data for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CUSTOMER_PERSONAS,
        INFERENCE_TEMPLATES,
        PROPOSITIONS,
        DIFFICULTY_SETTINGS,
        SCORING,
        TUTORIAL_MESSAGES,
        ACHIEVEMENTS,
        SOUND_EFFECTS
    };
} else {
    // Browser environment - attach to window
    window.GameData = {
        CUSTOMER_PERSONAS,
        INFERENCE_TEMPLATES,
        PROPOSITIONS,
        DIFFICULTY_SETTINGS,
        SCORING,
        TUTORIAL_MESSAGES,
        ACHIEVEMENTS,
        SOUND_EFFECTS
    };
}