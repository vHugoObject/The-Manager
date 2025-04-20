import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { over } from "lodash/fp";
import { Save } from "../SaveTypes";
import { getUserName, getCurrentSeason } from "../SaveUtilities";
import { createTestSave } from "../SaveTestingUtilities";

describe("SaveTestingUtilities test suite", async () => {
  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.string(),
    fc.tuple(
      fc.integer({ min: 1, max: 2 }),
      fc.integer({ min: 1, max: 2 }),
      fc.integer({ min: 1, max: 2 }),
    ),
    fc.gen(),
  ])(
    "createTestSave",
    async (
      testSeason,
      testPlayerName,
      testCountriesDomesticsLeaguesClubsCount,
      fcGen,
    ) => {
      const actualTestSave: Save = await createTestSave(fcGen, [
        testPlayerName,
        testSeason,
        testCountriesDomesticsLeaguesClubsCount,
      ]);
      const [actualUserName, actualCurrentSeason] = over([
        getUserName,
        getCurrentSeason,
      ])(actualTestSave);

      expect(actualUserName).toBe(testPlayerName);
      expect(actualCurrentSeason).toBe(testSeason);
    },
  );
});
