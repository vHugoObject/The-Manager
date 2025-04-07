import "fake-indexeddb/auto";
import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { deleteDB, IDBPDatabase } from "idb";
import { map } from "lodash/fp";
import { updatePaths, flowAsync } from "futil-js";
import { Save, SaveID } from "../SaveTypes";
import { BaseEntities } from "../../Common/CommonTypes";
import { DBNAME, SAVESTORE, DBVERSION } from "../SaveConstants";
import {
  createTestSave,
  convertBaseCountriesToBaseEntities,
  randomPlayerCompetitonAndClub,
  fakerToArb,
  convertArrayOfArraysToArrayOfSets,
  addOne,
} from "../../Common/index";
import {
  openSaveDB,
  addSaveToDB,
  getSave,
  deleteSave,
  getAllSaves,
  getAllSaveKeys,
  updateSave,
} from "../SaveUtilities";
describe("SaveUtilities tests", async () => {
  test.prop([fc.gen()])("openSaveDB", async (g) => {
    const actualDB: IDBPDatabase = await openSaveDB();
    expect(actualDB.name).toBe(DBNAME);
    expect(actualDB.version).toBe(DBVERSION);
    const actualStoreNames = new Set(actualDB.objectStoreNames);
    expect(actualStoreNames.has(SAVESTORE)).toBeTruthy();
    actualDB.close();
    await deleteDB(DBNAME);
  });

  test.prop([
    fc.string(),
    fc.integer({ min: 2000, max: 2100 }),
    fc.constantFrom(1, 2).chain((testCompetitionsCount: number) => {
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
        { minLength: 1, maxLength: 1 },
      );
    }),
    fc.gen(),
  ])(
    "addSaveToDB, getSaveValue, deleteSave and getKeys",
    async (testPlayerName, testSeason, testCountriesLeaguesClubs, fcGen) => {
      const testSave: Save = await createTestSave(fcGen, [
        testPlayerName,
        testSeason,
        testCountriesLeaguesClubs,
      ]);
      const actualSaveID: SaveID = await addSaveToDB(testSave);
      const actualValue: Save = await getSave(actualSaveID);
      expect(actualValue).toStrictEqual(testSave);

      await deleteSave(actualSaveID);
      const saveKeys: Array<IDBValidKey> = await getAllSaveKeys();
      const saveKeysSet: Set<IDBValidKey> = new Set(saveKeys);
      expect(saveKeysSet.has(actualSaveID)).toBeFalsy();

      await deleteDB(DBNAME);
    },
  );

  test.prop(
    [
      fc.string(),
      fc.integer({ min: 2000, max: 2100 }),
      fc.constantFrom(1, 2).chain((testCompetitionsCount: number) => {
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
          { minLength: 1, maxLength: 1 },
        );
      }),
      fc.gen(),
    ],
    { numRuns: 75 },
  )(
    "updateSaveValue",
    async (testPlayerName, testSeason, testCountriesLeaguesClubs, fcGen) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );
      const testSave: Save = await createTestSave(fcGen, [
        testPlayerName,
        testSeason,
        testCountriesLeaguesClubs,
      ]);

      const [testNewPlayerMainCompetition, testNewPlayerClub]: [
        string,
        string,
      ] = randomPlayerCompetitonAndClub(fcGen, testBaseEntities);

      const saveID: SaveID = await addSaveToDB(testSave);
      const testTransformers: Record<string, Function> = {
        MainCompetition: () => testNewPlayerMainCompetition,
        Club: () => testNewPlayerClub,
        CurrentSeason: addOne,
      };
      const expectedUpdatedSave: Save = updatePaths(testTransformers, testSave);

      await updateSave(expectedUpdatedSave);
      const actualUpdatedSave = await getSave(saveID);

      expect(actualUpdatedSave).toStrictEqual(expectedUpdatedSave);
      await deleteDB(DBNAME);
    },
  );

  test.prop(
    [
      fc.array(
        fc.tuple(
          fc.string(),
          fc.integer({ min: 2000, max: 2100 }),
          fc.constantFrom(1, 2).chain((testCompetitionsCount: number) => {
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
              { minLength: 1, maxLength: 1 },
            );
          }),
        ),
        { minLength: 2, maxLength: 2 },
      ),
      fc.gen(),
    ],
    { numRuns: 50 },
  )(
    "getAllSaveValues",
    async (testNameSeasonTuplesAndCountriesLeaguesClubs, g) => {
      const [testSaveOne, testSaveTwo] = await flowAsync(
        map(createTestSave(g)),
      )(testNameSeasonTuplesAndCountriesLeaguesClubs);

      await addSaveToDB(testSaveOne);
      await addSaveToDB(testSaveTwo);
      const actualSaves: Array<Save> = await getAllSaves();
      const [actualSavesSet, expectedSavesSet] =
        convertArrayOfArraysToArrayOfSets([
          actualSaves,
          [testSaveOne, testSaveTwo],
        ]);

      expect(actualSavesSet).toStrictEqual(expectedSavesSet);

      await deleteDB(DBNAME);
    },
  );
});
