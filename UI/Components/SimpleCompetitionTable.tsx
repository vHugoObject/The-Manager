import React from "react";
import { Competition } from "../../Competitions/CompetitionTypes";
import { Club } from "../../Clubs/ClubTypes";
import { Save, SaveID } from "../../StorageUtilities/SaveTypes";
import {  StatisticsObject } from "../../Common/CommonTypes";



export const SimpleCompetitionTable = ({save, season}) => {
  const simpleCompetitionTableRowHeaders: Array<string> = [
    "Club",
    "Wins",
    "Draws",
    "Losses",
    "Points",
  ];
  
  const getClubStatistics = (competition: Competition, season: string) => {
    return competition.Clubs.map((club: Club) => {
      club["Club"] = club["Name"];  
      const stats: StatisticsObject = club.Statistics.BySeason[season];
      return {
        Club: club["Name"],
        Wins: stats["Wins"],
        Losses: stats["Losses"],
        Draws: stats["Draws"],
        Points: stats["Points"],
      };
    });
  };


  const playerCountry: string = save.Country;
  const playerMainCompetitonName: string = save.MainCompetition;
  const playerMainCompetiton: Competition = save.allCompetitions[playerCountry][playerMainCompetitonName];
  
  return (
    <div>
      <h2>{playerMainCompetitonName}</h2>
      <table>
        <thead>
          <tr>
            {simpleCompetitionTableRowHeaders.map(
              (header, index) => (
                <th key={index} id={index.toString()}>
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {getClubStatistics(
            playerMainCompetiton,
	    season
          ).map((club, index) => (
            <tr key={index}>
              {Object.entries(club).map(([subKey, subValue]) => (
                <td key={subKey} id={`${subKey}_${index}`}>
                  {subValue}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};