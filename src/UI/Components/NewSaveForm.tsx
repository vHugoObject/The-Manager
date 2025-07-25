import { mapIndexed } from "futil-js";
import { pipe } from "lodash/fp"
import { useState } from "react";
import {
  getClubsOfDomesticLeagueFromBaseCountries,
  getDomesticLeaguesOfCountryFromBaseCountries,
  getEventTargetValue
} from "../../Common/Getters";
import {  
  zipAllAndGetFirstArray,
  joinOnUnderscores
} from "../../Common/Transformers";
import { BaseCountries } from "../../Common/Types";

export const CreateEntityOptions = ({
  strings,
}: {
  strings: Array<string>;
}): Array<JSX.Element> => {
  return mapIndexed((name: string, index: number): JSX.Element => {
    return (
      <option key={index} value={index}>
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
  return (
    <CreateEntityOptions strings={countryNames} />
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


  return <CreateEntityOptions strings={clubNames} />;
};

export const NewSaveForm = ({
  countriesLeaguesClubs,
}: {
  countriesLeaguesClubs: BaseCountries;
}) => {


  const [playerName, setPlayerName] = useState("");
  const [countryValue, setCountryValue] = useState("0");
  const [domesticLeagueValue, setDomesticLeagueValue] = useState("0");
  const [clubValue, setClubValue] = useState("0");

  
  const handleSubmit = (event) => {
    
    event.preventDefault();    
    const playerID: string = joinOnUnderscores([countryValue, domesticLeagueValue, clubValue, "2025"])
    const saveArguments: Record<string, string> = {
      name: playerName,
      playerID,
    }
  }

  return (
    <div>
      <form method="post">
        <label>
          Choose a name:
          <input type="text" name="name" value={playerName}
	    onChange={pipe([getEventTargetValue, setPlayerName])} />
        </label>

        <label>
          {" "}
          Choose a country:
          <select
            required={true}
            name="country"
            onChange={(event): void => {
              setCountryValue(event.target.value);
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
            onChange={(event): void => {
              setDomesticLeagueValue(event.target.value);
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
            value={"0"}
	    onChange={(event): void => {
              setClubValue(event.target.value);
            }}
          >
            <CreateClubOptions
              countriesLeaguesClubs={countriesLeaguesClubs}
              countryIndex={countryValue}
              domesticLeagueIndex={domesticLeagueValue}
            />
          </select>
        </label>
        <input onSubmit={handleSubmit} type="submit" />
      </form>
    </div>
  );
};
