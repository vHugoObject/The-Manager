import {
  zipAll,
  property,
  concat,
  initial,
  filter,
  startsWith,
  pickBy,
  size,
  pipe
} from "lodash/fp";
import { Entity } from "../Common/CommonTypes";
import { CountryArrayIndices } from "./CountryTypes";

export const isCountryID = startsWith("Country");
export const filterCountriesByID = filter(isCountryID);
export const pickCountries = pickBy((_: Entity, entityID: string): boolean =>
  isCountryID(entityID),
);
export const getCountryName = property([CountryArrayIndices.Name]);
export const getCountryDomesticLeagues = property(
  CountryArrayIndices.Competitions,
);
export const getCountryIDsCount = pipe([filterCountriesByID, size]);

export const createCountry =  (
  name: string,
  competitions: Array<[string, string]>,
): Entity => {
  return pipe([zipAll, initial, concat([name])])(competitions);
};
