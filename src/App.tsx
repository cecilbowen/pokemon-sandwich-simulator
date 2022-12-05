import SANDWICHES from "./data/sandwiches.json";
import FILLINGS from "./data/fillings.json";
import CONDIMENTS from "./data/condiments.json";
import POWERS from "./data/powers.json";
import { useEffect, useState } from "react";
import {
  areEqual,
  getCondiments,
  getFillings,
  ALIAS_TO_FULL,
  COLORS,
  oneTwoFirst,
  getIngredientsSums,
  craftSandwich,
  copyTextToClipboard,
  hasRelevance,
  getCategory,
  getIngredientsFromRecipe,
} from "./util";
import { runTests } from "./test/tests";
import Card from "./components/Card";
import "./App.css";
import React from "react";

// per player
const MAX_FILLINGS = 6;
const MAX_CONDIMENTS = 4;
const DISABLE_ALERTS = false;
let NUM_PLAYERS = 1;

function App() {
  const [advancedIngredients, setAdvancedIngredients] =
    useState<boolean>(false);
  const [alwaysShowCustomSandwich, setAlwaysShowCustomSandwich] =
    useState<boolean>(false);
  const [simpleMode, setSimpleMode] = useState<boolean>(true);
  const [showSearchPanel, setShowSearchPanel] = useState<boolean>(true);
  const [megaSandwichMode, setMegaSandwichMode] = useState<boolean>(false);

  const [activeFillings, setActiveFillings] = useState<any[]>([]);
  const [activeCondiments, setActiveCondiments] = useState<any[]>([]);
  const [activeKey, setActiveKey] = useState<any>({});
  const [searchNameQuery, setSearchNameQuery] = useState<any>();
  const [searchEffectQuery, setSearchEffectQuery] = useState<any>();
  const [searchTypeQuery, setSearchTypeQuery] = useState<any>();
  const [searchIngredientQuery, setSearchIngredientQuery] = useState<any>();
  const [results, setResults] = useState<any>([]);
  const [heartbeat, setHeartbeat] = useState<any>(0);
  let activeSandwich: any = undefined;
  let activeSums;

  useEffect(() => {
    if (!megaSandwichMode) {
      const tempFillings = activeFillings.slice(
        0,
        Math.min(activeFillings.length, MAX_FILLINGS)
      );
      const tempCondiments = activeCondiments.slice(
        0,
        Math.min(activeCondiments.length, MAX_CONDIMENTS)
      );
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
    const tempResults: any[] = [];

    let sandwichList: any[] = [];
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
          if (
            !s.effects.filter(
              (x) => x.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
            )[0]
          ) {
            hasAllQueries = false;
          }
        }
      }

      if (searchTypeQuery) {
        for (const rawQuery of searchTypeQuery) {
          const query = rawQuery.trim();
          if (
            !s.effects.filter(
              (x) => x.type.toLowerCase().indexOf(query.toLowerCase()) !== -1
            )[0]
          ) {
            hasAllQueries = false;
          }
        }
      }

      if (searchIngredientQuery) {
        for (const rawQuery of searchIngredientQuery) {
          const query = rawQuery.trim();
          const ingredients = [...s.fillings, ...s.condiments];
          if (
            !ingredients.filter(
              (x) => x.toLowerCase().indexOf(query.toLowerCase()) !== -1
            )[0]
          ) {
            hasAllQueries = false;
          }
        }
      }

      if (hasAllQueries) {
        tempResults.push(s);
      }
    }

    setResults(tempResults);
  }, [
    searchNameQuery,
    searchEffectQuery,
    searchTypeQuery,
    searchIngredientQuery,
  ]);

  useEffect(() => {
    if (activeSandwich) {
      const activeSandwichElement = document.getElementById(
        `sandwich-${activeSandwich}`
      );
      if (activeSandwichElement) {
        activeSandwichElement.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
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
      <div className="filling-bkg">
        {/* Mismatching parameter to look into */}
        {/*// @ts-ignore*/}
        {FILLINGS.map((x, i) => renderFilling(x, i))}
      </div>
    );
  };

  const renderFilling = (filling, index, active) => {
    let className = "ingredient";
    if (active) {
      className += " filling-portrait";
    }

    let divClass = "ingredient-div";
    if (!active && !hasRelevance(filling, activeKey)) {
      divClass = "ingredient-div ingredient-blur";
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
              if (tempActiveFillings.length >= MAX_FILLINGS * NUM_PLAYERS) {
                return;
              }
              tempActiveFillings.push({
                // done this way to avoid modifying base array
                ...filling,
              });
            }

            setActiveFillings(tempActiveFillings);
          }}
        />
        {active && <div className="numbering numbering-icon">{index + 1}</div>}
      </div>
    );
  };

  const renderCondiments = () => {
    return (
      <div className="condiment-bkg">
        {/* Mismatching parameter to look into */}
        {/*// @ts-ignore*/}
        {CONDIMENTS.map((x, i) => renderCondiment(x, i))}
      </div>
    );
  };

  const renderCondiment = (condiment, index, active) => {
    let className = "ingredient";
    if (active) {
      className += " condiment-portrait";
    }

    let divClass = "ingredient-div";
    if (!active && !hasRelevance(condiment, activeKey)) {
      divClass = "ingredient-div ingredient-blur";
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
              if (tempActiveCondiments.length >= MAX_CONDIMENTS * NUM_PLAYERS) {
                return;
              }
              tempActiveCondiments.push(condiment);
            }
            setActiveCondiments(tempActiveCondiments);
          }}
        />
        {active && (
          <div className="numbering numbering-icon">
            {index + activeFillings.length + 1}
          </div>
        )}
      </div>
    );
  };

  const renderActive = () => {
    return (
      <div className="active-ingredients-bkg">
        {activeFillings.map((x, i) => renderFilling(x, i, true))}
        {activeCondiments.map((x, i) => renderCondiment(x, i, true))}
      </div>
    );
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
        <div
          className="bubble chain-a"
          style={{ backgroundColor: powerColor }}
        >{`${effect.name}: `}</div>
        <div
          className="bubble chain-b"
          style={{
            backgroundColor: typeColor,
            display: effect.type === "" ? "none" : "",
          }}
        >{`${effect.type} `}</div>
        <div
          className="bubble chain-c"
          style={{ backgroundColor: levelColor }}
        >{`Lv. ${effect.level}`}</div>
      </div>
    );
  };

  const renderSandwich = (sandwich) => {
    if (!sandwich) {
      return null;
    }

    return (
      <div className="card" style={{ display: "flex" }}>
        <img
          alt={sandwich.name}
          src={sandwich.imageUrl}
          style={{ width: "100px" }}
        />
        <div>
          <div
            className="bubble bubble-header"
            onClick={() => {
              // @ts-ignore
              if (window.event.ctrlKey) {
                runTests();
              }
            }}
            style={{ backgroundColor: "tan" }}
          >
            #{sandwich.number} - {sandwich.name}
          </div>
          <div>
            {sandwich.effects.map((x, i) => renderSandwichBubble(x, i))}
          </div>
        </div>
      </div>
    );
  };

  const toggleActiveKey = (key) => {
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
      ...activeCondiments.sort((a, b) => a.name.localeCompare(b.name)),
    ];
    const sums = getIngredientsSums(ingredients);

    // check if sums make it a preset sandwich
    let foundSandwich;
    for (const sandwich of SANDWICHES) {
      const sandwichIngredients = [
        ...sandwich.fillings,
        ...sandwich.condiments,
      ];
      if (
        areEqual(
          ingredients.map((x) => x.name),
          sandwichIngredients
        ) &&
        areEqual(
          activeFillings.map((x) => x.pieces),
          getFillings(sandwich.fillings).map((x) => x.pieces)
        )
      ) {
        foundSandwich = sandwich;
        activeSandwich = sandwich.number;
        break;
      }
    }

    // if it is a preset sandwich, throw out all the sums and just copy the preset sandwich
    let pass = true;
    if (foundSandwich) {
      const tempPowers = sums.powers
        .slice(0)
        .sort((a, b) => {
          const aType = ALIAS_TO_FULL[a.type];
          const bType = ALIAS_TO_FULL[b.type];
          return (
            b.amount - a.amount || POWERS.indexOf(aType) - POWERS.indexOf(bType)
          );
        })
        .filter((x) => x.type !== "Sparkling");
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
    const generatedSandwich = craftSandwich(
      activeFillings,
      activeCondiments,
      sums,
      foundSandwich
    );

    return (
      <div style={{ backgroundColor: pass ? "" : "red" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {ingredients.map((x, i) => (
            <Card
              ingredient={x}
              number={i}
              fillings={activeFillings}
              simpleMode={simpleMode}
              updatePieces={() => pulse()}
              onClickBubble={(key) => toggleActiveKey(key)}
              activeKey={activeKey}
              onClick={() => {
                if (!simpleMode) {
                  setAdvancedIngredients(!advancedIngredients);
                }
              }}
              condiments={activeCondiments}
              detail={!simpleMode && advancedIngredients}
            />
          ))}
          {!advancedIngredients && <br className="page-break" />}
          {activeCondiments.length > 0 && !simpleMode && (
            <Card
              sums={sums}
              activeSandwich={activeSandwich}
              fillings={activeFillings}
              condiments={activeCondiments}
              detail={!simpleMode && advancedIngredients}
              onClickBubble={(key) => toggleActiveKey(key)}
              activeKey={activeKey}
            />
          )}
        </div>
        <div className="bubble-row" style={{ justifyContent: "center" }}>
          {renderSandwich(foundSandwich)}
          {activeCondiments.length > 0 &&
            (alwaysShowCustomSandwich || !foundSandwich) &&
            renderSandwich(generatedSandwich)}
        </div>
      </div>
    );
  };

  const renderSearchBubble = (sandwich, key) => {
    const highlight = activeSandwich && sandwich.number === activeSandwich;
    const isWeird = oneTwoFirst.filter((x) => x === sandwich.number)[0];
    const foodCombo = [...sandwich.fillings, ...sandwich.condiments];
    const hasMultiIngredients =
      foodCombo.length !== Array.from(new Set(foodCombo)).length;

    return (
      <div
        className="bubble"
        key={key}
        id={`sandwich-${sandwich.number}`}
        onClick={() => {
          const condiments = getCondiments(sandwich.condiments);
          const fillings = getFillings(sandwich.fillings);
          setActiveKey({});

          setActiveCondiments(condiments);
          setActiveFillings(fillings);
        }}
        style={{
          backgroundColor: highlight ? "yellow" : "#80808030",
          fontWeight: isWeird ? "bold" : "",
          color: hasMultiIngredients ? "" : "",
        }}
      >
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
    if (!showSearchPanel) {
      return null;
    }

    return (
      <div className="search-panel">
        <div className="search-bars-div">
          <input
            type="text"
            id="nameSearch"
            placeholder="Search names"
            className="search-bar"
            onChange={(ev) => search(ev, "name")}
            style={{ width: "250px" }}
          />
          <input
            type="text"
            id="effectSearch"
            placeholder="Search effects (egg, raid, etc)"
            className="search-bar"
            onChange={(ev) => search(ev, "effect")}
            style={{ width: "250px" }}
          />
          <input
            type="text"
            id="typeSearch"
            placeholder="Search types (normal, dark, etc)"
            className="search-bar"
            onChange={(ev) => search(ev, "type")}
            style={{ width: "250px" }}
          />
          <input
            type="text"
            id="ingredientSearch"
            placeholder="Search ingredients (ham, bacon, etc)"
            className="search-bar"
            onChange={(ev) => search(ev, "ingredient")}
            style={{ width: "250px" }}
          />
        </div>
        <div className="search-results-div">
          <div
            className="bubble-row"
            style={{ overflow: "auto", flexWrap: "nowrap" }}
          >
            {results.map((x, i) => renderSearchBubble(x, i))}
          </div>
        </div>
      </div>
    );
  };

  const saveRecipe = () => {
    if (activeCondiments.length === 0) {
      return;
    }

    const fArr: any[] = [];
    for (const f of activeFillings) {
      fArr.push(`${f.name}-${f.pieces}`);
    }

    const copyStr = `${fArr.join(",")}_${activeCondiments
      .map((x) => x.name)
      .join(",")}`;
    console.log("Saving recipe", copyStr);
    copyTextToClipboard(copyStr);

    if (!DISABLE_ALERTS) {
      alert("Copied recipe to clipboard!\n" + copyStr);
    }
  };

  const loadRecipe = () => {
    const recipe = window.prompt("Enter/paste recipe:", "");
    const ingredients = getIngredientsFromRecipe(recipe);
    if (ingredients) {
      const fillings = ingredients.fillings;
      const condiments = ingredients.condiments;

      if (
        fillings.length > MAX_FILLINGS ||
        condiments.length > MAX_CONDIMENTS
      ) {
        setMegaSandwichMode(true);
      }

      setActiveFillings(fillings);
      setActiveCondiments(condiments);
    }
  };

  const renderSettings = () => {
    return (
      <div className="settings-bar">
        <button
          className="button-spacing"
          onClick={() => setSimpleMode(!simpleMode)}
        >
          Toggle Simple Mode: {simpleMode ? "On" : "Off"}
        </button>
        <button
          className="button-spacing"
          onClick={() => setShowSearchPanel(!showSearchPanel)}
        >
          Toggle Search Panel
        </button>
        <button
          className="button-spacing"
          onClick={() => setMegaSandwichMode(!megaSandwichMode)}
        >
          Toggle Multiplayer Mode: {megaSandwichMode ? "On" : "Off"}
        </button>
        <button className="button-spacing" onClick={() => loadRecipe()}>
          Load Recipe
        </button>
        <button className="button-spacing" onClick={() => saveRecipe()}>
          Save Recipe
        </button>
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
      <small>
        <a href="https://github.com/cecilbowen/pokemon-sandwich-simulator">
          Source Code
        </a>
      </small>
    </div>
  );
}

export default App;
