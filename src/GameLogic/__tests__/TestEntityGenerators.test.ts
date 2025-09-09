import { describe, expect, assert } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  MatchResult,
  MatchResultsTuple,
  PlayerMatchLogs,
  MatchLog
} from "../Types";
import { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";
import { DEFAULTSQUADSIZE, DEFAULTTOTALCLUBS, DEFAULTTOTALPLAYERS } from "../Constants";
import {
  pipe,
  multiply,
  over,
  identity,
  add,
  map,
  property,
  sum,
  inRange,
  zipAll,
  flatten,
  last
} from "lodash/fp";
import { addOne } from "../Transformers";
import { getCountOfUniqueItemsFromArrayForPredicate } from "../Getters"
import {
  assertIntegerInRangeInclusive,
  assertIntegerInRangeExclusive,
  pairIntegersAndAssertEqual,
  assertIsArrayOfPlayerMatchLogs,
  assertIsArrayOfClubMatchLogs
} from "../Asserters";
import {
  fastCheckTestPlayerNumberAndSeason,
  fastCheckGenerateTestCountriesCount,
  fastCheckTestSeasonAndClubNumber,
  fastCheckRandomClubAndPlayerNumberGenerator,
  fastCheckGenerateAllPlayerNumbersOfRandomClub,
  fastCheckCreateTestHomeWinResult,
  fastCheckCreateTestAwayWinResult,
  fastCheckCreateTestDrawResult,
  fastCheckCreateRandomMatchResult,
  fastCheckRandomItemFromArrayWithIndex,
  fastCheckCreateTestPlayerMatchLog,
  fastCheckCreateTestPlayerMatchLogs,
  fastCheckGetNRandomClubNumbers,
  fastCheckGetAllPlayersOfNRandomClubs,
  fastCheckRandomItemFromArray,  
  fastCheckCreateTestMatchLog,  
  fastCheckGetAllPlayersOfTwoRandomClubs,
  fastCheckCreateTestMatchLogsObject,
  fastCheckRandomSeason,
  fastCheckRandomDomesticLeagueNumber,
  fastCheckRandomNaturalNumberWithMax,
  fastCheckRandomObjectValue
} from "../TestDataGenerators";

describe("TestEntityGenerators", () => {
  test.prop([fc.gen()])("fastCheckGenerateTestCountriesCount", (fcGen) => {
    const actualCountriesCount: number =
      fastCheckGenerateTestCountriesCount(fcGen);
    expect(actualCountriesCount).toBeGreaterThanOrEqual(1);
  });

  describe("entityNumberGenerators", () => {
    test.prop([fc.gen()])("fastCheckTestPlayerNumberAndSeason", (fcGen) => {
      const [actualSeason, actualPlayerNumber] =
        fastCheckTestPlayerNumberAndSeason(fcGen);
      expect(actualSeason).toBeGreaterThanOrEqual(0);
      expect(actualPlayerNumber).toBeGreaterThanOrEqual(0);
    });

    test.prop([fc.gen()])("fastCheckTestSeasonAndClubNumber", (fcGen) => {
      const [actualSeason, actualClubNumber] =
        fastCheckTestSeasonAndClubNumber(fcGen);
      expect(actualSeason).toBeGreaterThanOrEqual(0);
      expect(actualClubNumber).toBeGreaterThanOrEqual(0);
    });

    test.prop([fc.gen()])(
      "fastCheckRandomClubAndPlayerNumberGenerator",
      (fcGen) => {
        const [actualClubNumber, actualPlayerNumber]: Array<number> =
          fastCheckRandomClubAndPlayerNumberGenerator(fcGen);

        const expectedRange: [number, number] = pipe([
          multiply(actualClubNumber),
          over<number>([identity, add(DEFAULTSQUADSIZE)]),
        ])(DEFAULTSQUADSIZE) as [number, number];
        assertIntegerInRangeInclusive(expectedRange, actualPlayerNumber);
      },
    );

    test.prop([fc.gen()])(
    "fastCheckGenerateAllPlayerNumbersOfRandomClub",
    (fcGen) => {
      const actualPlayerNumbers: Array<number> =
        fastCheckGenerateAllPlayerNumbersOfRandomClub(identity, fcGen);
      assert.lengthOf(actualPlayerNumbers, DEFAULTSQUADSIZE);
    },
    );

    test.prop([fc.gen(), fc.integer({min: 1, max: 20})])(
    "fastCheckGetNRandomClubNumbers",
      (fcGen, testCount) => {
	const actualClubNumbers: Array<number> =
              fastCheckGetNRandomClubNumbers(testCount, fcGen)
	const predicate = inRange(0, DEFAULTTOTALCLUBS)
	expect(getCountOfUniqueItemsFromArrayForPredicate(predicate)(actualClubNumbers)).toEqual(testCount)	
    },
    );

    test.prop([fc.gen(), fc.integer({min: 1, max: 10})])(
    "fastCheckGetAllPlayersOfNRandomClubs",
      (fcGen, testCount) => {
	
	const actualClubPlayerNumberTuples: Array<[number, Array<number>]> =
              fastCheckGetAllPlayersOfNRandomClubs(testCount, fcGen)
	const [actualClubNumbers, actualPlayerNumbers]: [Array<number>, Array<Array<number>>] = zipAll(actualClubPlayerNumberTuples) as [Array<number>, Array<Array<number>>]
	assert.lengthOf(actualClubNumbers, testCount)
	const expectedPlayersCount: number = multiply(DEFAULTSQUADSIZE, testCount)
	const predicate = inRange(0, DEFAULTTOTALPLAYERS)
	
	const actualUniquePlayersCount = pipe([flatten, getCountOfUniqueItemsFromArrayForPredicate(predicate)])(actualPlayerNumbers)	
	expect(actualUniquePlayersCount).toEqual(expectedPlayersCount)
	
    },
    );
  });


  describe("Matches", () => {
    describe("fastCheckCreateTestMatchResult", () => {
      test.prop([fc.gen()])("fastCheckCreateTestHomeWinResult", (fcGen) => {
        const [actualHomeClubResult, actualAwayClubResult]: [
          MatchResult,
          MatchResult,
        ] = fastCheckCreateTestHomeWinResult(fcGen);

        const expectedHomeClubResult = {
          Home: true,
          Wins: 1,
          Losses: 0,
          Draws: 0,
          GoalsFor: expect.any(Number),
          GoalsAgainst: expect.any(Number),
        };

        const expectedAwayClubResult = {
          Home: false,
          Wins: 0,
          Losses: 1,
          Draws: 0,
          GoalsFor: expect.any(Number),
          GoalsAgainst: expect.any(Number),
        };

        expect(actualHomeClubResult).toStrictEqual(expectedHomeClubResult);
        expect(actualAwayClubResult).toStrictEqual(expectedAwayClubResult);

        pairIntegersAndAssertEqual([
          actualHomeClubResult.GoalsFor,
          actualAwayClubResult.GoalsAgainst,
          actualHomeClubResult.GoalsAgainst,
          actualAwayClubResult.GoalsFor,
        ]);

        expect(actualHomeClubResult.GoalsFor).toBeGreaterThan(
          actualAwayClubResult.GoalsFor,
        );
      });

      test.prop([fc.gen()])("fastCheckCreateTestAwayWinResult", (fcGen) => {
        const [actualHomeClubResult, actualAwayClubResult]: [
          MatchResult,
          MatchResult,
        ] = fastCheckCreateTestAwayWinResult(fcGen);

        const expectedHomeClubResult = {
          Home: true,
          Wins: 0,
          Losses: 1,
          Draws: 0,
          GoalsFor: expect.any(Number),
          GoalsAgainst: expect.any(Number),
        };

        const expectedAwayClubResult = {
          Home: false,
          Wins: 1,
          Losses: 0,
          Draws: 0,
          GoalsFor: expect.any(Number),
          GoalsAgainst: expect.any(Number),
        };

        expect(actualHomeClubResult).toStrictEqual(expectedHomeClubResult);
        expect(actualAwayClubResult).toStrictEqual(expectedAwayClubResult);

        pairIntegersAndAssertEqual([
          actualHomeClubResult.GoalsFor,
          actualAwayClubResult.GoalsAgainst,
          actualHomeClubResult.GoalsAgainst,
          actualAwayClubResult.GoalsFor,
        ]);

        expect(actualAwayClubResult.GoalsFor).toBeGreaterThan(
          actualHomeClubResult.GoalsFor,
        );
      });

      test.prop([fc.gen()])("fastCheckCreateTestDrawResult", (fcGen) => {
        const [actualHomeClubResult, actualAwayClubResult]: [
          MatchResult,
          MatchResult,
        ] = fastCheckCreateTestDrawResult(fcGen);

        const expectedHomeClubResult = {
          Home: true,
          Wins: 0,
          Losses: 0,
          Draws: 1,
          GoalsFor: expect.any(Number),
          GoalsAgainst: expect.any(Number),
        };

        const expectedAwayClubResult = {
          Home: false,
          Wins: 0,
          Losses: 0,
          Draws: 1,
          GoalsFor: expect.any(Number),
          GoalsAgainst: expect.any(Number),
        };

        expect(actualHomeClubResult).toStrictEqual(expectedHomeClubResult);
        expect(actualAwayClubResult).toStrictEqual(expectedAwayClubResult);

        pairIntegersAndAssertEqual([
          actualHomeClubResult.GoalsFor,
          actualAwayClubResult.GoalsAgainst,
          actualHomeClubResult.GoalsAgainst,
          actualAwayClubResult.GoalsFor,
        ]);

        expect(actualAwayClubResult.GoalsFor).toEqual(
          actualHomeClubResult.GoalsFor,
        );
      });

      test.prop([fc.gen()])("fastCheckCreateRandomMatchResult", (fcGen) => {
        const [actualHomeClubResult, actualAwayClubResult]: [
          MatchResult,
          MatchResult,
        ] = fastCheckCreateRandomMatchResult(fcGen);

        const expectedHomeClubResult = {
          Home: true,
          Wins: expect.any(Number),
          Losses: expect.any(Number),
          Draws: expect.any(Number),
          GoalsFor: expect.any(Number),
          GoalsAgainst: expect.any(Number),
        };

        const expectedAwayClubResult = {
          Home: false,
          Wins: expect.any(Number),
          Losses: expect.any(Number),
          Draws: expect.any(Number),
          GoalsFor: expect.any(Number),
          GoalsAgainst: expect.any(Number),
        };

        expect(actualHomeClubResult).toStrictEqual(expectedHomeClubResult);
        expect(actualAwayClubResult).toStrictEqual(expectedAwayClubResult);
      });
    });

    describe("MatchLogs", () => {
      test.prop([fc.gen()])(
        "fastCheckCreateTestPlayerMatchLog",
        (fcGen) => {

	  const [testHomePlayers, testAwayPlayers] = fastCheckGetAllPlayersOfTwoRandomClubs(fcGen)
	  const [testHomeClubResult, testAwayClubResult]: [
            MatchResult,
            MatchResult,
          ] = fastCheckCreateRandomMatchResult(fcGen);

          const [
            [testRandomHomePlayerNumber, testRandomHomePlayerIndex],
            [testRandomAwayPlayerNumber, testRandomAwayPlayerIndex]
          ]: [[number,number], [number, number]] = map(
            fastCheckRandomItemFromArrayWithIndex(fcGen),
          )([
            testHomePlayers,
            testAwayPlayers,
          ]) as [[number,number], [number, number]];

          const [[, actualHomeClubPlayerStats], actualHomeClubMatchResult] =
		fastCheckCreateTestPlayerMatchLog(
		  testRandomHomePlayerIndex,
              testRandomHomePlayerNumber,
              testHomeClubResult,
            );
          const [[, actualAwayClubPlayerStats], actualAwayClubMatchResult] =
		fastCheckCreateTestPlayerMatchLog(
		  testRandomAwayPlayerIndex,
		  testRandomAwayPlayerNumber,
		  testAwayClubResult,
		);

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

          assertIntegerInRangeExclusive(
            [0, addOne(testHomeClubResult.GoalsFor)],
            actualHomeClubPlayerStats.Goals,
          );
          assertIntegerInRangeExclusive(
            [0, addOne(testAwayClubResult.GoalsFor)],
            actualAwayClubPlayerStats.Goals,
          );
        },
      );
      
      test.prop([fc.gen()])(
        "fastCheckCreateTestPlayerMatchLogs",
        (fcGen) => {

          const [[,testHomePlayers], [,testAwayPlayers]]  =
            fastCheckGetAllPlayersOfTwoRandomClubs(fcGen);

          const testMatchResult: MatchResultsTuple =
		fastCheckCreateRandomMatchResult(fcGen);
	  
          const [
            actualHomeClubPlayerStats,
            actualAwayClubPlayerStats,
          ]: [PlayerMatchLogs, PlayerMatchLogs] = fastCheckCreateTestPlayerMatchLogs(
            [testHomePlayers, testAwayPlayers],
            testMatchResult,
          );


          const [expectedHomeGoals, expectedAwayGoals] = map(
            property(["GoalsFor"]),
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
        },
      );
    });

    test.prop([fc.gen()])(
      "fastCheckCreateTestMatchLog",
      (fcGen) => {

	const testMatchPairing: [[number, ReadonlyNonEmptyArray<number>], [number, ReadonlyNonEmptyArray<number>]] =
              fastCheckGetAllPlayersOfTwoRandomClubs(fcGen) as [[number, ReadonlyNonEmptyArray<number>], [number, ReadonlyNonEmptyArray<number>]];
	
        const actualMatchLog: MatchLog = fastCheckCreateTestMatchLog(
	  testMatchPairing,
          fcGen,	  
        );


	const [
	  testRandomHomePlayerNumber, testRandomAwayPlayerNumber
        ] = map<[number, ReadonlyNonEmptyArray<number>], number>(
            pipe([last, fastCheckRandomItemFromArray(fcGen)])
          )(testMatchPairing)

	const [[expectedHomeClubNumber], [expectedAwayClubNumber]] = testMatchPairing


	assertIsArrayOfClubMatchLogs([
	  property([expectedHomeClubNumber], actualMatchLog),
	  property([expectedAwayClubNumber], actualMatchLog)
        ]);

	
	assertIsArrayOfPlayerMatchLogs([
	  property([expectedHomeClubNumber, "PlayerStatistics", testRandomHomePlayerNumber])(actualMatchLog),
	  property([expectedAwayClubNumber, "PlayerStatistics", testRandomAwayPlayerNumber])(actualMatchLog),
        ]);	
	
        
      },
    );
  })
})
