import { test, fc } from "@fast-check/vitest";
import { describe, assert, expect } from "vitest";
import { fastCheckTestPlayerIDGenerator,
    fastCheckTestSeasonAndPlayerNumber,
} from "../TestDataGenerators";
import { assertIntegerInRangeExclusive
} from "../Asserters";
import {
  FIRSTNAMESRANGE,
  LASTNAMESRANGE,
  COUNTRYNAMESRANGE,
  PLAYERIDINDICES,
} from "../PlayerDataConstants";
import {
  getCountOfIDParts,
  getCountOfObjectKeys
} from "../Getters";
import {
  splitUnderscoresMapAndSum,
  createPlayerID,
  convertPlayerIDIntoPlayerFirstNameAsInteger,
  convertPlayerIDIntoPlayerLastNameAsInteger,
  convertPlayerIDIntoPlayerCountryAsInteger,
} from "../Transformers";

describe("PlayerIDTransformers test suite", () => {

  test.prop([fc.gen()])("createPlayerID", (fcGen) => {
    const [testSeason, testPlayerNumber] =
      fastCheckTestSeasonAndPlayerNumber(fcGen);

    const actualPlayerID: string = createPlayerID(testSeason, testPlayerNumber);
    assert.isNumber(splitUnderscoresMapAndSum(actualPlayerID))
    
    const actualCountOfIDParts: number = getCountOfIDParts(actualPlayerID)    
    expect(actualPlayerID).toContain(testSeason)
    expect(actualPlayerID).toContain(testPlayerNumber)
    const expectedCountOfIDParts: number = getCountOfObjectKeys(PLAYERIDINDICES)
    expect(actualCountOfIDParts).toEqual(expectedCountOfIDParts)
    
 
  });
  
  test.skip.prop([fc.gen()])(
    "convertPlayerIDIntoPlayerFirstNameAsInteger",
    (fcGen) => {
      const testPlayerID: string = fastCheckTestPlayerIDGenerator(fcGen);
      const actualPlayerFirstNameAsInteger: number =
        convertPlayerIDIntoPlayerFirstNameAsInteger(testPlayerID);
      assertIntegerInRangeExclusive(
        FIRSTNAMESRANGE,
        actualPlayerFirstNameAsInteger,
      );
      expect(actualPlayerFirstNameAsInteger).toEqual(
        convertPlayerIDIntoPlayerFirstNameAsInteger(testPlayerID),
      );
    },
  );

  test.skip.prop([fc.gen()])(
    "convertPlayerIDIntoPlayerLastNameAsInteger",
    (fcGen) => {
      const testPlayerID: string = fastCheckTestPlayerIDGenerator(fcGen);
      const actualPlayerLastNameAsInteger: number =
        convertPlayerIDIntoPlayerLastNameAsInteger(testPlayerID);

      assertIntegerInRangeExclusive(
        LASTNAMESRANGE,
        actualPlayerLastNameAsInteger,
      );
      expect(actualPlayerLastNameAsInteger).toEqual(
        convertPlayerIDIntoPlayerLastNameAsInteger(testPlayerID),
      );
    },
  );

  test.skip.prop([fc.gen()])(
    "convertPlayerIDIntoPlayerCountryAsInteger",
    (fcGen) => {
      const testPlayerID: string = fastCheckTestPlayerIDGenerator(fcGen);
      const actualPlayerCountryNameAsInteger: number =
        convertPlayerIDIntoPlayerCountryAsInteger(testPlayerID);
      assertIntegerInRangeExclusive(
        COUNTRYNAMESRANGE,
        actualPlayerCountryNameAsInteger,
      );
      expect(actualPlayerCountryNameAsInteger).toEqual(
        convertPlayerIDIntoPlayerCountryAsInteger(testPlayerID),
      );
    },
  );
});
