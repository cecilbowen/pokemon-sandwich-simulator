import SANDWICHES from './data/sandwiches.json';
import FILLINGS from './data/fillings.json';
import CONDIMENTS from './data/condiments.json';
import FLAVORS from './data/flavors.json';
import POWERS from './data/powers.json';
import TYPES from './data/types.json';

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
  "Sweet": {
    "Salty": "Egg",
    "Sour": "Catch",
    "Bitter": "Egg",
    "Hot": "Raid",
  },
  "Salty": {
    "Sweet": "Encounter",
    "Sour": "Encounter",
    "Bitter": "Exp",
    "Hot": "Encounter",
  },
  "Sour": {
    "Sweet": "Catch",
    "Salty": "Teensy",
    "Bitter": "Teensy",
    "Hot": "Teensy",
  },
  "Bitter": {
    "Sweet": "Item",
    "Salty": "Exp",
    "Sour": "Item",
    "Hot": "Item",
  },
  "Hot": {
    "Sweet": "Raid",
    "Salty": "Humungo",
    "Sour": "Humungo",
    "Bitter": "Humungo",
  },
};

export const FLAVOR_PRIORITY_TABLE = {
  "Sweet": {
    "Salty": "Sweet",
    "Sour": "Sweet",
    "Bitter": "Sweet",
    "Hot": "Sweet",
  },
  "Salty": {
    "Sweet": "Sweet",
    "Sour": "Salty",
    "Bitter": "Salty",
    "Hot": "Salty",
  },
  "Sour": {
    "Sweet": "Sweet",
    "Salty": "Salty",
    "Bitter": "Sour",
    "Hot": "Sour",
  },
  "Bitter": {
    "Sweet": "Sweet",
    "Salty": "Salty",
    "Sour": "Sour",
    "Hot": "Bitter",
  },
  "Hot": {
    "Sweet": "Sweet",
    "Salty": "Salty",
    "Sour": "Sour",
    "Bitter": "Bitter",
  },
};

export const ALIAS_TO_FULL = { // power alias
  "Egg": "Egg Power",
  "Catch": "Catching Power",
  "Item": "Item Drop Power",
  "Humungo": "Humungo Power",
  "Teensy": "Teensy Power",
  "Raid": "Raid Power",
  "Encounter": "Encounter Power",
  "Exp": "Exp. Point Power",
  "Title": "Title Power",
  "Sparkling": "Sparkling Power",
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
  // types (18)
	"Normal": '#A8A77A',
	"Fire": '#EE8130',
	"Water": '#6390F0',
	"Electric": '#F7D02C',
	"Grass": '#7AC74C',
	"Ice": '#96D9D6',
	"Fighting": 'rgba(194, 46, 40, 0.73)', //'#C22E28',
	"Poison": 'rgba(163, 62, 161, 0.81)', //'#A33EA1',
	"Ground": '#E2BF65',
	"Flying": '#A98FF3',
	"Psychic": '#F95587',
	"Bug": '#A6B91A',
	"Rock": '#B6A136',
	"Ghost": 'rgba(115, 87, 151, 0.71)', //'#735797',
	"Dragon": 'rgba(118, 73, 225, 0.83)', //'#6F35FC',
	"Dark": 'rgba(112, 87, 70, 0.88)', //'#705746',
	"Steel": '#B7B7CE',
	"Fairy": '#D685AD',
  "All Types": 'aquamarine',
  "All Other Types": 'aquamarine',
};

export const TYPE_EXCEPTIONS = {
  "39": ["Flying", "Poison", "Fighting"], // I'm convinced this is a game bug and it's only counting the flavors on apple once
};

export const getFillings = strArr => {
  const ret = [];
  for (const str of strArr) {
    const filling = FILLINGS.filter(x => x.name === str)[0];
    if (filling) {
      ret.push({ ...filling });
    }
  }

  return ret;
};

export const getCondiments = strArr => {
  const ret = [];
  for (const str of strArr) {
    const condiment = CONDIMENTS.filter(x => x.name === str)[0];
    if (condiment) {
      ret.push({ ...condiment });
    }
  }

  return ret;
};

export const getIngredientsFromRecipe = recipe => {
  if (recipe && recipe.length > 0) {
    const fillings = [];
    let condiments = [];
    const spl = recipe.split("_");
    if (spl.length !== 2) { return; } // should probably regex check string but whatever
    const fillingStr = spl[0];
    const condimentStr = spl[1];
    
    const fNames = fillingStr.split(",");
    const cNames = condimentStr.split(",");

    for (const str of fNames) {
      const name = str.split("-")[0];
      let pieces = str.split("-")[1];
      if (pieces) { pieces = parseInt(pieces); }
      const filling = FILLINGS.filter(x => x.name === name)[0];
      if (filling) {
        fillings.push({ ...filling, pieces });
      }
    }

    condiments = getCondiments(cNames);

    return { fillings, condiments };
  }

  return undefined;
};

// returns max amount of pieces on sandwich if none fall off
const getMaxTotalPieces = fillings => {
  let ret = 0;

  for (const f of fillings) {
    const baseFilling = FILLINGS.filter(x => x.name === f.name)[0];
    ret += baseFilling.pieces;
  }

  return ret;
};

const getPiecesDropped = obj => {
  if (obj.pieces === undefined) { return 0; } // not a filling
  const name = obj.name;
  const basePieces = FILLINGS.filter(x => x.name === name)[0].pieces;
  return basePieces - obj.pieces;
};

export const getIngredientsSums = (fillings, condiments) => {
  const ingredients = [
    ...fillings.sort((a, b) => a.name.localeCompare(b.name)),
    ...condiments.sort((a, b) => a.name.localeCompare(b.name))
  ];

  const sums = {
    tastes: [],
    powers: [],
    types: [],
    dropped: 0,
    overflow: 0
  };

  const tempFillingPieces = {};

  for (const food of ingredients) {
    if (food.pieces) {
      const existingPieces = tempFillingPieces[food.name] || 0;
      tempFillingPieces[food.name] = existingPieces + food.pieces;
    }

    for (const taste of food.tastes) {
      const hasEntry = sums.tastes.filter(x => x.flavor === taste.flavor)[0];
      let amount = 0; // existing amount
      if (hasEntry) {
        amount = hasEntry.amount;
        sums.tastes = sums.tastes.filter(x => x.flavor !== taste.flavor);
      }

      sums.tastes.push({
        flavor: taste.flavor,
        amount: amount + calculatePowerAmount(taste.amount, food, taste),
      });
    }

    for (const power of food.powers) {
      const hasEntry = sums.powers.filter(x => x.type === power.type)[0];
      let amount = 0; // existing amount
      if (hasEntry) {
        amount = hasEntry.amount;
        sums.powers = sums.powers.filter(x => x.type !== power.type);
      }

      sums.powers.push({
        type: power.type,
        amount: amount + calculatePowerAmount(power.amount, food, power),
      });
    }

    for (const type of food.types) {
      const hasEntry = sums.types.filter(x => x.type === type.type)[0];
      let amount = 0; // existing amount
      if (hasEntry) {
        amount = hasEntry.amount;
        sums.types = sums.types.filter(x => x.type !== type.type);
      }

      sums.types.push({
        type: type.type,
        amount: amount + calculatePowerAmount(type.amount, food, type),
      });
    }

    sums.dropped += getPiecesDropped(food);
  }

  // remove zero types
  const trimmedTypes = [];
  for (const tt of sums.types) {
    if (tt.amount > 0) {
      trimmedTypes.push(tt);
    }
  }
  sums.types = trimmedTypes;

  for (const pieces of Object.values(tempFillingPieces)) {
    if (pieces > 12) {
      sums.overflow = Math.max(sums.overflow - 12, pieces - 12);
    }
  }

  sums.tastes.sort((a, b) => {
    return b.amount - a.amount || FLAVORS.indexOf(a.flavor) - FLAVORS.indexOf(b.flavor);
  });
  sums.powers.sort((a, b) => {
    const aType = ALIAS_TO_FULL[a.type];
    const bType = ALIAS_TO_FULL[b.type];
    return b.amount - a.amount || POWERS.indexOf(aType) - POWERS.indexOf(bType);
  });
  sums.types.sort((a, b) => {
    return b.amount - a.amount || TYPES.indexOf(a.type) - TYPES.indexOf(b.type);
  });

  if (sums.tastes.length === 1) {
    sums.tastes.push({
      flavor: FLAVORS.filter(x => x !== sums.tastes[0].flavor)[0],
      amount: 0,
    });
  }
  if (sums.tastes.length > 1) {
    // at least 2 flavors exist, so check table..
    const flavor1 = sums.tastes[0].flavor;
    const flavor2 = sums.tastes[1].flavor;
    const statBoost = FLAVOR_TABLE[flavor1][flavor2];
    const varName = statBoost;
    const existingStat = sums.powers.filter(x => x.type === varName)[0];
    if (!existingStat) {
      sums.powers.push({
        type: varName,
        amount: 100,
        modded: true,
        boosted: true, // boosted 'from zero' stats don't count in determining level
      });
    } else {
      existingStat.amount += 100;
      existingStat.modded = true;
    }
    sums.powers.sort((a, b) => {
      const aType = ALIAS_TO_FULL[a.type];
      const bType = ALIAS_TO_FULL[b.type];
      return b.amount - a.amount || POWERS.indexOf(aType) - POWERS.indexOf(bType);
    });
  }

  return sums;
};

// returns array of levels
const calculateLevels = (effects, sandwich) => {
  const types = effects;
  const defaultType = { type: TYPES[0], amount: 0 };
  const firstType = types[0] || defaultType;
  const secondType = types[1] || defaultType;
  const thirdType = types[2] || defaultType;
  const stars = sandwich.stars;

  let levels = [1, 1, 1];

  if (stars > 1) {
    // regular
    if (firstType.amount < 180) {
      levels = [1, 1, 1];
    } else if (firstType.amount >= 180 && firstType.amount <= 280) {
      if (secondType.amount >= 180 && thirdType.amount >= 180) {
        levels = [2, 2, 1];
      } else {
        levels = [2, 1, 1];
      }
    } else if (firstType.amount > 280 && firstType.amount < 380) {
      if (thirdType.amount < 180 ) {
        levels = [2, 2, 1];
      } else {
        levels = [2, 2, 2];
      }
    } else if (firstType.amount >= 380 && firstType.amount < 460) {
      if (secondType.amount >= 380 && thirdType.amount >= 380) {
        levels = [3, 3, 3];
      } else {
        levels = [3, 3, 2];
      }
    } else if (firstType.amount >= 460) {
      levels = [3, 3, 3];
    }
  } else {
    // 1 star
    const firstAmount = firstType.amount;
    const secondAmount = secondType.amount;
    const thirdAmount = thirdType.amount;
    if (firstType.amount <= 680) {
      levels = [1, 1, 1];
    } else if (firstAmount > 700 && firstAmount < 780) {
      if (secondAmount > 700 && thirdAmount > 700) {
        levels = [2, 2, 2];
      } else {
        levels = [2, 2, 1];
      }
    } else if (firstAmount >= 780 && firstAmount <= 880) {
      if (thirdAmount < 700 ) {
        levels = [2, 2, 1];
      } else {
        levels = [2, 2, 2];
      }
    } else if (firstAmount > 880 && firstAmount < 960) {
      if (secondAmount > 880 && thirdAmount > 880) {
        levels = [3, 3, 3];
      } else {
        levels = [3, 3, 2];
      }
    } else if (firstAmount >= 960) {
      levels = [3, 3, 3];
    }
  }

  return levels;
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

export const craftSandwich = (fillings, condiments, sums, presetSandwich) => {
  if (sums.tastes.length === 0
    || sums.powers.length === 0
    || sums.types.length === 0
    || fillings.length === 0
    || condiments.length === 0) {
    return;
  }

  // get sandwich star level
  let stars = 3;
  const maxTotalPieces = getMaxTotalPieces(fillings);
  const totalPieces = fillings.map(x => x.pieces).reduce((partialSum, a) => partialSum + a, 0);
  const piecesDropped = sums.dropped;
  if (sums.overflow) {
    stars = 1;
  } else if (piecesDropped > 1 && piecesDropped >= Math.floor(maxTotalPieces / 2)) {
    stars = 2;
  }

  const formattedTypes = sums.types.slice(0);
  while (formattedTypes.length < 3 && stars === 3) {
    formattedTypes.push({
      type: TYPES.filter(x => formattedTypes.map(y => y.type).indexOf(x) === -1)[0],
      amount: 0,
    });
  }
  const formattedPowers = sums.powers.slice(0).filter(x => (x.type === "Sparkling" ? x.amount >= 2000 : x));
  const myTypes = [];

  // default sandwich genset with accurate effects and type[1, 3, 2] as base
  let generatedSandwich = {
    number: "???",
    name: "Custom Sandwich",
    description: "A Tasty Coolio Original",
    fillings, condiments,
    effects: formattedPowers.map((x, i) => {
      const safeIndex = Math.min(i, formattedTypes.length - 1);
      let fullType = formattedTypes[safeIndex];
      let type = fullType.type;
      if (i === 1) {
        fullType = formattedTypes[2];
        type = fullType?.type || TYPES.filter(x => myTypes.indexOf(x) === -1)[0];
      }
      if (i === 2) {
        fullType = formattedTypes[1];
        type = fullType?.type || TYPES.filter(x => myTypes.indexOf(x) === -1)[0];
      }

      if (!fullType) {
        fullType = {
          type,
          amount: 0,
        }
      }

      const name = ALIAS_TO_FULL[x.type];
      myTypes.push(type);

      return {
        name,
        fullType,
        fullPower: x,
        type,
        level: 1
      }
    }).filter((x, i) => i < 3),
    imageUrl: SANDWICHES[0].imageUrl,
    piecesDropped,
    piecesOverflow: sums.overflow,
    totalPieces,
    stars
  };

  const firstType = formattedTypes[0] || TYPES[0];
  const secondType = formattedTypes[1] || TYPES[0];
  const thirdType = formattedTypes[2];
  const mainTypeAmount = firstType.amount;
  const oneTwoDiff = mainTypeAmount - secondType.amount;
  const oneTwoSum = mainTypeAmount + secondType.amount; // 92
  // const typeSum = sums.types.map(x => x.amount).reduce((partialSum, a) => partialSum + a, 0);

  // types and levels handling
  if (!presetSandwich) {
    let newTypes = [];
    if (mainTypeAmount <= 4 && generatedSandwich.totalPieces <= 2 && stars < 3) {
      newTypes = [firstType, secondType, thirdType]; // 2-star triple type
    } else if (stars > 2 && mainTypeAmount >= 100 && oneTwoDiff >= 100) {
      newTypes = [firstType, firstType, thirdType]; // todo: needs tweaking
    } else if (stars > 2 && mainTypeAmount >= 72 && oneTwoDiff >= 72 && oneTwoSum <= 92 /*typeSum < 130*/) {
      newTypes = [firstType, thirdType, firstType]; // todo: needs tweaking
    } else if (stars > 2 && mainTypeAmount > 480) { // mono type
      newTypes = [firstType, firstType, firstType];
    } else if (stars > 2 && mainTypeAmount > 280) { // dual type
      newTypes = [firstType, firstType, thirdType];
    } else { // triple type
      newTypes = [firstType, thirdType, secondType];
    }

    if ((!thirdType && stars < 3) || stars === 1) {
      newTypes = [firstType, secondType, thirdType];
    }

    if (stars === 1) {
      newTypes = newTypes.map(x => {
        return { type: x.type, amount: x.amount - 500 }
      }).map(x => x.amount > 0 ? x : undefined);
    }

    // can only have an effect if we have a type
    // so remove effect lines without a type
    const revisedEffects = [];
    for (let i = 0; i < generatedSandwich.effects.length; i++) {
      if (!newTypes[i]) { continue; }
      generatedSandwich.effects[i].type = newTypes[i].type;
      generatedSandwich.effects[i].fullType = newTypes[i];
      revisedEffects.push(generatedSandwich.effects[i]);
    }
    generatedSandwich.effects = revisedEffects;

    // handle levels
    // levels continue to remain not 100% consistent
    // so trial-and-error is still going on here
    const levels = calculateLevels(formattedTypes, generatedSandwich);
    for (let i = 0; i < generatedSandwich.effects.length; i++) {
      const effect = generatedSandwich.effects[i];
      effect.level = levels[i];
    }
  } else {
    // copy over levels if it's a preset sandwich recipe
    for (let i = 0; i < generatedSandwich.effects.length; i++) {
      const presetEffect = presetSandwich.effects[i];
      if (!presetEffect) { continue; }
      generatedSandwich.effects[i].level = presetEffect.level;
    }

    if (isOneTwoSandwich(presetSandwich)) {
      const rawTypes = formattedTypes.map(x => x.type).filter((x, i) => i < 2);
      const newTypes = [firstType, secondType, { type: TYPES.filter(x => rawTypes.indexOf(x) === -1)[0], amount: 0 }];
      for (let i = 0; i < generatedSandwich.effects.length; i++) {
        generatedSandwich.effects[i].type = newTypes[i].type;
      }
    }

    const typeException = TYPE_EXCEPTIONS[presetSandwich.number];
    if (typeException) {
      for (let i = 0; i < typeException.length; i++) {
        generatedSandwich.effects[i].type = typeException[i];
      }
    }
  }

  // remove types from egg powers
  for (const effect of generatedSandwich.effects) {
    if (effect.name === "Egg Power") {
      effect.type = "";
    }
  }

  return generatedSandwich;
};

export const isOneTwoSandwich = sandwich => {
  return oneTwoFirst.indexOf(sandwich.number) !== -1;
};

export const hasOneHerba = condiments => {
  let count = 0;
  for (const condiment of condiments) {
    if (condiment.name.toLowerCase().indexOf("herba") !== -1) {
      count++;
    }

    if (count > 1) {
      return false;
    }
  }

  return count === 1;
};

export const hasTwoHerba = condiments => {
  let count = 0;
  for (const condiment of condiments) {
    if (condiment.name.toLowerCase().indexOf("herba") !== -1) {
      count++;
    }
  }

  return count >= 2;
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
}

export const getKeyType = key => {
  if (isFlavor(key)) {
    return "flavor";
  } else if (isPower(key)) {
    return "power";
  } else if (isType(key)) {
    return "type";
  }

  return undefined;
}

export const isFilling = obj => {
  if (!obj) { return false; }
  return FILLINGS.filter(x => x.name === obj.name)[0] !== undefined;
};

export const isFlavor = obj => {
  const str = obj.flavor || obj;
  return FLAVORS.indexOf(str) !== -1;
};

export const isPower = obj => {
  const str = obj.type || obj;

  for (const power of POWERS) {
    if (power.indexOf(str) !== -1) {
      return true;
    }
  }

  return false;
};

export const isType = obj => {
  const str = obj.type || obj;
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
    const diff = array1.filter(x => !array2.includes(x) || array2.filter(y => y === x).length !== array1.filter(y => y === x).length);
    return diff.length === 0;
  }

  return false;
};

export const calculatePowerAmount = (base, ingredient, power) => {
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
  var modeMap = {};
  var maxEl = array[0][prop], maxCount = 1;
  for (var i = 0; i < array.length; i++) {
      var el = array[i][prop];
      if (modeMap[el] == null) {
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

export const copyTextToClipboard = text => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
};

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
