import { zipAll } from "lodash/fp";
import { Country } from "./CountryTypes";

export const createCountry = async (
  [ID, Name]: [string, string],
  competitions: Array<[string, string]>,
): Promise<Country> => {
  const [competitionIDs] = zipAll(competitions) as [
    Array<string>,
    Array<string>,
  ];
  return {
    ID,
    Name,
    Competitions: competitionIDs,
  };
};
