import { zipAll, property, concat, initial } from "lodash/fp";
import { flowAsync } from "futil-js"
import { Entity } from "../Common/CommonTypes";
import { CountryArrayIndices } from "./CountryTypes";

export const getCountryID = property([CountryArrayIndices.ID])
export const getCountryName = property([CountryArrayIndices.Name])
export const getCountryCompetitions = property(CountryArrayIndices.Competitions)

export const createCountry = async (
  [ID, Name]: [string, string],
  competitions: Array<[string, string]>,
): Promise<Entity> => {  
  return flowAsync(
    zipAll,
    initial,
    concat([ID, Name])
  )(competitions)
};

