import { describe, expect, assert } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  zipAll,
  pipe,
  isEqual,
  over,
  isString,
  max,
  chunk,
  first,
  last,
  property,
  identity,
  spread,
  multiply,
} from "lodash/fp";
import {
  getCountOfStringsFromArray,
  getCountOfIntegersFromArray,
  getFirstLevelArrayLengths,
  getCountOfItemsFromArrayForPredicate,
  getSizeMinAndMaxOfArray,
  getCountOfNumbersFromArray,
  getCountOfFloatsBetweenZeroAndOne,
  getCountOfUniqueIntegersFromArray,
} from "../Getters";
import {
  convertFlattenedArrayIntoSet,
  convertCharacterIntoCharacterCode,
  addOne,
  zipApply,
  addMinusOne,
} from "../Transformers";
import {
  convertArraysToSetsAndAssertStrictEqual,
  convertArraysToSetsAndAssertSubset,
  assertIntegerInRangeInclusive,
  assertIntegerInRangeExclusive,
  assertAllArrayValuesAreUnique,
  assertArrayOfIntegersInRangeExclusive,
} from "../Asserters";
import {
  fastCheckRandomCharacterGenerator,
  fastCheckNLengthArrayOfDoublesInRange,
  fastCheckRandomDoubleInRange,
  fastCheckTestLinearRangeGenerator,
  fastCheckNLengthUniqueIntegerArrayGenerator,
  fastCheckListOfXNatNumbersWithMaxGenerator,
  fastCheckNUniqueIntegersFromRangeAsArrayGenerator,
  fastCheckNLengthUniqueStringArrayGenerator,
  fastCheckNLengthArrayOfStringCountTuplesGenerator,
  fastCheckTestLinearRangeWithMinimumGenerator,
  fastCheckArrayOfNIntegerArraysGenerator,
  fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator,
  fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator,
  fastCheckNLengthArrayOfItemCountTuplesGivenItemsAndRangeOfCountsGenerator,
  fastCheckNLengthStringGenerator,
  fastCheckArrayOfNFloatsBetweenZeroAndOne,
  fastCheckTestStringArrayWithDefinedStringsPerChunk,
  fastCheckRandomItemFromArray,
  fastCheckRandomObjectKey,
  fastCheckTestIntegerArrayWithDefinedIntegersPerChunk,
  fastCheckGetRandomArrayChunk,
  fastCheckRandomItemFromArrayWithIndex,
  fastCheckRandomArrayChunkSize,
  fastCheckNRandomArrayIndicesAsStrings,
  fastCheckUnfoldRandomRangeChunk,
  fastCheckUnfoldRandomNaturalNumberRangeChunk,
  fastCheckRandomIntegerBetweenOneAnd,
  fastCheckNRandomArrayIndicesAsIntegers,
} from "../TestDataGenerators";

describe("TestPrimitiveDataGenerators test suite", () => {
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
    assertIntegerInRangeInclusive(testUTFRange, actualCharacterCode);
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

  test.prop([fc.integer({ min: 5, max: 100 }), fc.gen()])(
    "fastCheckRandomItemFromArrayWithIndex",
    (testArraySize, fcGen) => {
      const testArray: Array<string> =
        fastCheckNLengthUniqueStringArrayGenerator(fcGen, testArraySize);

      const [actualItem, actualIndex] = fastCheckRandomItemFromArrayWithIndex(
        fcGen,
        testArray,
      );
      expect(property([actualIndex], testArray)).toBe(actualItem);
    },
  );

  test.prop([fc.integer({ min: 5, max: 100 }), fc.gen()])(
    "fastCheckNRandomArrayIndicesAsIntegers",
    (testArraySize, fcGen) => {
      const testArray: Array<string> =
        fastCheckNLengthUniqueStringArrayGenerator(fcGen, testArraySize);
      const testCount: number = fastCheckRandomIntegerBetweenOneAnd(
        fcGen,
        testArraySize,
      );
      const actualIndices: Array<number> =
        fastCheckNRandomArrayIndicesAsIntegers(testCount, fcGen, testArray);
      expect(getCountOfUniqueIntegersFromArray(actualIndices)).toEqual(
        testCount,
      );
      assertArrayOfIntegersInRangeExclusive([0, testArraySize], actualIndices);
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
    fc.integer({ min: 3, max: 1000 }),
    fc.gen(),
  ])(
    "fastCheckListOfXNatNumbersWithMaxGenerator",
    (testArraySize, testMaxValue, fcGen) => {
      const actualArray: Array<number> =
        fastCheckListOfXNatNumbersWithMaxGenerator(
          fcGen,
          testMaxValue,
          testArraySize,
        );
      const [actualIntegerCount, actualMax] = over([
        getCountOfIntegersFromArray,
        max,
      ])(actualArray);
      expect(actualIntegerCount).toEqual(testArraySize);
      expect(actualMax).toBeLessThan(testMaxValue);
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

  test.prop([fc.gen(), fc.integer({ min: 3, max: 50 })])(
    "fastCheckArrayOfNFloatsBetweenZeroAndOne",
    (fcGen, testFloatCount) => {
      const actualFloats: Array<number> =
        fastCheckArrayOfNFloatsBetweenZeroAndOne(fcGen, testFloatCount);

      expect(getCountOfFloatsBetweenZeroAndOne(actualFloats)).toEqual(
        testFloatCount,
      );
    },
  );

  describe("fastCheckTestArrayWithDefinedItemsPerChunk test suite", () => {
    test.prop([fc.gen(), fc.integer({ min: 2, max: 10 })])(
      "fastCheckTestStringArrayWithDefinedStringsPerChunk",
      (fcGen, testUniqueStringsCount) => {
        const [actualArray, actualItemCountPerChunkTuples, actualChunkSize]: [
          Array<string>,
          Array<[string, Array<number>]>,
          number,
        ] = fastCheckTestStringArrayWithDefinedStringsPerChunk(
          fcGen,
          testUniqueStringsCount,
        );

        const [testItem, [testChunkIndex, expectedItemCount]] = pipe([
          fastCheckRandomItemFromArray(fcGen),
          over([
            first,
            pipe([
              last,
              over([fastCheckRandomObjectKey(fcGen), identity]),
              over([first, spread(property)]),
            ]),
          ]),
        ])(actualItemCountPerChunkTuples);

        const testPredicate = isEqual(testItem);
        const actualItemCount = pipe([
          chunk(actualChunkSize),
          property([testChunkIndex]),
          getCountOfItemsFromArrayForPredicate(testPredicate),
        ])(actualArray);

        expect(actualItemCount).toEqual(expectedItemCount);
      },
    );
    test.prop([fc.gen(), fc.integer({ min: 2, max: 10 })])(
      "fastCheckTestIntegerArrayWithDefinedIntegersPerChunk",
      (fcGen, testUniqueIntegersCount) => {
        const [actualArray, actualItemCountPerChunkTuples, actualChunkSize]: [
          Array<number>,
          Array<[number, Array<number>]>,
          number,
        ] = fastCheckTestIntegerArrayWithDefinedIntegersPerChunk(
          fcGen,
          testUniqueIntegersCount,
        );

        const [testItem, [testChunkIndex, expectedItemCount]] = pipe([
          fastCheckRandomItemFromArray(fcGen),
          over([
            first,
            pipe([
              last,
              over([fastCheckRandomObjectKey(fcGen), identity]),
              over([first, spread(property)]),
            ]),
          ]),
        ])(actualItemCountPerChunkTuples);

        const testPredicate = isEqual(testItem);
        const actualItemCount = pipe([
          chunk(actualChunkSize),
          property([testChunkIndex]),
          getCountOfItemsFromArrayForPredicate(testPredicate),
        ])(actualArray);
        expect(actualItemCount).toEqual(expectedItemCount);
      },
    );
  });

  test.prop([fc.gen(), fc.integer({ min: 2, max: 20 })])(
    "fastCheckGetRandomArrayChunk",
    (fcGen, testUniqueIntegersCount) => {
      const [testArray, testItemCountPerChunkTuples, testChunkSize]: [
        Array<number>,
        Array<[number, Array<number>]>,
        number,
      ] = fastCheckTestIntegerArrayWithDefinedIntegersPerChunk(
        fcGen,
        testUniqueIntegersCount,
      );

      const [actualChunk, actualChunkNumber]: [Array<number>, number] =
        fastCheckGetRandomArrayChunk(fcGen, [testArray, testChunkSize]);
      const [testItem, expectedPerChunkCounts] = fastCheckRandomItemFromArray(
        fcGen,
        testItemCountPerChunkTuples,
      );

      convertArraysToSetsAndAssertSubset([actualChunk, testArray]);

      const expectedCountForTestItem: number = property(
        [actualChunkNumber],
        expectedPerChunkCounts,
      );
      const testItemPredicate = isEqual(testItem);

      const actualCountForTestItem = getCountOfItemsFromArrayForPredicate(
        testItemPredicate,
        actualChunk,
      );

      expect(actualCountForTestItem).toEqual(expectedCountForTestItem);
    },
  );

  test.prop([fc.gen(), fc.integer({ min: 2, max: 100 })])(
    "fastCheckRandomArrayChunkSize",
    (fcGen, testArraySize) => {
      const testArray: Array<number> =
        fastCheckNLengthUniqueIntegerArrayGenerator(fcGen, testArraySize);

      const actualChunkSize: number = fastCheckRandomArrayChunkSize(
        fcGen,
        testArray,
      );
      assertIntegerInRangeExclusive([0, testArray.length], actualChunkSize);
    },
  );

  test.prop([fc.gen(), fc.integer({ min: 2, max: 100 })])(
    "fastCheckNRandomArrayIndicesAsStrings",
    (fcGen, testArraySize) => {
      const testArray: Array<number> =
        fastCheckNLengthUniqueIntegerArrayGenerator(fcGen, testArraySize);

      const testIndicesCount: number = fastCheckRandomArrayChunkSize(
        fcGen,
        testArray,
      );

      const actualIndices: Array<string> =
        fastCheckNRandomArrayIndicesAsStrings(
          fcGen,
          testIndicesCount,
          testArray,
        );
      assert.lengthOf(actualIndices, testIndicesCount);
      assertAllArrayValuesAreUnique(actualIndices);
    },
  );

  describe("fastCheckUnfoldRandomRangeChunk", () => {
    test.prop([
      fc.gen(),
      fc.integer({ min: 5, max: 25 }),
      fc.integer({ min: 2, max: 10 }),
    ])(
      "fastCheckUnfoldRandomRangeChunk",
      (fcGen, testChunkSize, testMultiple) => {
        const testRange: [number, number] = pipe([
          multiply(testChunkSize),
          fastCheckTestLinearRangeGenerator(fcGen),
        ])(testMultiple);

        const [actualChunk, actualChunkNumber] =
          fastCheckUnfoldRandomRangeChunk(
            testRange,
            testChunkSize,
            addOne,
            fcGen,
          );

        expect(actualChunkNumber).toBeGreaterThanOrEqual(0);
        const [actualChunkSize, actualMin, actualMax] =
          getSizeMinAndMaxOfArray(actualChunk);
        const [expectedMin, expectedMax] = testRange;
        expect(actualMin).toBeGreaterThanOrEqual(expectedMin);
        expect(actualMax).toBeLessThan(expectedMax);

        expect(addMinusOne(actualMin, actualChunkSize)).toEqual(actualMax);

        expect(actualChunkSize).toEqual(testChunkSize);
      },
    );

    test.prop([
      fc.gen(),
      fc.integer({ min: 5, max: 25 }),
      fc.integer({ min: 2, max: 10 }),
    ])(
      "fastCheckUnfoldRandomNaturalNumberRangeChunk",
      (fcGen, testChunkSize, testMultiple) => {
        const testMax: number = multiply(testChunkSize, testMultiple);
        const [actualChunk] = fastCheckUnfoldRandomNaturalNumberRangeChunk(
          testMax,
          testChunkSize,
          addOne,
          fcGen,
        );

        const [actualChunkSize, actualMin] =
          getSizeMinAndMaxOfArray(actualChunk);

        expect(actualMin).toBeGreaterThanOrEqual(0);

        expect(actualChunkSize).toEqual(testChunkSize);
      },
    );
  });
});
