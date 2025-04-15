import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { first, last, over } from "lodash/fp"
import { fastCheckTestLinearRangeGenerator } from "../../TestingUtilities/index"
import { foldArrayIntoLinearRange,
  convertArrayOfArraysIntoArrayOfLinearRanges,
  getLengthOfLinearRange,
  convertRangeSizeAndMinIntoRange
}  from "../RangeUtilities"



describe("RangeUtilities test suite", async () => {
  test.prop([
    fc.array(
      fc.string(),
      {minLength: 3, maxLength: 200}
    ),
  ])("foldArrayIntoLinearRange", async (testArrayOfStrings) => {
    const [firstIndex, lastIndex]: [number, number] =
      foldArrayIntoLinearRange(testArrayOfStrings);
    expect(testArrayOfStrings[firstIndex]).toBe(first(testArrayOfStrings));
    expect(testArrayOfStrings[lastIndex]).toBe(last(testArrayOfStrings));
  });

  test.prop([
    fc.array(
      fc.array(
	fc.string(),
        { minLength: 10, maxLength: 20},
      ),
      { minLength: 3, maxLength: 50 },
    ),
  ])("convertArrayOfArraysIntoArrayOfLinearRanges", async (testArrayOfArraysOfStrings) => {
    const actualRanges: Array<[number, number]> =
      convertArrayOfArraysIntoArrayOfLinearRanges(testArrayOfArraysOfStrings);
    expect(actualRanges.length).toEqual(testArrayOfArraysOfStrings.length);
  });

  
  test.prop([    
    fc.gen(),
    fc.integer({min: 2}),
  ])("getLengthOfLinearRange", async (fcGen, testRangeSize) => {
    const testRange: [number, number] = fastCheckTestLinearRangeGenerator(fcGen, testRangeSize)
    const actualRangeSize: number = getLengthOfLinearRange(testRange)
    expect(actualRangeSize).toEqual(testRangeSize)
    
  });

  test.prop([    
    fc.integer({min: 3}),
    fc.integer({min: 2}),
  ])("convertRangeMinAndSizeIntoRange", async (testRangeMin, testRangeSize) => {
    
    const actualRange: [number, number] = convertRangeSizeAndMinIntoRange(testRangeSize, testRangeMin)


    const actualRangeSize = getLengthOfLinearRange(actualRange)

    expect(actualRangeSize).toEqual(testRangeSize)
    
    
  });

  
  
})
