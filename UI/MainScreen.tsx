import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSaveFromDB } from "../StorageUtilities/SaveUtilities";

export const MainScreen = () => {
  let { saveID } = useParams();
  let key: number = parseInt(saveID);
  const [currentSave, setCurrentSave] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getSaveFromDB(key)
      .then((save) => !isLoading && setCurrentSave(save))
      .catch((error) => console.error("Error fetching save:", error));
  }, [key]);

  const clubSummaryStats = [
    "Record",
    "Home Record",
    "Away Record",
    "Domestic Competition",
    "Domestic Cups",
    "Continental Cup",
  ];

  const getClubStatistics = (competition, season) => {
    return competition.Clubs.map((club) => {
      club["Club"] = club["Name"];
      const stats = club.Statistics.BySeason[season];
      return {
        Club: club["Name"],
        Wins: stats["Wins"],
        Losses: stats["Losses"],
        Draws: stats["Draws"],
        Points: stats["Points"],
      };
    });
  };

  const simpleSquadTableHeaders = [
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

  const getPlayerStatistics = (club, season) => {
    return club.Players.map((player) => {
      const stats = player.Statistics.BySeason[season];
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

  const simpleCompetitionTable = (
    <div>
      <h2>{currentSave && currentSave.playerMainCompetition.Name}</h2>
      <table>
        <thead>
          <tr>
            {currentSave &&
              currentSave.playerMainCompetition.ComponentKeys.simpleCompetitionTableRowHeaders.map(
                (header, index) => (
                  <th key={index} id={index}>
                    {header}
                  </th>
                ),
              )}
          </tr>
        </thead>
        <tbody>
          {currentSave &&
            getClubStatistics(
              currentSave.playerMainCompetition,
              currentSave.currentSeason,
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

  const teamSummary = (
    <div id="team-summary">
      <h2>{currentSave && currentSave.playerClub.Name}</h2>
      {currentSave &&
        clubSummaryStats.map((stat, index) => (
          <p key={index}>
            <strong>{`${stat}: ${currentSave.playerClub.Statistics.BySeason[currentSave.currentSeason][stat.replace(/\s/g, "")]}`}</strong>
          </p>
        ))}
    </div>
  );

  const simpleSquadTable = (
    <div id="simple-squad-table">
      <table id="simple-squad">
        <thead>
          <tr key="header">
            {currentSave &&
              simpleSquadTableHeaders.map((header, index) => (
                <th key={index} id={index}>
                  {header}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {currentSave &&
            getPlayerStatistics(
              currentSave.playerClub,
              currentSave.currentSeason,
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

  return (
    <div id="main-screen">
      {simpleCompetitionTable}
      {teamSummary}
      {simpleSquadTable}
    </div>
  );
};
