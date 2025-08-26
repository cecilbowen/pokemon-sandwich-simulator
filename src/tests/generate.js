import FILLINGS from '../data/fillings.json';
import CONDIMENTS from '../data/condiments.json';
import { getSandwich } from '../helper/helper';
import { getRecipeFromIngredients, sandwichToRecipeResult } from '../util';
import POWERS from '../data/powers.json';
import POWERS_SHORT from '../data/powers-short.json';
import TYPES from '../data/types.json';
import SANDWICHES from '../data/sandwiches.json';
import C1 from '../data/community/encounter-2-and-shinies.json';
import C2 from '../data/community/raid-level-2.json';
import C3 from '../data/community/misc-missing.json';
import C4 from '../data/community/auto-gen-level-3.json';
// import BIG from '../gen/random_100000.json';
import { recipesToSandwichesLite, testsToSandwichesLite } from '../tests/tests';

const chance = percent => Math.random() * 100 < percent;
export const range = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateRandomSandwich = () => {
    const which = generateSandwiches(1, {
        "Bitter Herba Mystica": 2,
        "Spicy Herba Mystica": 2,
        "Salty Herba Mystica": 2,
        "Sour Herba Mystica": 2,
        "Sweet Herba Mystica": 2
    }, 1, 2)[0];

    return which;
};

// finds what power-type-level combos that still don't exist as recipes
// just one-line searches (eg, no multi-line power search)
export const findMissingSandwiches = fetching => {
    const testBocadillos = [...testsToSandwichesLite()];
    const community = [...recipesToSandwichesLite(
        [...C1, ...C2, ...C3, ...C4]
    )];

    const database = [
        ...SANDWICHES,
        ...testBocadillos,
        ...community
    ];

    /*
        {
            encounter:
                poison: {
                    1: true,
                    2: true,
                    3: true,
                    1-no-herba: true, // overkill
                    2-no-herba: false,
                    3-no-herba: false
                }
        }
    */
    const have = {};

    for (const power of POWERS) {
        have[power] = have[power] || {};
        const matchAnyType = power === "Egg Power";
        for (const type of TYPES) {
            have[power][type] = have[power][type] || {};
            for (let level = 1; level < 4; level++) {
                for (const sandwich of database) {
                    const target = sandwich.effects.filter(
                        x => x.name === power && (matchAnyType || x.type === type) && x.level === level
                    )[0];
                    have[power][type][level] = have[power][type][level] || Boolean(target);

                    const hasHerba = sandwich.condiments
                        .map(x => (x.name ?? x).toLowerCase()).join("").includes("herba");

                    if (target) {
                        have[power][type][`${level}-no-herba`] = have[power][type][`${level}-no-herba`] || !hasHerba;
                    } else {
                        have[power][type][`${level}-no-herba`] = have[power][type][`${level}-no-herba`] || false;
                    }
                }
            }
        }
    }

    let info = "";
    const candidates = [];
    for (const power of POWERS) {
        // const longPowerIndex = POWERS.indexOf(power);
        // const shortPower = POWERS_SHORT[longPowerIndex];
        for (const type of TYPES) {
            for (let level = 1; level < 4; level++) {
                if (!have[power][type][level]) {
                    info += `\n${power} ${type} Lv. ${level} - MISSING`;

                    // if (fetching) {
                    //     for (const s of BIG) {
                    //         const found = s.result.split("/")
                    //             .filter(x => x.includes(shortPower) && x.includes(type) && x.includes(level))[0];
                    //         if (found) {
                    //             candidates.push(s);
                    //             break;
                    //         }
                    //     }
                    // }
                }

                // always need herba for these, so no point checking
                if (power === "Sparkling Power" || power === "Title Power") {
                    continue;
                }

                if (!have[power][type][`${level}-no-herba`]) {
                    info += `\n${power} ${type} Lv. ${level} - MISSING (w/out Herba)`;
                }
            }
        }
    }

    console.log("have", database, have);
    console.log(info);
    console.log("replacement candidates", candidates);
};

export const generateSandwiches = (
    amount, ingredientLimits = {}, numOfPlayers = 1,
    herbaLimit = Infinity, dropChance = 25,
    mustUseFillings = [], mustUseCondiments = []
) => {
    const maxFillings = Math.max(1, 6 * numOfPlayers) - mustUseFillings.length;
    const maxCondiments = Math.max(1, 4 * numOfPlayers) - mustUseCondiments.length;

    // Sample with replacement, respecting per-ingredient limits
    const sampleWithReplacement = (pool, maxCount) => {
        const desired = Math.floor(Math.random() * maxCount) + 1; // 1..maxCount
        const result = [];

        if (maxCount === 0) { return result; }

        const counts = Object.create(null);
        let herbaCount = 0;

        // If every item is limited to 0 somehow, return empty
        const anyAllowed = pool.some(item => (ingredientLimits[item] ?? Infinity) > 0);
        if (!anyAllowed) { return result; }

        let guard = 0;
        const guardMax = desired * 20; // generous guard to avoid infinite loops

        while (result.length < desired && guard < guardMax) {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            const limit = ingredientLimits[pick.name] ?? Infinity;
            const used = counts[pick.name] ?? 0;

            if (used < limit && herbaCount < herbaLimit) {
                const res = {
                    ...pick,
                };
                if (res.pieces && chance(dropChance)) { // drop pieces from ingredients at x% chance
                    const dropAmount = range(1, res.pieces);
                    res.pieces -= dropAmount;
                }
                result.push(res);
                counts[res.name] = used + 1;
                if (res.name.includes("Herba")) { herbaCount++; }
            }
            guard++;
        }

        // If we couldn't reach desired due to tight limits, just return what we got.
        return result;
    };

    // String key that normalizes order and multiplicity
    const makeKey = (fillings, condiments) => {
        const f = [...fillings].sort(); // sorting arrays preserves multiset identity
        const c = [...condiments].sort();
        return JSON.stringify({ f, c });
    };

    const uniques = new Set();
    const out = [];
    const hardAttemptCap = Math.max(50, amount * 20); // safety

    let attempts = 0;
    while (out.length < amount && attempts < hardAttemptCap) {
        const fillings = sampleWithReplacement(FILLINGS, maxFillings);
        const condiments = sampleWithReplacement(CONDIMENTS, maxCondiments);

        // add in must use ingredients

        for (const f of mustUseFillings) {
            const ing = FILLINGS.filter(x => x.name === (f.name ?? f))[0];
            const pieces = f.pieces ?? ing.pieces;
            fillings.push({ ...ing, pieces });
        }

        for (const c of mustUseCondiments) {
            const ing = CONDIMENTS.filter(x => x.name === (c.name ?? c))[0];
            condiments.push({ ...ing });
        }

        // Ensure at least 1 of each category as requested
        if (fillings.length === 0 || condiments.length === 0) {
            attempts++;
            continue;
        }

        const key = makeKey(fillings, condiments);
        if (!uniques.has(key)) {
            uniques.add(key);
            out.push({ fillings, condiments, hasBread: true });
        }
        attempts++;
    }

    const comboList = out;

    const finalRecipes = [];
    const finalSandwiches = [];
    for (const sandwich of comboList) {
        const another = getSandwich(sandwich);
        const recipe = getRecipeFromIngredients({ fillings: sandwich.fillings, condiments: sandwich.condiments, hasBread: true });
        const result = sandwichToRecipeResult(another);
        finalSandwiches.push(another);
        finalRecipes.push({ recipe, result });
    }

    // console.log("GENERATED SANDWICHES", finalSandwiches, finalRecipes);
    return finalSandwiches;
};
