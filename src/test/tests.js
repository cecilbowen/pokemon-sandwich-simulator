import { craftSandwich, getIngredientsFromRecipe, getIngredientsSums, FULL_TO_ALIAS } from '../util';

// herba
const TEST_SET_HERBA = [
	{ // 1
		recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Bitter Herba Mystica',
		result: 'Title,Normal,3/Humungo,Normal,3/Item,Flying,3'
	},
	{ // 2
		recipe: 'Chorizo-1,Rice-1,Rice-1,Rice-1,Rice-1_Bitter Herba Mystica',
		result: 'Title,Normal,3/Item,Normal,3/Humungo,Fighting,2'
	},
	{ // 3
		recipe: 'Rice-1,Rice-1,Rice-1,Rice-1_Bitter Herba Mystica',
		result: 'Title,Normal,2/Item,Normal,2/Humungo,Flying,2'
	},
	{ // 4
		recipe: 'Cheese-2,Rice-1,Rice-1,Rice-1,Rice-1_Bitter Herba Mystica',
		result: 'Title,Normal,3/Item,Normal,3/Humungo,Flying,3'
	},
	{ // 5
		recipe: 'Cheese-1,Rice-1,Rice-1,Rice-1,Rice-1_Bitter Herba Mystica',
		result: 'Title,Normal,2/Item,Normal,2/Humungo,Flying,2'
	},
	{ // 6
		recipe: 'Herbed Sausage-3,Herbed Sausage-3,Rice-1,Rice-1_Horseradish,Spicy Herba Mystica',
		result: 'Title,Fighting,3/Humungo,Fighting,3/Encounter,Ground,2'
	}
];

// non-herba
const TEST_SET_NONHERBA = [
	{ // 1
		recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Curry Powder,Curry Powder,Wasabi,Wasabi',
		result: 'Encounter,Fire,2/Humungo,Grass,2/Raid,Water,1'
	},
	{ // 2
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Rice-1,Rice-1_Curry Powder,Pepper,Wasabi,Wasabi',
		result: 'Humungo,Fire,2/Encounter,Dragon,1/Exp,Normal,1'
	},
	{ // 3
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Rice-1,Rice-1_Curry Powder,Curry Powder,Wasabi,Wasabi',
		result: 'Humungo,Fire,2/Encounter,Bug,1/Exp,Normal,1'
	},
	{ // 4
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Potato Salad-1,Rice-1_Curry Powder,Curry Powder,Wasabi,Wasabi',
		result: 'Humungo,Bug,1/Encounter,Dragon,1/Exp,Fire,1'
	},
	{ // 5
		recipe: 'Fried Fillet-1,Fried Fillet-1,Fried Fillet-1,Fried Fillet-1,Rice-1,Rice-1_Curry Powder,Curry Powder,Wasabi,Wasabi',
		result: 'Humungo,Water,1/Catch,Flying,1/Teensy,Normal,1'
	},
	{ // 6
		recipe: 'Potato Tortilla-1,Potato Tortilla-1,Rice-1,Rice-1,Rice-1,Rice-1_Curry Powder,Curry Powder,Wasabi,Wasabi',
		result: 'Raid,Fire,1/Encounter,Fighting,1/Humungo,Grass,1'
	},
	{ // 7
		recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Butter',
		result: 'Humungo,Normal,2/Egg,,2/Encounter,Fighting,1'
	},
	{ // 8
		recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Wasabi',
		result: 'Humungo,Normal,2/Raid,Flying,2/Encounter,Fighting,1'
	},
	{ // 9
		recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Salt,Salt,Vinegar,Vinegar',
		result: 'Humungo,Normal,2/Encounter,Flying,2/Teensy,Fighting,1'
	},
	{ // 10
		recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Curry Powder,Curry Powder,Olive Oil,Wasabi',
		result: 'Humungo,Fire,2/Encounter,Water,2/Raid,Grass,1'
	}
];

// multiplayer
const TEST_SET_MULTIPLAYER = [
	{ // 1
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Rice-1,Rice-1,Rice-1_Bitter Herba Mystica,Horseradish,Horseradish,Mayonnaise,Mayonnaise,Saltchorizo x4, rice x2, tofu x1, mayonnaise x4, horseradish x2, salt, bitter herba',
		result: 'Title,Normal,3/Exp,Normal,3/Encounter,Normal,3'
	},
	{ // 2
		recipe: 'Ham-3,Ham-3,Ham-3,Ham-3,Herbed Sausage-1,Herbed Sausage-3,Herbed Sausage-3,Herbed Sausage-3,Noodles-1,Noodles-1_Whipped Cream,Whipped Cream,Whipped Cream,Whipped Cream,Whipped Cream,Whipped Cream,Whipped Cream,Whipped Cream',
		result: 'Encounter,Ground,2/Egg,,2/Item,Fighting,1'
	},
	{ // 3
		recipe: 'Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1_Bitter Herba Mystica,Curry Powder,Curry Powder,Salt',
		result: 'Title,Electric,3/Humungo,Electric,3/Encounter,Electric,3'
	},
	{ // 4
		recipe: 'Noodles-1,Noodles-1,Potato Salad-1,Potato Salad-1,Tomato-3,Tomato-3,Tomato-3,Tomato-3_Salt,Spicy Herba Mystica',
		result: 'Title,Fairy,3/Humungo,Fairy,3/Encounter,Psychic,2'
	},
	{ // 5
		recipe: 'Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1_Bitter Herba Mystica,Salt',
		result: 'Title,Electric,3/Humungo,Electric,3/Exp,Poison,3'
	},
	{ // 6
		recipe: 'Basil-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Yellow Bell Pepper-3_Salt,Sweet Herba Mystica',
		result: 'Title,Electric,3/Humungo,Electric,3/Encounter,Electric,3'
	},
	{ // 7
		recipe: 'Basil-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Yellow Bell Pepper-3_Bitter Herba Mystica,Salt',
		result: 'Title,Electric,3/Humungo,Electric,3/Encounter,Electric,3'
	},
	{ // 8
		recipe: 'Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1_Bitter Herba Mystica,Salt',
		result: 'Title,Electric,3/Humungo,Electric,3/Exp,Electric,3'
	},
]

// generates a sandwich from a 'save recipe' string
const generateSandwichFromRecipe = recipe => {
	const ingredients = getIngredientsFromRecipe(recipe);
	if (!ingredients) { return undefined; }
	const sums = getIngredientsSums([...ingredients.fillings, ...ingredients.condiments]);
	return craftSandwich(ingredients.fillings, ingredients.condiments, sums);
};

const getSandwichResult = sandwich => {
	let ret = [];
	for (const effect of sandwich.effects) {
		ret.push(`${effect.name},${effect.type},${effect.level}`);
	}

	return ret;
};

export const runTests = () => {
	console.info("Starting tests --------------------");
	const sets = [TEST_SET_HERBA, TEST_SET_NONHERBA, TEST_SET_MULTIPLAYER];

	for (let j = 0; j < sets.length; j++) {
		const testSet = sets[j];
		let failures = [];
		console.log("%cTest Set " + (j + 1), 'color: aqua;');
		for (let i = 0; i < testSet.length; i++) {
			const result = {
				powers: "pass",
				types: "pass",
				levels: "pass"
			};
	
			const test = testSet[i];
			const recipe = test.recipe;
			const sandwich = generateSandwichFromRecipe(recipe);
			console.groupCollapsed("Sandwich " + (i + 1));
			if (sandwich) {
				const realResult = test.result.split("/");
				const resultStr = getSandwichResult(sandwich);
	
				let input = "";
				let expected = "";
				for (let i = 0; i < realResult.length; i++) {
					const realLine = realResult[i];
					const myLine = resultStr[i];
		
					if (!myLine) {
						result.powers = result.types = result.levels = "fail";
						break;
					}
		
					const realSplit = realLine.split(",");
					const mySplit = myLine.split(",");
		
					const realPower = realSplit[0].trim();
					const realType = realSplit[1].trim();
					const realLevel = realSplit[2].trim();
					expected += `\t${realPower}: ${realType} Lv. ${realLevel}\n`;
		
					const myPower = FULL_TO_ALIAS[mySplit[0].trim()];
					const myType = mySplit[1].trim();
					const myLevel = mySplit[2].trim();
					input += `\t${myPower}: ${myType} Lv. ${myLevel}\n`;
		
					// console.log(realLine, myLine);
					if (myPower.toLowerCase() !== realPower.toLowerCase()) { result.powers = "fail"; }
					if (myType.toLowerCase() !== realType.toLowerCase()) { result.types = "fail"; }
					if (myLevel.toLowerCase() !== realLevel.toLowerCase()) { result.levels = "fail"; }
				}
	
				console.log("Input Recipe:\n" + input);
				console.log("Expected Recipe:\n" + expected);
				console.log(`Powers: ${result.powers}, Types: ${result.types}, Levels: ${result.levels}`);
				if (result.powers === "fail" || result.types === "fail" || result.levels === "fail") {
					failures.push("#" + (i + 1));
				}
			} else {
				console.warn("invalid recipe", recipe);
			}
			console.groupEnd();
		}
		
		if (failures.length > 0) {
			console.log("\tFailed sandwiches: " + failures.join(", "));
		} else {
			console.log("\tAll sandwiches passed from Test Set " + (j + 1));
		}
	
		console.info("Tests concluded --------------------");
	}
};
