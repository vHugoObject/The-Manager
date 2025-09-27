import { describe, assert } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { over, pipe, property, map } from "lodash/fp"
import { SaveOptions, SaveArguments } from "../Types";
import { BASECOUNTRIES } from "../Constants";
import {
  convertArraysToSetsAndAssertStrictEqual,
  assertIsSaveOptions,
  assertNumbers,
  assertIsPlayerObject,
  assertIsClubObject
} from "../Asserters";
import {
  fastCheckCreateTestSaveOptionsWithRandomCountries,
  fastCheckCreateTestSaveOptionsWithDefaultCountries,
  fastCheckRandomItemFromArray,
  fastCheckCreateArrayOfTestSaveOptions,
  fastCheckCreateTestSaveArguments
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

    test("array with random countries", () => {
      fc.assert(
        fc.property(fc.gen(), fc.integer({min: 2, max: 10}), (fcGen, testOptionsCount) => {
	  
          const actualArrayOfSaveOptions: Array<[string, SaveOptions]> =
		fastCheckCreateArrayOfTestSaveOptions(fcGen, testOptionsCount);
	  const [actualSaveName, actualRandomSaveOptions] = fastCheckRandomItemFromArray(fcGen, actualArrayOfSaveOptions)

	  assert.isString(actualSaveName)
          assertIsSaveOptions(actualRandomSaveOptions);
	  
        }),
      );
    });

  });

  test("with base countries", () => {
      fc.assert(
        fc.property(fc.gen(), (fcGen) => {
          const [actualSaveArguments, actualCounts]: [SaveArguments, [number, number]] =
		fastCheckCreateTestSaveArguments(fcGen);

	  assertIsSaveOptions(actualSaveArguments.SaveOptions)
	  
	  const [actualRandomClub, actualRandomPlayer] = pipe([
	    over([property("Clubs"), property("Players")]),
	    map(fastCheckRandomItemFromArray(fcGen))
	  ])(actualSaveArguments)

	  assertIsClubObject(actualRandomClub)
	  assertIsPlayerObject(actualRandomPlayer)
	  assertNumbers(actualCounts)
          
        }),
      );
    });
  
});
