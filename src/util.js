import SANDWICHES from './data/sandwiches.json';
import MEALS from './data/meals.json';
import FILLINGS from './data/fillings.json';
import CONDIMENTS from './data/condiments.json';

const FILLING_MULT = 3; // multiplier on filling, debug stuff

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
    "Sweet": "Catching",
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

export const ALIAS = { // power alias
  "Egg": "Egg",
  "Catching": "Catch",
  "Item Drop": "Item",
  "Humungo": "Humungo",
  "Teensy": "Teensy",
  "Raid": "Raid",
  "Encounter": "Encounter",
  "Exp.": "Exp",
  "Title": "Title",
  "Sparkling": "Shiny",
};

export const ALIAS_FULL = { // power alias
  "Egg": "Egg Power",
  "Catch": "Catching Power",
  "Item": "Item Drop Power",
  "Humungo": "Humungo Power",
  "Teensy": "Teensy Power",
  "Raid": "Raid Power",
  "Encounter": "Encounter Power",
  "Exp": "Exp. Point Power",
  "Title": "Title Power",
  "Shiny": "Sparkling Power",
};

export const FLAVORS = [
  "Salty", "Sweet", "Hot", "Bitter", "Sour"
];

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
	"Dragon": 'rgba(111, 53, 252, 0.87)', //'#6F35FC',
	"Dark": 'rgba(112, 87, 70, 0.88)', //'#705746',
	"Steel": '#B7B7CE',
	"Fairy": '#D685AD',
  "All Types": 'aquamarine',
  "All Other Types": 'aquamarine',
};

export const TYPE_EXCEPTIONS = {
  "39": ["Flying", "Poison", "Fighting"], // I'm convinced this is a game bug and it's only counting the flavors on apple once
};

export const getPowerAliasByValue = power => {
  const str = power.type || power;
  for (const [k,v] of Object.entries(ALIAS)) {
    if (v === str) {
      return k;
    }
  }

  return undefined;
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

export const isFilling = obj => {
  if (!obj) { return false; }
  return FILLINGS.filter(x => x.name === obj.name)[0] !== undefined;
};

export const isPower = obj => {
  const str = obj.type || obj;
  return ALIAS[str] !== undefined;
};

export const isType = obj => {
  return !(isFlavor(obj) || isPower(obj));
};

export const isFlavor = obj => {
  const str = obj.flavor || obj;
  return FLAVORS.indexOf(str) !== -1;
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