import { flowAsync, updateAllPaths } from "futil-js";
import {
  pipe,
  zipWith,
  flatten
} from "lodash/fp";
import { BaseEntity, BaseEntities, Entity } from "./CommonTypes";
import { createCountry } from "../Countries/CountryUtilities";
import { createCompetition } from "../Competitions/CompetitionUtilities";
import { createClub } from "../Clubs/ClubUtilities";
import { generatePlayerBioDataForListOfClubs, createPlayerIDsForClubs } from "../Players/PlayerUtilities";
import {
  flattenCompetitions,
  flattenClubs,
  getBaseEntitiesDomesticLeagues,
  getBaseEntitiesClubs,
} from "./BaseEntitiesUtilities";

// accepts a transformers object
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
