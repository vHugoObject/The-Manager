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
  chunk,
  subtract,
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
  idMapper,
  convertBaseCountriesToBaseEntities,
  flattenCompetitions,
  flattenClubs,
  flattenPlayers,
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
} from "../CreateEntities";

describe("CreateEntities", async () => {
  const getTotalCompetitions = flowAsync(flattenCompetitions, size);
  const getTotalClubs = flowAsync(flattenClubs, size);

  const getBaseEntitiesCount = updatePaths({
    countries: size,
    competitions: getTotalCompetitions,
    clubs: getTotalClubs,
  });

  const getExpectedPlayersCount = flowAsync(
    flattenClubs,
    size,
    multiply(DEFAULTSQUADSIZE),
  );

  test.prop([
    fc.array(
      fc.oneof(
        fakerToArb((faker) => faker.location.country()),
        fakerToArb((faker) => faker.company.name()),
        fc.constantFrom(...POSITIONGROUPSLIST),
      ),
      { minLength: 20, maxLength: 100 },
    ),
  ])("idMapper", async (testNames) => {
    const mappedNames: Array<[string, string]> = await idMapper(testNames);
    const [actualIDs, actualNames]: [Array<string>, Array<string>] = zipAll(
      mappedNames,
    ) as [Array<string>, Array<string>];
    assert.sameMembers(actualNames, testNames);
    map((id: string) => expect(id.length).toEqual(36))(actualIDs);
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
  ])("flatteners", async (testCompetitions, testClubs) => {
    const zipper = zipObject(["competitions", "clubs"]);
    const [actualCompetitions, actualClubs, expected]: [
      Array<[string, string]>,
      Array<[string, string]>,
      Record<string, number>,
    ] = await Promise.all([
      flattenCompetitions(testCompetitions),
      flattenClubs(testClubs),
      flowAsync(
        zipper,
        updatePaths({
          competitions: getTotalCompetitions,
          clubs: getTotalClubs,
        }),
      )([testCompetitions, testClubs]),
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
  ])("getLevelLengths", async (testCompetitions, testClubs) => {
    const zipper = zipObject(["competitions", "clubs"]);

    const [
      expectedCompetitions,
      expectedClubs,
      actualCompetitions,
      actualClubs,
    ]: Array<number> = await Promise.all([
      await flowAsync(flattenCompetitions, size)(testCompetitions),
      await flowAsync(flattenClubs, size)(testClubs),
      await flowAsync(getFirstLevelArrayLengths, sum)(testCompetitions),
      await flowAsync(getSecondLevelArrayLengths, sum)(testClubs),
    ]);

    const [actual, expected]: [Record<string, number>, Record<string, number>] =
      map(zipper)([
        [actualCompetitions, actualClubs],
        [expectedCompetitions, expectedClubs],
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
  ])("tranformNestedAsFlat", async (testCompetitions, testClubs) => {
    const testTransformer = (x) => structuredClone(x);

    const transformCompetitions = transformNestedAsFlat(
      [flattenCompetitions, getFirstLevelArrayLengths, sliceUpArray],
      testTransformer,
    );

    const actualCompetitions = await transformCompetitions(testCompetitions);

    assert.sameDeepOrderedMembers(actualCompetitions, testCompetitions);

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
  ])("convertBaseCountriesToBaseEntities", async (testBaseCountries) => {
    const zipper = zipObject(["countries", "competitions", "clubs"]);

    const expectedCounts = flowAsync(
      zipAll,
      zipper,
      getBaseEntitiesCount,
    )(testBaseCountries);

    const actualBaseEntities: BaseEntities =
      await convertBaseCountriesToBaseEntities(testBaseCountries);
    const actualCounts = getBaseEntitiesCount(actualBaseEntities);
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
    const expectedPlayersCount: number = getExpectedPlayersCount(testClubs);
    const expectedPositionCounts: Record<string, number> = flowAsync(
      map(([position, count]: [string, number]) => [
        position,
        multiply(count, expectedClubsCount),
      ]),
      Object.fromEntries,
    )(BASECLUBCOMPOSITION);
    const actualClubSizes = flowAsync(
      map(size),
      convertToSet,
    )(actualPlayerReferences);
    const [actualIDs, actualPositions] = flowAsync(
      flatten,
      zipAll,
    )(actualPlayerReferences);
    const actualPositionCounts = countBy(identity, actualPositions);

    expect(new Set(actualIDs)).toStrictEqual(
      new Set(range(0, expectedPlayersCount)),
    );
    expect(actualClubSizes).toStrictEqual(new Set([DEFAULTSQUADSIZE]));
    expect(actualPositionCounts).toStrictEqual(expectedPositionCounts);
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
          competitions: fc.array(
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
    ],
    { numRuns: 100 },
  )("createEntities", async (testBaseEntities) => {
    const actualEntities: Record<string, Entity> =
      await createEntities(testBaseEntities);
    const {
      countries: expectedCountries,
      competitions,
      clubs,
    } = testBaseEntities;

    const expectedCompetitions = flattenCompetitions(competitions);
    const expectedClubs = flattenClubs(clubs);
    const expectedPlayersCount = getExpectedPlayersCount(clubs);
    const [expectedIDsSansPlayers] = flowAsync(
      flatten,
      zipAll,
    )([expectedCountries, expectedCompetitions, expectedClubs]);
    const expectedIDs = concat(
      expectedIDsSansPlayers,
      flowAsync(range, map(toString))(0, expectedPlayersCount),
    );

    const [actualIDsSet, expectedIDsSet] = convertArrayOfArraysToArrayOfSets([
      Object.keys(actualEntities),
      expectedIDs,
    ]);
    expect(actualIDsSet).toStrictEqual(expectedIDsSet);
  });
});
