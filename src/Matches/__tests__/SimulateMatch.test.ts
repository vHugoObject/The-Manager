import { describe, expect, test } from "vitest";
import { simpleFaker } from "@faker-js/faker";
import { sampleSize, flatMap, mergeAll, set } from "lodash/fp";
import { flow, sample } from "lodash";
import { MatchLog } from "../MatchTypes";
import { Save } from "../../StorageUtilities/SaveTypes";
import { BaseCountries } from "../../Countries/CountryTypes";
import { StatisticsObject, MatchEntry } from "../../Common/CommonTypes";
import { createSave } from "../../StorageUtilities/SaveCreator";
import { simulateMatch, simulateMatches } from "../SimulateMatch";

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

  const nestedObjectsToList = flatMap(
    (object: Record<string, any>): Array<any> => Object.values(object),
  );
  const testClubs: Array<[string, string]> = flow(
    Object.values,
    nestedObjectsToList,
    mergeAll,
    Object.entries,
  )(testCountriesLeaguesClubs);

  const [testPlayerClubID, testPlayerClub] = sample(testClubs) as [
    string,
    string,
  ];
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

  

  test("test simulateMatch", async () => {
    const testMatches: Record<string, MatchEntry> =
      testSave.calendar[testMatchDate.toDateString()].matches;

    await Promise.all(
      Object.entries(testMatches).map(
        async ([expectedMatchKey, testMatchEntry]: [string, MatchEntry]) => {
          const [actualMatchLog, actualMatchResult]: [
            Record<string, MatchLog>,
            Record<string, Record<string,StatisticsObject>>,
          ] = await simulateMatch(testSave, [expectedMatchKey, testMatchEntry]);
	  console.log(actualMatchResult)
          expect(actualMatchLog[expectedMatchKey]).toBeDefined();
          expect(actualMatchResult[expectedMatchKey]).toBeDefined();
        },
      ),
    );
  });

  test("test simulateMatches", async () => {
    const testMatches: Record<string, MatchEntry> =
      testSave.calendar[testMatchDate.toDateString()].matches;

    const actualMatchResultsTuples: Array<
      [
        Record<string, MatchLog>,
        Record<string, Record<string,StatisticsObject>>,
      ]
    > = await simulateMatches(testSave, testMatches);

    await Promise.all(
      actualMatchResultsTuples.map(
        async ([actualMatchLog, actualMatchResult]) => {
          Object.values(actualMatchLog).forEach((value) => {
            expect(value).toBeDefined();
          });
          Object.values(actualMatchResult).forEach((value) => {
            expect(value).toBeDefined();
          });
        },
      ),
    );
  });
});
