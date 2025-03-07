import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { simpleFaker } from "@faker-js/faker";
import { range, zip, partial, curry } from "lodash/fp";
import {
  convertToSet,
  convertArrayOfArraysToArrayOfSets,
} from "../CommonUtilities";
import {
  normalizePercentages,
  weightedMean,
  weightedRandom,
  arrayRotator,
} from "../CommonUtilities";

describe("CommonUtilities test suite", async () => {
  const arrayOfRandomIntegers = async (
    arrayLength: number,
  ): Promise<Array<number>> => {
    return await Promise.all(
      range(0, arrayLength).map(async (_) => {
        return simpleFaker.number.int({ min: 1, max: 100 });
      }),
    );
  };

  const arrayOfRandomFloats = async (
    minimum: number,
    arrayLength: number,
  ): Promise<Array<number>> => {
    return await Promise.all(
      range(0, arrayLength).map(async (_) => {
        return simpleFaker.number.float({ min: minimum });
      }),
    );
  };

  const getArrayOfRandomFloats = partial(arrayOfRandomFloats, 0.25);

  const getIndexAfterForwardRotation = curry(
    (
      [effectiveRotations, arrayLength]: [number, number],
      oldIndex: number,
    ): number => (oldIndex + effectiveRotations) % arrayLength,
  );

  // every test after this needs to be fixed
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

  test("test normalizePercentages", async () => {
    const testArrays: Array<Array<number>> = await Promise.all(
      range(0, 5).map(async (_) => await getArrayOfRandomFloats(5)),
    );

    await Promise.all(
      testArrays.map(async (testArray: Array<number>) => {
        const actualPercentages: Array<number> =
          await normalizePercentages(testArray);
        actualPercentages.forEach((actualPercentage: number) => {
          expect(actualPercentage).toBeGreaterThan(0);
          expect(actualPercentage).toBeLessThan(1);
        });
      }),
    );
  });

  test("test weightedMean", async () => {
    const testArraysOfPercentages: Array<Array<number>> = await Promise.all(
      range(0, 5).map(async (_) => await getArrayOfRandomFloats(5)),
    );

    const testArraysOfIntegers: Array<Array<number>> = await Promise.all(
      range(0, 5).map(async (_) => await arrayOfRandomIntegers(5)),
    );

    await Promise.all(
      zip(testArraysOfPercentages, testArraysOfIntegers).map(
        async ([testPercentages, testIntegers]) => {
          const actualMean: number = await weightedMean(
            testPercentages,
            testIntegers,
          );
          expect(actualMean).toBeGreaterThan(1);
          expect(actualMean).toBeLessThan(100);
        },
      ),
    );
  });

  test("test weightedRandom", async () => {
    const testArraysOfPercentages: Array<Array<number>> = await Promise.all(
      range(0, 5).map(async (_) => await arrayOfRandomFloats(0, 5)),
    );

    const testArraysOfIntegers: Array<Array<number>> = await Promise.all(
      range(0, 5).map(async (_) => await arrayOfRandomIntegers(5)),
    );

    await Promise.all(
      zip(testArraysOfPercentages, testArraysOfIntegers).map(
        async ([testPercentages, testIntegers]) => {
          const actualChosenNumber: number = await weightedRandom([
            testPercentages,
            testIntegers,
          ]);
          const setOfTestIntegers: Set<number> = new Set(testIntegers);
          expect(setOfTestIntegers.has(actualChosenNumber)).toBeTruthy();
          expect(
            testPercentages[testIntegers.indexOf(actualChosenNumber)],
          ).toBeGreaterThan(0);
        },
      ),
    );
  });
});
