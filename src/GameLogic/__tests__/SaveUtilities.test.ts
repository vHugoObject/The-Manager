import "fake-indexeddb/auto";
import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { deleteDB } from "idb";
import { property, pipe, map, over, identity } from "lodash/fp";
import { SaveArguments, SaveOptions, Club, Player } from "../Types";
import { assertIsClubObject, assertIsPlayerObject } from "../Asserters";
import {
  fastCheckRandomStringGenerator,
  fastCheckCreateTestSaveOptionsWithRandomCountries,
  fastCheckRandomItemFromArray,
  fastCheckCreateNTestPlayers,
  fastCheckCreateNTestClubs,
} from "../TestDataGenerators";
import { zipApply } from "../Transformers";
import { createNewDBForSave } from "../Save";
describe("SaveUtilities tests", async () => {
  const testSaveName: string = "Save";
  await fc.assert(
    fc
      .asyncProperty(
        fc.gen(),
        fc.integer({ min: 2, max: 10 }),
        fc.integer({ min: 2, max: 10 }),
        async (fcGen, testClubsCount, testPlayersCount) => {
          const testSaveOptions: SaveOptions =
            fastCheckCreateTestSaveOptionsWithRandomCountries(fcGen);

          const testPlayers: Array<Player> = fastCheckCreateNTestPlayers(
            testPlayersCount,
            fcGen,
          );
          const testClubs: Array<Club> = fastCheckCreateNTestClubs(
            testClubsCount,
            fcGen,
          );

          const testSaveArguments: SaveArguments = {
            SaveOptions: testSaveOptions,
            Clubs: testClubs,
            Players: testPlayers,
          };

          const actualDB = await createNewDBForSave(testSaveArguments);

          // const [expectedRandomClubKey, expectedRandomPlayerKey] = pipe([
          //   fastCheckRandomItemFromArray(fcGen),
          //   zipApply([property(["ClubNumber"]), property(["PlayerNumber"])])
          // ])([testClubs, testPlayers])

          // const actualRandomClub = await actualDB.get("Clubs", expectedRandomClubKey)
          // const actualRandomPlayer = await actualDB.get("Players", expectedRandomPlayerKey)
          // assertIsClubObject(actualRandomClub)
          // assertIsPlayerObject(actualRandomPlayer)

          //actualDB.close();
          await deleteDB(testSaveName);
        },
      )
      .beforeEach(async () => {
        //actualDB.close();
        await deleteDB(testSaveName);
      }),
  );
});
