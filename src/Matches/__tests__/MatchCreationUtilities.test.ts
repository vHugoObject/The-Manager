import { describe, expect, test, expectTypeOf } from "vitest";
import { simpleFaker } from "@faker-js/faker";
import { sampleSize, flatMap, mergeAll, set } from "lodash/fp";
import { flow, sample, range } from "lodash";
import { get } from "lodash/fp";
import { Club } from "../../Clubs/ClubTypes";
import { Player } from "../../Players/PlayerTypes";
import { Save } from "../../StorageUtilities/SaveTypes";
import { BaseCountries } from "../../Countries/CountryTypes";
import { Entity, StatisticsObject, MatchEntry } from "../../Common/CommonTypes";
import { createSave } from "../../StorageUtilities/SaveCreator";
import {
  getClubsPlayerObjects,
  getClubsStarting11s,
  generateMatchResults,
  matchEntryConverter,
  getClubIDsFromMatchEntry,
  matchNameObjectCreator,
  createMatchNameFromIDs,
  getScoreFromMatchResult,
  createMatchNameFromMatchEntry,
  generateMatchResultFromMatchEntry,
  generatePartialMatchLogFromMatchEntry,
} from "../MatchCreationUtilities";

describe("simulateMatch test suite", async () => {
  const testCountryOne: string = "England";
  const testMatchDate: Date = new Date("August 18, 2024");

  const testCompetitionsOne: Record<string, Record<string, string>> = {
    "English Premier League": {
      [simpleFaker.string.numeric(6)]: "Arsenal",
      [simpleFaker.string.numeric(6)]: "Brentford",
      [simpleFaker.string.numeric(6)]: "Manchester United",
      [simpleFaker.string.numeric(6)]: "Liverpool",
    },
    "The Championship": {
      [simpleFaker.string.numeric(6)]: "Watford",
      [simpleFaker.string.numeric(6)]: "Stoke City",
      [simpleFaker.string.numeric(6)]: "Manchester City",
      [simpleFaker.string.numeric(6)]: "Hull City",
    },
    "League One": {
      [simpleFaker.string.numeric(6)]: "Walsall",
      [simpleFaker.string.numeric(6)]: "Swindon",
      [simpleFaker.string.numeric(6)]: "Farnham",
      [simpleFaker.string.numeric(6)]: "Cambridge",
    },
  };

  const testCountryTwo: string = "Spain";

  // add more teams
  const testCompetitionsTwo: Record<string, Record<string, string>> = {
    "Primera Division": {
      [simpleFaker.string.numeric(6)]: "Real Madrid CF",
      [simpleFaker.string.numeric(6)]: "FC Barcelona",
    },
    "Segunda Division": {
      [simpleFaker.string.numeric(6)]: "Almeria",
      [simpleFaker.string.numeric(6)]: "Granada",
    },
    "Primera Federacion": {
      [simpleFaker.string.numeric(6)]: "Andorra",
      [simpleFaker.string.numeric(6)]: "Atzeneta",
    },
  };

  const testCountriesLeaguesClubs: BaseCountries = {
    [testCountryOne]: testCompetitionsOne,
    [testCountryTwo]: testCompetitionsTwo,
  };

  const expectedClubStatisticsObjectKeys: Set<string> = new Set([
    "Goals",
    "Expected Goals",
  ]);

  const twoRandom = sampleSize(2);
  const nestedObjectsToList = flatMap(
    (object: Record<string, any>): Array<any> => Object.values(object),
  );
  const testClubs: Array<[string, string]> = flow(
    Object.values,
    nestedObjectsToList,
    mergeAll,
    Object.entries,
  )(testCountriesLeaguesClubs);

  const [testPlayerClubID, testPlayerClub] = sample(testClubs);
  const testClubIDs: Array<string> = testClubs.flatMap(
    ([id]: [string, string]) => id,
  );
  const setOfExpectedClubIDs: Set<string> = new Set(testClubIDs);
  const testClubNames: Array<string> = testClubs.flatMap(
    ([, name]: [string, string]) => name,
  );
  const setOfExpectedClubNames: Set<string> = new Set(testClubNames);
  const testSeason: string = "2024";
  const testPlayerCountry: string = "England";
  const testPlayerCompetitionName: string = "English Premier League";
  const testPlayerName: string = "Mikel Arteta";

  let testSave: Save = await createSave(
    testPlayerName,
    testPlayerCountry,
    testPlayerCompetitionName,
    testSeason,
    { clubID: testPlayerClubID, clubName: testPlayerClub },
    testCountriesLeaguesClubs,
  );

  testSave = set("CurrentDate", testMatchDate, testSave);

  test("test getClubsPlayerObjects", async () => {
    const testEntities: Record<string, Entity> = testSave.Entities;
    const testMatches: number = Math.floor(testClubIDs.length / 2) - 1;

    await Promise.all(
      range(0, testMatches).map(async () => {
        const twoRandomTestClubIDs: Array<string> = twoRandom(testClubIDs);

        const testPlayersTuple: Array<Array<string>> = twoRandomTestClubIDs.map(
          (testKey: string) => {
            const testClub: Club = testEntities[testKey] as Club;
            return Object.keys(testClub.Starting11);
          },
        );

        const actualMatchPlayerObjects: Array<Array<Player>> =
          await getClubsPlayerObjects(testSave, testPlayersTuple);
        actualMatchPlayerObjects.forEach(
          (setOfPlayerObjects: Array<Player>) => {
            expect(setOfPlayerObjects.length).toBe(11);
          },
        );
      }),
    );
  });

  test("test getClubsStarting11s", async () => {
    const testEntities: Record<string, Entity> = testSave.Entities;
    const testMatches: number = Math.floor(testClubIDs.length / 2) - 1;
    await Promise.all(
      range(0, testMatches).map(async () => {
        const twoRandomTestClubIDs: Array<string> = twoRandom(testClubIDs);
        const testClubs: Array<Club> = twoRandomTestClubIDs.map(
          (testClubID) => testEntities[testClubID] as Club,
        );
        const actualMatchPlayerObjects: Array<Array<Player>> =
          await getClubsStarting11s(testSave, testClubs);
        actualMatchPlayerObjects.forEach(
          (setOfPlayerObjects: Array<Player>) => {
            expect(setOfPlayerObjects.length).toBe(11);
          },
        );
      }),
    );
  });

  test("test generateMatchResult", async () => {
    const testMatches: number = Math.floor(testClubIDs.length / 2) - 1;

    await Promise.all(
      range(0, testMatches).map(async () => {
        const twoRandomTestClubIDs: Array<string> = twoRandom(testClubIDs);
        const actualMatchStatisticsObjects: Record<string, StatisticsObject> =
          await generateMatchResults(testSave, twoRandomTestClubIDs);
        await Promise.all(
          twoRandomTestClubIDs.map(async (expectedClubID: string) => {
            expect(actualMatchStatisticsObjects[expectedClubID]).toBeDefined();
          }),
        );
      }),
    );
  });

  test("test createMatchNameFromMatchEntry", async () => {
    const testMatches: Record<string, MatchEntry> =
      testSave.calendar[testMatchDate.toDateString()].matches;

    await Promise.all(
      Object.values(testMatches).map(async (testMatchEntry: MatchEntry) => {
        const { Name: actualMatchName } = await createMatchNameFromMatchEntry(
          testSave,
          testMatchEntry,
        );
        expect(actualMatchName.includes("vs."));
        const [actualHome, , actualAway] = actualMatchName.split(/\s/);
        const setOfActualNames: Set<string> = new Set([actualHome, actualAway]);
        expect(setOfExpectedClubNames.isSupersetOf(setOfActualNames));
      }),
    );
  });

  test("test getClubIDsFromMatchEntry", async () => {
    const testMatches: Record<string, MatchEntry> =
      testSave.calendar[testMatchDate.toDateString()].matches;

    await Promise.all(
      Object.values(testMatches).map(async (testMatchEntry: MatchEntry) => {
        const actualIDs: [string, string] =
          await getClubIDsFromMatchEntry(testMatchEntry);
        expect(actualIDs.length).toBe(2);
        const setOfActualIDs: Set<string> = new Set(actualIDs);
        expect(setOfExpectedClubIDs.isSupersetOf(setOfActualIDs));
      }),
    );
  });

  test("test matchEntryConverter", async () => {
    const testMatches: Record<string, MatchEntry> =
      testSave.calendar[testMatchDate.toDateString()].matches;

    const setOfExpectedKeys: Set<string> = new Set([
      "ID",
      "Home",
      "Away",
      "CompetitionID",
      "Season",
    ]);
    await Promise.all(
      Object.values(testMatches).map(async (testMatchEntry: MatchEntry) => {
        const actualConvertedMatchEntry: Record<string, string> =
          await matchEntryConverter(testMatchEntry);
        const setOfActualConvertedMatchEntryKeys: Set<string> = new Set(
          Object.keys(actualConvertedMatchEntry),
        );
        expect(setOfActualConvertedMatchEntryKeys).toStrictEqual(
          setOfExpectedKeys,
        );
      }),
    );
  });

  test("test generatePartialMatchLogFromMatchEntry", async () => {
    const testMatches: Record<string, MatchEntry> =
      testSave.calendar[testMatchDate.toDateString()].matches;

    const setOfExpectedKeys: Set<string> = new Set([
      "ID",
      "Home",
      "Away",
      "CompetitionID",
      "Date",
      "Season",
    ]);

    await Promise.all(
      Object.values(testMatches).map(async (testMatchEntry: MatchEntry) => {
        const actualPartialMatchLog: Record<string, string> =
          await generatePartialMatchLogFromMatchEntry(testSave, testMatchEntry);
        const setOfActualPartialMatchLog: Set<string> = new Set(
          Object.keys(actualPartialMatchLog),
        );
        expect(setOfActualPartialMatchLog).toStrictEqual(setOfExpectedKeys);
        expect(actualPartialMatchLog.Date).toBe(testMatchDate.toDateString());
      }),
    );
  });

  test("test generateMatchResultsFromMatchEntry", async () => {
    const testMatches: Record<string, MatchEntry> =
      testSave.calendar[testMatchDate.toDateString()].matches;

    // need to set the date
    await Promise.all(
      Object.values(testMatches).map(async (testMatchEntry: MatchEntry) => {
        const [{ Name: actualMatchName }, actualMatchResult]: [
          Record<string, string>,
          Record<string, StatisticsObject>,
        ] = await generateMatchResultFromMatchEntry(testSave, testMatchEntry);
        expect(actualMatchName.includes("vs."));
        const [actualHome, , actualAway] = actualMatchName.split(/\s/);
        const setOfActualNames: Set<string> = new Set([actualHome, actualAway]);
        expect(setOfExpectedClubNames.isSupersetOf(setOfActualNames));

        expect(actualMatchResult).toBeDefined();
      }),
    );
  });

  test("test matchNameObjectCreator", async () => {
    const testEntities: Record<string, Entity> = testSave.Entities;
    const testMatches: number = Math.floor(testClubIDs.length / 2) - 1;
    await Promise.all(
      range(0, testMatches).map(async () => {
        const twoRandomTestClubIDs: Array<string> = twoRandom(testClubIDs);
        const testClubs: [Club, Club] = twoRandomTestClubIDs.map(
          (testClubID) => testEntities[testClubID] as Club,
        ) as [Club, Club];
        const [expectedHomeSide, expectedAwaySide]: Array<string> =
          testClubs.map((testClub: Club) => testClub.Name);
        const { Name: actualMatchName } = await matchNameObjectCreator([
          expectedHomeSide,
          expectedAwaySide,
        ]);
        expect(actualMatchName.startsWith(expectedHomeSide));
        expect(actualMatchName.endsWith(expectedAwaySide));
        expect(actualMatchName.includes("vs."));
      }),
    );
  });

  test("test createMatchNameFromIDs", async () => {
    const testMatches: number = Math.floor(testClubIDs.length / 2) - 1;

    await Promise.all(
      range(0, testMatches).map(async (_) => {
        const twoRandomTestClubIDs: Array<string> = twoRandom(testClubIDs);
        const { Name: actualMatchName } = await createMatchNameFromIDs(
          testSave,
          twoRandomTestClubIDs,
        );
        expect(actualMatchName.includes("vs."));
        const [actualHome, , actualAway] = actualMatchName.split(/\s/);
        const setOfActualNames: Set<string> = new Set([actualHome, actualAway]);
        expect(setOfExpectedClubNames.isSupersetOf(setOfActualNames));
      }),
    );
  });

  test("test getScoreFromMatchResult", async () => {
    const testMatches: number = Math.floor(testClubIDs.length / 2) - 1;
    await Promise.all(
      range(0, testMatches).map(async () => {
        const twoRandomTestClubIDs: Array<string> = twoRandom(testClubIDs);
        const testMatchStatisticsObjects: Record<string, StatisticsObject> =
          await generateMatchResults(testSave, twoRandomTestClubIDs);
        const actualScores: Record<
          string,
          Record<string, number>
        > = getScoreFromMatchResult(testMatchStatisticsObjects);
        twoRandomTestClubIDs.forEach((expectedClubID: string) => {
          const actualScore: number = get(
            ["Score", expectedClubID],
            actualScores,
          );
          expect(actualScore).toBeGreaterThanOrEqual(0);
          expect(actualScore).toBeLessThanOrEqual(5);
        });
      }),
    );
  });
});
