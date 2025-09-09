import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { BaseCountries, SaveArguments } from "../Types";
import { BASECOUNTRIES } from "../Constants";
import { convertArraysToSetsAndAssertStrictEqual } from "../Asserters";
import {
  fastCheckCreateTestSaveArgumentsWithRandomCountries,
  fastCheckCreateTestSaveArgumentsWithDefaultCountries,
} from "../TestDataGenerators";
import { getCountriesFromSave } from "../Save";

describe("SaveTestingUtilities test suite", () => {
  describe("createSaveArguments", () => {
    test("with randomly generated countries", () => {
      fc.assert(
        fc.property(fc.gen(), (fcGen) => {
          const actualSaveArguments: SaveArguments =
            fastCheckCreateTestSaveArgumentsWithRandomCountries(fcGen);

          const expectedSaveArguments = {
            Name: expect.any(String),
            CountryIndex: expect.any(Number),
            DomesticLeagueIndex: expect.any(Number),
            ClubIndex: expect.any(Number),
            Season: expect.any(Number),
          };

          expect(actualSaveArguments).toMatchObject(expectedSaveArguments);
        }),
      );
    });

    test("with base countries", () => {
      fc.assert(
        fc.property(fc.gen(), (fcGen) => {
          const actualSaveArguments: SaveArguments =
            fastCheckCreateTestSaveArgumentsWithDefaultCountries(fcGen);
          const actualBaseCountries: BaseCountries =
            getCountriesFromSave(actualSaveArguments);
          convertArraysToSetsAndAssertStrictEqual([
            actualBaseCountries,
            BASECOUNTRIES,
          ]);
        }),
      );
    });
  });
});
