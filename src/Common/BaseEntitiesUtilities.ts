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
  keyBy
} from "lodash/fp";
import { flowAsync, updatePaths, mapIndexed, unKeyBy } from "futil-js";
import { DEFAULTSQUADSIZE } from "./Constants";
import {
  unflatten,
  transformNestedAsFlat,
  sliceUpArray,
  getFirstLevelArrayLengths,
  getSecondLevelArrayLengths,
  minusOne,
} from "./CommonUtilities";



export const getBaseEntitiesCountries = property(["countries"]);
export const getBaseEntitiesDomesticLeagues = property(["domesticLeagues"]);
export const getBaseEntitiesClubs = property(["clubs"]);
export const getBaseEntitiesPlayers = property(["players"]);

export const flattenCompetitions = flattenDepth(1);
export const flattenClubs = flattenDepth(2);
export const flattenPlayers = flattenDepth(3);

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

export const getBaseEntitiesClubsCount = flowAsync(
  getBaseEntitiesClubs,
  flattenClubs,
  size,
);

export const convertBaseCountriesToBaseEntities = async (
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
};

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

export const getExpectedLastID = ([expectedPosition, expectedCount, expectedStartingIndex]: [string, number, number]) => `${expectedPosition}_${minusOne(expectedStartingIndex+expectedCount)}`;

export const getExpectedLastIDsForMultiplePositions = map(getExpectedLastID)

export const getActualBaseEntitiesCount = updatePaths({
  countries: getLastIDNumberOutOfIDNameTuple,
  domesticLeagues: getTotalActualDomesticLeagues,
  clubs: getTotalActualClubs,
});

export const getTotalTestDomesticLeagues = flowAsync(flattenCompetitions, size);
export const getTotalTestClubs = flowAsync(flattenClubs, size);

export const getTestBaseEntitiesCount = updatePaths({
  countries: size,
  domesticLeagues: getTotalTestDomesticLeagues,
  clubs: getTotalTestClubs,
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
  sum
);

