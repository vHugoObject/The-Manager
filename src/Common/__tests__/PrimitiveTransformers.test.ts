import { test, fc } from "@fast-check/vitest";
import { describe, expect, assert } from "vitest";
import { over, map, size, last, pipe, first, min, add } from "lodash/fp";
import {
  pairAndAssertStrictEqual,
  pairIntegersAndAssertEqual,
} from "../Asserters";
import {
  fastCheckNLengthArrayOfStringCountTuplesGenerator,
  fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator,
  fastCheckTestSingleStringCountStartingIndexTupleGenerator,
  fastCheckNLengthStringGenerator,
  fastCheckRandomIntegerInRange,
} from "../TestDataGenerationUtilities";
import {
  getFirstLevelArrayLengths,
  getFirstAndLastItemsOfArray,
  getIDPrefixes,
  getCountOfStringsFromArray,
  getCountOfItemsFromArrayThatStartWithX,
} from "../Getters";
import {
  apply,
  splitOnUnderscores,
  foldArrayOfArraysIntoArrayOfLinearRanges,
  convertArrayIntoLinearRange,
  convertCharacterCodeIntoCharacter,
  convertCharacterIntoCharacterCode,
  zipApply,
  unfold,
  unfoldCountStartingIndexIntoRange,
  addMinusOne,
  minusOne,
  unfoldItemCountTupleIntoArray,
  unfoldItemCountTuplesIntoMixedArray,
  zipAllAndGetSumOfLastArray,
  unfoldSingleStringCountStartingIndexTupleIntoArrayOfStringIDs,
  unfoldStringCountStartingIndexTuplesIntoArrayOfArrayOfStringIDs,
  spreadZipObject,
  zipAllAndGetInitial,
  zipAllAndGetSumOfSecondArray,
  unfoldStringCountStartingIndexTuplesIntoArrayOfStringIDs,
  subString,
} from "../Transformers";

describe("PrimitiveTransformers test suite", () => {
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
    pairAndAssertStrictEqual([actualArrayLength, expectedArrayLength]);
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
    pairAndAssertStrictEqual([actualArrayLength, expectedArrayLength]);
    assert.isAtLeast(actualArrayMinValue, expectedArrayMinValue);
  });

  test.prop([fc.gen(), fc.integer({ min: 5, max: 100 })])(
    "subString",
    (fcGen, testStringLength) => {
      const [testString, testStringParts]: [string, Array<string>] =
        fastCheckNLengthStringGenerator(fcGen, testStringLength);
      const testSubStringLength: number = fastCheckRandomIntegerInRange(fcGen, [
        2,
        testStringLength,
      ]);
      const expectedSubString: string = testStringParts
        .slice(0, testSubStringLength)
        .join("");
      const actualSubString: string = subString(
        0,
        testSubStringLength,
        testString,
      );
      expect(actualSubString).toBe(expectedSubString);
    },
  );
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
    "unfoldCountStartingIndexIntoRange",
    (testStartingIndex, testCount) => {
      const actualRange: Array<number> = unfoldCountStartingIndexIntoRange(
        testCount,
        testStartingIndex,
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

  test.prop([fc.gen(), fc.integer({ min: 3, max: 50 })])(
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

  test.prop([fc.gen()])(
    "unfoldSingleStringCountStartingIndexTupleIntoArrayOfStringIDs",
    (fcGen) => {
      const [expectedPrefix, expectedStartingIndex, expectedCount] =
        fastCheckTestSingleStringCountStartingIndexTupleGenerator(fcGen);

      const actualIDs: Array<string> =
        unfoldSingleStringCountStartingIndexTupleIntoArrayOfStringIDs(
          expectedPrefix,
          [expectedCount, expectedStartingIndex],
        );
      const actualIDsCount = getCountOfItemsFromArrayThatStartWithX(
        expectedPrefix,
        actualIDs,
      );
      expect(actualIDsCount).toEqual(expectedCount);
      const actualStartingIndex = pipe([
        first,
        splitOnUnderscores,
        last,
        parseInt,
      ])(actualIDs);
      expect(actualStartingIndex).toEqual(expectedStartingIndex);
    },
  );

  test.prop([fc.integer({ min: 3, max: 10 }), fc.gen()])(
    "unfoldStringCountStartingIndexTuplesIntoArrayOfArrayOfStringIDs",
    (testArraySize, fcGen) => {
      const testTuples: Array<[string, number, number]> =
        fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator(
          fcGen,
          testArraySize,
        );

      const actualStringIDs: Array<Array<string>> =
        unfoldStringCountStartingIndexTuplesIntoArrayOfArrayOfStringIDs(
          testTuples,
        );
      const expectedCountsObject: Record<string, number> = pipe([
        zipAllAndGetInitial,
        spreadZipObject,
      ])(testTuples);
      const actualCountsObject: Record<string, number> = pipe([
        map(getIDPrefixes),
        over([map(first), getFirstLevelArrayLengths]),
        spreadZipObject,
      ])(actualStringIDs);

      expect(actualCountsObject).toStrictEqual(expectedCountsObject);
    },
  );

  test.prop([fc.integer({ min: 3, max: 10 }), fc.gen()])(
    "unfoldStringCountStartingIndexTuplesIntoArrayOfStringIDs",
    (testArraySize, fcGen) => {
      const testTuples: Array<[string, number, number]> =
        fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator(
          fcGen,
          testArraySize,
        );

      const actualStringIDs: Array<string> =
        unfoldStringCountStartingIndexTuplesIntoArrayOfStringIDs(testTuples);
      const expectedStringCount: number =
        zipAllAndGetSumOfSecondArray(testTuples);
      const actualStringCount: number =
        getCountOfStringsFromArray(actualStringIDs);
      pairIntegersAndAssertEqual([actualStringCount, expectedStringCount]);
    },
  );

  test.prop([fc.string({ minLength: 1, maxLength: 1 })])(
    "convertCharacterIntoCharacterCode",
    (testChar) => {
      const actualCharCode: number =
        convertCharacterIntoCharacterCode(testChar);
      assert.isNumber(actualCharCode);
    },
  );

  test.prop([fc.integer({ min: 1, max: 100 })])(
    "convertCharacterCodeIntoCharacter",
    (testInteger) => {
      const actualChar: string = convertCharacterCodeIntoCharacter(testInteger);
      assert.isString(actualChar);
    },
  );

  test.prop([fc.array(fc.string(), { minLength: 3, maxLength: 200 })])(
    "convertArrayIntoLinearRange",
    (testArrayOfStrings) => {
      const [firstIndex, lastIndex]: [number, number] =
        convertArrayIntoLinearRange(testArrayOfStrings);
      expect(testArrayOfStrings[firstIndex]).toBe(first(testArrayOfStrings));
      expect(testArrayOfStrings[lastIndex]).toBe(last(testArrayOfStrings));
    },
  );

  test.prop([
    fc.array(fc.array(fc.string(), { minLength: 10, maxLength: 20 }), {
      minLength: 3,
      maxLength: 50,
    }),
  ])(
    "foldArrayOfArraysIntoArrayOfLinearRanges",
    (testArrayOfArraysOfStrings) => {
      const actualRanges: Array<[number, number]> =
        foldArrayOfArraysIntoArrayOfLinearRanges(testArrayOfArraysOfStrings);
      expect(actualRanges.length).toEqual(testArrayOfArraysOfStrings.length);
    },
  );
});
