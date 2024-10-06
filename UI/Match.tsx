import React from "react";
import { zip } from "lodash";
import { BaseTable } from "./BaseComponents";

export const Match = ({ match }) => {
  const teamNames: Array<String> = [match.HomeTeam.Name, match.AwayTeam.Name];
  // scores need to be strings
  const matchScores: Array<String> = Object.values(match.MatchScore);

  const homeTeamStarting11 = Object.values(match.HomeTeamSquad.starting11);
  const homeTeamBench = Object.values(match.HomeTeamSquad.bench);
  const homeTeamPlayers = Object.values(homeTeamStarting11).concat(
    Object.values(homeTeamBench),
  );

  const playerStatisticsOnly = (players) =>
    players.map((player) => {
      const statisticsOnly = player.Statistics.gameLog[match.MatchDate];
      statisticsOnly["Player"] = player["Name"];
      statisticsOnly["Position"] = player["Position"];
      return statisticsOnly;
    });

  const homeTeamPlayerStatistics = playerStatisticsOnly(homeTeamPlayers);

  const awayTeamStarting11 = Object.values(match.AwayTeamSquad.starting11);
  const awayTeamBench = Object.values(match.AwayTeamSquad.bench);
  const awayTeamPlayers = Object.values(awayTeamStarting11).concat(
    Object.values(awayTeamBench),
  );

  const awayTeamPlayerStatistics = playerStatisticsOnly(awayTeamPlayers);

  const starters = zip(homeTeamStarting11, awayTeamStarting11);
  const bench = zip(homeTeamBench, awayTeamBench);

  const playerStatsID = ["homeTeamPlayerStats", "awayTeamPlayerStats"];
  const playerStatsHeadings = teamNames.map((name) => `${name} Player Stats`);

  const matchSubHeadings = match.ComponentKeys.matchSubHeadings.map(
    (heading: string, index: number) => (
      <h2 key={index}>{match[heading.replace(/\s/, "")]}</h2>
    ),
  );

  const scoreIDs = ["homeTeamScore", "awayTeamScore"];

  const scoreBoard = (
    <div id="scoreboard">
      <table>
        <thead>
          <tr>
            {zip(teamNames, scoreIDs).map(([teamName, id], index: number) => (
              <th key={index} id={id}>
                {teamName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {zip(teamNames, scoreIDs).map(([teamName, id], index: number) => (
              <td key={index}>
                <strong id={id}>{matchScores[index]}</strong>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );

  const startingLineups = (
    <div>
      <table>
        <thead>
          <tr>
            {teamNames.map((teamName, index) => (
              <th key={index}>{teamName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {starters.map(([homePlayer, awayPlayer], index) => (
            <tr key={index}>
              <td key={index}>
                <strong>{homePlayer.Name}</strong>
              </td>
              <td key={index + 1}>
                <strong>{awayPlayer.Name}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const benchs = (
    <div>
      <table>
        <thead>
          <tr>
            {["Bench", "Bench"].map((value, index) => (
              <th key={index}>{value}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bench.map(([homePlayer, awayPlayer], index) => (
            <tr key={index}>
              <td key={index}>
                <strong>{homePlayer.Name}</strong>
              </td>
              <td key={index + 1}>
                <strong>{awayPlayer.Name}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const teamMatchStatistics = (
    <div id="team_stats">
      <table>
        <thead>
          <tr>
            <th colSpan={3}>Team Stats</th>
          </tr>
          <tr>
            {zip(teamNames, ["home_team_stats", "away_team_stats"]).map(
              ([teamName, id], index: number) => (
                <th key={index} id={`${id}`}>
                  {teamName}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {match.ComponentKeys.teamStatisticsHeaders.map(
            (stat: string, index: number) => (
              <tr key={index}>
                <td id={`home_team_stat_${index}`}>
                  {match.HomeTeamOverallStatistics[stat.replace(/\s/g, "")]}
                </td>
                <td id={`stat_${index}`}>{stat}</td>
                <td id={`away_team_stat_${index}`}>
                  {match.AwayTeamOverallStatistics[stat.replace(/\s/g, "")]}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h1>{match.Name}</h1>
      {matchSubHeadings}
      {scoreBoard}
      {startingLineups}
      {benchs}
      {teamMatchStatistics}
      <h2 id={playerStatsID[0]}>{playerStatsHeadings[0]} </h2>
      <BaseTable
        rows={homeTeamPlayerStatistics}
        columnHeaders={match.ComponentKeys.playerStatisticsHeaders}
      />
      <h2 id={playerStatsID[1]}>{playerStatsHeadings[1]} </h2>
      <BaseTable
        rows={awayTeamPlayerStatistics}
        columnHeaders={match.ComponentKeys.playerStatisticsHeaders}
      />
    </div>
  );
};
