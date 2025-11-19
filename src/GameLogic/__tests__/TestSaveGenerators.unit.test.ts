import { describe, assert } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { over, pipe, property, map } from "lodash/fp";
import { toUndefined, Option } from "fp-ts/Option";
import { SaveOptions, SaveArguments } from "../Types";
import { BASECOUNTRIES } from "../Constants";
import {
  convertArraysToSetsAndAssertStrictEqual,
  assertIsSaveOptions,
  assertNumbers,
  assertIsPlayerObject,
  assertIsClubObject,
  assertIsDomesticLeagueObject,
} from "../Asserters";
import {
  fastCheckCreateTestSaveOptionsWithRandomCountries,
  fastCheckCreateTestSaveOptionsWithDefaultCountries,
  fastCheckRandomItemFromArray,
  fastCheckCreateArrayOfTestSaveOptions,
  fastCheckCreateTestSaveArguments,
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
        fc.property(
          fc.gen(),
          fc.integer({ min: 2, max: 10 }),
          (fcGen, testOptionsCount) => {
            const actualArrayOfSaveOptions: Array<
              Option<[string, SaveOptions]>
            > = fastCheckCreateArrayOfTestSaveOptions(fcGen, testOptionsCount);
            const [actualSaveName, actualRandomSaveOptions] = pipe([
              fastCheckRandomItemFromArray,
              toUndefined,
            ])(fcGen, actualArrayOfSaveOptions);

            assert.isString(actualSaveName);
            assertIsSaveOptions(actualRandomSaveOptions);
          },
        ),
      );
    });
  });

  test("with base countries", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const [actualSaveArguments, actualCounts]: [
          SaveArguments,
          [number, number, number],
        ] = fastCheckCreateTestSaveArguments(fcGen);

        assertIsSaveOptions(actualSaveArguments.SaveOptions);

        const [actualDomesticLeague, actualRandomClub, actualRandomPlayer] =
          pipe([
            over([
              property("DomesticLeagues"),
              property("Clubs"),
              property("Players"),
            ]),
            map(fastCheckRandomItemFromArray(fcGen)),
          ])(actualSaveArguments);

        assertIsDomesticLeagueObject(actualDomesticLeague);
        assertIsClubObject(actualRandomClub);
        assertIsPlayerObject(actualRandomPlayer);
        assertNumbers(actualCounts);
      }),
    );
  });
});
