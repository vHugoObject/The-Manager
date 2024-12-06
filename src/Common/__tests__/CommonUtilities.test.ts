import { describe, expect, test, expectTypeOf } from "vitest";
import { simpleFaker } from "@faker-js/faker";
import { range, zip, partial } from "lodash";
import {
  normalizePercentages,
  weightedMean,
  weightedRandom,
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
