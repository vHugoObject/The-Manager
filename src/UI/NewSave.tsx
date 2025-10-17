import React from "react";
import { BASECOUNTRIES } from "../GameLogic/Constants";
import { NewSaveForm } from "./Components/NewSaveForm";

export const NewSave = () => {
  return (
    <div>
      <NewSaveForm countriesLeaguesClubs={BASECOUNTRIES} />
    </div>
  );
};
