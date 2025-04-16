import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  zipObject,
  toString,
  toArray,
  pipe,
  multiply
} from "lodash/fp";
import { BaseCountries } from "../../Countries/CountryTypes"
import { BaseEntities } from "../CommonTypes";
import {
  getRandomCountryIndex,
  getRandomDomesticLeagueIndex,
  getRandomClubIndex,
  fastCheckTestBaseEntitiesGenerator,
  fastCheckTestBaseCountriesGenerator
} from "../../TestingUtilities/index";
import { getClubIDsCount } from "../../Clubs/ClubUtilities";
import { getDomesticLeagueIDsCount } from "../../Competitions/CompetitionUtilities";
import {
  getBaseEntitiesCountryIDsAsSet,
  getBaseEntitiesClubsCount,
  convertBaseCountriesToBaseEntities,
  getTestBaseEntitiesCount,
  getBaseEntitiesDomesticLeagueIDsAsSet,
  getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet,
  getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet,
  getBaseEntitiesDomesticLeagueIDsForACountryIndex,
  getBaseEntitiesCountryIDAtSpecificIndex,
  getBaseEntitiesDomesticLeagueIDAtSpecificIndex,
  getBaseEntitiesClubIDAtSpecificIndex,
  getBaseEntitiesClubIDsAsSet,
} from "../BaseEntitiesUtilities";

describe("BaseEntitiesUtilities", async () => {
  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesCountryIDsAsSet",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const [expectedCountriesCount] = testCountriesDomesticsLeaguesClubsCount
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );
      const actualCountries: Set<string> =
            getBaseEntitiesCountryIDsAsSet(testBaseEntities);
      
      expect(actualCountries.size).toEqual(expectedCountriesCount);
    },
  );

  test.prop([
   fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen()
  ])(
    "getBaseEntitiesCountryIDAtSpecificIndex",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const randomCountryIndex: string = getRandomCountryIndex(
        fcGen,
        testBaseEntities,
      );
      
      const actualCountryID: string = getBaseEntitiesCountryIDAtSpecificIndex(
        testBaseEntities,
        toString(randomCountryIndex),
      );

      const expectedCountryIDsAsSet: Set<string> =
        getBaseEntitiesCountryIDsAsSet(testBaseEntities);

      expect(expectedCountryIDsAsSet.has(actualCountryID)).toBeTruthy();
    },
  );

  test.prop([
   fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen()
  ])(
    "getBaseEntitiesDomesticLeagueIDsAsSet",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const [expectedCountriesCount, expectedDomesticLeaguesPerCountryCount] = testCountriesDomesticsLeaguesClubsCount
      const expectedDomesticLeagueIDsCount: number = multiply(expectedCountriesCount, expectedDomesticLeaguesPerCountryCount)
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
      );
      
      const actualDomesticLeagueIDs: Set<string> =
        getBaseEntitiesDomesticLeagueIDsAsSet(testBaseEntities);

      expect(actualDomesticLeagueIDs.size).toEqual(expectedDomesticLeagueIDsCount)
      
    }
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesClubIDsAsSet",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {

      const [expectedCountriesCount, expectedDomesticLeaguesPerCountryCount, expectedClubsPerDomesticLeaguesCount] = testCountriesDomesticsLeaguesClubsCount
      
      const expectedClubIDsCount: number = pipe([multiply(expectedCountriesCount), multiply(expectedDomesticLeaguesPerCountryCount)])(expectedClubsPerDomesticLeaguesCount)
      
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
      );
      
      const actualClubIDs: Set<string> =
            getBaseEntitiesClubIDsAsSet(testBaseEntities);
      const actualClubIDsCount: number = pipe([toArray, getClubIDsCount])(actualClubIDs)
      expect(actualClubIDsCount).toEqual(expectedClubIDsCount)
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesDomesticLeagueIDsForACountryIndex",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {

      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
      );
      const [,expectedDomesticLeaguesPerCountryCount,] = testCountriesDomesticsLeaguesClubsCount
      const testRandomCountryIndex: string = getRandomCountryIndex(
        fcGen,
        testBaseEntities,
      );
      const actualDomesticLeagueIDs: Array<string> =
        getBaseEntitiesDomesticLeagueIDsForACountryIndex(
          testBaseEntities,
	  testRandomCountryIndex
        );
      const actualDomesticLeagueIDsCount: number = getDomesticLeagueIDsCount(actualDomesticLeagueIDs)
      expect(actualDomesticLeagueIDsCount).toEqual(expectedDomesticLeaguesPerCountryCount)
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesDomesticLeagueIDAtSpecificIndex",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
      );

      const testDomesticLeagueIndex: [string, string] =
            getRandomDomesticLeagueIndex(fcGen, testBaseEntities);
      
      const actualDomesticLeagueID: string =
        getBaseEntitiesDomesticLeagueIDAtSpecificIndex(
          testBaseEntities,
          testDomesticLeagueIndex,
        );

      const [expectedCountryIndexOfDomesticLeague]: [string, string] =
        testDomesticLeagueIndex;
      const expectedDomesticLeagueIDsSet: Set<string> =
        getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet(
          testBaseEntities,
          expectedCountryIndexOfDomesticLeague,
        );
      expect(
        expectedDomesticLeagueIDsSet.has(actualDomesticLeagueID),
      ).toBeTruthy();
    },
  );

  test.prop([
   fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesClubsCount",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {

      const [expectedCountriesCount, expectedDomesticLeaguesPerCountryCount, expectedClubsPerDomesticLeaguesCount] = testCountriesDomesticsLeaguesClubsCount

      const expectedClubsCount: number = pipe([multiply(expectedCountriesCount), multiply(expectedDomesticLeaguesPerCountryCount)])(expectedClubsPerDomesticLeaguesCount)
      
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
      );

      const actualClubsCount = getBaseEntitiesClubsCount(testBaseEntities);
      
      expect(actualClubsCount).toEqual(expectedClubsCount);
    },
  );

  test.prop([
   fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {

      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
      );

      const randomDomesticLeagueIndex: [string, string] =
        getRandomDomesticLeagueIndex(fcGen, testBaseEntities);
      const actualClubIDs: Set<string> =
        getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet(
          testBaseEntities,
          randomDomesticLeagueIndex,
        );
      const actualClubIDsCount: number = pipe([
        toArray,
        getClubIDsCount,
      ])(actualClubIDs);
      expect(actualClubIDs.size).toEqual(actualClubIDsCount);
    },
  );

  test.prop([
   fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesClubIDAtSpecificIndex",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
      );

      const testClubIndex: [string, string, string] = getRandomClubIndex(
        fcGen,
        testBaseEntities,
      );

      const actualClubID: string = getBaseEntitiesClubIDAtSpecificIndex(
        testBaseEntities,
        testClubIndex,
      );
      const [expectedCountryIndex, expectedDomesticLeagueIndex]: [
        string,
        string,
        string,
      ] = testClubIndex;
      
      const expectedDomesticLeagueClubsIDSet: Set<string> =
        getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet(testBaseEntities, [
          expectedCountryIndex,
          expectedDomesticLeagueIndex,
        ]);

      expect(expectedDomesticLeagueClubsIDSet.has(actualClubID)).toBeTruthy();
      
    },
  );


  test.prop([
   fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "convertBaseCountriesToBaseEntities",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {

      const testBaseCountries: BaseCountries = fastCheckTestBaseCountriesGenerator(testCountriesDomesticsLeaguesClubsCount, fcGen)
      const [expectedCountriesCount, expectedDomesticLeaguesPerCountryCount, expectedClubsPerDomesticLeaguesCount] = testCountriesDomesticsLeaguesClubsCount
      const expectedDomesticLeaguesCount: number = multiply(expectedCountriesCount, expectedDomesticLeaguesPerCountryCount)
      const expectedClubsCount: number = pipe([multiply(expectedCountriesCount), multiply(expectedDomesticLeaguesPerCountryCount)])(expectedClubsPerDomesticLeaguesCount)
      
      const expectedCountsObject = zipObject(["countries", "domesticLeagues", "clubs"], [expectedCountriesCount, expectedDomesticLeaguesCount, expectedClubsCount]);

      const actualBaseEntities: BaseEntities =
         convertBaseCountriesToBaseEntities(
          testSeason,
          testBaseCountries,
        );
      const actualCountsObject: Record<string, number> = getTestBaseEntitiesCount(actualBaseEntities);
      expect(actualCountsObject).toStrictEqual(expectedCountsObject);
    },
  );
});
