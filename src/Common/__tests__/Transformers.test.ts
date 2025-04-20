import { test, fc } from "@fast-check/vitest";
import { describe, expect, assert } from "vitest";
import { over, map, size, sum, last, pipe, zipAll, first } from "lodash/fp"
import { getFirstLevelArrayLengths, getSecondLevelArrayLengths,
  getMinAndMaxOfArray, getFirstAndLastItemsOfArray } from "../Getters"
import {
  flattenClubs,
  flattenCompetitions,
  getClubsSliceLengths,
} from "../BaseEntitiesUtilities";
import {
  unflatten, sliceUpArray, transformNestedAsFlat,
  convertArrayOfArraysIntoArrayOfLinearRanges,
  convertArrayIntoLinearRange,
  sortTuplesByFirstValueInTuple,
  convertCharacterCodeIntoCharacter,
  convertCharacterIntoCharacterCode
} from "../Transformers"

describe("Converters test suite", () => {

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
  ])("sliceUpArray", (testArrayAndChunkLengths) => {
    const [testChunkLengths, testArray] = testArrayAndChunkLengths;

    const actualArray = sliceUpArray(testChunkLengths, testArray);
    assert.sameMembers(map(size)(actualArray), testChunkLengths);
  });


  test.prop([
    fc.array(
      fc.array(fc.tuple(fc.string(), fc.string()), {
        minLength: 5,
        maxLength: 10,
      }),
      {
        minLength: 2,
        maxLength: 20,
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
          maxLength: 20,
        },
      ),
      { minLength: 2, maxLength: 20 },
    ),
  ])("tranformNestedAsFlat", (testDomesticLeagues, testClubs) => {
    const testTransformer = (x) => structuredClone(x);

    const transformCompetitions = transformNestedAsFlat(
      [flattenCompetitions, getFirstLevelArrayLengths, sliceUpArray],
      testTransformer,
    );

    const actualDomesticLeagues = transformCompetitions(testDomesticLeagues);

    assert.sameDeepOrderedMembers(actualDomesticLeagues, testDomesticLeagues);

    const transformClubs = transformNestedAsFlat(
      [flattenClubs, getClubsSliceLengths, unflatten],
      testTransformer,
    );

    const actualClubs = transformClubs(testClubs);
    assert.sameDeepOrderedMembers(actualClubs, testClubs);
  });


  test.prop([
    fc.array(
      fc.array(
        fc.array(fc.tuple(fc.string(), fc.string()), {
          minLength: 20,
          maxLength: 40,
        }),
        {
          minLength: 2,
          maxLength: 20,
        },
      ),
      { minLength: 2, maxLength: 50 },
    ),
  ])("unflatten", (clubs) => {
    const clubsSliceLengths: Array<Array<number>> = over([
      getSecondLevelArrayLengths,
      getFirstLevelArrayLengths,
    ])(clubs);

    const testClubs = flattenClubs(clubs);
    const actualClubs = unflatten(clubsSliceLengths, testClubs);
    assert.sameDeepOrderedMembers(actualClubs, clubs);
  });


    test.prop([fc.string({ minLength: 1, maxLength: 1 })])(
    "convertCharacterIntoCharacterCode",
    async (testChar) => {
      const actualCharCode: number = convertCharacterIntoCharacterCode(testChar);
      assert.isNumber(actualCharCode);
    },
  );

  test.prop([fc.integer({ min: 1, max: 100 })])(
    "convertCharacterCodeIntoCharacter",
    async (testInteger) => {
      const actualChar: string = convertCharacterCodeIntoCharacter(testInteger);
      assert.isString(actualChar);
    },
  );

  
    test.prop([fc.array(fc.string(), { minLength: 3, maxLength: 200 })])(
    "convertArrayIntoLinearRange",
    async (testArrayOfStrings) => {
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
    "convertArrayOfArraysIntoArrayOfLinearRanges",
    async (testArrayOfArraysOfStrings) => {
      const actualRanges: Array<[number, number]> =
        convertArrayOfArraysIntoArrayOfLinearRanges(testArrayOfArraysOfStrings);
      expect(actualRanges.length).toEqual(testArrayOfArraysOfStrings.length);
    })

    test.prop([
    fc.array(fc.tuple(fc.integer(), fc.integer()), {
      minLength: 4,
      maxLength: 100,
    }),
  ])("sortTuplesByFirstValueInTuple", (testTuples) => {
    const actualSortedTuples: Array<[number, number]> =
      sortTuplesByFirstValueInTuple(testTuples);
    const [expectedFirstValue, expectedLastValue]: [number, number] = pipe([
      zipAll,
      first,
      getMinAndMaxOfArray,
    ])(testTuples);
    const [[actualFirstValue], [actualLastValue]] =
      getFirstAndLastItemsOfArray(actualSortedTuples);
    expect(actualFirstValue).toEqual(expectedFirstValue);
    expect(actualLastValue).toEqual(expectedLastValue);
  });



})
