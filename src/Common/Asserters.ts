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

export const pairAndAssertStrictEqual = pipe([
  chunk(2),
  forEach(([actual, expected]: [Set<any>, Set<any>]) => {
    expect(actual).toStrictEqual(expected);
  }),
]);

export const convertArraysToSetsAndAssertStrictEqual = pipe([
  convertArrayOfArraysToArrayOfSets,
  pairAndAssertStrictEqual,
]);

export const assertIntegerGreaterThanOrEqualMinAndLessThanMax = curry(
  ([min, max]: [number, number], integer: number) => {
    expect(integer).toBeGreaterThanOrEqual(min);
    expect(integer).toBeLessThanOrEqual(max);
  },
);

export const parseIntAndAssertIntegerGreaterThanOrEqualMinAndLessThanMax =
  curry((range: [number, number], integerAsString: string) => {
    return pipe([
      parseInt,
      assertIntegerGreaterThanOrEqualMinAndLessThanMax(range),
    ])(integerAsString);
  });

