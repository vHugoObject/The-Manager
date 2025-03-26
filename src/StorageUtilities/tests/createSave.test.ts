import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { property } from "lodash/fp";
import { flowAsync } from "futil-js";
import { Save, SaveArguments } from "../SaveTypes";
import { BaseEntities } from "../../Common/CommonTypes";
import {
  convertBaseCountriesToBaseEntities,
  randomPlayerCompetitonAndClub,
  fakerToArb,
  convertToSet,
} from "../../Common/index";
import { createSave } from "../createSave";

describe("SaveCreator Utilities tests", async () => {
  test.prop([
    fc.string(),
    fc.integer({ min: 2000, max: 2100 }),
    fc.constantFrom(1, 2, 3, 4, 5).chain((testCompetitionsCount: number) => {
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
        { minLength: 1, maxLength: 5 },
      );
    }),
    fc.gen(),
  ])(
    "test createSave",
    async (testPlayerName, testSeason, testCountriesLeaguesClubs, g) => {
      const expectedKeysSet: Set<string> = new Set([
        "Name",
        "MainCompetition",
        "Club",
        "Seasons",
        "CurrentSeason",
        "CurrentDate",
        "Entities",
        "EntitiesStatistics",
        "PlayerSkillsAndPhysicalData",
        "SaveID",
      ]);

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

      const actualSave: Save = await createSave(testSaveArguments);

      const actualKeysSet: Set<string> = flowAsync(
        Object.keys,
        convertToSet,
      )(actualSave);

      expect(actualKeysSet).toStrictEqual(expectedKeysSet);
      expect(actualSave.Name).toEqual(testPlayerName);
      expect(actualSave.MainCompetition).toEqual(testPlayerMainCompetition);
      expect(actualSave.Club).toEqual(testPlayerClub);
      expect(actualSave.CurrentSeason).toEqual(testSeason);

      const actualEntitiesKeysSet: Set<string> = flowAsync(
	property(["Entities"]),
        Object.keys,
        convertToSet,
      )(actualSave);

      const expectedSubset: Set<string> = new Set([
        testPlayerClub,
        testPlayerMainCompetition,
      ]);
      expect(actualEntitiesKeysSet.isSupersetOf(expectedSubset)).toBeTruthy();
      const actualPlayerSkillsAndPhysicalDataKeysSet: Set<string> = flowAsync(
        property(["PlayerSkillsAndPhysicalData"]),
        Object.keys,
        convertToSet,
      )(actualSave);
      expect(
        actualEntitiesKeysSet.isSupersetOf(
          actualPlayerSkillsAndPhysicalDataKeysSet,
        ),
      ).toBeTruthy();
    },
  );

  test.prop(
    [
      fc.string(),
      fc.integer({ min: 2000, max: 2100 }),
      fc.constant(5).chain((testCompetitionsCount: number) => {
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
          { minLength: 5, maxLength: 5 },
        );
      }),
      fc.gen(),
    ],
    { numRuns: 1 },
  )(
    "single run of createSave with 5 countries each with 100 clubs as a benchmark",
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

      const actualSave: Save = await createSave(testSaveArguments);
    },
  );
});
