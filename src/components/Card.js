// import { useEffect, useState } from 'react';
import { calculatePowerAmount } from '../util';
import { ALIAS_TO_FULL, COLORS, FLAVOR_TABLE_EZ, mode, ts,
    copyTextToClipboard, isFilling, isFlavor, isPower, isType, shadeColor
} from '../util';
import TYPES from '../data/types.json';
import POWERS from '../data/powers.json';
import FLAVORS from '../data/flavors.json';
import FILLINGS from '../data/fillings.json';
import SANDWICHES from '../data/sandwiches.json';

const Card = props => {
    const ingredient = props.ingredient;
    const isSum = props.sums !== undefined;
    const sums = props.sums || {};

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
        if (props.onClickBubble) {
            props.onClickBubble(key);
        }
    };

    const renderKeyValue = (kv, id) => {
        let key = (kv.type || kv.flavor);
        const value = isSum ? kv.amount : calculatePowerAmount(kv.amount, ingredient, kv);
        const backgroundColor = COLORS[key];
        let backgroundImage = "";
        let borderColor = backgroundColor;
        let className = "bubble fake-border";

        if (props.activeKey && Object.values(props.activeKey).indexOf(key) !== -1) {
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
            <div style={{ marginLeft: "10px" }}>{kv.modded ? `${value} (${value - 100} + 100)` : value}</div>
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
        
        return (<div className="bubble-row">
            {toRender.map((x, i) => renderKeyValue(x, i))}
            <div className="bubble bubble-type" style={{ backgroundColor }}>
                <div>{ts("All Other Types")}:</div>
                <div style={{ marginLeft: "10px" }}>{common}</div>
            </div>
        </div>);
    };

    const copyValues = (ta, p, ty) => {
        let sandwichStr = "";
        if (props.activeSandwich) {
            const s = SANDWICHES.filter(x => x.number === props.activeSandwich)[0];
            if (s) {
                sandwichStr = s.effects.map(x => `${x.name.split(" ")[0]} ${x.level}`).join(", ");
            }
        }
        const tasteStr = tastes.map(x => `${x.flavor} ${x.amount}`).join(", ");
        const powerStr = powers.map(x => `${x.type} ${x.amount}`).join(", ");


        copyTextToClipboard(` - ${tasteStr}\n     ${powerStr}\n     ${sandwichStr}`);
    };

    const shouldRenderAllTypes = types.length === 18 && types.filter(x => x.amount !== types[0].amount).length === 0;
    const shouldRenderAllOtherTypes = types.length === 18 && !shouldRenderAllTypes;
    const defaultRender = !shouldRenderAllTypes && !shouldRenderAllOtherTypes;

    let borderColor = "black";
    let backgroundColor = "white";
    if (ingredient) {
        if (isFilling(ingredient)) {
            borderColor = "red";
            backgroundColor = "#ff000021";
        } else {
            borderColor = "blue";
            backgroundColor = "#0000ff24";
        }        
    }

    const showStats = (isSum || props.detail);

    const modifyPieces = mod => {
        const maxPieces = FILLINGS.slice(0).filter(x => x.name === ingredient.name)[0].pieces;
        let tempPieces = ingredient.pieces + mod;
        if (tempPieces > maxPieces) { tempPieces = maxPieces; }
        if (tempPieces < 0) { tempPieces = 0; }
        ingredient.pieces = tempPieces;
        props.updatePieces();
    };

    const flavorComboStr = FLAVOR_TABLE_EZ[props?.activeKey.power];
    const powerExplain = isPower(props?.activeKey.power) ? `+100 ${ts(props.activeKey.power)}: ${ts(flavorComboStr)}` : "";
    const powerExplainDisplay = flavorComboStr ? "" : "none";
    const powerExplainTitle = ts("What flavor combo ordering boosts this power");

    return (
      <div
        key={props.number ? props.number : ""} className='card'
        style={{ borderColor, backgroundColor, alignSelf: "center", position: "relative" }}>
        {!isSum && <div className='bubble bubble-header' onClick={props?.onClick}>
            <img alt={ts(ingredient.name)} src={ingredient.imageUrl} />
            <div>{ts(ingredient.name)}</div>            
        </div>}
        {isSum && <div className='bubble bubble-header' onClick={() => copyValues(tastes, powers, types)}>
            <img alt={"Total"} src="https://www.serebii.net/itemdex/sprites/sandwich.png" title={sumStr} />
            <div>{ts("Total Stats")}</div>
            <div id='power-flavors-description' title={powerExplainTitle} style={{ display: powerExplainDisplay }}>{powerExplain}</div>
        </div>}
        {!isSum && ingredient && isFilling(ingredient) && <div className="pieces">
            <div title={ts('How many pieces of this filling to put on sandwich')}>{ts("Pieces")}: {ingredient.pieces}</div>
            <button className='piece-button' onClick={() => modifyPieces(-1)}>-</button>
            <button className='piece-button' onClick={() => modifyPieces(1)}>+</button>
        </div>}
        {showStats && <div className='bubble-row'>{tastes.map((x, i) => renderKeyValue(x, i))}</div>}
        {showStats && <div className='bubble-row'>{powers.map((x, i) => renderKeyValue(x, i))}</div>}
        {showStats && <div className='bubble-row'>
            {shouldRenderAllTypes && renderAllTypes()}
            {shouldRenderAllOtherTypes && renderAllOtherTypes()}
            {defaultRender && types.map((x, i) => renderKeyValue(x, i))}
        </div>}
        {/*!isSum && <button className='expand-button' onClick={props?.onClick}></button>*/}
        {props.number !== undefined && <div className='numbering'>{props.number + 1}</div>}
        {!isSum && !props.simpleMode && <div className='expand-help' onClick={props?.onClick}>{showStats ? ts("Click to minimize") : ts("expand")}</div>}
      </div>
    );
};

export default Card;