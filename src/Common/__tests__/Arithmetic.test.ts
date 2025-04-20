import { test, fc } from "@fast-check/vitest";
import { assert, describe, expect } from "vitest";
import { first, last, min, max, over, map, sum, zipAll, head, add, multiply } from "lodash/fp";
import { flowAsync } from "futil-js";
import { fastCheckTestLinearRangeGenerator } from "../../TestingUtilities/TestDataGenerationUtilities";
import {
  normalizePercentages,
  weightedMean,
  weightedRandom,
  getRunningSumOfList,
  getRunningSumOfListOfTuples,
  minusOne,
  addOne,
  multiplyByTwo,
  simpleModularArithmetic,
  getRandomNumberInRange,
  getRandomPlusOrMinus,
  mapModularIncreasersWithTheSameAverageStep,
  mapModularIncreasersWithDifferentStepsForARange,
  boundedModularAddition,
  getAverageModularStepForRangeOfData,
  getUndadjustedAverageStepForASetOfModularRanges,
  reverseThenSpreadSubtract,
  accumulate
} from "../Arithmetic";

describe("Arithmetic test suite", async () => {
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
  ])("normalizePercentages", async (testPercentages) => {
    const actualPercentages: Array<number> =
      normalizePercentages(testPercentages);
    actualPercentages.forEach((actualPercentage: number) => {
      expect(actualPercentage).toBeGreaterThan(0);
      expect(actualPercentage).toBeLessThan(1);
    });
  });

  test.prop([
    fc.integer({ min: 3, max: 1000 }).chain((minLength: number) => {
      return fc.tuple(
        fc.array(
          fc.double({
            maxExcluded: true,
            noDefaultInfinity: true,
            noNaN: true,
            min: 0.1,
            max: 1,
          }),
          { minLength, maxLength: minLength },
        ),
        fc.array(fc.nat(), { minLength, maxLength: minLength }),
      );
    }),
  ])("weightedMean", async (testPercentagesAndIntegers) => {
    const [testPercentages, testIntegers]: [Array<number>, Array<number>] =
      testPercentagesAndIntegers;
    const [expectedMin, expectedMax] = over([min, max])(testIntegers) as [
      number,
      number,
    ];

    const actualMean: number = weightedMean(testPercentages, testIntegers);
    expect(actualMean).toBeGreaterThanOrEqual(expectedMin);
    expect(actualMean).toBeLessThan(expectedMax);
  });

  test.prop([
    fc.integer({ min: 3, max: 1000 }).chain((minLength: number) => {
      return fc.tuple(
        fc.array(
          fc.double({
            maxExcluded: true,
            noDefaultInfinity: true,
            noNaN: true,
            min: 0.1,
            max: 1,
          }),
          { minLength, maxLength: minLength },
        ),
        fc.array(fc.nat(), { minLength, maxLength: minLength }),
      );
    }),
  ])("weightedRandom", async (testPercentagesAndIntegers) => {
    const [testPercentages, testIntegers]: [Array<number>, Array<number>] =
      testPercentagesAndIntegers;

    const actualChosenNumber: number = weightedRandom([
      testPercentages,
      testIntegers,
    ]);

    const setOfTestIntegers: Set<number> = new Set(testIntegers);
    expect(setOfTestIntegers.has(actualChosenNumber)).toBeTruthy();
    expect(
      testPercentages[testIntegers.indexOf(actualChosenNumber)],
    ).toBeGreaterThan(0);
  });

  test.prop([fc.array(fc.integer({ min: 1 }), { minLength: 2 })])(
    "getRunningSumOfList",
    async (testNums) => {
      const actualSummedArray: Array<number> = getRunningSumOfList(testNums);
      const expectedLastValue: number = sum(testNums);

      assert.lengthOf(actualSummedArray, testNums.length);
      expect(head(actualSummedArray)).toEqual(head(testNums));
      expect(last(actualSummedArray)).toEqual(expectedLastValue);
    },
  );

  test.prop([
    fc.array(fc.tuple(fc.string(), fc.integer({ min: 1 })), { minLength: 4 }),
  ])("getRunningSumOfListOfTuples", async (testStringCountTuples) => {
    const actualTuples: Array<[string, number, number]> =
      getRunningSumOfListOfTuples(0, testStringCountTuples);
    const expectedLastValue: number = flowAsync(
      map(last),
      sum,
    )(testStringCountTuples);

    assert.lengthOf(actualTuples, testStringCountTuples.length);
    const expectedFirstTuple: [string, number, number] = flowAsync(
      first,
      ([expectedString, expectedCount]: [string, number]) => [
        expectedString,
        expectedCount,
        expectedCount,
      ],
    )(testStringCountTuples);
    const expectedLastTuple: [string, number, number] = flowAsync(
      last,
      ([expectedString, expectedCount]: [string, number]) => [
        expectedString,
        expectedCount,
        expectedLastValue,
      ],
    )(testStringCountTuples);

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
  ])("simpleModularArithmetic", async (testNumAndRangeMax) => {
    const [testNum, rangeMax]: [number, number] = testNumAndRangeMax;
    const testRangeMax = flowAsync(multiplyByTwo, minusOne)(rangeMax);
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
  ])("getRandomNumberInRange", async (testRange) => {
    const [expectedMin, expectedMax]: [number, number] = testRange;

    const actualNumber = getRandomNumberInRange(testRange);
    expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
    expect(actualNumber).toBeLessThanOrEqual(expectedMax);
  });

  test.prop([
    fc.array(
      fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 })),
      { minLength: 3 },
    ),
  ])("getUndadjustedAverageStepForASetOfModularRanges", async (testRanges) => {
    const [expectedMin, expectedMax]: [number, number] = over([
      flowAsync(map(first), min),
      flowAsync(map(last), max),
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
  ])(
    "getAverageModularStepForRangeOfData",
    async (testRanges, testPlayerCount) => {
      const actualAdjustedStep: number = getAverageModularStepForRangeOfData(
        testRanges,
        testPlayerCount,
      );
      const unadjustedStep: number =
        getUndadjustedAverageStepForASetOfModularRanges(testRanges);
      expect(actualAdjustedStep).toBeLessThan(unadjustedStep);
    },
  );

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
  ])("boundedModularAddition", async (testRangeIncreaseAndCurrentNumber) => {
    const [[testRange, testIncrease], testCurrentNumber]: [
      [[number, number], number],
      number,
    ] = testRangeIncreaseAndCurrentNumber;
    const testPartialBoundedModularAdditionFunction = boundedModularAddition(
      testRange,
      testIncrease,
    );
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
    async (testRanges, testRandomPlusOrMinus, testPlayerCount) => {
      const actualModularIncreasers =
        mapModularIncreasersWithTheSameAverageStep(
          [testRandomPlusOrMinus, testPlayerCount],
          testRanges,
        );

      flowAsync(
        zipAll,
        map(([[min, max], actualFunction]: [[number, number], Function]) => {
          const actualValue = actualFunction(max);
          assert.isNumber(actualValue);
        }),
      )([testRanges, actualModularIncreasers]);
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
    async (testRanges, testPlayerCount) => {
      const actualModularIncreasers =
        mapModularIncreasersWithDifferentStepsForARange(
          testPlayerCount,
          testRanges,
        );
      flowAsync(
        zipAll,
        map(([[min, max], actualFunction]: [[number, number], Function]) => {
          const actualValue = actualFunction(max);
          expect(actualValue).toBeLessThanOrEqual(max);
          expect(actualValue).toBeGreaterThanOrEqual(min);
        }),
      )([testRanges, actualModularIncreasers]);
    },
  );

  test.prop([fc.integer({ min: 1 })])(
    "getRandomPlusOrMinus",
    async (testNumber) => {
      const actualNumber = await getRandomPlusOrMinus(testNumber);
      const expectedMin: number = -1 * testNumber;
      expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
      expect(actualNumber).toBeLessThan(testNumber);
    },
  );

  test.prop([fc.gen(), fc.integer({ min: 2 })])(
    "reverseThenSpreadSubtract",
    async (fcGen, testRangeSize) => {
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
