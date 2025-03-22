import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  map,
  over,
  zipAll,
  size,
  sum,
  multiply,
  flatten,
  countBy,
  identity,
} from "lodash/fp";
import { flowAsync } from "futil-js";
import { BaseEntity, BaseEntities, Entity } from "../CommonTypes";
import { BASECLUBCOMPOSITION, DEFAULTSQUADSIZE } from "../Constants";
import { convertToSet } from "../CommonUtilities";
import { fakerToArb } from "../testingUtilities";
import {
  getTestBaseEntitiesCount,
  getExpectedPlayersCount,
  flattenClubs,
  convertBaseCountriesToBaseEntities,
} from "../BaseEntitiesUtilities";
import {
  createEntities,
  createPlayerReferencesForClubs,
} from "../CreateEntities";

describe("CreateEntities", async () => {
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
    const expectedPositionCountsObject: Record<string, number> =
      Object.fromEntries(expectedPositionCounts);
    const expectedLastPositionIDs: Array<string> = map(
      ([position, count]: [string, number]) => `${position}_${count}`,
    )(expectedPositionCounts);

    const actualClubSizes = flowAsync(
      map(size),
      convertToSet,
    )(actualPlayerReferences);

    const [actualIDs, actualPositions] = flowAsync(
      flatten,
      zipAll,
    )(actualPlayerReferences);
    const actualPositionCountsObject = countBy(identity, actualPositions);

    const actualIDsSet = new Set(actualIDs);
    map((expectedLastPositionID: string) => {
      expect(actualIDsSet.has(expectedLastPositionID)).toBeTruthy();
    })(expectedLastPositionIDs);

    expect(actualClubSizes).toStrictEqual(new Set([DEFAULTSQUADSIZE]));
    expect(actualPositionCountsObject).toStrictEqual(
      expectedPositionCountsObject,
    );
  });

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.constantFrom(1, 2, 3, 4, 5).chain((testCompetitionsCount: number) => {
      return fc.array(
        fc.tuple(
          fakerToArb((faker) => faker.location.country()),
          fc.array(
            fakerToArb((faker) => faker.company.name()),
            {
              minLength: testCompetitionsCount,
              maxLength: testCompetitionsCount,
            },
          ),
          fc.array(
            fc.array(
              fakerToArb((faker) => faker.company.name()),
              { minLength: 20, maxLength: 20 },
            ),
            {
              minLength: testCompetitionsCount,
              maxLength: testCompetitionsCount,
            },
          ),
        ),
        { minLength: 1, maxLength: 5 },
      );
    }),
  ])("createEntities", async (testSeason, testCountriesLeaguesClubs) => {
    const testBaseEntities: BaseEntities =
      await convertBaseCountriesToBaseEntities(
        testSeason,
        testCountriesLeaguesClubs,
      );

    const getExpectedEntitiesSansPlayerCount: number = flowAsync(
      getTestBaseEntitiesCount,
      Object.values,
      flatten,
      sum,
    );
    const expectedBaseEntitiesCount: number = flowAsync(
      over([getExpectedPlayersCount, getExpectedEntitiesSansPlayerCount]),
      sum,
    )(testBaseEntities);

    const actualEntities: Record<string, Entity> =
      await createEntities(testBaseEntities);
    expect(size(actualEntities)).toEqual(expectedBaseEntitiesCount);
  });
});
