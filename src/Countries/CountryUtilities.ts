import { zipAll, property, concat, initial, filter, startsWith, pickBy } from "lodash/fp";
import { flowAsync } from "futil-js"
import { Entity } from "../Common/CommonTypes";
import { CountryArrayIndices } from "./CountryTypes";

export const isCountryID = startsWith("Country")
export const filterCountriesByID = filter(isCountryID)
export const pickCountries = pickBy((_:Entity, entityID: string): boolean => isCountryID(entityID))
export const getCountryName = property([CountryArrayIndices.Name])
export const getCountryDomesticLeagues = property(CountryArrayIndices.Competitions)

export const createCountry = async (
  name: string,
  competitions: Array<[string, string]>,
): Promise<Entity> => {  
  return flowAsync(
    zipAll,
    initial,
    concat([name])
  )(competitions)
};

