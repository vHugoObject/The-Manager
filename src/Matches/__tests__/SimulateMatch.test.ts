import {
  Manager as TournamentManager,
  Player as TournamentClub,
  Match as TournamentMatch,
  Tournament,
} from "tournament-organizer/components";
import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  flatMap,
  filter,
  toPairs,
  negate,
  map,
  partial,
  values,
  spread,
  head,
} from "lodash/fp";
import { flowAsync, mapValuesIndexed } from "futil-js";
import { MatchLog } from "../MatchTypes";
import { Save } from "../../StorageUtilities/SaveTypes";
import { BaseCountries } from "../../Countries/CountryTypes";
import {
  StatisticsObject,
  MatchEntry,
  SaveArguments,
} from "../../Common/CommonTypes";
import { fakerToArb } from "../../Common/testingUtilities";
import { createSave } from "../../StorageUtilities/SaveCreator";
import {
  simulateMatch,
  simulateMatches,
  simulateBye,
  simulateByes,
} from "../SimulateMatch";

describe("simulateMatch test suite", async () => {
  const testMatchDate: Date = new Date("August 18, 2024");
  const testStartingSeason: string = "2024";
  const filterFunc = ([matchKey, matchEntry]: [
    string,
    MatchEntry,
  ]): boolean => {
    return matchEntry.match.bye == false;
  };

  const filterByes = filter(filterFunc);
  const filterNonByes = filter(negate(filterFunc));

  const randomPlayerClub = async (
    testCountriesLeaguesClubs: BaseCountries,
    g,
  ) => {
    const clubs: Array<[string, string]> = await flowAsync(
      Object.values,
      flatMap((competitions: Record<string, Record<string, string>>) =>
        Object.values(competitions),
      ),
      flatMap((clubs: Record<string, string>) => toPairs(clubs)),
    )(testCountriesLeaguesClubs);
    const randomIndex = g(fc.integer, { min: 0, max: clubs.length - 1 });
    const [clubID, clubName] = clubs[randomIndex];
    return { clubID, clubName };
  };

  const getRandomIndex = (collection: Array<any>, g): number =>
    g(fc.integer, { min: 0, max: collection.length - 1 });

  const assertByeResult = async (
    actualByeResult: [
      Record<string, MatchLog>,
      [string, string, Record<string, StatisticsObject>],
    ],
    expectedByeResult: [string, number, number, number],
  ): Promise<void> => {
    const [
      actualMatchLog,
      [actualMatchID, actualMatchSeason, actualMatchStatistics],
    ] = actualByeResult;
    const [
      expectedMatchID,
      expectedClubOneGoals,
      expectedClubTwoGoals,
      expectedDraws,
    ]: [string, number, number, number] = expectedByeResult;

    const actualByStats: Record<string, number> = flowAsync(
      Object.values,
      head,
      head,
    )(actualMatchStatistics);

    expect(actualMatchLog[expectedMatchID].ID).toBe(expectedMatchID);
    expect(actualMatchLog[expectedMatchID].Name).toBe("Bye");
    expect(actualMatchID).toBe(expectedMatchID);
    expect(actualMatchSeason).toBe(testStartingSeason);
    expect(actualByStats["Matches Played"]).toEqual(0);
  };

  const pairToMatchResultTupleWithID = async (
    actualResult: [
      Record<string, MatchLog>,
      [string, string, Record<string, StatisticsObject>],
    ],
  ) => {
    return [actualResult[1][0], actualResult];
  };

  const convertMatchResultTuplesToObject = flowAsync(
    map(pairToMatchResultTupleWithID),
    Object.fromEntries,
  );

  const mapTestByeResult = map(
    async ([testMatchID, testMatchEntry]: [string, MatchEntry]) => [
      testMatchID,
      0,
      0,
      0,
    ],
  );

  const convertExpectedMatchResultsToObject = flowAsync(
    map(
      async (expectedMatchResult: Array<[string, number, number, number]>) => [
        expectedMatchResult[0],
        expectedMatchResult,
      ],
    ),
    Object.fromEntries,
  );

  const assertByeResults = async (
    actualByeResults: Array<
      [
        Record<string, MatchLog>,
        [string, string, Record<string, StatisticsObject>],
      ]
    >,
    expectedByeResults: Array<[string, number, number, number]>,
  ): Promise<void> => {
    const expectedByeResultsObject: Record<
      string,
      [string, number, number, number]
    > = await convertExpectedMatchResultsToObject(expectedByeResults);
    const actualByeResultsObject =
      await convertMatchResultTuplesToObject(actualByeResults);

    const mapActualToExpectedResults = mapValuesIndexed(
      (
        expectedResult: [string, number, number, number],
        expectedResultID: string,
      ) => [actualByeResultsObject[expectedResultID], expectedResult],
    );
    await flowAsync(
      mapActualToExpectedResults,
      values,
      map(spread(assertByeResult)),
    )(expectedByeResultsObject);
  };

  test.prop(
    [
      fakerToArb((faker) => faker.person.fullName()),
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.company.name()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.location.country()),
        fc.dictionary(
          fakerToArb((faker) => faker.company.name()),
          fc.dictionary(
            fakerToArb((faker) => faker.string.uuid()),
            fakerToArb((faker) => faker.company.name()),
            { minKeys: 4, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "test simulateMatch",
    async (
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      testCountriesLeaguesClubs,
      g,
    ) => {
      const testPlayerClub = await randomPlayerClub(
        testCountriesLeaguesClubs,
        g,
      );

      const testSaveDetails: SaveArguments = {
        Name: testPlayerName,
        Country: testPlayerCountry,
        MainCompetition: testPlayerCompetitionName,
        startingSeason: testStartingSeason,
        Club: testPlayerClub,
        countriesLeaguesClubs: testCountriesLeaguesClubs,
      };

      const testSave: Save = await createSave(testSaveDetails);

      const testMatches: Array<[string, MatchEntry]> = await flowAsync(
        Object.entries,
        filterByes,
      )(testSave.calendar[testMatchDate.toDateString()].matches);

      await Promise.all(
        testMatches.map(
          async ([expectedMatchKey, testMatchEntry]: [string, MatchEntry]) => {
            const [actualMatchLog, actualMatchResult]: [
              Record<string, MatchLog>,
              [string, string, Record<string, StatisticsObject>],
            ] = await simulateMatch(testSave, [
              expectedMatchKey,
              testMatchEntry,
            ]);
            expect(actualMatchLog[expectedMatchKey]).toBeDefined();
            const [actualMatchKey, actualMatchSeason, actualMatchStatistics]: [
              string,
              string,
              Record<string, StatisticsObject>,
            ] = actualMatchResult;
            expect(actualMatchKey).toBe(expectedMatchKey);
            expect(actualMatchSeason).toBe(testStartingSeason);
            expect(Object.keys(actualMatchStatistics).length).toEqual(2);
          },
        ),
      );
    },
  );

  test.prop(
    [
      fakerToArb((faker) => faker.person.fullName()),
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.company.name()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.location.country()),
        fc.dictionary(
          fakerToArb((faker) => faker.company.name()),
          fc.dictionary(
            fakerToArb((faker) => faker.string.uuid()),
            fakerToArb((faker) => faker.company.name()),
            { minKeys: 4, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "test simulateMatches",
    async (
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      testCountriesLeaguesClubs,
      g,
    ) => {
      const testPlayerClub = await randomPlayerClub(
        testCountriesLeaguesClubs,
        g,
      );
      const testSaveDetails: SaveArguments = {
        Name: testPlayerName,
        Country: testPlayerCountry,
        MainCompetition: testPlayerCompetitionName,
        startingSeason: testStartingSeason,
        Club: testPlayerClub,
        countriesLeaguesClubs: testCountriesLeaguesClubs,
      };

      const testSave: Save = await createSave(testSaveDetails);
      const testMatches: Record<string, MatchEntry> =
        testSave.calendar[testMatchDate.toDateString()].matches;

      const actualMatchResultsTuples: Array<
        [
          Record<string, MatchLog>,
          [string, string, Record<string, StatisticsObject>],
        ]
      > = await simulateMatches(testSave, testMatches);

      await Promise.all(
        actualMatchResultsTuples.map(
          async ([actualMatchLog, actualMatchResult]) => {
            Object.values(actualMatchLog).forEach((value) => {
              expect(value).toBeDefined();
            });
            actualMatchResult.forEach((value) => {
              expect(value).toBeDefined();
            });
          },
        ),
      );
    },
  );

  test.prop(
    [
      fakerToArb((faker) => faker.person.fullName()),
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.company.name()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.location.country()),
        fc.dictionary(
          fakerToArb((faker) => faker.company.name()),
          fc.dictionary(
            fakerToArb((faker) => faker.string.uuid()),
            fakerToArb((faker) => faker.company.name()),
            { minKeys: 4, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "test simulateBye",
    async (
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      testCountriesLeaguesClubs,
      g,
    ) => {
      const testPlayerClub = await randomPlayerClub(
        testCountriesLeaguesClubs,
        g,
      );

      const testSaveDetails: SaveArguments = {
        Name: testPlayerName,
        Country: testPlayerCountry,
        MainCompetition: testPlayerCompetitionName,
        startingSeason: testStartingSeason,
        Club: testPlayerClub,
        countriesLeaguesClubs: testCountriesLeaguesClubs,
      };

      const testSave: Save = await createSave(testSaveDetails);

      const testByes: Array<[string, MatchEntry]> = await flowAsync(
        Object.entries,
        filterNonByes,
      )(testSave.calendar[testMatchDate.toDateString()].matches);

      const actualByeResultsTuples: Array<
        [
          Record<string, MatchLog>,
          [string, string, Record<string, StatisticsObject>],
        ]
      > = await flowAsync(map(partial(simulateBye, [testSave])))(testByes);

      const expectedByeResults: Array<[string, number, number, number]> =
        await flowAsync(mapTestByeResult)(testByes);

      await assertByeResults(actualByeResultsTuples, expectedByeResults);
    },
  );
  test.prop(
    [
      fakerToArb((faker) => faker.person.fullName()),
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.company.name()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.location.country()),
        fc.dictionary(
          fakerToArb((faker) => faker.company.name()),
          fc.dictionary(
            fakerToArb((faker) => faker.string.uuid()),
            fakerToArb((faker) => faker.company.name()),
            { minKeys: 4, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "test simulateByes",
    async (
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      testCountriesLeaguesClubs,
      g,
    ) => {
      const testPlayerClub = await randomPlayerClub(
        testCountriesLeaguesClubs,
        g,
      );

      const testSaveDetails: SaveArguments = {
        Name: testPlayerName,
        Country: testPlayerCountry,
        MainCompetition: testPlayerCompetitionName,
        startingSeason: testStartingSeason,
        Club: testPlayerClub,
        countriesLeaguesClubs: testCountriesLeaguesClubs,
      };

      const testSave: Save = await createSave(testSaveDetails);

      const testMatches: Record<string, MatchEntry> =
        testSave.calendar[testMatchDate.toDateString()].matches;

      const testByes: Array<[string, MatchEntry]> = await flowAsync(
        Object.entries,
        filterNonByes,
      )(testMatches);

      const actualByeResultsTuples: Array<
        [
          Record<string, MatchLog>,
          [string, string, Record<string, StatisticsObject>],
        ]
      > = await simulateByes(testSave, testMatches);

      const expectedByeResults: Array<[string, number, number, number]> =
        await flowAsync(mapTestByeResult)(testByes);

      await assertByeResults(actualByeResultsTuples, expectedByeResults);
    },
  );
});
