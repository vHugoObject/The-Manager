import { simpleFaker } from "@faker-js/faker";
import { sortBy, take, flow, map } from "lodash/fp";
import { partial } from "lodash";
import { flowAsync } from "futil-js";
import { StatisticsObject, StatisticsType } from "../Common/CommonTypes";
import { Player, PositionGroup } from "../Players/PlayerTypes";
import { Club } from "./ClubTypes";
import {
  entityObjectsCreator,
  entityReferencesCreator,
  getEntities,
} from "../Common/simulationUtilities";
import { Save } from "../StorageUtilities/SaveTypes";
import {
  createGoalkeepers,
  createDefenders,
  createMidfielders,
  createAttackers,
  filterGoalkeepers,
  filterDefenders,
  filterMidfielders,
  filterAttackers,
} from "../Players/PlayerUtilities";

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
    [season]: clubStatistics,
  };
};

export const sortByPlayerRating = sortBy((player: Player) => player.Rating);

export const getBestStarting11 = async (
  clubPlayers: Record<string, Player>,
): Promise<Array<Player>> => {
  const playerObjects: Array<Player> = Object.values(clubPlayers);
  const playerFuncs: Array<[(arg1: Array<Player>) => Array<Player>, number]> = [
    [filterGoalkeepers, 1],
    [filterDefenders, 4],
    [filterMidfielders, 3],
    [filterAttackers, 3],
  ];

  return await Promise.all(
    playerFuncs.flatMap(([filterFunc, playerCount]) => {
      const playerTaker = take(playerCount);
      const getBest = flow(filterFunc, sortByPlayerRating, playerTaker);
      return getBest(playerObjects);
    }),
  );
};

export const getBestStarting11References = flowAsync(
  getBestStarting11,
  entityReferencesCreator<Player>,
);

export const generateGoalkeepers = partial(createGoalkeepers, 4);
export const generateDefenders = partial(createDefenders, 7);
export const generateMidfielders = partial(createMidfielders, 7);
export const generateAttackers = partial(createAttackers, 7);

export const generateSquad = async (
  club: string,
  teamID: string,
  season: string,
): Promise<Array<Player>> => {
  const players: Array<Array<Player>> = await Promise.all([
    await generateGoalkeepers([season, club]),
    await generateDefenders([season, club]),
    await generateMidfielders([season, club]),
    await generateAttackers([season, club]),
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

  const [clubPlayersObject, Squad, Starting11] = await Promise.all(
    [
      entityObjectsCreator,
      entityReferencesCreator<Player>,
      getBestStarting11References,
    ].map(async (func: Function) => {
      return await func(clubPlayers);
    }),
  );

  // do generateClub sub function that we could run in a promise.all
  // with entityObjectsCreator, probably do second option
  const club: Club = {
    ID,
    Name: name,
    Squad,
    Starting11,
    Bench: {},
  };

  return [club, clubPlayersObject];
};
