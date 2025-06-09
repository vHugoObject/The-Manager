import { describe, expect, assert } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  zipAll,
  pipe,
  isEqual,
  multiply,
  over,
  size,
  sum,
  isString,
} from "lodash/fp";
import { BaseCountries, Entity, PositionGroup } from "../Types";
import {
  getCountOfStringsFromArray,
  getCountOfIntegersFromArray,
  getCountOfUniqueStringsFromArray,
  getCountOfUniqueIntegersFromArray,
  getFirstLevelArrayLengths,
  getCountOfItemsFromArrayForPredicate,
  getSizeMinAndMaxOfArray,
  getSizeOfCompactedAray,
  getSecondLevelArrayLengths,
  getCountOfNumbersFromArray,
  getCountOfObjectValues,
  getCountOfPlayersByPositionFromArray,
  getDomesticLeaguesOfCountryFromBaseCountries,
  getClubsOfDomesticLeagueFromBaseCountries,
} from "../Getters";
import {
  convertFlattenedArrayIntoSet,
  convertCharacterIntoCharacterCode,
  addOne,
  zipApply,
  zipAllAndGetMinOfSecondArray,
  zipAllAndGetFirstArrayAsSet,
  convertArrayOfArraysToArrayOfSets,
} from "../Transformers";
import {
  convertArraysToSetsAndAssertStrictEqual,
  assertIntegerInRangeInclusive,
  parseIntAndAssertIntegerInRangeInclusive,
} from "../Asserters";
import {
  fastCheckTestClubsForBaseCountriesGenerator,
  fastCheckTestDomesticLeaguesForBaseCountriesGenerator,
  fastCheckTestCountriesForBaseCountriesGenerator,
  fastCheckTestBaseCountriesGenerator,
  fastCheckRandomCharacterGenerator,
  fastCheckNLengthArrayOfDoublesInRange,
  fastCheckRandomDoubleInRange,
  fastCheckTestLinearRangeGenerator,
  fastCheckNLengthUniqueIntegerArrayGenerator,
  fastCheckNUniqueIntegersFromRangeAsArrayGenerator,
  fastCheckNLengthUniqueStringArrayGenerator,
  fastCheckNLengthArrayOfStringCountTuplesGenerator,
  fastCheckTestLinearRangeWithMinimumGenerator,
  fastCheckArrayOfNIntegerArraysGenerator,
  fastCheckTestMixedArrayOfStringIDsGenerator,
  fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator,
  fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator,
  fastCheckNLengthArrayOfItemCountTuplesGivenItemsAndRangeOfCountsGenerator,
  fastCheckTestMixedArrayOfStringIDsGivenStringsGenerator,
  fastCheckTestMixedArrayOfPositionGroupIDsGenerator,
  fastCheckTestRandomBaseCountryIndex,
  fastCheckTestRandomBaseDomesticLeagueIndexFromCountry,
  fastCheckTestRandomBaseClubIndexFromCountryAndDomesticLeague,
  fastCheckTestCompletelyRandomBaseDomesticLeagueIndex,
  fastCheckTestCompletelyRandomBaseClubIndex,
  fastCheckTestCompletelyRandomBaseClub,
  fastCheckNLengthStringGenerator,
} from "../TestDataGenerationUtilities";

describe("TestDataGenerationUtilities test suite", () => {
  const POSITIONGROUPCOUNT: number = getCountOfObjectValues(PositionGroup);

  const getActualStringIndexAndCountArray = pipe([
    zipAll,
    zipApply([
      getCountOfStringsFromArray,
      getCountOfIntegersFromArray,
      getCountOfIntegersFromArray,
    ]),
  ]);
  const getActualStringAndCountArray = pipe([
    zipAll,
    zipApply([getCountOfStringsFromArray, getCountOfIntegersFromArray]),
    convertFlattenedArrayIntoSet,
  ]);

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 49 }),
      fc.integer({ min: 50, max: 100 }),
    ),
    fc.gen(),
  ])("fastCheckRandomDoubleInRange", (testRange, fcGen) => {
    const actualDouble: number = fastCheckRandomDoubleInRange(testRange, fcGen);
    assertIntegerInRangeInclusive(testRange, actualDouble);
  });

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 49 }),
      fc.integer({ min: 50, max: 100 }),
    ),
    fc.integer({ min: 2, max: 50 }),
    fc.gen(),
  ])(
    "fastCheckNLengthArrayOfDoublesInRange",
    (testRange, testArrayLength, fcGen) => {
      const actualDoubles: Array<number> =
        fastCheckNLengthArrayOfDoublesInRange(
          testRange,
          testArrayLength,
          fcGen,
        );

      const actualDoublesCount = getCountOfNumbersFromArray(actualDoubles);
      expect(actualDoublesCount).toEqual(testArrayLength);
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 49 }),
      fc.integer({ min: 50, max: 100 }),
    ),
    fc.gen(),
  ])("fastCheckRandomCharacterGenerator", (testUTFRange, fcGen) => {
    const actualCharacter: string = fastCheckRandomCharacterGenerator(
      testUTFRange,
      fcGen,
    );
    const actualCharacterCode: number =
      convertCharacterIntoCharacterCode(actualCharacter);
    assertIntegerInRangeInclusive(
      testUTFRange,
      actualCharacterCode,
    );
  });

  test.prop([fc.integer({ min: 1, max: 100 }), fc.gen()])(
    "fastCheckNLengthStringGenerator",
    (testStringLength, fcGen) => {
      const [actualString, _]: [string, Array<string>] =
        fastCheckNLengthStringGenerator(fcGen, testStringLength);
      expect(isString(actualString)).toBeTruthy();
      expect(actualString.length).toEqual(testStringLength);
    },
  );

  test.prop([fc.integer({ min: 2 }), fc.gen()])(
    "fastCheckTestLinearRangeGenerator",
    (testRangeSize, fcGen) => {
      const actualLinearRange: [number, number] =
        fastCheckTestLinearRangeGenerator(fcGen, testRangeSize);
      const [actualRangeMin, actualRangeMax] = actualLinearRange;
      const expectedRangeMax: number = addOne(actualRangeMin + testRangeSize);
      assert.isNumber(actualRangeMin);
      expect(actualRangeMax).toEqual(expectedRangeMax);
    },
  );

  test.prop([fc.integer({ min: 2 }), fc.nat(), fc.gen()])(
    "fastCheckTestLinearRangeWithMinimumGenerator",
    (testRangeSize, testRangeMin, fcGen) => {
      const actualLinearRange: [number, number] =
        fastCheckTestLinearRangeWithMinimumGenerator(fcGen, [
          testRangeMin,
          testRangeSize,
        ]);
      const [actualRangeMin] = actualLinearRange;
      expect(actualRangeMin).toBeGreaterThanOrEqual(testRangeMin);
    },
  );

  test.prop([fc.integer({ min: 2, max: 1000 }), fc.gen()])(
    "fastCheckNLengthUniqueIntegerArrayGenerator",
    (testArraySize, fcGen) => {
      const actualArray: Array<number> =
        fastCheckNLengthUniqueIntegerArrayGenerator(fcGen, testArraySize);
      const actualIntegerCount: number =
        getCountOfUniqueIntegersFromArray(actualArray);
      expect(actualIntegerCount).toEqual(testArraySize);
    },
  );

  test.prop([
    fc.integer({ min: 2, max: 1000 }),
    fc.integer({ min: 2, max: 1000 }),
    fc.gen(),
  ])(
    "fastCheckNUniqueIntegersFromRangeAsArrayGenerator",
    (testArraySize, testRangeSize, fcGen) => {
      const testRange: [number, number] = fastCheckTestLinearRangeGenerator(
        fcGen,
        testRangeSize,
      );

      const actualArray: Array<number> =
        fastCheckNUniqueIntegersFromRangeAsArrayGenerator(fcGen, [
          testRange,
          testArraySize,
        ]);

      const [expectedMin, expectedMax] = testRange;

      const [actualIntegerCount, actualMin, actualMax] =
        getSizeMinAndMaxOfArray(actualArray);
      expect(actualIntegerCount).toEqual(testArraySize);
      expect(actualMin).toBeGreaterThanOrEqual(expectedMin);
      expect(actualMax).toBeLessThanOrEqual(expectedMax);
    },
  );

  test.prop([fc.integer({ min: 2, max: 1000 }), fc.gen()])(
    "fastCheckNLengthUniqueStringArrayGenerator",
    (testArraySize, fcGen) => {
      const actualArray: Array<string> =
        fastCheckNLengthUniqueStringArrayGenerator(fcGen, testArraySize);

      const actualStringCount: number =
        getCountOfUniqueStringsFromArray(actualArray);
      expect(actualStringCount).toEqual(testArraySize);
    },
  );

  test.prop([fc.integer({ min: 2, max: 1000 }), fc.gen()])(
    "fastCheckNLengthArrayOfStringCountTuplesGenerator",
    (testArraySize, fcGen) => {
      const actualArray: Array<[string, number]> =
        fastCheckNLengthArrayOfStringCountTuplesGenerator(fcGen, testArraySize);

      const actualStringAndCountArray: Array<number> =
        getActualStringAndCountArray(actualArray);
      convertArraysToSetsAndAssertStrictEqual([
        actualStringAndCountArray,
        [testArraySize],
      ]);
    },
  );

  test.prop([fc.integer({ min: 2, max: 1000 }), fc.gen()])(
    "fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator",
    (testArraySize, fcGen) => {
      const actualArray: Array<[string, number, number]> =
        fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator(
          fcGen,
          testArraySize,
        );

      const actualCounts: Array<number> =
        getActualStringIndexAndCountArray(actualArray);

      convertArraysToSetsAndAssertStrictEqual([actualCounts, [testArraySize]]);
    },
  );

  test.prop([
    fc.integer({ min: 2, max: 25 }),
    fc.integer({ min: 2, max: 50 }),
    fc.gen(),
  ])(
    "fastCheckArrayOfNIntegerArraysGenerator",
    (testCountOfArrays, testSizeOfArrays, fcGen) => {
      const actualArray: Array<Array<number>> =
        fastCheckArrayOfNIntegerArraysGenerator(fcGen, [
          testCountOfArrays,
          testSizeOfArrays,
        ]);
      const actualArraySize: number = pipe([
        getFirstLevelArrayLengths,
        getCountOfItemsFromArrayForPredicate(isEqual(testSizeOfArrays)),
      ])(actualArray);

      expect(actualArraySize).toEqual(testCountOfArrays);
    },
  );

  test.prop([
    fc.integer({ min: 3, max: 10 }),
    fc.integer({ min: 3, max: 10 }),
    fc.integer({ min: 3, max: 100 }),
    fc.gen(),
  ])(
    "fastCheckNLengthArrayOfItemCountTuplesGivenItemsAndRangeOfCountsGenerator",
    (testStringCount, testMinItemCount, testRangeSize, fcGen) => {
      const testStrings: Array<string> =
        fastCheckNLengthUniqueStringArrayGenerator(fcGen, testStringCount);

      const actualTuples: Array<[string, number]> =
        fastCheckNLengthArrayOfItemCountTuplesGivenItemsAndRangeOfCountsGenerator(
          testStrings,
          fcGen,
          [testMinItemCount, testRangeSize],
        );

      const actualStringAndCountArray: Array<number> =
        getActualStringAndCountArray(actualTuples);
      convertArraysToSetsAndAssertStrictEqual([
        actualStringAndCountArray,
        [testStringCount],
      ]);
    },
  );

  test.prop([
    fc.integer({ min: 2, max: 10 }),
    fc.integer({ min: 2, max: 10 }),
    fc.integer({ min: 1, max: 100 }),
    fc.gen(),
  ])(
    "fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator",
    (testStringCount, testMinItemCount, testRangeSize, fcGen) => {
      const testStrings: Array<string> =
        fastCheckNLengthUniqueStringArrayGenerator(fcGen, testStringCount);

      const actualTuples: Array<[string, number, number]> =
        fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator(
          testStrings,
          fcGen,
          [testMinItemCount, testRangeSize],
        );

      const actualStringIndexAndCountArray =
        getActualStringIndexAndCountArray(actualTuples);

      convertArraysToSetsAndAssertStrictEqual([
        actualStringIndexAndCountArray,
        [testStringCount],
      ]);
    },
  );

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

  test.prop([
    fc.integer({ min: 2, max: 10 }),
    fc.integer({ min: 1, max: 100 }),
    fc.gen(),
  ])(
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
      const actualSize: number = getSizeOfCompactedAray(actualStringIDs);
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
        assertIntegerInRangeInclusive([
          0,
          expectedCountriesCount,
        ]),
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
      expect(getSizeOfCompactedAray(actualIndices)).toEqual(2);
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

      const [
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
        expectedClubsPerDomesticLeague,
      ]: [number, number, number] = testCountriesDomesticLeaguesClubsCount;

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
});
