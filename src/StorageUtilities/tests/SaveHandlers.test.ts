import {
  Manager as TournamentManager,
  Player as TournamentPlayer,
  Match as TournamentMatch,
  Tournament,
} from "tournament-organizer/components";
import {
  TournamentValues,
  StandingsValues,
} from "tournament-organizer/interfaces";
import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { faker } from "@faker-js/faker";
import {
  flatMap,
  flattenDeep,
  zip,
  concat,
  map,
  toPairs,
  pick,
  partial,
  sum,
} from "lodash/fp";
import { range } from "lodash";
import { updateAllPaths, flowAsync, flowMap, mapValuesIndexed } from "futil-js";
import {
  Entity,
  StatisticsObject,
  StatisticsType,
  MatchEntry,
  SaveArguments,
} from "../../Common/CommonTypes";
import { Save } from "../../StorageUtilities/SaveTypes";
import { BaseCountries } from "../../Countries/CountryTypes";
import { Player } from "../../Players/PlayerTypes";
import { createSave } from "../../StorageUtilities/SaveCreator";
import { fakerToArb } from "../../Common/testingUtilities";
import {
  createGoalkeeper,
  createGoalkeepers,
  createDefenders,
  createMidfielders,
  createAttackers,
} from "../../Players/PlayerUtilities";
import {
  entitiesStatisticsCreator,
  entityObjectsCreator,
} from "../../Common/entityUtilities";
import { serializeCompetitionStates } from "../../Common/scheduleManagementUtilities";
import {
  makeEntityAddable,
  makeEntitiesAddable,
  addValuesToSave,
  addEntitiesToSave,
  addEntitiesWithStatisticsToSave,
  updateSaveEntitiesStatistics,
  updateSaveCompetitionStates,
  getCompetitionState,
} from "../SaveHandlers";

describe("SaveHandlers test suite", async () => {
  const testStartingSeason: string = "2024";
  const testMatchDate: Date = new Date("August 18, 2024");

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
    const randomIndex = g(fc.nat, { max: clubs.length - 1 });
    const [clubID, clubName] = clubs[randomIndex];
    return { clubID, clubName };
  };

  test.prop([
    fc.record({
      ID: fakerToArb((faker) => faker.string.uuid()),
      Name: fakerToArb((faker) => faker.person.fullName()),
      Date: fc.date(),
      Score: fc.dictionary(
        fakerToArb((faker) => faker.string.uuid()),
        fc.nat({ max: 5 }),
        { minKeys: 2, maxKeys: 2 },
      ),
      CompetitionID: fakerToArb((faker) => faker.string.uuid()),
      Home: fakerToArb((faker) => faker.string.uuid()),
      Away: fakerToArb((faker) => faker.string.uuid()),
    }),
    fc.array(fc.nat({ max: 20 }), { minLength: 4, maxLength: 4 }),
  ])(
    "makeEntityAddable should return an object with the ID as the key and value as the original entity",
    async (testMatchLog) => {
      const actualAddableMatchLog: Record<
        string,
        Record<string, Function>
      > = await makeEntityAddable(testMatchLog);

      const testPlayer: Player = await createGoalkeeper(testStartingSeason, "");
      const actualAddablePlayer = await makeEntityAddable(testPlayer);

      const entityTuples: Array<
        [Entity, Record<string, Record<string, Function>>]
      > = [
        [testPlayer, actualAddablePlayer],
        [testMatchLog, actualAddableMatchLog],
      ];
      entityTuples.forEach(
        ([actualEntity, convertedEntity]: [
          Entity,
          Record<string, Record<string, Function>>,
        ]) => {
          Object.values(convertedEntity).forEach(
            (actualAddableEntityObject: Record<string, Function>) => {
              Object.entries(actualAddableEntityObject).forEach(
                ([actualKey, actualFunction]: [string, Function]) =>
                  expect(actualFunction()).toBe(actualEntity[actualKey]),
              );
            },
          );
        },
      );
    },
  );

  test.prop([
    fc.array(
      fc.record({
        ID: fakerToArb((faker) => faker.string.uuid()),
        Name: fakerToArb((faker) => faker.person.fullName()),
        Date: fc.date(),
        Score: fc.dictionary(
          fakerToArb((faker) => faker.string.uuid()),
          fc.integer({ min: 0, max: 5 }),
          { minKeys: 2, maxKeys: 2 },
        ),
        CompetitionID: fakerToArb((faker) => faker.string.uuid()),
        Home: fakerToArb((faker) => faker.string.uuid()),
        Away: fakerToArb((faker) => faker.string.uuid()),
      }),
      { minLength: 1 },
    ),
    fc.array(fc.integer({ min: 1, max: 20 }), { minLength: 4, maxLength: 4 }),
  ])(
    "makeEntitiesAddable should return an object with the ID as the key and value as the original entity",
    async (testMatchLogs) => {
      const testPlayer: Player = await createGoalkeeper(testStartingSeason, "");
      const testEntities: Array<Entity> = concat(testMatchLogs, [testPlayer]);
      const actualAddableEntities: Record<
        string,
        Record<string, Function>
      > = await makeEntitiesAddable(testEntities);
      Object.entries(actualAddableEntities).forEach(
        ([actualAddableEntityKey]: [string, Record<string, Function>]) => {
          expect(actualAddableEntities[actualAddableEntityKey]).toBeDefined();
        },
      );
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
            { minKeys: 3, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.array(
        fc.record({
          ID: fakerToArb((faker) => faker.string.uuid()),
          Name: fakerToArb((faker) => faker.person.fullName()),
          Date: fc.date(),
          Score: fc.dictionary(
            fakerToArb((faker) => faker.string.uuid()),
            fc.nat({ max: 5 }),
            { minKeys: 2, maxKeys: 2 },
          ),
          CompetitionID: fakerToArb((faker) => faker.string.uuid()),
          Home: fakerToArb((faker) => faker.string.uuid()),
          Away: fakerToArb((faker) => faker.string.uuid()),
        }),
        { minLength: 1 },
      ),
      fc.array(fc.nat({ max: 20 }), { minLength: 4, maxLength: 4 }),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "addValuesToSave should work with any save key",
    async (
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      testCountriesLeaguesClubs,
      testMatchLogs,
      testPositionCounts,
      g,
    ) => {
      const testPlayerClub = await randomPlayerClub(
        testCountriesLeaguesClubs,
        g,
      );

      const testSaveDetails: SaveArguments = {
        Name: testPlayerName,
        Country: testPlayerCountry,
        MainCompetition: testPlayerCompetitionName,
        startingSeason: testStartingSeason,
        Club: testPlayerClub,
        countriesLeaguesClubs: testCountriesLeaguesClubs,
      };

      let testSave: Save = await createSave(testSaveDetails);

      const funcs: Array<Function> = [
        createGoalkeepers,
        createDefenders,
        createMidfielders,
        createAttackers,
      ];
      const funcsWithCounts: Array<[Function, number]> = zip(
        funcs,
        testPositionCounts,
      );

      const testPlayers: Array<Player> = await flowAsync(
        flowMap(async ([func, count]) => await func(count, [testSeason, ""])),
      )(funcsWithCounts);

      const testEntities: Array<Entity> = flattenDeep([
        testMatchLogs,
        testPlayers,
      ]);
      const setOfTestEntitiesIDs: Set<string> = new Set(
        testEntities.map((testEntity: Entity) => testEntity.ID),
      );

      const addable = await makeEntitiesAddable(testEntities);

      const saveKeysFunctions = (currentEntities: Record<string, Entity>) =>
        updateAllPaths(addable, currentEntities);
      const actualUpdatedSave: Save = await addValuesToSave(testSave, {
        Entities: saveKeysFunctions,
      });

      const setOfActualUpdatedSaveEntityIDs: Set<string> = new Set(
        Object.keys(actualUpdatedSave.Entities),
      );

      expect(
        setOfActualUpdatedSaveEntityIDs.isSupersetOf(setOfTestEntitiesIDs),
      ).toBeTruthy();
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
            { minKeys: 3, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.array(
        fc.record({
          ID: fakerToArb((faker) => faker.string.uuid()),
          Name: fakerToArb((faker) => faker.person.fullName()),
          Date: fc.date(),
          Score: fc.dictionary(
            fakerToArb((faker) => faker.string.uuid()),
            fc.nat({ max: 5 }),
            { minKeys: 2, maxKeys: 2 },
          ),
          CompetitionID: fakerToArb((faker) => faker.string.uuid()),
          Home: fakerToArb((faker) => faker.string.uuid()),
          Away: fakerToArb((faker) => faker.string.uuid()),
        }),
        { minLength: 1 },
      ),
      fc.array(fc.nat({ max: 20 }), { minLength: 4, maxLength: 4 }),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "addEntitiesToSave should add entities to Entities key of a save",
    async (
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      testCountriesLeaguesClubs,
      testMatchLogs,
      testPositionCounts,
      g,
    ) => {
      const testPlayerClub = await randomPlayerClub(
        testCountriesLeaguesClubs,
        g,
      );

      const testSaveDetails: SaveArguments = {
        Name: testPlayerName,
        Country: testPlayerCountry,
        MainCompetition: testPlayerCompetitionName,
        startingSeason: testStartingSeason,
        Club: testPlayerClub,
        countriesLeaguesClubs: testCountriesLeaguesClubs,
      };

      let testSave: Save = await createSave(testSaveDetails);

      const funcs: Array<Function> = [
        createGoalkeepers,
        createDefenders,
        createMidfielders,
        createAttackers,
      ];
      const funcsWithCounts: Array<[Function, number]> = zip(
        funcs,
        testPositionCounts,
      );

      const testPlayers: Array<Player> = await flowAsync(
        flowMap(async ([func, count]) => await func(count, [testSeason, ""])),
      )(funcsWithCounts);

      const testEntities: Array<Entity> = flattenDeep([
        testMatchLogs,
        testPlayers,
      ]);
      const setOfTestEntitiesIDs: Set<string> = new Set(
        testEntities.map((testEntity: Entity) => testEntity.ID),
      );

      const actualUpdatedSave: Save = await addEntitiesToSave(
        testSave,
        testEntities,
      );

      const setOfActualUpdatedSaveEntityIDs: Set<string> = new Set(
        Object.keys(actualUpdatedSave.Entities),
      );

      expect(
        setOfActualUpdatedSaveEntityIDs.isSupersetOf(setOfTestEntitiesIDs),
      ).toBeTruthy();
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
            { minKeys: 3, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.array(
        fc.record({
          ID: fakerToArb((faker) => faker.string.uuid()),
          Name: fakerToArb((faker) => faker.person.fullName()),
          Date: fc.date(),
          Score: fc.dictionary(
            fakerToArb((faker) => faker.string.uuid()),
            fc.nat({ max: 5 }),
            { minKeys: 2, maxKeys: 2 },
          ),
          CompetitionID: fakerToArb((faker) => faker.string.uuid()),
          Home: fakerToArb((faker) => faker.string.uuid()),
          Away: fakerToArb((faker) => faker.string.uuid()),
        }),
        { minLength: 1 },
      ),
      fc.array(fc.nat({ max: 20 }), { minLength: 4, maxLength: 4 }),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "addEntitiesWithStatisticsToSave should add entities to Entities key and their corresponding statistics to the EntitiesStatistics key of a save",
    async (
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      testCountriesLeaguesClubs,
      testMatchLogs,
      testPositionCounts,
      g,
    ) => {
      const testPlayerClub = await randomPlayerClub(
        testCountriesLeaguesClubs,
        g,
      );

      const testSaveDetails: SaveArguments = {
        Name: testPlayerName,
        Country: testPlayerCountry,
        MainCompetition: testPlayerCompetitionName,
        startingSeason: testStartingSeason,
        Club: testPlayerClub,
        countriesLeaguesClubs: testCountriesLeaguesClubs,
      };

      let testSave: Save = await createSave(testSaveDetails);

      const funcs: Array<Function> = [
        createGoalkeepers,
        createDefenders,
        createMidfielders,
        createAttackers,
      ];
      const funcsWithCounts: Array<[Function, number]> = zip(
        funcs,
        testPositionCounts,
      );

      const testPlayers: Array<Player> = await flowAsync(
        flowMap(async ([func, count]) => await func(count, [testSeason, ""])),
      )(funcsWithCounts);

      const testEntities: Record<string, Entity> = await flowAsync(
        flattenDeep,
        entityObjectsCreator,
      )([testMatchLogs, testPlayers]);
      const testStatistics: Record<string, StatisticsType> =
        await entitiesStatisticsCreator(testSeason, Object.keys(testEntities));
      const setOfTestEntitiesIDs: Set<string> = new Set(
        Object.keys(testEntities),
      );

      const actualUpdatedSave: Save = await addEntitiesWithStatisticsToSave(
        testSave,
        [testEntities, testStatistics],
      );

      const setOfActualUpdatedSaveEntitiesIDs: Set<string> = new Set(
        Object.keys(actualUpdatedSave.Entities),
      );
      const setOfActualUpdatedSaveEntitiesStatisticsIDs: Set<string> = new Set(
        Object.keys(actualUpdatedSave.EntitiesStatistics),
      );
      const setsOfActualIDs: Array<Set<string>> = [
        setOfActualUpdatedSaveEntitiesIDs,
        setOfActualUpdatedSaveEntitiesStatisticsIDs,
      ];

      setsOfActualIDs.forEach((setOfActualIDs: Set<string>) =>
        expect(setOfActualIDs.isSupersetOf(setOfTestEntitiesIDs)).toBeTruthy(),
      );
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
            { minKeys: 3, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "updateSaveEntitiesStatistics should update a statistics object with newStats",
    async (
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      testCountriesLeaguesClubs,
      g,
    ) => {
      const testPlayerClub = await randomPlayerClub(
        testCountriesLeaguesClubs,
        g,
      );

      const testSaveDetails: SaveArguments = {
        Name: testPlayerName,
        Country: testPlayerCountry,
        MainCompetition: testPlayerCompetitionName,
        startingSeason: testStartingSeason,
        Club: testPlayerClub,
        countriesLeaguesClubs: testCountriesLeaguesClubs,
      };

      let testSave: Save = await createSave(testSaveDetails);

      const testEntityKeys: Array<string> = Object.keys(testSave.Entities);
      const testEntityKeysCount: number = testEntityKeys.length;

      const testYear: string = testSave.CurrentDate.getFullYear().toString();

      const testIndicesOfKeysToUpdate: Array<number> = await Promise.all(
        range(0, g(fc.integer, { min: 1, max: testEntityKeysCount })).map(
          async () => g(fc.integer, { min: 1, max: testEntityKeysCount }),
        ),
      );
      const testStatsToAddWithIDs: Record<string, StatisticsObject> =
        await flowAsync(
          map(async (index: number) => [
            testEntityKeys[index],
            {
              Goals: g(fc.nat, { max: 30 }),
              "Expected Goals": g(fc.nat, { max: 30 }),
              Wins: g(fc.nat, { max: 30 }),
              Losses: g(fc.nat, { max: 30 }),
              Draws: g(fc.nat, { max: 30 }),
            },
          ]),
          Object.fromEntries,
        )(testIndicesOfKeysToUpdate);

      const expectedUpdatedEntitiesKeys: Array<string> = Object.keys(
        testStatsToAddWithIDs,
      );

      const actualUpdatedSave: Save = await updateSaveEntitiesStatistics(
        testSave,
        [testYear, testStatsToAddWithIDs],
      );

      const getSpecificEntitiesStatsForSpecificSeason = async (
        entityKeys: Array<string>,
        season: string,
        entitiesStatistics: Record<string, StatisticsType>,
      ): Promise<Record<string, StatisticsObject>> => {
        return await flowAsync(
          pick(entityKeys),
          mapValuesIndexed(
            (stats: StatisticsType): StatisticsObject => stats[season],
          ),
        )(entitiesStatistics);
      };

      const [entitiesStatisticsBeforeUpdate, actualUpdatedEntitiesStatistics]: [
        Record<string, StatisticsObject>,
        Record<string, StatisticsObject>,
      ] = await flowAsync(
        map(
          partial(getSpecificEntitiesStatsForSpecificSeason, [
            expectedUpdatedEntitiesKeys,
            testStartingSeason,
          ]),
        ),
      )([testSave.EntitiesStatistics, actualUpdatedSave.EntitiesStatistics]);

      const sumStats = flowAsync(Object.values, sum);
      const sumAllActualStats = mapValuesIndexed(sumStats);

      const getExpectedStats = mapValuesIndexed(
        (statsBeforeUpdate: StatisticsObject, expectedKey: string): number => {
          const [addedStatsSum, beforeUpdateSum]: [number, number, number] =
            map(sumStats)([
              statsBeforeUpdate,
              testStatsToAddWithIDs[expectedKey],
            ]);
          return addedStatsSum + beforeUpdateSum;
        },
      );
      const actualStats = sumAllActualStats(actualUpdatedEntitiesStatistics);
      const expectedStats = getExpectedStats(entitiesStatisticsBeforeUpdate);
      expect(actualStats).toStrictEqual(expectedStats);
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
            { minKeys: 3, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "updateSaveCompetitionStates should update a set of competitionStates",
    async (
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      testCountriesLeaguesClubs,
      g,
    ) => {
      const testPlayerClub = await randomPlayerClub(
        testCountriesLeaguesClubs,
        g,
      );

      const testSaveDetails: SaveArguments = {
        Name: testPlayerName,
        Country: testPlayerCountry,
        MainCompetition: testPlayerCompetitionName,
        startingSeason: testStartingSeason,
        Club: testPlayerClub,
        countriesLeaguesClubs: testCountriesLeaguesClubs,
      };

      let testSave: Save = await createSave(testSaveDetails);
      const testScheduler: TournamentManager =
        testSave.scheduleManager as TournamentManager;
      const testCompetitions: Array<Tournament> = testScheduler.tournaments;
      const expectedCompetitionStates: Record<
        string,
        [TournamentValues, StandingsValues[]]
      > = await serializeCompetitionStates(testCompetitions);
      const updatedSave: Save = await updateSaveCompetitionStates(
        testSave,
        expectedCompetitionStates,
      );

      const assertCompetitionState = async ([
        expectedKey,
        expectedCompetitionState,
      ]: [string, [TournamentValues, StandingsValues[]]]) => {
        expect(updatedSave.Entities[expectedKey].CurrentState).toStrictEqual(
          expectedCompetitionState,
        );
      };
      await flowAsync(
        Object.entries,
        flowAsync(map(assertCompetitionState)),
      )(expectedCompetitionStates);
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
            { minKeys: 3, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "getCompetitionState",
    async (
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      testCountriesLeaguesClubs,
      g,
    ) => {
      const testPlayerClub = await randomPlayerClub(
        testCountriesLeaguesClubs,
        g,
      );

      const testSaveDetails: SaveArguments = {
        Name: testPlayerName,
        Country: testPlayerCountry,
        MainCompetition: testPlayerCompetitionName,
        startingSeason: testStartingSeason,
        Club: testPlayerClub,
        countriesLeaguesClubs: testCountriesLeaguesClubs,
      };

      let testSave: Save = await createSave(testSaveDetails);

      const testScheduler: TournamentManager =
        testSave.scheduleManager as TournamentManager;
      const testCompetitionStates: Array<Tournament> =
        testScheduler.tournaments;
      const expectedCompetitionStates: Record<
        string,
        [TournamentValues, StandingsValues[]]
      > = await serializeCompetitionStates(testCompetitionStates);
      const testSaveWithCompetitionStates: Save =
        await updateSaveCompetitionStates(testSave, testCompetitionStates);
      const testCompetitionKeys: Array<string> = Object.keys(
        expectedCompetitionStates,
      );
      const testRandomCompetitionKeyIndex = g(fc.nat, {
        max: testCompetitionKeys.length - 1,
      });

      const testRandomKey: string =
        testCompetitionKeys[testRandomCompetitionKeyIndex];
      const actualState: [TournamentValues, StandingsValues[]] =
        await getCompetitionState(testSaveWithCompetitionStates, testRandomKey);
      const expectedState: [TournamentValues, StandingsValues[]] =
        testSaveWithCompetitionStates.Entities[testRandomKey].CurrentState;
      expect(actualState).toBe(expectedState);
    },
  );
});
