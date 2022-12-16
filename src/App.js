import SANDWICHES from './data/sandwiches.json';
import FILLINGS from './data/fillings.json';
import CONDIMENTS from './data/condiments.json';
import TYPES from './data/types.json';
import FLAVORS from './data/flavors.json';
import { useEffect, useState } from 'react';
import { getCondiments, getFillings, getRecipeFromIngredients,
  ALIAS_TO_FULL, COLORS, oneTwoFirst, getIngredientsSums, craftSandwich, checkPresetSandwich,
  copyTextToClipboard, hasRelevance, getCategory, getIngredientsFromRecipe } from './util';
import { runTests } from './test/tests';
import Card from './components/Card';
import './App.css';
import Bubble from './components/Bubble';

// per player
const MAX_FILLINGS = 6;
const MAX_CONDIMENTS = 4;
const DISABLE_ALERTS = false;
let NUM_PLAYERS = 1;

function App() {
  const [advancedIngredients, setAdvancedIngredients] = useState(false);
  const [alwaysShowCustomSandwich, setAlwaysShowCustomSandwich] = useState(false);
  const [simpleMode, setSimpleMode] = useState(true);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showEffectFilter, setShowEffectFilter] = useState(true);
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
  const [editNameKey, setEditNameKey] = useState(-1);
  const [filterSavedSandwiches, setFilterSavedSandwiches] = useState('');
  const [savedSandwhiches, setSavedSandwhiches] = useState(() => {
    return JSON.parse(localStorage.getItem('savedSandwhiches') || '[]')
  });
  let activeSandwich = undefined;
  let activeSums;
  let generatedSandwich = {}

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
    // setAlwaysShowCustomSandwich(!simpleMode);
    if (simpleMode) {
      setActiveKey({});
    }
  }, [simpleMode]);

  useEffect(() => {
    if (!showEffectFilter) {
      setActiveKey({});
    }
  }, [showEffectFilter]);

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

  const pulse = () => {
    setHeartbeat(heartbeat + 1);
  };

  const clearIngredients = () => {
    setActiveFillings([]);
    setActiveCondiments([]);
  };

  const renderFillings = () => {

    return (
      <div className='filling-bkg'>
        {FILLINGS.map((x, i) => renderFilling(x, i))}
      </div>
    );
  };

  const checkAmountOfPower = (checkArr, power) => {
    let retClass = 'ingredient-power-bg';
    const activePower = checkArr["powers"].find((u) => u.type === power);

    if (hasRelevance(checkArr, activeKey) && activePower !== undefined) { 
      if(activePower.amount > 0) {
        retClass += ' power-increase';
      }
      if(activePower.amount < 0) {
        retClass += ' power-decrease';
      }
    } 

    return retClass;
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

    const ingredientPowerClass = checkAmountOfPower(filling, activeKey["power"]);

    return (
    <div className={divClass} key={`filling-${index}-${active ? 'active' : 'dormant'}`}>
      <div className={ingredientPowerClass}></div>
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
    );
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

    const ingredientPowerClass = checkAmountOfPower(condiment, activeKey["power"]);
    
    return (
    <div className={divClass} key={`condiment-${index}-${active ? 'active' : 'dormant'}`}>
      <div className={ingredientPowerClass}></div>
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
    const showClear = activeFillings.length > 0 || activeCondiments.length > 0;

    return (
      <div className='active-ingredients-bkg'>
        {activeFillings.map((x, i) => renderFilling(x, i, true))}
        {activeCondiments.map((x, i) => renderCondiment(x, i, true))}
        {showClear && <span className='clear-ingredients' onClick={() => clearIngredients()}>clear</span>}
      </div>
    )
  };

  const renderSandwichBubble = (effect, key) => {
    let power = "Egg";
    for (const v of Object.keys(ALIAS_TO_FULL)) {
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

    let display = `#${sandwich.number} - ${sandwich.name}`;

    if (sandwich.number === "???") {
      display = '⭐'.repeat(sandwich.stars);
      if (sandwich.effects.length === 0) {
        display += "(failure)"
      }
    }

    return (
      <div className='card' style={{ display: "flex" }}>
        <img alt={sandwich.name} src={sandwich.imageUrl} style={{ width: "100px" }} />
        <div>
          <div className="bubble bubble-header" onClick={() => {
            if(window.event.ctrlKey) { runTests(); }
          }}
            style={{ backgroundColor: "tan" }}>{display}</div>
          {sandwich.effects.length > 0 && <div>{sandwich.effects.map((x, i) => renderSandwichBubble(x, i))}</div>}
          {sandwich.effects.length === 0 && <div className='no-effects'>This sandwich has no effects.</div>}
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

  const saveSandwich = () => {
    let sandwich = generatedSandwich
    console.log(SANDWICHES.find(s => s.number === activeSandwich))
    if (activeSandwich) {
      sandwich = {
        ...SANDWICHES.find(s => s.number === activeSandwich),
        condiments: sandwich.condiments,
        fillings: sandwich.fillings,
      }
    }
    setSavedSandwhiches(Array.of(...savedSandwhiches, sandwich))
  }

  const renderMath = () => {
    const ingredients = [
      ...activeFillings.sort((a, b) => a.name.localeCompare(b.name)),
      ...activeCondiments.sort((a, b) => a.name.localeCompare(b.name))
    ];
    const sums = getIngredientsSums(activeFillings, activeCondiments);
    activeSums = sums;

    const foundSandwich = checkPresetSandwich(sums, activeFillings, activeCondiments);
    generatedSandwich = craftSandwich(activeFillings, activeCondiments, sums, foundSandwich);
    activeSandwich = foundSandwich?.number;

    // Sure, we could show results with only condiments, but we can't add only condiments
    // to a sandwich in-game.  We have to add at least one filling, which we would then
    // have to remove to have only condiments left on the sandwich, and since the results vary
    // based on what filling we removed in this case, then there's no point in allowing results
    // with only condiments.
    const showResults = activeFillings.length > 0 && activeCondiments.length > 0;

    return (
      <div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
          {ingredients.map((x, i) => <Card ingredient={x} number={i} fillings={activeFillings}
            key={`ingredient-card-${i}`}
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
          {showResults && !simpleMode
            && <Card sums={sums} activeSandwich={activeSandwich}
                fillings={activeFillings} condiments={activeCondiments} 
                detail={!simpleMode && advancedIngredients}
                onClickBubble={key => toggleActiveKey(key)}
                activeKey={activeKey}
              />}
        </div>
        <div className="bubble-row" style={{ justifyContent: "center" }}>
          {renderSandwich(foundSandwich)}
          {showResults && (alwaysShowCustomSandwich || !foundSandwich) && renderSandwich(generatedSandwich)}
        </div>
        {showResults && <button onClick={saveSandwich}>Save Sandwich</button>}
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

  const renderComplexSearch = () => {
    return (
      <div className="complex-search-panel">
        <div className="bubble-row complex-row">
          {FLAVORS.map((flavor) => (
            <Bubble
              label={flavor}
              key={flavor}
              isFlavor
              onClick={() => toggleActiveKey(flavor)}
              selected={
                activeKey && Object.values(activeKey).indexOf(flavor) !== -1
              }
            />
          ))}
        </div>
        <div className="bubble-row complex-row">
          {Object.keys(ALIAS_TO_FULL).map((power) => (
            <Bubble
              label={power}
              key={power}
              onClick={() => toggleActiveKey(power)}
              selected={
                activeKey && Object.values(activeKey).indexOf(power) !== -1
              }
            />
          ))}
        </div>
        <div className="bubble-row complex-row">
          {TYPES.map((type) => (
            <Bubble
              label={type}
              key={type}
              isType
              onClick={() => toggleActiveKey(type)}
              selected={
                activeKey && Object.values(activeKey).indexOf(type) !== -1
              }
            />
          ))}
        </div>
      </div>
    );
  };

  const saveRecipe = () => {
    const copyStr = getRecipeFromIngredients({ fillings: activeFillings, condiments: activeCondiments });
    if (!copyStr) { return; }

    console.log("Saving recipe", copyStr);
    copyTextToClipboard(copyStr);

    if (!DISABLE_ALERTS) {
      alert("Copied recipe to clipboard!\n" + copyStr);
    }
  };

  const loadRecipe = recipe => {
    if (!recipe) {
      recipe = window.prompt("Enter/paste recipe:", "");
    }
    
    const ingredients = getIngredientsFromRecipe(recipe);
    if (ingredients) {
      const fillings = ingredients.fillings;
      const condiments = ingredients.condiments;

      if (fillings.length > MAX_FILLINGS || condiments.length > MAX_CONDIMENTS) {
        setMegaSandwichMode(true);
      }

      setActiveFillings(fillings);
      setActiveCondiments(condiments);
    }
  }

  const renderSettings = () => {
    return (
      <div className='settings-bar'>
        <button className='button-spacing' onClick={() => setSimpleMode(!simpleMode)}>Toggle Simple Mode: {simpleMode ? "On" : "Off"}</button>
        <button className='button-spacing' onClick={() => setShowSearchPanel(!showSearchPanel)}>Toggle Search Panel</button>
        {!simpleMode && <button className='button-spacing' onClick={() => setShowEffectFilter(!showEffectFilter)}>Toggle Effect Filter</button>}
        <button className='button-spacing' onClick={() => setMegaSandwichMode(!megaSandwichMode)}>Toggle Multiplayer Mode: {megaSandwichMode ? "On" : "Off"}</button>
        <button className='button-spacing' onClick={() => loadRecipe()}>Load Recipe</button>
        <button className='button-spacing' onClick={() => saveRecipe()}>Save Recipe</button>
      </div>
    );
  };

  useEffect(() => {
    localStorage.setItem("savedSandwhiches", JSON.stringify(savedSandwhiches));
  }, [savedSandwhiches]);

  const loadLocalRecipe = (fillings, condiments) => {
    if (fillings.length > MAX_FILLINGS || condiments.length > MAX_CONDIMENTS) {
      setMegaSandwichMode(true);
    }

    setActiveFillings(fillings);
    setActiveCondiments(condiments);
  };

  const removeLocalRecipe = (idx, e) => {
    e.stopPropagation()
    setSavedSandwhiches(savedSandwhiches.filter((s, sIdx) => sIdx !== idx))
  }

  const changeName = (idx, e) => {
    const name = e.target.value
    savedSandwhiches.splice(idx, 1, {...savedSandwhiches[idx], name: name})
    setSavedSandwhiches([...savedSandwhiches])
    e.stopPropagation()
  }

  const filter = (text) => {
    return !!text ? savedSandwhiches.filter(s => s.name.toLowerCase().includes(text)) : savedSandwhiches
  }

  const renderSavedSandwiches = () => {
    return (
      <div>
        <p style={{fontSize: '1.5rem'}}>Saved Sandwiches (Total: {savedSandwhiches.length})</p>
        <label htmlFor="sandwich-filter">Filter by name: </label>
        <input type="text" id="sandwich-filter" value={filterSavedSandwiches} onChange={(e) => {
          e.stopPropagation()
          setFilterSavedSandwiches(e.target.value.toLowerCase())
        }} />
        {filter(filterSavedSandwiches).length === 0 && <p>No results</p>}
        <div id="saved-sandwichs">
          {filter(filterSavedSandwiches).map(({condiments, fillings, effects, name, stars, number}, idx) => (
            <div key={`saved-recipe-${idx}`} className="saved-sandwich" onClick={() => loadLocalRecipe(fillings, condiments)}>
              <div className="display-name">
                {number !== '???' && <p>{number}</p>}
                <p>{name}</p>
                <p>{'⭐'.repeat(stars)}</p>
                <p>
                  {!Number.isInteger(parseInt(number)) && 
                  <button onClick={(e) => {
                    e.stopPropagation()
                    setEditNameKey(idx)
                  }}>Edit name</button>}</p>
              </div>
              {
                editNameKey === idx && 
                <input type="text" 
                autoFocus 
                value={name} 
                onChange={(e) => changeName(idx, e)} 
                onClick={(e) => e.stopPropagation()} 
                onBlur={() => setEditNameKey(-1)} />
              }
              {effects.length > 0 && <div>{effects.map(({name}, idx) => <span key={`effect-${idx}`} style={{margin: "0 0.3rem"}}>{name}</span>)}</div>}
              <div className="ingredients">
                {fillings.map((x, i) => renderFilling(x, `local-filling-${idx}-${i}`, false))}
                {condiments.map((x, i) => renderCondiment(x, `local-condiment-${idx}-${i}`, false))}
              </div>
                <span className='clear-ingredients' onClick={(e) => removeLocalRecipe(idx, e)}>Remove</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      {!simpleMode && showEffectFilter && renderComplexSearch()}
      {renderFillings()}
      {renderCondiments()}
      {renderActive()}
      {renderMath()}
      {renderSearch()}
      {renderSettings()}
      {renderSavedSandwiches()}
      <div id="github-banner"><a href="https://github.com/cecilbowen/pokemon-sandwich-simulator">Source Code</a></div>
    </div>
  );
}

export default App;
