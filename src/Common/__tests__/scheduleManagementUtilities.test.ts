import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  map,
  spread,
  partial,
  zipObject,
  mapValues,
  head,
  property,
  filter,
  pick,
  zipAll,
  values,
} from "lodash/fp";
import { flowAsync, mapValuesIndexed } from "futil-js";
import { fakerToArb } from "../testingUtilities";
import {
  Manager as TournamentManager,
  Player as TournamentClub,
  Match as TournamentMatch,
  Tournament,
} from "tournament-organizer/components";
import { isSunday, addWeeks } from "date-fns";
import { isBefore } from "date-fns/fp";
import {
  TournamentValues,
  StandingsValues,
} from "tournament-organizer/interfaces";
import { Competition } from "../../Competitions/CompetitionTypes";
import { createCompetition } from "../../Competitions/CompetitionUtilities";
import {
  createTournamentClubs,
  createTournament,
  serializeCompetitionState,
  serializeCompetitionStates,
  loadCompetitionState,
  enterResult,
  enterResults,
} from "../scheduleManagementUtilities";

describe("scheduleManagementUtilities tests", async () => {
  const activeFilter = filter((match: TournamentMatch) => match.active == true);

  const matchResultPicker = pick(["win", "loss", "draw"]);

  const testMatchResultArgsCreator = async (
    g,
    testMatchID: string,
  ): Promise<[string, number, number, number]> => {
    const testClubOneWins: number = g(fc.integer, { min: 0, max: 1 });
    const testClubTwoWins: number =
      testClubOneWins == 1 ? 0 : g(fc.integer, { min: 0, max: 1 });
    const testDraws: number =
      testClubOneWins == 0 && testClubTwoWins == 0 ? 1 : 0;
    return [testMatchID, testClubOneWins, testClubTwoWins, testDraws];
  };

  const assertClubMatchResult = async ([
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

  const assertClubMatchResults = flowAsync(map(assertClubMatchResult));

  const convertAndAssertSimulatedMatchResult = async (
    actualSimulatedMatch: TournamentMatch,
    expectedSimulatedMatchResult: [string, number, number, number],
  ): Promise<void> => {
    const actualSimulatedMatchClubOne = actualSimulatedMatch.player1;
    const actualSimulatedMatchClubTwo = actualSimulatedMatch.player2;
    const [, testClubOneWins, testClubTwoWins, testDraws]: [
      string,
      number,
      number,
      number,
    ] = expectedSimulatedMatchResult;
    await assertClubMatchResults([
      [actualSimulatedMatchClubOne, testClubOneWins, testDraws],
      [actualSimulatedMatchClubTwo, testClubTwoWins, testDraws],
    ]);
  };

  const convertExpectedMatchResultsToObject = flowAsync(
    map(
      async (expectedMatchResult: Array<[string, number, number, number]>) => [
        expectedMatchResult[0],
        expectedMatchResult,
      ],
    ),
    Object.fromEntries,
  );

  test.prop(
    [
      fc.dictionary(
        fakerToArb((faker) => faker.string.uuid()),
        fc.string(),
        { minKeys: 2 },
      ),
    ],
    { numRuns: 50 },
  )("createTournamentClubs", async (testClubs) => {
    const actualClubs: Array<TournamentClub> =
      await createTournamentClubs(testClubs);
    expect(actualClubs.length).toEqual(Object.keys(testClubs).length);
    actualClubs.forEach((actualClub: TournamentClub) => {
      expect(testClubs[actualClub.id]).toBeDefined();
    });
  });

  test.prop(
    [
      fc.string(),
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.string.uuid()),
        fc.string(),
        { minKeys: 2 },
      ),
    ],
    { numRuns: 50 },
  )(
    "createTournament",
    async (
      testCompetitionName,
      testCompetitionCountry,
      testSeason,
      testClubs,
    ) => {
      const [testCompetition, , ,] = await createCompetition(
        testCompetitionName,
        testCompetitionCountry,
        testSeason,
        testClubs,
      );
      const testScheduler: TournamentManager = new TournamentManager();
      const actualTournament: Tournament = await createTournament(
        testScheduler,
        testCompetition,
      );

      const expectedClubsCount: number = Object.keys(testClubs).length;
      expect(actualTournament.players.length).toEqual(expectedClubsCount);
    },
  );

  test.prop(
    [
      fc.string(),
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.string.uuid()),
        fc.string(),
        { minKeys: 2 },
      ),
    ],
    { numRuns: 50 },
  )(
    "loadCompetitionState",
    async (
      testCompetitionName,
      testCompetitionCountry,
      testSeason,
      testClubs,
    ) => {
      const [testCompetition, , ,] = await createCompetition(
        testCompetitionName,
        testCompetitionCountry,
        testSeason,
        testClubs,
      );
      const testScheduler: TournamentManager = new TournamentManager();
      const testCompetitionState: Tournament = await createTournament(
        testScheduler,
        testCompetition,
      );
      const [
        testTournamentID,
        [testTournamentValues, expectedStandingsValues],
      ]: [string, [TournamentValues, StandingsValues[]]] =
        await serializeCompetitionState(testCompetitionState);

      const actualLoadedCompetition: Tournament = await loadCompetitionState(
        testScheduler,
        testTournamentValues,
      );
      const actualStandingsValues: StandingsValues[] = structuredClone(
        actualLoadedCompetition.standings(),
      );
      expect(actualStandingsValues).toStrictEqual(expectedStandingsValues);
    },
  );

  test.prop(
    [
      fc.string(),
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.string.uuid()),
        fc.string(),
        { minKeys: 2 },
      ),
      fc.gen(),
    ],
    { numRuns: 50 },
  )(
    "enterResult",
    async (
      testCompetitionName,
      testCompetitionCountry,
      testSeason,
      testClubs,
      g,
    ) => {
      const [testCompetition, , ,] = await createCompetition(
        testCompetitionName,
        testCompetitionCountry,
        testSeason,
        testClubs,
      );
      const testScheduler: TournamentManager = new TournamentManager();
      const testCompetitionState: Tournament = await createTournament(
        testScheduler,
        testCompetition,
      );

      const activeMatches: Array<TournamentMatch> = activeFilter(
        testCompetitionState.matches,
      );

      const testRandomMatchIndex: number = g(fc.integer, {
        min: 0,
        max: activeMatches.length - 1,
      });
      const testRandomMatch: TournamentMatch =
        activeMatches[testRandomMatchIndex];
      const testMatchID: string = testRandomMatch.id;

      const testEnterMatchResultArgs: [string, number, number, number] =
        await testMatchResultArgsCreator(g, testMatchID);
      const actualUpdatedCompetition: Tournament = await enterResult(
        testCompetitionState,
        testEnterMatchResultArgs,
      );

      const actualSimulatedMatch: TournamentMatch = head(
        actualUpdatedCompetition.matches.filter(
          (testMatch: TournamentMatch) => testMatch.id == testMatchID,
        ),
      ) as TournamentMatch;

      await convertAndAssertSimulatedMatchResult(
        actualSimulatedMatch,
        testEnterMatchResultArgs,
      );
    },
  );

  test.prop(
    [
      fc.string(),
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.string.uuid()),
        fc.string(),
        { minKeys: 4 },
      ),
      fc.gen(),
    ],
    { numRuns: 50 },
  )(
    "enterResults",
    async (
      testCompetitionName,
      testCompetitionCountry,
      testSeason,
      testClubs,
      g,
    ) => {
      const [testCompetition, , ,] = await createCompetition(
        testCompetitionName,
        testCompetitionCountry,
        testSeason,
        testClubs,
      );
      const testScheduler: TournamentManager = new TournamentManager();
      const testCompetitionState: Tournament = await createTournament(
        testScheduler,
        testCompetition,
      );

      const testMatches: Array<TournamentMatch> = activeFilter(
        testCompetitionState.matches,
      );

      const testEnterMatchResultsArgs: Array<[string, number, number, number]> =
        await flowAsync(
          map(property(["id"])),
          map(partial(testMatchResultArgsCreator, [g])),
        )(testMatches);

      const [actualSimulatedMatchIDs, , ,]: [
        Array<string>,
        Array<number>,
        Array<number>,
        Array<number>,
      ] = zipAll(testEnterMatchResultsArgs);

      const setOfExpectedSimulatedMatchIDs: Set<string> = new Set(
        actualSimulatedMatchIDs,
      );
      const simulatedMatchesFilter = filter((match: TournamentMatch): boolean =>
        setOfExpectedSimulatedMatchIDs.has(match.id),
      );
      const actualUpdatedCompetition: Tournament = await enterResults(
        testEnterMatchResultsArgs,
        testCompetitionState,
      );

      const convertActualSimulatedMatchesToObject = flowAsync(
        simulatedMatchesFilter,
        map((actualTournamentMatch: TournamentMatch) => [
          actualTournamentMatch.id,
          actualTournamentMatch,
        ]),
        Object.fromEntries,
      );

      const prepareConvertAndAssertSimulatedMatchResults = async (
        allMatchesFromUpdatedSave: Array<TournamentMatch>,
        expectedMatchResults: Array<[string, number, number, number]>,
      ): Promise<void> => {
        const expectedMatchResultsObject: Record<
          string,
          [string, number, number, number]
        > = await convertExpectedMatchResultsToObject(expectedMatchResults);
        const actualMatchResultsObjects: Record<string, TournamentMatch> =
          await convertActualSimulatedMatchesToObject(
            allMatchesFromUpdatedSave,
          );
        const mapActualToExpectedResults = mapValuesIndexed(
          (
            expectedResult: [string, number, number, number],
            expectedResultID: string,
          ) => [actualMatchResultsObjects[expectedResultID], expectedResult],
        );
        await flowAsync(
          mapActualToExpectedResults,
          values,
          map(spread(convertAndAssertSimulatedMatchResult)),
        )(expectedMatchResultsObject);
      };

      await prepareConvertAndAssertSimulatedMatchResults(
        actualUpdatedCompetition.matches,
        testEnterMatchResultsArgs,
      );
    },
  );

  test.prop(
    [
      fc.string(),
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.string.uuid()),
        fc.string(),
        { minKeys: 2 },
      ),
    ],
    { numRuns: 50 },
  )(
    "serializeCompetitionState",
    async (
      testCompetitionName,
      testCompetitionCountry,
      testSeason,
      testClubs,
    ) => {
      const [testCompetition, , ,] = await createCompetition(
        testCompetitionName,
        testCompetitionCountry,
        testSeason,
        testClubs,
      );
      const testScheduler: TournamentManager = new TournamentManager();
      const testCompetitionState: Tournament = await createTournament(
        testScheduler,
        testCompetition,
      );
      const [
        actualCompetitionID,
        [actualCompetitionValues, actualCompetitionStandings],
      ]: [string, [TournamentValues, StandingsValues[]]] =
        await serializeCompetitionState(testCompetitionState);

      expect(actualCompetitionID).toBe(testCompetition.ID);
      expect(actualCompetitionValues.id).toBe(testCompetition.ID);
      expect(actualCompetitionValues.name).toBe(testCompetitionName);
      expect(actualCompetitionStandings.length).toEqual(
        Object.keys(testClubs).length,
      );
    },
  );

  test.prop(
    [
      fc.array(
        fc.tuple(
          fc.string(),
          fakerToArb((faker) => faker.location.country()),
          fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
          fc.dictionary(
            fakerToArb((faker) => faker.string.uuid()),
            fakerToArb((faker) => faker.company.name()),
            { minKeys: 3 },
          ),
        ),
        { minLength: 2 },
      ),
    ],
    { numRuns: 50 },
  )("serializeCompetitionStates", async (testCompetitionArgs) => {
    const testScheduler: TournamentManager = new TournamentManager();
    const testCompetitions: Array<Competition> = await flowAsync(
      map(spread(createCompetition)),
      map(head),
    )(testCompetitionArgs);
    const testCompetitionIDs: Array<string> = map(
      (competition: Competition) => competition.ID,
      testCompetitions,
    );
    const testCompetitionStates: Array<Tournament> = await flowAsync(
      map(partial(createTournament, [testScheduler])),
    )(testCompetitions);

    const expectedCompetitionStatesObjects: Record<string, Tournament> =
      zipObject(testCompetitionIDs, testCompetitionStates);
    const actualSerializedCompetitionStates: Record<
      string,
      [TournamentValues, StandingsValues[]]
    > = await serializeCompetitionStates(testCompetitionStates);
    const actualCompetitionStatesObjects: Record<string, Tournament> =
      await flowAsync(
        mapValues(
          async ([actualTournamentValues]: [
            TournamentValues,
            StandingsValues,
          ]) =>
            await loadCompetitionState(testScheduler, actualTournamentValues),
        ),
      )(actualSerializedCompetitionStates);
    expect(actualCompetitionStatesObjects).toStrictEqual(
      expectedCompetitionStatesObjects,
    );
  });
});
