import { BaseEntities } from "./CommonTypes";
import { BaseCountry } from "../Countries/CountryTypes";
import {
  zipAll,
  zipObject,
  over,
  size,
  flattenDepth,
  property,
  first,
  multiply,
  map,
  flatten,
  sum,
  curry,
  pipe
} from "lodash/fp";
import { updatePaths, mapIndexed } from "futil-js";
import { DEFAULTSQUADSIZE } from "./Constants";
import { minusOne } from "./MathUtilities"
import {
  unflatten,
  transformNestedAsFlat,
  sliceUpArray,
  getFirstLevelArrayLengths,
  getSecondLevelArrayLengths,
  convertToSet,
} from "./ArrayUtilities";
import {
  getLastIDNumberOutOfIDNameTuple
} from "./IDUtilities";

export const flattenCompetitions = flattenDepth(1);
export const flattenClubs = flattenDepth(2);
export const flattenPlayers = flattenDepth(3);

export const getBaseEntitiesCountries = property(["countries"]);
export const getBaseEntitiesDomesticLeagues = property(["domesticLeagues"]);
export const getBaseEntitiesClubs = property(["clubs"]);
export const getBaseEntitiesPlayers = property(["players"]);

export const getBaseEntitiesCountriesCount = pipe([
  getBaseEntitiesCountries,
  size,
]);
export const getBaseEntitiesDomesticLeaguesCount = pipe([
  getBaseEntitiesDomesticLeagues,
  flattenCompetitions,
  size,
]);
export const getBaseEntitiesClubsCount = pipe([
  getBaseEntitiesClubs,
  flattenClubs,
  size,
]);

export const getBaseEntitiesCountryIDs = pipe([
  getBaseEntitiesCountries,
  zipAll,
  first,
]);
export const getBaseEntitiesCountryIDsAsSet = pipe([
  getBaseEntitiesCountryIDs,
  convertToSet,
]);
export const getBaseEntitiesCountryIDAtSpecificIndex = curry(
  (baseEntities: BaseEntities, index: string): string => {
    return pipe([
      getBaseEntitiesCountries,
      property([index]),
      first,
    ])(baseEntities);
  },
);

export const getBaseEntitiesDomesticLeagueIDsForACountryIndex = curry(
  (baseEntities: BaseEntities, index: string): Set<string> => {
    return pipe([
      getBaseEntitiesDomesticLeagues,
      property([index]),
      map(first),
    ])(baseEntities);
  },
);

export const getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet = curry(
  (baseEntities: BaseEntities, index: string): Set<string> => {
    return pipe([
      getBaseEntitiesDomesticLeagueIDsForACountryIndex,
      convertToSet,
    ])(baseEntities, index);
  },
);

export const getBaseEntitiesDomesticLeagueIDsAsSet = pipe([
  getBaseEntitiesDomesticLeagues,
  flattenCompetitions,
  map(first),
  convertToSet,
]);

export const getBaseEntitiesClubIDsAsSet = pipe([
  getBaseEntitiesClubs,
  flattenClubs,
  map(first),
  convertToSet,
]);

export const getBaseEntitiesDomesticLeagueIDAtSpecificIndex = curry(
  (
    baseEntities: BaseEntities,
    countryDomesticLeagueIndicesTuple: [string, string],
  ): string => {
    return pipe([
      getBaseEntitiesDomesticLeagues,
      property(countryDomesticLeagueIndicesTuple),
      first,
    ])(baseEntities);
  },
);

export const getBaseEntitiesClubIDsForADomesticLeagueIndex = curry(
  (
    baseEntities: BaseEntities,
    countryDomesticLeagueIndexTuple: [string, string],
  ): Set<string> => {
    return pipe([
      getBaseEntitiesClubs,
      property(countryDomesticLeagueIndexTuple),
      map(first),
    ])(baseEntities);
  },
);

export const getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet = curry(
  (
    baseEntities: BaseEntities,
    countryDomesticLeagueIndexTuple: [string, string],
  ): Set<string> => {
    return pipe([
      getBaseEntitiesClubIDsForADomesticLeagueIndex,
      convertToSet,
    ])(baseEntities, countryDomesticLeagueIndexTuple);
  },
);

export const getBaseEntitiesClubIDAtSpecificIndex = curry(
  (
    baseEntities: BaseEntities,
    countryDomesticLeagueClubIndicesTuple: [string, string, string],
  ): string => {
    return pipe([
      getBaseEntitiesClubs,
      property(countryDomesticLeagueClubIndicesTuple),
      first,
    ])(baseEntities);
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
    return await pipe([
      zipAll,
      zipObject(["countries", "domesticLeagues", "clubs"]),
      pipe([updatePaths(updater)]),
    ])(baseCountries);
  },
);



export const getTotalActualDomesticLeagues = pipe([
  flattenCompetitions,
  getLastIDNumberOutOfIDNameTuple,
]);
export const getTotalActualClubs = pipe([
  flattenClubs,
  getLastIDNumberOutOfIDNameTuple,
]);

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

export const getTestBaseEntitiesDomesticLeaguesCount = pipe([
  map(size),
  sum,
]);
export const getTestBaseEntitiesClubsCount = pipe([
  map(map(size)),
  flatten,
  sum,
]);
export const getTestBaseEntitiesCount = updatePaths({
  countries: size,
  domesticLeagues: getTestBaseEntitiesDomesticLeaguesCount,
  clubs: getTestBaseEntitiesClubsCount,
});

export const getExpectedPlayersCount = pipe([
  getBaseEntitiesClubs,
  flattenClubs,
  size,
  multiply(DEFAULTSQUADSIZE),
]);

export const getExpectedEntitiesSansPlayerCount = pipe([
  getTestBaseEntitiesCount,
  Object.values,
  flatten,
  sum,
]);
