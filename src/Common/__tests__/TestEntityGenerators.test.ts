import { describe, expect, assert } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { BaseCountries } from "../Types";
import {
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
  DEFAULTCLUBSPERCOUNTRY,
  DEFAULTPLAYERSPERCOUNTRY,
  DEFAULTSQUADSIZE,
} from "../Constants";
import { pipe, multiply, over, size, sum, identity, add } from "lodash/fp";
import {
  getCountOfStringsFromArray,
  getCountOfUniqueStringsFromArray,
  getFirstLevelArrayLengths,
  getSizeOfCompactedArray,
  getMinAndMaxOfArray,
  getSecondLevelArrayLengths,
  getDomesticLeaguesOfCountryFromBaseCountries,
  getClubsOfDomesticLeagueFromBaseCountries,
} from "../Getters";
import {
  zipAllAndGetMinOfSecondArray,
  zipAllAndGetFirstArrayAsSet,
  convertArrayOfArraysToArrayOfSets,
  mod
} from "../Transformers";
import {
  convertArraysToSetsAndAssertStrictEqual,
  parseIntAndAssertIntegerInRangeInclusive,
  assertIntegerInRangeInclusive,
} from "../Asserters";
import {
  fastCheckTestClubsForBaseCountriesGenerator,
  fastCheckTestDomesticLeaguesForBaseCountriesGenerator,
  fastCheckTestCountriesForBaseCountriesGenerator,
  fastCheckTestBaseCountriesGenerator,
  fastCheckNLengthUniqueStringArrayGenerator,
  fastCheckTestMixedArrayOfStringIDsGenerator,
  fastCheckTestMixedArrayOfStringIDsGivenStringsGenerator,
  fastCheckTestMixedArrayOfPositionGroupIDsGenerator,
  fastCheckTestRandomBaseCountryIndex,
  fastCheckTestRandomBaseDomesticLeagueIndexFromCountry,
  fastCheckTestRandomBaseClubIndexFromCountryAndDomesticLeague,
  fastCheckTestCompletelyRandomBaseDomesticLeagueIndex,
  fastCheckTestCompletelyRandomBaseClubIndex,
  fastCheckTestCompletelyRandomBaseClub,
  fastCheckTestSeasonAndPlayerNumber,
  fastCheckGenerateTestDomesticLeaguesCount,
  fastCheckGenerateTestClubsCount,
  fastCheckGenerateTestPlayersCount,
  fastCheckGenerateTestCountriesCount,
  fastCheckGenerateTestCountriesLeaguesClubsPlayersCount,
  fastCheckTestSeasonAndClubNumber,
  fastCheckTestPlayerIDGenerator,
  fastCheckTestClubIDGenerator,
  fastCheckTestArrayOfPlayerIDsGenerator,
  fastCheckTestArrayOfClubIDsGenerator,
  fastCheckRandomClubAndPlayerNumberGenerator,
  fastCheckGenerateAllPlayerNumbersOfRandomClub,
} from "../TestDataGenerators";

describe("TestEntityGenerators", () => {
  test.prop([
    fc.integer({ min: 2, max: 10 }),
    fc.integer({ min: 2, max: 10 }),
    fc.integer({ min: 1, max: 100 }),
    fc.gen(),
  ])(
    "fastCheckTestMixedArrayOfStringIDsGivenStringsGenerator",
    (testStringCount, testMinItemCount, testRangeSize, fcGen) => {
      const testStrings: Array<string> =
        fastCheckNLengthUniqueStringArrayGenerator(fcGen, testStringCount);

      const [actualStringIDs, actualStringCountIndexTuples]: [
        Array<string>,
        Array<[string, number]>,
      ] = fastCheckTestMixedArrayOfStringIDsGivenStringsGenerator(
        testStrings,
        fcGen,
        [testMinItemCount, testRangeSize],
      );

      const actualMinOfCounts: number = zipAllAndGetMinOfSecondArray(
        actualStringCountIndexTuples,
      );
      expect(actualMinOfCounts).toBeGreaterThanOrEqual(testMinItemCount);
      const expectedMinimumSize = multiply(testMinItemCount, testStringCount);
      expect(actualStringIDs.length).toBeGreaterThanOrEqual(
        expectedMinimumSize,
      );
    },
  );

  test.prop(
    [
      fc.integer({ min: 2, max: 10 }),
      fc.integer({ min: 1, max: 100 }),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
    "fastCheckTestMixedArrayOfPositionGroupIDsGenerator",
    (testMinCountOfPlayersPerPosition, testRangeSize, fcGen) => {
      const [actualStringIDs]: [Array<string>, Array<[string, number]>] =
        fastCheckTestMixedArrayOfPositionGroupIDsGenerator(fcGen, [
          testMinCountOfPlayersPerPosition,
          testRangeSize,
        ]);

      const actualPlayerCount =
        getCountOfPlayersByPositionFromArray(actualStringIDs);
      const minTotalPlayerCount: number =
        testMinCountOfPlayersPerPosition * POSITIONGROUPCOUNT;
      expect(sum(actualPlayerCount)).toBeGreaterThanOrEqual(
        minTotalPlayerCount,
      );
    },
  );

  test.prop([fc.integer({ min: 2, max: 10 }), fc.gen()])(
    "fastCheckTestMixedArrayOfStringIDsGenerator",
    (testArraySize, fcGen) => {
      const [actualStringIDs, actualStringCountIndexTuples]: [
        Array<string>,
        Array<[string, number]>,
      ] = fastCheckTestMixedArrayOfStringIDsGenerator(fcGen, testArraySize);
      expect(actualStringCountIndexTuples.length).toEqual(testArraySize);
      const actualSize: number = getSizeOfCompactedArray(actualStringIDs);
      expect(actualSize).toBeGreaterThanOrEqual(testArraySize);
    },
  );

  test.prop([fc.integer({ min: 2, max: 100 }), fc.gen()])(
    "fastCheckTestCountriesForBaseCountriesGenerator",
    (testCountriesCount, fcGen) => {
      const actualTestCountries: Array<string> =
        fastCheckTestCountriesForBaseCountriesGenerator(
          fcGen,
          testCountriesCount,
        );
      const actualCountriesCount =
        getCountOfUniqueStringsFromArray(actualTestCountries);
      expect(actualCountriesCount).toEqual(testCountriesCount);
    },
  );
  test.prop([
    fc.tuple(fc.integer({ min: 2, max: 5 }), fc.integer({ min: 2, max: 20 })),
    fc.gen(),
  ])(
    "fastCheckTestDomesticLeaguesForBaseCountriesGenerator",
    (testCountriesDomesticLeaguesCount, fcGen) => {
      const actualTestDomesticLeagues =
        fastCheckTestDomesticLeaguesForBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticLeaguesCount,
        );
      const [expectedCountriesCount, expectedDomesticLeaguesPerCountryCounts]: [
        number,
        number,
      ] = testCountriesDomesticLeaguesCount;
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
    "fastCheckTestClubsForBaseCountriesGenerator",
    (testCountriesDomesticLeaguesClubsCount, fcGen) => {
      const actualTestClubs = fastCheckTestClubsForBaseCountriesGenerator(
        fcGen,
        testCountriesDomesticLeaguesClubsCount,
      );

      const [
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
        expectedClubsPerDomesticLeaguesCount,
      ]: [number, number, number] = testCountriesDomesticLeaguesClubsCount;

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
    (testCountriesDomesticLeaguesClubsCount, fcGen) => {
      const actualTestCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticLeaguesClubsCount,
        );
      const [expectedCountriesCount]: [number, number, number] =
        testCountriesDomesticLeaguesClubsCount;
      expect(actualTestCountriesDomesticLeaguesClubs.length).toEqual(
        expectedCountriesCount,
      );
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "fastCheckTestRandomBaseCountryIndex",
    (testCountriesDomesticLeaguesClubsCount, fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticLeaguesClubsCount,
        );
      const [expectedCountriesCount]: [number, number, number] =
        testCountriesDomesticLeaguesClubsCount;
      const actualRandomBaseCountryIndex: string =
        fastCheckTestRandomBaseCountryIndex(
          fcGen,
          testCountriesDomesticLeaguesClubs,
        );

      pipe([
        parseInt,
        assertIntegerInRangeInclusive([0, expectedCountriesCount]),
      ])(actualRandomBaseCountryIndex);
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 10 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "fastCheckTestRandomBaseDomesticLeagueIndexFromCountry",
    (testCountriesDomesticLeaguesClubsCount, fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticLeaguesClubsCount,
        );

      const testRandomBaseCountryIndex: string =
        fastCheckTestRandomBaseCountryIndex(
          fcGen,
          testCountriesDomesticLeaguesClubs,
        );

      const [, expectedDomesticLeaguesPerCountryCount]: [
        number,
        number,
        number,
      ] = testCountriesDomesticLeaguesClubsCount;

      const actualRandomBaseDomesticLeagueIndex: string =
        fastCheckTestRandomBaseDomesticLeagueIndexFromCountry(
          fcGen,
          testCountriesDomesticLeaguesClubs,
          testRandomBaseCountryIndex,
        );

      parseIntAndAssertIntegerInRangeInclusive(
        [0, expectedDomesticLeaguesPerCountryCount],
        actualRandomBaseDomesticLeagueIndex,
      );
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 8 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "fastCheckTestRandomBaseClubIndexFromCountryAndDomesticLeague",
    (testCountriesDomesticLeaguesClubsCount, fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticLeaguesClubsCount,
        );

      const testRandomFullBaseDomesticLeagueIndex: [string, string] =
        fastCheckTestCompletelyRandomBaseDomesticLeagueIndex(
          fcGen,
          testCountriesDomesticLeaguesClubs,
        );

      const [, , expectedClubsPerDomesticLeague]: [number, number, number] =
        testCountriesDomesticLeaguesClubsCount;

      const actualRandomClubIndex: string =
        fastCheckTestRandomBaseClubIndexFromCountryAndDomesticLeague(
          fcGen,
          testCountriesDomesticLeaguesClubs,
          testRandomFullBaseDomesticLeagueIndex,
        );

      parseIntAndAssertIntegerInRangeInclusive(
        [0, expectedClubsPerDomesticLeague],
        actualRandomClubIndex,
      );
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 10 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "fastCheckTestCompletelyRandomBaseDomesticLeagueIndex",
    (testCountriesDomesticLeaguesClubsCount, fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticLeaguesClubsCount,
        );

      const actualIndices: [string, string] =
        fastCheckTestCompletelyRandomBaseDomesticLeagueIndex(
          fcGen,
          testCountriesDomesticLeaguesClubs,
        );
      // just checking that we get something, don't need to double check the work done by the functions this functions calls
      expect(getSizeOfCompactedArray(actualIndices)).toEqual(2);
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 8 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "fastCheckTestCompletelyRandomBaseClubIndex",
    (testCountriesDomesticLeaguesClubsCount, fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticLeaguesClubsCount,
        );

      const actualFullClubAddress: [string, string, string] =
        fastCheckTestCompletelyRandomBaseClubIndex(
          fcGen,
          testCountriesDomesticLeaguesClubs,
        );
      expect(getCountOfStringsFromArray(actualFullClubAddress)).toEqual(3);
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 8 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "fastCheckTestCompletelyRandomBaseClub",
    (testCountriesDomesticLeaguesClubsCount, fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticLeaguesClubsCount,
        );

      const [
        [actualCountryIndex, actualDomesticLeagueIndex],
        [actualCountryName, actualDomesticLeagueName, actualClubName],
      ] = fastCheckTestCompletelyRandomBaseClub(
        fcGen,
        testCountriesDomesticLeaguesClubs,
      );

      const expectedCountryNamesSet = zipAllAndGetFirstArrayAsSet(
        testCountriesDomesticLeaguesClubs,
      );
      expect(expectedCountryNamesSet.has(actualCountryName)).toBeTruthy();

      const [expectedDomesticLeagueNamesSet, expectedClubNamesSet] = pipe([
        over([
          getDomesticLeaguesOfCountryFromBaseCountries(actualCountryIndex),
          getClubsOfDomesticLeagueFromBaseCountries([
            actualCountryIndex,
            actualDomesticLeagueIndex,
          ]),
        ]),
        convertArrayOfArraysToArrayOfSets,
      ])(testCountriesDomesticLeaguesClubs);

      expect(
        expectedDomesticLeagueNamesSet.has(actualDomesticLeagueName),
      ).toBeTruthy();
      expect(expectedClubNamesSet.has(actualClubName)).toBeTruthy();
    },
  );

  test.prop([fc.gen()])("fastCheckTestSeasonAndPlayerNumber", (fcGen) => {
    const [actualSeason, actualPlayerNumber] =
      fastCheckTestSeasonAndPlayerNumber(fcGen);
    expect(actualSeason).toBeGreaterThanOrEqual(0);
    expect(actualPlayerNumber).toBeGreaterThanOrEqual(0);
  });

  test.prop([fc.gen()])("fastCheckTestSeasonAndClubNumber", (fcGen) => {
    const [actualSeason, actualClubNumber] =
      fastCheckTestSeasonAndClubNumber(fcGen);
    expect(actualSeason).toBeGreaterThanOrEqual(0);
    expect(actualClubNumber).toBeGreaterThanOrEqual(0);
  });

  test.prop([fc.gen()])("fastCheckGenerateTestCountriesCount", (fcGen) => {
    const actualCountriesCount: number =
      fastCheckGenerateTestCountriesCount(fcGen);
    expect(actualCountriesCount).toBeGreaterThanOrEqual(2);
  });

  test.prop([fc.gen()])(
    "fastCheckGenerateTestCountriesLeaguesClubsPlayersCount",
    (fcGen) => {
      const [
        ,
        actualDomesticLeaguesCount,
        actualClubsCount,
        actualPlayersCount,
      ] = fastCheckGenerateTestCountriesLeaguesClubsPlayersCount(fcGen);

      expect(actualDomesticLeaguesCount).toBeGreaterThanOrEqual(
        DEFAULTDOMESTICLEAGUESPERCOUNTRY * 2,
      );
      expect(actualClubsCount).toBeGreaterThanOrEqual(
        DEFAULTCLUBSPERCOUNTRY * 2,
      );
      expect(actualPlayersCount).toBeGreaterThanOrEqual(
        DEFAULTPLAYERSPERCOUNTRY * 2,
      );
    },
  );

  test.prop([fc.gen()])(
    "fastCheckGenerateTestDomesticLeaguesCount",
    (fcGen) => {
      const [actualDomesticLeaguesCount] =
        fastCheckGenerateTestDomesticLeaguesCount(fcGen);
      expect(actualDomesticLeaguesCount).toBeGreaterThanOrEqual(
        DEFAULTDOMESTICLEAGUESPERCOUNTRY * 2,
      );
    },
  );

  test.prop([fc.gen()])("fastCheckGenerateTestClubsCount", (fcGen) => {
    const [actualClubsCount] = fastCheckGenerateTestClubsCount(fcGen);
    expect(actualClubsCount).toBeGreaterThanOrEqual(DEFAULTCLUBSPERCOUNTRY * 2);
  });

  test.prop([fc.gen()])("fastCheckGenerateTestPlayersCount", (fcGen) => {
    const [actualPlayersCount] = fastCheckGenerateTestPlayersCount(fcGen);
    expect(actualPlayersCount).toBeGreaterThanOrEqual(
      DEFAULTPLAYERSPERCOUNTRY * 2,
    );
  });

  describe("idGenerators", () => {
    test.prop([fc.gen()])("fastCheckTestPlayerIDGenerator", (fcGen) => {
      const actualPlayerID: string = fastCheckTestPlayerIDGenerator(fcGen);
      assert.isString(actualPlayerID);
      expect(actualPlayerID).toContain("_");
    });

    test.prop([fc.gen()])("fastCheckTestClubIDGenerator", (fcGen) => {
      const actualID: string = fastCheckTestClubIDGenerator(fcGen);
      assert.isString(actualID);
      expect(actualID).toContain("_");
    });

    test.prop([fc.gen(), fc.integer({ min: 5, max: 100 })])(
      "fastCheckTestArrayOfClubIDsGenerator",
      (fcGen, testClubsCount) => {
        const actualIDs: Array<string> = fastCheckTestArrayOfClubIDsGenerator(
          fcGen,
          testClubsCount,
        );
        const actualStringCount = getCountOfStringsFromArray(actualIDs);
        expect(actualStringCount).toEqual(testClubsCount);
      },
    );

    test.prop([fc.gen(), fc.integer({ min: 5, max: 100 })])(
      "fastCheckTestArrayOfPlayerIDsGenerator",
      (fcGen, testPlayersCount) => {
        const actualIDs: Array<string> = fastCheckTestArrayOfPlayerIDsGenerator(
          fcGen,
          testPlayersCount,
        );
        const actualStringCount = getCountOfStringsFromArray(actualIDs);
        expect(actualStringCount).toEqual(testPlayersCount);
      },
    );

    test.prop([fc.gen()])(
      "fastCheckRandomClubAndPlayerNumberGenerator",
      (fcGen) => {
        const [actualClubNumber, actualPlayerNumber]: Array<number> =
          fastCheckRandomClubAndPlayerNumberGenerator(fcGen);

        const expectedRange: [number, number] = pipe([
          multiply(actualClubNumber),
          over<number>([identity, add(DEFAULTSQUADSIZE)]),
        ])(DEFAULTSQUADSIZE) as [number, number];
        assertIntegerInRangeInclusive(expectedRange, actualPlayerNumber);
      },
    );
  });

  test.prop([fc.gen()])(
    "fastCheckGenerateAllPlayerNumbersOfRandomClub",
    (fcGen) => {
      const actualPlayerNumbers: Array<number> =
        fastCheckGenerateAllPlayerNumbersOfRandomClub(identity, fcGen);
      const [actualMin, actualMax] = getMinAndMaxOfArray(actualPlayerNumbers);
      expect(mod(DEFAULTSQUADSIZE, actualMax+1)).toEqual(0)
      expect(add(actualMin-1, DEFAULTSQUADSIZE)).toEqual(actualMax)
    },
  );
});
