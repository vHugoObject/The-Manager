import { describe, expect, assert } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  zipAll,
  pipe,
  isEqual,
  multiply,
  over,
  size,
  sum
} from "lodash/fp";
import {
  getArrayStringCount,
  getArrayIntegerCount,
  charCodeOfCharacter,
  addOne,
  zipApply,
  getFirstLevelArrayLengths,
  getCountOfItemsFromArrayForPredicate,
  zipAndGetLastArrayAsSet,
  getSizeMinAndMaxOfArray,
  flattenAndConvertToSet,
  zipAndGetMinOfArrayAtIndex,
  compactThenGetSize,
  getArrayTrueCount,
  getArrayFalseCount
} from "../../Common/index"
import { convertArraysToSetsAndAssertStrictEqual } from "../ArrayTestingUtilities"
import { assertIntegerGreaterThanOrEqualMinAndLessThanMax } from "../IntegerTestingUtilities"
import {
  fastCheckRandomCharacterGenerator,
  fastCheckRandomIntegerInRange,
  fastCheckTestLinearRangeGenerator,
  fastCheckNLengthUniqueIntegerArrayGenerator,
  fastCheckNUniqueIntegersFromRangeAsArrayGenerator,
  fastCheckNLengthUniqueStringArrayGenerator,
  fastCheckNLengthArrayOfStringCountTuplesGenerator,
  fastCheckTestLinearRangeWithMinimumGenerator,
  fastCheckArrayOfNIntegerArraysGenerator,
  fastCheckTestMixedArrayOfStringIDsGenerator,
  fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator,
  fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator,
  fastCheckNLengthArrayOfItemCountTuplesGivenItemsAndRangeOfCountsGenerator,
  fastCheckTestMixedArrayOfStringIDsGivenStringsGenerator,
  fastCheckTestMixedArrayOfBooleansGenerator
} from "../TestDataGenerationUtilities";

describe("TestDataGenerationUtilities test suite",  () => {
  const getActualStringIndexAndCountArray = pipe([zipAll,
	  zipApply([getArrayStringCount, getArrayIntegerCount, getArrayIntegerCount]),
  ])
  const getActualStringAndCountArray = pipe([zipAll,
	  zipApply([getArrayStringCount, getArrayIntegerCount]),
    flattenAndConvertToSet
  ])
  test.prop([
    fc.tuple(fc.integer({min: 1, max: 49}),
      fc.integer({min: 50, max: 100})),
      fc.gen()
  ])(
    "fastCheckRandomIntegerInRange",
     (testRange, fcGen) => {
       const actualInteger: number = fastCheckRandomIntegerInRange(fcGen, testRange)
      assertIntegerGreaterThanOrEqualMinAndLessThanMax(testRange, actualInteger)
    },
  );
  
  test.prop([
    fc.tuple(fc.integer({min: 1, max: 49}),
      fc.integer({min: 50, max: 100})),
      fc.gen()
  ])(
    "fastCheckRandomCharacterGenerator",
     (testUTFRange, fcGen) => {
      const actualCharacter: string = fastCheckRandomCharacterGenerator(testUTFRange, fcGen)
      const actualCharacterCode: number = charCodeOfCharacter(actualCharacter)
      assertIntegerGreaterThanOrEqualMinAndLessThanMax(testUTFRange, actualCharacterCode)
    },
  );




  test.prop([
    fc.integer({min: 2}),
      fc.gen()
      ])(
    "fastCheckTestLinearRangeGenerator",
       (testRangeSize, fcGen) => {
            
	const actualLinearRange: [number, number] = fastCheckTestLinearRangeGenerator(
	  fcGen,
	  testRangeSize
	)
	const [actualRangeMin, actualRangeMax] = actualLinearRange
	const expectedRangeMax: number = addOne(actualRangeMin + testRangeSize)
	assert.isNumber(actualRangeMin)
	expect(actualRangeMax).toEqual(expectedRangeMax)
	      

      },
      );


  test.prop([
    fc.integer({min: 2}),
    fc.nat(),
      fc.gen()
      ])(
    "fastCheckTestLinearRangeWithMinimumGenerator",
	 (testRangeSize, testRangeMin, fcGen) => {
            
	const actualLinearRange: [number, number] = fastCheckTestLinearRangeWithMinimumGenerator(
	  fcGen,
	  [testRangeMin, testRangeSize]
	)
	const [actualRangeMin] = actualLinearRange	
	expect(actualRangeMin).toBeGreaterThanOrEqual(testRangeMin)
	      

      },
      );
  
  
    test.prop([
      fc.integer({min: 2, max: 1000}),
      fc.gen()
      ])(
    "fastCheckNLengthUniqueIntegerArrayGenerator",
	 (testArraySize, fcGen) => {
	  const actualArray: Array<number> = fastCheckNLengthUniqueIntegerArrayGenerator(fcGen, testArraySize)
	  const actualIntegerCount: number = getArrayIntegerCount(actualArray)
	  expect(actualIntegerCount).toEqual(testArraySize)
      },
      );


  test.prop([
    fc.integer({min: 2, max: 1000}),
    fc.integer({min: 2, max: 1000}),    
    fc.gen()
      ])(
    "fastCheckNUniqueIntegersFromRangeAsArrayGenerator",
	 (testArraySize, testRangeSize, fcGen) => {
	  const testRange: [number, number] = fastCheckTestLinearRangeGenerator(fcGen, testRangeSize)
	  
	   const actualArray: Array<number> = fastCheckNUniqueIntegersFromRangeAsArrayGenerator(fcGen,[testRange, testArraySize])

	  const [expectedMin, expectedMax] = testRange
	  
	  const [actualIntegerCount, actualMin, actualMax] = getSizeMinAndMaxOfArray(actualArray)
	  expect(actualIntegerCount).toEqual(testArraySize)
	  expect(actualMin).toBeGreaterThanOrEqual(expectedMin)
	  expect(actualMax).toBeLessThanOrEqual(expectedMax)
	  
      },
      );

    test.prop([
      fc.integer({min: 2, max: 1000}),
      fc.gen()
      ])(
    "fastCheckNLengthUniqueStringArrayGenerator",
	 (testArraySize, fcGen) => {
	  const actualArray: Array<string> = fastCheckNLengthUniqueStringArrayGenerator(fcGen, testArraySize)

	  const actualStringCount: number = getArrayStringCount(actualArray)
	  expect(actualStringCount).toEqual(testArraySize)
	  
      },
      );

  test.prop([
    fc.integer({min: 2, max: 1000}),
    fc.gen()
      ])(
    "fastCheckNLengthArrayOfStringCountTuplesGenerator",
	 (testArraySize, fcGen) => {
	   const actualArray: Array<[string, number]> = fastCheckNLengthArrayOfStringCountTuplesGenerator(fcGen, testArraySize)

	   const actualStringAndCountArray: Array<number> = getActualStringAndCountArray(actualArray)
	   convertArraysToSetsAndAssertStrictEqual([actualStringAndCountArray, [testArraySize]])
	  
      },
      );

  test.prop([
    fc.integer({min: 2, max: 1000}),
    fc.gen()
      ])(
    "fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator",
	 (testArraySize, fcGen) => {
	   const actualArray: Array<[string, number, number]> = fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator(fcGen, testArraySize)

	  
	   const actualCounts: Array<number> = getActualStringIndexAndCountArray(actualArray)
	   
	   convertArraysToSetsAndAssertStrictEqual([actualCounts, [testArraySize]])
	  
      },
      );


    test.prop([
      fc.integer({min: 2, max: 25}),
      fc.integer({min: 2, max: 50}),
      fc.gen()
      ])(
    "fastCheckArrayOfNIntegerArraysGenerator",
	 (testCountOfArrays, testSizeOfArrays, fcGen) => {
	  const actualArray: Array<Array<number>> = fastCheckArrayOfNIntegerArraysGenerator(fcGen, [testCountOfArrays, testSizeOfArrays])
	  const actualArraySize: number = pipe([
	    getFirstLevelArrayLengths,
	    getCountOfItemsFromArrayForPredicate(isEqual(testSizeOfArrays)),
	  ])(actualArray)
	  
	  expect(actualArraySize).toEqual(testCountOfArrays)
	  
	  
	  
      },
      );

    

    test.prop([
      fc.integer({min: 3, max: 10}),
      fc.integer({min: 3, max: 10}),
      fc.integer({min: 3, max: 100}),
      fc.gen()
    ])(
    "fastCheckNLengthArrayOfItemCountTuplesGivenItemsAndRangeOfCountsGenerator",
      (testStringCount, testMinItemCount, testRangeSize, fcGen) => {

	 const testStrings: Array<string> = fastCheckNLengthUniqueStringArrayGenerator(fcGen, testStringCount)
	 
	const actualTuples: Array<[string, number]> = fastCheckNLengthArrayOfItemCountTuplesGivenItemsAndRangeOfCountsGenerator(testStrings, fcGen, [testMinItemCount, testRangeSize])
	
	const actualStringAndCountArray: Array<number> = getActualStringAndCountArray(actualTuples)
	convertArraysToSetsAndAssertStrictEqual([actualStringAndCountArray, [testStringCount]])

	  
      },
    );

  test.prop([
      fc.integer({min: 2, max: 10}),
      fc.integer({min: 2, max: 10}),
      fc.integer({min: 1, max: 100}),
      fc.gen()
  ])(
    "fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator",
      (testStringCount, testMinItemCount, testRangeSize, fcGen) => {

	 const testStrings: Array<string> = fastCheckNLengthUniqueStringArrayGenerator(fcGen, testStringCount)
	 
	const actualTuples: Array<[string, number, number]> = fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator(testStrings, fcGen, [testMinItemCount, testRangeSize])

	const actualStringIndexAndCountArray = getActualStringIndexAndCountArray(actualTuples)
	
	convertArraysToSetsAndAssertStrictEqual([actualStringIndexAndCountArray, [testStringCount]])
	  
      },
  );


    


      
  
      test.prop([
      fc.integer({min: 2, max: 10}),
      fc.integer({min: 2, max: 10}),
      fc.integer({min: 1, max: 100}),
      fc.gen()
      ])(
    "fastCheckTestMixedArrayOfStringIDsGivenStringsGenerator",
       (testStringCount, testMinItemCount, testRangeSize, fcGen) => {

	 const testStrings: Array<string> = fastCheckNLengthUniqueStringArrayGenerator(fcGen, testStringCount)
	 
	 const [actualStringIDs, actualStringCountIndexTuples]: [Array<string>, Array<[string, number]>] = fastCheckTestMixedArrayOfStringIDsGivenStringsGenerator(testStrings, fcGen, [testMinItemCount, testRangeSize])

	 const actualMinOfCounts: number = zipAndGetMinOfArrayAtIndex(1, actualStringCountIndexTuples)
	 expect(actualMinOfCounts).toBeGreaterThanOrEqual(testMinItemCount)
	 const expectedMinimumSize = multiply(testMinItemCount, testStringCount)
	 expect(actualStringIDs.length).toBeGreaterThanOrEqual(expectedMinimumSize)
	 
	  
      },
      );

  test.prop([
      fc.integer({min: 2, max: 10}),
      fc.integer({min: 10, max: 100}),
      fc.gen()
  ])(
    "fastCheckTestMixedArrayOfBooleansGenerator",
       (testRangeMin, testRangeSize, fcGen) => {
	 
	 const [actualBooleans]: [Array<string>, Array<[string, number]>] = fastCheckTestMixedArrayOfBooleansGenerator(fcGen, [testRangeMin, testRangeSize])
	 
	 const [actualTrueCount, actualFalseCount, actualSize] = over([getArrayTrueCount, getArrayFalseCount, size])(actualBooleans)
	 expect(actualTrueCount).toBeGreaterThan(0)
	 expect(actualFalseCount).toBeGreaterThan(0)
	 expect(sum([actualTrueCount, actualFalseCount])).toEqual(actualSize)

	 
      },
      );

  test.prop([
      fc.integer({min: 2, max: 10}),
      fc.gen()
  ])(
    "fastCheckTestMixedArrayOfStringIDsGenerator",
       (testArraySize, fcGen) => {
	
	 const [actualStringIDs, actualStringCountIndexTuples]: [Array<string>, Array<[string, number]>] = fastCheckTestMixedArrayOfStringIDsGenerator(fcGen, testArraySize)
	 expect(actualStringCountIndexTuples.length).toEqual(testArraySize)
	 const actualSize: number = compactThenGetSize(actualStringIDs)
	 expect(actualSize).toBeGreaterThanOrEqual(testArraySize)
	  
      },
      );

})

