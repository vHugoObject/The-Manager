import {
  map,
  over,
  size,
  first,
  curry
} from "lodash/fp";
import { flowAsync } from "futil-js";
import { PositionGroup } from "./PlayerTypes";
import { getPlayerPositionGroupFromID,
  filterGoalkeepersByID,
  filterMidfieldersByID,
  filterAttackersByID,
  filterDefendersByID
} from "./PlayerUtilities"
import {
  convertToSet,
  splitOnUnderscores
} from "../Common/index";



export const getActualPositionGroupSet = flowAsync(map(getPlayerPositionGroupFromID), convertToSet)

export const splitFirstPlayerIDIntoAList = flowAsync(first, splitOnUnderscores)
      
export const getActualPositionCountStartingIndexTuplesSet = flowAsync(over([filterGoalkeepersByID, filterMidfieldersByID, filterAttackersByID, filterDefendersByID]),
  map((players: Array<string>): [string, number, number] => {
    const [playerPosition, playerIndex] = splitFirstPlayerIDIntoAList(players)
    return [playerPosition, size(players), parseInt(playerIndex)]
  }), convertToSet)
