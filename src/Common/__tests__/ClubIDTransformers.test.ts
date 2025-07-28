import { test, fc } from "@fast-check/vitest";
import { describe, assert, expect } from "vitest";
import { CLUBIDINDICES } from "../Constants"
import {
  fastCheckTestSeasonAndClubNumber,
} from "../TestDataGenerators";
import { getCountOfIDParts,
  getCountOfObjectKeys
} from "../Getters"
import {
  createClubID,
  splitUnderscoresMapAndSum
} from "../Transformers";

describe("ClubIDTransformers test suite", () => {
  test("createClubID", () => {
    fc.assert(fc.property(fc.gen(), (fcGen) => {

      const [testSeason, testClubNumber] = fastCheckTestSeasonAndClubNumber(fcGen)
      const actualClubID: string = createClubID(testSeason, testClubNumber)
      assert.isNumber(splitUnderscoresMapAndSum(actualClubID))
      
      const actualCountOfIDParts: number = getCountOfIDParts(actualClubID)
      
      expect(actualClubID).toContain(testSeason)
      expect(actualClubID).toContain(testClubNumber)
      const expectedCountOfIDParts: number = getCountOfObjectKeys(CLUBIDINDICES)
      expect(actualCountOfIDParts).toEqual(expectedCountOfIDParts)
      
    }))
  })
  
});
