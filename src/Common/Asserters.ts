import { chunk, forEach, pipe } from "lodash/fp";
import { expect } from "vitest";
import { convertArrayOfArraysToArrayOfSets } from "../Common/Transformers";

export const pairArraysAndAssertStrictEqual = pipe([
  chunk(2),
  forEach(([actual, expected]: [Set<any>, Set<any>]) => {
    expect(actual).toStrictEqual(expected);
  }),
]);

export const convertArraysToSetsAndAssertStrictEqual = pipe([
  convertArrayOfArraysToArrayOfSets,
  pairArraysAndAssertStrictEqual,
]);

export const assertIntegerGreaterThanOrEqualMinAndLessThanMax = (
  [min, max]: [number, number],
  integer: number,
) => {
  expect(integer).toBeGreaterThanOrEqual(min);
  expect(integer).toBeLessThanOrEqual(max);
};

export const pairIntegersAndAssertEqual = pipe([
  chunk(2),
  forEach(([actual, expected]: [number, number]) => {
    expect(actual).toEqual(expected);
  }),
]);
