import { describe, expect, assert } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  MatchResult,
  ClubMatchResult,
  PlayerMatchLogs,
  MatchLog,
} from "../Types";
import { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";
import {
  DEFAULTCLUBSPERDOMESTICLEAGUE,
} from "../Constants";
import {
  pipe,
  multiply,
  over,
  map,
  property,
  sum,
  zipAll,
  identity,
  reverse,
  mapValues
} from "lodash/fp";
import { zipApply, divideByTwo } from "../Transformers";
import {
  assertNumbers,
  assertIntegerInRangeInclusive,
  assertIntegerInRangeExclusive,
  assertIntegerPairsAreEqual,
  pairIntegersAndAssertEqual,  
  assertIsArrayOfPlayerMatchLogs,
  assertIsArrayOfClubMatchLogs,
  assertIsMatchLog,
  assertIsHomeClubMatchWinResultObject,
  assertIsAwayClubMatchWinResultObject,
  assertIsHomeClubMatchLossResultObject,
  assertIsAwayClubMatchLossResultObject,
  assertIsHomeClubMatchDrawResultObject,
  assertIsAwayClubMatchDrawResultObject,
} from "../Asserters";
import {
  fastCheckGetTwoRandomClubNumbers,
  fastCheckCreateTestHomeWinResult,
  fastCheckCreateTestAwayWinResult,
  fastCheckCreateTestDrawResult,
  fastCheckCreateRandomMatchResult,
  fastCheckRandomItemFromArrayWithIndex,
  fastCheckCreateTestPlayerMatchLog,
  fastCheckCreateTestPlayerMatchLogs,
  fastCheckCreateTestMatchLog,
  fastCheckGetAllPlayersOfTwoRandomClubs,
  fastCheckCreateTestListOfRandomMatchLogs,
  fastCheckRandomSeason,
  fastCheckGenerateRandomBaseCountries,
  fastCheckTestCompletelyRandomBaseDomesticLeaguePath,
  fastCheckCreateTestListOfMatchLogsForLeague,
  fastCheckRandomItemFromArray
} from "../TestDataGenerators";

describe("Matches", async() => {

  const assertGoalsMatch = pipe([
    map(over([property("Goals For"), property("Goals Against")])),
    zipApply([identity, reverse]),
    zipAll, 
    assertIntegerPairsAreEqual
  ])

  describe("fastCheckCreateTestMatchResult", async() => {
      test.prop([fc.gen()])("fastCheckCreateTestHomeWinResult", (fcGen) => {
        const [actualHomeClubResult, actualAwayClubResult]: [
          ClubMatchResult,
          ClubMatchResult,
        ] = fastCheckCreateTestHomeWinResult(fcGen);

        assertIsHomeClubMatchWinResultObject(actualHomeClubResult);
        assertIsAwayClubMatchLossResultObject(actualAwayClubResult);

	assertGoalsMatch([actualHomeClubResult, actualAwayClubResult])
        expect(property("Goals For", actualHomeClubResult)).toBeGreaterThan(
	  property("Goals For", actualAwayClubResult)
        );
      });

      test.prop([fc.gen()])("fastCheckCreateTestAwayWinResult", (fcGen) => {
        const [actualHomeClubResult, actualAwayClubResult]: [
          ClubMatchResult,
          ClubMatchResult,
        ] = fastCheckCreateTestAwayWinResult(fcGen);

        assertIsHomeClubMatchLossResultObject(actualHomeClubResult);
        assertIsAwayClubMatchWinResultObject(actualAwayClubResult);
	
	assertGoalsMatch([actualHomeClubResult, actualAwayClubResult])
	expect(property("Goals For", actualAwayClubResult)).toBeGreaterThan(
	  property("Goals For", actualHomeClubResult)
        );

      });

      test.prop([fc.gen()])("fastCheckCreateTestDrawResult", (fcGen) => {
        const [actualHomeClubResult, actualAwayClubResult]: [
          ClubMatchResult,
          ClubMatchResult,
        ] = fastCheckCreateTestDrawResult(fcGen);

        assertIsHomeClubMatchDrawResultObject(actualHomeClubResult);
        assertIsAwayClubMatchDrawResultObject(actualAwayClubResult);

	assertGoalsMatch([actualHomeClubResult, actualAwayClubResult])
	expect(property("Goals For", actualAwayClubResult)).toEqual(
	  property("Goals For", actualHomeClubResult)
        );
	
      });

    test.prop([fc.gen()])("fastCheckCreateRandomMatchResult", (fcGen) => {
        const [actualHomeClubResult, actualAwayClubResult]: [
          MatchResult,
          MatchResult,
        ] = fastCheckCreateRandomMatchResult(fcGen);

        const expectedHomeClubResult = {
          Home: 1,
          Wins: expect.any(Number),
          Losses: expect.any(Number),
          Draws: expect.any(Number),
          "Goals For": expect.any(Number),
          "Goals Against": expect.any(Number),
          Points: expect.any(Number),
        };

        const expectedAwayClubResult = {
          Home: 0,
          Wins: expect.any(Number),
          Losses: expect.any(Number),
          Draws: expect.any(Number),
          "Goals For": expect.any(Number),
          "Goals Against": expect.any(Number),
          Points: expect.any(Number),
        };

        expect(actualHomeClubResult).toStrictEqual(expectedHomeClubResult);
        expect(actualAwayClubResult).toStrictEqual(expectedAwayClubResult);
      });
    });

    describe("MatchLogs", () => {
      test.prop([fc.gen()])("fastCheckCreateTestPlayerMatchLog", (fcGen) => {
        const [testHomePlayers, testAwayPlayers] =
          fastCheckGetAllPlayersOfTwoRandomClubs(fcGen);
        const [testHomeClubResult, testAwayClubResult]: [
          ClubMatchResult,
          ClubMatchResult,
        ] = fastCheckCreateRandomMatchResult(fcGen);

        const [
          [testRandomHomePlayerNumber, testRandomHomePlayerIndex],
          [testRandomAwayPlayerNumber, testRandomAwayPlayerIndex],
        ]: [[number, number], [number, number]] = map(
          fastCheckRandomItemFromArrayWithIndex(fcGen),
        )([testHomePlayers, testAwayPlayers]) as [
          [number, number],
          [number, number],
        ];

        const [[, actualHomeClubPlayerStats]] =
          fastCheckCreateTestPlayerMatchLog(
            testRandomHomePlayerIndex,
            testRandomHomePlayerNumber,
          )(testHomeClubResult);
        const [[, actualAwayClubPlayerStats]] =
          fastCheckCreateTestPlayerMatchLog(
            testRandomAwayPlayerIndex,
            testRandomAwayPlayerNumber,
          )(testAwayClubResult);

        assertIsArrayOfPlayerMatchLogs([
          actualHomeClubPlayerStats,
          actualAwayClubPlayerStats,
        ]);

        pairIntegersAndAssertEqual([
          actualHomeClubPlayerStats.Wins,
          testHomeClubResult.Wins,
          actualHomeClubPlayerStats.Draws,
          testHomeClubResult.Draws,
          actualHomeClubPlayerStats.Losses,
          testHomeClubResult.Losses,
        ]);

        pairIntegersAndAssertEqual([
          actualAwayClubPlayerStats.Wins,
          testAwayClubResult.Wins,
          actualAwayClubPlayerStats.Draws,
          testAwayClubResult.Draws,
          actualAwayClubPlayerStats.Losses,
          testAwayClubResult.Losses,
        ]);

        assertIntegerInRangeInclusive(
          [0, property("Goals For", testHomeClubResult)],
          actualHomeClubPlayerStats.Goals,
        );
        assertIntegerInRangeInclusive(
          [0, property("Goals For", testAwayClubResult)],
          actualAwayClubPlayerStats.Goals,
        );
      });

      test.prop([fc.gen()])("fastCheckCreateTestPlayerMatchLogs", (fcGen) => {
        const [[, testHomePlayers], [, testAwayPlayers]] =
          fastCheckGetAllPlayersOfTwoRandomClubs(fcGen);

        const testMatchResult: [ClubMatchResult, ClubMatchResult] =
          fastCheckCreateRandomMatchResult(fcGen);

        const [actualHomeClubPlayerStats, actualAwayClubPlayerStats]: [
          PlayerMatchLogs,
          PlayerMatchLogs,
        ] = fastCheckCreateTestPlayerMatchLogs(
          [testHomePlayers, testAwayPlayers],
          testMatchResult,
        );

        const [expectedHomeGoals, expectedAwayGoals] = map(
          property(["Goals For"]),
        )(testMatchResult);
        const getActualGoals = pipe([
	  Object.values,
          map(property(["Goals"])),	  
          sum,
        ]);

        const actualHomeGoals: number = getActualGoals(
          actualHomeClubPlayerStats,
        );
        const actualAwayGoals: number = getActualGoals(
          actualAwayClubPlayerStats,
        );


        pairIntegersAndAssertEqual([
          actualHomeGoals,
          expectedHomeGoals,
          actualAwayGoals,
          expectedAwayGoals,
        ]);
      });
    });

    test.prop([fc.gen(), fc.integer()])(
      "fastCheckCreateTestMatchLog",
      (fcGen, testIndex) => {
        const testBaseCountries = fastCheckGenerateRandomBaseCountries(fcGen);
        const testDomesticLeaguePath =
          fastCheckTestCompletelyRandomBaseDomesticLeaguePath(
            fcGen,
            testBaseCountries,
          );
        const testSeason = fastCheckRandomSeason(fcGen);
        const [expectedHomeClubNumber, expectedAwayClubNumber] =
          fastCheckGetTwoRandomClubNumbers(fcGen);

        const actualMatchLog: MatchLog = fastCheckCreateTestMatchLog(
          testIndex,
          [expectedHomeClubNumber, expectedAwayClubNumber],
        )([testDomesticLeaguePath, testSeason, fcGen]);

        assertIsMatchLog(actualMatchLog);

      },
    );

    test.prop([fc.gen(), fc.integer({ min: 2, max: 5 })])(
      "fastCheckCreateTestListOfMatchLogsForLeague",
      (fcGen, testMatchWeeksCount) => {
        const testBaseCountries = fastCheckGenerateRandomBaseCountries(fcGen);
        const testDomesticLeaguePath =
          fastCheckTestCompletelyRandomBaseDomesticLeaguePath(
            fcGen,
            testBaseCountries,
          );
        const testSeason = fastCheckRandomSeason(fcGen);
        const testMatchLogs: ReadonlyNonEmptyArray<MatchLog> =
          fastCheckCreateTestListOfMatchLogsForLeague(
            [testDomesticLeaguePath, testMatchWeeksCount, testSeason],
            fcGen,
          );
        const expectedLength: number = pipe([
          multiply(DEFAULTCLUBSPERDOMESTICLEAGUE),
          divideByTwo,
        ])(testMatchWeeksCount);
        assert.lengthOf(testMatchLogs, expectedLength);
        const actualRandomMatchLog: MatchLog = fastCheckRandomItemFromArray(
          fcGen,
          testMatchLogs,
        );
        assertIsMatchLog(actualRandomMatchLog);
        assertIntegerInRangeInclusive(
          [0, testMatchWeeksCount],
          actualRandomMatchLog.MatchWeek,
        );
      },
    );

    test.prop([fc.gen()])(
      "fastCheckCreateTestListOfRandomMatchLogs",
      (fcGen) => {
        const testBaseCountries = fastCheckGenerateRandomBaseCountries(fcGen);
        const [actualMatchLogs, actualMatchWeeksCount, actualDomesticLeaguePath]: [ReadonlyNonEmptyArray<MatchLog>, number, [number, number]] =
          fastCheckCreateTestListOfRandomMatchLogs(testBaseCountries, fcGen);
        expect(actualMatchWeeksCount).toBeGreaterThan(1)
	assertNumbers(actualDomesticLeaguePath)
        const actualRandomMatchLog: MatchLog = fastCheckRandomItemFromArray(
          fcGen,
          actualMatchLogs,
        );

        assertIsMatchLog(actualRandomMatchLog);
      },
    );
  });


