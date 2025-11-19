import React from "react";
import { useNavigate } from "react-router";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
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
      StartSeason: 1,
      CurrentSeason: 1,
      Countries: countriesLeaguesClubs,
    });

    db.close();

    const goto: string = `/saves/${db.name}`;
    navigate(goto);
  };

  return (
    <div>
      <Form method="post" onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="save-name"> Save Name </Form.Label>
          <Form.Control
            as="input"
            type="text"
            id="save-name"
            placeholder="Choose a name"
            value={playerName}
            onChange={pipe([getEventTargetValue, setPlayerName])}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="country"> Choose a country: </Form.Label>
          <Form.Select
            required={true}
            id="country"
            onChange={pipe([getEventTargetValueAsNumber, setCountryIndex])}
          >
            <CreateCountryOptions
              countriesLeaguesClubs={countriesLeaguesClubs}
            />
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="league"> Choose a domestic league: </Form.Label>
          <Form.Select
            required={true}
            id="league"
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
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="club"> Choose a club: </Form.Label>
          <Form.Select
            required={true}
            id="club"
            value={clubIndex}
            onChange={pipe([getEventTargetValueAsNumber, setClubIndex])}
          >
            <CreateClubOptions
              countriesLeaguesClubs={countriesLeaguesClubs}
              countryIndex={countryIndex}
              domesticLeagueIndex={domesticLeagueIndex}
            />
          </Form.Select>
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
};
