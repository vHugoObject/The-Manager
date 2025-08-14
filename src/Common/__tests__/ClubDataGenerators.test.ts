import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { pipe, over, identity, property, round } from "lodash/fp";
import { DEFAULTCLUBDATARANGES } from "../Constants";
import {
  assertIntegerInRangeInclusive,
} from "../Asserters";
import {
  fastCheckRandomLeagueLevel,
  fastCheckRandomClubNumberGenerator,
  fastCheckTestLinearRangeWithMinimumGenerator,
  fastCheckRandomItemFromArrayWithIndex,
} from "../TestDataGenerators";
import {
  adjustRangeForDivision,
  generateAttendanceForClubNumber,
  generateFacilitiesCostsForClubNumber,
  generateSponsorPaymentForClubNumber,
  generateTicketPriceForClubNumber,
  generateManagerPayForClubNumber,
  generateScoutingCostsForClubNumber,
  generateHealthCostsForClubNumber,
  generatePlayerDevelopmentCostsForClubNumber,
  generateWageBillToRevenueRatioForClubNumber,
  domesticLeagueLevelRepeaterForClubIDs,
  calculatePreviousSeasonRevenueForClubNumber,
  calculatePreviousSeasonWageBillForClubNumber,
} from "../Transformers";

describe("DataGenerators test suite", () => {
  test.prop([fc.gen(), fc.integer({ min: 1000 })])(
    "adjustRangeForDivision",
    (fcGen, testRangeSize) => {
      const testLeagueLevel: string = fastCheckRandomLeagueLevel(fcGen);
      const [testMin, testMax]: [number, number] =
        fastCheckTestLinearRangeWithMinimumGenerator(fcGen, [
          1000,
          testRangeSize,
        ]);

      const [actualMin, actualMax]: [number, number] = adjustRangeForDivision(
        [testMin, testMax],
        testLeagueLevel,
      );

      expect(actualMin).toBeLessThan(actualMax);
      assertIntegerInRangeInclusive([1, testMin], actualMin);
      assertIntegerInRangeInclusive([1, testMax], actualMax);
    },
  );

  test.prop([fc.gen()])("generateDataForClubNumber", (fcGen) => {
    const [testGenerator, testRangeIndex] =
      fastCheckRandomItemFromArrayWithIndex(fcGen, [
        generateAttendanceForClubNumber,
        generateFacilitiesCostsForClubNumber,
        generateSponsorPaymentForClubNumber,
        generateTicketPriceForClubNumber,
        generateManagerPayForClubNumber,
        generateScoutingCostsForClubNumber,
        generateHealthCostsForClubNumber,
        generatePlayerDevelopmentCostsForClubNumber,
        generateWageBillToRevenueRatioForClubNumber,
      ]);

    const testRange: [number, number] = property(
      testRangeIndex,
      DEFAULTCLUBDATARANGES,
    );

    const [testClubNumber, expectedLeagueLevel] = pipe([
      fastCheckRandomClubNumberGenerator,
      over([identity, domesticLeagueLevelRepeaterForClubIDs]),
    ])(fcGen);

    const actualResult: number = testGenerator(testClubNumber);
    const expectedRange: [number, number] = adjustRangeForDivision(
      testRange,
      expectedLeagueLevel,
    );
    assertIntegerInRangeInclusive(expectedRange, actualResult);
  });

  test.prop([fc.gen()])(
    "calculatePreviousSeasonRevenueForClubNumber",
    (fcGen) => {
      const testClubNumber: number = fastCheckRandomClubNumberGenerator(fcGen);
      const actualResult: number =
        calculatePreviousSeasonRevenueForClubNumber(testClubNumber);
      expect(actualResult).toBeGreaterThan(0);
    },
  );

  test.prop([fc.gen()])(
    "calculatePreviousSeasonWageBillForClubNumber",
    (fcGen) => {
      const testClubNumber: number = fastCheckRandomClubNumberGenerator(fcGen);
      const actualResult: number =
        calculatePreviousSeasonWageBillForClubNumber(testClubNumber);
      const expectedRangeMax: number =
        calculatePreviousSeasonRevenueForClubNumber(testClubNumber);

      expect(actualResult).toEqual(round(actualResult));

      assertIntegerInRangeInclusive([1000, expectedRangeMax], actualResult);
    },
  );
});
