import { zipAll, property, initial, shuffle, concat, filter, startsWith, pickBy } from "lodash/fp";
import { CompetitionArrayIndices  } from "./CompetitionTypes";
import { flowAsync } from "futil-js"
import { Entity } from "../Common/CommonTypes";

export const isDomesticLeagueID = startsWith("DomesticLeague")
export const filterDomesticLeaguesByID = filter(isDomesticLeagueID)
export const pickDomesticLeagues = pickBy((_:Entity, entityID: string) => isDomesticLeagueID(entityID))
export const getCompetitionName = property([CompetitionArrayIndices.Name])
export const getCompetitionClubs = property(CompetitionArrayIndices.Clubs)

export const createCompetition = async (
  name: string,
  clubs: Array<[string, string]>,
): Promise<Entity> => {
  return flowAsync(zipAll,
    initial,
    shuffle,
    concat([name]),
  )(clubs)
};
