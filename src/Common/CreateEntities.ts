import { flowAsync, updateAllPaths } from "futil-js";
import {
  multiply,
  map,
  zipAll,
  size,
  zipWith,
  chunk,
  flatten,
  curry,
  pipe
} from "lodash/fp";
import { PositionGroup } from "../Players/PlayerTypes";
import { BaseEntity, BaseEntities, Entity } from "./CommonTypes";
import { createCountry } from "../Countries/CountryUtilities";
import { createCompetition } from "../Competitions/CompetitionUtilities";
import { createClub } from "../Clubs/ClubUtilities";
import { generatePlayerBioDataForListOfClubs } from "../Players/PlayerUtilities";
import { BASECLUBCOMPOSITION } from "./Constants";
import {
  flattenCompetitions,
  flattenClubs,
  getBaseEntitiesDomesticLeagues,
  getBaseEntitiesClubs,
} from "./BaseEntitiesUtilities";

export const getTotalPlayersToGenerateBasedOnGivenComposition = curry(
  (
    composition: Array<[PositionGroup, number]>,
    startingIndex: number,
    totalClubs: number,
  ): Array<[PositionGroup, number, number]> => {
    return map(
      ([positionGroup, count]: [PositionGroup, number]): [
        PositionGroup,
        number,
        number,
      ] => [positionGroup, multiply(count, totalClubs), startingIndex],
    )(composition);
  },
);

export const getTotalPlayersToGenerateUsingBaseComposition =
  getTotalPlayersToGenerateBasedOnGivenComposition(BASECLUBCOMPOSITION, 0);


export const createPlayerIDsForClubs = async (
  clubs: Array<Array<Array<BaseEntity>>>,
): Promise<Array<Array<string>>> => {
  const totalClubs: number = pipe([flattenClubs, size])(clubs);

  return pipe([
    getTotalPlayersToGenerateUsingBaseComposition,
    map(
      ([positionGroup, length]: [PositionGroup, number, number]): Array<
        Array<string>
      > => {
        return chunk(
          length / totalClubs,
          Array.from(
            { length },
            (_, index: number): string => `${positionGroup}_${index}`,
          ),
        );
      },
    ),
    zipAll,
    map(flatten),
  ])(totalClubs);
};

export const createEntities = async (
  baseEntities: BaseEntities,
): Promise<Record<string, Entity>> => {
  const baseEntitiesPlayers: Array<Array<string>> = await flowAsync(
    getBaseEntitiesClubs,
    createPlayerIDsForClubs,
  )(baseEntities);

  return await flowAsync(
    updateAllPaths({
      countries: pipe([
        zipWith(
           (
            competitions: Array<BaseEntity>,
            [id, name]: BaseEntity,
          ): [string, Entity] => {
            return [id, createCountry(name, competitions)];
          },
          getBaseEntitiesDomesticLeagues(baseEntities),
        ),
      ]),
      domesticLeagues: pipe([
        flattenCompetitions,
        zipWith(
           (
            clubs: Array<BaseEntity>,
            [id, name]: BaseEntity,
          ): [string, Entity] => {
            return [id, createCompetition(name, clubs)];
          },
          flowAsync(getBaseEntitiesClubs, flattenCompetitions)(baseEntities),
        ),
      ]),
      clubs: pipe([
        flattenClubs,
        zipWith(
           (
            players: Array<string>,
            [id, name]: BaseEntity,
          ): [string, Entity] => {
            return [id, createClub(name, players)];
          },
          baseEntitiesPlayers,
        ),
      ]),
      players: async (): Promise<Array<[string, Array<number>]>> => {
        return await generatePlayerBioDataForListOfClubs(0, baseEntities);
      },
    }),
    Object.values,
    flatten,
    Object.fromEntries,
  )(baseEntities);
};
