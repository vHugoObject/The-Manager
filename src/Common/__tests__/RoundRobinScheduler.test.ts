import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { flowAsync } from "futil-js";
import { range, map, flatMap, flatten, first, last, over, size, property, sum, curry, add } from "lodash/fp"
import { convertToSet, convertArrayOfArraysToArrayOfSets } from "../CommonUtilities"
import { roundRobinScheduler, arrayRotator, totalRoundRobinMatches, totalRoundRobinRounds, matchesPerRoundOfRoundRobin, rotate2DMatrix } from "../RoundRobinScheduler"



describe("RoundRobinScheduler tests", async () => {

  const getIndexAfterForwardRotation = curry(([effectiveRotations, arrayLength]: [number, number], oldIndex: number): number => (oldIndex + effectiveRotations) % arrayLength)

  test.prop(
    [
      fc.integer({min: 2, max: 50})
	.chain((minLength: number) => {
	  return fc.tuple(fc.array(fc.integer(), {minLength}), fc.constant(minLength))
	})
    ]
  )("arrayRotator", async (testArrayAndRotations) => {

    const [testArray, testRotations]: [Array<number>, number] = testArrayAndRotations
    const actualRotatedArray: Array<string> = arrayRotator(testArrayAndRotations)

    const [actualSet, expectedSet] = convertArrayOfArraysToArrayOfSets([actualRotatedArray, testArray])
    expect(actualSet).toStrictEqual(expectedSet)
    
    const testArrayLength: number = testArray.length
    const expectedEffectiveRotations: number = testRotations % testArrayLength
    const getExpectedNewIndex = getIndexAfterForwardRotation([expectedEffectiveRotations, testArrayLength])
    
    
    const expectedIndexOfFirstItem = getExpectedNewIndex(0)
    expect(actualRotatedArray[expectedIndexOfFirstItem]).toBe(first(testArray))

    const testArrayLastIndex: number = testArrayLength - 1
    const expectedIndexOfLastItem = getExpectedNewIndex(testArrayLastIndex)
    expect(actualRotatedArray[expectedIndexOfLastItem]).toBe(last(testArray))

    
    
    
    
    

    
    
    
  });


  test.prop(
    [
      fc.tuple(fc.integer({min: 2, max: 50}), fc.integer({min: 2, max: 5}))
	.chain(([dimensionSize, dimensions]: [number, number]) => {	  
	  return fc.tuple(fc.array(fc.array(fc.integer(), {minLength: dimensionSize}), {minLength: dimensions, maxLength: dimensions}),
	    fc.constant(dimensionSize))
	})
    ],
    {numRuns: 0}
  )("rotate2DMatrix", async (testMatrixAndRotations) => {

    const [testMatrix, testRotations]: [Array<Array<number>>, number] = testMatrixAndRotations
    const actualRotatedMatrix: Array<Array<number>> = rotate2DMatrix(testMatrixAndRotations)

    const [actualMatrixSet, expectedMatrixSet] = flowAsync(map(flatten), convertArrayOfArraysToArrayOfSets)([actualRotatedMatrix, testMatrix])
    expect(actualMatrixSet).toStrictEqual(expectedMatrixSet)

    const testMatrixArraySizes: [number, number] = map(size)(testMatrix) as [number, number]
    const totalMatrixSize: number = sum(testMatrixArraySizes)
    

    
    const getIndexAfterBackwardsRotation = curry(([effectiveRotations, arrayLength]: [number, number], oldIndex: number): number => (oldIndex - effectiveRotations) % arrayLength)
    // not right, need effectiveRowChange and effectiveColumnChanges?
    const getExpectedRowAfter2DForwardRotation = curry((effectiveRotations: number, originalRow: number): number => (originalRow + effectiveRotations) % 1)
    const expectedEffectiveRotations: number = testRotations % totalMatrixSize
    
    const getExpectedColumnAfter2DRotation = curry(([effectiveRotations, [firstRowLength, secondRowLength]]: [number, [number, number]], [originalRow, originalColumn, newRow]: [number, number, number]): number => {

      if (originalRow == 0 && newRow == 0) {
	return getIndexAfterForwardRotation([effectiveRotations, firstRowLength], originalColumn)
      }

      if (originalRow == 1 && newRow == 1) {
	return getIndexAfterBackwardsRotation([effectiveRotations, secondRowLength], originalColumn)
      }
      
      if (originalRow == 0 && newRow == 1) {
	const expectedEffectiveRotations = effectiveRotations - firstRowLength
	return getIndexAfterBackwardsRotation([expectedEffectiveRotations, secondRowLength], secondRowLength - 1)
      }
            

      const expectedEffectiveRotations: number = effectiveRotations - secondRowLength
      return getIndexAfterForwardRotation([expectedEffectiveRotations, firstRowLength], 0)      


    })


    const getExpectedColumn = getExpectedColumnAfter2DRotation([expectedEffectiveRotations, testMatrixArraySizes])
    const getExpectedRow = getExpectedRowAfter2DForwardRotation(expectedEffectiveRotations)
    const originalLastItemIndex: number = flowAsync(last, size, add(-1))(testMatrix)
    
    const [expectedRowOfOriginalFirstItem, expectedRowOfOriginalLastItem]: [number, number] = map(getExpectedRow)([0, originalLastItemIndex])
    const [expectedColumnOfOriginalFirstItem, expectedColumnOfOriginalLastItem]: [number, number] = map(getExpectedColumn)([[0,0, expectedRowOfOriginalFirstItem], [1, originalLastItemIndex, expectedColumnOfOriginalLastItem]])
    expect(property([expectedRowOfOriginalFirstItem, expectedColumnOfOriginalFirstItem], actualRotatedMatrix)).toStrictEqual(property([0,0], testMatrix))
    expect(property([expectedRowOfOriginalLastItem, expectedColumnOfOriginalLastItem], actualRotatedMatrix)).toStrictEqual(property([1,originalLastItemIndex], testMatrix))

    

    
    
    
    
    
    

    
    
    
  });

  // even numbers only
  test.prop(
    [
      fc.integer({min: 20, max: 20})
    ],
    {numRuns: 0}
  )("roundRobinScheduler", async (testClubsCount) => {
   
    
    const generateTestClubs = (testClubsCount: number): Array<string> => Array.from({length: testClubsCount},(_ , index: number) => `Club_${index}`)

    const testClubs: Array<string> = generateTestClubs(testClubsCount)
    const expectedClubsSet: Set<string> = new Set(testClubs)
    
    const actualMatches: Array<Array<[string, string]>> = await roundRobinScheduler(testClubs)
    console.log(actualMatches)

    const actualWeeks: number = actualMatches.length
    const expectedWeeks: number = totalRoundRobinRounds(testClubsCount)
    expect(actualWeeks).toEqual(expectedWeeks)
    
    const actualMatchesPerWeek: number = flowAsync(map(size), convertToSet)(actualMatches)
    const expectedMatchesPerWeek: number = matchesPerRoundOfRoundRobin(testClubsCount)    
    expect(actualMatchesPerWeek).toEqual(expectedMatchesPerWeek)
            
    const actualSetOfClubSets: Set<Set<string>> = flowAsync(
      flatMap((actualMatches: Array<[string, string]>) => flowAsync(flatten, convertToSet)(actualMatches)),
      convertToSet,
    )(actualMatches)

    
    expect(actualSetOfClubSets).toStrictEqual(new Set(expectedClubsSet))
    
    
  });

})
