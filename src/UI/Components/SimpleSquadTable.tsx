import React from "react";
import { Competition } from "../../Competitions/CompetitionTypes";
import { Club } from "../../Clubs/ClubTypes";
import { Player } from "../../Players/PlayerTypes";
import {  StatisticsObject } from "../../Common/CommonTypes";

export const SimpleSquadTable = ({save, season}) => {
  
  const simpleSquadTableHeaders: Array<string> = [
    "Name",
    "National Team",
    "Position",
    "Matches Played",
    "Starts",
    "Minutes",
    "Goals",
    "Assists",
    "Yellow Cards",
    "Red Cards",
  ];

    const playerCountry: string = save.Country;
  const playerMainCompetitonName: string = save.MainCompetition;
  const playerClubName = save.Club;
  const playerMainCompetiton: Competition = save.allCompetitions[playerCountry][playerMainCompetitonName];
  const playerClub: Club = playerMainCompetiton.Clubs.find((club) => club.Name === playerClubName)
  
  
  const getPlayerStatistics = (club: Club, season: string) => {
    return club.Players.map((player: Player) => {
      const stats: StatisticsObject = player.Statistics.BySeason[season];
      return {
        Name: player["Name"],
        NationalTeam: player["NationalTeam"],
        Position: player["Position"],
        MatchesPlayed: stats["MatchesPlayed"],
        Starts: stats["Starts"],
        Minutes: stats["Minutes"],
        Goals: stats["Goals"],
        Assists: stats["Assists"],
        YellowCards: stats["YellowCards"],
        RedCards: stats["RedCards"],
      };
    });
  };
  return (
    <div id="simple-squad-table">
      <table id="simple-squad">
        <thead>
          <tr key="header">
            {simpleSquadTableHeaders.map((header, index) => (
              <th key={index} id={index}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getPlayerStatistics(
            playerClub,
            season,
          ).map((player, index) => (
            <tr key={index}>
              {Object.entries(player).map(([subKey, subValue]) => (
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
