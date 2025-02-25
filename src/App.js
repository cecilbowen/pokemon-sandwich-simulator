import SANDWICHES from './data/sandwiches.json';
import FILLINGS from './data/fillings.json';
import CONDIMENTS from './data/condiments.json';
import TYPES from './data/types.json';
import FLAVORS from './data/flavors.json';
import { useEffect, useState } from 'react';
import { getCondiments, getFillings, getRecipeFromIngredients, ts, LANGUAGE_NAMES, getNumberOfPlayers,
  ALIAS_TO_FULL, FULL_TO_ALIAS, COLORS, oneTwoFirst, getIngredientsSums, checkPresetSandwich,
  copyTextToClipboard, hasRelevance, getCategory, getIngredientsFromRecipe,
  getIngredientImage,
  getImage,
  copySandwich } from './util';
import { runTests, testsToSandwiches } from './tests/tests';
import Card from './components/Card';
import './App.css';
import Bubble from './components/Bubble';
import { getSandwich } from './helper/helper';

// per player
const MAX_FILLINGS = 6;
const MAX_CONDIMENTS = 4;
const DISABLE_ALERTS = false;
let NUM_PLAYERS = 1;

// en, es, ja, de, ru, sv, fr, etc
export let LANGUAGE = "en";
export const USE_SEREBII = false;

const App = () => {
  const [advancedIngredients, setAdvancedIngredients] = useState(false);
  const [alwaysShowCustomSandwich, setAlwaysShowCustomSandwich] = useState(false);
  const [simpleMode, setSimpleMode] = useState(true);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showEffectFilter, setShowEffectFilter] = useState(true);
  const [megaSandwichMode, setMegaSandwichMode] = useState(false);
  const [hasBread, setHasBread] = useState(true);
  const [includeTestsInSearch, setIncludeTestsInSearch] = useState(false);

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

  useEffect(() => {
    window.runTests = runTests;
  }, []);

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
    const base = [...SANDWICHES, ...includeTestsInSearch ? testsToSandwiches() : []];
    const tempResults = [];

    let sandwichList = [];
    if (searchNameQuery) {
      for (const s of base) {
        for (const rawQuery of searchNameQuery) {
          const query = rawQuery.trim();
          if (s.name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
            sandwichList.push(s);
            continue;
          }
        }
      }
    } else {
      sandwichList = base;
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
    if (activeSandwich !== undefined) {
      const activeSandwichElement = document.getElementById(`sandwich-${activeSandwich}`);
      if (activeSandwichElement) {
        activeSandwichElement.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      }
    }
  }, [results]);

  const pulse = () => {
    setHeartbeat(heartbeat + 1);
  };

  const changeLanguage = lang => {
    LANGUAGE = lang;
    pulse();
  };

  const clearIngredients = () => {
    setActiveFillings([]);
    setActiveCondiments([]);
  };

  const renderFillings = () => {
    return (
      <div className="filling-bkg">
        {FILLINGS.map((x, i) => renderFilling(x, i))}
      </div>
    );
  };

  const checkAmountOfPower = (checkArr, power) => {
    let retClass = 'ingredient-power-bg';
    const activePower = checkArr.powers.find(u => u.type === power);

    if (hasRelevance(checkArr, activeKey) && activePower !== undefined) {
      if (activePower.amount > 0) {
        retClass += ' power-increase';
      }
      if (activePower.amount < 0) {
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

    const ingredientPowerClass = checkAmountOfPower(filling, activeKey.power);

    return (
    <div className={divClass} key={`filling-${index}-${active ? 'active' : 'dormant'}`}>
      <div className={ingredientPowerClass}></div>
      <img
        alt={ts(filling.name)}
        title={ts(filling.name)}
        src={USE_SEREBII ? filling.imageUrl : getIngredientImage(filling.name)}
        className={className}
        onClick={() => {
          const tempActiveFillings = activeFillings.slice(0);

          if (active) {
            const indexToRemove = tempActiveFillings.indexOf(filling);
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
      {active && <div className="numbering numbering-icon">{index + 1}</div>}
    </div>);
  };

  const renderCondiments = () => {
    return (
      <div className="condiment-bkg">
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

    const ingredientPowerClass = checkAmountOfPower(condiment, activeKey.power);

    return (
    <div className={divClass} key={`condiment-${index}-${active ? 'active' : 'dormant'}`}>
      <div className={ingredientPowerClass}></div>
      <img
        alt={ts(condiment.name)}
        title={ts(condiment.name)}
        src={USE_SEREBII ? condiment.imageUrl : getIngredientImage(condiment.name)}
        className={className}
        onClick={() => {
          const tempActiveCondiments = activeCondiments.slice(0);
          if (active) {
            const indexToRemove = tempActiveCondiments.indexOf(condiment);
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
      {active && <div className="numbering numbering-icon">{index + activeFillings.length + 1}</div>}
    </div>
    );
  };

  const renderBread = () => {
    const divClassAddon = hasBread ? "bread" : "no-bread";

    const divClass = `ingredient-div ${divClassAddon}`;
    const name = hasBread ? "Bread-On" : "Bread-Off";

    return (
    <div className={divClass}>
      <img
        alt={ts(name)}
        title={ts(name)}
        src={getIngredientImage("bread")}
        className={`ingredient ${hasBread ? "img-bread" : "img-no-bread"}`}
        onClick={() => setHasBread(!hasBread)}
      />
      <div className="numbering numbering-icon">0</div>
    </div>);
  };

  const renderActive = () => {
    const showClear = activeFillings.length > 0 || activeCondiments.length > 0;

    return (
      <div className="active-ingredients-bkg">
        {activeFillings.length + activeCondiments.length > 0 && renderBread()}
        {activeFillings.map((x, i) => renderFilling(x, i, true))}
        {activeCondiments.map((x, i) => renderCondiment(x, i, true))}
        {showClear && <span className="clear-ingredients" onClick={() => clearIngredients()}>{ts("clear")}</span>}
      </div>
    );
  };

  const renderSandwichBubble = (effect, key) => {
    const power = FULL_TO_ALIAS[effect.name];
    const powerColor = COLORS[power];
    const typeColor = COLORS[effect.type];
    const levelColor = "#e6d0d0";

    return (
      <div className="bubble-row" key={key}>
        <div className="bubble chain-a" style={{ backgroundColor: powerColor }}>{`${ts(effect.name)}: `}</div>
        <div className="bubble chain-b"
          style={{ backgroundColor: typeColor, display: effect.type === "" ? "none" : "" }}>{`${ts(effect.type)} `}</div>
        <div className="bubble chain-c" style={{ backgroundColor: levelColor }}>{`${ts("Lv.")} ${effect.level}`}</div>
      </div>
    );
  };

  const renderSandwich = sandwich => {
    if (!sandwich) { return null; }

    let display = `#${sandwich.number} - ${ts(sandwich.name)}`;

    if (sandwich.number === "???") {
      display = '⭐'.repeat(sandwich.stars);
      if (sandwich.effects.length === 0) {
        display += `(${ts("failure")})`;
      }
    }

    const numberOfPlayers = getNumberOfPlayers({ fillings: activeFillings, condiments: activeCondiments });

    const sandwichSrc = hasBread || sandwich.number !== "???" ? sandwich.imageUrl :
      `${process.env.PUBLIC_URL}/images/no-bread-sandwich.png`;

    return (
      <div className="card" style={{ display: "flex" }}>
        <img alt={ts(sandwich.name)}
          src={sandwichSrc}
          style={{ width: "100px", borderRadius: "8px" }}
        />
        {megaSandwichMode && <div id="players-icon">{numberOfPlayers}P</div>}
        <div>
          <div className="bubble bubble-header"
            style={{ backgroundColor: "tan" }}>{display}</div>
          {sandwich.effects.length > 0 && sandwich.number === "???" && <img className="copy-icon" src={getImage("copy-icon.png")}
            alt={ts("Copy sandwich effects")}
            title={ts("Copy sandwich effects")}
            onClick={() => copySandwich(sandwich, activeFillings, activeCondiments, hasBread)} />}
          {sandwich.effects.length > 0 && <div>{sandwich.effects.map((x, i) => renderSandwichBubble(x, i))}</div>}
          {sandwich.effects.length === 0 && <div className="no-effects">{ts("This sandwich has no effects.")}</div>}
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

  const renderMath = () => {
    const ingredients = [
      ...activeFillings.sort((a, b) => a.name.localeCompare(b.name)),
      ...activeCondiments.sort((a, b) => a.name.localeCompare(b.name))
    ];

    const generatedSandwich = getSandwich({ fillings: activeFillings, condiments: activeCondiments, hasBread });
    const sums = getIngredientsSums(generatedSandwich.stats);

    const foundSandwich = checkPresetSandwich(sums, activeFillings, activeCondiments);

    activeSandwich = foundSandwich?.number;

    // Sure, we could show results with only condiments, but we can't add only condiments
    // to a sandwich in-game.  We have to add at least one filling, which we would then
    // have to remove to have only condiments left on the sandwich, and since the results vary
    // based on what filling we removed in this case, then there's no point in allowing results
    // with only condiments.
    const showResults = activeFillings.length > 0 && activeCondiments.length > 0;

    return (
      <div className="results">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
          {ingredients.map((x, i) => <Card key={`ing-${i}`} hasBread={hasBread}
            ingredient={x} stars={generatedSandwich.stars}
            number={i}
            fillings={activeFillings}
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
          {!advancedIngredients && <br className="page-break" />}
          {showResults && !simpleMode &&
            <Card sums={sums} mods={generatedSandwich.mods} hasBread={hasBread}
                fillings={activeFillings} condiments={activeCondiments}
                detail={!simpleMode && advancedIngredients}
                onClickBubble={key => toggleActiveKey(key)}
                activeKey={activeKey} stars={generatedSandwich.stars}
              />}
        </div>
        <div className="bubble-row" style={{ justifyContent: "center" }}>
          {renderSandwich(foundSandwich)}
          {showResults && (alwaysShowCustomSandwich || !foundSandwich) && renderSandwich(generatedSandwich)}
        </div>
      </div>
    );
  };

  const renderSearchBubble = (sandwich, key) => {
    const highlight = activeSandwich !== undefined && sandwich.number === activeSandwich;
    const isWeird = oneTwoFirst.filter(x => x === sandwich.number)[0];
    const foodCombo = [...sandwich.fillings, ...sandwich.condiments];
    const hasMultiIngredients = foodCombo.length !== Array.from(new Set(foodCombo)).length;
    const cls = highlight ? 'bubble highlighted' : 'bubble dim';

    const numStr = `#${sandwich.number} - `;

    return (
      <div className={cls} key={key} id={`sandwich-${sandwich.number}${sandwich.id ?? ""}`} onClick={() => {
        const condiments = getCondiments(sandwich.condiments);
        const fillings = getFillings(sandwich.fillings);
        setHasBread(sandwich.hasBread ?? true);
        setActiveCondiments(condiments);
        setActiveFillings(fillings);
      }} style={{
        fontWeight: isWeird ? "bold" : "",
        color: hasMultiIngredients ? "" : ""
      }}>
        {`${sandwich.id ? "" : numStr}${sandwich.id ? sandwich.name : ts(sandwich.name)}`}
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
      <div className="search-panel">
        <div className="search-bars-div">
          <input type="text" id="nameSearch" placeholder={ts('Search names')} className="search-bar"
            onChange={ev => search(ev, "name")} style={{ width: "250px" }}
          />
          <input type="text" id="effectSearch" placeholder={ts('Search effects (egg, raid, etc)')} className="search-bar"
            onChange={ev => search(ev, "effect")} style={{ width: "250px" }}
          />
          <input type="text" id="typeSearch" placeholder={ts('Search types (normal, dark, etc)')} className="search-bar"
            onChange={ev => search(ev, "type")} style={{ width: "250px" }}
          />
          <input type="text" id="ingredientSearch" placeholder={ts('Search ingredients (ham, bacon, etc)')} className="search-bar"
            onChange={ev => search(ev, "ingredient")} style={{ width: "250px" }}
          />
        </div>
        <div className="search-results-div">
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
          {FLAVORS.map(flavor =>
            <Bubble
              label={flavor}
              key={flavor}
              isFlavor
              onClick={() => toggleActiveKey(flavor)}
              selected={
                activeKey && Object.values(activeKey).indexOf(flavor) !== -1
              }
            />
          )}
        </div>
        <div className="bubble-row complex-row">
          {Object.keys(ALIAS_TO_FULL).map(power =>
            <Bubble
              label={power}
              key={power}
              onClick={() => toggleActiveKey(power)}
              selected={
                activeKey && Object.values(activeKey).indexOf(power) !== -1
              }
            />
          )}
        </div>
        <div className="bubble-row complex-row">
          {TYPES.map(type =>
            <Bubble
              label={type}
              key={type}
              isType
              onClick={() => toggleActiveKey(type)}
              selected={
                activeKey && Object.values(activeKey).indexOf(type) !== -1
              }
            />
          )}
        </div>
      </div>
    );
  };

  const saveRecipe = () => {
    const copyStr = getRecipeFromIngredients({ fillings: activeFillings, condiments: activeCondiments, hasBread });
    if (!copyStr) { return; }

    console.log("Saving recipe", copyStr);
    copyTextToClipboard(copyStr, () => {
    if (!DISABLE_ALERTS) {
      window.snackbar.createSnackbar(ts("Copied recipe to clipboard!"), {
        timeout: 3000
      });
    }
    });
  };

  const getShareUrl = () => {
    const recipeStr = getRecipeFromIngredients({ fillings: activeFillings, condiments: activeCondiments, hasBread }, true);
    if (!recipeStr) { return; }

    const copyStr = `${window.location.href.split(/[?#]/)[0]}?recipe=${recipeStr}`;

    console.log("Sharing recipe url", copyStr);
    copyTextToClipboard(copyStr, () => {
    if (!DISABLE_ALERTS) {
      window.snackbar.createSnackbar(ts("Copied recipe URL to clipboard!"), {
        timeout: 3000
      });
    }
    });
  };

  const loadRecipe = recipe => {
    if (!recipe) {
      recipe = window.prompt(ts("Enter/paste recipe:"), "");
    }

    const ingredients = getIngredientsFromRecipe(recipe);
    if (ingredients) {
      const fillings = ingredients.fillings;
      const condiments = ingredients.condiments;
      const tempHasBread = ingredients.hasBread;

      if (fillings.length > MAX_FILLINGS || condiments.length > MAX_CONDIMENTS) {
        setMegaSandwichMode(true);
      }

      setHasBread(Boolean(tempHasBread));
      setActiveFillings(fillings);
      setActiveCondiments(condiments);
    }
  };

  const renderSettings = () => {
    return (
      <div className="settings-bar">
        <button className="button-spacing"
          onClick={() => setSimpleMode(!simpleMode)}>{ts("Toggle Simple Mode")}: {simpleMode ? ts("On") : ts("Off")}</button>
        <button className="button-spacing" onClick={() => setShowSearchPanel(!showSearchPanel)}>{ts("Toggle Search Panel")}</button>
        {!simpleMode && <button className="button-spacing"
          onClick={() => setShowEffectFilter(!showEffectFilter)}>{ts("Toggle Effect Filter")}</button>}
        <button className="button-spacing"
          onClick={() => setMegaSandwichMode(!megaSandwichMode)}>
            {ts("Toggle Multiplayer Mode")}: {megaSandwichMode ? ts("On") : ts("Off")}</button>
        {/* {<button className="button-spacing" onClick={() => loadRecipe()}>{ts("Load Recipe")}</button>} */}
        {activeFillings.length > 0 && activeCondiments.length > 0 &&
          <button className="button-spacing" onClick={() => getShareUrl()}>{ts("Share Recipe")}</button>}
      </div>
    );
  };

  const renderLanguage = language => {
    return (
      <small key={`lang-${language[0]}`} className="language-link" onClick={() => changeLanguage(language[0])}>{language[1]}</small>
    );
  };

  const renderFooter = () => {
    const languages = Object.entries(LANGUAGE_NAMES).map(x => x).filter(x => x[0] !== LANGUAGE);

    return (
      <div style={{ marginBottom: "1em" }}>
        <small><a href="https://github.com/cecilbowen/pokemon-sandwich-simulator">{ts("Source Code")}</a></small>
        <span style={{ paddingLeft: '4px' }}>|</span>
        {languages.map(x => renderLanguage(x))}
        <span style={{ paddingLeft: '4px', paddingRight: '4px' }}>|</span>
        <small><a href="https://birbzone.com/sandwich/">{ts("Calculator")}</a></small>
      </div>
    );
  };

  const windowUrl = window.location.search;
  const params = new URLSearchParams(windowUrl);
  useEffect(() => {
    const urlRecipe = params.get('recipe');
    if (urlRecipe) {
      loadRecipe(urlRecipe);
    }
  }, []);

  return (
    <div className="App">
      {!simpleMode && showEffectFilter && renderComplexSearch()}
      {renderFillings()}
      {renderCondiments()}
      {renderActive()}
      {renderMath()}
      {renderSearch()}
      {renderSettings()}
      {renderFooter()}
    </div>
  );
};

export default App;
