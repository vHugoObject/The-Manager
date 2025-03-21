import "fake-indexeddb/auto";
import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { deleteDB, IDBPDatabase } from "idb";
import { flowAsync } from "futil-js";
import { Save, SaveID, SaveArguments } from "../SaveTypes";
import { BaseEntities } from "../../Common/CommonTypes";
import {
  convertBaseCountriesToBaseEntities,
  randomPlayerCompetitonAndClub,
  fakerToArb,
  convertToSet,
  convertArrayOfArraysToArrayOfSets,
} from "../../Common/index";
import { createSave } from "../SaveCreator";
import {
  openSaveDB,
  addSaveToDB,
  getSaveValue,
  deleteSave,
  getAllSaveValues,
  getAllSaveKeys,
  updateSaveValue,
} from "../SaveUtilities";
describe("SaveUtilities tests", async () => {
  const testDBName: string = "the-manager";
  const saveStore: string = "save-games";
  const testDBVersion: number = 1;

  test.prop([fc.gen()])("openSaveDB", async (g) => {
    const actualDB: IDBPDatabase = await openSaveDB();
    expect(actualDB.name).toBe(testDBName);
    expect(actualDB.version).toBe(testDBVersion);
    const actualStoreNames = new Set(actualDB.objectStoreNames);
    expect(actualStoreNames.has(saveStore)).toBeTruthy();
    actualDB.close();
    await deleteDB(testDBName);
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
        { minLength: 1, maxLength: 2 },
      );
    }),
    fc.gen(),
  ])(
    "addSaveToDB, getSaveValue then deleteSave",
    async (testPlayerName, testSeason, testCountriesLeaguesClubs, g) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );
      const [testPlayerMainCompetition, testPlayerClub]: [string, string] =
        randomPlayerCompetitonAndClub(g, testBaseEntities);

      const testSaveArguments: SaveArguments = {
        Name: testPlayerName,
        MainCompetition: testPlayerMainCompetition,
        Club: testPlayerClub,
        CurrentSeason: testSeason,
        BaseEntities: testBaseEntities,
      };

      const testSave: Save = await createSave(testSaveArguments);
      const actualSaveID: SaveID = await addSaveToDB(testSave);
      const actualValue: Save = await getSaveValue(actualSaveID);
      expect(actualValue).toStrictEqual(testSave);

      await deleteSave(actualSaveID);
      const db: IDBPDatabase = await openSaveDB();
      const saveKeys: Set<string> = await flowAsync(
        db.getAllKeys,
        convertToSet,
      )(saveStore);
      expect(saveKeys.has(actualSaveID)).toBeFalsy();

      await deleteDB(testDBName);
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
          { minLength: 1, maxLength: 2 },
        );
      }),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
    "updateSaveValue",
    async (testPlayerName, testSeason, testCountriesLeaguesClubs, g) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );
      const [testPlayerMainCompetition, testPlayerClub]: [string, string] =
        randomPlayerCompetitonAndClub(g, testBaseEntities);

      const testSaveArguments: SaveArguments = {
        Name: testPlayerName,
        MainCompetition: testPlayerMainCompetition,
        Club: testPlayerClub,
        CurrentSeason: testSeason,
        BaseEntities: testBaseEntities,
      };

      const testSave: Save = await createSave(testSaveArguments);

      const saveID: SaveID = await addSaveToDB(testSave);
      let expectedSaveValue: Save = await getSaveValue(saveID);
      await updateSaveValue(expectedSaveValue);
      let actualValue: Save = await getSaveValue(saveID);
      expect(testSave).toStrictEqual(actualValue);

      expectedSaveValue.Name = "Bald Fraud";
      await updateSaveValue(expectedSaveValue);
      actualValue = await getSaveValue(saveID);
      expect(expectedSaveValue).toStrictEqual(actualValue);
      await deleteDB(testDBName);
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
          { minLength: 1, maxLength: 2 },
        );
      }),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
    "getAllSaveValues",
    async (testPlayerName, testSeason, testCountriesLeaguesClubs, g) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );
      const [testPlayerMainCompetition, testPlayerClub]: [string, string] =
        randomPlayerCompetitonAndClub(g, testBaseEntities);

      const testSaveArguments: SaveArguments = {
        Name: testPlayerName,
        MainCompetition: testPlayerMainCompetition,
        Club: testPlayerClub,
        CurrentSeason: testSeason,
        BaseEntities: testBaseEntities,
      };

      const testSave: Save = await createSave(testSaveArguments);

      await addSaveToDB(testSave);
      await addSaveToDB(testSave);
      const actualSaves: Array<Save> = await getAllSaveValues();
      const [actualSavesSet, expectedSavesSet] =
        convertArrayOfArraysToArrayOfSets([actualSaves, [testSave, testSave]]);

      expect(actualSavesSet).toStrictEqual(expectedSavesSet);

      await deleteDB(testDBName);
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
          { minLength: 1, maxLength: 2 },
        );
      }),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
    "getAllSaveKeys",
    async (testPlayerName, testSeason, testCountriesLeaguesClubs, g) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );
      const [testPlayerMainCompetition, testPlayerClub]: [string, string] =
        randomPlayerCompetitonAndClub(g, testBaseEntities);

      const testSaveArguments: SaveArguments = {
        Name: testPlayerName,
        MainCompetition: testPlayerMainCompetition,
        Club: testPlayerClub,
        CurrentSeason: testSeason,
        BaseEntities: testBaseEntities,
      };

      const testSave: Save = await createSave(testSaveArguments);

      const expectedKeyOne: SaveID = await addSaveToDB(testSave);
      const expectedKeyTwo: SaveID = await addSaveToDB(testSave);
      const expectedSaveIDs: Array<SaveID> = [expectedKeyOne, expectedKeyTwo];
      const actualSaveIDs: Array<SaveID> = await getAllSaveKeys();

      expect(actualSaveIDs).toStrictEqual(expectedSaveIDs);
      const [actualSaveIDsSet, expectedSaveIDsSet] =
        convertArrayOfArraysToArrayOfSets([actualSaveIDs, expectedSaveIDs]);

      expect(actualSaveIDsSet).toStrictEqual(expectedSaveIDsSet);
      await deleteDB(testDBName);
    },
  );
});
