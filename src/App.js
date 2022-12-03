import SANDWICHES from './data/sandwiches.json';
//import MEALS from './data/meals.json';
import FILLINGS from './data/fillings.json';
import CONDIMENTS from './data/condiments.json';
import TYPES from './data/types.json'; // order of types in-game
import POWERS from './data/powers.json';
import FLAVORS from './data/flavors.json';
import { useEffect, useState } from 'react';
import { areEqual, calculatePowerAmount, getCondiments, getFillings,
  ALIAS_FULL, COLORS, FLAVOR_TABLE, oneTwoFirst,
  isOneTwoSandwich, TYPE_EXCEPTIONS, copyTextToClipboard, hasRelevance, getCategory } from './util';
import Card from './components/Card';
import './App.css';

// per player
const MAX_FILLINGS = 6;
const MAX_CONDIMENTS = 4;
const DISABLE_ALERTS = false;
let NUM_PLAYERS = 1;

function App() {
  const [advancedIngredients, setAdvancedIngredients] = useState(false);
  const [alwaysShowCustomSandwich, setAlwaysShowCustomSandwich] = useState(false);
  const [simpleMode, setSimpleMode] = useState(true);
  const [showSearchPanel, setShowSearchPanel] = useState(true);
  const [megaSandwichMode, setMegaSandwichMode] = useState(false);

  const [activeFillings, setActiveFillings] = useState([]);
  const [activeCondiments, setActiveCondiments] = useState([]);
  const [activeKey, setActiveKey] = useState({});
  const [searchNameQuery, setSearchNameQuery] = useState();
  const [searchEffectQuery, setSearchEffectQuery] = useState();
  const [searchTypeQuery, setSearchTypeQuery] = useState();
  const [searchIngredientQuery, setSearchIngredientQuery] = useState();
  const [results, setResults] = useState([]);
  const [heartbeat, setHeartbeat] = useState(0);
  let activeSandwich = undefined;
  let activeSums;

  useEffect(() => {
    if (!megaSandwichMode) {
      const tempFillings = activeFillings.slice(0, Math.min(activeFillings.length, MAX_FILLINGS));
      const tempCondiments = activeCondiments.slice(0, Math.min(activeCondiments.length, MAX_CONDIMENTS));
      setActiveFillings(tempFillings);
      setActiveCondiments(tempCondiments);
      NUM_PLAYERS = 1;
    } else {
      NUM_PLAYERS = 4;
    }
  }, [megaSandwichMode]);

  useEffect(() => {
    setAlwaysShowCustomSandwich(!simpleMode);
    if (simpleMode) {
      setActiveKey({});
    }
  }, [simpleMode]);

  useEffect(() => {
    const tempResults = [];

    let sandwichList = [];
    if (searchNameQuery) {
      for (const s of SANDWICHES) {
        for (const rawQuery of searchNameQuery) {
          const query = rawQuery.trim();
          if (s.name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
            sandwichList.push(s);
            continue;
          }
        }        
      }
    } else {
      sandwichList = SANDWICHES;
    }

    for (const s of sandwichList) {
      let hasAllQueries = true;
      if (searchEffectQuery) {
        for (const rawQuery of searchEffectQuery) {
          const query = rawQuery.trim();
          if (!s.effects.filter(x => x.name.toLowerCase().indexOf(query.toLowerCase()) !== -1)[0]) {
            hasAllQueries = false;
          }
        }
      }

      if (searchTypeQuery) {
        for (const rawQuery of searchTypeQuery) {
          const query = rawQuery.trim();
          if (!s.effects.filter(x => x.type.toLowerCase().indexOf(query.toLowerCase()) !== -1)[0]) {
            hasAllQueries = false;
          }
        }
      }

      if (searchIngredientQuery) {
        for (const rawQuery of searchIngredientQuery) {
          const query = rawQuery.trim();
          const ingredients = [...s.fillings, ...s.condiments];
          if (!ingredients.filter(x => x.toLowerCase().indexOf(query.toLowerCase()) !== -1)[0]) {
            hasAllQueries = false;
          }
        }
      }

      if (hasAllQueries) {
        tempResults.push(s);
      }

    }

    setResults(tempResults);
  }, [searchNameQuery, searchEffectQuery, searchTypeQuery, searchIngredientQuery]);

  useEffect(() => {
    if (activeSandwich) {
      const activeSandwichElement = document.getElementById(`sandwich-${activeSandwich}`);
      if (activeSandwichElement) {
        activeSandwichElement.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
      }
    }
  }, [results]);

  useEffect(() => {
    // handle removing active key if no ingredients with it
    // eg. user clicks on bitter, but then removes the only bitter ingredient
    if (!hasRelevance(activeSums, activeKey)) {
      setActiveKey({});
    }

  }, [activeFillings, activeCondiments]);

  const pulse = () => {
    setHeartbeat(heartbeat + 1);
  };

  const renderFillings = () => {

    return (
      <div className='filling-bkg'>
        {FILLINGS.map((x, i) => renderFilling(x, i))}
      </div>
    );
  };

  const renderFilling = (filling, index, active) => {
    let className = "ingredient";
    if (active) {
      className += ' filling-portrait';
    }

    let divClass = "ingredient-div";
    if (!active && !hasRelevance(filling, activeKey)) {
      divClass = 'ingredient-div ingredient-blur';
    }

    return (
    <div className={divClass} key={`filling-${index}`}>
      <img
        alt={filling.name}
        title={filling.name}
        src={filling.imageUrl}
        className={className}
        onClick={() => {
          const tempActiveFillings = activeFillings.slice(0);

          if (active) {
            var indexToRemove = tempActiveFillings.indexOf(filling);
            if (indexToRemove !== -1) {
              tempActiveFillings.splice(indexToRemove, 1);
            }
          } else {
            if (tempActiveFillings.length >= MAX_FILLINGS * NUM_PLAYERS) { return; }
            tempActiveFillings.push({ // done this way to avoid modifying base array
              ...filling
            });
          }

          setActiveFillings(tempActiveFillings);
        }}
      />
      {active && <div className='numbering numbering-icon'>{index + 1}</div>}
    </div>);
  };

  const renderCondiments = () => {

    return (
      <div className='condiment-bkg'>
        {CONDIMENTS.map((x, i) => renderCondiment(x, i))}
      </div>
    )
  };

  const renderCondiment = (condiment, index, active) => {
    let className = "ingredient";
    if (active) {
      className += ' condiment-portrait';
    }

    let divClass = "ingredient-div";
    if (!active && !hasRelevance(condiment, activeKey)) {
      divClass = 'ingredient-div ingredient-blur';
    }

    
    return (
    <div className={divClass} key={`condiment-${index}`}>
      <img
        alt={condiment.name}
        title={condiment.name}
        src={condiment.imageUrl}
        className={className}
        onClick={() => {
          const tempActiveCondiments = activeCondiments.slice(0);
          if (active) {
            var indexToRemove = tempActiveCondiments.indexOf(condiment);
            if (indexToRemove !== -1) {
              tempActiveCondiments.splice(indexToRemove, 1);
            }
          } else {
            if (tempActiveCondiments.length >= MAX_CONDIMENTS * NUM_PLAYERS) { return; }
            tempActiveCondiments.push(condiment);
          }
          setActiveCondiments(tempActiveCondiments);
        }}
      />
      {active && <div className='numbering numbering-icon'>{index + activeFillings.length + 1}</div>}
    </div>
    );
  };

  const renderActive = () => {
    return (
      <div className='active-ingredients-bkg'>
        {activeFillings.map((x, i) => renderFilling(x, i, true))}
        {activeCondiments.map((x, i) => renderCondiment(x, i, true))}
      </div>
    )
  };

  const renderSandwichBubble = (effect, key) => {
    let power = "Egg";
    for (const v of Object.keys(ALIAS_FULL)) {
      if (effect.name.indexOf(v) !== -1) {
        power = v;
        break;
      }
    }

    const powerColor = COLORS[power];
    const typeColor = COLORS[effect.type];
    const levelColor = "#e6d0d0";

    return (
      <div className="bubble-row" key={key}>
        <div className="bubble chain-a" style={{ backgroundColor: powerColor }}>{`${effect.name}: `}</div>
        <div className="bubble chain-b" style={{ backgroundColor: typeColor, display: effect.type === "" ? "none" : "" }}>{`${effect.type} `}</div>
        <div className="bubble chain-c" style={{ backgroundColor: levelColor }}>{`Lv. ${effect.level}`}</div>
      </div>
    );
  };

  const renderSandwich = sandwich => {
    if (!sandwich) { return null; }

    return (
      <div className='card' style={{ display: "flex" }}>
        <img alt={sandwich.name} src={sandwich.imageUrl} style={{ width: "100px" }} />
        <div>
          <div className="bubble bubble-header" style={{ backgroundColor: "tan" }}>#{sandwich.number} - {sandwich.name}</div>
          <div>{sandwich.effects.map((x, i) => renderSandwichBubble(x, i))}</div>          
        </div>
      </div>
    );
  };

  const toggleActiveKey = key => {
    const tempKey = activeKey;
    const category = getCategory(key);
    if (tempKey[category] === key) {
      tempKey[category] = undefined;
      setActiveKey(tempKey);
    } else {
      tempKey[category] = key;
      setActiveKey(tempKey);
    }
    pulse();
  };

  const craftSandwich = (sums, presetSandwich) => {
    if (sums.tastes.length + sums.powers.length + sums.types.length === 0) {
      return;
    }

    const formattedTypes = sums.types.slice(0);
    while (formattedTypes.length < 3) {
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
      fillings: activeFillings,
      condiments: activeCondiments,
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

        const name = ALIAS_FULL[x.type];
        myTypes.push(type);

        return {
          name,
          fullType,
          fullPower: x,
          type,
          level: "1",
        }
      }).filter((x, i) => i < 3),
      imageUrl: SANDWICHES[0].imageUrl,
    };

    const firstType = formattedTypes[0];
    const secondType = formattedTypes[1];
    const thirdType = formattedTypes[2]; // null check if only 2 types
    const mainTypeAmount = firstType.amount;

    // types and levels handling
    if (!presetSandwich) {
      let newTypes = [firstType, firstType, thirdType];
      if (mainTypeAmount > 480) { // mono type
        newTypes = [firstType, firstType, firstType];
      } else if (mainTypeAmount > 280) { // dual type
        newTypes = [firstType, firstType, thirdType];
      } else { // triple type
        newTypes = [firstType, thirdType, secondType];
      }

      for (let i = 0; i < generatedSandwich.effects.length; i++) {
        generatedSandwich.effects[i].type = newTypes[i].type;
        generatedSandwich.effects[i].fullType = newTypes[i];
      }

      // handle levels
      // levels continue to remain not 100% consistent
      // so trial-and-error is still going on here
      let levelsToAdd = 0;
      for (let i = 0; i < generatedSandwich.effects.length; i++) {
        const effect = generatedSandwich.effects[i];
        // console.log("\t" + effect.fullType.type, effect.fullType.amount);
        const typeAmount = effect.fullType.amount;
        let effectAmount = effect.fullPower.amount;
        if (i === 2 && effect.fullPower?.boosted) {
          effectAmount -= 100;
        }
        if (typeAmount >= 180 && effectAmount >= 100) {
          levelsToAdd++;
        }
        if (typeAmount >= 380 || effectAmount >= 1000) {
          levelsToAdd++;
        }
      }

      // console.log("adding " + levelsToAdd + " levels", generatedSandwich.effects);
      let index = 0;
      while (levelsToAdd > 0) {
        const level = parseInt(generatedSandwich.effects[index].level) + 1; // lol why did i keep this a string
        if (level > 3) { break; }
        generatedSandwich.effects[index].level = "" + level;
        
        index++;
        if (index > generatedSandwich.effects.length - 1) {
          index = 0;
        }
        levelsToAdd--;
      }
    } else {
      // copy over levels if it's a preset sandwich recipe
      for (let i = 0; i < generatedSandwich.effects.length; i++) {
        const presetEffect = presetSandwich.effects[i];
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

  const renderMath = () => {
    const ingredients = [
      ...activeFillings.sort((a, b) => a.name.localeCompare(b.name)),
      ...activeCondiments.sort((a, b) => a.name.localeCompare(b.name))
    ];
    const sums = {
      tastes: [],
      powers: [],
      types: [],
    };
    for (const food of ingredients) {
      for (const taste of food.tastes) {
        const hasEntry = sums.tastes.filter(x => x.flavor === taste.flavor)[0];
        let amount = 0; // existing amount
        if (hasEntry) {
          amount = hasEntry.amount;
          sums.tastes = sums.tastes.filter(x => x.flavor !== taste.flavor);
        }

        sums.tastes.push({
          flavor: taste.flavor,
          amount: amount + (calculatePowerAmount(taste.amount, food, taste)),
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
          amount: amount + (calculatePowerAmount(power.amount, food, power)),
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
          amount: amount + (calculatePowerAmount(type.amount, food, type)),
        });
      }
    }

    sums.tastes.sort((a, b) => {
      return b.amount - a.amount || FLAVORS.indexOf(a.flavor) - FLAVORS.indexOf(b.flavor);
    });
    sums.powers.sort((a, b) => {
      const aType = ALIAS_FULL[a.type];
      const bType = ALIAS_FULL[b.type];
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
          boosted: true, // boosted 'from zero' stats don't count in determining level
        });
      } else {
        existingStat.amount += 100;
        //existingStat.boosted = true;
      }
      sums.powers.sort((a, b) => {
        const aType = ALIAS_FULL[a.type];
        const bType = ALIAS_FULL[b.type];
        return b.amount - a.amount || POWERS.indexOf(aType) - POWERS.indexOf(bType);
      });
    }

    let foundSandwich;
    for (const sandwich of SANDWICHES) {
      const sandwichIngredients = [...sandwich.fillings, ...sandwich.condiments];
      if (areEqual(ingredients.map(x => x.name), sandwichIngredients)
        && areEqual(activeFillings.map(x => x.pieces), getFillings(sandwich.fillings).map(x => x.pieces))) {
        foundSandwich = sandwich;
        activeSandwich = sandwich.number;
        break;
      }
    }

    let pass = true;
    if (foundSandwich) {
      const tempPowers = sums.powers.slice(0).sort((a, b) => {
        const aType = ALIAS_FULL[a.type];
        const bType = ALIAS_FULL[b.type];
        return b.amount - a.amount || POWERS.indexOf(aType) - POWERS.indexOf(bType);
      }).filter(x => x.type !== "Sparkling");
      for (let i = 0; i < 3; i++) {
        const effect = foundSandwich.effects[i];
        const resultEffect = tempPowers[i];
        if (effect && resultEffect) {
          if (effect.name.indexOf(resultEffect.type) === -1) {
            pass = false;
            break;
          }
        }
      }
    }

    activeSums = sums;
    const generatedSandwich = craftSandwich(sums, foundSandwich);

    return (
      <div style={{ backgroundColor: pass ? "" : "red" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
          {ingredients.map((x, i) => <Card ingredient={x} number={i} fillings={activeFillings}
            simpleMode={simpleMode}
            updatePieces={() => pulse()}
            onClickBubble={key => toggleActiveKey(key)}
            activeKey={activeKey}
            onClick={() => {
              if (!simpleMode) {
                setAdvancedIngredients(!advancedIngredients);
              }
            }}
            condiments={activeCondiments} detail={!simpleMode && advancedIngredients} />)}
          {!advancedIngredients && <br className='page-break' />}
          {(activeCondiments.length > 0) && !simpleMode
            && <Card sums={sums} activeSandwich={activeSandwich}
                fillings={activeFillings} condiments={activeCondiments} 
                detail={!simpleMode && advancedIngredients}
                onClickBubble={key => toggleActiveKey(key)}
                activeKey={activeKey}
              />}
        </div>
        <div className="bubble-row" style={{ justifyContent: "center" }}>
          {renderSandwich(foundSandwich)}
          {activeCondiments.length > 0 && (alwaysShowCustomSandwich || !foundSandwich) && renderSandwich(generatedSandwich)}
        </div>
      </div>
    );
  };

  const renderSearchBubble = (sandwich, key) => {
    const highlight = activeSandwich && sandwich.number === activeSandwich;
    const isWeird = oneTwoFirst.filter(x => x === sandwich.number)[0];
    const foodCombo = [...sandwich.fillings, ...sandwich.condiments];
    const hasMultiIngredients = foodCombo.length !== Array.from(new Set(foodCombo)).length;

    return (
      <div className="bubble" key={key} id={`sandwich-${sandwich.number}`} onClick={() => {
        const condiments = getCondiments(sandwich.condiments);
        const fillings = getFillings(sandwich.fillings);
        setActiveKey({});

        setActiveCondiments(condiments);
        setActiveFillings(fillings);
      }} style={{ backgroundColor: highlight ? "yellow" : "#80808030",
        fontWeight: isWeird ? "bold" : "", color: hasMultiIngredients ? "" : ""}}>
        {`#${sandwich.number} - ${sandwich.name}`}
      </div>
    );
  };

  const search = (ev, criteria) => {
    const text = ev.target.value;
    const queries = text.split(",");

    switch (criteria) {
      case "name":
        setSearchNameQuery(queries);
        break;
      case "effect":
        setSearchEffectQuery(queries);
        break;
      case "type":
        setSearchTypeQuery(queries);
        break;
      case "ingredient":
        setSearchIngredientQuery(queries);
        break;
      default:
    }
  };
  

  const renderSearch = () => {
    if (!showSearchPanel) { return null; }

    return (
      <div className='search-panel'>
        <div className='search-bars-div'>
          <input type="text" id="nameSearch" placeholder='Search names' className='search-bar'
            onChange={ev => search(ev, "name")} style={{ width: "250px" }}
          />
          <input type="text" id="effectSearch" placeholder='Search effects (egg, raid, etc)' className='search-bar'
            onChange={ev => search(ev, "effect")} style={{ width: "250px" }}
          />
          <input type="text" id="typeSearch" placeholder='Search types (normal, dark, etc)' className='search-bar'
            onChange={ev => search(ev, "type")} style={{ width: "250px" }}
          />
          <input type="text" id="ingredientSearch" placeholder='Search ingredients (ham, bacon, etc)' className='search-bar'
            onChange={ev => search(ev, "ingredient")} style={{ width: "250px" }}
          />
        </div>
        <div className='search-results-div'>
          <div className="bubble-row" style={{ overflow: "auto", flexWrap: "nowrap" }}>
            {results.map((x, i) => renderSearchBubble(x, i))}
          </div>
        </div>
      </div>
    );
  };

  const saveRecipe = () => {
    if (activeCondiments.length === 0) { return; }

    const fArr = [];
    for (const f of activeFillings) {
      fArr.push(`${f.name}-${f.pieces}`);
    }

    const copyStr = `${fArr.join(",")}_${activeCondiments.map(x => x.name).join(",")}`;
    console.log("Saving recipe", copyStr);
    copyTextToClipboard(copyStr);

    if (!DISABLE_ALERTS) {
      alert("Copied recipe to clipboard!\n" + copyStr);
    }
  };

  const loadRecipe = () => {
    const recipeStr = window.prompt("Enter/paste recipe:", "");
    if (recipeStr && recipeStr.length > 0) {
      const tempF = [];
      let tempC = [];
      const spl = recipeStr.split("_");
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
          tempF.push({ ...filling, pieces });
        }
      }

      tempC = getCondiments(cNames);

      if (tempF.length > MAX_FILLINGS || tempC.length > MAX_CONDIMENTS) {
        setMegaSandwichMode(true);
      }

      setActiveFillings(tempF);
      setActiveCondiments(tempC);
    }
  }

  const renderSettings = () => {
    return (
      <div className='settings-bar'>
        <button className='button-spacing' onClick={() => setSimpleMode(!simpleMode)}>Toggle Simple Mode: {simpleMode ? "On" : "Off"}</button>
        <button className='button-spacing' onClick={() => setShowSearchPanel(!showSearchPanel)}>Toggle Search Panel</button>
        <button className='button-spacing' onClick={() => setMegaSandwichMode(!megaSandwichMode)}>Toggle Multiplayer Mode: {megaSandwichMode ? "On" : "Off"}</button>
        <button className='button-spacing' onClick={() => loadRecipe()}>Load Recipe</button>
        <button className='button-spacing' onClick={() => saveRecipe()}>Save Recipe</button>
      </div>
    );
  };

  return (
    <div className="App">
      {renderFillings()}
      {renderCondiments()}
      {renderActive()}
      {renderMath()}
      {renderSearch()}
      {renderSettings()}
      <small><a href="https://github.com/cecilbowen/pokemon-sandwich-simulator">Source Code</a></small>
    </div>
  );
}

export default App;
