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
  property,
  curry,
  first,
  startsWith,
} from "lodash/fp";
import { BaseEntities, BaseCountries, Entity } from "../Types";
import { DEFAULTSQUADSIZE, IDPREFIXES } from "../Constants";
import {
  getCountOfStringsFromArray,
  getCountOfIntegersFromArray,
  getCountOfUniqueStringsFromArray,
  getCountOfUniqueIntegersFromArray,
  getFirstLevelArrayLengths,
  getCountOfItemsFromArrayForPredicate,
  getSizeMinAndMaxOfArray,
  getSizeOfCompactedAray,
  getBaseEntitiesClubIDsAsSet,
  getBaseEntitiesDomesticLeagueIDsAsSet,
  getBaseEntitiesClubIDAtSpecificIndex,
  getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet,
  getBaseEntitiesDomesticLeagueIDAtSpecificIndex,
  getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet,
  getBaseEntitiesClubs,
  getBaseEntitiesDomesticLeagues,
  isClubID,
  isDomesticLeagueID,
  getBaseEntitiesCountriesCount,
  getTestBaseEntitiesCount,
  getSecondLevelArrayLengths,
  getCountOfNumbersFromArray,
  getCountOfObjectValues,
  getBreakdownOfPlayersByPositionFromArray
} from "../Getters";
import {
  spreadMultiply,
  convertFlattenedArrayIntoSet,
  convertCharacterIntoCharacterCode,
  convertArrayOfArraysToArrayOfSets,
  addOne,
  zipApply,
  zipAllAndGetFirstArray,
  zipAllAndGetMinOfSecondArray,
} from "../Transformers";
import {
  convertArraysToSetsAndAssertStrictEqual,
  assertIntegerGreaterThanOrEqualMinAndLessThanMax,
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
  generateTestComposition,
  generateTestOutfieldPlayersComposition,
  getAListOfRandomMatches,
  fastCheckTestBaseEntitiesGenerator,
  getAListOfRandomClubIDs,
  getCompletelyRandomClubIDAndDomesticLeagueID,
  getCompletelyRandomClubID,
  getCompletelyRandomDomesticLeagueID,
  getRandomDomesticLeagueIndex,
  getRandomClubIndexFromSpecificCountryDomesticLeagueIndex,
  getRandomCountryIndex,
  getRandomDomesticLeagueIndexFromSpecificCountryIndex,
  getRandomClubIndex,
  fastCheckTestSingleBaseEntityWithSubEntitiesGenerator,
  fastCheckRandomIntegerInRangeAsString,
  fastCheckTestMixedArrayOfPositionGroupIDsGenerator
} from "../TestDataGenerationUtilities";

describe("TestDataGenerationUtilities test suite", () => {
  const IDPREFIXESCOUNT: number = pipe([getCountOfObjectValues, addOne])(
    IDPREFIXES,
  );

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
    assertIntegerGreaterThanOrEqualMinAndLessThanMax(testRange, actualDouble);
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
    assertIntegerGreaterThanOrEqualMinAndLessThanMax(
      testUTFRange,
      actualCharacterCode,
    );
  });

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

      const [actualStringIDs, actualStringCountIndexTuples]: [
        Array<string>,
        Array<[string, number]>,
      ] = fastCheckTestMixedArrayOfPositionGroupIDsGenerator(
        fcGen,
        [testMinItemCount, testRangeSize],
      );
      
      const actualPlayerCount = getBreakdownOfPlayersByPositionFromArray(actualStringIDs)

      expect(sum(actualPlayerCount)).toBeGreaterThan(testMinItemCount)
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
    (testCountriesDomesticsLeaguesCount, fcGen) => {
      const actualTestDomesticLeagues =
        fastCheckTestDomesticLeaguesForBaseCountriesGenerator(
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
    "fastCheckTestClubsForBaseCountriesGenerator",
    (testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const actualTestClubs = fastCheckTestClubsForBaseCountriesGenerator(
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

  test.prop([fc.nat(), fc.integer({ min: 2, max: 50 }), fc.gen()])(
    "fastCheckTestSingleBaseEntityWithSubEntitiesGenerator",
    (testStartingIndex, testSubEntitiesCount, fcGen) => {
      const testSubEntityIDPrefix = fastCheckRandomIntegerInRangeAsString(
        fcGen,
        [1, IDPREFIXESCOUNT],
      );
      const [actualEntityName, actualEntitySubEntities]: Entity =
        fastCheckTestSingleBaseEntityWithSubEntitiesGenerator(
          testSubEntityIDPrefix,
          fcGen,
          [testStartingIndex, testSubEntitiesCount],
        );
      const actualEntityCount = pipe([
        zipAllAndGetFirstArray,
        getCountOfItemsFromArrayForPredicate(startsWith(testSubEntityIDPrefix)),
      ])(actualEntitySubEntities);
      expect(actualEntityName).toBeTruthy();
      expect(actualEntityCount).toEqual(testSubEntitiesCount);
    },
  );

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.tuple(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
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

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.tuple(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
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

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.tuple(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
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

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.tuple(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
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

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.tuple(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
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

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.tuple(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
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

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.tuple(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
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

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.tuple(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
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

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.tuple(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
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

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.tuple(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
      ),
      fc.gen(),
      fc.integer({ min: 2, max: 20 }),
    ],
    { numRuns: 0 },
  )(
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

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.tuple(
        fc.integer({ min: 1, max: 2 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
      ),
      fc.gen(),
      fc.integer({ min: 2, max: 5 }),
    ],
    { numRuns: 0 },
  )(
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
  ])("fastCheckGenerateTestPositionGroupIDs", (testCounts) => {});

  test.prop([fc.gen()])("generateTestOutfieldPlayersComposition", (fcGen) => {
    const actualTestOutfieldPlayers: Array<number> =
      generateTestOutfieldPlayersComposition(fcGen);
    expect(actualTestOutfieldPlayers.length).toEqual(3);
    expect(sum(actualTestOutfieldPlayers)).toEqual(10);
  });

  test.prop([fc.nat(), fc.gen()])(
    "generateTestComposition",
    (testStartingIndex, fcGen) => {
      const actualComposition: Array<[number, number, number]> =
        generateTestComposition(testStartingIndex, fcGen);
      const [, actualPositionCounts, actualStartingIndices] =
        zipAll(actualComposition);
      const [actualStartingIndicesSet, expectedStartingIndicesSet] =
        convertArrayOfArraysToArrayOfSets([
          actualStartingIndices,
          [testStartingIndex],
        ]);
      expect(sum(actualPositionCounts)).toEqual(11);
      expect(actualStartingIndicesSet).toStrictEqual(
        expectedStartingIndicesSet,
      );
    },
  );

  test.prop([fc.nat(), fc.gen()], { numRuns: 0 })(
    "generateTestStartingEleven",
    (testStartingIndex, fcGen) => {
      const actualTestStartingEleven: Record<
        string,
        Array<number>
      > = generateTestComposition(testStartingIndex, fcGen);
      const actualTestStartingElevenKeys: Array<string> = Object.keys(
        actualTestStartingEleven,
      );
    },
  );
});
