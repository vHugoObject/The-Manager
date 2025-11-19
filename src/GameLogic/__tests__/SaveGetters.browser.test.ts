import { test, fc } from "@fast-check/vitest";
import { describe, assert, expect } from "vitest";
import { IDBPDatabase } from "idb";
import { property, pipe, map, over } from "lodash/fp";
import { toUndefined, Option } from "fp-ts/Option";
import { SaveSchema, SaveOptions } from "../Types";
import {
  assertIsClubObject,
  assertIsPlayerObject,
  assertIsSaveOptions,
  assertIsDomesticLeagueObject,
  convertArraysToSetsAndAssertStrictEqual,
} from "../Asserters";
import {
  fastCheckCreateTestSaveOptionsWithRandomCountries,
  fastCheckRandomItemFromArray,
  fastCheckCreateTestSaveArguments,
} from "../TestDataGenerators";
import {
  createNewDBForSave,
  createSave,
  getDBObjectStoreNames,
  getSaveOptionsOfAllSaves,
  getSaveOptionsForSave,
  indexedDBCleanup,
  getDBObjectStoreIndexNames,
} from "../Save";

describe("SaveGetters tests", async () => {
  test("getClubPlayersFromDB", async () => {
    await fc.assert(
      fc.asyncProperty(fc.gen(), async (fcGen) => {}),
      { numRuns: 1, timeout: 7000 },
    );
  });
});
