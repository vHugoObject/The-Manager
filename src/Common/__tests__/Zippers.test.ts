import { test, fc } from "@fast-check/vitest";
import { describe, expect, assert } from "vitest";
import { size, min } from "lodash/fp"
import {
  pairArraysAndAssertStrictEqual,
} from "../../TestingUtilities/ArrayTestingUtilities";
import {   
  apply,
  zipApply
} from "../Zippers"

describe("Zippers test suite", () => {

    test.prop([
    fc
      .tuple(fc.integer({ min: 2, max: 50 }), fc.integer({ min: 2 }))
      .chain(([testArrayLength, testArrayMinValue]: [number, number]) => {
        return fc.tuple(
          fc.array(fc.string(), {
            minLength: testArrayLength,
            maxLength: testArrayLength,
          }),
          fc.array(fc.integer({ min: testArrayMinValue }), {
            minLength: testArrayLength,
            maxLength: testArrayLength,
          }),
          fc.constant(testArrayLength),
          fc.constant(testArrayMinValue),
        );
      }),
  ])("apply", (testArraysAndExpectedValues) => {
    const [
      testArrayOne,
      testArrayTwo,
      expectedArrayLength,
      expectedArrayMinValue,
    ] = testArraysAndExpectedValues;
    const actualArrayLength: number = apply(size, testArrayOne);
    const actualArrayMinValue: number = apply(min, testArrayTwo);
    pairArraysAndAssertStrictEqual([actualArrayLength, expectedArrayLength]);
    assert.isAtLeast(actualArrayMinValue, expectedArrayMinValue);
  });

  test.prop([
    fc
      .tuple(fc.integer({ min: 2, max: 50 }), fc.integer({ min: 2 }))
      .chain(([testArrayLength, testArrayMinValue]: [number, number]) => {
        return fc.tuple(
          fc.tuple(
            fc.array(fc.string(), {
              minLength: testArrayLength,
              maxLength: testArrayLength,
            }),
            fc.array(fc.integer({ min: testArrayMinValue }), {
              minLength: testArrayLength,
              maxLength: testArrayLength,
            }),
          ),
          fc.constant(testArrayLength),
          fc.constant(testArrayMinValue),
        );
      }),
  ])("zipApply", (testArraysAndExpectedValues) => {
    const [testArrays, expectedArrayLength, expectedArrayMinValue] =
      testArraysAndExpectedValues;
    const [actualArrayLength, actualArrayMinValue] = zipApply(
      [size, min],
      testArrays,
    );
    pairArraysAndAssertStrictEqual([actualArrayLength, expectedArrayLength]);
    assert.isAtLeast(actualArrayMinValue, expectedArrayMinValue);
  });



})
