import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { BaseEntities } from "../../Common/CommonTypes";
import { BaseCountries } from "../../Countries/CountryTypes";
import { property, first, over, size, multiply, pipe } from "lodash/fp";
import { isClubID } from "../../Clubs/ClubUtilities";
import { isDomesticLeagueID } from "../../Competitions/CompetitionUtilities";
import {
  getBaseEntitiesCountriesCount,
  getBaseEntitiesDomesticLeagueIDsAsSet,
  getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet,
  getBaseEntitiesDomesticLeagues,
  getBaseEntitiesClubs,
  getBaseEntitiesDomesticLeagueIDAtSpecificIndex,
  getBaseEntitiesClubIDAtSpecificIndex,
  getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet,
  getBaseEntitiesClubIDsAsSet,
  getTestBaseEntitiesCount,
  getFirstLevelArrayLengths,
  getSecondLevelArrayLengths,
} from "../../Common/index";
import { convertArraysToSetsAndAssertStrictEqual } from "../ArrayTestingUtilities"
import {
  fastCheckTestBaseCountriesGenerator,
  fastCheckTestCountriesGenerator,
  fastCheckTestDomesticLeaguesGenerator,
  fastCheckTestClubsGenerator,  
  getRandomCountryIndex,
  getRandomDomesticLeagueIndex,
  getRandomClubIndex,
  getRandomDomesticLeagueIndexFromSpecificCountryIndex,
  getCompletelyRandomDomesticLeagueID,
  getRandomClubIndexFromSpecificCountryDomesticLeagueIndex,
  getCompletelyRandomClubID,
  getCompletelyRandomClubIDAndDomesticLeagueID,
  fastCheckTestBaseEntitiesGenerator,
  getAListOfRandomClubIDs,
  getAListOfRandomMatches,  
} from "../TestEntityGenerationUtilities";

describe("TestEntityGenerationUtilities tests", async () => {

  test.prop([fc.integer({ min: 2, max: 100 }), fc.gen()])(
    "fastCheckTestCountriesGenerator",
    async (testCountriesCount, fcGen) => {
      const actualTestCountries: Array<string> =
        fastCheckTestCountriesGenerator(fcGen, testCountriesCount);
      expect(actualTestCountries.length).toStrictEqual(testCountriesCount);
    },
  );
  test.prop([
    fc.tuple(fc.integer({ min: 2, max: 5 }), fc.integer({ min: 2, max: 20 })),
    fc.gen(),
  ], {numRuns: 0})(
    "fastCheckTestDomesticLeaguesGenerator",
    async (testCountriesDomesticsLeaguesCount, fcGen) => {
      const actualTestDomesticLeagues = fastCheckTestDomesticLeaguesGenerator(
        fcGen,
        testCountriesDomesticsLeaguesCount,
      );
      const [expectedCountriesCount, expectedDomesticLeaguesPerCountryCounts]: [
        number,
        number,
      ] = testCountriesDomesticsLeaguesCount;
      const [actualCountriesCount, actualDomesticLeaguesPerCountryCounts] =
        over([size, getFirstLevelArrayLengths])(actualTestDomesticLeagues);

      convertArraysToSetsAndAssertStrictEqual([
        actualDomesticLeaguesPerCountryCounts,
        [expectedDomesticLeaguesPerCountryCounts],
      ]);

      expect(actualCountriesCount).toEqual(expectedCountriesCount);
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 2, max: 5 }),
      fc.integer({ min: 2, max: 5 }),
      fc.integer({ min: 2, max: 10 }),
    ),
    fc.gen(),
  ], {numRuns: 0})(
    "fastCheckTestClubsGenerator",
    async (testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const actualTestClubs = fastCheckTestClubsGenerator(
        fcGen,
        testCountriesDomesticsLeaguesClubsCount,
      );

      const [
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
        expectedClubsPerDomesticLeaguesCount,
      ]: [number, number, number] = testCountriesDomesticsLeaguesClubsCount;

      const [
        actualCountriesCount,
        actualDomesticLeaguesPerCountryCounts,
        actualClubsPerDomesticLeaguesCount,
      ] = over([
        size,
        getFirstLevelArrayLengths,
	getSecondLevelArrayLengths
      ])(actualTestClubs);

      expect(actualCountriesCount).toEqual(expectedCountriesCount);

      convertArraysToSetsAndAssertStrictEqual([
        actualDomesticLeaguesPerCountryCounts,
        [expectedDomesticLeaguesPerCountryCount],
        actualClubsPerDomesticLeaguesCount,
        [expectedClubsPerDomesticLeaguesCount],
      ]);
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ],{numRuns: 0})(
    "fastCheckTestBaseCountriesGenerator",
    async (testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const actualTestCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          testCountriesDomesticsLeaguesClubsCount,
          fcGen,
        );
      const [expectedCountriesCount]: [number, number, number] =
        testCountriesDomesticsLeaguesClubsCount;
      expect(actualTestCountriesDomesticLeaguesClubs.length).toEqual(
        expectedCountriesCount,
      );
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
  ], {numRuns: 0})(
    "fastCheckTestBaseEntitiesGenerator",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const actualBaseEntities: BaseEntities =
        await fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const [
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
        expectedClubsPerDomesticLeaguesCount,
      ]: [number, number, number] = testCountriesDomesticsLeaguesClubsCount;
      const actualBaseEntitiesCount =
        getTestBaseEntitiesCount(actualBaseEntities);
      const expectedEntitiesCount: Record<string, number> = {
        countries: expectedCountriesCount,
        domesticLeagues: multiply(
          expectedCountriesCount,
          expectedDomesticLeaguesPerCountryCount,
        ),
        clubs: pipe([
          multiply(expectedDomesticLeaguesPerCountryCount),
          multiply(expectedCountriesCount),
        ])(expectedClubsPerDomesticLeaguesCount),
      };
      expect(actualBaseEntitiesCount).toStrictEqual(expectedEntitiesCount);
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
  ], {numRuns: 0})(
    "getRandomCountryIndex",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities =
        await fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const actualRandomCountryIndex: string = getRandomCountryIndex(
        fcGen,
        testBaseEntities,
      );
      const expectedTotalCountries: number =
        getBaseEntitiesCountriesCount(testBaseEntities);
      expect(parseInt(actualRandomCountryIndex)).toBeGreaterThanOrEqual(0);
      expect(parseInt(actualRandomCountryIndex)).toBeLessThan(
        expectedTotalCountries,
      );
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
  ], {numRuns: 0})(
    "getRandomDomesticLeagueIndex",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities =
        await fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const actualRandomDomesticLeagueIndex: [string, string] =
        getRandomDomesticLeagueIndex(fcGen, testBaseEntities);

      const actualRandomDomesticLeagueID: string = pipe([
        getBaseEntitiesDomesticLeagues,
        property(actualRandomDomesticLeagueIndex),
        first,
      ])(testBaseEntities);

      expect(isDomesticLeagueID(actualRandomDomesticLeagueID)).toBeTruthy();
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
  ], {numRuns: 0})(
    "getRandomClubIndex",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities =
        await fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const actualRandomClubIndex: [string, string, string] =
        getRandomClubIndex(fcGen, testBaseEntities);

      const actualRandomClubID: string = pipe([
        getBaseEntitiesClubs,
        property(actualRandomClubIndex),
        first,
      ])(testBaseEntities);

      expect(isClubID(actualRandomClubID)).toBeTruthy();
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
  ], {numRuns: 0})(
    "getRandomDomesticLeagueIndexFromSpecificCountryIndex",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities =
        await fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );
      const testRandomCountryIndex: string = getRandomCountryIndex(
        fcGen,
        testBaseEntities,
      );

      const actualRandomDomesticLeagueIndex: [string, string] =
        getRandomDomesticLeagueIndexFromSpecificCountryIndex(
          [fcGen, testBaseEntities],
          testRandomCountryIndex,
        );

      const actualRandomDomesticLeagueID: string =
        getBaseEntitiesDomesticLeagueIDAtSpecificIndex(
          testBaseEntities,
          actualRandomDomesticLeagueIndex,
        );

      const expectedDomesticLeagueIDsForTestCountryAsSet: Set<string> =
        getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet(
          testBaseEntities,
          testRandomCountryIndex,
        );

      expect(
        expectedDomesticLeagueIDsForTestCountryAsSet.has(
          actualRandomDomesticLeagueID,
        ),
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
  ], {numRuns: 0})(
    "getRandomClubIndexFromSpecificCountryDomesticLeagueIndex",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities =
        await fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );
      const testDomesticLeagueIndex: [string, string] =
        getRandomDomesticLeagueIndex(fcGen, testBaseEntities);

      const actualRandomClubIndex: [string, string, string] =
        getRandomClubIndexFromSpecificCountryDomesticLeagueIndex(
          [fcGen, testBaseEntities],
          testDomesticLeagueIndex,
        );

      const actualRandomClubID: string = getBaseEntitiesClubIDAtSpecificIndex(
        testBaseEntities,
        actualRandomClubIndex,
      );

      const expectedDomesticLeagueClubIDsSet: Set<string> =
        getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet(
          testBaseEntities,
          testDomesticLeagueIndex,
        );

      expect(
        expectedDomesticLeagueClubIDsSet.has(actualRandomClubID),
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
  ], {numRuns: 0})(
    "getCompletelyRandomDomesticLeagueID",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities =
        await fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const actualRandomDomesticLeagueID: string =
        getCompletelyRandomDomesticLeagueID(fcGen, testBaseEntities);
      const expectedBaseEntitiesDomesticLeaguesIDsSet: Set<string> =
        getBaseEntitiesDomesticLeagueIDsAsSet(testBaseEntities);

      expect(
        expectedBaseEntitiesDomesticLeaguesIDsSet.has(
          actualRandomDomesticLeagueID,
        ),
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
  ], {numRuns: 0})(
    "getCompletelyRandomClubID",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities =
        await fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const actualRandomClubID: string = getCompletelyRandomClubID(
        fcGen,
        testBaseEntities,
      );
      const expectedBaseEntitiesClubIDsSet: Set<string> =
        getBaseEntitiesClubIDsAsSet(testBaseEntities);

      expect(
        expectedBaseEntitiesClubIDsSet.has(actualRandomClubID),
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
  ], {numRuns: 0})(
    "getCompletelyRandomClubAndDomesticLeague",
    async (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities =
        await fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const [actualRandomClubID, actualRandomCompetitionID]: [string, string] =
        getCompletelyRandomClubIDAndDomesticLeagueID(fcGen, testBaseEntities);
      const [
        expectedBaseEntitiesClubIDsSet,
        expectedBaseEntitiesDomesticLeaguesIDsSet,
      ] = over([
        getBaseEntitiesClubIDsAsSet,
        getBaseEntitiesDomesticLeagueIDsAsSet,
      ])(testBaseEntities);

      expect(
        expectedBaseEntitiesClubIDsSet.has(actualRandomClubID),
      ).toBeTruthy();
      expect(
        expectedBaseEntitiesDomesticLeaguesIDsSet.has(
          actualRandomCompetitionID,
        ),
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
    fc.integer({ min: 2, max: 20 }),
  ], {numRuns: 0})(
    "getAListOfRandomClubIDs",
    async (
      testSeason,
      testCountriesDomesticsLeaguesClubsCount,
      fcGen,
      testClubsCount,
    ) => {
      const testBaseEntities: BaseEntities =
        await fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const testGetAListOfRandomClubIDs = getAListOfRandomClubIDs([
        fcGen,
        testBaseEntities,
      ]);
      const actualRandomClubIDs: Array<string> =
        testGetAListOfRandomClubIDs(testClubsCount);
      expect(actualRandomClubIDs.length).toEqual(testClubsCount);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 2 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
    fc.integer({ min: 2, max: 5 }),
  ], {numRuns: 0})(
    "getAListOfRandomMatches",
    async (
      testSeason,
      testCountriesDomesticsLeaguesClubsCount,
      fcGen,
      testMatchCount,
    ) => {
      const testBaseEntities: BaseEntities =
        await fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const actualListOfRandomMatches: Array<[string, string]> =
        getAListOfRandomMatches(testMatchCount, [fcGen, testBaseEntities]);

      expect(actualListOfRandomMatches.length).toEqual(testMatchCount);
    },
  );

});
