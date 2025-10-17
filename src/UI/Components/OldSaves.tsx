import React from "react";
import { useNavigate } from "react-router";
import Card from "react-bootstrap/Card";
import { over, map } from "lodash/fp";
import { Option, isSome } from "fp-ts/Option";
import { compact } from "fp-ts/ReadonlyArray";
import {
  getClubNameFromBaseCountries,
  getCountryNameFromBaseCountries,
} from "../../GameLogic/Getters";
import { SaveOptions } from "../../GameLogic/Types";

export const SaveCard = ({
  saveName,
  saveOptions,
}: {
  saveName: string;
  saveOptions: SaveOptions;
}) => {
  const {
    CurrentSeason,
    StartSeason,
    CountryIndex,
    DomesticLeagueIndex,
    ClubIndex,
    Countries,
  } = saveOptions;

  let navigate = useNavigate();
  const [saveCountryName, saveClubName] = over([
    getCountryNameFromBaseCountries(CountryIndex),
    getClubNameFromBaseCountries([
      CountryIndex,
      DomesticLeagueIndex,
      ClubIndex,
    ]),
  ])(Countries);
  const saveAddress: string = `saves/${saveName}`;
  return (
    <Card onClick={() => navigate(saveAddress)}>
      <Card.Header>{saveName}</Card.Header>
      <Card.Text>
        Country: {saveCountryName}
        Club: {saveClubName}
        Current Season: {CurrentSeason}
        Seasons Played: {CurrentSeason - StartSeason}
      </Card.Text>
    </Card>
  );
};

export const OldSavesCards = ({
  saveOptionTuples,
}: {
  saveOptionTuples: Array<Option<[string, SaveOptions]>>;
}) => {
  // map(optionMap)?
  const validOptionTuples = compact(saveOptionTuples);
  return (
    <div>
      {map(([saveName, saveOptions]: [string, SaveOptions]) => {
        return (
          <SaveCard
            key={saveName}
            saveName={saveName}
            saveOptions={saveOptions}
          />
        );
      })(validOptionTuples)}
    </div>
  );
};
