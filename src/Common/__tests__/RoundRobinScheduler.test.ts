import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { flowAsync } from "futil-js";
import { range, rangeStep, map, flatten, size, sum } from "lodash/fp";
import { convertToSet } from "../CommonUtilities";
import {
  roundRobinScheduler,
  totalRoundRobinMatches,
  totalRoundRobinRounds,
  matchesPerRoundOfRoundRobin,
  firstWeekOfRoundRobinWithEvenNumberClubs,
  everyWeekAfterFirstWeekofRoundRobin,
  doubleRoundRobinScheduler,
  totalDoubleRoundRobinRounds,
  totalDoubleRoundRobinMatches,
} from "../RoundRobinScheduler";

describe("RoundRobinScheduler tests", async () => {
  test.prop([fc.constantFrom(...rangeStep(2, 18, 100))])(
    "matchesPerRoundOfRoundRobin",
    async (testClubsCount) => {
      const actualMatchesPerRound: number =
        matchesPerRoundOfRoundRobin(testClubsCount);
      expect(actualMatchesPerRound).toEqual(testClubsCount / 2);
    },
  );

  test.prop([fc.constantFrom(...rangeStep(2, 18, 100))])(
    "firstWeekOfRoundRobinWithEvenNumberClubs",
    async (testClubsCount) => {
      const [actualClubsCount, actualMatches]: [
        number,
        Array<[number, number]>,
      ] = firstWeekOfRoundRobinWithEvenNumberClubs(testClubsCount);
      expect(actualClubsCount).toEqual(testClubsCount);
      const actualSum: number = flowAsync(flatten, sum)(actualMatches);
      const expectedSum: number = flowAsync(range(0), sum)(testClubsCount);
      expect(actualSum).toEqual(expectedSum);
    },
  );

  test.prop([fc.constantFrom(...rangeStep(2, 18, 100))])(
    "everyWeekAfterFirstWeekofRoundRobin",
    async (testClubsCount) => {
      const testClubsCountAndFirstRound: [number, Array<[number, number]>] =
        firstWeekOfRoundRobinWithEvenNumberClubs(testClubsCount);
      const actualFullSchedule: Array<Array<[number, number]>> =
        everyWeekAfterFirstWeekofRoundRobin(testClubsCountAndFirstRound);

      const actualRoundsSet = new Set(actualFullSchedule);
      const expectedRounds = totalRoundRobinRounds(testClubsCount);
      expect(actualRoundsSet.size).toEqual(expectedRounds);

      const actualMatchupsSet = flowAsync(
        flatten,
        convertToSet,
      )(actualFullSchedule);
      const expectedTotalMatches = totalRoundRobinMatches(testClubsCount);
      expect(actualMatchupsSet.size).toEqual(expectedTotalMatches);

      map((actualMatches) => {
        const actualSum: number = flowAsync(flatten, sum)(actualMatches);
        const expectedSum: number = flowAsync(range(0), sum)(testClubsCount);
        expect(actualSum).toEqual(expectedSum);
      })(actualFullSchedule);
    },
  );

  test.prop([fc.constantFrom(...rangeStep(2, 18, 100))])(
    "roundRobinScheduler",
    async (testClubsCount) => {
      const actualSchedule: Array<Array<[number, number]>> =
        roundRobinScheduler(testClubsCount);
      const expectedRounds: number = totalRoundRobinRounds(testClubsCount);
      expect(actualSchedule.length).toEqual(expectedRounds);
      const expectedMatchesCount: number =
        totalRoundRobinMatches(testClubsCount);
      const actualMatchesCount: number = flowAsync(
        flatten,
        size,
      )(actualSchedule);
      expect(actualMatchesCount).toEqual(expectedMatchesCount);
    },
  );

  test.prop([fc.constantFrom(...rangeStep(2, 18, 100))])(
    "doubleRoundRobinScheduler",
    async (testClubsCount) => {
      const actualSchedule: Array<Array<[number, number]>> =
        doubleRoundRobinScheduler(testClubsCount);
      const expectedRounds: number =
        totalDoubleRoundRobinRounds(testClubsCount);
      expect(actualSchedule.length).toEqual(expectedRounds);

      const expectedMatchesCount: number =
        totalDoubleRoundRobinMatches(testClubsCount);
      const actualMatchesSet: Set<[number, number]> = flowAsync(
        flatten,
        convertToSet,
      )(actualSchedule);
      expect(actualMatchesSet.size).toEqual(expectedMatchesCount);
    },
  );
});
