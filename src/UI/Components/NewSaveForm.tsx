import { mapIndexed } from "futil-js";
import React, { useState } from "react";
import {
  getClubsOfDomesticLeagueFromBaseCountries,
  getDomesticLeaguesOfCountryFromBaseCountries,
} from "../../Common/Getters";
import {
  createClubID,
  createCountryID,
  createDomesticLeagueID,
  zipAllAndGetFirstArray,
} from "../../Common/Transformers";
import { BaseCountries } from "../../Common/Types";

export const CreateEntityOptions = ({
  idCreator,
  strings,
}: {
  idCreator: (arg: number) => string;
  strings: Array<string>;
}): Array<JSX.Element> => {
  return mapIndexed((name: string, index: number): JSX.Element => {
    return (
      <option id={idCreator(index)} key={index} value={index}>
        {" "}
        {name}{" "}
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

  return (
    <CreateEntityOptions idCreator={createCountryID} strings={countryNames} />
  );
};

export const CreateDomesticLeagueOptions = ({
  countriesLeaguesClubs,
  countryIndex,
}: {
  countriesLeaguesClubs: BaseCountries;
  countryIndex: string;
}): JSX.Element => {
  const domesticLeagueNames = getDomesticLeaguesOfCountryFromBaseCountries(
    countryIndex,
    countriesLeaguesClubs,
  );

  return (
    <CreateEntityOptions
      idCreator={createDomesticLeagueID}
      strings={domesticLeagueNames}
    />
  );
};

export const CreateClubOptions = ({
  countriesLeaguesClubs,
  countryIndex,
  domesticLeagueIndex,
}: {
  countriesLeaguesClubs: BaseCountries;
  countryIndex: string;
  domesticLeagueIndex: string;
}): JSX.Element => {
  const clubNames = getClubsOfDomesticLeagueFromBaseCountries(
    [countryIndex, domesticLeagueIndex],
    countriesLeaguesClubs,
  );

  return <CreateEntityOptions idCreator={createClubID} strings={clubNames} />;
};

export const NewSaveForm = ({
  countriesLeaguesClubs,
}: {
  countriesLeaguesClubs: BaseCountries;
}) => {
  const [domesticLeaguesHidden, setDomesticLeaguesHidden] = useState(true);
  const [clubsHidden, setClubsHidden] = useState(true);
  const [submitHidden, setSubmitHidden] = useState(true);

  const [countryValue, setCountryValue] = useState("0");
  const [domesticLeagueValue, setDomesticLeagueValue] = useState("0");

  return (
    <div>
      <form method="post">
        <label>
          Choose a name:
          <input type="text" id="name" name="name" />
        </label>

        <label>
          {" "}
          Choose a country:
          <select
            required={true}
            name="country"
            value={countryValue}
            onChange={(event): void => {
              setCountryValue(event.target.value);
              setDomesticLeaguesHidden(false);
            }}
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
            value={domesticLeagueValue}
            hidden={domesticLeaguesHidden}
            onChange={(event): void => {
              setDomesticLeagueValue(event.target.value);
              setClubsHidden(false);
            }}
          >
            <CreateDomesticLeagueOptions
              countriesLeaguesClubs={countriesLeaguesClubs}
              countryIndex={countryValue}
            />
          </select>
        </label>

        <label>
          Choose a club:
          <select
            required={true}
            name="club"
            hidden={clubsHidden}
            value={"0"}
            onChange={(_) => setSubmitHidden(false)}
          >
            <CreateClubOptions
              countriesLeaguesClubs={countriesLeaguesClubs}
              countryIndex={countryValue}
              domesticLeagueIndex={domesticLeagueValue}
            />
          </select>
        </label>
        <input hidden={submitHidden} type="submit" />
      </form>
    </div>
  );
};
