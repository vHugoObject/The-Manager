import { range } from "lodash";
import {
  ComponentKeysObject,
  StatisticsObject,
  StatisticsType,
} from "../Common/CommonTypes";
import { Player, PositionGroup } from "../Players/PlayerTypes";
import { createPlayer } from "../Players/PlayerUtilities";
import { Club } from "./ClubTypes";

const clubStandardStatsHeaders: Array<string> = [
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

const clubSummaryStatsHeaders: Array<string> = [
  "Record",
  "Home Record",
  "Away Record",
  "Manager",
  "Country",
  "Domestic Competition",
  "Domestic Cups",
  "Continental Cup",
];

const clubComponentKeys: ComponentKeysObject = {
  clubSummaryStatsHeaders,
  clubStandardStatsHeaders,
};

const clubStatistics: StatisticsObject = {
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
  MatchesPlayed: 0,
  Minutes: 0,
  NonPenaltyGoals: 0,
  PenaltyKicksMade: 0,
  PenaltyKicksAttempted: 0,
  YellowCards: 0,
  RedCards: 0,
};

export const generateClubStatisticsObject = (
  season: string,
): StatisticsType => {
  return {
    BySeason: { [season]: clubStatistics },
    GameLog: {},
  };
};

export const generateSquad = (
  teamName: string,
  teamID: number,
  season: string,
  firstPlayerID: number,
): Array<Player> => {
  const firstGoalieID: number = firstPlayerID;
  const goalies = range(4).map((num) => {
    return createPlayer(
      firstGoalieID + num,
      PositionGroup.Goalkeeper,
      season,
      teamName,
    );
  });

  const firstDefenderID: number = firstGoalieID + 5;
  const defenders = range(7).map((num) => {
    return createPlayer(
      firstDefenderID + num,
      PositionGroup.Defender,
      season,
      teamName,
    );
  });

  const firstMidfielderID: number = firstDefenderID + 8;
  const midfielders = range(7).map((num) => {
    return createPlayer(
      firstMidfielderID + num,
      PositionGroup.Midfielder,
      season,
      teamName,
    );
  });

  const firstAttackerID: number = firstMidfielderID + 8;
  const attackers = range(7).map((num) => {
    return createPlayer(
      firstAttackerID + num,
      PositionGroup.Attacker,
      season,
      teamName,
    );
  });

  return [goalies, defenders, midfielders, attackers].flat();
};

export const createClub = (
  name: string,
  id: number,
  season: string,
  firstPlayerID: number,
  players?: Array<Player>,
): Club => {
  const teamPlayers = players
    ? players
    : generateSquad(name, id, season, firstPlayerID);
  return {
    ID: id,
    Name: name,
    Statistics: generateClubStatisticsObject(season),
    Squad: teamPlayers,
    Starting11: [],
    Bench: [],
  };
};
