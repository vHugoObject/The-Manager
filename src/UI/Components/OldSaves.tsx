import React from "react";
import { useNavigate } from "react-router";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import { over } from "lodash/fp";
import { mapIndexed } from "futil-js";
import {
  getClubNameFromBaseCountries,
  getCountryNameFromBaseCountries,
} from "../../GameLogic/Getters";
import { SaveOptions } from "../../GameLogic/Types";

export const SaveCard = ({
  saveName,
  saveOptions,
  colKey,
}: {
  saveName: string;
  saveOptions: SaveOptions;
  colKey: number;
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
    <Col key={colKey}>
      <Card style={{ width: "18rem" }}>
        <Card.Header onClick={() => navigate(saveAddress)}> Continue {saveName}</Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>Country: {saveCountryName}</ListGroup.Item>
          <ListGroup.Item>Club: {saveClubName}</ListGroup.Item>
          <ListGroup.Item>Current Season: {CurrentSeason}</ListGroup.Item>
          <ListGroup.Item>
            Seasons Played: {CurrentSeason - StartSeason}
          </ListGroup.Item>
        </ListGroup>
      </Card>
    </Col>
  );
};

export const OldSavesCards = ({
  saveOptionTuples,
}: {
  saveOptionTuples: Array<[string, SaveOptions]>;
}) => {
  return (
    <Row xs={1} md={2} className="g-4">
      {mapIndexed(
        ([saveName, saveOptions]: [string, SaveOptions], index: number) => {
          return (
            <SaveCard
              key={saveName}
              saveName={saveName}
              saveOptions={saveOptions}
              colKey={index}
            />
          );
        },
      )(saveOptionTuples)}
    </Row>
  );
};
