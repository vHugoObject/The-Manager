import { test, fc } from "@fast-check/vitest";
import { describe, expect, assert } from "vitest";
import { faker } from "@faker-js/faker";
import { Manager as TournamentManager } from "tournament-organizer/components";
import {
  flatMap,
  toPairs,
  concat,
  map,
  zip,
  mapValues,
  partial,
  head,
  sum,
  constant,
  property,
} from "lodash/fp";
import { flowAsync, mapValuesIndexed } from "futil-js";
import { Entity, SaveArguments } from "../CommonTypes";
import { Save } from "../../StorageUtilities/SaveTypes";
import { BaseCountries } from "../../Countries/CountryTypes";
import { Club } from "../../Clubs/ClubTypes";
import { Player } from "../../Players/PlayerTypes";
import { createSave } from "../../StorageUtilities/SaveCreator";
import { fakerToArb } from "../testingUtilities";
import {
  statisticsObjectUpdater,
  statisticsObjectCreator,
  entitiesStatisticsCreator,
  updateEntityStatistics,
  updateEntitiesStatistics,
  getSeasonOfEntitiesStatistics,
  getEntity,
  getEntities,
  getEntityName,
  getEntitiesNames,
  getEntityWithID,
  getEntitiesWithIDs,
  getIDs,
  getNames,
} from "../entityUtilities";

describe("entityUtilities test suite", async () => {
  const testMatchDate: Date = new Date("August 18, 2024");
  const testStartingSeason: string = "2024";

  const randomPlayerClub = async (
    testCountriesLeaguesClubs: BaseCountries,
    g,
  ) => {
    const clubs: Array<[string, string]> = await flowAsync(
      Object.values,
      flatMap((competitions: Record<string, Record<string, string>>) =>
        Object.values(competitions),
      ),
      flatMap((clubs: Record<string, string>) => toPairs(clubs)),
    )(testCountriesLeaguesClubs);
    const randomIndex = g(fc.integer, { min: 0, max: clubs.length - 1 });
    const [clubID, clubName] = clubs[randomIndex];
    return { clubID, clubName };
  };

  const getTestSeason = flowAsync(Object.values, head, Object.keys, head);
  const testStats = (season: string): StatisticsType => {
    return {
      [season]: {
        Goals: 0,
        "Expected Goals": 0,
        Wins: 0,
        Draws: 0,
        Losses: 0,
      },
    };
  };

  const testCalendar = fc.dictionary(
    fakerToArb((faker) => faker.date.anytime().toDateString()),
    fc.record({
      matches: fc.dictionary(
        fakerToArb((faker) => faker.string.uuid()),
        fc.record({
          match: fc.record({
            active: fc.boolean(),
            bye: fc.boolean(),
            id: fakerToArb((faker) => faker.string.uuid()),
            match: fc.integer({ min: 0, max: 38 }),
            path: fc.record({
              loss: fc.string(),
              win: fc.string(),
            }),
            player1: fc.record({
              draw: fc.integer({ min: 0, max: 1 }),
              id: fakerToArb((faker) => faker.string.uuid()),
              loss: fc.integer({ min: 0, max: 1 }),
              win: fc.integer({ min: 0, max: 1 }),
            }),
            player2: fc.record({
              draw: fc.integer({ min: 0, max: 1 }),
              id: fakerToArb((faker) => faker.string.uuid()),
              loss: fc.integer({ min: 0, max: 1 }),
              win: fc.integer({ min: 0, max: 1 }),
            }),
            round: fc.integer({ min: 0, max: 38 }),
          }),
          tournamentID: fakerToArb((faker) => faker.string.uuid()),
          season: fakerToArb((faker) =>
            faker.date.anytime().getFullYear().toString(),
          ),
        }),
      ),
      seasonStartDate: fc.boolean(),
      seasonEndDate: fc.boolean(),
      transferWindowOpen: fc.boolean(),
    }),
    { minKeys: 2 },
  );

  test.prop([
    fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
  ])(
    "statisticsObjectCreator should create a statisticsObject for every season",
    async (testYear) => {
      const actualEntityStatistics: StatisticsType =
        await statisticsObjectCreator(testYear);

      const expectedKeys: Set<string> = new Set([
        "Goals",
        "Expected Goals",
        "Wins",
        "Losses",
        "Draws",
      ]);
      const actualKeys: Set<string> = new Set(
        Object.keys(actualEntityStatistics[testYear]),
      );

      expect(actualKeys).toStrictEqual(expectedKeys);
    },
  );

  test.prop([
    fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
    fc.array(
      fakerToArb((faker) => faker.string.numeric()),
      { minLength: 1 },
    ),
  ])(
    "entitiesStatisticsCreator should create an object with StatisticsTypes for every entity",
    async (testYear, testEntityKeys) => {
      const actualStatistics: Record<string, StatisticsType> =
        await entitiesStatisticsCreator(testYear, testEntityKeys);

      testEntityKeys.forEach((expectedKey) => {
        expect(actualStatistics[expectedKey]).toBeDefined();
      });
    },
  );

  test.prop([
    fc.record({
      Goals: fc.nat({ max: 30 }),
      "Expected Goals": fc.float({ min: 0, max: 30 }),
      Wins: fc.nat({ max: 30 }),
      Losses: fc.nat({ max: 30 }),
      Draws: fc.nat({ max: 30 }),
    }),
    fc.record({
      Goals: fc.nat({ max: 30 }),
      "Expected Goals": fc.float({ min: 0, max: 30 }),
      Wins: fc.nat({ max: 30 }),
      Losses: fc.nat({ max: 30 }),
      Draws: fc.nat({ max: 30 }),
    }),
  ])(
    "statisticsUpdater should update statistics",
    async (testOldStats, testStatsToAdd) => {
      const actualUpdatedStats: StatisticsObject =
        await statisticsObjectUpdater(testStatsToAdd, testOldStats);

      // switch around actual and expected
      Object.entries(actualUpdatedStats).forEach(
        ([actualKey, actualValue]: [string, number]) => {
          const expectedValue: number =
            testOldStats[actualKey] + testStatsToAdd[actualKey];
          expect(actualValue).toBe(expectedValue);
        },
      );
    },
  );

  test.prop([
    fc.gen(),
    fc.dictionary(
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.record({
        Goals: fc.nat({ max: 30 }),
        "Expected Goals": fc.float({ min: 0, max: 30 }),
        Wins: fc.nat({ max: 30 }),
        Losses: fc.nat({ max: 30 }),
        Draws: fc.nat({ max: 30 }),
      }),
      { minKeys: 2 },
    ),
    fc.record({
      Goals: fc.nat({ max: 30 }),
      "Expected Goals": fc.float({ min: 0, max: 30 }),
      Wins: fc.nat({ max: 30 }),
      Losses: fc.nat({ max: 30 }),
      Draws: fc.nat({ max: 30 }),
    }),
  ])(
    "updateEntityStatistics should update a statistics object with newStats",
    async (g, testEntityStatistics, testStatsToAdd) => {
      const testYears: Array<string> = Object.keys(testEntityStatistics);
      const testYearIndex: number = g(fc.nat, { max: testYears.length - 1 });
      const testYear: string = testYears[testYearIndex];
      const actualUpdatedStats: StatisticsType = await updateEntityStatistics(
        testYear,
        [testEntityStatistics, testStatsToAdd],
      );

      const testOldStats: StatisticsObject = testEntityStatistics[testYear];

      // switch around actual and expected
      Object.entries(actualUpdatedStats[testYear]).forEach(
        ([actualKey, actualValue]: [string, number]) => {
          const expectedValue: number =
            testOldStats[actualKey] + testStatsToAdd[actualKey];
          expect(actualValue).toEqual(expectedValue);
        },
      );

      // everything else should be untouched
      const allYears: Set<string> = new Set(Object.keys(testEntityStatistics));
      const testYearAsSet: Set<string> = new Set([testYear]);
      const unTouchedYears: Set<string> = allYears.difference(testYearAsSet);

      unTouchedYears.forEach((untouchedYear: string) => {
        expect(actualUpdatedStats[untouchedYear]).toStrictEqual(
          testEntityStatistics[untouchedYear],
        );
      });
    },
  );

  test.prop([
    fakerToArb((faker) => faker.date.anytime().getFullYear().toString()).chain(
      (season: string) => {
        return fc.dictionary(
          fakerToArb((faker) => faker.string.uuid()),
          fc.dictionary(
            fc.constant(season),
            fc.record({
              Goals: fc.nat({ max: 30 }),
              "Expected Goals": fc.nat({ max: 1 }),
              Wins: fc.nat({ max: 30 }),
              Losses: fc.nat({ max: 30 }),
              Draws: fc.nat({ max: 30 }),
            }),
            { minKeys: 1, maxKeys: 1 },
          ),
          { minKeys: 2 },
        );
      },
    ),
    fc.gen(),
  ])("getSeasonOfEntitiesStatistics", async (testEntitiesStatistics) => {
    const testSeason: string = getTestSeason(testEntitiesStatistics);

    const actualStats: Record<string, StatisticsObject> =
      await getSeasonOfEntitiesStatistics(testSeason, testEntitiesStatistics);

    const mapExpectedStatsToExpectedKeys = (
      expectedStats: Record<string, any>,
      expectedEntitiesStatistics: Record<string, StatisticsObject>,
    ) => {
      return mapValues(constant(expectedStats))(expectedEntitiesStatistics);
    };

    const expectedStatObject: Record<string, any> = {
      Goals: expect.any(Number),
      "Expected Goals": expect.any(Number),
      Wins: expect.any(Number),
      Losses: expect.any(Number),
      Draws: expect.any(Number),
    };

    const expectedStats: Record<
      string,
      Record<string, any>
    > = mapExpectedStatsToExpectedKeys(
      expectedStatObject,
      testEntitiesStatistics,
    );

    expect(actualStats).toStrictEqual(expectedStats);
  });

  test.prop([
    fakerToArb((faker) => faker.date.anytime().getFullYear().toString()).chain(
      (season: string) => {
        return fc.dictionary(
          fakerToArb((faker) => faker.string.uuid()),
          fc.dictionary(
            fc.constant(season),
            fc.record({
              Goals: fc.nat({ max: 30 }),
              "Expected Goals": fc.nat({ max: 1 }),
              Wins: fc.nat({ max: 30 }),
              Losses: fc.nat({ max: 30 }),
              Draws: fc.nat({ max: 30 }),
            }),
            { minKeys: 1, maxKeys: 1 },
          ),
          { minKeys: 2 },
        );
      },
    ),
    fc.gen(),
  ])("updateEntitiesStatistics", async (testEntitiesStatistics, g) => {
    const statsGenerator = async () => {
      return {
        Goals: g(fc.nat, { max: 30 }),
        "Expected Goals": g(fc.nat, { max: 30 }),
        Wins: g(fc.nat, { max: 30 }),
        Losses: g(fc.nat, { max: 30 }),
        Draws: g(fc.nat, { max: 30 }),
      };
    };

    const testStatsToAddWithIDs: Record<string, StatisticsObject> =
      await flowAsync(mapValues(statsGenerator))(testEntitiesStatistics);

    const testSeason: string = getTestSeason(testEntitiesStatistics);

    const sumStats = flowAsync(Object.values, sum);
    const sumStatsObject = mapValuesIndexed(sumStats);

    const getTestSeasonStats = partial(getSeasonOfEntitiesStatistics, [
      testSeason,
    ]);

    const actualStats: Record<string, number> = await flowAsync(
      updateEntitiesStatistics,
      getTestSeasonStats,
      sumStatsObject,
    )(testSeason, [testEntitiesStatistics, testStatsToAddWithIDs]);

    const getExpectedStats = mapValuesIndexed(
      (statsBeforeUpdate: StatisticsObject, expectedKey: string): number => {
        const [addedStatsSum, beforeUpdateSum]: [number, number, number] = map(
          sumStats,
        )([statsBeforeUpdate, testStatsToAddWithIDs[expectedKey]]);
        return addedStatsSum + beforeUpdateSum;
      },
    );

    const expectedStats: Record<string, number> = await flowAsync(
      getTestSeasonStats,
      getExpectedStats,
    )(testEntitiesStatistics);

    expect(actualStats).toStrictEqual(expectedStats);
  });

  test.prop(
    [
      fakerToArb((faker) => faker.person.fullName()),
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.company.name()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.location.country()),
        fc.dictionary(
          fakerToArb((faker) => faker.company.name()),
          fc.dictionary(
            fakerToArb((faker) => faker.string.uuid()),
            fakerToArb((faker) => faker.company.name()),
            { minKeys: 4, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 1 },
  )("getEntity & getEntities", async (testSave, g) => {
    const testEntityID = g(fc.constantFrom, ...Object.keys(testSave.Entities));
    const actualEntity: Entity = await getEntity(testSave, testEntityID);
    console.log(actualEntity);
    expect(actualEntity.ID).toMatch(testEntityID);

    const testEntitiesIDs = g(fc.subarray, Object.keys(testSave.Entities), {
      minLength: 2,
    });
    const actualEntities: Array<Entity> = await getEntities(
      testSave,
      testEntitiesIDs,
    );
    const actualIDs: Array<string> = getIDs(actualEntities);
    expect(actualIDs).toStrictEqual(testEntitiesIDs);
  });

  test.prop(
    [
      fakerToArb((faker) => faker.person.fullName()),
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.company.name()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.location.country()),
        fc.dictionary(
          fakerToArb((faker) => faker.company.name()),
          fc.dictionary(
            fakerToArb((faker) => faker.string.uuid()),
            fakerToArb((faker) => faker.company.name()),
            { minKeys: 4, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "getEntityName & getEntityNames",
    async (
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      testCountriesLeaguesClubs,
      g,
    ) => {
      // const testSave: Save = await createSave(testSaveDetails);
      // const testEntityID = g(fc.constantFrom, ...Object.keys(testSave.Entities))
      // const actualEntityName: string = await getEntityName(testSave, testEntityID)
      // const expectedEntity: Entity = await getEntity(testSave, testEntityID)
      // expect(actualEntityName).toMatch(expectedEntity.Name)
      // const testEntitiesIDs = g(fc.subarray, Object.keys(testSave.Entities), {minLength: 2})
      // const actualEntitiesNames: Array<string> = await getEntitiesNames(testSave, testEntitiesIDs)
      // const expectedEntities: Array<Entity> = await getEntities(testSave, testEntitiesIDs)
      // const expectedEntitiesNames: Array<string> = getNames(expectedEntities)
      // assert.sameMembers(actualEntitiesNames, expectedEntitiesNames)
    },
  );

  test.prop(
    [
      fakerToArb((faker) => faker.person.fullName()),
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.company.name()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.location.country()),
        fc.dictionary(
          fakerToArb((faker) => faker.company.name()),
          fc.dictionary(
            fakerToArb((faker) => faker.string.uuid()),
            fakerToArb((faker) => faker.company.name()),
            { minKeys: 4, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 1 },
  )(
    "getEntityWithID & getEntitiesWithIDs",
    async (
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      testCountriesLeaguesClubs,
      g,
    ) => {
      // const testSave: Save = await createSave(testSaveDetails);
      // const testEntityID = g(fc.constantFrom, ...Object.keys(testSave.Entities))
      // const actualEntity: Record<string, Entity> = await getEntityWithID(testSave, testEntityID)
      // const expectedEntity: Entity = await getEntity(testSave, testEntityID)
      // expect(actualEntity[testEntityID]).toStrictEqual(expectedEntity)
      // const testEntitiesIDs = g(fc.subarray, Object.keys(testSave.Entities), {minLength: 2})
      // const actualEntities: Record<string, Entity> = await getEntitiesWithIDs(testSave, testEntitiesIDs)
      // const expectedEntities: Array<Entity> = await getEntities(testSave, testEntitiesIDs)
      // assert.sameMembers(Object.values(actualEntities), expectedEntities)
    },
  );
});
