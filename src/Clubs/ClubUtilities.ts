import { take, flatMap, zipAll } from "lodash/fp";
import { flowAsync } from "futil-js";
import { Player } from "../Players/PlayerTypes";
import { Club } from "./ClubTypes";

import {
  filterGoalkeepers,
  filterDefenders,
  filterMidfielders,
  filterAttackers,
} from "../Players/PlayerUtilities";

// just revise the return
// compute ratings
export const getBestStarting11 = async (
  players: Array<Player>,
): Promise<Array<Player>> => {
  const playerFuncs: Array<[(arg1: Array<Player>) => Array<Player>, number]> = [
    [filterGoalkeepers, 1],
    [filterDefenders, 4],
    [filterMidfielders, 3],
    [filterAttackers, 3],
  ];

  return await flowAsync(
    flatMap(([filterFunc, playerCount]) => {
      return flowAsync(
        filterFunc,
        sortByPlayerRating,
        take(playerCount),
      )(players);
    }),
  )(playerFuncs);
};

export const createClub = async (
  [ID, Name]: [string, string],
  players: Array<[string, string]>,
): Promise<Club> => {
  const [playerIDs] = zipAll(players) as [Array<string>, Array<string>];
  return {
    ID,
    Name,
    Squad: playerIDs,
  };
};
