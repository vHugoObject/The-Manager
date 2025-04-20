import { expect } from "vitest";
import { pipe, chunk, forEach } from "lodash/fp";
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
