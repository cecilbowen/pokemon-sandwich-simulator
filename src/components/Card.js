import { useEffect, useState } from 'react';
import { calculatePowerAmount } from '../util';
import { ALIAS, ALIAS_FULL, COLORS, mode, copyTextToClipboard, isFilling } from '../util';
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
      const aType = ALIAS_FULL[ALIAS[a.type]]; // these alias are getting old..
      const bType = ALIAS_FULL[ALIAS[b.type]];
      return b.amount - a.amount || POWERS.indexOf(aType) - POWERS.indexOf(bType);
    });
    const types = (sums.types || ingredient.types).sort((a, b) => {
      return b.amount - a.amount || TYPES.indexOf(a.type) - TYPES.indexOf(b.type);
    });

    const tastesSum = tastes.map(x => x.amount).reduce((partialSum, a) => partialSum + a, 0);
    const powersSum = powers.map(x => x.amount).reduce((partialSum, a) => partialSum + a, 0);
    const typesSum = types.map(x => x.amount).reduce((partialSum, a) => partialSum + a, 0);

    const sumStr = `${tastesSum}\n${powersSum}\n${typesSum}`;

    const renderKeyValue = (kv, id) => {
        let key = (kv.type || kv.flavor);
        key = ALIAS[key] || key;
        const value = isSum ? kv.amount : calculatePowerAmount(kv.amount, ingredient, kv);
        const backgroundColor = COLORS[key];

        return <div className="bubble" style={{ backgroundColor }} key={id}>
            <div>{key}:</div>
            <div style={{ marginLeft: "10px" }}>{value}</div>
        </div>;
    };

    const renderAllTypes = () => {
        const backgroundColor = COLORS["All Types"];

        return <div className="bubble" style={{ backgroundColor }}>
            <div>All Types:</div>
            <div style={{ marginLeft: "10px" }}>{calculatePowerAmount(types[0].amount, ingredient, types[0])}</div>
        </div>;
    };

    const renderAllOtherTypes = () => {
        const backgroundColor = COLORS["All Other Types"];
        const common = mode(types, 'amount', true, true);
        const toRender = types.filter(x => x.amount !== common);
        
        return (<div className="bubble-row">
            {toRender.map((x, i) => renderKeyValue(x, i))}
            <div className="bubble" style={{ backgroundColor }}>
                <div>All Other Types:</div>
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
        if (tempPieces < 1) { tempPieces = 1; }
        ingredient.pieces = tempPieces;
        props.updatePieces();
    };

    return (
      <div className='card' style={{ borderColor, backgroundColor, alignSelf: "center", position: "relative" }}>
        {!isSum && <div className='bubble bubble-header' onClick={props?.onClick}>
            <img alt={ingredient.name} src={ingredient.imageUrl} />
            <div>{ingredient.name}</div>            
        </div>}
        {isSum && <div className='bubble bubble-header' title={sumStr} onClick={() => copyValues(tastes, powers, types)}>
            <img alt={"Total"} src="https://www.serebii.net/itemdex/sprites/sandwich.png" />
            <div>Total Stats</div>
        </div>}
        {!isSum && ingredient && isFilling(ingredient) && <div className="pieces">
            <div title='How many pieces of this filling to put on sandwich'>Pieces: {ingredient.pieces}</div>
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
        {!isSum && !props.simpleMode && <div className='expand-help' onClick={props?.onClick}>{showStats ? "Click to minimize" : "expand"}</div>}
      </div>
    );
};

export default Card;