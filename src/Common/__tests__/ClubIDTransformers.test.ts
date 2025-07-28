import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { CLUBIDINDICES } from "../Constants"
import {
  fastCheckTestSeasonAndClubNumber,
} from "../TestDataGenerators";
import { getCountOfIDParts,
  getCountOfObjectKeys
} from "../Getters"
import { createClubID } from "../Transformers";

describe("ClubIDTransformers test suite", () => {
  test("createClubID", () => {
    fc.assert(fc.property(fc.gen(), (fcGen) => {

      const [testSeason, testClubNumber] = fastCheckTestSeasonAndClubNumber(fcGen)
      const actualClubID: string = createClubID(testSeason, testClubNumber)
      const actualCountOfIDParts: number = getCountOfIDParts(actualClubID)
      const expectedCountOfIDParts: number = getCountOfObjectKeys(CLUBIDINDICES)
      expect(actualCountOfIDParts).toEqual(expectedCountOfIDParts)
      
    }))
  })
  
});
