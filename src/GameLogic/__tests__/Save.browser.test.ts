import { test, fc } from "@fast-check/vitest";
import { describe, assert, expect } from "vitest";
import { IDBPDatabase, openDB, deleteDB } from "idb";
import { property, pipe, map, over, head } from "lodash/fp";
import { toUndefined, Option } from "fp-ts/Option";
import { SaveSchema, SaveOptions } from "../Types";
import {
  PLAYERINDEXES,
  CLUBINDEXES,
  DOMESTICLEAGUEINDEXES,
  MATCHLOGINDEXES,
  DBVERSION,
} from "../SaveConstants";
import {
  assertIsClubObject,
  assertIsPlayerObject,
  assertIsSaveOptions,
  assertIsDomesticLeagueObject,
  convertArraysToSetsAndAssertStrictEqual,
  convertArraysToSetsAndAssertSubset,
  assertSetHas,
} from "../Asserters";
import {
  fastCheckCreateTestSaveOptionsWithRandomCountries,
  fastCheckRandomItemFromArray,
  fastCheckCreateTestSaveArguments,
} from "../TestDataGenerators";
import { zipApply } from "../Transformers";
import {
  createNewDBForSave,
  createSave,
  getDBObjectStoreNames,
  getSaveOptionsOfAllSaves,
  getSaveOptionsForSave,
  indexedDBCleanup,
  getDBObjectStoreIndexNamesAsSet,
} from "../Save";

describe("SaveUtilities tests", async () => {
  test("createNewDBForSave", async () => {
    await fc.assert(
      fc.asyncProperty(fc.gen(), async (fcGen) => {
        const [testSaveArguments] = fastCheckCreateTestSaveArguments(fcGen);
        const {
          DomesticLeagues: testDomesticLeagues,
          Clubs: testClubs,
          Players: testPlayers,
        } = testSaveArguments;

        const [
          expectedRandomDomesticLeagueKey,
          expectedRandomClubKey,
          expectedRandomPlayerKey,
        ] = pipe([
          map(fastCheckRandomItemFromArray(fcGen)),
          zipApply([
            property(["LeagueNumber"]),
            property(["ClubNumber"]),
            property(["PlayerNumber"]),
          ]),
        ])([testDomesticLeagues, testClubs, testPlayers]);

        const actualDB = await createNewDBForSave(testSaveArguments);

        const testPlayerTransaction = actualDB.transaction("Players");
        const actualPlayerIndexes = getDBObjectStoreIndexNamesAsSet(
          testPlayerTransaction,
        );

        const expectedPlayerIndex = pipe([fastCheckRandomItemFromArray, head])(
          fcGen,
          PLAYERINDEXES,
        );

        assertSetHas(actualPlayerIndexes, expectedPlayerIndex);

        // const testClubTransaction = actualDB.transaction("Clubs");
        // const actualClubIndexes =
        //       getDBObjectStoreIndexNames(testClubTransaction);
        // const expectedClubIndexesSubset = pipe([fastCheckRandomItemFromArray, tail])(fcGen, CLUBINDEXES)
        // convertArraysToSetsAndAssertSubset([actualClubIndexes, expectedClubIndexesSubset])

        // const testDomesticLeagueTransaction =
        //   actualDB.transaction("DomesticLeagues");
        // const actualDomesticLeagueIndexes = getDBObjectStoreIndexNames(
        //   testDomesticLeagueTransaction,
        // );
        // const expectedDomesticLeagueIndexesSubset = pipe([fastCheckRandomItemFromArray, tail])(fcGen, DOMESTICLEAGUEINDEXES)
        // convertArraysToSetsAndAssertSubset([actualDomesticLeagueIndexes, expectedDomesticLeagueIndexesSubset])

        // const testMatchLogTransaction = actualDB.transaction("MatchLogs");
        // const actualMatchLogIndexes = getDBObjectStoreIndexNames(
        //   testMatchLogTransaction,
        // );
        // const expectedMatchLogIndexesSubset = pipe([fastCheckRandomItemFromArray, tail])(fcGen, MATCHLOGINDEXES)
        // convertArraysToSetsAndAssertSubset([actualMatchLogIndexes, expectedMatchLogIndexesSubset])

        // const actualRandomDomesticLeague = await actualDB.get(
        //   "DomesticLeagues",
        //   expectedRandomDomesticLeagueKey,
        // );
        // assertIsDomesticLeagueObject(actualRandomDomesticLeague);

        // const actualRandomClub = await actualDB.get(
        //   "Clubs",
        //   expectedRandomClubKey,
        // );
        // assertIsClubObject(actualRandomClub);

        // const actualRandomPlayer = await actualDB.get(
        //   "Players",
        //   expectedRandomPlayerKey,
        // );
        // assertIsPlayerObject(actualRandomPlayer);

        actualDB.close();

        await deleteDB(actualDB.name);
      }),
    ),
      { numRuns: 1 };
  });

  test.skip("createSave", async () => {
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
          "MatchLogs",
          "DomesticLeagues",
        ];
        const actualSaveObjectStores = getDBObjectStoreNames(actualSave);

        convertArraysToSetsAndAssertStrictEqual([
          actualSaveObjectStores,
          expectedSaveObjectStores,
        ]);

        actualSave.close();
        await indexedDBCleanup();
      }),
      { numRuns: 1, timeout: 7000 },
    );
  });

  test.skip("getSaveOptionsForSave", async () => {
    await fc.assert(
      fc.asyncProperty(fc.gen(), async (fcGen) => {
        const [testSaveArguments] = fastCheckCreateTestSaveArguments(fcGen);
        const testDB = await createNewDBForSave(testSaveArguments);
        const [expectedDBName, expectedVersion] = over([
          property("name"),
          property("version"),
        ])(testDB);

        const actualSaveOptions = await getSaveOptionsForSave([
          expectedDBName,
          expectedVersion,
        ]);
        assertIsSaveOptions(toUndefined(actualSaveOptions));

        await indexedDBCleanup();
      }),
      { numRuns: 1 },
    );
  });

  test.skip("getSaveOptionsOfAllSaves", async () => {
    await fc.assert(
      fc.asyncProperty(fc.gen(), async (fcGen) => {
        const [testSaveArguments] = fastCheckCreateTestSaveArguments(fcGen);
        const testSave = await createNewDBForSave(testSaveArguments);

        const actualResult = await getSaveOptionsOfAllSaves();
        const actualSaveOptions = toUndefined(actualResult);

        const [actualRandomSaveName, actualRandomSaveOption]: [
          string,
          Option<SaveOptions>,
        ] = fastCheckRandomItemFromArray(fcGen, actualSaveOptions);

        assert.isNumber(parseInt(actualRandomSaveName));
        assertIsSaveOptions(actualRandomSaveOption);

        testSave.close();
        await deleteDB(testSave.name);
      }),
      { numRuns: 1 },
    );
  });
});
