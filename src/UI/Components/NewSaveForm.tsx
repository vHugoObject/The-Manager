import React from "react";
import { useNavigate } from "react-router-dom";
import { mapIndexed } from "futil-js";
import { pipe } from "lodash/fp";
import { useState } from "react";
import {
  getClubsOfDomesticLeagueFromBaseCountries,
  getDomesticLeaguesOfCountryFromBaseCountries,
  getEventTargetValue,
  getEventTargetValueAsNumber,
} from "../../GameLogic/Getters";
import { createSave } from "../../GameLogic/Save";
import { zipAllAndGetFirstArray } from "../../GameLogic/Transformers";
import { BaseCountries } from "../../GameLogic/Types";

export const CreateEntityOptions = ({
  strings,
}: {
  strings: Array<string>;
}): Array<JSX.Element> => {
  return mapIndexed((name: string, index: number): JSX.Element => {
    return (
      <option data-testid={index} key={index} value={index}>
        {name}
      </option>
    );
  })(strings);
};

export const CreateCountryOptions = ({
  countriesLeaguesClubs,
}: {
  countriesLeaguesClubs: BaseCountries;
}): JSX.Element => {
  const countryNames = zipAllAndGetFirstArray(countriesLeaguesClubs);
  return <CreateEntityOptions strings={countryNames} />;
};

export const CreateDomesticLeagueOptions = ({
  countriesLeaguesClubs,
  countryIndex,
}: {
  countriesLeaguesClubs: BaseCountries;
  countryIndex: number;
}): JSX.Element => {
  const domesticLeagueNames = getDomesticLeaguesOfCountryFromBaseCountries(
    countryIndex,
    countriesLeaguesClubs,
  );

  return <CreateEntityOptions strings={domesticLeagueNames} />;
};

export const CreateClubOptions = ({
  countriesLeaguesClubs,
  countryIndex,
  domesticLeagueIndex,
}: {
  countriesLeaguesClubs: BaseCountries;
  countryIndex: number;
  domesticLeagueIndex: number;
}): JSX.Element => {
  const clubNames = getClubsOfDomesticLeagueFromBaseCountries(
    [countryIndex, domesticLeagueIndex],
    countriesLeaguesClubs,
  );

  return <CreateEntityOptions strings={clubNames} />;
};

export const NewSaveForm = ({
  countriesLeaguesClubs,
}: {
  countriesLeaguesClubs: BaseCountries;
}) => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [countryIndex, setCountryIndex] = useState(0);
  const [domesticLeagueIndex, setDomesticLeagueIndex] = useState(0);
  const [clubIndex, setClubIndex] = useState(0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const db = await createSave({
      CountryIndex: countryIndex,
      DomesticLeagueIndex: domesticLeagueIndex,
      ClubIndex: clubIndex,
      Season: 1,
      Countries: countriesLeaguesClubs,
    });

    const goto: string = `save/${db.name}`;
    navigate(goto);
  };

  return (
    <div>
      <form method="post">
        <label>
          Choose a name:
          <input
            type="text"
            name="name"
            value={playerName}
            onChange={pipe([getEventTargetValue, setPlayerName])}
          />
        </label>

        <label>
          {" "}
          Choose a country:
          <select
            required={true}
            name="country"
            onChange={pipe([getEventTargetValueAsNumber, setCountryIndex])}
          >
            <CreateCountryOptions
              countriesLeaguesClubs={countriesLeaguesClubs}
            />
          </select>
        </label>
        <label>
          Choose a domestic league:
          <select
            required={true}
            name="league"
            value={domesticLeagueIndex}
            onChange={pipe([
              getEventTargetValueAsNumber,
              setDomesticLeagueIndex,
            ])}
          >
            <CreateDomesticLeagueOptions
              countriesLeaguesClubs={countriesLeaguesClubs}
              countryIndex={countryIndex}
            />
          </select>
        </label>

        <label>
          Choose a club:
          <select
            required={true}
            name="club"
            value={0}
            onChange={pipe([getEventTargetValueAsNumber, setClubIndex])}
          >
            <CreateClubOptions
              countriesLeaguesClubs={countriesLeaguesClubs}
              countryIndex={countryIndex}
              domesticLeagueIndex={domesticLeagueIndex}
            />
          </select>
        </label>
        <input onSubmit={handleSubmit} type="submit" />
      </form>
    </div>
  );
};
