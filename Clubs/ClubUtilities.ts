import { PositionGroup } from "../Players/PlayerTypes";
import { createPlayer } from "../Players/PlayerUtilities";

const clubStandardStatsHeaders = [
  "Name",
  "National Team",
  "Position",
  "Matches Played",
  "Starts",
  "Minutes",
  "Full 90s",
  "Goals",
  "Assists",
  "Goals Plus Assists",
  "Non Penalty Goals",
  "Penalty Kicks Made",
  "Penalty Kicks Attempted",
  "Yellow Cards",
  "Red Cards",
];

const clubSummaryStatsHeaders = [
  "Record",
  "Home Record",
  "Away Record",
  "Manager",
  "Country",
  "Domestic Competition",
  "Domestic Cups",
  "Continental Cup",
];

const clubComponentKeys = {
  clubSummaryStatsHeaders,
  clubStandardStatsHeaders,
};

const emptyClubStatistics = {
  ID: 0,
  Wins: 0,
  Draws: 0,
  Losses: 0,
  GoalsFor: 0,
  GoalsAgainst: 0,
  GoalDifference: 0,
  Points: 0,
  Record: "",
  HomeRecord: "",
  AwayRecord: "",
  DomesticCompetition: "",
  DomesticCups: "",
  ContinentalCup: "",
};

export const createClub = (
  name: string,
  id: number,
  startingSeason: string,
  players?,
) => {
  const teamPlayers = players
    ? players
    : [0, 1].map((playerID) => {
        return createPlayer(
          playerID,
          PositionGroup.Midfielder,
          startingSeason,
          name,
        );
      });

  return {
    ID: id,
    Name: name,
    Statistics: {
      BySeason: { [startingSeason]: emptyClubStatistics },
      GameLog: {},
    },
    Players: teamPlayers,
    ComponentKeys: clubComponentKeys,
  };
};
