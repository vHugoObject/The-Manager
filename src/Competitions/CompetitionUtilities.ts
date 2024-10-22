import { createClub } from "../Clubs/ClubUtilities";
import {
  ComponentKeysObject,
  StatisticsObject,
  StatisticsType,
} from "../Common/CommonTypes";
import { Club } from "../Clubs/ClubTypes";
import { Player } from "../Players/PlayerTypes";
import { Competition } from "./CompetitionTypes";

const fullCompetitionTableRowHeaders: Array<string> = [
  "Club",
  "Wins",
  "Draws",
  "Losses",
  "Goals For",
  "Goals Against",
  "Goal Difference",
  "Points",
];

const simpleCompetitionTableRowHeaders: Array<string> = [
  "Club",
  "Wins",
  "Draws",
  "Losses",
  "Points",
];

const competitionStatistics: StatisticsObject = {
  Wins: 0,
  Draws: 0,
  Losses: 0,
  GoalsFor: 0,
  GoalsAgainst: 0,
  GoalDifference: 0,
  Points: 0,
  MatchesPlayed: 0,
  Minutes: 0,
  NonPenaltyGoals: 0,
  PenaltyKicksMade: 0,
  PenaltyKicksAttempted: 0,
  YellowCards: 0,
  RedCards: 0,
};

export const generateCompetitionStatisticsObject = (
  season: string,
): StatisticsType => {
  return {
    BySeason: { [season]: competitionStatistics },
    GameLog: {},
  };
};

export const createCompetitionClubsWithGeneratedPlayers = (
  season: string,
  clubs: Array<string>,
  firstPlayerID: number,
): Array<Club> => {
  return clubs.map((clubName: string, index: number) => {
    const fakeFirstPlayerID = firstPlayerID * index;
    return createClub(clubName, index, season, fakeFirstPlayerID);
  });
};

export const createCompetitionClubsWithGivenPlayers = (
  season: string,
  clubs: Record<string, Array<Player>>,
  firstPlayerID: number,
): Array<Club> => {
  return Object.entries(clubs).map(([clubName, players], index: number) => {
    const fakeFirstPlayerID = firstPlayerID * index;
    return createClub(clubName, index, season, fakeFirstPlayerID, players);
  });
};

export const createCompetition = (
  competition: string,
  season: string,
  clubs: Array<string> | Record<string, Array<Player>>,
): Competition => {
  const CLUBFIRSTPLAYERID: number = 25;
  const Clubs = Array.isArray(clubs)
    ? createCompetitionClubsWithGeneratedPlayers(
        season,
        clubs,
        CLUBFIRSTPLAYERID,
      )
    : createCompetitionClubsWithGivenPlayers(season, clubs, CLUBFIRSTPLAYERID);

  return {
    Name: competition,
    Clubs,  
    Statistics: generateCompetitionStatisticsObject(season),
  };
};
