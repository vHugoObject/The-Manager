import { test, fc } from "@fast-check/vitest";
import { describe, expect, assert } from "vitest";
import {
  map,
  last,
  pipe,
  first,
  multiply,
  add,
  head,
  subtract,
  partialRight,
  sum,
} from "lodash/fp";
import {
  fastCheckTestLinearRangeGenerator,
  fastCheckNLengthArrayOfDoublesBetweenZeroAndOne,
  fastCheckRandomFloatBetweenZeroAndOne,
  fastCheckArrayOfNFloatsBetweenZeroAndOne,
  fastCheckRandomIntegerInRange,
  fastCheckTestLinearRangeWithMinimumGenerator,
  fastCheckRandomIntegerBetweenOneAnd,
} from "../TestDataGenerators";
import {
  assertArrayOfIntegersInRangeExclusive,
  assertIntegerInRangeInclusive,
  assertIntegerInRangeExclusive,
  assertBetweenZeroAndOneHundred,
} from "../Asserters";
import { getMinAndMaxOfArray } from "../Getters";
import {
  minusOne,
  nonZeroBoundedModularAddition,
  weightedRandom,
  getRunningSumOfList,
  getRunningSumOfListOfTuples,
  simpleModularArithmetic,
  addOne,
  multiplyByTwo,
  getRandomIntegerInRange,
  getRandomPlusOrMinus,
  accumulate,
  reverseThenSpreadSubtract,
  weightedMean,
  normalizeArrayOfNumbers,
  adjustRangeByPercentage,
  convertRangeIndexIntoInteger,
  convertRangeIndexAndCycleCountIntoInteger,
  unfold,
  generalizedPentagonalNumbersFromFive,
  sumOfFirstNGeneralizedPentagonalNumbersFromFive,
  percentageOfGeneralizedPentagonalNumbersFromFiveForGivenRange,
} from "../Transformers";

describe("MathTransformers test suite", () => {
  test.prop([fc.gen()])("normalizeArrayOfNumbers", (fcGen) => {
    const testCount: number = fastCheckRandomIntegerInRange(fcGen, [5, 100]);
    const testPercentages: Array<number> =
      fastCheckArrayOfNFloatsBetweenZeroAndOne(fcGen, testCount);
    const actualPercentages: Array<number> =
      normalizeArrayOfNumbers(testPercentages);
    actualPercentages.forEach((actualPercentage: number) => {
      expect(actualPercentage).toBeGreaterThan(0);
      expect(actualPercentage).toBeLessThan(1);
    });
  });

  test.prop([fc.array(fc.integer(), { minLength: 2 }), fc.gen()])(
    "weightedMean",
    (testIntegers, fcGen) => {
      const testWeights = fastCheckNLengthArrayOfDoublesBetweenZeroAndOne(
        testIntegers.length,
        fcGen,
      );
      const actualWeightedMean: number = weightedMean(
        testWeights,
        testIntegers,
      );
      const [min, max] = getMinAndMaxOfArray(testIntegers);
      assertIntegerInRangeInclusive([min, max], actualWeightedMean);
    },
  );

  test.prop([fc.array(fc.integer(), { minLength: 2 }), fc.gen()])(
    "weightedRandom",
    (testIntegers, fcGen) => {
      const testPercentages = fastCheckNLengthArrayOfDoublesBetweenZeroAndOne(
        testIntegers.length,
        fcGen,
      );

      const actualChosenNumber: number = weightedRandom([
        testPercentages,
        testIntegers,
      ]);

      const setOfTestIntegers: Set<number> = new Set(testIntegers);
      expect(setOfTestIntegers.has(actualChosenNumber)).toBeTruthy();
    },
  );

  test.prop([fc.array(fc.integer({ min: 1 }), { minLength: 2 })])(
    "getRunningSumOfList",
    (testNums) => {
      const actualSummedArray: Array<number> = getRunningSumOfList(testNums);
      const expectedLastValue: number = sum(testNums);

      assert.lengthOf(actualSummedArray, testNums.length);
      expect(head(actualSummedArray)).toEqual(head(testNums));
      expect(last(actualSummedArray)).toEqual(expectedLastValue);
    },
  );

  test.prop([
    fc.array(fc.tuple(fc.string(), fc.integer({ min: 1 })), { minLength: 4 }),
  ])("getRunningSumOfListOfTuples", (testStringCountTuples) => {
    const actualTuples: Array<[string, number, number]> =
      getRunningSumOfListOfTuples(0, testStringCountTuples);
    const expectedLastValue: number = pipe([map(last), sum])(
      testStringCountTuples,
    );

    assert.lengthOf(actualTuples, testStringCountTuples.length);
    const expectedFirstTuple: [string, number, number] = pipe([
      first,
      ([expectedString, expectedCount]: [string, number]) => [
        expectedString,
        expectedCount,
        expectedCount,
      ],
    ])(testStringCountTuples);
    const expectedLastTuple: [string, number, number] = pipe([
      last,
      ([expectedString, expectedCount]: [string, number]) => [
        expectedString,
        expectedCount,
        expectedLastValue,
      ],
    ])(testStringCountTuples);

    expect(first(actualTuples)).toStrictEqual(expectedFirstTuple);
    expect(last(actualTuples)).toStrictEqual(expectedLastTuple);
  });

  test.prop([
    fc.integer({ min: 5, max: 100 }).chain((rangeMax: number) => {
      return fc.tuple(
        fc.integer({ min: 1, max: rangeMax }),
        fc.constant(rangeMax),
      );
    }),
  ])("simpleModularArithmetic", (testNumAndRangeMax) => {
    const [testNum, rangeMax]: [number, number] = testNumAndRangeMax;
    const testRangeMax = pipe([multiplyByTwo, minusOne])(rangeMax);
    const testModularAddition = simpleModularArithmetic(addOne);
    const testModularSubtraction = simpleModularArithmetic(minusOne);
    const actualNumberAfterSutraction = testModularSubtraction(
      testRangeMax,
      testNum,
    );
    const actualNumberAfterAddition = testModularAddition(
      testRangeMax,
      testNum,
    );

    map((actualNumber) => {
      expect(actualNumber).toBeGreaterThanOrEqual(0);
      expect(actualNumber).toBeLessThanOrEqual(testRangeMax);
      expect(actualNumber).not.toEqual(testNum);
    })([actualNumberAfterAddition, actualNumberAfterSutraction]);
  });

  test.prop([
    fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1000 })),
  ])("getRandomIntegerInRange", (testRange) => {
    const [expectedMin, expectedMax]: [number, number] = testRange;

    const actualNumber = getRandomIntegerInRange(testRange);
    expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
    expect(actualNumber).toBeLessThanOrEqual(expectedMax);
  });

  test.prop([fc.gen(), fc.integer({ min: 2 })])(
    "test nonZeroBoundedModularAddition at rangeMax-1",
    (fcGen, testRangeSize) => {
      const [testRangeMin, testRangeMax]: [number, number] =
        fastCheckTestLinearRangeGenerator(fcGen, testRangeSize);
      const actualResult: number = nonZeroBoundedModularAddition(
        [testRangeMin, testRangeMax],
        1,
        minusOne(testRangeMax),
      );
      expect(actualResult).toEqual(testRangeMin);
    },
  );

  test.prop([fc.gen(), fc.integer({ min: 2 })])(
    "test nonZeroBoundedModularAddition at rangeMax-2",
    (fcGen, testRangeSize) => {
      const [testRangeMin, testRangeMax]: [number, number] =
        fastCheckTestLinearRangeGenerator(fcGen, testRangeSize);
      const actualResult: number = nonZeroBoundedModularAddition(
        [testRangeMin, testRangeMax],
        1,
        subtract(testRangeMax, 2),
      );
      expect(actualResult).toEqual(minusOne(testRangeMax));
    },
  );

  test.prop([fc.gen(), fc.integer({ min: 2 })])(
    "test nonZeroBoundedModularAddition at rangeMin",
    (fcGen, testRangeSize) => {
      const [testRangeMin, testRangeMax]: [number, number] =
        fastCheckTestLinearRangeGenerator(fcGen, testRangeSize);
      const actualResult: number = nonZeroBoundedModularAddition(
        [testRangeMin, testRangeMax],
        1,
        testRangeMin,
      );
      expect(actualResult).toEqual(addOne(testRangeMin));
    },
  );

  test.prop([fc.gen(), fc.integer({ min: 2 })])(
    "test nonZeroBoundedModularAddition with multiple increases",
    (fcGen, testRangeSize) => {
      const [testRangeMin, testRangeMax]: [number, number] =
        fastCheckTestLinearRangeGenerator(fcGen, testRangeSize);
      const actualResultOne: number = nonZeroBoundedModularAddition(
        [testRangeMin, testRangeMax],
        1,
        testRangeMin,
      );
      const actualResultTwo: number = nonZeroBoundedModularAddition(
        [testRangeMin, testRangeMax],
        1,
        actualResultOne,
      );

      expect(actualResultOne).toBeLessThan(actualResultTwo);
    },
  );

  test.prop([
    fc.gen(),
    fc.integer({ min: 2 }),
    fc.integer({ min: 2 }),
    fc.integer({ min: 2 }),
  ])(
    "general nonZeroBoundedModularAddition test",
    (fcGen, testRangeSize, testIncrease, testCurrentNumber) => {
      const testRange: [number, number] = fastCheckTestLinearRangeGenerator(
        fcGen,
        testRangeSize,
      );
      const actualResult: number = nonZeroBoundedModularAddition(
        testRange,
        testIncrease,
        testCurrentNumber,
      );
      assertIntegerInRangeExclusive(testRange, actualResult);
    },
  );

  test.prop([fc.integer({ min: 1 })])("getRandomPlusOrMinus", (testNumber) => {
    const actualNumber = getRandomPlusOrMinus(testNumber);
    const expectedMin: number = -1 * testNumber;
    expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
    expect(actualNumber).toBeLessThan(testNumber);
  });

  test.prop([fc.gen(), fc.integer({ min: 2 })])(
    "reverseThenSpreadSubtract",
    (fcGen, testRangeSize) => {
      const actualRange: [number, number] = fastCheckTestLinearRangeGenerator(
        fcGen,
        testRangeSize,
      );
      const actualDifference: number = reverseThenSpreadSubtract(actualRange);
      const expectedDifference: number = addOne(testRangeSize);
      expect(actualDifference).toEqual(expectedDifference);
    },
  );

  test.prop([fc.array(fc.integer({ min: 1 }), { minLength: 2 })])(
    "accumulate",
    (testNums) => {
      const actualSummedArray: Array<number> = accumulate([add, 0], testNums);
      const expectedLastValue: number = sum(testNums);

      expect(actualSummedArray.length).toEqual(testNums.length);
      expect(head(actualSummedArray)).toEqual(head(testNums));
      expect(last(actualSummedArray)).toEqual(expectedLastValue);

      const actualMultipliedArray: Array<number> = accumulate(
        [multiply, 1],
        testNums,
      );
      expect(head(actualMultipliedArray)).toEqual(head(testNums));
      const [firstVal, secondVal] = testNums;
      expect(last(actualMultipliedArray)).toBeGreaterThanOrEqual(
        multiply(firstVal, secondVal),
      );
    },
  );

  test.prop([fc.gen(), fc.integer({ min: 2 })])(
    "adjustRangeByPercentage",
    (fcGen, testRangeSize) => {
      const [testMin, testMax]: [number, number] =
        fastCheckTestLinearRangeWithMinimumGenerator(fcGen, [
          10,
          testRangeSize,
        ]);
      const testPercentage: number =
        fastCheckRandomFloatBetweenZeroAndOne(fcGen);
      const [actualMin, actualMax] = adjustRangeByPercentage(
        [testMin, testMax],
        testPercentage,
      );

      expect(actualMin).toBeLessThan(actualMax);
      expect(actualMin).toBeGreaterThan(0);
      expect(actualMin).toBeLessThanOrEqual(testMin);
      expect(actualMax).toBeLessThanOrEqual(testMax);
    },
  );

  test.prop([
    fc.gen(),
    fc.integer({ min: 100, max: 1_000_000_00 }),
    fc.integer({ min: 1, max: 1000 }),
  ])(
    "convertRangeIndexIntoInteger",
    (fcGen, testRangeSize, testIndicesCount) => {
      const testRange: [number, number] = fastCheckTestLinearRangeGenerator(
        fcGen,
        testRangeSize,
      );
      const testStep: number = pipe([
        multiply(testRangeSize),
        fastCheckRandomIntegerBetweenOneAnd(fcGen),
      ])(testIndicesCount);

      const actualIntegers = unfold((testIndex: number): number =>
        convertRangeIndexIntoInteger(testRange, [testStep, testIndex]),
      )(testIndicesCount);

      assertArrayOfIntegersInRangeExclusive(testRange, actualIntegers);
    },
  );

  test.prop([
    fc.gen(),
    fc.integer({ min: 100, max: 1_000_000_00 }),
    fc.integer({ min: 1000, max: 100_000 }),
  ])(
    "convertRangeIndexAndCycleCountIntoInteger",
    (fcGen, testRangeSize, testItemsCount) => {
      const [testRangeMin, testRangeMax]: [number, number] =
        fastCheckTestLinearRangeGenerator(fcGen, testRangeSize);
      const [testCycles, testIndex]: [number, number] = unfold(
        (_: number) =>
          fastCheckRandomIntegerBetweenOneAnd(fcGen, testItemsCount),
        2,
      );

      const actualInteger: number = convertRangeIndexAndCycleCountIntoInteger(
        testCycles,
        [testRangeMin, testRangeMax],
        testItemsCount,
        testIndex,
      );
      assertIntegerInRangeInclusive(
        [testRangeMin, testRangeMax],
        actualInteger,
      );
    },
  );

  describe("pentagonal numbers", () => {
    test.prop([fc.nat()])(
      "generalizedPentagonalNumbersFromFive",
      (testNatNumber) => {
        const actualNumber: number =
          generalizedPentagonalNumbersFromFive(testNatNumber);
        expect(actualNumber).toBeGreaterThanOrEqual(7);
      },
    );

    test.prop([fc.integer({ min: 2, max: 100 })])(
      "sumOfFirstNGeneralizedPentagonalNumbersFromFive",
      (testNatNumber) => {
        const actualNumber: number =
          sumOfFirstNGeneralizedPentagonalNumbersFromFive(testNatNumber);
        expect(actualNumber).toBeGreaterThan(
          generalizedPentagonalNumbersFromFive(testNatNumber),
        );
      },
    );

    describe("pentagonal numbers", () => {
      test.prop([
        fc.integer({ min: 1, max: 7 }),
        fc.integer({ min: 7, max: 7 }),
      ])(
        "percentageOfGeneralizedPentagonalNumbersFromFiveForGivenRange",
        (testNatNumber, testRangeMax) => {
          const actualPercentage: number =
            percentageOfGeneralizedPentagonalNumbersFromFiveForGivenRange(
              testNatNumber,
              testRangeMax,
            );

          assertBetweenZeroAndOneHundred(actualPercentage);
        },
      );

      test.prop([fc.constantFrom(7, 4)])(
        "do percentageOfGeneralizedPentagonalNumbersFromFiveForGivenRange",
        (testRangeSize) => {
          const actualPercentages: Array<number> = unfold(
            partialRight(
              percentageOfGeneralizedPentagonalNumbersFromFiveForGivenRange,
              [testRangeSize],
            ),
          )(testRangeSize);
          expect(sum(actualPercentages)).toEqual(1);
        },
      );
    });
  });
});
