import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { zipWith } from "lodash/fp";
import { mapIndexed } from "futil-js";
import { BaseCountries } from "../../GameLogic/Types";
import { convertClubAbsoluteNumberIntoClubName } from "../../GameLogic/Transformers";

export interface ClubStatusProps {
  baseCountries: BaseCountries;
  clubDetails: [number, string];
  clubFinances: Array<number>
}
const BASICCLUBFINANCES: Array<[string, number]> = mapIndexed((name: string, index: number): [string, number] => [name, index], [
  "Average Attendance",
  "Revenue",
  "Profit",
  "Cash"
])

const ClubStatus = (clubFinancesCategories: Array<[string, number]>) => ({baseCountries, clubDetails, clubFinances}: ClubStatusProps) => {
  const [clubNumber, clubRecord] = clubDetails
  const valueCreator =  ([valueName, key]: [string, number], value: number) => <p key={key}>{valueName}: {value}</p>
  const clubName: string = convertClubAbsoluteNumberIntoClubName(baseCountries, clubNumber)
  return (
    <Col md={{offset: 4}}>
      <Row>
	<h2>{clubName}</h2>
	<h3>{clubRecord}</h3>
      </Row>
      <Row>
	{zipWith(valueCreator, clubFinancesCategories, clubFinances)}
      </Row>
    </Col>    
  );
};

export const BasicClubStatus = ClubStatus(BASICCLUBFINANCES)
