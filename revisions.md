The game should be a boolean logic based game where the main purpose of the software is to create a fun way to learn applying rules of inference and other boolean operations to boolean problems.
The premise of the game is that you play as a bartender taking orders from a line of customers, each customer would present an order with a set of rules or premises and a conclusion.
The goal of the order is to reach the conclusion by transforming the given premises via applying rules of inference.
The only options you have at the start of each order are the premises given by the customer and a set of rules of inference or boolean operations (e.g. modus ponens, simplification rule, de morgans etc.).
You are unable to create direct symbols, you can only process the given premises. Example: the customer gives you 1. P -> Q and 2. P = T for the premises, and gives you “Therefore Q” as the expected conclusion. So what the player would do in this example is select premise 1 and premise 2 and select the modus ponens rule to apply, this would generate a new item in the inventory which is the result of the application.
Everytime a rule is applied the result is stored in the inventory (if not done before) for you to access anytime as long as its the current order.
The inventory resets for every new order. The inventory always starts with the given premises of the customer, and the inventory is added when you make a new logical inference via applied rules. The rules of inference and other boolean operations are not part of the inventory but are accessible anytime and will not run out.
The game should in no way be directly presenting its content as boolean math, instead it should use analogies that make sense in the smoothie shop theme.
The gameplay should be designed to be endless like a mobile game. However, there should be scaling in difficulty the longer you play for a game.
There are 3 hearts in a single game, when a customer does not meet their order (Because the player failed to reach to the conclusion in time) the customer leaves and a heart is lost.
Only one customer is processed at a time, each customer may give 2 to 5 premises and one conclusion to meet.
The player can mix and match any operations to the premises as long as they arrive at the required conclusion.
When you complete an order it has 3 possible scores to give you: the baseline score, and 2 other scores which have bonuses depending on completion quickness.
Each customer has a patience timer, when it runs out they leave and you lose a heart.
Losing all hearts ends in a game over.
There should be a menu screen which has options to play the game and you can set whether to have infinite customer patience or not.
There should also be a button to game over the game while a game is in progress for debug and testing purposes.
The customers should have normal names and not related to any logic terms.
