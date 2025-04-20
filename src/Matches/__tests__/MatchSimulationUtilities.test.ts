import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import fastCartesian from "fast-cartesian";
import {
  map,
  over,
  at,
  mean,
  min,
  max,
  sum,
  zipAll,
  last,
  flatten,
  size,
} from "lodash/fp";
import { flowAsync } from "futil-js";
import {
  PositionGroup,
  PLAYERSKILLSANDPHYSICALDATAKEYS,
} from "../../Players/PlayerTypes";
import { PlayerMatchStatisticsArrayIndices } from "../MatchTypes";
import { POSSIBLEGOALS } from "../MatchConstants";
import { getSumOfFlattenedList } from "../../Common/Arithmetic"
import {
  convertObjectKeysIntoSet,
  convertListOfIntegersIntoListOfStrings,
} from "../../Common/Transformers";
import {
  calculateMeanCategoryStrengthForPlayer,
  calculateMeanCategoryStrengthForGroupOfPlayers,
  calculateDefenseStrength,
  calculateAttackStrength,
  calculateAwayStrength,
  calculateHomeStrength,
  weibullCDFGoals,
  weibullCDFGoalsList,
  calculateJointProbability,
  createJointProbabilitiesMatrixForGoals,
  calculateClubStrengths,
  calculateMatchStrengths,
  generateMatchGoals,
  generateMatchScorers,
  assignRandomScorer,
} from "../MatchSimulationUtilities";

describe("MatchSimulationUtilities test suite", async () => {
  test.prop([
    fc
      .uniqueArray(fc.integer({ min: 0, max: COUNTOFPLAYERSKILLS }), {
        minLength: 5,
        maxLength: 25,
      })
      .chain((nums: Array<number>) => {
        return fc.constant(convertListOfIntegersIntoListOfStrings(nums));
      }),
    fc.tuple(
      fc.string(),
      fc.array(fc.nat({ max: 100 }), { minLength: 21, maxLength: 21 }),
    ),
  ])(
    "calculateMeanCategoryStrengthForPlayer",
    async (testSkills, testPlayer) => {
      const testCalculateMeanCategoryStrengthForPlayer =
        calculateMeanCategoryStrengthForPlayer(testSkills);

      const actualMeanCategoryStrength: number =
        testCalculateMeanCategoryStrengthForPlayer(testPlayer);

      const [expectedMin, expectedMax] = flowAsync(
        last,
        over([min, max]),
      )(testPlayer);
      expect(actualMeanCategoryStrength).toBeGreaterThanOrEqual(expectedMin);
      expect(actualMeanCategoryStrength).toBeLessThanOrEqual(expectedMax);
    },
  );

  test.prop([
    fc
      .uniqueArray(fc.integer({ min: 0, max: COUNTOFPLAYERSKILLS }), {
        minLength: 5,
        maxLength: 25,
      })
      .chain((nums: Array<number>) => {
        return fc.constant(convertListOfIntegersIntoListOfStrings(nums));
      }),
    fc.array(
      fc.tuple(
        fc.string(),
        fc.array(fc.nat({ max: 100 }), { minLength: 21, maxLength: 21 }),
      ),
      { minLength: 11, maxLength: 11 },
    ),
  ])(
    "calculateMeanCategoryStrengthForGroupOfPlayers",
    async (testSkills, testPlayers) => {
      const testCalculateMeanCategoryStrength =
        calculateMeanCategoryStrengthForGroupOfPlayers(testSkills);
      const actualMeanCategoryStrength: number =
        testCalculateMeanCategoryStrength(testPlayers);
      const meanCalculator = flowAsync(at(testSkills), mean);
      const [expectedMin, expectedMax] = flowAsync(
        map(last),
        map(meanCalculator),
        over([min, max]),
      )(testPlayers);
      expect(actualMeanCategoryStrength).toBeGreaterThanOrEqual(expectedMin);
      expect(actualMeanCategoryStrength).toBeLessThanOrEqual(expectedMax);
    },
  );

  test.prop([fc.gen()])("calculateDefenseStrength", async (fcGen) => {
    const testPlayers: Record<
      string,
      Array<number>
    > = await generateTestStartingEleven(fcGen);
    const actualDefenseStrength: number =
      await calculateDefenseStrength(testPlayers);
    expect(actualDefenseStrength).toBeGreaterThan(0);
    expect(actualDefenseStrength).toBeLessThan(100);
  });

  test.prop([fc.gen()])("calculateAttackStrength", async (fcGen) => {
    const testPlayers: Record<
      string,
      Array<number>
    > = await generateTestStartingEleven(fcGen);
    const actualAttackStrength: number =
      await calculateAttackStrength(testPlayers);
    expect(actualAttackStrength).toBeGreaterThan(0);
    expect(actualAttackStrength).toBeLessThan(100);
  });

  test.prop([fc.gen()])("calculateClubStrength", async (fcGen) => {
    const testPlayers: Record<
      string,
      Array<number>
    > = await generateTestStartingEleven(fcGen);
    const actualStrengths: Array<number> =
      await calculateClubStrengths(testPlayers);
    expect(actualStrengths.length).toEqual(2);
    map((actualStrength: number) => {
      expect(actualStrength).toBeGreaterThan(0);
      expect(actualStrength).toBeLessThan(100);
    })(actualStrengths);
  });

  test.prop([
    fc.tuple(
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
    ),
  ])("calculateHomeStrength", async (testHomeAttackAndAwayDefense) => {
    const actualHomeStrength: number = calculateHomeStrength(
      testHomeAttackAndAwayDefense,
    );
    expect(actualHomeStrength).toBeGreaterThan(0);
    expect(actualHomeStrength).toBeLessThan(1);
  });

  test.prop([
    fc.tuple(
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
    ),
  ])("calculateAwayStrength", async (testAwayAttackAndHomeDefense) => {
    const actualAwayStrength: number = calculateAwayStrength(
      testAwayAttackAndHomeDefense,
    );
    expect(actualAwayStrength).toBeGreaterThan(0);
    expect(actualAwayStrength).toBeLessThan(1);
  });

  test.prop([fc.tuple(fc.gen(), fc.gen())])(
    "calculateMatchStrengths",
    async (fcGens) => {
      const testStartingElevens = await generateTwoTestStartingElevens(fcGens);

      const actualStrengths: [number, number] =
        await calculateMatchStrengths(testStartingElevens);

      expect(actualStrengths.length).toBe(2);
      const [actualHomeStrength, actualAwayStrength] = actualStrengths;

      expect(actualHomeStrength).not.toEqual(actualAwayStrength);

      map((actualStrength: number) => {
        expect(actualStrength).toBeGreaterThan(0);
        expect(actualStrength).toBeLessThan(1);
      })(actualStrengths);
    },
  );

  test.prop([
    fc.double({
      noDefaultInfinity: true,
      noNaN: true,
      min: 0.1,
      max: 2,
    }),
    fc.double({
      maxExcluded: true,
      noDefaultInfinity: true,
      noNaN: true,
      min: 0.1,
      max: 1,
    }),
    fc.nat({ max: 5 }),
  ])("weibullCDFGoals", async (testShape, testClubStrength, testGoals) => {
    const testWeibullCDFGoals = weibullCDFGoals(testShape);
    const actualCDF: number = await testWeibullCDFGoals(
      testClubStrength,
      testGoals,
    );

    expect(actualCDF).toBeGreaterThan(0);
    expect(actualCDF).toBeLessThan(1);
  });

  test.prop([
    fc.double({
      maxExcluded: true,
      noDefaultInfinity: true,
      noNaN: true,
      min: 0.1,
      max: 1,
    }),
  ])("weibullCDFGoalsList", async (testClubStrength) => {
    const actualCDFGoalsList: Array<number> =
      await weibullCDFGoalsList(testClubStrength);
    expect(actualCDFGoalsList.length).toEqual(POSSIBLEGOALS.length);
  });

  test.prop([
    fc.double({
      maxExcluded: true,
      noDefaultInfinity: true,
      noNaN: true,
      min: 0.1,
      max: 1,
    }),
    fc.tuple(
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
    ),
  ])("calculateJointProbability", async (testTheta, testProbabilities) => {
    const testCalculateJointProbability = calculateJointProbability(testTheta);
    const actualJointProbability: number =
      await testCalculateJointProbability(testProbabilities);
    expect(actualJointProbability).toBeGreaterThan(0);
    expect(actualJointProbability).toBeLessThan(1);
  });

  test.prop([fc.tuple(fc.gen(), fc.gen())])(
    "createJointProbabilitiesMatrixForGoals",
    async (fcGens) => {
      const getTestWeibullCDFGoalsList = flowAsync(
        generateTwoTestStartingElevens,
        calculateMatchStrengths,
        flowAsync(map(weibullCDFGoalsList)),
      );
      const testWeibullCDFGoalsList: [Array<number>, Array<number>] =
        await getTestWeibullCDFGoalsList(fcGens);

      const actualProbabilitiesGoalsTuples: Array<[number, [number, number]]> =
        await createJointProbabilitiesMatrixForGoals(testWeibullCDFGoalsList);

      const [actualProbabilities, actualScores]: [
        Array<number>,
        Array<[number, number]>,
      ] = zipAll(actualProbabilitiesGoalsTuples);
      const expectedPossibleScores: Array<[number, number]> = fastCartesian([
        POSSIBLEGOALS,
        POSSIBLEGOALS,
      ]);

      const [actualSum, expectedSum] = map(getSumOfFlattenedList)([
        expectedPossibleScores,
        actualScores,
      ]);

      expect(actualSum).toEqual(expectedSum);
    },
  );

  test.prop([fc.tuple(fc.gen(), fc.gen())])(
    "generateMatchGoals",
    async (fcGens) => {
      const testStartingElevens: Array<
        [number, Record<string, Array<number>>]
      > = await generateTwoTestStartingElevenTuples(fcGens);

      const actualTuples: [
        [Record<string, Array<number>>, Record<string, Array<number>>],
        [number, number],
      ] = await generateMatchGoals(testStartingElevens);

      const [, [actualHomeGoals, actualAwayGoals]] = actualTuples;
      const [expectedMin, expectedMax]: [number, number] = over([min, max])(
        POSSIBLEGOALS,
      ) as [number, number];

      map((actualGoalsScored: number) => {
        expect(actualGoalsScored).toBeGreaterThanOrEqual(expectedMin);
        expect(actualGoalsScored).toBeLessThanOrEqual(expectedMax);
      })([actualHomeGoals, actualAwayGoals]);
    },
  );

  test.prop([fc.gen()])("assignRandomScorer", async (fcGen) => {
    const testPlayers: Record<
      string,
      Array<number>
    > = await generateTestStartingEleven(fcGen);
    const expectedPlayerSets: Set<string> =
      convertObjectKeysIntoSet(testPlayers);
    const actualScorer: string = assignRandomScorer(testPlayers);
    expect(expectedPlayerSets.has(actualScorer)).toBeTruthy();
  });

  test.prop([fc.tuple(fc.gen(), fc.gen())], { numRuns: 0 })(
    "generateMatchScorers",
    async (fcGens) => {
      const testStartingElevensAndMatchResult: [
        [Record<string, Array<number>>, Record<string, Array<number>>],
        [number, number],
      ] = await flowAsync(
        generateTwoTestStartingElevenTuples,
        generateMatchGoals,
      )(fcGens);
      const actualMatchStatisticsAndScore: [
        [Record<string, Array<number>>, Record<string, Array<number>>],
        [number, number],
      ] = await generateMatchScorers(testStartingElevensAndMatchResult);

      const actualZippedStatsAndScoreTuples = zipAll(
        actualMatchStatisticsAndScore,
      );

      map(
        ([actualStats, actualScore]: [
          Record<string, Array<number>>,
          number,
        ]) => {
          const actualSumOfStats: number = flowAsync(
            Object.values,
            flatten,
            sum,
          )(actualStats);
          expect(actualSumOfStats).toEqual(actualScore);
        },
      )(actualZippedStatsAndScoreTuples);
    },
  );
});
