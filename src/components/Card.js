// import { useEffect, useState } from 'react';
import { calculatePowerAmount, getIngredientImage } from '../util';
import { ALIAS_TO_FULL, COLORS, FLAVOR_TABLE_EZ, mode, ts,
    isFilling, isFlavor, isPower, isType, shadeColor
} from '../util';
import TYPES from '../data/types.json';
import POWERS from '../data/powers.json';
import FLAVORS from '../data/flavors.json';
import FILLINGS from '../data/fillings.json';
import PropTypes from "prop-types";
import DPOINTS from "../helper/deliciousness-poketype-points.json";
import { USE_SEREBII } from '../App';

const Card = ({
    ingredient, number, sums, mods, detail, stars,
    simpleMode, updatePieces, onClickBubble, onClick, activeKey
}) => {
    const isSum = sums !== undefined;
    sums = sums || {};

    const tastes = (sums.tastes || ingredient.tastes).sort((a, b) => {
      return b.amount - a.amount || FLAVORS.indexOf(a.flavor) - FLAVORS.indexOf(b.flavor);
    });
    const powers = (sums.powers || ingredient.powers).sort((a, b) => {
      const aType = ALIAS_TO_FULL[a.type];
      const bType = ALIAS_TO_FULL[b.type];
      return b.amount - a.amount || POWERS.indexOf(aType) - POWERS.indexOf(bType);
    });
    const types = (sums.types || ingredient.types).sort((a, b) => {
      return b.amount - a.amount || TYPES.indexOf(a.type) - TYPES.indexOf(b.type);
    });

    const tastesSum = tastes.map(x => x.amount).reduce((partialSum, a) => partialSum + a, 0);
    const powersSum = powers.map(x => x.amount).reduce((partialSum, a) => partialSum + a, 0);
    const typesSum = types.map(x => x.amount).reduce((partialSum, a) => partialSum + a, 0);

    const sumStr = `${tastesSum}\n${powersSum}\n${typesSum}`;

    const onSelectBubble = key => {
        if (onClickBubble) {
            onClickBubble(key);
        }
    };

    const renderKeyValue = (kv, id) => {
        const key = kv.type || kv.flavor;
        const value = isSum ? kv.amount : calculatePowerAmount(kv.amount, ingredient, kv);
        const backgroundColor = COLORS[key];
        let backgroundImage = "";
        let borderColor = backgroundColor;
        let className = "bubble fake-border";

        const strValue = val => {
            const cat = mods?.skills[kv.type] ? "skills" : "types";
            const accessor = mods?.[cat];

            if (!accessor) {
                return val;
            }

            const modVal = accessor[kv.type];
            const sign = modVal > 0 ? "+" : "-";
            if (modVal) {
                return `${val} (${val - modVal} ${sign} ${Math.abs(modVal)})`;
            }

            return val;
        };

        if (activeKey && Object.values(activeKey).indexOf(key) !== -1) {
            className = "bubble key-selected";
            borderColor = "black";
        }

        if (isType(key)) {
            className += " bubble-type";
        }

        if (isFlavor(key)) {
            backgroundImage = `-webkit-linear-gradient(100deg, ${shadeColor(backgroundColor)} 30%, ${backgroundColor} 50%)`;
        }

        return <div className={className} style={{ backgroundColor, borderColor, backgroundImage }} key={id}
            onClick={() => onSelectBubble(key)}>
            <div>{ts(key)}:</div>
            <div style={{ marginLeft: "10px" }}>{strValue(value)}</div>
        </div>;
    };

    const renderAllTypes = () => {
        const backgroundColor = COLORS["All Types"];

        return <div className="bubble bubble-type" style={{ backgroundColor }}>
            <div>{ts("All Types")}:</div>
            <div style={{ marginLeft: "10px" }}>{calculatePowerAmount(types[0].amount, ingredient, types[0])}</div>
        </div>;
    };

    const renderAllOtherTypes = () => {
        const backgroundColor = COLORS["All Other Types"];
        const common = mode(types, 'amount', true, true);
        const toRender = types.filter(x => x.amount !== common);

        return <div className="bubble-row">
            {toRender.map((x, i) => renderKeyValue(x, i))}
            <div className="bubble bubble-type" style={{ backgroundColor }}>
                <div>{ts("All Other Types")}:</div>
                <div style={{ marginLeft: "10px" }}>{common}</div>
            </div>
        </div>;
    };

    const shouldRenderAllTypes = types.length === 18 && types.filter(x => x.amount !== types[0].amount).length === 0;
    const shouldRenderAllOtherTypes = types.length === 18 && !shouldRenderAllTypes;
    const defaultRender = !shouldRenderAllTypes && !shouldRenderAllOtherTypes;

    let borderColor = "black";
    let backgroundColor = "";
    if (ingredient) {
        if (isFilling(ingredient)) {
            borderColor = "red";
            backgroundColor = "#ff000021";
        } else {
            borderColor = "blue";
            backgroundColor = "#0000ff24";
        }
    }

    const showStats = isSum || detail;

    const modifyPieces = mod => {
        const maxPieces = FILLINGS.slice(0).filter(x => x.name === ingredient.name)[0].pieces;
        let tempPieces = ingredient.pieces + mod;
        if (tempPieces > maxPieces) { tempPieces = maxPieces; }
        if (tempPieces < 0) { tempPieces = 0; }
        ingredient.pieces = tempPieces;
        updatePieces();
    };

    const flavorComboStr = FLAVOR_TABLE_EZ[activeKey.power];
    const activeLabel = mods?.skills[activeKey.power] === 100 ? `(${ts("active")})` : "";
    const powerExplain = isPower(activeKey.power) ? `+100 ${ts(activeKey.power)}: ${ts(flavorComboStr)} ${activeLabel}` : "";
    const powerExplainDisplay = flavorComboStr ? "" : "none";
    const powerExplainTitle = ts("What flavor combo ordering boosts this power");

    const typeBoost = DPOINTS[(stars || 2) - 1];
    const typeSign = typeBoost > 0 ? "+" : "-";
    const typeExplain = isType(activeKey.type) ?
        `${typeSign}${Math.abs(typeBoost)}: ${ts(activeKey.type)} ★` : "";
    const typeIsIn = types.map(x => x.type).includes(activeKey.type || "3");
    const typeExplainDisplay = activeKey.type && typeIsIn && typeBoost !== 0 ? "" : "none";
    const typeExplainTitle = ts("Star level type modifier");

    return (
      <div
        key={number ? `card-${number}` : ""} className="card"
        id={isSum ? 'total-stats-card' : ''}
        style={{ borderColor, backgroundColor, alignSelf: "center", position: "relative" }}>
        {!isSum && <div className="bubble bubble-header" onClick={onClick}>
            <img alt={ts(ingredient.name)} src={USE_SEREBII ? ingredient.imageUrl : getIngredientImage(ingredient.name)} />
            <div>{ts(ingredient.name)}</div>
        </div>}
        {isSum && <div className="bubble bubble-header">
            <img alt={"Total"} src="https://www.serebii.net/itemdex/sprites/sandwich.png" title={sumStr} />
            <div className="total-stats">{ts("Total Stats")}</div>
            <div id="desc-container">
                <div id="power-flavors-description"
                    title={powerExplainTitle} style={{ display: powerExplainDisplay }}>{powerExplain}</div>
                <div id="type-flavors-description"
                    title={typeExplainTitle} style={{ display: typeExplainDisplay }}>{typeExplain}</div>
            </div>
        </div>}
        {!isSum && ingredient && isFilling(ingredient) && <div className="pieces">
            <div title={ts('How many pieces of this filling to put on sandwich')}>{ts("Pieces")}: {ingredient.pieces}</div>
            <button className="piece-button" onClick={() => modifyPieces(-1)}>-</button>
            <button className="piece-button" onClick={() => modifyPieces(1)}>+</button>
        </div>}
        {showStats && <div className="bubble-row">{tastes.map((x, i) => renderKeyValue(x, i))}</div>}
        {showStats && <div className="bubble-row">{powers.map((x, i) => renderKeyValue(x, i))}</div>}
        {showStats && <div className="bubble-row">
            {shouldRenderAllTypes && renderAllTypes()}
            {shouldRenderAllOtherTypes && renderAllOtherTypes()}
            {defaultRender && types.map((x, i) => renderKeyValue(x, i))}
        </div>}
        {/* !isSum && <button className='expand-button' onClick={onClick}></button>*/}
        {number !== undefined && <div className="numbering">{number + 1}</div>}
        {!isSum && !simpleMode &&
            <div className="expand-help" onClick={onClick}>{showStats ? ts("Click to minimize") : ts("expand")}</div>}
      </div>
    );
};

Card.propTypes = {
  ingredient: PropTypes.object,
  number: PropTypes.number,
  sums: PropTypes.object,
  mods: PropTypes.object,
  fillings: PropTypes.array,
  condiments: PropTypes.array,
  simpleMode: PropTypes.bool,
  detail: PropTypes.bool,
  updatePieces: PropTypes.func,
  onClickBubble: PropTypes.func,
  onClick: PropTypes.func,
  activeKey: PropTypes.object,
  stars: PropTypes.number
};
export default Card;