import React, { useEffect, useState } from "react";
import {
    ts, fillToThree, getIngredientsFromRecipe, sandwichRecipeResultToEffects,
    getPowerImage, COLORS
} from "../util";
import { recipesToSandwichesLite, testsToSandwichesLite } from '../tests/tests';
import { getSandwich } from "../helper/helper";
import PropTypes from "prop-types";
import POWERS from '../data/powers.json';
import POWERS_SHORT from '../data/powers-short.json';
import TYPES from '../data/types.json';
import SANDWICHES from '../data/sandwiches.json';
import C1 from '../data/community/encounter-2-and-shinies.json';
import C2 from '../data/community/raid-level-2.json';
import C3 from '../data/community/misc-missing.json';
import C4 from '../data/community/auto-gen-level-3.json';
import ScrollFlexWrapper from "./ScrollFlexWrapper";
// import GENNED_RECIPES_1 from '../gen/random_test.json';

const SearchPanel = ({ enabled, activeSandwichId, loadSandwich, pulse }) => {
    // const [bank, setBank] = useState(BANK.DEFAULT); // todo: prob default to custom
    const [showSavedRecipes, setShowSavedRecipes] = useState(false);
    const [currentPower, setCurrentPower] = useState('');
    const [currentType, setCurrentType] = useState('');
    const [currentLevel, setCurrentLevel] = useState(1);
    const [searchCriteria, setSearchCriteria] = useState([]); // array of { power, type, level }
    const [noHerbaFilter, setNoHerbaFilter] = useState(false);

    const [powers, setPowers] = useState([]);
    const [types, setTypes] = useState([]);
    const levels = [1, 2, 3];

    const includeTestsInSearch = true;
    const [sandwiches, setSandwiches] = useState([]);
    const [customSandwiches, setCustomSandwiches] = useState([]);
    const [exactLevelsOnly, setExactLevelsOnly] = useState(false); // ignores higher level, same effect sandwiches if true
    const [filteredSandwiches, setFilteredSandwiches] = useState(sandwiches);
    const [untouched, setUntouched] = useState(true);
    const [internalPulse, setInternalPulse] = useState(1);
    const [pause, setPause] = useState(false);

    const TEST_SANDWICHES = [...testsToSandwichesLite(
        // [{
        //     name: "random",
        //     set: GENNED_RECIPES_1
        // }]
    )];

    const COMMUNITY_SANDWICHES = [...recipesToSandwichesLite(
        [...C1, ...C2, ...C3, ...C4]
    )];

    const pullSandwiches = () => {
        const pulledSandwiches = localStorage.getItem("bank-sandwiches");
        const mySandwiches = [];
        if (pulledSandwiches) {
            const mine = JSON.parse(pulledSandwiches);
            for (let i = 0; i < mine.length; i++) {
                const s = mine[i];
                const ingredients = getIngredientsFromRecipe(s.recipe);

                if (!ingredients) { continue; }
                const sandwich = {
                    ...ingredients,
                    effects: sandwichRecipeResultToEffects(s.result),
                    lite: true,
                    mine: true
                };

                mySandwiches.push({
                    ...sandwich,
                    id: s.id,
                    // number: "???",
                    name: s.name
                });
            }
            setCustomSandwiches(mySandwiches);
            return mySandwiches;
        }

        console.warn("Failed to pull saved sandwiches!");
        return [];
    };

    const prepareSandwiches = () => {
        const mySandwiches = pullSandwiches();

        // number sandwiches
        const tempSandwiches = [
            ...SANDWICHES, ...includeTestsInSearch ? TEST_SANDWICHES : [],
            ...COMMUNITY_SANDWICHES,
            ...mySandwiches
        ];
        let highestNumber = 0;
        for (const s of tempSandwiches) {
            if (s.number) {
                highestNumber = Math.max(highestNumber, s.number);
            } else {
                highestNumber++;
                s.number = highestNumber;
            }
        }
        setSandwiches(tempSandwiches);
    };

    const updateFilteredSandwiches = () => {
        if (sandwiches.length > 0 && !pause) {
            let showSaved = showSavedRecipes;
            if (searchCriteria.length > 0) {
                setUntouched(false);
                setShowSavedRecipes(false);
                showSaved = false;
            }

            const shownSet = showSaved ? customSandwiches : SANDWICHES;
            const sandwichSet = searchCriteria.length > 0 ? sandwiches : shownSet;
            const tempSandwiches = [...sandwichSet].filter(s => {
                let pass = true;
                for (const criteria of searchCriteria) {
                    const matchType = criteria.power === "Egg Power" ? "" : criteria.type;
                    let anyMatch = false;
                    const validLevels = exactLevelsOnly ? [criteria.level] : fillToThree(criteria.level);
                    for (const effect of s.effects) {
                        if (effect.name === criteria.power && effect.type === matchType && validLevels.includes(effect.level)) {
                            const condiStr = s.condiments.map(x => x.name ?? x).join("").toLowerCase();
                            if (!noHerbaFilter || !condiStr.includes("herba")) {
                                anyMatch = true;
                            }
                        }
                    }
                    if (!anyMatch) {
                        pass = false;
                        break;
                    }
                }

                return pass;
            });
            setFilteredSandwiches(tempSandwiches);
        }
    };

    useEffect(() => {
        setFilteredSandwiches(SANDWICHES);
        const tempPowers = [...POWERS];
        const tempTypes = [...TYPES];

        tempPowers.sort();
        tempTypes.sort();
        setPowers(tempPowers);
        setTypes(tempTypes);
        setCurrentPower(tempPowers[0]);
        setCurrentType(tempTypes[0]);

        prepareSandwiches();
    }, []);

    useEffect(() => {
        if (filteredSandwiches.length > 0) {
            prepareSandwiches();
        }
    }, [pulse, internalPulse]);

    useEffect(() => {
        updateFilteredSandwiches();
    }, [searchCriteria, sandwiches, noHerbaFilter]);

    useEffect(() => {
        if (pause) {
            setSearchCriteria([]);
        }
    }, [pause]);

    useEffect(() => {
        if (showSavedRecipes) {
            setUntouched(false);
            setSearchCriteria([]);
        }
    }, [showSavedRecipes]);

    const updateSearchCriteria = () => {
        const cType = currentPower === "Egg" ? '' : currentType; // since type doesn't matter for egg power
        const criteria = [...searchCriteria].filter(x =>
            !(currentPower === "Egg Power" && x.power === currentPower) &&
            !(x.power === currentPower)
        );

        criteria.push({
            power: currentPower,
            type: cType,
            level: currentLevel
        });
        setSearchCriteria(criteria);
    };

    const removeSearchCriteria = bye => {
        const criteria = [...searchCriteria].filter(x => !(x.power === bye.power && x.type === bye.type && x.level === bye.level));
        setSearchCriteria(criteria);
    };

    const deploySandwich = sandwich => {
        const mySecretSandwichNumber = sandwich.number;
        const sendSandwich = sandwich.lite ? getSandwich(sandwich) : sandwich;
        sendSandwich.number = mySecretSandwichNumber;
        loadSandwich(sendSandwich);
    };

    if (!enabled) { return null; }

    const filterMultiTypes = (herba = true) => {
        if (sandwiches.length === 0) { return; }
        setPause(true);
        const tempSandwiches = [...sandwiches];
        const ret = [];
        for (const s of tempSandwiches) {
            const condiJoin = s.condiments.map(x => x.name).join("").includes("Herba");
            if (condiJoin && !herba) { continue; }
            const myTypes = s.effects.map(x => x.type);
            const removeDupes = Array.from(new Set([...myTypes]));
            if (myTypes.length !== removeDupes.length) {
                ret.push(s);
            }
        }

        if (ret.length > 0) {
            setFilteredSandwiches(ret);
            setUntouched(false);
            setShowSavedRecipes(false);
        }
        setPause(false);
    };

    const deleteSavedSandwich = sandwich => {
        const pulledSandwiches = localStorage.getItem("bank-sandwiches");
        if (pulledSandwiches) {
            const mine = JSON.parse(pulledSandwiches);

            if (!sandwich.id) {
                console.error("Saved sandwich has no id!", sandwich);
                return;
            }

            const ret = mine.filter(x => x.id !== sandwich.id);
            localStorage.setItem("bank-sandwiches", JSON.stringify(ret));
            setInternalPulse(internalPulse + 1);
        }
    };

    const renderSearchBubble = (sandwich, key) => {
        const highlight = activeSandwichId !== undefined && sandwich.number === activeSandwichId;
        const foodCombo = [...sandwich.fillings, ...sandwich.condiments];
        const hasMultiIngredients = foodCombo.length !== Array.from(new Set(foodCombo)).length;
        const cls = highlight ? 'bubble highlighted' : 'bubble dim';

        const numStr = `#${sandwich.number} - `;

        return (
            <div className={cls} key={key} id={`sandwich-${sandwich.number}${sandwich.id ?? ""}`}
                onClick={() => deploySandwich(sandwich)} style={{
                    color: hasMultiIngredients ? "" : ""
                }}>
                {`${sandwich.id ? "" : numStr}${sandwich.id ? sandwich.name : ts(sandwich.name)}`}
            </div>
        );
    };

    const renderIconPanel = basic => {
        if (basic) {
            return <div className="icon-panel-wrapper">
                <div className="icon-panel-old">
                    {filteredSandwiches.length === 0 && !untouched &&
                        <div style={{ margin: "auto" }}>{ts("No results found")}</div>}
                    {filteredSandwiches.map(sandwich => {
                        const isPresetSandwich = !isNaN(sandwich.number);
                        const highlightMatch = isPresetSandwich ? sandwich.number : sandwich.id;
                        const highlight = activeSandwichId !== undefined && highlightMatch === activeSandwichId;
                        const num = !isPresetSandwich ? sandwich?.id : sandwich.number + 2;
                        const key = `${num}${sandwich.effects.map(x => `${x.name}${x.type}${x.level}`).join('')}`;
                        const icons = sandwich.effects.map(x => {
                            const longPower = x.name;
                            const longPowerIndex = POWERS.indexOf(longPower);
                            return POWERS_SHORT[longPowerIndex];
                        });
                        let cols = sandwich.effects.map(x => COLORS[x.type || "None"]);
                        if (cols.length === 0) {
                            cols = ["crimson", "transparent", "black"];
                        }
                        const background = `linear-gradient(to bottom right, ${cols[0]} 30%, ${cols[1]} 50%, ${cols[2]} 80%)`;
                        return <div
                            key={key}
                            title={sandwich.name ?? ""}
                            className={`power-icons ${highlight ? "icon-outline" : ""}`} style={{ background }}
                            onClick={ev => {
                                if (ev.target.closest(".delete-sandwich-icon")) {
                                    ev.preventDefault(); // prevent clickthrough if clicked on delete icon
                                    return;
                                }

                                deploySandwich(sandwich);
                            }}>
                            {icons.map((iconName, i) =>
                                <img key={iconName} className={`pi power-icon-${i + 1}`}
                                    src={getPowerImage(iconName)} />
                            )}
                            {sandwich.mine && <span className="delete-sandwich" onClick={() => deleteSavedSandwich(sandwich)}
                                alt={ts("Delete sandwich")} title={ts("Delete sandwich")}>
                                <svg className="delete-sandwich-icon" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path>
                                </svg>
                            </span>}
                        </div>;
                    })}
                </div>
            </div>;
        }

        return <ScrollFlexWrapper containerCls="icon-panel-container" innerCls="icon-panel">
            {filteredSandwiches.map(sandwich => {
                const highlight = activeSandwichId !== undefined && sandwich.number === activeSandwichId;
                const num = isNaN(sandwich.number) ? 0 : sandwich.number + 2;
                const icons = sandwich.effects.map(x => {
                    const longPower = x.name;
                    const longPowerIndex = POWERS.indexOf(longPower);
                    return POWERS_SHORT[longPowerIndex];
                });
                let cols = sandwich.effects.map(x => COLORS[x.type || "None"]);
                if (cols.length === 0) {
                    cols = ["crimson", "transparent", "black"];
                }
                const background = `linear-gradient(to bottom right, ${cols[0]} 30%, ${cols[1]} 50%, ${cols[2]} 80%)`;
                return <div key={num} className={`power-icons ${highlight ? "icon-outline" : ""}`} style={{ background }}
                    onClick={() => deploySandwich(sandwich)}>
                    {icons.map((iconName, i) =>
                        <img key={iconName} className={`pi power-icon-${i + 1}`}
                            src={getPowerImage(iconName)} />
                    )}
                </div>;
            })}
        </ScrollFlexWrapper>;
    };

    return <div className="search-panel-new">
        <div className="active-search" style={searchCriteria.length === 0 ? { display: "none" } : {}}>
            {searchCriteria.map(criteria => {
                const type = criteria.power === "Egg Power" ? " " : ` ${ts(criteria.type)} `;
                return <div className="search-criteria" key={`${criteria.power}-${criteria.type}`}>
                    <span onClick={() => removeSearchCriteria(criteria)} className="search-delete-icon"
                        title={ts("Remove")}>⛔</span>
                    {`${ts(criteria.power)}${type}${ts("Lv.")} ${criteria.level}`}
                </div>;
            })}
        </div>
        <div className="search-dropdowns">
            <select id="powers-dd" value={currentPower} onChange={event => setCurrentPower(event.target.value)}>
                {powers.map(power =>
                    <option key={power} value={power}>
                        {ts(power)}
                    </option>
                )}
            </select>
            <select id="types-dd" value={currentType} onChange={event => setCurrentType(event.target.value)}>
                {types.map(type =>
                    <option key={type} value={type}>
                        {ts(type)}
                    </option>
                )}
            </select>
            <select id="levels-dd" value={currentLevel} onChange={event => setCurrentLevel(parseInt(event.target.value, 10))}>
                {levels.map(level =>
                    <option key={level} value={level}>
                        {level}
                    </option>
                )}
            </select>
            <button disabled={searchCriteria.length >= 3}
                style={{ cursor: 'pointer', backgroundColor: "#e4b2e6", borderRadius: '4px' }}
                onClick={() => updateSearchCriteria()}>
                {ts("Search Effect")}
            </button>
            <div className="label-checkbox button-spacing" style={{ margin: '0px', userSelect: 'none' }}>
                <input type="checkbox" id={"no-herba"} name={"no-herba"}
                    checked={noHerbaFilter} onChange={() => setNoHerbaFilter(!noHerbaFilter)} />
                <label style={{ cursor: 'pointer' }} htmlFor={"no-herba"}>{`${ts("No")} ${ts("herba")}`}</label>
            </div>
        </div>
        <div className="search-options">
            <button onClick={() => {
                setSearchCriteria([]);
                setShowSavedRecipes(false);
            }}>{ts("Default Sandwiches")}</button>
            <button onClick={() => setShowSavedRecipes(true)}>{ts("My Recipes")}</button>
            <button onClick={() => filterMultiTypes(false)}>{ts("Multi-Type")}</button>
        </div>
        {untouched && <div className="info-div">
            {ts("Search existing, custom and community-provided sandwich recipes.")}
        </div>}
        {renderIconPanel(true)}
    </div>;
};

SearchPanel.propTypes = {
    loadSandwich: PropTypes.func.isRequired,
    enabled: PropTypes.bool,
    activeSandwichId: PropTypes.any,
    pulse: PropTypes.number
};
export default SearchPanel;
