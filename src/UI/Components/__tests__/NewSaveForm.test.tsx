import React from "react";
import { fc, test } from "@fast-check/vitest";
import { cleanup, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import { setup } from "../../UITestingUtilities";
import { BaseCountries } from "../../../GameLogic/Types";
import {
  fastCheckNLengthUniqueStringArrayGenerator,
  fastCheckTestBaseCountriesGenerator,
  fastCheckGetTwoRandomItemsFromArray,
  fastCheckGetTwoRandomBaseCountries,
  fastCheckGetTwoRandomBaseDomesticLeagues,
  fastCheckGetTwoRandomBaseClubNamesFromRandomLeague,
} from "../../../GameLogic/TestDataGenerators";
import {
  CreateClubOptions,
  CreateCountryOptions,
  CreateDomesticLeagueOptions,
  CreateEntityOptions,
} from "../NewSaveForm";

describe("NewSaveForm", async () => {
  test("Test CreateEntityOptions", async () => {
    await fc.assert(
      fc
        .asyncProperty(
          fc.gen(),
          fc.integer({ min: 2, max: 100 }),
          async (fcGen, testOptionsCount) => {
            const testOptions: Array<string> =
              fastCheckNLengthUniqueStringArrayGenerator(
                fcGen,
                testOptionsCount,
              );

            const [testValue, testValueToClick] =
              fastCheckGetTwoRandomItemsFromArray(fcGen, testOptions);

            const TestElement = () => {
              return (
                <div>
                  <select
                    data-testid="select"
                    onChange={(e) => e}
                    value={testValue}
                  >
                    <CreateEntityOptions strings={testOptions} />
                  </select>
                </div>
              );
            };

            const { user } = setup(<TestElement />);
            await user.click(screen.getByText(testValue));
            await user.click(screen.getByText(testValueToClick));
          },
        )
        .beforeEach(async () => {
          cleanup();
        }),
      { numRuns: 1 },
    );
  });

  test("Test CreateCountryOptions", async () => {
    await fc.assert(
      fc
        .asyncProperty(
          fc.gen(),
          fc.tuple(
            fc.integer({ min: 2, max: 5 }),
            fc.integer({ min: 1, max: 8 }),
            fc.integer({ min: 1, max: 20 }),
          ),
          async (fcGen, testCountriesDomesticsLeaguesClubsCount) => {
            const testBaseCountries: BaseCountries =
              fastCheckTestBaseCountriesGenerator(
                fcGen,
                testCountriesDomesticsLeaguesClubsCount,
              );

            const [testCountryValue, testCountryToClick] =
              fastCheckGetTwoRandomBaseCountries(fcGen, testBaseCountries);

            const { user } = setup(
              <div>
                <select value={testCountryValue} onChange={(e) => e}>
                  <CreateCountryOptions
                    countriesLeaguesClubs={testBaseCountries}
                  />
                </select>
              </div>,
            );

            await user.click(screen.getByText(testCountryValue));
            await user.click(screen.getByText(testCountryToClick));
          },
        )
        .beforeEach(async () => {
          cleanup();
        }),
      { numRuns: 1 },
    );
  });

  test("Test CreateDomesticLeagueOptions", async () => {
    await fc.assert(
      fc
        .asyncProperty(
          fc.tuple(
            fc.integer({ min: 1, max: 3 }),
            fc.integer({ min: 3, max: 8 }),
            fc.integer({ min: 1, max: 20 }),
          ),
          fc.gen(),
          async (testCountriesDomesticsLeaguesClubsCount, fcGen) => {
            const testBaseCountries: BaseCountries =
              fastCheckTestBaseCountriesGenerator(
                fcGen,
                testCountriesDomesticsLeaguesClubsCount,
              );

            const [testCountryIndex, [testLeagueValue, testLeagueToClick]] =
              fastCheckGetTwoRandomBaseDomesticLeagues(
                fcGen,
                testBaseCountries,
              );

            const { user } = setup(
              <div>
                <select value={testLeagueValue} onChange={(e) => e}>
                  <CreateDomesticLeagueOptions
                    countriesLeaguesClubs={testBaseCountries}
                    countryIndex={testCountryIndex}
                  />
                </select>
              </div>,
            );

            await user.click(screen.getByText(testLeagueValue));
            await user.click(screen.getByText(testLeagueToClick));
          },
        )
        .beforeEach(async () => {
          cleanup();
        }),
      { numRuns: 1 },
    );
  });

  test("Test CreateClubOptions", async () => {
    await fc.assert(
      fc
        .asyncProperty(
          fc.tuple(
            fc.integer({ min: 1, max: 3 }),
            fc.integer({ min: 1, max: 8 }),
            fc.integer({ min: 3, max: 3 }),
          ),
          fc.gen(),
          async (testCountriesDomesticsLeaguesClubsCount, fcGen) => {
            const testBaseCountries: BaseCountries =
              fastCheckTestBaseCountriesGenerator(
                fcGen,
                testCountriesDomesticsLeaguesClubsCount,
              );

            const [
              [testCountryIndex, testDomesticLeagueIndex],
              [testClubValue, testClubToClick],
            ] = fastCheckGetTwoRandomBaseClubNamesFromRandomLeague(
              fcGen,
              testBaseCountries,
            );

            const { user } = setup(
              <div>
                <select value={testClubValue} onChange={(e) => e}>
                  <CreateClubOptions
                    countriesLeaguesClubs={testBaseCountries}
                    countryIndex={testCountryIndex}
                    domesticLeagueIndex={testDomesticLeagueIndex}
                  />
                </select>
              </div>,
            );

            await user.click(screen.getByText(testClubValue));
            await user.click(screen.getByText(testClubToClick));
          },
        )
        .beforeEach(async () => {
          cleanup();
        }),
      { numRuns: 50 },
    );
  });
});
