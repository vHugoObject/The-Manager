import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  pipe,
  first,
  over,
  map,
  isString,
  isNumber,
  take,
  concat,
  shuffle,
  isEqual,
  zipAll,
  last,
  multiply,
} from "lodash/fp";
import { pairSetsAndAssertStrictEqual,
  assertArrayOfIntegersInRangeExclusive
} from "../Asserters";
import {
  fastCheckTestSingleStringIDGenerator,
  fastCheckTestMixedArrayOfStringIDsGenerator,
  fastCheckNLengthArrayOfStringsAndIntegersGenerator,
  fastCheckTestLinearRangeGenerator,
  fastCheckNLengthUniqueStringArrayGenerator,
  fastCheckRandomIntegerInRange,
  fastCheckTestStringArrayWithDefinedStringsPerChunk,
  fastCheckRandomItemFromArray,
  fastCheckTestIntegerArrayWithDefinedIntegersPerChunk,
  fastCheckRandomIntegerBetweenOneAnd
} from "../TestDataGenerators";
import {
  convertRangeSizeAndMinIntoRange,
  spreadZipObject,
  zipAllAndGetInitial,
  joinOnUnderscores,
  unfold,
  nonZeroBoundedModularAddition
} from "../Transformers";
import {
  getCountsForASetOfIDPrefixes,
  getIDPrefix,
  getIDSuffix,
  getCountOfItemsFromArrayForPredicate,
  getCountOfObjectKeys,
  getFirstNPartsOfID,
  getCountOfFloatsBetweenZeroAndOne,
  getCountOfItemsForPredicatePerArrayChunk,
  getCountOfUniqueItemsPerArrayChunk,
  getCountOfItemsFromArrayThatAreGreaterThanZero,
  getLengthOfLinearRange,
  getItemAtRangeIndex,
  getRangeStep
} from "../Getters";

describe("PrimitiveGetters test suite", () => {
  test.prop([fc.gen(), fc.integer()])("getIDPrefix", (fcGen) => {
    const [testStringID, [testString]] =
      fastCheckTestSingleStringIDGenerator(fcGen);
    const actualIDPrefix: string = getIDPrefix(testStringID);
    expect(actualIDPrefix).toEqual(testString);
  });

  test.prop([fc.gen(), fc.integer()])("getIDSuffix", (fcGen) => {
    const [testStringID, [, testIDNumber]] =
      fastCheckTestSingleStringIDGenerator(fcGen);
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

      pairSetsAndAssertStrictEqual([
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

  test.prop([fc.integer({ min: 3, max: 20 }), fc.gen()])(
    "getFirstNPartsOfID",
    (testIDLength, fcGen) => {
      const testPartsToGet: number = fastCheckRandomIntegerInRange(fcGen, [
        1,
        testIDLength,
      ]);
      const [testID, expectedIDParts] = pipe([
        fastCheckNLengthUniqueStringArrayGenerator,
        over([joinOnUnderscores, take(testPartsToGet)]),
      ])(fcGen, testIDLength);
      const actualIDParts: Array<string> = getFirstNPartsOfID(
        testPartsToGet,
        testID,
      );
      pairSetsAndAssertStrictEqual([actualIDParts, expectedIDParts]);
    },
  );

  test.prop([fc.gen(), fc.integer({ min: 2 })])(
    "getLengthOfLinearRange",
    (fcGen, testRangeSize) => {
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
    (testRangeMin, testRangeSize) => {
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
  ])("getCountOfObjectKeys", (testTuple) => {
    const [expectedKeysCount, testRecord] = testTuple;
    const actualKeysCount: number = getCountOfObjectKeys(testRecord);
    expect(actualKeysCount).toEqual(expectedKeysCount);
  });

  test.prop([
    fc.array(
      fc.float({
        noDefaultInfinity: true,
        noNaN: true,
        min: Math.fround(0.1),
        max: Math.fround(0.99),
      }),
      { minLength: 1 },
    ),
    fc.array(fc.integer({ min: 2 }), { minLength: 1 }),
  ])("getCountOfFloatsBetweenZeroAndOne", (testFloats, testIntegers) => {
    const testArray: Array<number> = pipe([concat(testFloats), shuffle])(
      testIntegers,
    );

    const actualFloatCount: number =
      getCountOfFloatsBetweenZeroAndOne(testArray);
    expect(actualFloatCount).toEqual(testFloats.length);
  });

  describe("getCountOfItemsForPredicatePerArrayChunk", () => {
    test.prop([fc.gen(), fc.integer({ min: 2, max: 20 })])(
      "for strings",
      (fcGen, testUniqueStringCount) => {
        const [testArray, testItemChunkCountTuples, testChunkSize]: [
          Array<string>,
          Array<[string, number]>,
          number,
        ] = fastCheckTestStringArrayWithDefinedStringsPerChunk(
          fcGen,
          testUniqueStringCount,
        );
        const [testString, expectedCounts] = fastCheckRandomItemFromArray(
          fcGen,
          testItemChunkCountTuples,
        );

        const actualCounts: Array<number> =
          getCountOfItemsForPredicatePerArrayChunk(
            isEqual(testString),
            testChunkSize,
            testArray,
          );
        expect(actualCounts).toStrictEqual(expectedCounts);
      },
    );

    test.prop([fc.gen(), fc.integer({ min: 2, max: 20 })])(
      "for integers",
      (fcGen, testUniqueIntegersCount) => {
        const [testArray, testItemChunkCountTuples, testChunkSize]: [
          Array<number>,
          Array<[number, number]>,
          number,
        ] = fastCheckTestIntegerArrayWithDefinedIntegersPerChunk(
          fcGen,
          testUniqueIntegersCount,
        );
        const [testInteger, expectedCounts] = fastCheckRandomItemFromArray(
          fcGen,
          testItemChunkCountTuples,
        );

        const actualCounts: Array<number> =
          getCountOfItemsForPredicatePerArrayChunk(
            isEqual(testInteger),
            testChunkSize,
            testArray,
          );
        expect(actualCounts).toStrictEqual(expectedCounts);
      },
    );
  })
    describe("getCountOfUniqueItemsPerArrayChunk", () => {
      test.prop([fc.gen(), fc.integer({ min: 2, max: 20 })])(
      "for strings",
      (fcGen, testUniqueStringCount) => {
	const [testArray, testItemChunkCountTuples, testChunkSize]: [
          Array<string>,
          Array<[string, number]>,
          number,
        ] = fastCheckTestStringArrayWithDefinedStringsPerChunk(
          fcGen,
          testUniqueStringCount,
        );
	
        const actualCounts: Array<number> =
          getCountOfUniqueItemsPerArrayChunk(
            testChunkSize,
            testArray,
          );

	const expectedCounts: Array<number> = pipe([
	  map(last),
	  zipAll,
	  map(getCountOfItemsFromArrayThatAreGreaterThanZero),
	])(testItemChunkCountTuples)
	
	expect(actualCounts).toEqual(expectedCounts)
	
      },
      );
      test.prop([fc.gen(), fc.integer({ min: 2, max: 20 })])(
      "for integers",
      (fcGen, testUniqueIntegersCount) => {
	const [testArray, testItemChunkCountTuples, testChunkSize]: [
          Array<number>,
          Array<[number, number]>,
          number,
        ] = fastCheckTestIntegerArrayWithDefinedIntegersPerChunk(
          fcGen,
          testUniqueIntegersCount,
        );
	
        const actualCounts: Array<number> =
          getCountOfUniqueItemsPerArrayChunk(
            testChunkSize,
            testArray,
          );

	const expectedCounts: Array<number> = pipe([
	  map(last),
	  zipAll,
	  map(getCountOfItemsFromArrayThatAreGreaterThanZero),
	])(testItemChunkCountTuples)
	
	expect(actualCounts).toEqual(expectedCounts)
	
      },
      );
    })

  describe("Range stuff", () => {
      test.prop([fc.gen(), fc.integer({ min: 100, max: 1000 }), fc.integer({ min: 1, max: 20 })])(
      "getRangeStep",
    (fcGen, testRangeSize, testCycles) => {

      const [testRange, testItemsCount]: [[number, number], number] = over<[number, number]|number>([fastCheckTestLinearRangeGenerator, fastCheckRandomIntegerBetweenOneAnd])(fcGen, testRangeSize) as [[number, number], number]
      
      const actualStep: number = getRangeStep(testRange, testCycles, testItemsCount)
      const actualExpandedRange: Array<number> = unfold(pipe([multiply(actualStep), nonZeroBoundedModularAddition(testRange, 0)]), testItemsCount)
      assertArrayOfIntegersInRangeExclusive(testRange, actualExpandedRange)

    },
      );
    



  })
});

