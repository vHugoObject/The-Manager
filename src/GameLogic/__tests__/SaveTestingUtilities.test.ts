import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { SaveOptions } from "../Types";
import { BASECOUNTRIES } from "../Constants";
import {
  convertArraysToSetsAndAssertStrictEqual,
  assertIsSaveOptions,
} from "../Asserters";
import {
  fastCheckCreateTestSaveOptionsWithRandomCountries,
  fastCheckCreateTestSaveOptionsWithDefaultCountries,
} from "../TestDataGenerators";

describe("SaveTestingUtilities test suite", () => {
  describe("createSaveOptions", () => {
    test("with randomly generated countries", () => {
      fc.assert(
        fc.property(fc.gen(), (fcGen) => {
          const actualSaveOptions: SaveOptions =
            fastCheckCreateTestSaveOptionsWithRandomCountries(fcGen);

          assertIsSaveOptions(actualSaveOptions);
        }),
      );
    });

    test("with base countries", () => {
      fc.assert(
        fc.property(fc.gen(), (fcGen) => {
          const actualSaveOptions: SaveOptions =
            fastCheckCreateTestSaveOptionsWithDefaultCountries(fcGen);
          assertIsSaveOptions(actualSaveOptions);
          convertArraysToSetsAndAssertStrictEqual([
            actualSaveOptions.Countries,
            BASECOUNTRIES,
          ]);
        }),
      );
    });
  });
});
