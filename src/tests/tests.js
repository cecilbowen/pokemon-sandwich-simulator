import { getIngredientsFromRecipe, FULL_TO_ALIAS } from '../util';
import { getSandwich } from '../helper/helper';

import NON_HERBA_TESTS from "../tests/non-herba.json";
import HERBA_TESTS from "../tests/herba.json";
import MULTIPLAYER_TESTS from "../tests/multiplayer.json";
import SPLIT_TYPING_TESTS from "../tests/split-typing.json";
import ONE_STAR_TESTS from "../tests/1-star.json";
import TWO_STAR_TESTS from "../tests/2-star.json";
import FOUR_STAR_TESTS from "../tests/4-star.json";
import BREAD_VS from "../tests/bread-vs.json";

// generates a sandwich from a 'save recipe' string
const generateSandwichFromRecipe = recipe => {
    const ingredients = getIngredientsFromRecipe(recipe);

    return getSandwich(ingredients);
};

const getSandwichResult = sandwich => {
	const ret = [];
	for (const effect of sandwich.effects) {
		ret.push(`${effect.name},${effect.type},${effect.level}`);
	}

	return ret;
};

export const runTests = () => {
	console.info("Starting tests --------------------");
    const setNames = [
        "non-herba",
        "herba",
        "multiplayer",
        "split typing",
        "2 star",
        "1 star",
        "4 star",
		"bread vs no-bread"
    ];
	const sets = [
        NON_HERBA_TESTS, // generic/recipes without herba mystica
		HERBA_TESTS, // recipes with herba mystica
		MULTIPLAYER_TESTS, // multiplayer-only recipes
		SPLIT_TYPING_TESTS, // split typing, eg. normal/fire/normal
		TWO_STAR_TESTS, // two star recipes
		ONE_STAR_TESTS, // one star recipes
		FOUR_STAR_TESTS, // four star recipes
		BREAD_VS // recipes with bread on/off as the only ingredient difference that have different results
	];

    const tempLimitPerSet = 1000;

	for (let j = 0; j < sets.length; j++) {
		const testSetName = setNames[j];
		const testSet = sets[j];
		const failures = [];
		console.log(`%cTest Set ${j + 1} (${testSetName})`, 'color: aqua;');
		console.groupCollapsed(testSetName);
		for (let i = 0; i < testSet.length; i++) {
            if (i >= tempLimitPerSet) { break; }
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
                        // myPower = mySplit[0].trim();
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
					failures.push(`#${ i + 1}`);
					failSandwich = true;
				}

				console.groupCollapsed(`%cSandwich ${ i + 1}`, failSandwich ? 'color: red;' : 'color: green;');

				const color1 = result.powers === "pass" ? 'green' : 'red';
				const color2 = result.types === "pass" ? 'green' : 'red';
				const color3 = result.levels === "pass" ? 'green' : 'red';

				console.log(recipe);
				console.log(`Generated:\n${ input}`);
				console.log(`Expected:\n${ expected}`);
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
			console.log(`\tFailed sandwiches: ${ failures.join(", ")}`);
		} else {
			console.log(`\tAll sandwiches passed from Test Set ${ j + 1}`);
		}
	}

	console.info("Tests concluded --------------------");
};
