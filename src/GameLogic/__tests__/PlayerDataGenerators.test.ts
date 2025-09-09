import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { sum } from "lodash/fp";
import { Player } from "../Types";
import { MAXCONTRACTYEARS, DEFAULTAGERANGE } from "../PlayerDataConstants";
import {
  convertArraysToSetsAndAssertStrictEqual,
  assertMeanInRangeExclusive,
  assertIntegerInRangeDoubleExclusive,
  assertIsPlayerObject,
} from "../Asserters";
import {
  fastCheckGenerateAllPlayerNumbersOfRandomClub,
  fastCheckPlayerNumberGenerator,
} from "../TestDataGenerators";
import {
  unfold,
  generateWageToWageBillRatioForPlayerNumber,
  ageRepeaterForPlayerNumber,
  contractYearsRepeaterForPlayerNumber,
  addOne,
  getClubWageBillForPlayerNumber,
  convertArrayToSetThenGetSize,
  createPlayer,
} from "../Transformers";

describe("PlayerDataGenerators test suite", () => {
  test("contractYearsRepeaterForPlayerNumber", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const expectedContractYears = unfold(addOne, MAXCONTRACTYEARS);

        const actualContractYears: Array<number> =
          fastCheckGenerateAllPlayerNumbersOfRandomClub(
            contractYearsRepeaterForPlayerNumber,
            fcGen,
          );

        convertArraysToSetsAndAssertStrictEqual([
          actualContractYears,
          expectedContractYears,
        ]);
      }),
    );
  });

  test("ageRepeaterForPlayerNumber", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const actualAges: Array<number> =
          fastCheckGenerateAllPlayerNumbersOfRandomClub(
            ageRepeaterForPlayerNumber,
            fcGen,
          );

        assertMeanInRangeExclusive(DEFAULTAGERANGE, actualAges);
      }),
    );
  });

  test("generateWageToWageBillRatioForPlayerNumber", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const actualRatios: Array<number> =
          fastCheckGenerateAllPlayerNumbersOfRandomClub(
            generateWageToWageBillRatioForPlayerNumber,
            fcGen,
          );
        expect(sum(actualRatios)).toBeCloseTo(100);
      }),
    );
  });
  test("getClubWageBillForPlayerNumber", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const actualWageBills: Array<number> =
          fastCheckGenerateAllPlayerNumbersOfRandomClub(
            getClubWageBillForPlayerNumber,
            fcGen,
          );

        const actualUniqueValues: number =
          convertArrayToSetThenGetSize(actualWageBills);
        expect(actualUniqueValues).toEqual(1);
      }),
    );
  });

  test("assignWageToPlayerNumber", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const testPlayerNumber: number = fastCheckPlayerNumberGenerator(fcGen);
        const expectedClubSalaryBill: number =
          getClubWageBillForPlayerNumber(testPlayerNumber);
        const actualWage: number =
          generateWageToWageBillRatioForPlayerNumber(testPlayerNumber);
        assertIntegerInRangeDoubleExclusive(
          [0, expectedClubSalaryBill],
          actualWage,
        );
      }),
    );
  });

  test("createPlayer", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const testPlayerNumber: number = fastCheckPlayerNumberGenerator(fcGen);
        const [actualPlayerNumber, actualPlayerObject]: [number, Player] =
          createPlayer(testPlayerNumber);

        expect(actualPlayerNumber).toBe(testPlayerNumber);
        assertIsPlayerObject(actualPlayerObject);
      }),
    );
  });
});
