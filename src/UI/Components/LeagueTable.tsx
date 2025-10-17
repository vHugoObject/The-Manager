import React from "react";
import Table from "react-bootstrap/Table";
import { property, curry } from "lodash/fp";
import { mapIndexed } from "futil-js"
import { LeagueTableRow } from "../../GameLogic/Types";

const LEAGUETABLEHEADERS: Array<String> = [
  "Club Name",
  "Home",
  "Wins",
  "Losses",
  "Draws",
  "Goals For",
  "Goals Against",
  "Matches Played",
  "Goal Difference"
]

const getLeagueTableRowCellValue = curry(
  (leagueTableRow: LeagueTableRow, columnHeader: string): number => {
    return property(columnHeader, leagueTableRow)
  }
);

export const LeagueTableRowComponent = ({ leagueTableRow }: { leagueTableRow: LeagueTableRow }) => {
  return (
    <tr>
      {mapIndexed((columnHeader: string, index: number) => {
        return <td key={index}>{getLeagueTableRowCellValue(leagueTableRow, columnHeader)}</td>;
      })(LEAGUETABLEHEADERS)}
    </tr>
  );
};


export const LeagueTable = ({ leagueTableRows }: { leagueTableRows: Array<LeagueTableRow> }) => {

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          {mapIndexed((header: string, index: number) => {
            return <th key={index}>{header}</th>;
          })(LEAGUETABLEHEADERS)}
        </tr>
      </thead>
      <tbody>
        {mapIndexed((leagueTableRow: LeagueTableRow, index: number) => {
          return <LeagueTableRowComponent leagueTableRow={leagueTableRow} key={index} />;
        })(leagueTableRows)}
      </tbody>
    </Table>
  );
};
