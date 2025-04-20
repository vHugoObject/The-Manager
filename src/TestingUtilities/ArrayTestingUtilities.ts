import { chunk, forEach, pipe } from "lodash/fp";
import { expect } from "vitest";
import { convertArrayOfArraysToArrayOfSets } from "../Common/Transformers";
import { fc } from "@fast-check/vitest";
import { curry } from "lodash/fp";
export const fastCheckRandomItemFromArray = curry(
  <TValue>(
    fcGen: fc.GeneratorValue,
    testArray: Array<TValue>,
  ): fc.Arbitrary<TValue> => {
    return fcGen(fc.constantFrom, ...testArray);
  },
);

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
