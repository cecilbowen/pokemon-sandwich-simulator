import SKILLS from "../data/powers-short.json";
import TASTES from "../data/flavors.json";
import TYPES from "../data/types.json";

import TASTE_POWERS from "./taste-powers.json";
import TASTE_MAP from "./taste-map.json";
import DELICIOUSNESS_POKETYPE_POINTS from "./deliciousness-poketype-points.json";
import SKILL_LEVEL_POINT_TABLE from "./skill-level-point-table.json";

import FILLINGS from "../data/fillings.json";
import FILLINGS_MAP from "../data/fillings-map.json";
import SANDWICHES from "../data/sandwiches.json";
import { ALIAS_TO_FULL, getPresetSandwichStatsAndMods } from "../util";

/*
    Pokemon Sandwich Simulator helper file

    All related functions have been included in this file for the sake of compactness.
    The imported JSONs above are all explained below, including either the full JSON content or an example.

    SKILLS - a string array of all the skills
        [ "Egg", "Catch", "Exp", "Item", "Raid", "Sparkling", "Title", "Humungo", "Teensy", "Encounter" ]

    TASTES - a string array of all the tastes
        [ "Sweet", "Salty", "Sour", "Bitter", "Hot" ]

    TYPES - a string array of all the pokemon types
        [ "Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel",
          "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon", "Dark", "Fairy" ]

    TASTE_POWERS - an object array of taste, skillType and power combos
        example with only 1 object:
        [{
            "tastes": [1, 0],
            "skillType": 5,
            "power": 100
        }]

    TASTE_MAP - a map of taste names with their associated numerical type
        { "Sweet": 1, "Salty": 2, "Sour": 3, "Bitter": 4, "Hot": 0 }

    DELICIOUSNESS_POKETYPE_POINTS - a numerical array of skill power modifiers indexed by deliciousness
        [-500, 0, 20, 100, 0, 0]

    SKILL_LEVEL_POINT_TABLE - a numerical array of skill power thresholds needed to cross to reach the next skill level
        [1, 200, 400]

    FILLINGS - an object array of all the fillings
        example with only 1 filling:
        [{
            "name":"Apple",
            "tastes":[{"flavor":"Sweet","amount":4},{"flavor":"Sour","amount":3},{"flavor":"Bitter","amount":1}],
            "powers":[
                {"type":"Egg","amount":4},{"type":"Catch","amount":-1},{"type":"Item","amount":7},
                {"type":"Humungo","amount":-5}
            ],
            "types":[
                {"type":"Flying","amount":7},{"type":"Steel","amount":7},
                {"type":"Ice","amount":7}
            ],
            "imageUrl":"https://www.serebii.net/itemdex/sprites/apple.png",
            "pieces":3,
            "id":32,
            "maxPiecesOnDish":6
        }]

    FILLINGS_MAP - an object map of all the fillings, mapped by filling name
        example with only 1 filling:
        "Apple": {
            "imageUrl": "https://www.serebii.net/itemdex/sprites/apple.png",
            "pieces": 3,
            "Sweet": 4,
            "Sour": 3,
            "Bitter": 1,
            "Egg": 4,
            "Catch": -1,
            "Item": 7,
            "Humungo": -5,
            "Flying": 7,
            "Steel": 7,
            "Ice": 7
        }

    SANDWICHES - an object array of all the preset sandwiches
        example with only 1 object:
        [{"number":"1","name":"Jambon-Beurre",
        "description":"A sandwich with just ham and butter in it. So simple that there's no way to fake it.",
        "fillings":["Ham"],"condiments":["Butter"],
        "effects":[{"name":"Encounter Power","type":"Ground","level":"1"},{"name":"Raid Power","type":"Ghost","level":"1"},
        {"name":"Catching Power","type":"Bug","level":"1"}],"imageUrl":"https://www.serebii.net/scarletviolet/sandwich/1.jpg",
        "location":"Start","rawEffectValues":{"powers":{"Catching Power":80,"Raid Power":85,"Encounter Power":90},
        "types":{"Ground":90,"Bug":80,"Ghost":85}}}]
*/

export const descendingSort = propName => (a, b) => b[propName] - a[propName];

export const indexToPrime = num => [2, 3, 5, 7, 11][num] ?? 1;

// check if two arrays contain the same elements
const areEqual = (array1, array2) => {
    if (array1.length === array2.length) {
        const diff = array1.filter(x => !array2.includes(x) ||
            array2.filter(y => y === x).length !== array1.filter(y => y === x).length);
        return diff.length === 0;
    }

    return false;
};

const getNumberOfPlayers = ingredients => {
    return Math.max(1, Math.ceil(ingredients.fillings.length / 6), Math.ceil(ingredients.condiments.length / 4));
};

// using a string array of filling names, returns an object array of fillings
const getFillings = strArr => {
    const ret = [];
    for (const str of strArr) {
        const filling = FILLINGS.filter(x => x.name === str)[0];
        if (filling) {
            ret.push({ ...filling });
        }
    }

    return ret;
};

const checkPresetSandwich = (fillings, condiments) => {
    const ingredients = [
        ...fillings.sort((a, b) => a.name.localeCompare(b.name)),
        ...condiments.sort((a, b) => a.name.localeCompare(b.name))
    ];

    // check if the ingredients and pieces match with any existing sandwich recipe
    let foundSandwich;
    for (const sandwich of SANDWICHES) {
        const sandwichIngredients = [...sandwich.fillings, ...sandwich.condiments];
        if (areEqual(ingredients.map(x => x.name), sandwichIngredients) &&
            areEqual(fillings.map(x => x.pieces), getFillings(sandwich.fillings).map(x => x.pieces))) {
            foundSandwich = sandwich;
            break;
        }
    }

    return foundSandwich;
};

export const getHerbaCount = condiments => {
    let count = 0;
    for (const condiment of condiments) {
        if (condiment.name.toLowerCase().indexOf("herba") !== -1) {
            count++;
        }
    }

    return count;
};

export const getFillInTypes = inTypeArr => {
    const typeArr = [...inTypeArr];
    let valueRate = 3;
    for (let i = 0; i < typeArr.length; i++) {
        const type = typeArr[i];
        type.power = parseInt(type.power / valueRate, 10);
        if (valueRate === 3) {
            type.power -= 20;
        }
        valueRate -= 1;
    }

    return typeArr;
};

export const getFoodSkillLevel = power => {
    if (power >= SKILL_LEVEL_POINT_TABLE[2]) {
        return 3;
    } else if (power >= SKILL_LEVEL_POINT_TABLE[1]) {
        return 2;
    } else if (power >= SKILL_LEVEL_POINT_TABLE[0]) {
        return 1;
    }

    return 0;
};

/**
 * Returns the calculated tastes and deliciousness
 * @param {object} ingredients Ingredients object { fillings, condiments, hasBread }
 * @param {object} isRecipe The recipe's sandwich if it exists
 * @returns {Array} [ tastes: { name, type, point }, deliciousness ]
 */
const getTastesAndDeliciousness = ingredients => {
    const hasBread = ingredients.hasBread;
    const fillings = ingredients.fillings;
    const condiments = ingredients.condiments;
    const amountOfPlayers = getNumberOfPlayers(ingredients);

    const tastePointMap = {};

    for (const taste of TASTES) {
        tastePointMap[taste] = {
            // only reason we use TASTE_MAP instead of just re-ordering the flavors.json array to have "Hot"
            // first and using index as type is because later on in the code, we want to check the values
            // in the current order, NOT in the type order
            type: TASTE_MAP[taste],
            point: 0
        };
    }

    // map { fillingName: pieces }
    const fillingMap = {};

    // add up flavor sums of fillings and condiments
    for (const filling of fillings) {
        fillingMap[filling.name] = (fillingMap[filling.name] || 0) + filling.pieces;
        for (const taste of filling.tastes) {
            tastePointMap[taste.flavor].point += taste.amount * filling.pieces;
        }
    }
    for (const condiment of condiments) {
        for (const taste of condiment.tastes) {
            tastePointMap[taste.flavor].point += taste.amount;
        }
    }

    let deliciousnessChanged = false;
    let deliciousness = 1;
    // if (isRecipe) {
    //     deliciousness = 2;
    //     return isRecipe;
    // }

    // if same type of ingredients pieces on sandwich >= ingredientLimit, 1 star sandwich
    let ingredientLimit = 13;
    if (amountOfPlayers === 3) {
        ingredientLimit = 19;
    } else if (amountOfPlayers === 4) {
        ingredientLimit = 25;
    }

    for (const pieces of Object.values(fillingMap)) {
        if (pieces >= ingredientLimit) {
            deliciousness = 0;
            deliciousnessChanged = true;
            break;
        }
    }

    if (!deliciousnessChanged) {
        let isVeryGood = true;
        for (const [flavor, taste] of Object.entries(tastePointMap)) {
            if (taste.point < 100) {
                isVeryGood = false;
                break;
            }
        }

        if (isVeryGood) {
            deliciousness = 3;
            deliciousnessChanged = true;
        }

        // if STILL no match
        if (!deliciousnessChanged) {
            // how many fillings (not counting pieces, just fillings)
            const fillingsAmount = fillings.length;

            // how many pieces would be on the sandwich if none were dropped
            const maxPiecesPerFilling = fillings.map(x => FILLINGS_MAP[x.name].pieces);
            const totalPieces = maxPiecesPerFilling.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

            const totalPiecesOnSandwich = Object.values(fillingMap)
                .reduce((accumulator, currentValue) => accumulator + currentValue, 0) +
                (hasBread ? 1 : 0); // bread counts against you if you drop it

            const dropNum = totalPieces - totalPiecesOnSandwich;

            if (dropNum <= fillingsAmount) {
                deliciousness = 2;
                deliciousnessChanged = true;
            }
        }
    }

    const tastePointList = [];
    for (const [k, v] of Object.entries(tastePointMap)) {
        tastePointList.push({
            name: k,
            type: v.type,
            point: v.point
        });
    }

    // sort descending by points
    tastePointList.sort(descendingSort("point"));

    return { tastes: tastePointList, deliciousness };
};

/**
 * Returns the calculated skills.
 * @param {object} ingredients Ingredients object { fillings, condiments, hasBread }
 * @param {Array} tastes Tastes points array
 * @returns {Array} [{ name, type, power }]
 */
const getSkills = (ingredients, tastes) => {
    const fillings = ingredients.fillings;
    const condiments = ingredients.condiments;
    const foodSkillParamMap = {};
    const skillPowerMods = {}; // any increases/decreases to a skill power

    for (const skill of SKILLS) {
        foodSkillParamMap[skill] = {
            type: SKILLS.indexOf(skill) + 1,
            power: 0
        };
    }

    const herbaCount = getHerbaCount(condiments);
    if (herbaCount >= 1) {
        foodSkillParamMap.Title.power += 10000;
        skillPowerMods.Title = (skillPowerMods.Title || 0) + 10000;
    }
    if (herbaCount >= 2) {
        foodSkillParamMap.Sparkling.power += 20000;
        skillPowerMods.Sparkling = (skillPowerMods.Sparkling || 0) + 20000;
    }

    // add up power sums of fillings and condiments
    for (const filling of fillings) {
        for (const power of filling.powers) {
            foodSkillParamMap[power.type].power += power.amount * filling.pieces;
        }
    }
    for (const condiment of condiments) {
        for (const power of condiment.powers) {
            foodSkillParamMap[power.type].power += power.amount;
        }
    }

    for (const item of TASTE_POWERS) {
        let addPowMag = 1, tastePowMag = 1;
        let isMatch = false;

        for (let j = 0; j < item.tastes.length; j++) {
            const taste = item.tastes[j];
            addPowMag *= indexToPrime(taste);
            tastePowMag *= indexToPrime(tastes[j].type);
        }

        if (addPowMag === tastePowMag) {
            isMatch = true;
        }

        if (isMatch) {
            const theSkill = SKILLS[item.skillType - 1];
            const fh = foodSkillParamMap[theSkill];
            skillPowerMods[theSkill] = (skillPowerMods[theSkill] || 0) + item.power;
            fh.power += item.power;
            break;
        }
    }

    const foodSkillParamList = [];
    for (const [k, v] of Object.entries(foodSkillParamMap)) {
        foodSkillParamList.push({
            name: k,
            type: v.type,
            power: v.power
        });
    }

    // sort descending by power
    foodSkillParamList.sort(descendingSort("power"));

    return { skills:foodSkillParamList, skillMods: skillPowerMods };
};

/**
 * Returns the calculated types.
 * @param {object} ingredients Ingredients object { fillings, condiments, hasBread }
 * @param {number} deliciousness Deliciousness value
 * @returns {Array} [{ name, type, power }]
 */
const getTypes = (ingredients, deliciousness) => {
    const fillings = ingredients.fillings;
    const condiments = ingredients.condiments;
    const pokeTypeParamMap = {};
    const typeMods = {};
    const finalTypes = [];

    for (const type of TYPES) {
        pokeTypeParamMap[type] = {
            type: TYPES.indexOf(type),
            power: 0
        };
    }

    // add up type sums of fillings and condiments
    for (const filling of fillings) {
        for (const type of filling.types) {
            pokeTypeParamMap[type.type].power += type.amount * filling.pieces;
        }
    }
    for (const condiment of condiments) {
        for (const type of condiment.types) {
            pokeTypeParamMap[type.type].power += type.amount;
        }
    }

    for (const type of TYPES) {
        const dPoints = DELICIOUSNESS_POKETYPE_POINTS[deliciousness];
        pokeTypeParamMap[type].power += dPoints;
        typeMods[type] = (typeMods[type] || 0) + dPoints;
    }

    const pokeTypeParamList = [];
    for (const [k, v] of Object.entries(pokeTypeParamMap)) {
        pokeTypeParamList.push({
            name: k,
            type: v.type,
            power: v.power
        });
    }

    // sort descending by power
    pokeTypeParamList.sort(descendingSort("power"));

    if (deliciousness === 0) {
        finalTypes.push(pokeTypeParamList[0]);
        finalTypes.push(pokeTypeParamList[1]);
        finalTypes.push(pokeTypeParamList[2]);
    } else {
        finalTypes.push(pokeTypeParamList[0]);
        if (finalTypes[0].power > 300) {
            finalTypes.push(pokeTypeParamList[0]);
        }
        if (finalTypes[0].power > 500) {
            finalTypes.push(pokeTypeParamList[0]);
        }

        // deep clone to prevent bs
        const firstThreeTypes = pokeTypeParamList.slice(0, 3).map(obj => structuredClone(obj))
            .filter((x, index) => index < 3);
        const fillInTypes = getFillInTypes(firstThreeTypes);
        fillInTypes.sort(descendingSort("power"));

        // fill in rest of types until we hit 3 (or run out of types)
        let i = 0;
        while (finalTypes.length < 3) {
            finalTypes.push(fillInTypes[i]);
            i++;
        }
    }

    return { types: finalTypes, typeMods };
};

/**
 * Returns the calculated effects
 * @param {Array} skills Skills array [{ name, type, power }]
 * @param {Array} types Types array [{ name, type, power }]
 * @returns {Array} [{ name, type, level }]
 */
const getEffects = (skills, types) => {
    const effects = [];
    const MAX_FOOD_SKILL_NUM = 3;
    let pokeTypeCount = 0, skillNum = 0;

    for (let i = 0; i < skills.length; i++) {
        if (effects.length >= 3) {
            break;
        }
        const skill = skills[i];
        const pokeType = types[pokeTypeCount].type;
        const level = getFoodSkillLevel(types[pokeTypeCount].power);

        if (skill.power <= 0 || level === 0) {
            break;
        }

        for (let j = 0; j < MAX_FOOD_SKILL_NUM; j++) {
            if (skillNum === MAX_FOOD_SKILL_NUM) {
                break;
            }

            const foodSkill = effects[i];
            if (foodSkill) {
                continue;
            }

            // if skill is egg, type doesn't matter, so don't include it
            const type = skill.type === 1 ? "" : TYPES[pokeType];

            effects.push({
                name: ALIAS_TO_FULL[SKILLS[skill.type - 1]],
                type,
                level
            });

            pokeTypeCount++;
            skillNum++;
        }
    }

    return effects;
};

// the main function called to get the sandwich with it's effects
export const getSandwich = ingredients => {
    if (!ingredients) { return undefined; }

    // check to see if ingredients make an already existing recipe
    // if so, just return it
    const hasBread = ingredients.hasBread;
    const fillings = ingredients.fillings;
    const condiments = ingredients.condiments;

    const sandwich = {
        id: ingredients?.id,
        // number: "???",
        name: ingredients?.name ?? "Custom Sandwich",
        mine: ingredients?.mine,
        description: "A Tasty Coolio Original",
        fillings, condiments,
        hasBread,
        imageUrl: SANDWICHES[0].imageUrl
    };

    const foundSandwich = checkPresetSandwich(fillings, condiments);
    if (foundSandwich && hasBread) { // existing, preset recipes always use the top bread, otherwise it's a custom recipe
        const { stats, mods } = getPresetSandwichStatsAndMods(foundSandwich.number);

        return {
            ...sandwich,
            ...foundSandwich,
            hasBread: true,
            fillings, condiments,
            stats, mods
        };
    }

    const { tastes, deliciousness } = getTastesAndDeliciousness(ingredients);
    const { skills, skillMods } = getSkills(ingredients, tastes);
    const { types, typeMods } = getTypes(ingredients, deliciousness);
    const effects = getEffects(skills, types);

    sandwich.stars = deliciousness + 1;
    sandwich.effects = effects;
    sandwich.stats = {
        tastes, skills, types
    };
    sandwich.mods = {
        skills: skillMods,
        types: typeMods
    };
    // console.log("getSandwich", sandwich);
    return sandwich;
};
