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
  map,
  curry,
  pipe
} from "lodash/fp";
import { updatePaths, mapIndexed } from "futil-js";
import {
  unflatten,
  transformNestedAsFlat,
  sliceUpArray,
  getFirstLevelArrayLengths,
  getSecondLevelArrayLengths,
  convertToSet,
  zipAndGetFirstArray
} from "./ArrayUtilities";
import { getCountryIDsCount } from "../Countries/CountryUtilities"
import { getDomesticLeagueIDsCount } from "../Competitions/CompetitionUtilities"
import { getClubIDsCount } from "../Clubs/ClubUtilities"

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
  (baseEntities: BaseEntities, index: string): Array<string> => {
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
   (
    season: number,
    baseCountries: Array<BaseCountry>,
  ): BaseEntities => {
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
    return pipe([
      zipAll,
      zipObject(["countries", "domesticLeagues", "clubs"]),
      pipe([updatePaths(updater)]),
    ])(baseCountries);
  },
);



export const getTestBaseEntitiesDomesticLeaguesCount = pipe([
  flattenCompetitions,
  zipAndGetFirstArray,
  getDomesticLeagueIDsCount
]);
export const getTestBaseEntitiesClubsCount = pipe([
  flattenClubs,
  zipAndGetFirstArray,
  getClubIDsCount
]);

export const getTestBaseEntitiesCount = updatePaths({
  countries: getCountryIDsCount,
  domesticLeagues: getTestBaseEntitiesDomesticLeaguesCount,
  clubs: getTestBaseEntitiesClubsCount,
});




