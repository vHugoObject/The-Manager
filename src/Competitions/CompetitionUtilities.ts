import { zipAll, property, initial, shuffle, concat } from "lodash/fp";
import { CompetitionArrayIndices  } from "./CompetitionTypes";
import { flowAsync } from "futil-js"
import { Entity } from "../Common/CommonTypes";

export const getCompetitionID = property([CompetitionArrayIndices.ID])
export const getCompetitionName = property([CompetitionArrayIndices.Name])
export const getCompetitionClubs = property(CompetitionArrayIndices.Clubs)

export const createCompetition = async (
  [ID, Name]: [string, string],
  clubs: Array<[string, string]>,
): Promise<Entity> => {
  return flowAsync(zipAll,
    initial,
    shuffle,
    concat([ID, Name]),
  )(clubs)
};
