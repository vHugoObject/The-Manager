import { test, fc } from "@fast-check/vitest";
import { describe, expect, assert } from "vitest";
import {
  over,
  identity,
  size,
  last,
  pipe,
  first,
  min,
  add,
  multiply,
} from "lodash/fp";
import {
  pairSetsAndAssertStrictEqual,
  pairIntegersAndAssertEqual,
  assertIntegerInRangeInclusive,
} from "../Asserters";
import {
  fastCheckNLengthArrayOfStringCountTuplesGenerator,
  fastCheckNLengthStringGenerator,
  fastCheckRandomIntegerInRange,
  fastCheckTestLinearRangeGenerator,
  fastCheckRandomInteger,
  fastCheckRandomItemFromArray,
  fastCheckNLengthUniqueIntegerArrayGenerator,
  fastCheckNonSpaceRandomCharacterGenerator,
  fastCheckNLengthUniqueStringArrayGenerator,
  fastCheckRandomIntegerBetweenZeroAnd,
} from "../TestDataGenerators";
import {
  getFirstAndLastItemsOfArray,
  getSizeMinAndMaxOfArray,
  getCountOfUniqueIntegersFromArray,
} from "../Getters";
import {
  apply,
  append,
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
  subString,
  addOne,
  unfoldAndTransformNaturalNumberRangeChunkX,
  unfoldAndTransformRangeChunkN,
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
    pairSetsAndAssertStrictEqual([actualArrayLength, expectedArrayLength]);
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
    pairSetsAndAssertStrictEqual([actualArrayLength, expectedArrayLength]);
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

  describe("PrimitiveTransformers test suite", () => {
    test.prop([fc.gen(), fc.integer({ min: 5, max: 100 })])(
      "string",
      (fcGen, testStringCount) => {
        const testArray: Array<string> =
          fastCheckNLengthUniqueStringArrayGenerator(fcGen, testStringCount);
        const testValueToAppend: string =
          fastCheckNonSpaceRandomCharacterGenerator(fcGen);

        const actualArray = append(testValueToAppend, testArray);
        expect(last(actualArray)).toEqual(testValueToAppend);
      },
    );

    test.prop([fc.gen(), fc.integer({ min: 5, max: 100 })])(
      "number",
      (fcGen, testIntegerCount) => {
        const testArray: Array<number> =
          fastCheckNLengthUniqueIntegerArrayGenerator(fcGen, testIntegerCount);
        const testValueToAppend: number = fastCheckRandomInteger(fcGen);

        const actualArray = append(testValueToAppend, testArray);

        expect(last(actualArray)).toEqual(testValueToAppend);
      },
    );
  });

  describe("unfold", () => {
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
        const expectedLastIndex: number = minusOne(
          testStartingIndex + testCount,
        );
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

    test.prop([
      fc.gen(),
      fc.integer({ min: 5, max: 25 }),
      fc.integer({ min: 2, max: 10 }),
    ])(
      "unfoldAndTransformRangeChunkX",
      (fcGen, testChunkSize, testMultiple) => {
        const testRange: [number, number] = pipe([
          multiply(testChunkSize),
          fastCheckTestLinearRangeGenerator(fcGen),
        ])(testMultiple);

        const testChunkNumber: number = fastCheckRandomIntegerBetweenZeroAnd(
          fcGen,
          testMultiple,
        );
        const actualChunk = unfoldAndTransformRangeChunkN(
          testChunkSize,
          identity,
          testRange,
          testChunkNumber,
        );

        expect(getCountOfUniqueIntegersFromArray(actualChunk)).toEqual(
          testChunkSize,
        );
        const [actualMin, actualMax] = over([first, last])(actualChunk);

        const [testStart] = testRange;
        const [expectedMin, expectedMax] = pipe([
          multiply(testChunkNumber),
          add(testStart),
          over([identity, pipe([add(testChunkSize), minusOne])]),
        ])(testChunkSize);

        expect(actualMin).toEqual(expectedMin);
        expect(actualMax).toEqual(expectedMax);
        const actualRandomValue: number = fastCheckRandomItemFromArray(
          fcGen,
          actualChunk,
        );
        assertIntegerInRangeInclusive(
          [expectedMin, expectedMax],
          actualRandomValue,
        );
      },
    );

    test.prop([
      fc.gen(),
      fc.integer({ min: 5, max: 25 }),
      fc.integer({ min: 2, max: 10 }),
    ])(
      "unfoldAndTransformNaturalNumberRangeChunkX",
      (fcGen, testChunkSize, testMultiple) => {
        const testMax: number = multiply(testChunkSize, testMultiple);
        const testChunkNumber: number = fastCheckRandomIntegerBetweenZeroAnd(
          fcGen,
          testMultiple,
        );

        const actualChunk: Array<number> =
          unfoldAndTransformNaturalNumberRangeChunkX(
            testChunkSize,
            identity,
            testMax,
            testChunkNumber,
          );

        const [actualChunkSize, actualMin] =
          getSizeMinAndMaxOfArray(actualChunk);

        expect(actualMin).toBeGreaterThanOrEqual(0);

        expect(actualChunkSize).toEqual(testChunkSize);
      },
    );
  });
});

test.prop([fc.string({ minLength: 1, maxLength: 1 })])(
  "convertCharacterIntoCharacterCode",
  (testChar) => {
    const actualCharCode: number = convertCharacterIntoCharacterCode(testChar);
    assert.isNumber(actualCharCode);
  },
);

test.prop([fc.integer({ min: 96 })])(
  "convertCharacterCodeIntoCharacter",
  (testInteger) => {
    const actualChar: string = convertCharacterCodeIntoCharacter(testInteger);
    assert.isString(actualChar);
    expect(actualChar.length).toBeGreaterThanOrEqual(1);
  },
);

describe("Range stuff", () => {
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
