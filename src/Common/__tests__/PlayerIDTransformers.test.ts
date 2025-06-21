import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { property } from "lodash/fp"
import { fastCheckTestPlayerIDGenerator,
} from "../TestDataGenerators";
import { assertIntegerInRangeExclusive } from "../Asserters"
import {
  FIRSTNAMESRANGE,
  LASTNAMESRANGE,
  COUNTRYNAMESRANGE,
  PLAYERIDDATARANGESBYPOSITION,
  PLAYERIDINDICES
} from "../PlayerDataConstants"
import { getPositionGroupFromPlayerID } from "../Getters"
import { convertPlayerIDIntoPlayerFirstNameAsInteger,
  convertPlayerIDIntoPlayerLastNameAsInteger,
  convertPlayerIDIntoPlayerCountryAsInteger,
  convertPlayerIDIntoPlayerPositionAsInteger,
} from "../Transformers"

describe("PlayerIDTransformers test suite", () => {

  test.prop([fc.gen()])(
    "convertPlayerIDIntoPlayerFirstNameAsInteger",
    (fcGen) => {
      
      const testPlayerID: string = fastCheckTestPlayerIDGenerator(fcGen)
      const actualPlayerFirstNameAsInteger: number = convertPlayerIDIntoPlayerFirstNameAsInteger(testPlayerID)
      assertIntegerInRangeExclusive(FIRSTNAMESRANGE, actualPlayerFirstNameAsInteger)
      expect(actualPlayerFirstNameAsInteger).toEqual(convertPlayerIDIntoPlayerFirstNameAsInteger(testPlayerID))
      
      
    }
  );

  test.prop([fc.gen()])(
    "convertPlayerIDIntoPlayerLastNameAsInteger",
    (fcGen) => {

      const testPlayerID: string = fastCheckTestPlayerIDGenerator(fcGen)
      const actualPlayerLastNameAsInteger: number = convertPlayerIDIntoPlayerLastNameAsInteger(testPlayerID)

      assertIntegerInRangeExclusive(LASTNAMESRANGE, actualPlayerLastNameAsInteger)
      expect(actualPlayerLastNameAsInteger).toEqual(convertPlayerIDIntoPlayerLastNameAsInteger(testPlayerID))

    }
    );

  test.prop([fc.gen()])(
    "convertPlayerIDIntoPlayerCountryAsInteger",
    (fcGen) => {
      
      const testPlayerID: string = fastCheckTestPlayerIDGenerator(fcGen)
      const actualPlayerCountryNameAsInteger: number = convertPlayerIDIntoPlayerCountryAsInteger(testPlayerID)
      assertIntegerInRangeExclusive(COUNTRYNAMESRANGE, actualPlayerCountryNameAsInteger)
      expect(actualPlayerCountryNameAsInteger).toEqual(convertPlayerIDIntoPlayerCountryAsInteger(testPlayerID))

      
    }
  );

    test.prop([fc.gen()])(
    "convertPlayerIDIntoPlayerPositionAsInteger",
    (fcGen) => {
      
      const testPlayerID: string = fastCheckTestPlayerIDGenerator(fcGen)
      const expectedPlayerPositionGroup: string = getPositionGroupFromPlayerID(testPlayerID)
      const expectedPlayerPositionGroupRange: [number, number] = property([expectedPlayerPositionGroup, PLAYERIDINDICES.Position], PLAYERIDDATARANGESBYPOSITION)

      const actualPlayerPositionNumber: number = convertPlayerIDIntoPlayerPositionAsInteger(testPlayerID)
      assertIntegerInRangeExclusive(expectedPlayerPositionGroupRange, actualPlayerPositionNumber)
      expect(actualPlayerPositionNumber).toEqual(convertPlayerIDIntoPlayerPositionAsInteger(testPlayerID))

      
    }
    );

  
})

