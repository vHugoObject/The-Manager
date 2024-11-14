import { simpleFaker } from "@faker-js/faker";
import { range } from "lodash";
import { StatisticsObject, StatisticsType } from "../Common/CommonTypes";
import { Player } from "../Players/PlayerTypes";
import {
  createGoalkeeper,
  createDefender,
  createMidfielder,
  createAttacker,
} from "../Players/PlayerUtilities";
import { Club } from "./ClubTypes";

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

export const generateClubStatisticsObject = async (
  season: string,
): Promise<StatisticsType> => {
  return {
    BySeason: { [season]: clubStatistics },
    GameLog: {},
  };
};

export const generateSquad = async (
  club: string,
  teamID: string,
  season: string,
): Promise<Array<Player>> => {
  const generateGoalies = async (): Promise<Array<Player>> => {
    return await Promise.all(
      range(0, 4).map(async (_) => {
        return await createGoalkeeper(season, club);
      }),
    );
  };

  const generateDefenders = async (): Promise<Array<Player>> => {
    return await Promise.all(
      range(0, 7).map(async (_) => {
        return await createDefender(season, club);
      }),
    );
  };

  const generateMidfielders = async (): Promise<Array<Player>> => {
    return await Promise.all(
      range(0, 7).map(async (_) => {
        return await createMidfielder(season, club);
      }),
    );
  };

  const generateAttackers = async (): Promise<Array<Player>> => {
    return await Promise.all(
      range(0, 7).map(async (_) => {
        return await createAttacker(season, club);
      }),
    );
  };

  const players: Array<Array<Player>> = await Promise.all([
    await generateGoalies(),
    await generateDefenders(),
    await generateMidfielders(),
    await generateAttackers(),
  ]);

  return players.flat();
};

export const createClub = async (
  ID: string,
  name: string,
  season: string,
  players?: Array<Player>,
): Promise<[Club, Record<string, Player>]> => {
  

  const clubPlayers: Array<Player> = players
    ? players
    : await generateSquad(name, ID, season);

  const createPlayersObject = async (
    players: Array<Player>,
  ): Promise<Record<string, Player>> => {
    return Object.fromEntries(
      players.map((player: Player) => [player.ID, player]),
    );
  };

  const createPlayerReferences = async (
    players: Array<Player>,
  ): Promise<Record<string, string>> => {
    return Object.fromEntries(
      players.map((player: Player) => [player.ID, player.Name]),
    );
  };

  const [clubPlayersObject, Squad, clubStats] = await Promise.all([
    await createPlayersObject(clubPlayers),
    await createPlayerReferences(clubPlayers),
    await generateClubStatisticsObject(season),
  ]);

  const club: Club = {
    ID,
    Name: name,
    Statistics: clubStats,
    Squad,
    Starting11: {},
    Bench: {},
  };

  return [club, clubPlayersObject];
};
