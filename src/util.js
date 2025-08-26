import SANDWICHES from './data/sandwiches.json';
import FILLINGS from './data/fillings.json';
import FILLINGS_MAP from "./data/fillings-map.json";
import CONDIMENTS_MAP from "./data/condiments-map.json";
import CONDIMENTS from './data/condiments.json';
import FLAVORS from './data/flavors.json';
import POWERS from './data/powers.json';
import TYPES from './data/types.json';
import TASTE_POWERS from "./helper/taste-powers.json";
import TASTE_MAP from "./helper/taste-map.json";
import DELICIOUSNESS_POKETYPE_POINTS from "./helper/deliciousness-poketype-points.json";
import POWERS_SHORT from "./data/powers-short.json";
import INGREDIENT_TO_ID from "./data/ingredient-to-id.json";

import ENGLISH from './language/strings.json';
import SPANISH from './language/strings-es.json';
import GERMAN from './language/strings-de.json';
import JAPANESE from './language/strings-ja.json';
import SIMPLIFIED_CHINESE from './language/strings-zh-CN.json';
import TRADITIONAL_CHINESE from './language/strings-zh-TW.json';
import FRENCH from './language/strings-fr.json';
import ITALIAN from './language/strings-it.json';
import KOREAN from './language/strings-ko.json';
import { LANGUAGE, snackActionsTL } from './App';
import { descendingSort, getHerbaCount, indexToPrime } from './helper/helper';
import { range } from './tests/generate';

export const oneTwoFirst = [
  "31",
  "35",
  "51",
  "55",
  "59",
  "63",
  "67",
  "71",
  "75",
  "79",
  "103",
  "111",
  "119",
  "123",
  "131",
  "139",
  "143",
  "147",
  "151"
];

export const FLAVOR_TABLE = {
  Sweet: {
    Salty: "Egg",
    Sour: "Catch",
    Bitter: "Egg",
    Hot: "Raid",
  },
  Salty: {
    Sweet: "Encounter",
    Sour: "Encounter",
    Bitter: "Exp",
    Hot: "Encounter",
  },
  Sour: {
    Sweet: "Catch",
    Salty: "Teensy",
    Bitter: "Teensy",
    Hot: "Teensy",
  },
  Bitter: {
    Sweet: "Item",
    Salty: "Exp",
    Sour: "Item",
    Hot: "Item",
  },
  Hot: {
    Sweet: "Raid",
    Salty: "Humungo",
    Sour: "Humungo",
    Bitter: "Humungo",
  },
};

export const FLAVOR_TABLE_EZ = {
  Egg: "sweet-salty/bitter",
  Catch: "sweet/sour",
  Raid: "sweet/hot",
  Encounter: "salty-sweet/sour/hot",
  Exp: "salty/bitter",
  Teensy: "sour-salty/bitter/hot",
  Item: "bitter-sweet/sour/hot",
  Humungo: "hot-salty/sour/bitter",
};

export const ALIAS_TO_FULL = { // power alias
  Egg: "Egg Power",
  Catch: "Catching Power",
  Item: "Item Drop Power",
  Humungo: "Humungo Power",
  Teensy: "Teensy Power",
  Raid: "Raid Power",
  Encounter: "Encounter Power",
  Exp: "Exp. Point Power",
  Title: "Title Power",
  Sparkling: "Sparkling Power",
};

export const FULL_TO_ALIAS = { // power alias
  "Egg Power": "Egg",
  "Catching Power": "Catch",
  "Item Drop Power": "Item",
  "Humungo Power": "Humungo",
  "Teensy Power": "Teensy",
  "Raid Power": "Raid",
  "Encounter Power": "Encounter",
  "Exp. Point Power": "Exp",
  "Title Power": "Title",
  "Sparkling Power": "Sparkling",
};

export const COLORS = {
  // flavors (5)
  "Salty": "#e0ded4",
  "Sweet": "#f79bcd",
  "Hot": "rgba(200, 61, 18, 0.77)",
  "Bitter": "rgb(166, 200, 72)",
  "Sour": "#dbc60f",
  // powers (10)
  "Egg": "tan",
  "Catch": "lightblue",
  "Item": "lightgreen",
  "Humungo": "lightgray",
  "Teensy": "#06b3b3",
  "Raid": "violet",
  "Encounter": "#dfdf50",
  "Exp": "tomato",
  "Title": "sandybrown",
  "Shiny": "cyan",
  "Sparkling": "cyan",
  "None": "transparent",
  // types (18)
  "Normal": '#A8A77A',
  "Fire": '#EE8130',
  "Water": '#6390F0',
  "Electric": '#F7D02C',
  "Grass": '#7AC74C',
  "Ice": '#96D9D6',
  "Fighting": 'rgba(194, 46, 40, 0.73)', // '#C22E28',
  "Poison": 'rgba(163, 62, 161, 0.81)', // '#A33EA1',
  "Ground": '#E2BF65',
  "Flying": '#A98FF3',
  "Psychic": '#F95587',
  "Bug": '#A6B91A',
  "Rock": '#B6A136',
  "Ghost": 'rgba(115, 87, 151, 0.71)', // '#735797',
  "Dragon": 'rgba(118, 73, 225, 0.83)', // '#6F35FC',
  "Dark": 'rgba(112, 87, 70, 0.88)', // '#705746',
  "Steel": '#B7B7CE',
  "Fairy": '#D685AD',
  "All Types": 'aquamarine',
  "All Other Types": 'aquamarine',
};

export const LANGUAGE_STRINGS = {
  'en': ENGLISH,
  'es': SPANISH,
  'de': GERMAN,
  'ja': JAPANESE,
  'zh-CN': SIMPLIFIED_CHINESE,
  'zh-TW': TRADITIONAL_CHINESE,
  'fr': FRENCH,
  'it': ITALIAN,
  'ko': KOREAN
  // 'ru': RUSSIAN,
  // 'sv': SWEDISH
};

export const LANGUAGE_NAMES = {
  'en': 'English',
  'es': 'Español',
  'de': 'Deutsch',
  'ja': '日本',
  'zh-CN': '简中',
  'zh-TW': '繁中',
  'fr': 'Français',
  'it': 'Italiano',
  'ko': '한국어'
  // 'ru': 'Pусский',
  // 'sv': 'Svenska'
};

export const fillToThree = start => Array.from({ length: 3 - start + 1 }, (_, i) => start + i);

export const getLoopedElement = (arr, num) => arr[num % arr.length];

export const ts = text => {
  text = (text || "dammerung").toLowerCase();
  const preStrings = LANGUAGE_STRINGS[LANGUAGE] || {};
  const strings = {};
  for (const [k, v] of Object.entries(preStrings)) {
    strings[k.toLowerCase()] = v;
  }
  return strings[text] || "???";
};

export const getNumberOfPlayers = ingredients => {
  return Math.max(1, Math.ceil(ingredients.fillings.length / 6), Math.ceil(ingredients.condiments.length / 4));
};

export const getImage = name => {
  return `${process.env.PUBLIC_URL}/images/${name}`;
};

export const getIngredientImage = name => {
  return `${process.env.PUBLIC_URL}/images/ingredients/${name.toLowerCase().replaceAll(" ", "")}.png`;
};

export const getPowerImage = shortName => {
  return `${process.env.PUBLIC_URL}/images/powers/${shortName.toLowerCase()}.png`;
};

export const getFillings = strArr => {
  const ret = [];
  for (const str of strArr) {
    const filli = str?.name ?? str;
    const filling = [...FILLINGS].filter(x => x.name === filli)[0];
    if (filling) {
      const newPieces = str?.pieces ?? filling.pieces;
      ret.push({ ...filling, pieces: newPieces });
    }
  }

  return ret;
};

export const getCondiments = strArr => {
  const ret = [];
  for (const str of strArr) {
    const condi = str?.name ?? str;
    const condiment = [...CONDIMENTS].filter(x => x.name === condi)[0];
    if (condiment) {
      ret.push({ ...condiment });
    }
  }

  return ret;
};

export const getPresetSandwichStatsAndMods = number => {
  const stats = {
    tastes: {}, skills: {}, types: {}
  };
  const mods = {
    skills: {}, types: {}
  };

  const preset = SANDWICHES.filter(x => x.number === number)[0];

  if (!preset) {
    return { stats, mods };
  }

  // fillings sums
  for (const fillingName of preset.fillings) {
    const filling = FILLINGS_MAP[fillingName];
    const pieces = filling.pieces;
    for (const [attr, value] of Object.entries(filling)) {
      let cat = "tastes";
      if (isPower(attr)) {
        cat = "skills";
      } else if (isType(attr)) {
        cat = "types";
      } else if (!isFlavor(attr)) {
        continue;
      }

      stats[cat][attr] = (stats[cat][attr] || 0) + value * pieces;
    }
  }

  // condiments sums
  for (const condimentName of preset.condiments) {
    const condiment = CONDIMENTS_MAP[condimentName];
    for (const [attr, value] of Object.entries(condiment)) {
      let cat = "tastes";
      if (isPower(attr)) {
        cat = "skills";
      } else if (isType(attr)) {
        cat = "types";
      } else if (!isFlavor(attr)) {
        continue;
      }

      stats[cat][attr] = (stats[cat][attr] || 0) + value;
    }
  }

  // herba power mods
  const herbaCount = getHerbaCount(preset.condiments.map(x => {
    return {
      name: x
    };
  }));

  if (herbaCount >= 1) {
    stats.skills.Title = (stats.skills.Title || 0) + 10000;
    mods.skills.Title = (mods.skills.Title || 0) + 10000;
  }
  if (herbaCount >= 2) {
    stats.skills.Sparkling = (stats.skills.Sparkling || 0) + 20000;
    mods.skills.Title = (mods.skills.Title || 0) + 10000;
  }

  // flavor matchup power mods
  const tastes = [];
  for (const [k, points] of Object.entries(stats.tastes)) {
    tastes.push({
      name: k,
      type: TASTE_MAP[k],
      point: points
    });
  }
  tastes.sort(descendingSort("point"));

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
      const sk = POWERS_SHORT[item.skillType - 1];
      stats.skills[sk] = (stats.skills[sk] || 0) + item.power;
      mods.skills[sk] = (mods.skills[sk] || 0) + item.power;
      break;
    }
  }

  // star level boost type mods
  for (const type of TYPES) {
    stats.types[type] = (stats.types[type] || 0) + DELICIOUSNESS_POKETYPE_POINTS[2];
    mods.types[type] = (mods.types[type] || 0) + DELICIOUSNESS_POKETYPE_POINTS[2];
  }

  const tasteList = [];
  for (const [k, v] of Object.entries(stats.tastes)) {
    tasteList.push({
      name: k,
      // type
      point: v
    });
  }

  const skillList = [];
  for (const [k, v] of Object.entries(stats.skills)) {
    skillList.push({
      name: k,
      // type
      power: v
    });
  }

  const typeList = [];
  for (const [k, v] of Object.entries(stats.types)) {
    typeList.push({
      name: k,
      // type
      power: v
    });
  }

  const newStats = {
    tastes: tasteList, skills: skillList, types: typeList
  };

  return {
    mods,
    stats: newStats
  };
};

export const getIngredientsFromRecipe = recipe => {
  if (recipe && recipe.length > 0) {
    const fillings = [];
    let condiments = [];
    const spl = recipe.split("_");
    if (spl.length !== 2 && spl.length !== 3) { return; } // should probably regex check string but whatever

    let hasBread = false;
    let fillingIndex = 0;
    if (spl.length === 3) {
      fillingIndex = 1;
      hasBread = true; // we don't actually check the bread string, it's enough to just have 3 _ sections
    }

    const fillingStr = spl[fillingIndex];
    const condimentStr = spl[fillingIndex + 1];

    const idToIngredient = Object.fromEntries(
      Object.entries(INGREDIENT_TO_ID).map(([key, value]) => [value, key])
    );

    const fNames = fillingStr.split(",");
    const isNumFormat = !isNaN(parseInt(fNames[0], 10));
    const cNames = isNumFormat ? condimentStr.split(",").map(x => idToIngredient[x]) : condimentStr.split(",");

    for (const str of fNames) {
      let name = str.split("-")[0];
      if (isNumFormat) {
        name = idToIngredient[name];
      }

      let pieces = str.split("-")[1];
      if (pieces) { pieces = parseInt(pieces, 10); }

      // support old egg name saved recipes
      if (name === "Egg") {
        name = "Sliced Egg";
      }

      const filling = FILLINGS.filter(x => x.name === name)[0];
      if (filling) {
        fillings.push({ ...filling, pieces });
      }
    }

    condiments = getCondiments(cNames);

    return { fillings, condiments, hasBread };
  }

  return undefined;
};

export const getRecipeFromIngredients = (ingredients, numFormat = false) => {
  const condiments = ingredients.condiments;
  const fillings = ingredients.fillings;
  const hasBread = ingredients.hasBread;
  if (condiments.length === 0) { return undefined; }

  const fArr = [];
  for (const f of fillings) {
    const identifier = numFormat ? INGREDIENT_TO_ID[f.name] : f.name;
    fArr.push(`${identifier}-${f.pieces}`);
  }

  return `${hasBread ? "Bread_" : ""}${fArr.join(",")}_${condiments.map(x => {
    return numFormat ? INGREDIENT_TO_ID[x.name] : x.name;
  }).join(",")
    }`;
};

export const sandwichToRecipeResult = sandwich => {
  if (!sandwich?.effects) { return ""; }

  // sandwich has { effects: { name, type, level} }
  return sandwich.effects.map(x => {
    const longPower = x.name;
    const longPowerIndex = POWERS.indexOf(longPower);
    const shortPower = POWERS_SHORT[longPowerIndex];
    let type = x.type;
    if (shortPower === "Egg") { type = ""; }

    return `${shortPower},${type},${x.level}`;
  }).join("/");
};

export const sandwichRecipeResultToEffects = result => {
  const lines = result.split("/");
  const effects = [];
  for (const line of lines) {
    const lineSplit = line.split(",");
    const powerShort = lineSplit[0];
    const type = lineSplit[1];
    const level = parseInt(lineSplit[2], 10);
    const powerShortIndex = POWERS_SHORT.indexOf(powerShort);
    const powerLong = POWERS[powerShortIndex];
    effects.push({
      name: powerLong, type, level
    });
  }

  return effects;
};

export const getIngredientsSums = stats => {
  return {
    tastes: stats.tastes.filter(x => x.point !== 0).map(x => {
      return {
        flavor: x.name,
        amount: x.point
      };
    }),
    powers: stats.skills.filter(x => x.power !== 0).map(x => {
      return {
        type: x.name,
        amount: x.power,
      };
    }),
    types: stats.types.filter(x => x.power !== 0).map(x => {
      return {
        type: x.name,
        amount: x.power,
      };
    })
  };
};

export const checkPresetSandwich = (sums, fillings, condiments) => {
  const ingredients = [
    ...fillings.sort((a, b) => a.name.localeCompare(b.name)),
    ...condiments.sort((a, b) => a.name.localeCompare(b.name))
  ];

  // check if sums make it a preset sandwich
  let foundSandwich;
  for (const sandwich of SANDWICHES) {
    const sandwichIngredients = [...sandwich.fillings, ...sandwich.condiments];
    if (areEqual(ingredients.map(x => x.name), sandwichIngredients) &&
      areEqual(fillings.map(x => x.pieces), getFillings(sandwich.fillings).map(x => x.pieces))) {
      foundSandwich = sandwich;
      break;
    }
  }

  // if it is a preset sandwich, throw out all the sums and just copy the preset sandwich
  if (foundSandwich) {
    foundSandwich.pass = true;
    const tempPowers = sums.powers.slice(0).sort((a, b) => {
      const aType = ALIAS_TO_FULL[a.type];
      const bType = ALIAS_TO_FULL[b.type];
      return b.amount - a.amount || POWERS.indexOf(aType) - POWERS.indexOf(bType);
    }).filter(x => x.type !== "Sparkling");
    for (let i = 0; i < 3; i++) {
      const effect = foundSandwich.effects[i];
      const resultEffect = tempPowers[i];
      if (effect && resultEffect) {
        if (effect.name.indexOf(resultEffect.type) === -1) {
          foundSandwich.pass = false;
          break;
        }
      }
    }
  }

  return foundSandwich;
};

export const hasRelevance = (ingredient, key) => {
  if (!ingredient) { return false; }
  const flavor = key.flavor;
  const power = key.power;
  const type = key.type;
  const all = [...ingredient.tastes, ...ingredient.powers, ...ingredient.types].map(x => x.flavor || x.type);
  const hasFlavor = !flavor || all.indexOf(flavor) !== -1;
  const hasPower = !power || all.indexOf(power) !== -1;
  const hasType = !type || all.indexOf(type) !== -1;

  return hasFlavor && hasPower && hasType;
};

export const getKeyType = key => {
  if (isFlavor(key)) {
    return "flavor";
  } else if (isPower(key)) {
    return "power";
  } else if (isType(key)) {
    return "type";
  }

  return undefined;
};

export const isFilling = obj => {
  if (!obj) { return false; }
  return FILLINGS.filter(x => x.name === obj.name)[0] !== undefined;
};

export const isFlavor = obj => {
  const str = obj?.flavor || obj;
  return FLAVORS.indexOf(str) !== -1;
};

export const isPower = obj => {
  const str = obj?.type || obj;

  for (const power of POWERS) {
    if (power.indexOf(str) !== -1) {
      return true;
    }
  }

  return false;
};

export const isType = obj => {
  const str = obj?.type || obj;
  return TYPES.indexOf(str) !== -1;
};

export const getCategory = obj => {
  const str = obj || "dammerung";
  if (isFlavor(str)) {
    return "flavor";
  }

  if (isPower(str)) {
    return "power";
  }

  if (isType(str)) {
    return "type";
  }

  return "unknown";
};

// check if two arrays contain the same elements
export const areEqual = (array1, array2) => {
  if (array1.length === array2.length) {
    const diff = array1.filter(x => !array2.includes(x) || array2.filter(y => y === x)
      .length !== array1.filter(y => y === x).length);
    return diff.length === 0;
  }

  return false;
};

export const calculatePowerAmount = (base, ingredient) => {
  let newAmount = base;
  const isCondiment = !isFilling(ingredient);

  if (!isCondiment/* && !isType(power)*/) {
    newAmount *= ingredient.pieces;
  }

  return newAmount;
};

export const mode = (array, prop, skipMax = false, useMin = false) => {
  const max = Math.max(...array.map(o => o[prop]));
  const min = Math.min(...array.map(o => o[prop]));
  if (skipMax) {
    array = array.filter(x => x[prop] !== max);
  }
  if (useMin) {
    array = array.filter(x => x[prop] === min);
  }
  if (array.length === 0) { return null; }
  const modeMap = {};
  let maxEl = array[0][prop], maxCount = 1;
  for (let i = 0; i < array.length; i++) {
    const el = array[i][prop];
    if (modeMap[el] === null) {
      modeMap[el] = 1;
    } else {
      modeMap[el]++;
    }

    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }

  return maxEl;
};

export const getDefaultPieces = ingredientName => {
  const baseIng = FILLINGS_MAP[ingredientName];
  return baseIng?.pieces ?? 1;
};

export const copySandwich = (sandwich, fillings, condiments, hasBread) => {
  /*
  Custom Sandwich ⭐⭐⭐
  Ingredients:
  Top baguette is on the sandwich
  2x chorizo, 2x rice (drop 2), 1x ketchup, 2x mustard

  Effects:
  Encounter Power: Poison - Level 1
  Exp. Point Power: Bug - Level 1
  Raid Power: Normal - Level 1
  */

  const piecesMap = {};
  for (const ing of [...fillings, ...condiments]) {
    const baseIng = FILLINGS_MAP[ing.name] || CONDIMENTS_MAP[ing.name];
    const basePieces = baseIng.pieces ?? 1;
    const ingPieces = ing.pieces ?? 1;

    piecesMap[ing.name] = piecesMap[ing.name] || {
      pieces: 0, number: 0, dropped: 0
    };

    piecesMap[ing.name].pieces += ingPieces;
    piecesMap[ing.name].number++;
    piecesMap[ing.name].dropped = piecesMap[ing.name].number * basePieces - piecesMap[ing.name].pieces;
  }

  let number = sandwich.number;
  const isCustomSandwich = number === undefined;
  number = isCustomSandwich ? "" : `#${number} `;

  const name = `${isCustomSandwich ? ts("Custom Sandwich") : sandwich.name}`;
  const nameLine = `${number}${name} ${'⭐'.repeat(sandwich.stars)}`;

  const ings = [];
  for (const [ing, data] of Object.entries(piecesMap)) {
    const dropStr = data.dropped > 0 ? ` (${ts("drop")} ${data.dropped})` : "";
    ings.push(`${data.number}x ${ts(ing)}${dropStr}`);
  }
  const ingLine = `${ts("Ingredients")}:\n${hasBread ? ts("Bread-On") : ts("Bread-Off")}\n${ings.join(", ")}`;
  const effects = [];
  for (const effect of sandwich.effects) {
    const typeStr = effect.name === "Egg Power" ? "" : `${ts(effect.type)} - `;
    effects.push(`${ts(effect.name)}: ${typeStr}${ts("Lv.")} ${effect.level}`);
  }
  const effectLines = effects.join("\n");

  const results = `${nameLine}\n\n${ingLine}\n\n${ts("Effects")}:\n${effectLines}`;
  copyTextToClipboard(results, () => {
    window.snackbar.createSnackbar(ts("Copied sandwich to clipboard!"), {
      timeout: 3000, actions: snackActionsTL("Dismiss")
    });
  });
};

export const copyTextToClipboard = (text, postFunc) => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    console.log('Async: Copying to clipboard was successful!');
    if (postFunc) {
      postFunc();
    }
  }, err => {
    console.error('Async: Could not copy text: ', err);
  });
};

const fallbackCopyTextToClipboard = text => {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    console.log(`Fallback: Copying text command was ${msg}`);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
};

const standardizeColor = str => {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = str;
  return ctx.fillStyle;
};

// Version 4.0
export const shadeColor = (color, percent = 30) => {
  color = isNaN(color) ? standardizeColor(color) : color;

  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt(R * (100 + percent) / 100, 10);
  G = parseInt(G * (100 + percent) / 100, 10);
  B = parseInt(B * (100 + percent) / 100, 10);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  const RR = R.toString(16).length === 1 ? `0${R.toString(16)}` : R.toString(16);
  const GG = G.toString(16).length === 1 ? `0${G.toString(16)}` : G.toString(16);
  const BB = B.toString(16).length === 1 ? `0${B.toString(16)}` : B.toString(16);

  return `#${RR}${GG}${BB}`;
};

export const generateRandomName = () => {
  // cvc(x..x)c
  const min = 5;
  const max = 8;
  let name = "";
  const vowels = "aeiou";
  const consonants = "bcdfghjklmnpqrstvwxyz";

  let add = 0;
  const length = range(min, max);

  for (let i = 0; i < length; i++) {
    let v = true; // true for vowel, false for consonant
    if (i === 0 || i === 2 || i === length - 1) {
      v = false;
    }

    if (v) {
      add = vowels[range(0, vowels.length - 1)];
    } else {
      add = consonants[range(0, consonants.length - 1)];
    }

    if (i === 0) {
      add = add.toUpperCase();
    }

    name += add;
  }

  return name;
};