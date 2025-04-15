import { test, fc } from "@fast-check/vitest";
import { assert, describe, expect } from "vitest";
import { size, min, set, add, pipe, isNumber, isString, isArray, isBoolean, isPlainObject } from "lodash/fp"
import { pairArraysAndAssertStrictEqual, pairIntegersAndAssertEqual
} from "../../TestingUtilities/index"
import { addMinusOne } from "../MathUtilities"
import { getFirstAndLastItemsOfArray } from "../ArrayUtilities"
import { apply, zipApply, unfold } from "../FunctionUtilities"

describe("FunctionUtilities test suite",  () => {
  
  
  test.prop([
    fc.tuple(fc.integer({min: 2, max: 50}), fc.integer({min: 2}))
      .chain(([testArrayLength, testArrayMinValue]: [number, number]) => {
	return fc.tuple(
	  fc.array(fc.string(), {minLength: testArrayLength, maxLength: testArrayLength}),
	  fc.array(fc.integer({min: testArrayMinValue}), {minLength: testArrayLength, maxLength: testArrayLength}),
	fc.constant(testArrayLength), fc.constant(testArrayMinValue))
      })
  ])("apply",  (testArraysAndExpectedValues) => {
    const [testArrayOne, testArrayTwo, expectedArrayLength, expectedArrayMinValue] = testArraysAndExpectedValues
    const actualArrayLength = apply(size, testArrayOne)
    const actualArrayMinValue = apply(min, testArrayTwo)
    pairArraysAndAssertStrictEqual([actualArrayLength, expectedArrayLength])
    assert.isAtLeast(actualArrayMinValue, expectedArrayMinValue)
    
  });

  test.prop([
    fc.tuple(fc.integer({min: 2, max: 50}), fc.integer({min: 2}))
      .chain(([testArrayLength, testArrayMinValue]: [number, number]) => {
	return fc.tuple(fc.tuple(
	  fc.array(fc.string(), {minLength: testArrayLength, maxLength: testArrayLength}),
	  fc.array(fc.integer({min: testArrayMinValue}), {minLength: testArrayLength, maxLength: testArrayLength}),
	), fc.constant(testArrayLength), fc.constant(testArrayMinValue))
      })
  ])("zipApply",  (testArraysAndExpectedValues) => {
    const [testArrays, expectedArrayLength, expectedArrayMinValue] = testArraysAndExpectedValues
    const [actualArrayLength, actualArrayMinValue]: [number, number] = zipApply([size, min], testArrays)
    pairArraysAndAssertStrictEqual([actualArrayLength, expectedArrayLength])
    assert.isAtLeast(actualArrayMinValue, expectedArrayMinValue)
    
  });
  



  test.prop([
    fc.integer({min: 2, max: 1000}),
    fc.nat(),
  ])("unfold",  (testArraySize, testValueToAdd) => {
    const testAdder = add(testValueToAdd)
    const actualArray: Array<number> = unfold(testAdder, testArraySize)
    const [actualFirstValue, actualLastValue] = getFirstAndLastItemsOfArray(actualArray)
    const expectedLastValue: number = addMinusOne(testValueToAdd, testArraySize)
    pairIntegersAndAssertEqual([actualFirstValue, testValueToAdd, actualLastValue, expectedLastValue])
    
    
  });

  
  



  

});
