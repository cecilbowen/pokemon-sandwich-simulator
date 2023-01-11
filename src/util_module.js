
const SANDWICHES = require('./data/sandwiches.json');
const FILLINGS = require('./data/fillings.json');
const CONDIMENTS = require('./data/condiments.json');
const POWERS = require('./data/powers.json');
const TYPES = require('./data/types.json');

const ALIAS_TO_FULL = { // power alias
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

const FLAVOR_TABLE = {
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

function getCondiments(strArr) {
  const ret = [];
  for (const str of strArr) {
    const condiment = CONDIMENTS.filter(x => x.name === str)[0];
    if (condiment) {
      ret.push({ ...condiment });
    }
  }
  return ret;
};

function getIngredientsFromRecipe(recipe) {
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
      let name = str.split("-")[0];
      let pieces = str.split("-")[1];
      if (pieces) { pieces = parseInt(pieces); }

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

    return { fillings, condiments };
  }

  return undefined;
};

function isFilling(obj) {
  if (!obj) { return false; }
  return FILLINGS.filter(x => x.name === obj.name)[0] !== undefined;
};

function calculatePowerAmount(base, ingredient, power) {
  let newAmount = base;
  const isCondiment = !isFilling(ingredient);

  if (!isCondiment/* && !isType(power)*/) {
    newAmount *= ingredient.pieces;
  }

  return newAmount;
};


function getPiecesDropped(obj) {
  if (obj.pieces === undefined) { return 0; } // not a filling
  const name = obj.name;
  const basePieces = FILLINGS.filter(x => x.name === name)[0].pieces;
  return basePieces - obj.pieces;
};

function getIngredientsSums(fillings, condiments) {
  const ingredients = [
    ...fillings.sort((a, b) => a.name.localeCompare(b.name)),
    ...condiments.sort((a, b) => a.name.localeCompare(b.name))
  ];

  const sums = {
    tastes: [],
    powers: [],
    types: [],
    dropped: 0, // how many pieces dropped off sandwich
    overflow: 0 // how many pieces on sandwich past the single ingredient limit
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

  const multiplayer = fillings.length > 6 || condiments.length > 4;
  for (const pieces of Object.values(tempFillingPieces)) {
    const singleIngredientLimit = multiplayer ? 15 : 12; // todo: make a constants file with all this stuff
    if (pieces > singleIngredientLimit) {
      sums.overflow = Math.max(sums.overflow - singleIngredientLimit, pieces - singleIngredientLimit);
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

// check if two arrays contain the same elements
function areEqual(array1, array2) {
  if (array1.length === array2.length) {
    const diff = array1.filter(x => !array2.includes(x) || array2.filter(y => y === x).length !== array1.filter(y => y === x).length);
    return diff.length === 0;
  }

  return false;
};

function getFillings(strArr) {
  const ret = [];
  for (const str of strArr) {
    const filling = FILLINGS.filter(x => x.name === str)[0];
    if (filling) {
      ret.push({ ...filling });
    }
  }

  return ret;
};

function checkPresetSandwich(sums, fillings, condiments) {
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

// add the code below
module.exports = { getIngredientsFromRecipe, getIngredientsSums, checkPresetSandwich };