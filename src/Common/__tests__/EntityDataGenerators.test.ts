import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { pipe, over, identity, property } from "lodash/fp";
import { DEFAULTCLUBDATARANGES } from "../Constants"
import { 
  assertIntegerInRangeInclusive
} from "../Asserters";
import {
  fastCheckRandomLeagueLevel,
  fastCheckRandomClubIDNumberGenerator,
  fastCheckTestLinearRangeWithMinimumGenerator,
  fastCheckRandomItemFromArrayWithIndex
} from "../TestDataGenerators";
import {
  adjustRangeForDivision,
  generateAttendanceForClubID,
  generateFacilitiesCostsForClubID,
  generateSponsorRevenueForClubID,
  generateTicketPriceForClubID,
  generateManagerPayForClubID,
  generateScoutingCostsForClubID,
  generateHealthCostsForClubID,
  generatePlayerDevelopmentCostsForClubID,
  generateWageBillToRevenueRatioForClubID,
  domesticLeagueLevelRepeaterForClubIDs  
} from "../Transformers";

describe("DataGenerators test suite", () => {

  test.prop([fc.gen(), fc.integer({min: 1000})])(
    "adjustRangeForDivision",
    (fcGen, testRangeSize) => {
      const testLeagueLevel: string = fastCheckRandomLeagueLevel(fcGen)
      const [testMin, testMax]: [number, number] = fastCheckTestLinearRangeWithMinimumGenerator(fcGen, [1000, testRangeSize])
      
      const [actualMin, actualMax]: [number, number]  = adjustRangeForDivision([testMin, testMax], testLeagueLevel)

      expect(actualMin).toBeLessThan(actualMax)
      assertIntegerInRangeInclusive([1, testMin], actualMin)
      assertIntegerInRangeInclusive([1, testMax], actualMax)      
      
    },
  );
  
  test.prop([fc.gen()])(
    "generateDataForClubID", (fcGen) => {

      const [testGenerator, testRangeIndex] = fastCheckRandomItemFromArrayWithIndex(fcGen, [
	generateAttendanceForClubID,
	generateFacilitiesCostsForClubID,
	generateSponsorRevenueForClubID,
	generateTicketPriceForClubID,
	generateManagerPayForClubID,
	generateScoutingCostsForClubID,
	generateHealthCostsForClubID,
	generatePlayerDevelopmentCostsForClubID,
	generateWageBillToRevenueRatioForClubID
      ])
      
      const testRange: [number, number] = property(testRangeIndex, DEFAULTCLUBDATARANGES)
      
      const [testClubIDNumber, expectedLeagueLevel] = pipe([fastCheckRandomClubIDNumberGenerator, over([identity, domesticLeagueLevelRepeaterForClubIDs])])(fcGen)
      
      const actualResult: number = testGenerator(testClubIDNumber)
      const expectedRange: [number, number] = adjustRangeForDivision(testRange, expectedLeagueLevel)
      assertIntegerInRangeInclusive(expectedRange, actualResult)

  });

});
