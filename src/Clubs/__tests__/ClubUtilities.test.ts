import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  over,
  multiply,
  zipAll,
  zipObject,
  countBy,
  flatMapDeep,
  map,
  size,
  flatten,
  uniq,
} from "lodash/fp";
import { flowAsync } from "futil-js";
import { PositionGroup } from "../../Players/PlayerTypes";
import { Entity, BaseEntities } from "../../Common/CommonTypes";
import { Save } from "../../StorageUtilities/SaveTypes";
import {
  fakerToArb,
  createTestSave,
  convertBaseCountriesToBaseEntities,
  convertArrayOfArraysToArrayOfSets,
  defaultGetAListOfRandomMatches,
  DEFAULTTESTMATCHES,
  DEFAULTPLAYERSPERTESTMATCHES,
  DEFAULTSQUADSIZE,
  getFirstLevelArrayLengthsAsSet,
  fastCheckTestBaseEntitiesGenerator,
  getCompletelyRandomClubID,
} from "../../Common/index";
import { DEFAULTMATCHCOMPOSITION } from "../ClubConstants";
import { getPlayerPositionGroupFromID } from "../../Players/PlayerUtilities";
import {
  createClub,
  getClubName,
  getClubSquad,
  getClubSquadFromSave,
  getClubPlayerSkillsFromSave,
  getClubBestStarting11FromSave,
  getClubBestStarting11ForAGroupOfMatchupsWithDefaultCompFromSave,
} from "../ClubUtilities";

describe("Club Utilities tests", async () => {
  const getActualComposition = flowAsync(
    Object.keys,
    countBy(getPlayerPositionGroupFromID),
  );
  const getActualPlayerIDsCountsFromStartingElevens = flowAsync(
    flatMapDeep(map(Object.keys)),
    size,
  );
  test.prop([
    fakerToArb((faker) => faker.company.name()),
    fc.array(fc.uuid(), {
      minLength: 25,
      maxLength: 25,
    }),
  ])("createClub", async (testClubName, testPlayers) => {
    const actualClub: Entity = await createClub(testClubName, testPlayers);

    const [actualClubName, actualClubSquad] = over([getClubName, getClubSquad])(
      actualClub,
    );

    expect(actualClubName).toMatch(testClubName);

    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      testPlayers,
      actualClubSquad,
    ]);
    expect(expectedIDs).toStrictEqual(actualIDs);
  });

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.string(),
    fc.tuple(
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "getClubSquadFromSave, getClubPlayerSkillsFromSave, getClubBestStarting11FromSave",
    async (
      testSeason,
      testPlayerName,
      testCountriesDomesticsLeaguesClubsCount,
      fcGen,
    ) => {
      const testSave: Save = await createTestSave(fcGen, [
        testPlayerName,
        testSeason,
        testCountriesDomesticsLeaguesClubsCount,
      ]);
      const testBaseEntities: BaseEntities =
        await fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const testClubID: string = getCompletelyRandomClubID(
        fcGen,
        testBaseEntities,
      );

      const actualPlayerSkills: Record<
        string,
        Array<number>
      > = getClubPlayerSkillsFromSave([testSave, testClubID]);

      const [actualPlayerIDs]: [Array<string>, Array<Array<number>>] =
        flowAsync(Object.entries, zipAll)(actualPlayerSkills);

      const expectedPlayerIDs = getClubSquadFromSave([testSave, testClubID]);

      const [actualPlayerIDsSet, expectedPlayerIDsSet] =
        convertArrayOfArraysToArrayOfSets([actualPlayerIDs, expectedPlayerIDs]);

      expect(actualPlayerIDsSet).toStrictEqual(expectedPlayerIDsSet);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.string(),
    fc.tuple(
      fc.integer({ min: 1, max: 1 }),
      fc.integer({ min: 1, max: 2 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "getClubBestStarting11FromSave, getClubBestStarting11ForAGroupOfMatchupsWithDefaultCompFromSave",
    async (
      testSeason,
      testPlayerName,
      testCountriesDomesticsLeaguesClubsCount,
      fcGen,
    ) => {
      const testSave: Save = await createTestSave(fcGen, [
        testPlayerName,
        testSeason,
        testCountriesDomesticsLeaguesClubsCount,
      ]);
      const testBaseEntities: BaseEntities =
        await fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const testClubID: string = getCompletelyRandomClubID(
        fcGen,
        testBaseEntities,
      );

      const testGetClubBestStarting11FromSaveWithDEFAULT433 =
        getClubBestStarting11FromSave(DEFAULTMATCHCOMPOSITION);

      const actualBestStartingEleven: Record<
        string,
        Array<number>
      > = testGetClubBestStarting11FromSaveWithDEFAULT433([
        testSave,
        testClubID,
      ]);

      const expectedComposition: Record<string, number> = zipObject(
        Object.values(PositionGroup),
        DEFAULTMATCHCOMPOSITION,
      );

      const actualComposition: Record<string, number> = getActualComposition(
        actualBestStartingEleven,
      );
      expect(actualComposition).toStrictEqual(expectedComposition);

      const testMatchUps: Array<[string, string]> =
        defaultGetAListOfRandomMatches([fcGen, testBaseEntities]);

      const actualBestStartingElevens: Array<
        [Record<string, Array<number>>, Record<string, Array<number>>]
      > = await getClubBestStarting11ForAGroupOfMatchupsWithDefaultCompFromSave(
        testSave,
        testMatchUps,
      );

      const expectedPlayersCount: number =
        DEFAULTTESTMATCHES * DEFAULTPLAYERSPERTESTMATCHES;
      const actualPlayersCount: number =
        getActualPlayerIDsCountsFromStartingElevens(actualBestStartingElevens);
      expect(actualPlayersCount).toEqual(expectedPlayersCount);
    },
  );
});
