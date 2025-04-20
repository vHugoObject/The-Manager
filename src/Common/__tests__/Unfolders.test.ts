import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { add, pipe, map, over, first, identity } from "lodash/fp"
import { pairIntegersAndAssertEqual } from "../../TestingUtilities/IntegerTestingUtilities"
import {
  fastCheckNLengthArrayOfStringCountTuplesGenerator,
  fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator
} from "../../TestingUtilities/TestDataGenerationUtilities";
import { getFirstAndLastItemsOfArray, getIDPrefixes, getFirstLevelArrayLengths, getCountOfStringsFromArray } from "../Getters"
import { zipAllAndGetSumOfLastArray, spreadZipObject, zipAllAndGetInitial, zipAllAndGetSumOfSecondArray } from "../Zippers"
import { minusOne, addMinusOne } from "../Arithmetic";
import { unfold, unfoldStartingIndexAndCountIntoRange,
  unfoldItemCountTupleIntoArray,
  unfoldItemCountTuplesIntoMixedArray,
  unfoldStringStartingIndexAndCountTuplesIntoArrayOfArrayOfStringIDs,
  unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs
} from "../Unfolders"


describe("Unfolders test suite", () => {
  
  test.prop([fc.integer({ min: 2, max: 1000 }), fc.nat()])(
    "unfold",
    (testArraySize, testValueToAdd) => {
      const testAdder = add(testValueToAdd);
      const actualArray: Array<number> = unfold(testAdder, testArraySize);
      const [actualFirstValue, actualLastValue] =
        getFirstAndLastItemsOfArray(actualArray);
      const expectedLastValue: number = addMinusOne(
        testValueToAdd,
        testArraySize,
      );
      pairIntegersAndAssertEqual([
        actualFirstValue,
        testValueToAdd,
        actualLastValue,
        expectedLastValue,
      ]);
    },
  );
    test.prop([fc.nat(), fc.integer({ min: 3, max: 50 })])(
    "unfoldStartingIndexAndCountIntoRange",
    (testStartingIndex, testCount) => {
      const actualRange: Array<number> = unfoldStartingIndexAndCountIntoRange(
        testStartingIndex,
        testCount,
      );
      expect(actualRange.length).toEqual(testCount);
      const [actualFirstItem, actualLastItem] =
        getFirstAndLastItemsOfArray(actualRange);
      const expectedLastIndex: number = minusOne(testStartingIndex + testCount);
      expect(actualFirstItem).toEqual(testStartingIndex);
      expect(actualLastItem).toEqual(expectedLastIndex);
    },
  );

  test.prop([fc.tuple(fc.string(), fc.integer({ min: 3, max: 1000 }))])(
    "unfoldItemCountTupleIntoArray",
    (testItemCountTuple) => {
      const actualArray: Array<string> =
        unfoldItemCountTupleIntoArray(testItemCountTuple);
      const [, expectedCount] = testItemCountTuple;
      expect(actualArray.length).toEqual(expectedCount);
    },
  );

  test.prop([fc.gen(), fc.integer({ min: 3, max: 1000 })])(
    "unfoldItemCountTuplesIntoMixedArray",
    (fcGen, testTupleCount) => {
      const testTuples: Array<[string, number]> =
        fastCheckNLengthArrayOfStringCountTuplesGenerator(
          fcGen,
          testTupleCount,
        );
      const actualArray = unfoldItemCountTuplesIntoMixedArray(testTuples);
      const expectedCount: number = zipAllAndGetSumOfLastArray(testTuples);
      expect(actualArray.length).toEqual(expectedCount);
    },
  );

  test.prop([fc.integer({ min: 3, max: 100 }), fc.gen()])(
    "unfoldStringStartingIndexAndCountTuplesIntoArrayOfArrayOfStringIDs",
    (testArraySize, fcGen) => {
      
      const testTuples: Array<[string, number, number]> =
        fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator(
          fcGen,
          testArraySize,
        );
      
      const actualStringIDs: Array<Array<string>> = unfoldStringStartingIndexAndCountTuplesIntoArrayOfArrayOfStringIDs(testTuples)
      const expectedCountsObject: Record<string, number> = pipe([zipAllAndGetInitial, spreadZipObject])(testTuples)      
      const actualCountsObject: Record<string, number> = pipe([map(getIDPrefixes),
	over([map(first), getFirstLevelArrayLengths]),
	spreadZipObject
      ])(actualStringIDs)

      expect(actualCountsObject).toStrictEqual(expectedCountsObject)
    },
  );

    test.prop([fc.integer({ min: 3, max: 10 }), fc.gen()])(
    "unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs",
    (testArraySize, fcGen) => {
      
      const testTuples: Array<[string, number, number]> =
        fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator(
          fcGen,
          testArraySize,
        );
      
      const actualStringIDs: Array<string> = unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs(testTuples)
      const expectedStringCount: number = zipAllAndGetSumOfSecondArray(testTuples)
      const actualStringCount: number = getCountOfStringsFromArray(actualStringIDs)
      pairIntegersAndAssertEqual([actualStringCount, expectedStringCount])
    },
  );


})
