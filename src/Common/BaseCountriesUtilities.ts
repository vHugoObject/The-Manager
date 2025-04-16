import {
  property,
  map,
  first,
  last,
  size,  
  pipe,
  over
} from "lodash/fp";
import { getFirstLevelArrayLengths,
  getSecondLevelArrayLengths }
from "./ArrayUtilities";
import { flattenCompetitions,
  flattenClubs,
} from "./BaseEntitiesUtilities";

export const getCountriesCountFromBaseCountries = pipe([map(first), size]);

export const getDomesticLeaguesPerCountryCountFromBaseCountries = pipe([
  map(property([1])),
  getFirstLevelArrayLengths,
  flattenCompetitions,
]);
export const getClubsPerDomesticLeaguesCountFromBaseCountries = pipe([
  map(last),
  getSecondLevelArrayLengths,
  flattenClubs,
]);

export const getCountriesDomesticLeaguesAndClubsCounts = over([
  getCountriesCountFromBaseCountries,
  getDomesticLeaguesPerCountryCountFromBaseCountries,
  getClubsPerDomesticLeaguesCountFromBaseCountries,
])
