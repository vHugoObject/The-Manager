import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { pipe, first, over, map, isString, isNumber } from "lodash/fp";
import { pairArraysAndAssertStrictEqual } from "../../TestingUtilities/ArrayTestingUtilities"
import {
  fastCheckTestSingleStringIDGenerator,
  fastCheckTestMixedArrayOfStringIDsGenerator,
  fastCheckNLengthArrayOfStringsAndIntegersGenerator,
  fastCheckTestLinearRangeGenerator
} from "../../TestingUtilities/TestDataGenerationUtilities";
import { convertRangeSizeAndMinIntoRange } from "../Transformers"
import {
  spreadZipObject,
  zipAllAndGetInitial
} from "../Zippers";
import { getLengthOfLinearRange } from "../Arithmetic"
import {
  getCountsForASetOfIDPrefixes,
  getIDPrefix,
  getIDSuffix,
  getCountOfItemsFromArrayForPredicate,
  getObjectKeysCount
} from "../Getters";

describe("Getters test suite", () => {

  test.prop([fc.gen(), fc.integer()])("getIDPrefix", (fcGen) => {
    const [testStringID, [testString]] = fastCheckTestSingleStringIDGenerator(fcGen)
    const actualIDPrefix: string = getIDPrefix(testStringID);
    expect(actualIDPrefix).toEqual(testString);
  });

  test.prop([fc.gen(), fc.integer()])("getIDSuffix", (fcGen) => {
    const [testStringID, [,testIDNumber]] = fastCheckTestSingleStringIDGenerator(fcGen)
    const actualIDNumber: string = getIDSuffix(testStringID);
    const expectedIDNumber: string = testIDNumber.toString();
    expect(actualIDNumber).toBe(expectedIDNumber);
  });

  test.prop([fc.gen(), fc.integer({ min: 2, max: 100 })])(
    "getCountOfItemsFromArrayForPredicate",
    (fcGen, testPredicatesCount) => {
      const [testItems, [expectedStringCount, expectedIntegerCount]] =
        fastCheckNLengthArrayOfStringsAndIntegersGenerator(
          fcGen,
          testPredicatesCount,
        );
      const [testGetStringCount, testGetIntegerCount] = map(
        getCountOfItemsFromArrayForPredicate,
      )([isString, isNumber]);
      const [actualStringCount, actualIntegerCount] = over([
        testGetStringCount,
        testGetIntegerCount,
      ])(testItems);

      pairArraysAndAssertStrictEqual([
        actualStringCount,
        expectedStringCount,
        actualIntegerCount,
        expectedIntegerCount,
      ]);
    },
  );


  test.prop([fc.integer({ min: 2, max: 10 }), fc.gen()])(
    "getCountsForASetOfIDPrefixes",
    (testIDPrefixes, fcGen) => {
      const [testStringIDs, testStringCountIndexTuples]: [
        Array<string>,
        Array<[string, number]>,
      ] = fastCheckTestMixedArrayOfStringIDsGenerator(fcGen, testIDPrefixes);
      const [testStrings, expectedCountsObject] = pipe([
        zipAllAndGetInitial,
        over([first, spreadZipObject]),
      ])(testStringCountIndexTuples);
      const actualCountsObject: Record<string, number> =
        getCountsForASetOfIDPrefixes(testStrings, testStringIDs);
      expect(actualCountsObject).toStrictEqual(expectedCountsObject);
    },
  );

    test.prop([fc.gen(), fc.integer({ min: 2 })])(
    "getLengthOfLinearRange",
    async (fcGen, testRangeSize) => {
      const testRange: [number, number] = fastCheckTestLinearRangeGenerator(
        fcGen,
        testRangeSize,
      );
      const actualRangeSize: number = getLengthOfLinearRange(testRange);
      expect(actualRangeSize).toEqual(testRangeSize);
    },
    );

  test.prop([fc.integer({ min: 3 }), fc.integer({ min: 2 })])(
    "convertRangeMinAndSizeIntoRange",
    async (testRangeMin, testRangeSize) => {
      const actualRange: [number, number] = convertRangeSizeAndMinIntoRange(
        testRangeSize,
        testRangeMin,
      );

      const actualRangeSize = getLengthOfLinearRange(actualRange);

      expect(actualRangeSize).toEqual(testRangeSize);
    },
  );
    test.prop([
    fc.nat({ max: 100 }).chain((expectedKeysCount: number) => {
      return fc.tuple(
        fc.constant(expectedKeysCount),
        fc.dictionary(fc.string(), fc.integer(), {
          minKeys: expectedKeysCount,
          maxKeys: expectedKeysCount,
        }),
      );
    }),
  ])("getObjectKeysCount", async (testTuple) => {
    const [expectedKeysCount, testRecord] = testTuple;
    const actualKeysCount: number = getObjectKeysCount(testRecord);
    expect(actualKeysCount).toEqual(expectedKeysCount);
  });
  
});

