import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  pipe,
  map,
  zipAll,
  zipObject,
  countBy,
  flatMapDeep,
  size,
} from "lodash/fp";
import { PositionGroup, Save } from "../Types";
import {
  DEFAULTMATCHCOMPOSITION,
  DEFAULTTESTMATCHESCOUNT,
  DEFAULTPLAYERSPERTESTMATCHES,
} from "../Constants";
import {
  fastCheckTestMixedArrayOfPositionGroupIDsGenerator,
} from "../TestDataGenerationUtilities";
import {
  convertArrayOfArraysToArrayOfSets,
  zipAllAndGetSecondArray,
} from "../Transformers";
import {
  sortPlayersByRatings,
  getClubBestStarting11FromSave,
  getPlayerPositionGroupFromID,
  getClubSquadFromSave,
  getClubPlayerSkillsFromSave,
  getCountOfPlayersByPositionFromArray,
} from "../Getters";

describe("SaveEntitiesGetters test suite", () => {
  const getActualComposition = pipe([
    Object.keys,
    countBy(getPlayerPositionGroupFromID),
  ]);
  const getActualPlayerIDsCountsFromStartingElevens = pipe([
    flatMapDeep(map(Object.keys)),
    size,
  ]);

  test.prop([
    fc.integer({ min: 5, max: 25 }).chain((totalTestSkills: number) => {
      return fc.dictionary(
        fc.string(),
        fc.array(fc.integer({ min: 0, max: 100 }), {
          minLength: totalTestSkills,
          maxLength: totalTestSkills,
        }),
        { minKeys: 5 },
      );
    }),
  ])("sortPlayersByRatings", (testPlayers) => {
    const actualSortedPlayers: Record<
      string,
      Array<number>
    > = sortPlayersByRatings(testPlayers);

    expect(actualSortedPlayers).toMatchObject(testPlayers);
  });

  test.prop([
    fc.tuple(
      fc.integer({ min: 2, max: 50 }),
      fc.integer({ min: 50, max: 100 }),
    ),
    fc.gen(),
  ])("getCountOfPlayersByPositionFromArray", (testRange, fcGen) => {
    const [testPlayerIDs, playerIDIndexCountTuples]: Array<string> =
      fastCheckTestMixedArrayOfPositionGroupIDsGenerator(fcGen, testRange);
    const actualCountsPerPosition: Array<number> =
      getCountOfPlayersByPositionFromArray(testPlayerIDs);
    const expectedCountsPerPosition = zipAllAndGetSecondArray(
      playerIDIndexCountTuples,
    );

    expect(actualCountsPerPosition).toStrictEqual(expectedCountsPerPosition);
  });

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.string(),
      fc.tuple(
        fc.integer({ min: 1, max: 3 }),
        fc.integer({ min: 1, max: 3 }),
        fc.integer({ min: 1, max: 20 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
    "getClubSquadFromSave, getClubPlayerSkillsFromSave, getClubBestStarting11FromSave",
    (
      testSeason,
      testPlayerName,
      testCountriesDomesticsLeaguesClubsCount,
      fcGen,
    ) => {
      const testSave: Save = createTestSave(fcGen, [
        testPlayerName,
        testSeason,
        testCountriesDomesticsLeaguesClubsCount,
      ]);
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
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

      const [actualPlayerIDs]: [Array<string>, Array<Array<number>>] = pipe([
        Object.entries,
        zipAll,
      ])(actualPlayerSkills);

      const expectedPlayerIDs = getClubSquadFromSave([testSave, testClubID]);

      const [actualPlayerIDsSet, expectedPlayerIDsSet] =
        convertArrayOfArraysToArrayOfSets([actualPlayerIDs, expectedPlayerIDs]);

      expect(actualPlayerIDsSet).toStrictEqual(expectedPlayerIDsSet);
    },
  );

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.string(),
      fc.tuple(
        fc.integer({ min: 1, max: 1 }),
        fc.integer({ min: 1, max: 2 }),
        fc.integer({ min: 1, max: 20 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
    "getClubBestStarting11FromSave, getClubBestStarting11ForAGroupOfMatchupsWithDefaultCompFromSave",
    (
      testSeason,
      testPlayerName,
      testCountriesDomesticsLeaguesClubsCount,
      fcGen,
    ) => {
      const testSave: Save = createTestSave(fcGen, [
        testPlayerName,
        testSeason,
        testCountriesDomesticsLeaguesClubsCount,
      ]);
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
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
      > = getClubBestStarting11ForAGroupOfMatchupsWithDefaultCompFromSave(
        testSave,
        testMatchUps,
      );

      const expectedPlayersCount: number =
        DEFAULTTESTMATCHESCOUNT * DEFAULTPLAYERSPERTESTMATCHES;
      const actualPlayersCount: number =
        getActualPlayerIDsCountsFromStartingElevens(actualBestStartingElevens);
      expect(actualPlayersCount).toEqual(expectedPlayersCount);
    },
  );
});
