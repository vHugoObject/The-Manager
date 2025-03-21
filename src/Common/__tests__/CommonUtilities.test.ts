import { test, fc } from "@fast-check/vitest";
import { assert, describe, expect } from "vitest";
import { fakerToArb } from "../../Common/index";
import {
  curry,
  first,
  last,
  min,
  max,
  over,
  map,
  size,
  head,
  sum,
  multiply,
  add,
  mean,
  zipAll,
} from "lodash/fp";
import { flowAsync } from "futil-js";
import {
  flattenClubs,
  flattenCompetitions,
  getClubsSliceLengths,
} from "../BaseEntitiesUtilities";
import {
  convertArrayOfArraysToArrayOfSets,
  normalizePercentages,
  weightedMean,
  weightedRandom,
  arrayRotator,
  accumulate,
  sliceUpArray,
  unflatten,
  getRunningSumOfList,
  transformNestedAsFlat,
  getRunningSumOfListOfTuples,
  getFirstLevelArrayLengths,
  getSecondLevelArrayLengths,
  minusOne,
  addOne,
  multiplyByTwo,
  modularArithmetic,
  getRandomNumberInRange,
  getRandomPlusOrMinus,
  mapModularIncreasersWithTheSameAverageStep,
  mapModularIncreasersWithDifferentStepsForARange,
  convertListToRange,
  convertListOfListsToListOfRanges,
  boundedModularAddition,
  getAverageModularStepForRangeOfData,
} from "../CommonUtilities";

describe("CommonUtilities test suite", async () => {
  const getIndexAfterForwardRotation = curry(
    (
      [effectiveRotations, arrayLength]: [number, number],
      oldIndex: number,
    ): number => (oldIndex + effectiveRotations) % arrayLength,
  );

  test.prop([
    fc.integer({ min: 2, max: 50 }).chain((minLength: number) => {
      return fc.tuple(
        fc.array(fc.integer(), { minLength }),
        fc.constant(minLength),
      );
    }),
  ])("arrayRotator", async (testArrayAndRotations) => {
    const [testArray, testRotations]: [Array<number>, number] =
      testArrayAndRotations;
    const actualRotatedArray: Array<string> = arrayRotator(
      testArrayAndRotations,
    );

    const [actualSet, expectedSet] = convertArrayOfArraysToArrayOfSets([
      actualRotatedArray,
      testArray,
    ]);
    expect(actualSet).toStrictEqual(expectedSet);

    const testArrayLength: number = testArray.length;
    const expectedEffectiveRotations: number = testRotations % testArrayLength;
    const getExpectedNewIndex = getIndexAfterForwardRotation([
      expectedEffectiveRotations,
      testArrayLength,
    ]);

    const expectedIndexOfFirstItem = getExpectedNewIndex(0);
    expect(actualRotatedArray[expectedIndexOfFirstItem]).toBe(first(testArray));

    const testArrayLastIndex: number = testArrayLength - 1;
    const expectedIndexOfLastItem = getExpectedNewIndex(testArrayLastIndex);
    expect(actualRotatedArray[expectedIndexOfLastItem]).toBe(last(testArray));
  });

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
      await normalizePercentages(testPercentages);
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

    const actualMean: number = await weightedMean(
      testPercentages,
      testIntegers,
    );
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

    const actualChosenNumber: number = await weightedRandom([
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
    "accumulate",
    async (testNums) => {
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
    fc
      .array(fc.integer({ min: 2, max: 10 }), { minLength: 2, maxLength: 5 })
      .chain((vals) => {
        const minLength: number = sum(vals) * 2;
        return fc.tuple(
          fc.constant(vals),
          fc.array(
            fc.oneof(
              fc.string({ minLength: 1 }),
              fc.integer(),
              fc.dictionary(
                fc.string(),
                fc.oneof(fc.string({ minLength: 1 }), fc.integer()),
                {
                  minKeys: 2,
                },
              ),
            ),
            { minLength },
          ),
        );
      }),
  ])("sliceUpArray", async (testArrayAndChunkLengths) => {
    const [testChunkLengths, testArray] = testArrayAndChunkLengths;

    const actualArray = sliceUpArray(testChunkLengths, testArray);
    assert.sameMembers(map(size)(actualArray), testChunkLengths);
  });

  test.prop([
    fc.array(
      fc.array(
        fc.array(fc.tuple(fc.string(), fc.string()), {
          minLength: 20,
          maxLength: 40,
        }),
        {
          minLength: 2,
        },
      ),
      { minLength: 2 },
    ),
  ])("unflatten", async (clubs) => {
    const clubsSliceLengths: Array<Array<number>> = over([
      getSecondLevelArrayLengths,
      getFirstLevelArrayLengths,
    ])(clubs);

    const testClubs = flattenClubs(clubs);
    const actualClubs = await unflatten(clubsSliceLengths, testClubs);
    assert.sameDeepOrderedMembers(actualClubs, clubs);
  });

  test.prop([
    fc.array(
      fc.array(fc.tuple(fc.string(), fc.string()), {
        minLength: 5,
        maxLength: 10,
      }),
      {
        minLength: 2,
      },
    ),
    fc.array(
      fc.array(
        fc.array(fc.tuple(fc.string(), fc.string()), {
          minLength: 20,
          maxLength: 40,
        }),
        {
          minLength: 2,
        },
      ),
      { minLength: 2 },
    ),
  ])("tranformNestedAsFlat", async (testDomesticLeagues, testClubs) => {
    const testTransformer = (x) => structuredClone(x);

    const transformCompetitions = transformNestedAsFlat(
      [flattenCompetitions, getFirstLevelArrayLengths, sliceUpArray],
      testTransformer,
    );

    const actualDomesticLeagues =
      await transformCompetitions(testDomesticLeagues);

    assert.sameDeepOrderedMembers(actualDomesticLeagues, testDomesticLeagues);

    const transformClubs = transformNestedAsFlat(
      [flattenClubs, getClubsSliceLengths, unflatten],
      testTransformer,
    );

    const actualClubs = await transformClubs(testClubs);
    assert.sameDeepOrderedMembers(actualClubs, testClubs);
  });

  test.prop([
    fc.integer({ min: 5, max: 100 }).chain((rangeMax: number) => {
      return fc.tuple(
        fc.integer({ min: 1, max: rangeMax }),
        fc.constant(rangeMax),
      );
    }),
  ])("modularArithmetic", async (testNumAndRangeMax) => {
    const [testNum, rangeMax]: [number, number] = testNumAndRangeMax;
    const testRangeMax = flowAsync(multiplyByTwo, minusOne)(rangeMax);
    const testModularAddition = modularArithmetic(addOne);
    const testModularSubtraction = modularArithmetic(minusOne);
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

  const getUndadjustedAverageStepForASetOfModularRanges = flowAsync(
    map(([min, max]: [number, number]) => addOne(max - min)),
    mean,
    Math.ceil,
  );

  test.prop([
    fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1000 })),
  ])("getRandomNumberInRange", async (testRange) => {
    const [expectedMin, expectedMax]: [number, number] = testRange;

    const actualNumber = await getRandomNumberInRange(testRange);
    expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
    expect(actualNumber).toBeLessThanOrEqual(expectedMax);
  });

  test.prop([
    fc.array(
      fakerToArb((faker) => faker.word.noun()),
      { minLength: 10 },
    ),
  ])("convertListToRange", async (testListOfStrings) => {
    const [firstIndex, lastIndex]: [number, number] =
      convertListToRange(testListOfStrings);
    expect(testListOfStrings[firstIndex]).toBe(first(testListOfStrings));
    expect(testListOfStrings[lastIndex]).toBe(last(testListOfStrings));
  });

  test.prop([
    fc.array(
      fc.array(
        fakerToArb((faker) => faker.word.noun()),
        { minLength: 10 },
      ),
      { minLength: 3 },
    ),
  ])("convertListOfListsToListOfRanges", async (testListOfListsOfStrings) => {
    const actualRanges: Array<[number, number]> =
      convertListOfListsToListOfRanges(testListOfListsOfStrings);
    expect(actualRanges.length).toEqual(testListOfListsOfStrings.length);
  });

  test.prop([fc.integer({ min: 1 })])(
    "getRandomPlusOrMinus",
    async (testNumber) => {
      const actualNumber = await getRandomPlusOrMinus(testNumber);
      const expectedMin: number = -1 * testNumber;
      expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
      expect(actualNumber).toBeLessThan(testNumber);
    },
  );

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
    const [testRangeAndIncrease, testCurrentNumber]: [
      [[number, number], number],
      number,
    ] = testRangeIncreaseAndCurrentNumber;
    const testPartialBoundedModularAdditionFunction =
      boundedModularAddition(testRangeAndIncrease);
    const actualNumber: number =
      testPartialBoundedModularAdditionFunction(testCurrentNumber);
    const [[expectedMin, expectedMax]]: [[number, number], number] =
      testRangeAndIncrease;
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
        await mapModularIncreasersWithTheSameAverageStep(
          [testRandomPlusOrMinus, testPlayerCount],
          testRanges,
        );

      map(([[min, max], actualFunction]: [[number, number], Function]) => {
        const actualValue = actualFunction(max);
        assert.isNumber(actualValue);
      })(zipAll([testRanges, actualModularIncreasers]));
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

      map(([[min, max], actualFunction]: [[number, number], Function]) => {
        const actualValue = actualFunction(max);
        expect(actualValue).toBeLessThanOrEqual(max);
        expect(actualValue).toBeGreaterThanOrEqual(min);
      })(zipAll([testRanges, actualModularIncreasers]));
    },
  );
});
