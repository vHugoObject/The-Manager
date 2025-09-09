import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { pipe, over, identity, property, round, add } from "lodash/fp";
import { DEFAULTCLUBDATARANGES, DEFAULTSQUADSIZE } from "../Constants";
import { Club } from "../Types";
import {
  assertIntegerInRangeInclusive,
  assertIsClubObject,
} from "../Asserters";
import {
  fastCheckRandomLeagueLevel,
  fastCheckRandomClubNumberGenerator,
  fastCheckTestLinearRangeWithMinimumGenerator,
  fastCheckRandomItemFromArrayWithIndex,
} from "../TestDataGenerators";
import {
  getCountOfUniqueIntegersFromArray,
  getMinAndMaxOfArray,
} from "../Getters";
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
  domesticLeagueLevelRepeaterForClubs,
  calculatePreviousSeasonRevenueForClubNumber,
  calculatePreviousSeasonWageBillForClubNumber,
  mod,
  generateClubStartingPlayerNumbers,
  createClub,
} from "../Transformers";

describe("ClubDataGenerators test suite", () => {
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
      over([identity, domesticLeagueLevelRepeaterForClubs]),
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

  test.prop([fc.gen()])("generateClubStartingPlayerNumbers", (fcGen) => {
    const testClubNumber: number = fastCheckRandomClubNumberGenerator(fcGen);
    const actualPlayerNumbers: Array<number> =
      generateClubStartingPlayerNumbers(testClubNumber);

    const [actualMin, actualMax] = getMinAndMaxOfArray(actualPlayerNumbers);
    expect(mod(DEFAULTSQUADSIZE, actualMax + 1)).toEqual(0);
    expect(add(actualMin - 1, DEFAULTSQUADSIZE)).toEqual(actualMax);
    expect(getCountOfUniqueIntegersFromArray(actualPlayerNumbers)).toEqual(
      DEFAULTSQUADSIZE,
    );
  });

  test.prop([fc.gen()])("createClub", (fcGen) => {
    const testClubNumber: number = fastCheckRandomClubNumberGenerator(fcGen);

    const [actualClubNumber, actualClubObject]: [number, Club] =
      createClub(testClubNumber);

    expect(actualClubNumber).toBe(testClubNumber);
    assertIsClubObject(actualClubObject);
  });
});
