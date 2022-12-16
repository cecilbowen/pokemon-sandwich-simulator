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
	},
	{ // 7
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-0,Prosciutto-0_Sweet Herba Mystica',
		result: 'Title,Flying,2/Egg,,2/Encounter,Fighting,2'
	},
	{ // 8
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-2,Prosciutto-0_Bitter Herba Mystica',
		result: 'Title,Flying,2/Exp,Flying,2/Encounter,Fighting,2'
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
	},
	{ // 11
		recipe: 'Egg-3,Egg-3,Egg-3,Jalapeno-3,Jalapeno-3,Potato Salad-1_Whipped Cream',
		result: 'Raid,Fairy,2/Exp,Grass,1/Encounter,Rock,1'
	},
	{ // 12
		recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Chili Sauce,Chili Sauce,Cream Cheese',
		result: 'Raid,Water,2/Humungo,Normal,2/Encounter,Grass,1'
	},
	{ // 13
		recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Chili Sauce,Chili Sauce,Olive Oil',
		result: 'Raid,Grass,2/Humungo,Water,2/Encounter,Fire,1'
	},
	{ // 14
		recipe: 'Herbed Sausage-3,Herbed Sausage-3,Herbed Sausage-3,Herbed Sausage-3,Potato Tortilla-1,Potato Tortilla-1_Salt,Yogurt,Yogurt,Yogurt',
		result: 'Encounter,Psychic,2/Exp,Ghost,2/Raid,Fighting,1'
	},
	{ // 15
		recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Curry Powder,Ketchup,Wasabi',
		result: 'Raid,Flying,2/Humungo,Water,2/Encounter,Fire,1'
	},
	{ // 16
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Watercress-3_Pepper,Salt,Salt',
		result: 'Exp,Flying,1/Encounter,Psychic,1/Raid,Electric,1'
	},
	{ // 17
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Watercress-3,Watercress-3_Pepper,Salt,Salt',
		result: 'Exp,Flying,1/Encounter,Fighting,1/Raid,Normal,1'
	},
	{ // 18
		recipe: 'Hamburger-1,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Ketchup',
		result: 'Encounter,Flying,1/Catch,Poison,1/Exp,Steel,1'
	},
	{ // 19
		recipe: 'Cheese-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Tofu-3_Pepper,Whipped Cream',
		result: 'Humungo,Normal,2/Exp,Poison,1/Encounter,Dragon,1'
	},
	{ // 20
		recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Pepper,Whipped Cream',
		result: 'Humungo,Normal,2/Raid,Fighting,2/Encounter,Flying,1'
	},
	{ // 21
		recipe: 'Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-2_Ketchup',
		result: 'Item,Poison,1/Encounter,Normal,1/Catch,Flying,1'
	},
	{ // 22
		recipe: 'Prosciutto-3,Prosciutto-2_Ketchup',
		result: 'Encounter,Flying,1/Catch,Normal,1/Raid,Poison,1'
	},
	{ // 23
		recipe: 'Watercress-2_Ketchup',
		result: 'Teensy,Flying,1/Raid,Normal,1/Exp,Poison,1'
	},
	{ // 24
		recipe: 'Noodles-0_Ketchup',
		result: 'Encounter,Flying,1/Raid,Normal,1/Exp,Poison,1'
	},
	{ // 25
		recipe: 'Noodles-0_Ketchup,Mustard',
		result: 'Encounter,Flying,1/Raid,Ground,1/Exp,Poison,1'
	},
	{ // 26
		recipe: 'Watercress-2_Ketchup',
		result: 'Teensy,Flying,1/Raid,Normal,1/Exp,Poison,1'
	},
	{ // 27
		recipe: 'Egg-3,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1_Wasabi,Wasabi,Yogurt,Yogurt',
		result: 'Raid,Ice,2/Humungo,Electric,1/Encounter,Rock,1'
	},
	{ // 28
		recipe: 'Basil-4,Basil-4,Basil-1_Salt',
		result: 'Exp,Electric,1/Raid,Fire,1/Egg,,1'
	},
	{ // 29
		recipe: 'Basil-4,Basil-4,Basil-1,Herbed Sausage-3_Salt',
		result: 'Exp,Psychic,1/Raid,Dark,1/Egg,,1'
	},
	{ // 30
		recipe: 'Basil-4,Basil-4,Basil-1,Herbed Sausage-2_Salt',
		result: 'Exp,Psychic,1/Raid,Dark,1/Egg,,1'
	},
	{ // 31
		recipe: 'Avocado-3,Basil-4,Basil-0,Prosciutto-3,Prosciutto-3_Mustard',
		result: 'Encounter,Flying,1/Catch,Fire,1/Raid,Dragon,1'
	},
	{ // 32
		recipe: 'Apple-3,Basil-2,Cheese-2,Prosciutto-2,Watercress-2_Mustard',
		result: 'Exp,Flying,1/Raid,Ice,1/Item,Steel,1'
	},
	{ // 33
		recipe: 'Red Onion-3,Red Onion-3,Red Onion-3,Red Onion-2_Butter',
		result: 'Egg,,1/Encounter,Normal,1/Catch,Bug,1'
	},
	{ // 34
		recipe: 'Onion-3,Onion-3,Onion-3,Onion-3_Butter',
		result: 'Raid,Psychic,1/Encounter,Ghost,1/Catch,Bug,1'
	},
	{ // 35
		recipe: 'Onion-3,Onion-3,Onion-3,Onion-3,Strawberry-3_Salt',
		result: 'Raid,Psychic,1/Encounter,Ghost,1/Catch,Fighting,1'
	},
	{ // 36 - weird [1, 2, 3] typing
		recipe: 'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Red Bell Pepper-3_Peanut Butter,Peanut Butter',
		result: 'Encounter,Steel,1/Catch,Fire,1/Exp,Normal,1'
	},
	{ // 37
		recipe: 'Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3,Kiwi-3,Kiwi-3_Chili Sauce',
		result: 'Item,Poison,1/Encounter,Dragon,1/Catch,Fire,1'
	},
	{ // 38
		recipe: 'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Red Bell Pepper-3_Butter,Peanut Butter,Peanut Butter',
		result: 'Encounter,Steel,1/Catch,Bug,1/Raid,Fire,1'
	},
	{ // 39
		recipe: 'Hamburger-1,Red Bell Pepper-3_Peanut Butter,Peanut Butter',
		result: 'Egg,,1/Encounter,Fire,1/Raid,Normal,1'
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
	{ // 9
		recipe: 'Banana-3,Banana-3,Banana-3,Cheese-3,Cheese-3,Cheese-3,Cheese-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Mayonnaise,Mayonnaise,Mayonnaise,Whipped Cream,Whipped Cream',
		result: 'Encounter,Normal,3/Exp,Normal,3/Item,Normal,3'
	}
];

// singleplayer dual-typing
const TEST_SET_SPLIT_TYPING = [
	{ // 1
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Watercress-3,Watercress-1_Pepper,Salt,Salt',
		result: 'Exp,Flying,1/Encounter,Fighting,1/Raid,Flying,1'
	},
	{ // 2
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Watercress-3,Watercress-2_Pepper,Salt,Salt',
		result: 'Exp,Flying,1/Encounter,Fighting,1/Raid,Flying,1'
	},
	{ // 3
		recipe: 'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Butter',
		result: 'Exp,Steel,1/Encounter,Ghost,1/Catch,Steel,1'
	},
	{ // 4
		recipe: 'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Butter',
		result: 'Encounter,Steel,1/Exp,Steel,1/Catch,Ghost,1'
	},
	{ // 5
		recipe: 'Tofu-3,Tofu-3,Tofu-3,Tofu-3,Watercress-3,Watercress-1_Pepper,Pepper,Salt,Salt',
		result: 'Exp,Normal,1/Raid,Flying,1/Encounter,Normal,1'
	},
	{ // 6
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Watercress-3_Salt',
		result: 'Encounter,Flying,1/Catch,Fighting,1/Raid,Flying,1'
	},
	{ // 7
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Watercress-1_Ketchup,Whipped Cream,Whipped Cream',
		result: 'Egg,,1/Encounter,Ground,1/Catch,Flying,1'
	},
	{ // 8
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Ketchup',
		result: 'Encounter,Flying,1/Catch,Normal,1/Exp,Flying,1'
	},
	{ // 9
		recipe: 'Apple-1,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Ketchup',
		result: 'Encounter,Flying,1/Catch,Ice,1/Exp,Flying,1'
	},
	{ // 10
		recipe: 'Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3_Ketchup',
		result: 'Item,Poison,1/Encounter,Normal,1/Catch,Poison,1'
	},
	{ // 11
		recipe: 'Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3,Kiwi-3_Ketchup,Ketchup,Ketchup,Ketchup',
		result: 'Teensy,Poison,1/Encounter,Dragon,1/Raid,Poison,1'
	},
	{ // 12
		recipe: 'Cheese-2,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Butter',
		result: 'Exp,Steel,1/Encounter,Ghost,1/Catch,Steel,1'
	},
	{ // 13
		recipe: 'Cheese-3,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Butter',
		result: 'Encounter,Steel,1/Catch,Ghost,1/Exp,Steel,1'
	},
	{ // 14
		recipe: 'Ham-3,Ham-3,Ham-3,Ham-3_Mustard',
		result: 'Encounter,Ground,1/Catch,Normal,1/Exp,Ground,1'
	},
	{ // 15
		recipe: 'Tofu-3,Tofu-3,Tofu-3,Tofu-3,Watercress-3,Watercress-2_Pepper,Pepper,Salt,Salt',
		result: 'Exp,Normal,1/Raid,Flying,1/Encounter,Normal,1'
	},
	{ // 16
		recipe: 'Red Onion-3,Red Onion-3,Red Onion-3,Red Onion-3_Butter',
		result: 'Egg,,1/Encounter,Normal,1/Catch,Ghost,1'
	},
	{ // 17
		recipe: 'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Red Bell Pepper-1_Peanut Butter,Peanut Butter',
		result: 'Encounter,Steel,1/Catch,Normal,1/Raid,Steel,1'
	},
	{ // 18
		recipe: 'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Red Bell Pepper-2_Peanut Butter,Peanut Butter',
		result: 'Encounter,Steel,1/Catch,Normal,1/Raid,Steel,1'
	},
	{ // 19
		recipe: 'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Watercress-1_Peanut Butter,Peanut Butter,Peanut Butter,Peanut Butter',
		result: 'Encounter,Steel,1/Raid,Normal,1/Catch,Steel,1'
	},
	{ // 20
		recipe: 'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Watercress-2_Peanut Butter,Peanut Butter,Peanut Butter,Peanut Butter',
		result: 'Encounter,Steel,1/Raid,Normal,1/Catch,Steel,1'
	},
	{ // 21
		recipe: 'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Watercress-3_Peanut Butter,Peanut Butter,Peanut Butter,Peanut Butter',
		result: 'Encounter,Steel,1/Raid,Normal,1/Catch,Steel,1'
	},
	{ // 22
		recipe: 'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Peanut Butter,Peanut Butter,Peanut Butter,Peanut Butter',
		result: 'Encounter,Steel,1/Catch,Steel,1/Raid,Normal,1'
	},
	{ // 23
		recipe: 'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Peanut Butter',
		result: 'Encounter,Steel,1/Exp,Steel,1/Catch,Normal,1'
	},
	{ // 24
		recipe: 'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Mustard',
		result: 'Encounter,Steel,1/Exp,Steel,1/Catch,Rock,1'
	},
	{ // 25
		recipe: 'Apple-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Peanut Butter,Peanut Butter,Peanut Butter,Peanut Butter',
		result: 'Encounter,Steel,1/Raid,Flying,1/Catch,Steel,1'
	},
	{ // 26
		recipe: '',
		result: ''
	},
	{ // 27
		recipe: '',
		result: ''
	}
];

// 2-star
const TEST_SET_2_STAR = [
	{ // 1
		recipe: 'Basil-0_Ketchup',
		result: 'Encounter,Flying,1/Raid,Poison,1'
	},
	{ // 2
		recipe: 'Basil-1_Ketchup',
		result: 'Encounter,Flying,1/Raid,Poison,1/Exp,Fire,1'
	},
	{ // 3
		recipe: 'Prosciutto-3,Prosciutto-2,Prosciutto-0,Prosciutto-0_Ketchup',
		result: 'Encounter,Flying,1/Catch,Poison,1'
	},
	{ // 4
		recipe: 'Watercress-1_Ketchup',
		result: 'Teensy,Flying,1/Raid,Poison,1/Exp,Normal,1'
	},
	{ // 5
		recipe: 'Basil-2,Chorizo-1_Ketchup',
		result: 'Encounter,Poison,1/Raid,Electric,1/Exp,Fire,1'
	},
	{ // 6
		recipe: 'Watercress-3,Watercress-3,Watercress-3,Watercress-0,Watercress-0,Watercress-0_Ketchup',
		result: 'Item,Flying,1/Raid,Normal,1/Egg,,1'
	},
	{ // 7
		recipe: 'Watercress-3,Watercress-3,Watercress-2,Watercress-0,Watercress-0,Watercress-0_Ketchup',
		result: 'Item,Flying,1/Raid,Normal,1/Egg,,1'
	},
	{ // 8
		recipe: 'Watercress-2,Watercress-0,Watercress-0,Watercress-0,Watercress-0,Watercress-0_Ketchup',
		result: 'Teensy,Flying,1/Raid,Poison,1/Exp,Normal,1'
	},
	{ // 9
		recipe: 'Basil-4,Basil-0_Ketchup',
		result: 'Encounter,Fire,1/Raid,Grass,1/Exp,Water,1'
	},
	{ // 10
		recipe: 'Basil-3,Basil-0_Ketchup',
		result: 'Encounter,Fire,1/Raid,Grass,1/Exp,Water,1'
	},
	{ // 11
		recipe: 'Basil-0,Chorizo-1_Ketchup',
		result: 'Encounter,Poison,1/Raid,Bug,1/Exp,Normal,1'
	},
	{ // 12
		recipe: 'Avocado-2,Basil-0_Ketchup',
		result: 'Teensy,Dragon,1/Raid,Poison,1/Encounter,Flying,1'
	},
	{ // 13
		recipe: 'Prosciutto-1_Bitter Herba Mystica',
		result: 'Title,Flying,2/Exp,Fighting,2/Encounter,Normal,1'
	},
	{ // 14
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-0,Prosciutto-0_Bitter Herba Mystica',
		result: 'Title,Flying,2/Exp,Fighting,2/Encounter,Normal,1'
	},
	{ // 15
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-1,Prosciutto-0_Bitter Herba Mystica',
		result: 'Title,Flying,2/Exp,Fighting,2/Encounter,Normal,1'
	},
	{ // 16
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-0,Prosciutto-0,Prosciutto-0_Spicy Herba Mystica',
		result: 'Title,Flying,2/Humungo,Flying,2/Encounter,Fighting,2'
	},
	{ // 17
		recipe: 'Prosciutto-1_Bitter Herba Mystica',
		result: 'Title,Flying,2/Exp,Fighting,2/Encounter,Normal,1'
	},
	{ // 18
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-0,Prosciutto-0_Bitter Herba Mystica',
		result: 'Title,Flying,2/Exp,Fighting,2/Encounter,Normal,1'
	},
	{ // 19
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-1,Prosciutto-0_Bitter Herba Mystica',
		result: 'Title,Flying,2/Exp,Fighting,2/Encounter,Normal,1'
	},
	{ // 20
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-0,Prosciutto-0,Prosciutto-0_Spicy Herba Mystica',
		result: 'Title,Flying,2/Humungo,Flying,2/Encounter,Fighting,2'
	},
	{ // 21
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-1,Prosciutto-0,Prosciutto-0_Spicy Herba Mystica',
		result: 'Title,Flying,2/Humungo,Flying,2/Encounter,Fighting,2'
	},
	{ // 22
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-2,Prosciutto-0,Prosciutto-0_Spicy Herba Mystica',
		result: 'Title,Flying,2/Humungo,Flying,2/Encounter,Fighting,2'
	},
	{ // 23
		recipe: 'Basil-4,Basil-3,Basil-0_Salt',
		result: 'Exp,Electric,1/Raid,Fire,1/Egg,,1'
	},
	{ // 24
		recipe: 'Basil-4,Basil-4,Basil-0_Salt',
		result: 'Exp,Electric,1/Raid,Fire,1/Egg,,1'
	},
	{ // 25
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-0,Prosciutto-0,Prosciutto-0_Ketchup,Spicy Herba Mystica',
		result: 'Title,Flying,2/Humungo,Flying,2/Encounter,Normal,2'
	},
	{ // 26
		recipe: 'Avocado-3,Prosciutto-3,Prosciutto-3,Prosciutto-0,Prosciutto-0,Prosciutto-0_Ketchup,Spicy Herba Mystica',
		result: 'Title,Flying,2/Humungo,Poison,2/Encounter,Dragon,1'
	},
	{ // 27
		recipe: 'Apple-1,Prosciutto-3,Prosciutto-0,Prosciutto-0,Prosciutto-0,Prosciutto-3_Bitter Herba Mystica,Ketchup',
		result: 'Title,Flying,2/Exp,Ice,2/Encounter,Steel,1'
	},
	{ // 28
		recipe: 'Apple-1,Cheese-1,Prosciutto-3,Prosciutto-0,Prosciutto-0,Prosciutto-3_Bitter Herba Mystica,Ketchup',
		result: 'Title,Flying,2/Exp,Ice,2/Encounter,Steel,1'
	},
	{ // 29
		recipe: 'Avocado-0,Prosciutto-0_Ketchup,Sour Herba Mystica,Sweet Herba Mystica',
		result: 'Sparkling,Flying,3/Title,Flying,3/Catch,Flying,3'
	},
	{ // 30
		recipe: 'Avocado-1,Basil-4,Basil-1,Prosciutto-1,Prosciutto-2_Mustard',
		result: 'Exp,Flying,1/Raid,Dragon,1/Encounter,Fire,1'
	},
	{ // 31
		recipe: '',
		result: ''
	}
];

// 1-star
const TEST_SET_1_STAR = [
	{ // 1
		recipe: 'Onion-3,Onion-3,Onion-3,Onion-3,Onion-3,Onion-3_Chili Sauce,Sour Herba Mystica,Spicy Herba Mystica,Spicy Herba Mystica',
		result: 'Sparkling,Psychic,2/Title,Water,2/Encounter,Grass,2'
	},
	{ // 2
		recipe: 'Avocado-3,Avocado-3,Avocado-3,Avocado-3,Avocado-3,Avocado-3_Bitter Herba Mystica,Bitter Herba Mystica',
		result: 'Sparkling,Dragon,1'
	},
	{ // 3
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3_Sweet Herba Mystica',
		result: ''
	},
	{ // 4
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3_Sweet Herba Mystica,Whipped Cream,Whipped Cream,Whipped Cream',
		result: ''
	},
	{ // 5
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Rice-1_Bitter Herba Mystica',
		result: ''
	},
	{ // 6
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Rice-1_Bitter Herba Mystica,Spicy Herba Mystica',
		result: 'Sparkling,Normal,2/Title,Fire,2/Humungo,Poison,1'
	},
	{ // 7
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3_Bitter Herba Mystica,Bitter Herba Mystica,Bitter Herba Mystica',
		result: 'Sparkling,Normal,3/Title,Poison,3/Exp,Bug,3'
	},
	{ // 8
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3_Sour Herba Mystica,Spicy Herba Mystica,Spicy Herba Mystica',
		result: 'Sparkling,Normal,3/Title,Poison,3/Exp,Bug,3'
	},
	{ // 9
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-1_Salty Herba Mystica,Sweet Herba Mystica,Sweet Herba Mystica',
		result: 'Sparkling,Normal,3/Title,Poison,3/Egg,,3'
	},
	{ // 10
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Bitter Herba Mystica,Salty Herba Mystica,Sour Herba Mystica,Sweet Herba Mystica',
		result: 'Sparkling,Flying,3/Title,Normal,3/Encounter,Fighting,3'
	},
	{ // 11
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Bitter Herba Mystica,Salty Herba Mystica,Sour Herba Mystica',
		result: 'Sparkling,Flying,2/Title,Normal,2/Encounter,Fighting,2'
	},
	{ // 12
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Bitter Herba Mystica,Sweet Herba Mystica',
		result: 'Sparkling,Flying,1'
	},
	{ // 13
		recipe: 'Prosciutto-0,Prosciutto-1,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Bitter Herba Mystica,Spicy Herba Mystica,Spicy Herba Mystica,Sweet Herba Mystica',
		result: 'Sparkling,Flying,3/Title,Normal,3/Encounter,Fighting,3'
	},
	{ // 14
		recipe: 'Basil-4,Basil-4,Basil-4,Basil-1_Bitter Herba Mystica,Bitter Herba Mystica,Spicy Herba Mystica,Sweet Herba Mystica',
		result: 'Sparkling,Fire,3/Title,Water,3/Item,Grass,3'
	},
	{ // 15
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Bitter Herba Mystica,Sour Herba Mystica,Spicy Herba Mystica',
		result: 'Sparkling,Flying,2/Title,Normal,2/Encounter,Fighting,2'
	},
	{ // 16
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-1_Bitter Herba Mystica,Spicy Herba Mystica,Sweet Herba Mystica',
		result: 'Sparkling,Flying,2/Title,Normal,2/Egg,,2'
	},
	{ // 17
		recipe: 'Basil-4,Basil-4,Basil-4,Basil-1_Bitter Herba Mystica,Sour Herba Mystica,Spicy Herba Mystica',
		result: 'Sparkling,Fire,2/Title,Water,2/Item,Grass,2'
	},
	{ // 18
		recipe: 'Basil-4,Basil-4,Basil-4,Basil-1_Bitter Herba Mystica,Sour Herba Mystica',
		result: 'Sparkling,Fire,1/Title,Water,1/Item,Grass,1'
	},
	{ // 19
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3_Bitter Herba Mystica,Salty Herba Mystica',
		result: 'Sparkling,Normal,2/Title,Poison,2/Exp,Bug,2'
	},
	{ // 20
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-2_Bitter Herba Mystica,Sour Herba Mystica',
		result: 'Sparkling,Normal,2/Title,Poison,2/Exp,Bug,2'
	},
	{ // 21
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-1_Spicy Herba Mystica,Spicy Herba Mystica',
		result: 'Sparkling,Normal,1/Title,Poison,1/Exp,Bug,1'
	},
	{ // 22
		recipe: 'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3_Bitter Herba Mystica,Bitter Herba Mystica',
		result: 'Sparkling,Normal,1/Title,Poison,1/Exp,Bug,1'
	},
	{ // 23
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Salty Herba Mystica,Sweet Herba Mystica',
		result: 'Sparkling,Flying,1'
	},
	{ // 24
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Bitter Herba Mystica,Peanut Butter,Sweet Herba Mystica',
		result: 'Sparkling,Flying,1/Title,Steel,1/Encounter,Fire,1'
	},
	{ // 25
		recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Bitter Herba Mystica,Ketchup,Sweet Herba Mystica',
		result: 'Sparkling,Flying,1/Title,Poison,1'
	},
	{ // 26
		recipe: 'Avocado-3,Avocado-3,Avocado-3,Avocado-3,Avocado-3,Chorizo-3_Bitter Herba Mystica,Spicy Herba Mystica,Spicy Herba Mystica,Vinegar',
		result: 'Sparkling,Dragon,2/Title,Normal,2/Encounter,Poison,2'
	},
	{ // 27
		recipe: '',
		result: ''
	},
	{ // 28
		recipe: '',
		result: ''
	},
	{ // 29
		recipe: '',
		result: ''
	}
];

// 4-star
const TEST_SET_4_STAR = [
	{
		recipe: 'Ham-3,Ham-3,Ham-3,Ham-3_Bitter Herba Mystica,Curry Powder,Curry Powder,Curry Powder,Curry Powder,Salty Herba Mystica,Sour Herba Mystica,Sweet Herba Mystica',
		result: 'Sparkling,Ground,3/Title,Ground,3/Encounter,Ground,3'
	},
	{
		recipe: 'Basil-4,Herbed Sausage-3,Herbed Sausage-3,Herbed Sausage-3,Noodles-1,Noodles-1,Onion-3,Onion-3,Onion-3,Potato Tortilla-1,Potato Tortilla-1,Potato Tortilla-1,Strawberry-3,Strawberry-3,Strawberry-3_Salt,Salt,Salt,Salt,Vinegar,Vinegar,Vinegar,Vinegar,Wasabi,Wasabi,Wasabi,Wasabi',
		result: 'Encounter,Psychic,3/Raid,Psychic,3/Item,Ghost,2'
	},
	{
		recipe: 'Ham-3,Ham-3,Ham-3,Ham-3_Bitter Herba Mystica,Curry Powder,Curry Powder,Curry Powder,Curry Powder,Salty Herba Mystica,Sour Herba Mystica,Sweet Herba Mystica',
		result: 'Sparkling,Ground,3/Title,Ground,3/Encounter,Ground,3'
	}
];

const TEST_SET_NAMES = ['Herba', 'Non-herba', 'Multiplayer', 'Split-Typing', '2 star', '1 star', '4 star'];

// generates a sandwich from a 'save recipe' string
export const generateSandwichFromRecipe = recipe => {
	const ingredients = getIngredientsFromRecipe(recipe);
	if (!ingredients) { return undefined; }
	const sums = getIngredientsSums(ingredients.fillings, ingredients.condiments);
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
	const sets = [
		TEST_SET_HERBA,
		TEST_SET_NONHERBA,
		TEST_SET_MULTIPLAYER,
		TEST_SET_SPLIT_TYPING,
		TEST_SET_2_STAR,
		TEST_SET_1_STAR,
		TEST_SET_4_STAR
	];

	for (let j = 0; j < sets.length; j++) {
		const testSetName = TEST_SET_NAMES[j];
		const testSet = sets[j];
		let failures = [];
		console.log(`%cTest Set ${j + 1} (${testSetName})`, 'color: aqua;');
		console.groupCollapsed(testSetName);
		for (let i = 0; i < testSet.length; i++) {
			const result = {
				powers: "pass",
				types: "pass",
				levels: "pass"
			};
	
			const test = testSet[i];
			const recipe = test.recipe;
			const sandwich = generateSandwichFromRecipe(recipe);
			
			if (sandwich) {
				const realResult = test.result.split("/");
				const resultStr = getSandwichResult(sandwich);
				let failSandwich = false;
	
				let input = "";
				let expected = "";
				for (let k = 0; k < Math.max(realResult.length, resultStr.length); k++) {
					const realLine = realResult[k];
					const myLine = resultStr[k];
		
					let myPower = "1", myType = "1", myLevel = "1";
					if (myLine) {
						const mySplit = myLine.split(",");
						myPower = FULL_TO_ALIAS[mySplit[0].trim()];
						myType = mySplit[1].trim();
						myLevel = mySplit[2].trim();
						input += `\t${myPower}: ${myType} Lv. ${myLevel}\n`;						
					}

					let realPower = "2", realType = "2", realLevel = "2";
					if (realLine) {
						const realSplit = realLine.split(",");
						realPower = realSplit[0].trim();
						realType = realSplit[1].trim();
						realLevel = realSplit[2].trim();
						expected += `\t${realPower}: ${realType} Lv. ${realLevel}\n`;
					}

					if (input.length === 0) { input = "\tno effects"; }
					if (expected.length === 0) { expected = "\tno effects"; }
		
					if (input === expected) {
						result.powers = result.types = result.levels = "pass";
					} else {
						if (myPower.toLowerCase() !== realPower.toLowerCase()) { result.powers = "fail"; }
						if (myType.toLowerCase() !== realType.toLowerCase()) { result.types = "fail"; }
						if (myLevel.toLowerCase() !== realLevel.toLowerCase()) { result.levels = "fail"; }						
					}
				}
				if (result.powers === "fail" || result.types === "fail" || result.levels === "fail") {
					failures.push("#" + (i + 1));
					failSandwich = true;
				}

				console.groupCollapsed("%cSandwich " + (i + 1), failSandwich ? 'color: red;' : 'color: green;');
	
				const color1 = result.powers === "pass" ? 'green' : 'red';
				const color2 = result.types === "pass" ? 'green' : 'red';
				const color3 = result.levels === "pass" ? 'green' : 'red';

				console.log(recipe);
				console.log("Generated:\n" + input);
				console.log("Expected:\n" + expected);
				console.log(`Powers: %c${result.powers}%c, Types: %c${result.types}%c, Levels: %c${result.levels}%c`,
					`color: ${color1};`, `color: ;`,
					`color: ${color2};`, `color: ;`, 
					`color: ${color3};`, `color: ;`);
				console.groupEnd();
			} else {
				// console.warn("invalid recipe", recipe);
			}
		}
		console.groupEnd();
		
		if (failures.length > 0) {
			console.log("\tFailed sandwiches: " + failures.join(", "));
		} else {
			console.log("\tAll sandwiches passed from Test Set " + (j + 1));
		}
	}

	console.info("Tests concluded --------------------");
};
