import React from "react";
import { useContext } from "react";
import { SaveContext } from "../DatabaseManagement";

export const CurrentDate = ({}) => {
  const currentSave = useContext(SaveContext);
  return (
    <div id="current-date">
      <h2 id="current-date">{currentSave.CurrentDate.toDateString()}</h2>
    </div>
  );
};
