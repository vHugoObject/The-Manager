import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { property, first, over, size, multiply, pipe } from "lodash/fp";
import { BaseEntities } from "../../Common/CommonTypes";
import { BaseCountries } from "../../Countries/CountryTypes";
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
} from "../../Common/BaseEntitiesUtilities";
import {
  getFirstLevelArrayLengths,
  getSecondLevelArrayLengths,
} from "../../Common/Getters";
import { spreadMultiply } from "../../Common/Arithmetic";
import { isDomesticLeagueID } from "../../Competitions/CompetitionUtilities";
import { isClubID } from "../../Clubs/ClubUtilities";
import { convertArraysToSetsAndAssertStrictEqual } from "../ArrayTestingUtilities";
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

describe("TestEntityGenerationUtilities tests", () => {
  test.prop([fc.integer({ min: 2, max: 100 }), fc.gen()])(
    "fastCheckTestCountriesGenerator",
    (testCountriesCount, fcGen) => {
      const actualTestCountries: Array<string> =
        fastCheckTestCountriesGenerator(fcGen, testCountriesCount);
      expect(actualTestCountries.length).toStrictEqual(testCountriesCount);
    },
  );
  test.prop([
    fc.tuple(fc.integer({ min: 2, max: 5 }), fc.integer({ min: 2, max: 20 })),
    fc.gen(),
  ])(
    "fastCheckTestDomesticLeaguesGenerator",
    (testCountriesDomesticsLeaguesCount, fcGen) => {
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
  ])(
    "fastCheckTestClubsGenerator",
    (testCountriesDomesticsLeaguesClubsCount, fcGen) => {
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
      ] = over([size, getFirstLevelArrayLengths, getSecondLevelArrayLengths])(
        actualTestClubs,
      );

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
  ])(
    "fastCheckTestBaseCountriesGenerator",
    (testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const actualTestCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticsLeaguesClubsCount,
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
  ])(
    "fastCheckTestBaseEntitiesGenerator",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const actualBaseEntities: BaseEntities =
        fastCheckTestBaseEntitiesGenerator(fcGen, [
          testSeason,
          testCountriesDomesticsLeaguesClubsCount,
        ]);

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
        clubs: spreadMultiply([
          expectedCountriesCount,
          expectedDomesticLeaguesPerCountryCount,
          expectedClubsPerDomesticLeaguesCount,
        ]),
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
  ])(
    "getRandomCountryIndex",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
  ])(
    "getRandomDomesticLeagueIndex",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
  ])(
    "getRandomClubIndex",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
  ])(
    "getRandomDomesticLeagueIndexFromSpecificCountryIndex",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
  ])(
    "getRandomClubIndexFromSpecificCountryDomesticLeagueIndex",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
  ])(
    "getCompletelyRandomDomesticLeagueID",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
  ])(
    "getCompletelyRandomClubID",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
  ])(
    "getCompletelyRandomClubAndDomesticLeague",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
  ])(
    "getAListOfRandomClubIDs",
    (
      testSeason,
      testCountriesDomesticsLeaguesClubsCount,
      fcGen,
      testClubsCount,
    ) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
  ])(
    "getAListOfRandomMatches",
    (
      testSeason,
      testCountriesDomesticsLeaguesClubsCount,
      fcGen,
      testMatchCount,
    ) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
      );

      const actualListOfRandomMatches: Array<[string, string]> =
        getAListOfRandomMatches(testMatchCount, [fcGen, testBaseEntities]);

      expect(actualListOfRandomMatches.length).toEqual(testMatchCount);
    },
  );

  test.prop([
    fc.array(fc.integer({ min: 1, max: 25 }), { minLength: 4, maxLength: 4 }),
  ])("fastCheckGenerateTestPositionGroupIDs", async (testCounts) => {
    const testPositionGroupCountTuples = zip(POSITIONGROUPSLIST, testCounts);
    //expandStartingIndexAndCountIntoListOfStringIDs
    const testMixedPositionGroupsArray = testPositionGroupCountTuples;
  });
});
