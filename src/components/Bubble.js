import React from "react";
import { COLORS } from "../util";

const Bubble = ({ label, isType, onClick, selected }) => {
  const backgroundColor = COLORS[label];
  let borderColor = selected ? "black" : backgroundColor;

  return (
    <div
      className={`bubble bubble-min-width  ${isType ? "bubble-type" : ""} ${
        selected ? "key-selected" : "fake-border"
      }`}
      onClick={onClick}
      style={{ backgroundColor, borderColor }}
    >
      {label}
    </div>
  );
};

export default Bubble;
