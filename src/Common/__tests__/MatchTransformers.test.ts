import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  over,
  map,
  sum,
  last,
  pipe,
  zipAll,
  min,
  flatten,
  max,
  mean,
  at,
} from "lodash/fp";
import fastCartesian from "fast-cartesian";
import { PLAYERSKILLSPHYSICALCONTRACTINDICES } from "../Types";
import { POSSIBLEGOALS } from "../Constants";
import {
  generateTestStartingEleven,
  generateTwoTestStartingElevens,
  generateTwoTestStartingElevenTuples,
} from "../TestDataGenerationUtilities";
import { getSumOfFlattenedArray, getCountOfObjectValues } from "../Getters";
import {
  calculateMeanCategoryStrengthForPlayer,
  convertArrayOfIntegersIntoArrayOfStrings,
  calculateMeanCategoryStrengthForGroupOfPlayers,
  calculateDefenseStrength,
  calculateAttackStrength,
  calculateClubStrengths,
  calculateHomeStrength,
  calculateAwayStrength,
  calculateMatchStrengths,
  weibullCDFGoalsList,
  weibullCDFGoals,
  calculateJointProbability,
  createJointProbabilitiesMatrixForGoals,
  convertObjectKeysIntoSet,
  assignRandomScorer,
  generateMatchGoals,
} from "../Transformers";

describe("MatchTranformers test suite", () => {
  const COUNTOFPLAYERSKILLS = getCountOfObjectValues(
    PLAYERSKILLSPHYSICALCONTRACTINDICES,
  );
  test.prop(
    [
      fc
        .uniqueArray(fc.integer({ min: 0, max: COUNTOFPLAYERSKILLS }), {
          minLength: 5,
          maxLength: 25,
        })
        .chain((nums: Array<number>) => {
          return fc.constant(convertArrayOfIntegersIntoArrayOfStrings(nums));
        }),
      fc.tuple(
        fc.string(),
        fc.array(fc.nat({ max: 100 }), { minLength: 21, maxLength: 21 }),
      ),
    ],
    { numRuns: 0 },
  )("calculateMeanCategoryStrengthForPlayer", (testSkills, testPlayer) => {
    const testCalculateMeanCategoryStrengthForPlayer =
      calculateMeanCategoryStrengthForPlayer(testSkills);

    const actualMeanCategoryStrength: number =
      testCalculateMeanCategoryStrengthForPlayer(testPlayer);

    const [expectedMin, expectedMax] = pipe([last, over([min, max])])(
      testPlayer,
    );
    expect(actualMeanCategoryStrength).toBeGreaterThanOrEqual(expectedMin);
    expect(actualMeanCategoryStrength).toBeLessThanOrEqual(expectedMax);
  });

  test.prop(
    [
      fc
        .uniqueArray(fc.integer({ min: 0, max: COUNTOFPLAYERSKILLS }), {
          minLength: 5,
          maxLength: 25,
        })
        .chain((nums: Array<number>) => {
          return fc.constant(convertArrayOfIntegersIntoArrayOfStrings(nums));
        }),
      fc.array(
        fc.tuple(
          fc.string(),
          fc.array(fc.nat({ max: 100 }), { minLength: 21, maxLength: 21 }),
        ),
        { minLength: 11, maxLength: 11 },
      ),
    ],
    { numRuns: 0 },
  )(
    "calculateMeanCategoryStrengthForGroupOfPlayers",
    (testSkills, testPlayers) => {
      const testCalculateMeanCategoryStrength =
        calculateMeanCategoryStrengthForGroupOfPlayers(testSkills);
      const actualMeanCategoryStrength: number =
        testCalculateMeanCategoryStrength(testPlayers);
      const meanCalculator = pipe([at(testSkills), mean]);
      const [expectedMin, expectedMax] = pipe([
        map(last),
        map(meanCalculator),
        over([min, max]),
      ])(testPlayers);
      expect(actualMeanCategoryStrength).toBeGreaterThanOrEqual(expectedMin);
      expect(actualMeanCategoryStrength).toBeLessThanOrEqual(expectedMax);
    },
  );

  test.prop([fc.gen()], { numRuns: 0 })("calculateDefenseStrength", (fcGen) => {
    const testPlayers: Record<
      string,
      Array<number>
    > = generateTestStartingEleven(fcGen);
    const actualDefenseStrength: number = calculateDefenseStrength(testPlayers);
    expect(actualDefenseStrength).toBeGreaterThan(0);
    expect(actualDefenseStrength).toBeLessThan(100);
  });

  test.prop([fc.gen()], { numRuns: 0 })("calculateAttackStrength", (fcGen) => {
    const testPlayers: Record<
      string,
      Array<number>
    > = generateTestStartingEleven(fcGen);
    const actualAttackStrength: number = calculateAttackStrength(testPlayers);
    expect(actualAttackStrength).toBeGreaterThan(0);
    expect(actualAttackStrength).toBeLessThan(100);
  });

  test.prop([fc.gen()], { numRuns: 0 })("calculateClubStrength", (fcGen) => {
    const testPlayers: Record<
      string,
      Array<number>
    > = generateTestStartingEleven(fcGen);
    const actualStrengths: Array<number> = calculateClubStrengths(testPlayers);
    expect(actualStrengths.length).toEqual(2);
    map((actualStrength: number) => {
      expect(actualStrength).toBeGreaterThan(0);
      expect(actualStrength).toBeLessThan(100);
    })(actualStrengths);
  });

  test.prop(
    [
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
    ],
    { numRuns: 0 },
  )("calculateHomeStrength", (testHomeAttackAndAwayDefense) => {
    const actualHomeStrength: number = calculateHomeStrength(
      testHomeAttackAndAwayDefense,
    );
    expect(actualHomeStrength).toBeGreaterThan(0);
    expect(actualHomeStrength).toBeLessThan(1);
  });

  test.prop(
    [
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
    ],
    { numRuns: 0 },
  )("calculateAwayStrength", (testAwayAttackAndHomeDefense) => {
    const actualAwayStrength: number = calculateAwayStrength(
      testAwayAttackAndHomeDefense,
    );
    expect(actualAwayStrength).toBeGreaterThan(0);
    expect(actualAwayStrength).toBeLessThan(1);
  });

  test.prop([fc.tuple(fc.gen(), fc.gen())], { numRuns: 0 })(
    "calculateMatchStrengths",
    (fcGens) => {
      const testStartingElevens = generateTwoTestStartingElevens(fcGens);

      const actualStrengths: [number, number] =
        calculateMatchStrengths(testStartingElevens);

      expect(actualStrengths.length).toBe(2);
      const [actualHomeStrength, actualAwayStrength] = actualStrengths;

      expect(actualHomeStrength).not.toEqual(actualAwayStrength);

      map((actualStrength: number) => {
        expect(actualStrength).toBeGreaterThan(0);
        expect(actualStrength).toBeLessThan(1);
      })(actualStrengths);
    },
  );

  test.prop(
    [
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
    ],
    { numRuns: 0 },
  )("weibullCDFGoals", (testShape, testClubStrength, testGoals) => {
    const testWeibullCDFGoals = weibullCDFGoals(testShape);
    const actualCDF: number = testWeibullCDFGoals(testClubStrength, testGoals);

    expect(actualCDF).toBeGreaterThan(0);
    expect(actualCDF).toBeLessThan(1);
  });

  test.prop(
    [
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
    ],
    { numRuns: 0 },
  )("weibullCDFGoalsList", (testClubStrength) => {
    const actualCDFGoalsList: Array<number> =
      weibullCDFGoalsList(testClubStrength);
    expect(actualCDFGoalsList.length).toEqual(POSSIBLEGOALS.length);
  });

  test.prop(
    [
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
    ],
    { numRuns: 0 },
  )("calculateJointProbability", (testTheta, testProbabilities) => {
    const testCalculateJointProbability = calculateJointProbability(testTheta);
    const actualJointProbability: number =
      testCalculateJointProbability(testProbabilities);
    expect(actualJointProbability).toBeGreaterThan(0);
    expect(actualJointProbability).toBeLessThan(1);
  });

  test.prop([fc.tuple(fc.gen(), fc.gen())], { numRuns: 0 })(
    "createJointProbabilitiesMatrixForGoals",
    (fcGens) => {
      const getTestWeibullCDFGoalsList = pipe([
        generateTwoTestStartingElevens,
        calculateMatchStrengths,
        map(weibullCDFGoalsList),
      ]);
      const testWeibullCDFGoalsList: [Array<number>, Array<number>] =
        getTestWeibullCDFGoalsList(fcGens);

      const actualProbabilitiesGoalsTuples: Array<[number, [number, number]]> =
        createJointProbabilitiesMatrixForGoals(testWeibullCDFGoalsList);

      const [actualProbabilities, actualScores]: [
        Array<number>,
        Array<[number, number]>,
      ] = zipAll(actualProbabilitiesGoalsTuples);
      const expectedPossibleScores: Array<[number, number]> = fastCartesian([
        POSSIBLEGOALS,
        POSSIBLEGOALS,
      ]);

      const [actualSum, expectedSum] = map(getSumOfFlattenedArray)([
        expectedPossibleScores,
        actualScores,
      ]);

      expect(actualSum).toEqual(expectedSum);
    },
  );

  test.prop([fc.tuple(fc.gen(), fc.gen())], { numRuns: 0 })(
    "generateMatchGoals",
    (fcGens) => {
      const testStartingElevens: Array<
        [number, Record<string, Array<number>>]
      > = generateTwoTestStartingElevenTuples(fcGens);

      const actualTuples: [
        [Record<string, Array<number>>, Record<string, Array<number>>],
        [number, number],
      ] = generateMatchGoals(testStartingElevens);

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

  test.prop([fc.gen()], { numRuns: 0 })("assignRandomScorer", (fcGen) => {
    const testPlayers: Record<
      string,
      Array<number>
    > = generateTestStartingEleven(fcGen);
    const expectedPlayerSets: Set<string> =
      convertObjectKeysIntoSet(testPlayers);
    const actualScorer: string = assignRandomScorer(testPlayers);
    expect(expectedPlayerSets.has(actualScorer)).toBeTruthy();
  });

  test.prop([fc.tuple(fc.gen(), fc.gen())], { numRuns: 0 })(
    "generateMatchScorers",
    (fcGens) => {
      const testStartingElevensAndMatchResult: [
        [Record<string, Array<number>>, Record<string, Array<number>>],
        [number, number],
      ] = pipe([generateTwoTestStartingElevenTuples, generateMatchGoals])(
        fcGens,
      );
      const actualMatchStatisticsAndScore: [
        [Record<string, Array<number>>, Record<string, Array<number>>],
        [number, number],
      ] = generateMatchScorers(testStartingElevensAndMatchResult);

      const actualZippedStatsAndScoreTuples = zipAll(
        actualMatchStatisticsAndScore,
      );

      map(
        ([actualStats, actualScore]: [
          Record<string, Array<number>>,
          number,
        ]) => {
          const actualSumOfStats: number = pipe([Object.values, flatten, sum])(
            actualStats,
          );
          expect(actualSumOfStats).toEqual(actualScore);
        },
      )(actualZippedStatsAndScoreTuples);
    },
  );
});
