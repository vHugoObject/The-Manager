import { test, fc } from "@fast-check/vitest";
import { assert, describe, expect } from "vitest";
import {
  curry,
  first,
  last,
  over,
  map,
  size,
  head,
  sum,
  multiply,
  add,
  zipAll,
  slice,
  filter,
  eq,
  flatten,
  isString,
  isNumber,
  pipe,
} from "lodash/fp";
import {
  flattenClubs,
  flattenCompetitions,
  getClubsSliceLengths,
} from "../BaseEntitiesUtilities";
import { minusOne } from "../MathUtilities"
import { pairArraysAndAssertStrictEqual, fastCheckNLengthArrayOfStringCountTuplesGenerator,
  fastCheckNLengthArrayOfStringsAndIntegersGenerator,
} from "../../TestingUtilities/index"

import {
  convertArrayOfArraysToArrayOfSets,
  sortTuplesByFirstValueInTuple,
  arrayRotator,
  accumulate,
  sliceUpArray,
  unflatten,
  transformNestedAsFlat,
  getFirstLevelArrayLengths,
  getSecondLevelArrayLengths,
  convertArrayOfIntegersIntoArrayOfStrings,
  convertArrayOfStringsIntoArrayOfIntegers,
  zipLongest,
  getArraysSizeDifference,  
  getFirstAndLastItemsOfArray,
  unfoldStartingIndexAndCountIntoRange,
  getCountOfItemsFromArrayForPredicate,
  unfoldItemCountTupleIntoArray,
  unfoldItemCountTuplesIntoMixedArray,
  zipAndGetSumOfLastArray,
  getMinAndMaxOfArray,
} from "../ArrayUtilities";

describe("ArrayUtilities test suite",  () => {
  const getIndexAfterForwardRotation = curry(
    (
      [effectiveRotations, arrayLength]: [number, number],
      oldIndex: number,
    ): number => (oldIndex + effectiveRotations) % arrayLength,
  );

  test.prop([
    fc.integer({ min: 2, max: 50 }).chain((minLength: number) => {
      return fc.tuple(
        fc.array(fc.integer(), { minLength }),
        fc.constant(minLength),
      );
    }),
  ])("arrayRotator",  (testArrayAndRotations) => {
    const [testArray, testRotations]: [Array<number>, number] =
      testArrayAndRotations;
    const actualRotatedArray: Array<string> = arrayRotator(
      testArrayAndRotations,
    );

    const [actualSet, expectedSet] = convertArrayOfArraysToArrayOfSets([
      actualRotatedArray,
      testArray,
    ]);
    expect(actualSet).toStrictEqual(expectedSet);

    const testArrayLength: number = testArray.length;
    const expectedEffectiveRotations: number = testRotations % testArrayLength;
    const getExpectedNewIndex = getIndexAfterForwardRotation([
      expectedEffectiveRotations,
      testArrayLength,
    ]);
  });

  test.prop([
    fc
      .tuple(
        fc.array(fc.oneof(fc.nat({ max: 50 })), {
          minLength: 50,
          maxLength: 100,
        }),
        fc.integer({ min: 2, max: 48 }),
      )
      .chain(([testArray, testSliceEndIndex]: [Array<number>, number]) => {
        return fc.tuple(
          fc.constant(testArray.length - testSliceEndIndex),
          fc.tuple(
            fc.constant(testArray),
            fc.constant(slice(0, testSliceEndIndex, testArray)),
          ),
        );
      }),
  ])("getArraysSizeDifference",  (testArgs) => {
    const [expectedSizeDifference, testArrays]: [
      number,
      [Array<number>, Array<number>],
    ] = testArgs;
    const actualSizeDifference: number = getArraysSizeDifference(testArrays);
    expect(actualSizeDifference).toEqual(expectedSizeDifference);
  });

  test.prop([
    fc
      .tuple(
        fc.array(fc.oneof(fc.nat({ max: 50 })), {
          minLength: 2,
          maxLength: 25,
        }),
        fc.integer({ min: 2, max: 24 }),
        fc.integer({ min: 51 }),
      )
      .chain(
        ([testArray, testSliceEndIndex, testFillValue]: [
          Array<number>,
          number,
          number,
        ]) => {
          return fc.tuple(
            fc.constant(testFillValue),
            fc.tuple(
              fc.constant(testArray),
              fc.constant(slice(0, testSliceEndIndex, testArray)),
            ),
          );
        },
      ),
  ])("zipLongest",  (testArgs) => {
    const [testFillValue, testArrays]: [number, [Array<number>, Array<number>]] =
      testArgs;
    const actualZippedArrays = zipLongest(testFillValue, testArrays);
    const expectedFillValueCount: number = getArraysSizeDifference(testArrays);
    const actualFilledValueCount: number = pipe([
      flatten,
      filter(eq(testFillValue)),
      size,
    ])(actualZippedArrays);
    expect(actualFilledValueCount).toEqual(expectedFillValueCount);
  });


  

  test.prop([fc.array(fc.integer(), { minLength: 2 })])(
    "convertArrayOfIntegersIntoArrayOfStrings",
     (testIntegers) => {
      const convertedIntegers: Array<string> =
        convertArrayOfIntegersIntoArrayOfStrings(testIntegers);
      const actualIntegers: Array<number> = 
        convertArrayOfStringsIntoArrayOfIntegers
      (convertedIntegers);
      const [actualIntegersSet, expectedIntegersSet] =
        convertArrayOfArraysToArrayOfSets([actualIntegers, testIntegers]);
      expect(actualIntegersSet).toStrictEqual(expectedIntegersSet);
    },
  );

  test.prop([
    fc.array(fc.integer(), { minLength: 2 }).chain((nums: Array<number>) => {
      return fc.constant(convertArrayOfIntegersIntoArrayOfStrings(nums));
    }),
  ])("convertArrayOfStringsIntoArrayOfIntegers",  (testIntegers) => {
    const convertedIntegers: Array<number> =
      convertArrayOfStringsIntoArrayOfIntegers(testIntegers);
    const actualIntegers: Array<string> = 
      convertArrayOfIntegersIntoArrayOfStrings
    (convertedIntegers);

    const [actualIntegersSet, expectedIntegersSet] =
      convertArrayOfArraysToArrayOfSets([actualIntegers, testIntegers]);
    expect(actualIntegersSet).toStrictEqual(expectedIntegersSet);
  });

  



  test.prop([
    fc.array(fc.tuple(fc.integer(), fc.integer()), {
      minLength: 4,
      maxLength: 100,
    }),
  ])("sortTuplesByFirstValueInTuple",  (testTuples) => {
    const actualSortedTuples: Array<[number, number]> =
      sortTuplesByFirstValueInTuple(testTuples);
    const [expectedFirstValue, expectedLastValue]: [number, number] = pipe([
      zipAll,
      first,
      getMinAndMaxOfArray
    ])(testTuples);
    const [[actualFirstValue], [actualLastValue]] = getFirstAndLastItemsOfArray(
      actualSortedTuples,
    );
    expect(actualFirstValue).toEqual(expectedFirstValue);
    expect(actualLastValue).toEqual(expectedLastValue);
  });



  test.prop([fc.array(fc.integer({ min: 1 }), { minLength: 2 })])(
    "accumulate",
     (testNums) => {
      const actualSummedArray: Array<number> = accumulate([add, 0], testNums);
      const expectedLastValue: number = sum(testNums);

      expect(actualSummedArray.length).toEqual(testNums.length);
      expect(head(actualSummedArray)).toEqual(head(testNums));
      expect(last(actualSummedArray)).toEqual(expectedLastValue);

      const actualMultipliedArray: Array<number> = accumulate(
        [multiply, 1],
        testNums,
      );
      expect(head(actualMultipliedArray)).toEqual(head(testNums));
      const [firstVal, secondVal] = testNums;
      expect(last(actualMultipliedArray)).toBeGreaterThanOrEqual(
        multiply(firstVal, secondVal),
      );
    },
  );



  test.prop([
    fc
      .array(fc.integer({ min: 2, max: 10 }), { minLength: 2, maxLength: 5 })
      .chain((vals) => {
        const minLength: number = sum(vals) * 2;
        return fc.tuple(
          fc.constant(vals),
          fc.array(
            fc.oneof(
              fc.string({ minLength: 1 }),
              fc.integer(),
              fc.dictionary(
                fc.string(),
                fc.oneof(fc.string({ minLength: 1 }), fc.integer()),
                {
                  minKeys: 2,
                },
              ),
            ),
            { minLength },
          ),
        );
      }),
  ])("sliceUpArray",  (testArrayAndChunkLengths) => {
    const [testChunkLengths, testArray] = testArrayAndChunkLengths;

    const actualArray = sliceUpArray(testChunkLengths, testArray);
    assert.sameMembers(map(size)(actualArray), testChunkLengths);
  });

  test.prop([
    fc.array(
      fc.array(
        fc.array(fc.tuple(fc.string(), fc.string()), {
          minLength: 20,
          maxLength: 40,
        }),
        {
          minLength: 2, maxLength: 20,
        },
      ),
      { minLength: 2, maxLength: 50 },
    ),
  ])("unflatten",  (clubs) => {
    const clubsSliceLengths: Array<Array<number>> = over([
      getSecondLevelArrayLengths,
      getFirstLevelArrayLengths,
    ])(clubs);

    const testClubs = flattenClubs(clubs);
    const actualClubs = unflatten(clubsSliceLengths, testClubs);
    assert.sameDeepOrderedMembers(actualClubs, clubs);
  });

  test.prop([
    fc.array(
      fc.array(fc.tuple(fc.string(), fc.string()), {
        minLength: 5,
        maxLength: 10,
      }),
      {
        minLength: 2,
	maxLength: 20
      },
    ),
    fc.array(
      fc.array(
        fc.array(fc.tuple(fc.string(), fc.string()), {
          minLength: 20,
          maxLength: 40,
        }),
        {
          minLength: 2,
	  maxLength: 20
        },
      ),
      { minLength: 2, maxLength: 20 },
      
    ),
  ])("tranformNestedAsFlat",  (testDomesticLeagues, testClubs) => {
    const testTransformer = (x) => structuredClone(x);

    const transformCompetitions = transformNestedAsFlat(
      [flattenCompetitions, getFirstLevelArrayLengths, sliceUpArray],
      testTransformer,
    );

    const actualDomesticLeagues =
      transformCompetitions(testDomesticLeagues);

    assert.sameDeepOrderedMembers(actualDomesticLeagues, testDomesticLeagues);

    const transformClubs = transformNestedAsFlat(
      [flattenClubs, getClubsSliceLengths, unflatten],
      testTransformer,
    );

    const actualClubs = transformClubs(testClubs);
    assert.sameDeepOrderedMembers(actualClubs, testClubs);
    
  });


  test.prop([
    fc.gen(),
    fc.integer({min: 2, max: 100}),
  ])("getCountOfItemsFromArrayForPredicate",  (fcGen, testPredicatesCount) => {

    const [testItems, [expectedStringCount, expectedIntegerCount]] = fastCheckNLengthArrayOfStringsAndIntegersGenerator(fcGen, testPredicatesCount)
    const [testGetStringCount, testGetIntegerCount] = map(getCountOfItemsFromArrayForPredicate)([isString, isNumber])
    const [actualStringCount, actualIntegerCount] = over([testGetStringCount, testGetIntegerCount])(testItems)
    
    pairArraysAndAssertStrictEqual([actualStringCount, expectedStringCount, actualIntegerCount, expectedIntegerCount])
  });




  
  test.prop([
    fc.nat(),
    fc.integer({min: 3, max: 50})
  ])("unfoldStartingIndexAndCountIntoRange",  (testStartingIndex, testCount) => {
    const actualRange: Array<number> = unfoldStartingIndexAndCountIntoRange(testStartingIndex, testCount)
    expect(actualRange.length).toEqual(testCount)
    const [actualFirstItem, actualLastItem] = getFirstAndLastItemsOfArray(actualRange)
    const expectedLastIndex: number = minusOne(testStartingIndex+testCount) 
    expect(actualFirstItem).toEqual(testStartingIndex)    
    expect(actualLastItem).toEqual(expectedLastIndex)
    
  });






  test.prop([
    fc.tuple(fc.string(),
      fc.integer({min: 3, max: 1000}))
  ])("unfoldItemCountTupleIntoArray",  (testItemCountTuple) => {
    const actualArray: Array<string> = unfoldItemCountTupleIntoArray(testItemCountTuple)
    const [,expectedCount] = testItemCountTuple
    expect(actualArray.length).toEqual(expectedCount)
    
    
  });
  
  

  
  test.prop([
    fc.gen(),
    fc.integer({min: 3, max: 1000})
  ])("unfoldItemCountTuplesIntoMixedArray",  (fcGen, testTupleCount) => {
    
    const testTuples: Array<[string, number]> = fastCheckNLengthArrayOfStringCountTuplesGenerator(fcGen, testTupleCount)
    const actualArray = unfoldItemCountTuplesIntoMixedArray(testTuples)
    const expectedCount: number = zipAndGetSumOfLastArray(testTuples)
    expect(actualArray.length).toEqual(expectedCount)
    
    
  });




});
