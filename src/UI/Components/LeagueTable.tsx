import React from "react";
import Table from "react-bootstrap/Table";
import { property, curry } from "lodash/fp";
import { mapIndexed } from "futil-js";
import { LeagueTableRow } from "../../GameLogic/Types";

export const PARTIALLEAGUETABLEHEADERS: Array<string> = [
  "Club Name",
  "Wins",
  "Losses",
  "Draws",
  "Points",
];

export const FULLLEAGUETABLEHEADERS: Array<string> = [
  "Club Name",
  "Wins",
  "Losses",
  "Draws",
  "Goals For",
  "Goals Against",
  "Matches Played",
  "Goal Difference",
  "Points",
];

const getLeagueTableRowCellValue = curry(
  (leagueTableRow: LeagueTableRow, columnHeader: string): number => {
    return property(columnHeader, leagueTableRow);
  },
);

const LeagueTableRowComponent = ({
  headers,
  leagueTableRow,
}: {
  headers: Array<string>;
  leagueTableRow: LeagueTableRow;
}) => {
  return (
    <tr>
      {mapIndexed((columnHeader: string, index: number) => {
        return (
          <td key={index}>
            {getLeagueTableRowCellValue(leagueTableRow, columnHeader)}
          </td>
        );
      })(headers)}
    </tr>
  );
};

const LeagueTable =
  (headers: Array<string>) =>
  ({
    leagueTableRowsAndHeader,
  }: {
    leagueTableRowsAndHeader: [Array<LeagueTableRow>, string];
  }) => {
    const [leagueTableRows, header] = leagueTableRowsAndHeader;
    
    return (
      <div>
        <header>
          <h2>{header}</h2>
        </header>
        <Table striped bordered hover>
          <thead>
            <tr>
              {mapIndexed((header: string, index: number) => {
                return <th key={index}>{header}</th>;
              })(headers)}
            </tr>
          </thead>
          <tbody>
            {mapIndexed((leagueTableRow: LeagueTableRow, index: number) => {
              return (
                <LeagueTableRowComponent
                  headers={headers}
                  leagueTableRow={leagueTableRow}
                  key={index}
                />
              );
            })(leagueTableRows)}
          </tbody>
        </Table>
      </div>
    );
  };

export const PartialLeagueTable = LeagueTable(PARTIALLEAGUETABLEHEADERS);
export const FullLeagueTable = LeagueTable(FULLLEAGUETABLEHEADERS);
