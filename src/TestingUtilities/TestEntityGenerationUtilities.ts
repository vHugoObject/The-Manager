import {
  curry,
  concat,
  property,
  times,
  multiply,
  chunk,
  zipWith,
  zipAll,
  pipe
} from "lodash/fp";
import { fc } from "@fast-check/vitest";
import { BaseEntities } from "../Common/CommonTypes";
import { BaseCountries } from "../Countries/CountryTypes";
import {  fastCheckNLengthUniqueStringArrayGenerator } from "./TestDataGenerationUtilities"
import { fastCheckRandomObjectKey } from "./RecordTestingUtilities"
import {
  sortByIdentity,
  getBaseEntitiesCountries,
  getBaseEntitiesDomesticLeagues,
  getBaseEntitiesDomesticLeagueIDsForACountryIndex,
  getBaseEntitiesClubs,
  convertBaseCountriesToBaseEntities,
  getBaseEntitiesClubIDsForADomesticLeagueIndex,
  getBaseEntitiesDomesticLeagueIDAtSpecificIndex,
  getBaseEntitiesClubIDAtSpecificIndex
} from "../Common/index";

export const DEFAULTTESTCOUNTRIES: number = 2;
export const DEFAULTTESTCOMPETITIONSPERCOUNTRY: number = 5;
export const DEFAULTTESTCLUBSPERCOMPETITION: number = 20;

export const DEFAULTTESTMATCHESCOUNT: number = 20;
export const DEFAULTPLAYERSPERTESTMATCHES: number = 22;




export const fastCheckTestCountriesGenerator = fastCheckNLengthUniqueStringArrayGenerator
  

export const fastCheckTestDomesticLeaguesGenerator = (
  fcGen: fc.GeneratorValue,
  [countriesCount, competitionsPerCountryCount]: [number, number],
): Array<Array<string>> => {
  return pipe([
    multiply(countriesCount),
    fastCheckNLengthUniqueStringArrayGenerator(fcGen),
    chunk(competitionsPerCountryCount),
  ])(competitionsPerCountryCount);
};

export const fastCheckTestClubsGenerator = (
  fcGen: fc.GeneratorValue,
  [countriesCount, competitionsPerCountryCount, clubsPerDomesticLeaguesCount]: [
    number,
    number,
    number,
  ],
): Array<Array<Array<string>>> => {
  return pipe([
    multiply(competitionsPerCountryCount),
    multiply(clubsPerDomesticLeaguesCount),
    fastCheckNLengthUniqueStringArrayGenerator(fcGen),
    chunk(clubsPerDomesticLeaguesCount),
    chunk(competitionsPerCountryCount),
  ])(countriesCount);
};

export const fastCheckTestBaseCountriesGenerator = (
  [countriesCount, competitionsPerCountryCount, clubsPerDomesticLeaguesCount]: [
    number,
    number,
    number,
  ],
  fcGen: fc.GeneratorValue,
): BaseCountries => {
  return pipe([
    zipWith(
      (func: Function, args) => {
        return func(fcGen, args);
      },
      [
        fastCheckTestCountriesGenerator,
        fastCheckTestDomesticLeaguesGenerator,
        fastCheckTestClubsGenerator,
      ],
    ),
    zipAll,
  ])([
    countriesCount,
    [countriesCount, competitionsPerCountryCount],
    [countriesCount, competitionsPerCountryCount, clubsPerDomesticLeaguesCount],
  ]);
};

export const fastCheckTestBaseEntitiesGenerator = (
  [testSeason, testCountriesDomesticsLeaguesClubsCount]: [
    number,
    [number, number, number],
  ],
  fcGen: fc.GeneratorValue,
): BaseEntities => {
  return pipe([
    fastCheckTestBaseCountriesGenerator,
    convertBaseCountriesToBaseEntities(testSeason),
  ])(testCountriesDomesticsLeaguesClubsCount, fcGen);
};


export const getRandomCountryIndex = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): string => {
  return pipe([
    getBaseEntitiesCountries,
    fastCheckRandomObjectKey(fcGen),
  ])(testBaseEntities);
};

export const getRandomDomesticLeagueIndex = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): [string, string] => {
  const randomCountryIndex: string = getRandomCountryIndex(
    fcGen,
    testBaseEntities,
  );
  return pipe([
    getBaseEntitiesDomesticLeagues,
    property([randomCountryIndex]),
    fastCheckRandomObjectKey(fcGen),
    concat([randomCountryIndex]),
  ])(testBaseEntities);
};

export const getRandomClubIndex = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): [string, string, string] => {
  const randomClubIndex: [string, string] = getRandomDomesticLeagueIndex(
    fcGen,
    testBaseEntities,
  );
  return pipe([
    getBaseEntitiesClubs,
    property(randomClubIndex),
    fastCheckRandomObjectKey(fcGen),
    concat(randomClubIndex),
  ])(testBaseEntities);
};


export const getRandomDomesticLeagueIndexFromSpecificCountryIndex = curry(
  (
    [fcGen, testBaseEntities]: [fc.GeneratorValue, BaseEntities],
    countryIndex: string,
  ): [string, string] => {
    return pipe([
      getBaseEntitiesDomesticLeagueIDsForACountryIndex,
      fastCheckRandomObjectKey(fcGen),
      concat([countryIndex]),
    ])(testBaseEntities, countryIndex);
  },
);

export const getRandomClubIndexFromSpecificCountryDomesticLeagueIndex = curry(
  (
    [fcGen, testBaseEntities]: [fc.GeneratorValue, BaseEntities],
    countryDomesticLeagueIndicesTuple: [string, string],
  ): [string, string, string] => {
    return pipe([
      getBaseEntitiesClubIDsForADomesticLeagueIndex,
      fastCheckRandomObjectKey(fcGen),
      concat(countryDomesticLeagueIndicesTuple),
    ])(testBaseEntities, countryDomesticLeagueIndicesTuple);
  },
);

export const getCompletelyRandomDomesticLeagueID = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): string => {
  return pipe([
    getRandomDomesticLeagueIndex,
    getBaseEntitiesDomesticLeagueIDAtSpecificIndex(testBaseEntities),
  ])(fcGen, testBaseEntities);
};

export const getCompletelyRandomClubID = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): string => {
  return pipe([
    getRandomClubIndex,
    getBaseEntitiesClubIDAtSpecificIndex(testBaseEntities),
  ])(fcGen, testBaseEntities);
};

export const getCompletelyRandomClubIDAndDomesticLeagueID = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): [string, string] => {
  const [randomCountryIndex, randomCompetitionIndex, randomClubIndex] =
    getRandomClubIndex(fcGen, testBaseEntities);
  const randomCompetitionID: string =
    getBaseEntitiesDomesticLeagueIDAtSpecificIndex(testBaseEntities, [
      randomCountryIndex,
      randomCompetitionIndex,
    ]);
  const randomClubID: string = getBaseEntitiesClubIDAtSpecificIndex(
    testBaseEntities,
    [randomCountryIndex, randomCompetitionIndex, randomClubIndex],
  );

  return sortByIdentity([randomClubID, randomCompetitionID]) as [string, string];
};

export const getAListOfRandomClubIDs = curry(
  (
    [fcGen, testBaseEntities]: [fc.GeneratorValue, BaseEntities],
    clubsCount: number,
  ): Array<string> => {
    return times(() => getCompletelyRandomClubID(fcGen, testBaseEntities))(
      clubsCount,
    );
  },
);

export const getAListOfRandomMatches = curry(
  (
    matchCount: number,
    [fcGen, testBaseEntities]: [fc.GeneratorValue, BaseEntities],
  ): Array<[string, string]> => {
    return pipe([
      multiply(2),
      getAListOfRandomClubIDs([fcGen, testBaseEntities]),
      chunk(2),
    ])(matchCount);
  },
);

export const defaultGetAListOfRandomMatches = getAListOfRandomMatches(
  DEFAULTTESTMATCHESCOUNT,
);

