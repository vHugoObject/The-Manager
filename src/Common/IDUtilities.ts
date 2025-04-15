import {
  last,
  first,
  pipe,
  curry,
  add,
  map,
  shuffle,
  pick,
  countBy
} from "lodash/fp";
import { splitOnUnderscores } from "./StringUtilities"
import { flatMapSpreadUnfold } from "./FunctionUtilities"

export const createStringID = curry((string: string, idNumber: number) => `${string}_${idNumber}`)
export const getIDPrefix = pipe([splitOnUnderscores, first]);
export const getIDSuffix = pipe([splitOnUnderscores, last]);
export const countByIDPrefix = countBy(getIDPrefix)

export const getLastEntityIDNumber = pipe([last, getIDSuffix]);

export const getLastIDNumberOutOfIDNameTuple = pipe([
  last,
  first,
  getIDSuffix,
]);

export const unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs = pipe([
  map(([string, count, startingIndex]:[string, number, number]) => {
    return [pipe([add(startingIndex), createStringID(string)]), count]
  }),
  flatMapSpreadUnfold
])

export const unfoldStringStartingIndexAndCountTuplesIntoShuffledArrayOfStringIDs = pipe([
  unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs,
  shuffle
])

export const getCountsForASetOfIDPrefixes = (idPrefixes: Array<string>, ids: Array<string>): Record<string, number> => {
  return pipe([
    countByIDPrefix,
    pick(idPrefixes)
  ])(ids)
}

