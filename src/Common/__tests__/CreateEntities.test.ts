import { BaseEntity, BaseEntities, Entity } from "../CommonTypes";
import { test, fc } from "@fast-check/vitest";
import { assert, describe, expect } from "vitest";
import {
  first,
  map,
  over,
  zipAll,
  size,
  mapValues,
  head,
  sum,
  multiply,
  zipObject,
  add,
  last,
  concat,
  flatten,
  countBy,
  identity,
  range,
  toString,
} from "lodash/fp";
import { flowAsync, updatePaths, expandObjectBy } from "futil-js";
import { POSITIONGROUPSLIST } from "../../Players/PlayerConstants";
import { fakerToArb } from "../testingUtilities";
import { BASECLUBCOMPOSITION, DEFAULTSQUADSIZE } from "../Constants";
import {
  convertArrayOfArraysToArrayOfSets,
  convertToSet,
} from "../CommonUtilities";
import {
  convertBaseCountriesToBaseEntities,
  flattenCompetitions,
  flattenClubs,
  accumulate,
  sliceUpArray,
  unflatten,
  getFirstLevelArrayLengths,
  getSecondLevelArrayLengths,
  getRunningSumOfList,
  transformNestedAsFlat,
  getClubsSliceLengths,
  createEntities,
  createPlayerReferencesForClubs,
  getRunningSumOfListOfTuples,
  getIDNumber,
  getLastEntityIDNumber
} from "../CreateEntities";

describe("CreateEntities", async () => {

  const getLastIDNumberOutOfIDNameTuple = flowAsync(last, first, getIDNumber)
  const getTotalActualDomesticLeagues = flowAsync(flattenCompetitions, getLastIDNumberOutOfIDNameTuple);
  const getTotalActualClubs = flowAsync(flattenClubs, getLastIDNumberOutOfIDNameTuple) ;

  
  const getActualBaseEntitiesCount = updatePaths({
    countries: getLastIDNumberOutOfIDNameTuple,
    domesticLeagues: getTotalActualDomesticLeagues,
    clubs: getTotalActualClubs,
  });

  const getTotalTestDomesticLeagues = flowAsync(flattenCompetitions, size)
  const getTotalTestClubs = flowAsync(flattenClubs, size)

  const getTestBaseEntitiesCount = updatePaths({
    countries: size,
    domesticLeagues: getTotalTestDomesticLeagues,
    clubs: getTotalTestClubs
  });

  const getExpectedPlayersCount = flowAsync(
    flattenClubs,
    size,
    multiply(DEFAULTSQUADSIZE),
  );

  test.prop([
    fc.tuple(fc.integer(), fc.nat())
      .chain(([testIDNumber, testSeason]: [number, number]) => {
	return fc.oneof(
	  fc.constant(`Country_${testIDNumber}`),
	  fc.constant(`DomesticLeague_${testSeason}_${testIDNumber}`),
	  fc.constant(`Club_${testSeason}_${testIDNumber}`),
	  fc.constant(`Midfielder_${testIDNumber}`),
	  fc.constant(`Attacker_${testIDNumber}`),
	  fc.constant(`Defender_${testIDNumber}`),
	  fc.constant(`GoalKeeper_${testIDNumber}`)
	)
      }
    )
  ])("getIDNumber", async (testEntityID) => {
    const actualIDNumber: number = getIDNumber(testEntityID)
    expect(actualIDNumber).toBeTypeOf('number')
    flowAsync(toString,      
      (actualNumber: string) => expect(testEntityID.includes(actualNumber)).toBeTruthy())(actualIDNumber)
    
  });

  test.prop([
    fc.tuple(fc.constantFrom("Country", "DomesticLeague", "Club",
      "Midfielder", "GoalKeeper", "Attacker", "Defender"), fc.integer({min: 1, max: 1000}))
      .chain(([testEntityType, testEntityCount]: [string, number]) => {
	return fc.tuple(fc.constant(map((testIDNumber: number) => `${testEntityType}_${testIDNumber}`)(range(1, testEntityCount+1))),
	  fc.constant(testEntityCount)
	)
      })
  ])("getLastEntityIDNumber", async (testEntityIDsAndCount) => {
    const [testEntityIDs, testCount]: [Array<string>, number] = testEntityIDsAndCount
    const actualIDNumber: number = getLastEntityIDNumber(testEntityIDs)
    expect(actualIDNumber).toEqual(testCount)
        
  });
  
  test.prop([
    fc.array(
      fc.array(
        fc.tuple(fc.string(), fc.string({ minLength: 4, maxLength: 6 })),
        {
          minLength: 2,
        },
      ),
      { minLength: 2 },
    ),
    fc.array(
      fc.array(
        fc.array(
          fc.tuple(fc.string(), fc.string({ minLength: 4, maxLength: 6 })),
          { minLength: 2 },
        ),
        { minLength: 2 },
      ),
      { minLength: 2 },
    ),
  ])("flatteners", async (testDomesticLeagues, testClubs) => {
    const zipper = zipObject(["domesticLeagues", "clubs"]);
    const [actualCompetitions, actualClubs, expected]: [
      Array<[string, string]>,
      Array<[string, string]>,
      Record<string, number>,
    ] = await Promise.all([
      flattenCompetitions(testDomesticLeagues),
      flattenClubs(testClubs),
      flowAsync(
        zipper,
        updatePaths({
          domesticLeagues: getTotalTestDomesticLeagues,
          clubs: getTotalTestClubs,
        }),
      )([testDomesticLeagues, testClubs]),
    ]);

    const actual: Record<string, number> = flowAsync(
      zipper,
      mapValues(size),
    )([actualCompetitions, actualClubs]);

    expect(actual).toStrictEqual(expected);
  });

  test.prop([fc.array(fc.integer({ min: 1 }), { minLength: 2 })])(
    "accumulate",
    async (testNums) => {
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

  test.prop([fc.array(fc.integer({ min: 1 }), { minLength: 2 })])(
    "getRunningSumOfList",
    async (testNums) => {
      const actualSummedArray: Array<number> = getRunningSumOfList(testNums);
      const expectedLastValue: number = sum(testNums);

      assert.lengthOf(actualSummedArray, testNums.length);
      expect(head(actualSummedArray)).toEqual(head(testNums));
      expect(last(actualSummedArray)).toEqual(expectedLastValue);
    },
  );

  test.prop([
    fc.array(fc.tuple(fc.string(), fc.integer({ min: 1 })), { minLength: 4 }),
  ])("getRunningSumOfListOfTuples", async (testStringCountTuples) => {
    const actualTuples: Array<[string, number, number]> =
      getRunningSumOfListOfTuples(0, testStringCountTuples);
    const expectedLastValue: number = flowAsync(
      map(last),
      sum,
    )(testStringCountTuples);

    assert.lengthOf(actualTuples, testStringCountTuples.length);
    const expectedFirstTuple: [string, number, number] = flowAsync(
      first,
      ([expectedString, expectedCount]: [string, number]) => [
        expectedString,
        expectedCount,
        expectedCount,
      ],
    )(testStringCountTuples);
    const expectedLastTuple: [string, number, number] = flowAsync(
      last,
      ([expectedString, expectedCount]: [string, number]) => [
        expectedString,
        expectedCount,
        expectedLastValue,
      ],
    )(testStringCountTuples);

    expect(first(actualTuples)).toStrictEqual(expectedFirstTuple);
    expect(last(actualTuples)).toStrictEqual(expectedLastTuple);
  });

  test.prop([
    fc.array(fc.array(fc.tuple(fc.string(), fc.string()), { minLength: 2 }), {
      minLength: 2,
    }),
    fc.array(
      fc.array(fc.array(fc.tuple(fc.string(), fc.string()), { minLength: 2 }), {
        minLength: 2,
      }),
      { minLength: 2 },
    ),
  ])("getLevelLengths", async (testDomesticLeagues, testClubs) => {
    const zipper = zipObject(["domesticLeagues", "clubs"]);

    const [
      expectedDomesticLeagues,
      expectedClubs,
      actualDomesticLeagues,
      actualClubs,
    ]: Array<number> = await Promise.all([
      await flowAsync(flattenCompetitions, size)(testDomesticLeagues),
      await flowAsync(flattenClubs, size)(testClubs),
      await flowAsync(getFirstLevelArrayLengths, sum)(testDomesticLeagues),
      await flowAsync(getSecondLevelArrayLengths, sum)(testClubs),
    ]);

    const [actual, expected]: [Record<string, number>, Record<string, number>] =
      map(zipper)([
        [actualDomesticLeagues, actualClubs],
        [expectedDomesticLeagues, expectedClubs],
      ]);

    expect(actual).toStrictEqual(expected);
  });

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
  ])("sliceUpArray", async (testArrayAndChunkLengths) => {
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
          minLength: 2,
        },
      ),
      { minLength: 2 },
    ),
  ])("unflatten", async (clubs) => {
    const clubsSliceLengths: Array<Array<number>> = over([
      getSecondLevelArrayLengths,
      getFirstLevelArrayLengths,
    ])(clubs);

    const testClubs = flattenClubs(clubs);
    const actualClubs = await unflatten(clubsSliceLengths, testClubs);
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
        },
      ),
      { minLength: 2 },
    ),
  ])("tranformNestedAsFlat", async (testDomesticLeagues, testClubs) => {
    const testTransformer = (x) => structuredClone(x);

    const transformCompetitions = transformNestedAsFlat(
      [flattenCompetitions, getFirstLevelArrayLengths, sliceUpArray],
      testTransformer,
    );

    const actualDomesticLeagues = await transformCompetitions(testDomesticLeagues);

    assert.sameDeepOrderedMembers(actualDomesticLeagues, testDomesticLeagues);

    const transformClubs = transformNestedAsFlat(
      [flattenClubs, getClubsSliceLengths, unflatten],
      testTransformer,
    );

    const actualClubs = await transformClubs(testClubs);
    assert.sameDeepOrderedMembers(actualClubs, testClubs);
  });

  test.prop([
    fc.array(
      fc.tuple(
        fc.string(),
        fc.array(fc.string(), { minLength: 5, maxLength: 10 }),
        fc.array(fc.array(fc.string(), { minLength: 2 }), {
          minLength: 20,
          maxLength: 40,
        }),
      ),
      { minLength: 5, maxLength: 15 },      
    ),
    fc.integer({min: 2000, max: 2100})
  ])("convertBaseCountriesToBaseEntities", async (testBaseCountries, testSeason) => {
    const zipper = zipObject(["countries", "domesticLeagues", "clubs"]);

    const expectedCounts = flowAsync(
      zipAll,
      zipper,
      getTestBaseEntitiesCount,
    )(testBaseCountries);

    const actualBaseEntities: BaseEntities =
	  await convertBaseCountriesToBaseEntities(testSeason, testBaseCountries);
    const actualCounts = getActualBaseEntitiesCount(actualBaseEntities);

    expect(actualCounts).toStrictEqual(expectedCounts);
    
  });

  test.prop([
    fc.array(
      fc.array(
        fc.array(fc.tuple(fc.string(), fc.string()), {
          minLength: 20,
          maxLength: 40,
        }),
        { minLength: 5, maxLength: 10 },
      ),
      { minLength: 5, maxLength: 10 },
    ),
  ])("createPlayerReferencesForClubs", async (testClubs) => {
    const actualPlayerReferences: Array<Array<BaseEntity>> =
      await createPlayerReferencesForClubs(testClubs);

    const expectedClubsCount: number = flowAsync(flattenClubs, size)(testClubs);
    const expectedPositionCounts: Array<[string, number]> = flowAsync(
      map(([position, count]: [string, number]) => [
        position,
        multiply(count, expectedClubsCount),
      ]),
    )(BASECLUBCOMPOSITION);
    const expectedPositionCountsObject: Record<string, number> = Object.fromEntries(expectedPositionCounts)
    const expectedLastPositionIDs: Array<string> = map(([position, count]: [string, number]) => `${position}_${count}`)(expectedPositionCounts)
    
    const actualClubSizes = flowAsync(
      map(size),
      convertToSet,
    )(actualPlayerReferences);

    const [actualIDs, actualPositions] = flowAsync(
      flatten,
      zipAll,
    )(actualPlayerReferences);
    const actualPositionCountsObject = countBy(identity, actualPositions);

    
    const actualIDsSet = new Set(actualIDs)
    map((expectedLastPositionID: string) => {
      expect(actualIDsSet.has(expectedLastPositionID)).toBeTruthy()
    })(expectedLastPositionIDs)
    
    expect(actualClubSizes).toStrictEqual(new Set([DEFAULTSQUADSIZE]));
    expect(actualPositionCountsObject).toStrictEqual(expectedPositionCountsObject);
  });

  test.prop(
    [
      fc.constantFrom(1, 2, 3, 4, 5).chain((minMax) =>
        fc.record({
          countries: fc.array(
            fc.tuple(
              fc.noShrink(fc.constant("")).map(() => crypto.randomUUID()),
              fc.string(),
            ),
            { minLength: minMax, maxLength: minMax },
          ),
          domesticLeagues: fc.array(
            fc.array(
              fc.tuple(
                fc.noShrink(fc.constant("")).map(() => crypto.randomUUID()),
                fc.string(),
              ),
              { minLength: 4, maxLength: 4 },
            ),
            { minLength: minMax, maxLength: minMax },
          ),
          clubs: fc.array(
            fc.array(
              fc.array(
                fc.tuple(
                  fc.noShrink(fc.constant("")).map(() => crypto.randomUUID()),
                  fc.string(),
                ),
                { minLength: 20, maxLength: 40 },
              ),
              { minLength: 4, maxLength: 4 },
            ),
            { minLength: minMax, maxLength: minMax },
          ),
        }),
      ),
    ]    
  )("createEntities", async (testBaseEntities) => {
    
    const {
      countries: expectedCountries,
      domesticLeagues,
      clubs,
    } = testBaseEntities;

    const expectedDomesticLeagues = flattenCompetitions(domesticLeagues);
    const expectedClubs = flattenClubs(clubs);
    const expectedPlayersCount = getExpectedPlayersCount(clubs);
    const expectedEntitiesCount = flowAsync(
      flatten,
      size,
      add(expectedPlayersCount)
    )([expectedCountries, expectedDomesticLeagues, expectedClubs]);
    const actualEntities: Record<string, Entity> =
	  await createEntities(testBaseEntities);
    
    expect(Object.keys(actualEntities).length).toEqual(expectedEntitiesCount)
    
  });
});
