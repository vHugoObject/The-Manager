import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { over } from "lodash/fp";
import { flowAsync } from "futil-js";
import { Save, SaveArguments } from "../SaveTypes";
import { BaseEntities } from "../../Common/CommonTypes";
import {
  convertBaseCountriesToBaseEntities,
  randomPlayerCompetitonAndClub,
  fakerToArb,
  convertToSet,
} from "../../Common/index";
import { getCompetitionClubs } from "../../Competitions/CompetitionUtilities";
import {
  getUserName,
  getUserMainCompetitionID,
  getUserClubID,
  getCurrentSeason,
  getSavePlayerSkills,
  getEntityFromSaveEntities,
  getGroupOfPlayerSkillsFromSave,
} from "../SaveUtilities";
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
    "test createSave, getEntityFromSave, and getEntitiesFromSave",
    async (testPlayerName, testSeason, testCountriesLeaguesClubs, fcGen) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );
      const [testPlayerClub, testPlayerMainCompetition]: [string, string] =
        randomPlayerCompetitonAndClub(fcGen, testBaseEntities);

      const testSaveArguments: SaveArguments = {
        Name: testPlayerName,
        UserMainCompetitionID: testPlayerMainCompetition,
        UserClubID: testPlayerClub,
        CurrentSeason: testSeason,
        BaseEntities: testBaseEntities,
      };

      const actualSave: Save = await createSave(testSaveArguments);

      const [
        actualUserName,
        actualUserMainCompetitionID,
        actualUserClubID,
        actualCurrentSeason,
      ] = over([
        getUserName,
        getUserMainCompetitionID,
        getUserClubID,
        getCurrentSeason,
      ])(actualSave);

      expect(actualUserName).toEqual(testPlayerName);
      expect(actualUserMainCompetitionID).toEqual(testPlayerMainCompetition);
      expect(actualUserClubID).toEqual(testPlayerClub);
      expect(actualCurrentSeason).toEqual(testSeason);

      const actualPlayerMainCompetitionClubsSet = flowAsync(
        getEntityFromSaveEntities,
        getCompetitionClubs,
        convertToSet,
      )([actualSave, testPlayerMainCompetition]);
      expect(
        actualPlayerMainCompetitionClubsSet.has(testPlayerClub),
      ).toBeTruthy();

      const getSavePlayerSkillsIDs = flowAsync(
        getSavePlayerSkills,
        Object.keys,
      );
      const getExpectedPlayerIDsFromSaveEntities = flowAsync(
        getGroupOfPlayerSkillsFromSave,
        Object.keys,
      );

      const actualSavePlayerSkillsIDs: Array<string> =
        getSavePlayerSkillsIDs(actualSave);
      const actualSavePlayerBiosIDs: Array<Array<number>> =
        getExpectedPlayerIDsFromSaveEntities([
          actualSave,
          actualSavePlayerSkillsIDs,
        ]);

      expect(actualSavePlayerBiosIDs.length).toEqual(
        actualSavePlayerSkillsIDs.length,
      );
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
    async (testPlayerName, testSeason, testCountriesLeaguesClubs, fcGen) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );
      const [testPlayerMainCompetition, testPlayerClub]: [string, string] =
        randomPlayerCompetitonAndClub(fcGen, testBaseEntities);

      const testSaveArguments: SaveArguments = {
        Name: testPlayerName,
        UserMainCompetitionID: testPlayerMainCompetition,
        UserClubID: testPlayerClub,
        CurrentSeason: testSeason,
        BaseEntities: testBaseEntities,
      };

      await createSave(testSaveArguments);
    },
  );
});
