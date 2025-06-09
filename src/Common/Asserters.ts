import { chunk, forEach, pipe, curry } from "lodash/fp";
import { expect } from "vitest";
import { convertArrayOfArraysToArrayOfSets } from "../Common/Transformers";

export const pairIntegersAndAssertEqual = pipe([
  chunk(2),
  forEach(([actual, expected]: [number, number]) => {
    expect(actual).toEqual(expected);
  }),
]);

export const pairStringsAndAssertEqual = pipe([
  chunk(2),
  forEach(([actual, expected]: [number, number]) => {
    expect(actual).toBe(expected);
  }),
]);

export const pairSetsAndAssertStrictEqual = pipe([
  chunk(2),
  forEach(([actual, expected]: [Set<any>, Set<any>]) => {
    expect(actual).toStrictEqual(expected);
  }),
]);

export const convertArraysToSetsAndAssertStrictEqual = pipe([
  convertArrayOfArraysToArrayOfSets,
  pairSetsAndAssertStrictEqual,
]);

export const assertIntegerInRangeInclusive = curry(
  ([min, max]: [number, number], integer: number) => {
    expect(integer).toBeGreaterThanOrEqual(min);
    expect(integer).toBeLessThanOrEqual(max);
  },
);

export const assertIntegerInRangeExclusive = curry(
  ([min, max]: [number, number], integer: number) => {
    expect(integer).toBeGreaterThanOrEqual(min);
    expect(integer).toBeLessThan(max);
  },
);

export const parseIntAndAssert = curry((asserter: Function,
  range: [number, number], integerAsString: string) => {
    return pipe([
      parseInt,
      asserter(range),
    ])(integerAsString);
  });

export const parseIntAndAssertIntegerInRangeInclusive = parseIntAndAssert(assertIntegerInRangeInclusive)
export const parseIntAndAssertIntegerInRangeExclusive = parseIntAndAssert(assertIntegerInRangeExclusive)
