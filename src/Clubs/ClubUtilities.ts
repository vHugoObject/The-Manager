import { simpleFaker } from "@faker-js/faker";
import { filter, isEqual, sortBy, take, flow } from "lodash/fp";
import { range } from "lodash";
import { StatisticsObject, StatisticsType } from "../Common/CommonTypes";
import { Player, PositionGroup } from "../Players/PlayerTypes";
import { Club } from "./ClubTypes";
import { entityObjectsCreator,entityReferencesCreator } from "../Common/simulationUtilities";
import {
  createGoalkeeper,
  createDefender,
  createMidfielder,
  createAttacker,
  filterGoalkeepers,
  filterDefenders,
  filterMidfielders,
  filterAttackers
} from "../Players/PlayerUtilities";


export const sortByPlayerRating = sortBy((player: Player) => player.Rating)

export const getBestStarting11 = async(clubPlayers: Record<string, Player>): Promise<[Record<string,string>, Array<Player>]> => {

  const playerObjects: Array<Player> = Object.values(clubPlayers)
  const playerFuncs: Array<[(arg1: Array<Player>) => Array<Player>, number]> = [[filterGoalkeepers, 1], [filterDefenders, 4], [filterMidfielders, 3], [filterAttackers, 3]];
  
  const players: Array<Player> = await Promise.all(
    playerFuncs.flatMap(([filterFunc, playerCount]) => {
      const playerTaker = take(playerCount)
      const getBest = flow(filterFunc,sortByPlayerRating, playerTaker)
      return getBest(playerObjects)
    }
    )
  )
  const playerReferences: Record<string, string> = await entityReferencesCreator<Player>(players)
  
  return [playerReferences, players]
}

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
    [season]: clubStatistics 
  };
};

// try out mergeAll here
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

  
  const [clubPlayersObject, Squad, clubStats] = await Promise.all([
    await entityObjectsCreator(clubPlayers),
    await entityReferencesCreator<Player>(clubPlayers),
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
