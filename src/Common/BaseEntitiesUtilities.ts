import { BaseEntities } from "./CommonTypes";
import { BaseCountry } from "../Countries/CountryTypes";
import {
  zipAll,
  zipObject,
  over,
  size,
  flattenDepth,
  last,
  property,
  split,
  first,
  multiply,
  map,
  flatten,
  sum,
  curry,
} from "lodash/fp";
import { flowAsync, updatePaths, mapIndexed } from "futil-js";
import { DEFAULTSQUADSIZE } from "./Constants";
import {
  unflatten,
  transformNestedAsFlat,
  sliceUpArray,
  getFirstLevelArrayLengths,
  getSecondLevelArrayLengths,
  minusOne,
  convertToSet,
} from "./CommonUtilities";

export const flattenCompetitions = flattenDepth(1);
export const flattenClubs = flattenDepth(2);
export const flattenPlayers = flattenDepth(3);

export const getBaseEntitiesCountries = property(["countries"]);
export const getBaseEntitiesDomesticLeagues = property(["domesticLeagues"]);
export const getBaseEntitiesClubs = property(["clubs"]);
export const getBaseEntitiesPlayers = property(["players"]);

export const getBaseEntitiesCountriesCount = flowAsync(
  getBaseEntitiesCountries,
  size,
);
export const getBaseEntitiesDomesticLeaguesCount = flowAsync(
  getBaseEntitiesDomesticLeagues,
  flattenCompetitions,
  size,
);
export const getBaseEntitiesClubsCount = flowAsync(
  getBaseEntitiesClubs,
  flattenClubs,
  size,
);

export const getBaseEntitiesCountryIDs = flowAsync(
  getBaseEntitiesCountries,
  zipAll,
  first,
);
export const getBaseEntitiesCountryIDsAsSet = flowAsync(
  getBaseEntitiesCountryIDs,
  convertToSet,
);
export const getBaseEntitiesCountryIDAtSpecificIndex = curry(
  (baseEntities: BaseEntities, index: string): string => {
    return flowAsync(
      getBaseEntitiesCountries,
      property([index]),
      first,
    )(baseEntities);
  },
);

export const getBaseEntitiesDomesticLeagueIDsForACountryIndex = curry(
  (baseEntities: BaseEntities, index: string): Set<string> => {
    return flowAsync(
      getBaseEntitiesDomesticLeagues,
      property([index]),
      map(first),
    )(baseEntities);
  },
);

export const getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet = curry(
  (baseEntities: BaseEntities, index: string): Set<string> => {
    return flowAsync(
      getBaseEntitiesDomesticLeagueIDsForACountryIndex,
      convertToSet,
    )(baseEntities, index);
  },
);

export const getBaseEntitiesDomesticLeagueIDsAsSet = flowAsync(
  getBaseEntitiesDomesticLeagues,
  flattenCompetitions,
  map(first),
  convertToSet,
);

export const getBaseEntitiesClubIDsAsSet = flowAsync(
  getBaseEntitiesClubs,
  flattenClubs,
  map(first),
  convertToSet,
);

export const getBaseEntitiesDomesticLeagueIDAtSpecificIndex = curry(
  (
    baseEntities: BaseEntities,
    countryDomesticLeagueIndicesTuple: [string, string],
  ): string => {
    return flowAsync(
      getBaseEntitiesDomesticLeagues,
      property(countryDomesticLeagueIndicesTuple),
      first,
    )(baseEntities);
  },
);

export const getBaseEntitiesClubIDsForADomesticLeagueIndex = curry(
  (
    baseEntities: BaseEntities,
    countryDomesticLeagueIndexTuple: [string, string],
  ): Set<string> => {
    return flowAsync(
      getBaseEntitiesClubs,
      property(countryDomesticLeagueIndexTuple),
      map(first),
    )(baseEntities);
  },
);

export const getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet = curry(
  (
    baseEntities: BaseEntities,
    countryDomesticLeagueIndexTuple: [string, string],
  ): Set<string> => {
    return flowAsync(
      getBaseEntitiesClubIDsForADomesticLeagueIndex,
      convertToSet,
    )(baseEntities, countryDomesticLeagueIndexTuple);
  },
);

export const getBaseEntitiesClubIDAtSpecificIndex = curry(
  (
    baseEntities: BaseEntities,
    countryDomesticLeagueClubIndicesTuple: [string, string, string],
  ): string => {
    return flowAsync(
      getBaseEntitiesClubs,
      property(countryDomesticLeagueClubIndicesTuple),
      first,
    )(baseEntities);
  },
);

export const getClubsSliceLengths = over([
  getSecondLevelArrayLengths,
  getFirstLevelArrayLengths,
]);

const transformCompetitions = transformNestedAsFlat([
  flattenCompetitions,
  getFirstLevelArrayLengths,
  sliceUpArray,
]);

const transformClubs = transformNestedAsFlat([
  flattenClubs,
  getClubsSliceLengths,
  unflatten,
]);

export const getIDNumber = flowAsync(split("_"), last, parseInt);
export const getLastEntityIDNumber = flowAsync(last, getIDNumber);

export const convertBaseCountriesToBaseEntities = curry(
  async (
    season: number,
    baseCountries: Array<BaseCountry>,
  ): Promise<BaseEntities> => {
    const updater = {
      countries: mapIndexed((countryName: string, index: number) => [
        `Country_${index + 1}`,
        countryName,
      ]),
      domesticLeagues: transformCompetitions(
        mapIndexed((competitionName: string, index: number) => [
          `DomesticLeague_${season}_${index + 1}`,
          competitionName,
        ]),
      ),
      clubs: transformClubs(
        mapIndexed((clubName: string, index: number) => [
          `Club_${season}_${index + 1}`,
          clubName,
        ]),
      ),
    };
    return await flowAsync(
      zipAll,
      zipObject(["countries", "domesticLeagues", "clubs"]),
      flowAsync(updatePaths(updater)),
    )(baseCountries);
  },
);

export const getLastIDNumberOutOfIDNameTuple = flowAsync(
  last,
  first,
  getIDNumber,
);
export const getTotalActualDomesticLeagues = flowAsync(
  flattenCompetitions,
  getLastIDNumberOutOfIDNameTuple,
);
export const getTotalActualClubs = flowAsync(
  flattenClubs,
  getLastIDNumberOutOfIDNameTuple,
);

export const getExpectedLastID = ([
  expectedPosition,
  expectedCount,
  expectedStartingIndex,
]: [string, number, number]) =>
  `${expectedPosition}_${minusOne(expectedStartingIndex + expectedCount)}`;

export const getExpectedLastIDsForMultiplePositions = map(getExpectedLastID);

export const getActualBaseEntitiesCount = updatePaths({
  countries: getLastIDNumberOutOfIDNameTuple,
  domesticLeagues: getTotalActualDomesticLeagues,
  clubs: getTotalActualClubs,
});

export const getTestBaseEntitiesDomesticLeaguesCount = flowAsync(
  map(size),
  sum,
);
export const getTestBaseEntitiesClubsCount = flowAsync(
  map(map(size)),
  flatten,
  sum,
);
export const getTestBaseEntitiesCount = updatePaths({
  countries: size,
  domesticLeagues: getTestBaseEntitiesDomesticLeaguesCount,
  clubs: getTestBaseEntitiesClubsCount,
});

export const getExpectedPlayersCount = flowAsync(
  getBaseEntitiesClubs,
  flattenClubs,
  size,
  multiply(DEFAULTSQUADSIZE),
);

export const getExpectedEntitiesSansPlayerCount: number = flowAsync(
  getTestBaseEntitiesCount,
  Object.values,
  flatten,
  sum,
);
