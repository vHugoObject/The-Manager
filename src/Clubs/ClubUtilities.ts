import {
  property,
  size,
  filter,
  startsWith,
  pickBy,
  curry,
  take,
  zipWith,
  map,
  flatten,
  overEvery,
  isString,
  pipe
} from "lodash/fp";
import { Entity } from "../Common/CommonTypes";
import { ClubArrayIndices } from "./ClubTypes";
import { Save } from "../StorageUtilities/SaveTypes";
import { DEFAULTMATCHCOMPOSITION } from "./ClubConstants";
import {
  transformNestedAsFlat,
  getFirstLevelArrayLengths,
  sliceUpArray,
} from "../Common/index";
import {
  getEntityFromSaveEntities,
  getGroupOfPlayerSkillsFromSave,
} from "../StorageUtilities/SaveUtilities";
import {
  groupPlayersByPosition,
  sortPlayersByRatings,
} from "../Players/PlayerUtilities";

export const isClubID = startsWith("Club");
export const filterClubsByID = filter(isClubID);
export const filterByStringAndClubID = filter(overEvery([isString, isClubID]));
export const pickClubs = pickBy((_: Entity, entityID: string) =>
  isClubID(entityID),
);
export const getClubName = property([ClubArrayIndices.Name]);
export const getClubSquad = property([ClubArrayIndices.Squad]);
export const getClubIDsCount = pipe([filterByStringAndClubID, size]);

export const createClub =  (
  name: string,
  squad: Array<string>,
): Entity => {
  return [name, squad];
};

export const getClubSquadFromSave = pipe([
  getEntityFromSaveEntities,
  getClubSquad,
]);

export const getClubPlayerSkillsFromSave = ([save, clubID]: [
  Save,
  string,
]): Record<string, Array<number>> => {
  return pipe([
    getClubSquadFromSave,
    (players: Array<string>) => [save, players],
    getGroupOfPlayerSkillsFromSave,
  ])([save, clubID]);
};

export const getClubBestStarting11FromSave = curry(
  (
    composition: Array<number>,
    [save, clubID]: [Save, string],
  ): Record<string, Array<number>> => {
    return pipe([
      getClubPlayerSkillsFromSave,
      groupPlayersByPosition,
      map(sortPlayersByRatings),
      zipWith(
        (
          positionCount: number,
          positionPlayers: Array<Record<string, Array<number>>>,
        ): Array<Record<string, Array<number>>> => {
          return pipe([
            Object.entries,
            take(positionCount),
          ])(positionPlayers);
        },
        composition,
      ),
      flatten,
      Object.fromEntries,
    ])([save, clubID]);
  },
);

export const getClubBestStarting11FromSaveWithDefault433 =
  getClubBestStarting11FromSave(DEFAULTMATCHCOMPOSITION);
export const getClubBestStarting11ForAGroupOfMatchupsWithDefaultCompFromSave =
  async (
    save: Save,
    matchups: Array<[string, string]>,
  ): Promise<
    Array<[Record<string, Array<number>>, Record<string, Array<number>>]>
  > => {
    return await transformNestedAsFlat([
      flatten,
      getFirstLevelArrayLengths,
      sliceUpArray,
    ])(
      map((clubID: string) =>
        getClubBestStarting11FromSaveWithDefault433([save, clubID]),
      ),
      matchups,
    );
  };
