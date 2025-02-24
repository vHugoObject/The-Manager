import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { map, flatten, flatMap, sum, toPairs, over } from "lodash/fp";
import { flowAsync } from "futil-js";
import { createSave } from "../SaveCreator";
import { Save } from "../SaveTypes";
import { SaveArguments } from "../../Common/CommonTypes";

describe("SaveCreator Utilities tests", async () => {
  test.prop([
    fc.string(),
    fc.string(),
    fc.string(),
    fc.tuple(fc.string(), fc.string()),
    fc.string(),
    fc.constantFrom(1, 2, 3, 4, 5).chain((minMax) =>
      fc.record({
        countries: fc.array(
          fc.tuple(
            fc.noShrink(fc.constant("")).map(() => crypto.randomUUID()),
            fc.string(),
          ),
          { minLength: minMax, maxLength: minMax },
        ),
        competitions: fc.array(
          fc.array(
            fc.tuple(
              fc.noShrink(fc.constant("")).map(() => crypto.randomUUID()),
              fc.string(),
            ),
            { minLength: 4, maxLength: 4 },
          ),
          { minLength: minMax, maxLength: minMax },
        ),
        clubs: fc.array(
          fc.array(
            fc.array(
              fc.tuple(
                fc.noShrink(fc.constant("")).map(() => crypto.randomUUID()),
                fc.string(),
              ),
              { minLength: 20, maxLength: 40 },
            ),
            { minLength: 4, maxLength: 4 },
          ),
          { minLength: minMax, maxLength: minMax },
        ),
      }),
    ),
  ])(
    "createSave",
    async (
      testPlayerName,
      testCountry,
      testCompetitionName,
      testPlayerClub,
      testSeason,
      testCountriesLeaguesClubs,
    ) => {
      const expectedKeysSet: Set<string> = new Set([
        "Name",
        "Country",
        "MainCompetition",
        "Club",
        "Seasons",
        "CurrentSeason",
        "CurrentDate",
        "Entities",
        "EntitiesStatistics",
        "SaveID",
        "Calendar",
        "ScheduleManager",
        "CompetitonStates",
      ]);

      const testSaveArguments: SaveArguments = {
        Name: testPlayerName,
        Country: testCountry,
        MainCompetition: testCompetitionName,
        Club: testPlayerClub,
        CurrentSeason: testSeason,
        BaseEntities: testCountriesLeaguesClubs,
      };

      const actualSave: Save = await createSave(testSaveArguments);

      const actualKeysSet: Set<string> = new Set(Object.keys(actualSave));

      expect(actualKeysSet).toStrictEqual(expectedKeysSet);
    },
  );
});
