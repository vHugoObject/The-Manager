import React from "react";
import Table from "react-bootstrap/Table";
import { property, curry } from "lodash/fp";
import { mapIndexed } from "futil-js";
import { Player } from "../../GameLogic/Types";
import {
  getPlayerFirstName,
  getPlayerLastName,
  getPlayerCountryName,
  getPlayerPositionGroupName,
} from "../../GameLogic/Getters";

export const SQUADTABLEHEADERSGETTERSMAPPING: Record<
  string,
  (player: Player) => string
> = {
  "First Name": getPlayerFirstName,
  "Last Name": getPlayerLastName,
  Country: getPlayerCountryName,
  Age: property("PlayerAge"),
  Wage: property("PlayerWage"),
  "Position Group": getPlayerPositionGroupName,
};

const getPlayerCellValue = curry(
  (player: Player, columnHeader: string): string =>
    property(columnHeader, SQUADTABLEHEADERSGETTERSMAPPING)(player),
);

export const SQUADTABLEHEADERS: Array<string> = Object.keys(
  SQUADTABLEHEADERSGETTERSMAPPING,
);

export const PlayerRow = ({ player }: { player: Player }) => {
  return (
    <tr>
      {mapIndexed((columnHeader: string, index: number) => {
        return (
          <td key={index} data-testid={`player_${index}`}>
            {getPlayerCellValue(player, columnHeader)}
          </td>
        );
      })(SQUADTABLEHEADERS)}
    </tr>
  );
};

export const SquadTable = ({ players }: { players: Array<Player> }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          {mapIndexed((header: string, index: number) => {
            return <th key={index}>{header}</th>;
          })(SQUADTABLEHEADERS)}
        </tr>
      </thead>
      <tbody>
        {mapIndexed((player: Player, index: number) => {
          return <PlayerRow player={player} key={index} />;
        })(players)}
      </tbody>
    </Table>
  );
};
