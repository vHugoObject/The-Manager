import { test, fc } from "@fast-check/vitest";
import { describe, expect, assert } from "vitest";
import {
  over,
  map,
  sum,
  last,
  pipe,
  zipAll,
  first,
  multiply,
  min,
  add,
  max,
  head,
} from "lodash/fp";
import {
  fastCheckTestLinearRangeGenerator,
  fastCheckNLengthArrayOfDoublesBetweenZeroAndOne,
} from "../TestDataGenerationUtilities";
import { assertIntegerGreaterThanOrEqualMinAndLessThanMax } from "../Asserters";
import { getMinAndMaxOfArray } from "../Getters";
import {
  minusOne,
  getAverageModularStepForRangeOfData,
  nonZeroBoundedModularAddition,
  weightedRandom,
  getRunningSumOfList,
  getRunningSumOfListOfTuples,
  simpleModularArithmetic,
  addOne,
  multiplyByTwo,
  getRandomIntegerInRange,
  getUndadjustedAverageStepForASetOfModularRanges,
  mapModularIncreasersWithTheSameAverageStep,
  mapModularIncreasersWithDifferentStepsForARange,
  getRandomPlusOrMinus,
  accumulate,
  reverseThenSpreadSubtract,
  weightedMean,
  normalizePercentages,
} from "../Transformers";

describe("MathTransformers test suite", () => {
  test.prop([
    fc.array(
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
      { minLength: 3 },
    ),
  ])("normalizePercentages", (testPercentages) => {
    const actualPercentages: Array<number> =
      normalizePercentages(testPercentages);
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
      assertIntegerGreaterThanOrEqualMinAndLessThanMax(
        [min, max],
        actualWeightedMean,
      );
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

  test.prop([
    fc.array(
      fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 })),
      { minLength: 3 },
    ),
  ])("getUndadjustedAverageStepForASetOfModularRanges", (testRanges) => {
    const [expectedMin, expectedMax]: [number, number] = over([
      pipe([map(first), min]),
      pipe([map(last), max]),
    ])(testRanges);
    const actualStep: number =
      getUndadjustedAverageStepForASetOfModularRanges(testRanges);
    expect(actualStep).toBeGreaterThan(expectedMin);
    expect(actualStep).toBeLessThan(expectedMax);
  });

  test.prop([
    fc.array(
      fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 })),
      { minLength: 3 },
    ),
    fc.integer({ min: 100, max: 1000 }),
  ])("getAverageModularStepForRangeOfData", (testRanges, testPlayerCount) => {
    const actualAdjustedStep: number = getAverageModularStepForRangeOfData(
      testRanges,
      testPlayerCount,
    );
    const unadjustedStep: number =
      getUndadjustedAverageStepForASetOfModularRanges(testRanges);
    expect(actualAdjustedStep).toBeLessThan(unadjustedStep);
  });

  test.prop([
    fc
      .tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 }))
      .chain(([min, max]: [number, number]) => {
        return fc.tuple(
          fc.tuple(
            fc.tuple(fc.constant(min), fc.constant(max)),
            fc.integer({ min, max }),
          ),
          fc.integer({ min, max: min * 3 }),
        );
      }),
  ])("nonZeroBoundedModularAddition", (testRangeIncreaseAndCurrentNumber) => {
    const [[testRange, testIncrease], testCurrentNumber]: [
      [[number, number], number],
      number,
    ] = testRangeIncreaseAndCurrentNumber;
    const testPartialBoundedModularAdditionFunction =
      nonZeroBoundedModularAddition(testRange, testIncrease);
    const actualNumber: number =
      testPartialBoundedModularAdditionFunction(testCurrentNumber);
    const [expectedMin, expectedMax]: [number, number] = testRange;
    expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
    expect(actualNumber).toBeLessThanOrEqual(expectedMax);
  });

  test.prop([
    fc.array(
      fc.tuple(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 51, max: 100 }),
      ),
      { minLength: 3 },
    ),
    fc.integer({ min: 5, max: 10 }),
    fc.integer({ min: 100, max: 1000 }),
  ])(
    "mapModularIncreasersWithTheSameAverageStep",
    (testRanges, testRandomPlusOrMinus, testPlayerCount) => {
      const actualModularIncreasers =
        mapModularIncreasersWithTheSameAverageStep(
          [testRandomPlusOrMinus, testPlayerCount],
          testRanges,
        );

      pipe([
        zipAll,
        map(([[min, max], actualFunction]: [[number, number], Function]) => {
          const actualValue = actualFunction(max);
          assert.isNumber(actualValue);
        }),
      ])([testRanges, actualModularIncreasers]);
    },
  );

  test.prop([
    fc.array(
      fc.tuple(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 51, max: 100 }),
      ),
      { minLength: 3 },
    ),
    fc.integer({ min: 100, max: 1000 }),
  ])(
    "mapModularIncreasersWithDifferentStepsForARange",
    (testRanges, testPlayerCount) => {
      const actualModularIncreasers =
        mapModularIncreasersWithDifferentStepsForARange(
          testPlayerCount,
          testRanges,
        );
      pipe([
        zipAll,
        map(([[min, max], actualFunction]: [[number, number], Function]) => {
          const actualValue = actualFunction(max);
          expect(actualValue).toBeLessThanOrEqual(max);
          expect(actualValue).toBeGreaterThanOrEqual(min);
        }),
      ])([testRanges, actualModularIncreasers]);
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
});
