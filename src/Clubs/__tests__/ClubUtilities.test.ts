import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { over, zipAll, zipObject, countBy } from "lodash/fp";
import { flowAsync } from "futil-js";
import { PositionGroup } from "../../Players/PlayerTypes"
import { Entity, BaseEntities } from "../../Common/CommonTypes";
import { Save } from "../../StorageUtilities/SaveTypes"
import { fakerToArb, createTestSave, randomPlayerCompetitonAndClub,
  convertBaseCountriesToBaseEntities, convertArrayOfArraysToArrayOfSets } from "../../Common/index"
import { DEFAULTMATCHCOMPOSITION } from "../ClubConstants"
import { getPlayerPositionGroupFromID } from "../../Players/PlayerUtilities"
import { createClub, getClubName, getClubSquad,
  getClubSquadFromSave,
  getClubPlayerSkillsFromSave,
  getClubBestStarting11FromSave
} from "../ClubUtilities";

describe("Club Utilities tests", async () => {

  
  test.prop([ 

    fakerToArb((faker) => faker.company.name()),
    fc.array(fc.uuid(), {
      minLength: 25,
      maxLength: 25,
    }),
  ])("createClub", async (testClubName, testPlayers) => {
    const actualClub: Entity = await createClub(testClubName, testPlayers);

    const [actualClubName, actualClubSquad] = over([getClubName, getClubSquad])(actualClub)

    expect(actualClubName).toMatch(testClubName);
    
    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      testPlayers,
      actualClubSquad,
    ]);
    expect(expectedIDs).toStrictEqual(actualIDs);
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
    "getClubSquadFromSave, getClubPlayerSkillsFromSave, getClubBestStarting11FromSave",
    async (testPlayerName, testSeason, testCountriesLeaguesClubs, fcGen) => {
      
      const testSave: Save = await createTestSave(fcGen, [testPlayerName, testSeason, testCountriesLeaguesClubs])
      const testBaseEntities: BaseEntities = await convertBaseCountriesToBaseEntities(testSeason, testCountriesLeaguesClubs)
      // change func name
      const [testClubID,]  = randomPlayerCompetitonAndClub(fcGen, testBaseEntities)
      
      const actualPlayerSkills: Record<string, Array<number>> = getClubPlayerSkillsFromSave([testSave, testClubID])
      
      const [actualPlayerIDs,]: [Array<string>, Array<Array<number>>] = flowAsync(Object.entries,zipAll)(actualPlayerSkills)

      const expectedPlayerIDs = getClubSquadFromSave([testSave, testClubID])
      
      const [actualPlayerIDsSet, expectedPlayerIDsSet] = convertArrayOfArraysToArrayOfSets([actualPlayerIDs, expectedPlayerIDs])
      
      expect(actualPlayerIDsSet).toStrictEqual(expectedPlayerIDsSet)

      const testGetClubBestStarting11FromSaveWithDEFAULT433 = getClubBestStarting11FromSave(DEFAULTMATCHCOMPOSITION)
      
      const actualBestStarting11: Record<string, Array<number>> = testGetClubBestStarting11FromSaveWithDEFAULT433([testSave, testClubID])

      const expectedComposition: Record<string, number> = zipObject(Object.values(PositionGroup), DEFAULTMATCHCOMPOSITION)
      const getActualComposition = flowAsync(Object.keys, countBy(getPlayerPositionGroupFromID))
      const actualComposition: Record<string, number> = getActualComposition(actualBestStarting11)
      expect(actualComposition).toStrictEqual(expectedComposition)
      
      
    }
  );

});
