import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { pipe, over, multiply, toString, toArray } from "lodash/fp";
import { BaseEntities } from "../Types";
import { convertArraysToSetsAndAssertStrictEqual } from "../Asserters";
import {
  fastCheckTestBaseEntitiesGenerator,
  getRandomCountryIndex,
  getRandomDomesticLeagueIndex,
  getRandomClubIndex,
  fakerToArb,
} from "../TestDataGenerationUtilities";
import { spreadMultiply } from "../Transformers";
import {
  getCountriesCountFromBaseCountries,
  getDomesticLeaguesPerCountryCountFromBaseCountries,
  getClubsPerDomesticLeaguesCountFromBaseCountries,
  getBaseEntitiesCountryIDsAsSet,
  getBaseEntitiesCountryIDAtSpecificIndex,
  getBaseEntitiesDomesticLeagueIDsAsSet,
  getBaseEntitiesClubIDsAsSet,
  getClubIDsCount,
  getBaseEntitiesDomesticLeagueIDsForACountryIndex,
  getDomesticLeagueIDsCount,
  getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet,
  getBaseEntitiesDomesticLeagueIDAtSpecificIndex,
  getBaseEntitiesClubsCount,
  getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet,
  getBaseEntitiesClubIDAtSpecificIndex,
} from "../Getters";

describe("BaseEntitiesGetters test suite", () => {
  test.prop([
    fc
      .tuple(
        fc.constantFrom(1, 2),
        fc.integer({ min: 1, max: 3 }),
        fc.integer({ min: 1, max: 20 }),
      )
      .chain(
        ([testCountriesCount, testDomesticLeaguesCount, testClubsCount]: [
          number,
          number,
          number,
        ]) => {
          return fc.tuple(
            fc.array(
              fc.tuple(
                fakerToArb((faker) => faker.location.country()),
                fc.array(
                  fakerToArb((faker) => faker.company.name()),
                  {
                    minLength: testDomesticLeaguesCount,
                    maxLength: testDomesticLeaguesCount,
                  },
                ),
                fc.array(
                  fc.array(
                    fakerToArb((faker) => faker.company.name()),
                    { minLength: testClubsCount, maxLength: testClubsCount },
                  ),
                  {
                    minLength: testDomesticLeaguesCount,
                    maxLength: testDomesticLeaguesCount,
                  },
                ),
              ),
              { minLength: testCountriesCount, maxLength: testCountriesCount },
            ),
            fc.tuple(
              fc.constant(testCountriesCount),
              fc.constant(testDomesticLeaguesCount),
              fc.constant(testClubsCount),
            ),
          );
        },
      ),
  ])(
    "getCountriesCountFromBaseCountries, getDomesticLeaguesPerCountryCountFromBaseCountries, getClubsPerDomesticLeaguesCountFromBaseCountries,",
    (testCountriesDomesticsLeaguesClubsWithCounts) => {
      const [
        testCountriesDomesticsLeaguesClubs,
        [
          expectedCountriesCount,
          expectedDomesticLeaguesPerCountryCount,
          expectedClubsPerDomesticLeaguesCount,
        ],
      ] = testCountriesDomesticsLeaguesClubsWithCounts;

      const [
        actualCountriesCount,
        actualDomesticLeaguesPerCountryCount,
        actualClubsPerDomesticLeagueCount,
      ] = over([
        getCountriesCountFromBaseCountries,
        getDomesticLeaguesPerCountryCountFromBaseCountries,
        getClubsPerDomesticLeaguesCountFromBaseCountries,
      ])(testCountriesDomesticsLeaguesClubs);

      convertArraysToSetsAndAssertStrictEqual([
        [actualCountriesCount],
        [expectedCountriesCount],
        actualDomesticLeaguesPerCountryCount,
        [expectedDomesticLeaguesPerCountryCount],
        actualClubsPerDomesticLeagueCount,
        [expectedClubsPerDomesticLeaguesCount],
      ]);
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
    "getBaseEntitiesCountryIDsAsSet",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const [expectedCountriesCount] = testCountriesDomesticsLeaguesClubsCount;
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
    fc.gen(),
  ])(
    "getBaseEntitiesCountryIDAtSpecificIndex",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
    fc.gen(),
  ])(
    "getBaseEntitiesDomesticLeagueIDsAsSet",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const [expectedCountriesCount, expectedDomesticLeaguesPerCountryCount] =
        testCountriesDomesticsLeaguesClubsCount;
      const expectedDomesticLeagueIDsCount: number = multiply(
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
      );
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
      );

      const actualDomesticLeagueIDs: Set<string> =
        getBaseEntitiesDomesticLeagueIDsAsSet(testBaseEntities);

      expect(actualDomesticLeagueIDs.size).toEqual(
        expectedDomesticLeagueIDsCount,
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
    "getBaseEntitiesClubIDsAsSet",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const [
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
        expectedClubsPerDomesticLeaguesCount,
      ] = testCountriesDomesticsLeaguesClubsCount;

      const expectedClubIDsCount: number = spreadMultiply([
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
        expectedClubsPerDomesticLeaguesCount,
      ]);

      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
      );

      const actualClubIDs: Set<string> =
        getBaseEntitiesClubIDsAsSet(testBaseEntities);
      const actualClubIDsCount: number = pipe([toArray, getClubIDsCount])(
        actualClubIDs,
      );
      expect(actualClubIDsCount).toEqual(expectedClubIDsCount);
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
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
      );
      const [, expectedDomesticLeaguesPerCountryCount] =
        testCountriesDomesticsLeaguesClubsCount;
      const testRandomCountryIndex: string = getRandomCountryIndex(
        fcGen,
        testBaseEntities,
      );
      const actualDomesticLeagueIDs: Array<string> =
        getBaseEntitiesDomesticLeagueIDsForACountryIndex(
          testBaseEntities,
          testRandomCountryIndex,
        );
      const actualDomesticLeagueIDsCount: number = getDomesticLeagueIDsCount(
        actualDomesticLeagueIDs,
      );
      expect(actualDomesticLeagueIDsCount).toEqual(
        expectedDomesticLeaguesPerCountryCount,
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
    "getBaseEntitiesDomesticLeagueIDAtSpecificIndex",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const [
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
        expectedClubsPerDomesticLeaguesCount,
      ] = testCountriesDomesticsLeaguesClubsCount;

      const expectedClubsCount: number = pipe([
        multiply(expectedCountriesCount),
        multiply(expectedDomesticLeaguesPerCountryCount),
      ])(expectedClubsPerDomesticLeaguesCount);

      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
      );

      const randomDomesticLeagueIndex: [string, string] =
        getRandomDomesticLeagueIndex(fcGen, testBaseEntities);
      const actualClubIDs: Set<string> =
        getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet(
          testBaseEntities,
          randomDomesticLeagueIndex,
        );
      const actualClubIDsCount: number = pipe([toArray, getClubIDsCount])(
        actualClubIDs,
      );
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
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
});
