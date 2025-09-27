import { test, fc } from "@fast-check/vitest";
import { describe, assert, expect } from "vitest";
import { deleteDB, IDBPDatabase } from "idb";
import { property, pipe, map, over } from "lodash/fp";
import { toUndefined, Option } from "fp-ts/Option";
import { compact } from "fp-ts/ReadonlyArray"
import { SaveSchema, SaveOptions } from "../Types";
import {
  assertIsClubObject,
  assertIsPlayerObject,
  assertIsSaveOptions,
  convertArraysToSetsAndAssertStrictEqual,
} from "../Asserters";
import {
  fastCheckCreateTestSaveOptionsWithRandomCountries,
  fastCheckRandomItemFromArray,
  fastCheckCreateTestSaveArguments
} from "../TestDataGenerators";
import { zipApply, unfold } from "../Transformers";
import {
  createNewDBForSave,
  createSave,
  getSaveOptionsOfAllSaves,
  getSaveOptionsForSave,
  indexedDBCleanup
} from "../Save";


describe("SaveUtilities tests", async () => {

  test("createNewDBForSave", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.gen(),
        async (fcGen) => {
	  
	  const [testSaveArguments] = fastCheckCreateTestSaveArguments(fcGen)
	  const {Clubs: testClubs, Players: testPlayers} = testSaveArguments
          const [expectedRandomClubKey, expectedRandomPlayerKey] = pipe([
            map(fastCheckRandomItemFromArray(fcGen)),
            zipApply([property(["ClubNumber"]), property(["PlayerNumber"])]),
          ])([testClubs, testPlayers]);

	  
          const actualDB = await createNewDBForSave(testSaveArguments);          
	  
          const actualRandomClub = await actualDB.get(
            "Clubs",
            expectedRandomClubKey,
          );
          assertIsClubObject(actualRandomClub);
          const actualRandomPlayer = await actualDB.get(
            "Players",
            expectedRandomPlayerKey,
          );
          assertIsPlayerObject(actualRandomPlayer);

          actualDB.close();


	  await indexedDBCleanup()
        },
      ),
      	{numRuns: 1}
    );
  });

  test("createSave", async () => {
    await fc.assert(
      fc.asyncProperty(fc.gen(), async (fcGen) => {
        const testSaveOptions: SaveOptions =
          fastCheckCreateTestSaveOptionsWithRandomCountries(fcGen);

        const actualSave: IDBPDatabase<SaveSchema> =
          await createSave(testSaveOptions);
        const expectedSaveObjectStores: Array<string> = [
          "SaveOptions",
          "Clubs",
          "Players",
          "Matches",
        ];
        const actualSaveObjectStores = actualSave.objectStoreNames;

        convertArraysToSetsAndAssertStrictEqual([
          actualSaveObjectStores,
          expectedSaveObjectStores,
        ]);

        actualSave.close();
	await indexedDBCleanup()

      }),
      { numRuns: 1 },
    );
  });

  test("getSaveOptionsForSave", async () => {
    await fc.assert(
      fc
        .asyncProperty(
          fc.gen(),
          async (fcGen) => {

	    const [testSaveArguments] = fastCheckCreateTestSaveArguments(fcGen)
            const testDB = await createNewDBForSave(testSaveArguments);
	    const [expectedDBName, expectedVersion] = over([property("name"), property("version")])(testDB)


	    const actualSaveOptions = await getSaveOptionsForSave([expectedDBName, expectedVersion])
	    assertIsSaveOptions(toUndefined(actualSaveOptions))
	    
	    await indexedDBCleanup()
          },
        ),
      { numRuns: 1 },
    );
  });

  test("getSaveOptionsOfAllSaves", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.gen(),
        async (fcGen) => {

	  const initialDBs = await indexedDB.databases()
	  
          const [testSaveArguments] = fastCheckCreateTestSaveArguments(fcGen)
	  await createNewDBForSave(testSaveArguments)

          const actualSaveOptions = await getSaveOptionsOfAllSaves();

	  expect(actualSaveOptions.length-initialDBs.length).toEqual(1)
          const [actualRandomSaveName, actualRandomSaveOption]: [
            string,
            Option<SaveOptions>,
          ] = pipe([fastCheckRandomItemFromArray(fcGen), toUndefined])(actualSaveOptions);

          assert.isNumber(parseInt(actualRandomSaveName));
          assertIsSaveOptions(actualRandomSaveOption);

          await indexedDBCleanup()
        },
      ),
      { numRuns: 1 },
    );
  });
});
