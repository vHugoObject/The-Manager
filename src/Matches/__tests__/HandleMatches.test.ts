import {
  Manager as TournamentManager,
  Player as TournamentPlayer,
  Match as TournamentMatch,
  Tournament,
} from "tournament-organizer/components";
import {
  TournamentValues,
  StandingsValues,
} from "tournament-organizer/interfaces";
import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { fakerToArb } from "../../Common/testingUtilities";
import {
  flatMap,
  mergeAll,
  head,
  map,
  toPairs,
  filter,
  pick,
  flattenDeep,
  mapValues,
  property,
} from "lodash/fp";
import { flowAsync, mapValuesIndexed } from "futil-js";
import {
  Entity,
  StatisticsObject,
  StatisticsType,
  MatchEntry,
  SaveArguments,
} from "../../Common/CommonTypes";
import { Save } from "../../StorageUtilities/SaveTypes";
import { MatchLog } from "../../Matches/MatchTypes";
import { BaseCountries } from "../../Countries/CountryTypes";
import { CalendarEntry } from "../../Common/CommonTypes";
import { createSave } from "../../StorageUtilities/SaveCreator";
import { simulateMatches } from "../SimulateMatch";
import { addOneWeek, createScheduler } from "../../Common/scheduler";
import {
  convertToSet,
  convertArrayOfArrayToSetOfArray,
} from "../../Common/CommonUtilities";
import { createCountry } from "../../Countries/CountryUtilities";
import {
  addMatchLogsAndStatisticsToSave,
  updateEntitiesStatisticsAfterMatches,
  createMatchResultArgs,
  updateScheduleManagerAfterMatches,
  groupMatchesByRound,
  getCalendarEntriesWithMatches,
  getMatchesForDate,
  getAllActiveMatches,
  handleMatches,
} from "../HandleMatches";
import { getCompetitionState } from "../../StorageUtilities/SaveHandlers";

describe("enterMatchResults test suite", async () => {
  const testMatchDate: Date = new Date("August 18, 2024");
  const testStartingSeason: string = "2024";

  const getTestMatchID = async (
    matchResultsTuple: [
      Record<string, MatchLog>,
      [string, string, Record<string, StatisticsObject>],
    ],
  ): Promise<string> => {
    const [, [testMatchID, ,]] = matchResultsTuple;

    return testMatchID;
  };

  const getTestMatchIDs = flowAsync(map(getTestMatchID));

  const matchResultPicker = pick(["win", "loss", "draw"]);

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

  const getAllMatchesFromScheduler = flatMap(
    (competition: Tournament) => competition.matches,
  );

  const getAllMatchesGroupedByRound = flowAsync(
    getAllMatchesFromScheduler,
    groupMatchesByRound,
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
            { minKeys: 3, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 1 },
  )(
    "addMatchLogsAndStatisticsToSave",
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

      let testSave: Save = await createSave(testSaveDetails);

      const testMatches: Record<string, MatchEntry> =
        testSave.calendar[testMatchDate.toDateString()].matches;

      const actualMatchResultsTuples: Array<
        [
          Record<string, MatchLog>,
          [string, string, Record<string, StatisticsObject>],
        ]
      > = await simulateMatches(testSave, testMatches);

      const testMatchIDs: Array<string> = await getTestMatchIDs(
        actualMatchResultsTuples,
      );
      const setOfTestMatchIDs: Set<string> = new Set(testMatchIDs);

      const actualUpdatedSave: Save = await addMatchLogsAndStatisticsToSave(
        actualMatchResultsTuples,
        testSave,
      );

      const setOfActualUpdatedSaveEntitiesIDs: Set<string> = new Set(
        Object.keys(actualUpdatedSave.Entities),
      );
      const setOfActualUpdatedSaveEntitiesStatisticsIDs: Set<string> = new Set(
        Object.keys(actualUpdatedSave.EntitiesStatistics),
      );
      const setsOfActualIDs: Array<Set<string>> = [
        setOfActualUpdatedSaveEntitiesIDs,
        setOfActualUpdatedSaveEntitiesStatisticsIDs,
      ];

      setsOfActualIDs.forEach((setOfActualIDs: Set<string>) =>
        expect(setOfActualIDs.isSupersetOf(setOfTestMatchIDs)).toBeTruthy(),
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
            { minKeys: 3, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 1 },
  )(
    "updateEntitiesStatisticsAfterMatches",
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

      let testSave: Save = await createSave(testSaveDetails);

      const testMatches: Record<string, MatchEntry> =
        testSave.calendar[testMatchDate.toDateString()].matches;
      const actualMatchResultsTuples: Array<
        [
          Record<string, MatchLog>,
          [string, string, Record<string, StatisticsObject>],
        ]
      > = await simulateMatches(testSave, testMatches);

      const getTestMatchClubStats = async (
        matchResultTuple: [
          Record<string, MatchLog>,
          [string, string, Record<string, StatisticsObject>],
        ],
      ): Promise<Record<string, StatisticsObject>> => {
        const [, [, , clubStats]] = matchResultTuple;
        return clubStats;
      };

      const testYear: string = testSave.CurrentSeason;
      const testStatsToAddWithIDs: Record<string, StatisticsObject> =
        await flowAsync(
          map(getTestMatchClubStats),
          mergeAll,
        )(actualMatchResultsTuples);
      const testEntitiesStatistics: Record<string, StatisticsType> =
        testSave.EntitiesStatistics;

      const actualUpdatedSave: Save =
        await updateEntitiesStatisticsAfterMatches(
          actualMatchResultsTuples,
          testSave,
        );

      const actualEntitiesUpdatedStats: Record<string, StatisticsType> =
        actualUpdatedSave.EntitiesStatistics;

      await Promise.all(
        Object.entries(testStatsToAddWithIDs).map(
          async ([testEntityID, testNewStats]: [string, StatisticsObject]) => {
            const testOldStats: StatisticsObject =
              testEntitiesStatistics[testEntityID][testYear];
            const actualEntityStatisticsObject: StatisticsObject =
              actualEntitiesUpdatedStats[testEntityID][testYear];
            await Promise.all(
              Object.entries(testNewStats).map(
                async ([testStatName, testStatValue]) => {
                  const expectedValue: number =
                    testStatValue + testOldStats[testStatName];
                  const actualValue: number =
                    actualEntityStatisticsObject[testStatName];
                  expect(actualValue).toEqual(expectedValue);
                },
              ),
            );
          },
        ),
      );
    },
  );
  test.prop([
    fc.tuple(
      fc.dictionary(
        fakerToArb((faker) => faker.string.uuid()),
        fc.record({
          ID: fakerToArb((faker) => faker.string.uuid()),
          Name: fakerToArb((faker) => faker.person.firstName()),
          Date: fakerToArb((faker) => faker.date.anytime().getFullYear()),
          Score: fc.dictionary(
            fakerToArb((faker) => faker.string.uuid()),
            fc.integer({ min: 0, max: 5 }),
            { minKeys: 2, maxKeys: 2 },
          ),
          CompetitionID: fakerToArb((faker) => faker.string.uuid()),
          Home: fakerToArb((faker) => faker.string.uuid()),
          Away: fakerToArb((faker) => faker.string.uuid()),
        }),
        { minKeys: 1, maxKeys: 1 },
      ),
      fc.tuple(
        fakerToArb((faker) => faker.string.uuid()),
        fakerToArb((faker) => faker.date.anytime().getFullYear()),
        fc.dictionary(
          fakerToArb((faker) => faker.string.uuid()),
          fc.record({
            Wins: fc.integer({ min: 0, max: 1 }),
            Draws: fc.integer({ min: 0, max: 1 }),
            Losses: fc.integer({ min: 0, max: 1 }),
            Goals: fc.integer({ min: 0, max: 5 }),
            "Expected Goals": fc.float({ min: 0, max: 5 }),
          }),
          { minKeys: 2, maxKeys: 2 },
        ),
      ),
    ),
    fc.gen(),
  ])("createMatchResultArgs", async (testMatchResultTuple, g) => {
    const actualMatchResultArgs: [string, [string, number, number, number]] =
      await createMatchResultArgs(testMatchResultTuple);
    const [expectedMatchLog, [, expectedMatchSeason, expectedMatchClubStats]] =
      testMatchResultTuple;
    const [expectedMatchID, { CompetitionID: expectedCompetitionID }] = head(
      toPairs(expectedMatchLog),
    );

    const [
      [, { Wins: expectedClubOneWins, Draws: expectedDraws }],
      [, { Wins: expectedClubTwoWins }],
    ] = toPairs(expectedMatchClubStats);

    const expectedMatchResultArgs: [string, [string, number, number, number]] =
      [
        expectedCompetitionID,
        [
          expectedMatchID,
          expectedClubOneWins,
          expectedClubTwoWins,
          expectedDraws,
        ],
      ];
    expect(actualMatchResultArgs).toStrictEqual(expectedMatchResultArgs);
  });

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
            { minKeys: 3, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "updateScheduleManagerAfterMatches",
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

      let testSave: Save = await createSave(testSaveDetails);

      const testMatches: Record<string, MatchEntry> =
        testSave.calendar[testMatchDate.toDateString()].matches;
      const actualMatchResultsTuples: Array<
        [
          Record<string, MatchLog>,
          [string, string, Record<string, StatisticsObject>],
        ]
      > = await simulateMatches(testSave, testMatches);

      const actualUpdatedSave: Save = await updateScheduleManagerAfterMatches(
        actualMatchResultsTuples,
        testSave,
      );

      const expectedMatchResultArgs: Array<
        [string, [string, number, number, number]]
      > = await flowAsync(map(createMatchResultArgs))(actualMatchResultsTuples);

      const matchResultAsserter = async ([
        actualResult,
        expectedWins,
        expectedDraws,
      ]): Promise<void> => {
        const expectedLosses: number =
          expectedWins == 0 && expectedDraws == 0 ? 1 : 0;
        const expectedResult: Record<string, number> = {
          win: expectedWins,
          loss: expectedLosses,
          draw: expectedDraws,
        };
        expect(matchResultPicker(actualResult)).toStrictEqual(expectedResult);
      };

      const assertMatchResultsWereEntered = async ([
        expectedCompetitionID,
        [
          expectedMatchID,
          expectedClubOneWins,
          expectedClubTwoWins,
          expectedDraws,
        ],
      ]: [string, [string, number, number, number]]): Promise<void> => {
        const [updatedCompetitionState]: [TournamentValues, StandingsValues[]] =
          await getCompetitionState(actualUpdatedSave, expectedCompetitionID);
        const updatedMatch: TournamentMatch = head(
          filter((match: TournamentMatch) => match.id == expectedMatchID)(
            updatedCompetitionState.matches,
          ),
        ) as TournamentMatch;
        // bye filter, currently no match statistics are being added to TO)
        if (updatedMatch.bye == true) {
          return;
        }
        const updatedMatchAssertArgs = [
          [updatedMatch.player1, expectedClubOneWins, expectedDraws],
          [updatedMatch.player2, expectedClubTwoWins, expectedDraws],
        ];
        await flowAsync(map(matchResultAsserter))(updatedMatchAssertArgs);
      };

      await flowAsync(map(assertMatchResultsWereEntered))(
        expectedMatchResultArgs,
      );
    },
  );

  test.prop(
    [
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.company.name()),
        fc.dictionary(
          fakerToArb((faker) => faker.string.uuid()),
          fakerToArb((faker) => faker.company.name()),
          { minKeys: 2 },
        ),
        { minKeys: 1 },
      ),
    ],
    { numRuns: 50 },
  )(
    "groupMatchesByRound",
    async (testCountryName, testSeason, testCountryCompetitions) => {
      const [testCountry, testCompetitions, testClubs, testPlayers] =
        await createCountry(
          testCountryName,
          testCountryCompetitions,
          testSeason,
        );

      const testScheduler: TournamentManager =
        await createScheduler(testCompetitions);

      const expectedMatches: Array<TournamentMatch> =
        getAllMatchesFromScheduler(testScheduler.tournaments);
      const actualGroupedMatches: Record<
        string,
        Array<TournamentMatch>
      > = await groupMatchesByRound(expectedMatches);
      const actualUnGroupedMatches = flowAsync(
        Object.values,
        flattenDeep,
      )(actualGroupedMatches);
      expect(actualUnGroupedMatches).toStrictEqual(expectedMatches);
    },
  );

  test.prop(
    [
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.company.name()),
        fc.dictionary(
          fakerToArb((faker) => faker.string.uuid()),
          fakerToArb((faker) => faker.company.name()),
          { minKeys: 2 },
        ),
        { minKeys: 1 },
      ),
    ],
    { numRuns: 50 },
  )(
    "getAllActiveMatches",
    async (testCountryName, testSeason, testCountryCompetitions) => {
      const [testCountry, testCompetitions, testClubs, testPlayers] =
        await createCountry(
          testCountryName,
          testCountryCompetitions,
          testSeason,
        );

      const testScheduler: TournamentManager =
        await createScheduler(testCompetitions);

      const testMatches: Array<TournamentMatch> = getAllMatchesFromScheduler(
        testScheduler.tournaments,
      );
      const actualActiveMatches: Array<TournamentMatch> =
        await getAllActiveMatches(testMatches);
      const testGroupedMatches: Record<
        string,
        Array<TournamentMatch>
      > = await groupMatchesByRound(testMatches);
      const [actualMatches, expectedMatches] = convertArrayOfArrayToSetOfArray([
        actualActiveMatches,
        testGroupedMatches["1"],
      ]);
      expect(actualMatches).toStrictEqual(expectedMatches);
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
            { minKeys: 3, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "getCalendarEntriesWithMatches",
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

      let testSave: Save = await createSave(testSaveDetails);

      const actualCalendarEntriesWithMatches: Record<string, CalendarEntry> =
        await getCalendarEntriesWithMatches(testSave);
      const testMatches: Record<
        string,
        Array<TournamentMatch>
      > = await getAllMatchesGroupedByRound(
        testSave.scheduleManager.tournaments,
      );
      expect(Object.values(actualCalendarEntriesWithMatches)).toStrictEqual(
        Object.values(testMatches),
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
            { minKeys: 3, maxKeys: 20 },
          ),
          { minKeys: 3, maxKeys: 8 },
        ),
        { minKeys: 1, maxKeys: 10 },
      ),
      fc.gen(),
    ],
    { numRuns: 25 },
  )(
    "getMatchesForDate",
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

      let testSave: Save = await createSave(testSaveDetails);

      const expectedMatches: Record<
        string,
        Record<string, MatchEntry>
      > = await flowAsync(
        getCalendarEntriesWithMatches,
        mapValues(property(["matches"])),
      )(testSave);
      const testMapper = async (_, expectedKey: string) =>
        await getMatchesForDate(expectedKey, save);
      const actualMatches: Record<
        string,
        Record<string, MatchEntry>
      > = await flowAsync(mapValuesIndexed(testMapper))(expectedMatches);
    },
  );
});
