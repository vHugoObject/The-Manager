import { flowAsync, updateAllPaths } from "futil-js";
import {
  multiply,
  map,
  zipAll,
  size,
  zipWith,
  chunk,
  flatten,
} from "lodash/fp";
import { PositionGroup } from "../Players/PlayerTypes";
import { BaseEntity, BaseEntities, Entity } from "./CommonTypes";
import { addOne } from "./CommonUtilities";
import { createCountry } from "../Countries/CountryUtilities";
import { createCompetition } from "../Competitions/CompetitionUtilities";
import { createClub } from "../Clubs/ClubUtilities";
import { generatePlayerBioDataForListOfClubs } from "../Players/PlayerUtilities";
import { BASECLUBCOMPOSITION } from "./Constants";
import {
  flattenCompetitions,
  flattenClubs,
  getDomesticLeagues,
  getClubs,
} from "./BaseEntitiesUtilities";

export const createPlayerReferencesForClubs = async (
  clubs: Array<Array<Array<BaseEntity>>>,
): Promise<Array<Array<[string, PositionGroup]>>> => {
  const totalClubs: number = flowAsync(flattenClubs, size)(clubs);

  return flowAsync(
    map(([positionGroup, count]: [PositionGroup, number]) => [
      positionGroup,
      multiply(count, totalClubs),
    ]),
    map(
      ([positionGroup, length]: [PositionGroup, number]): Array<
        Array<[string, PositionGroup]>
      > => {
        return chunk(
          length / totalClubs,
          Array.from(
            { length },
            (_, index: number): [string, PositionGroup] => [
              `${positionGroup}_${addOne(index)}`,
              positionGroup,
            ],
          ),
        );
      },
    ),
    zipAll,
    map(flatten),
  )(BASECLUBCOMPOSITION, clubs);
};

export const createEntities = async (
  baseEntities: BaseEntities,
): Promise<Record<string, Entity>> => {
  const baseEntitiesPlayers: Array<Array<[string, PositionGroup]>> =
    await flowAsync(getClubs, createPlayerReferencesForClubs)(baseEntities);

  return await flowAsync(
    updateAllPaths({
      countries: flowAsync(
        zipWith(
          async (competitions: Array<BaseEntity>, [id, name]: BaseEntity) => {
            return [id, await createCountry([id, name], competitions)];
          },
          getDomesticLeagues(baseEntities),
        ),
      ),
      domesticLeagues: flowAsync(
        flattenCompetitions,
        zipWith(async (clubs: Array<BaseEntity>, [id, name]: BaseEntity) => {
          return [id, await createCompetition([id, name], clubs)];
        }, getClubs(baseEntities)),
      ),
      clubs: flowAsync(
        flattenClubs,
        zipWith(
          async (
            players: Array<[string, PositionGroup]>,
            [id, name]: BaseEntity,
          ) => {
            return [id, await createClub([id, name], players)];
          },
          baseEntitiesPlayers,
        ),
      ),
      players: async () => {
        return await generatePlayerBioDataForListOfClubs(0, baseEntities);
      },
    }),
    Object.values,
    flatten,
    Object.fromEntries,
  )(baseEntities);
};
