// @vitest-environment jsdom
import { fc, test } from "@fast-check/vitest";
import { cleanup, screen } from "@testing-library/react";
import "fake-indexeddb/auto";
import { over, pipe } from "lodash/fp";
import React from "react";
import { describe, expect } from "vitest";
import {
  pairArraysAndAssertStrictEqual,
  pairIntegersAndAssertEqual,
} from "../../../Common/Asserters";
import { getCountOfItemsFromArrayThatStartWithX } from "../../../Common/Getters";
import {
  fastCheckNLengthUniqueStringArrayGenerator,
  fastCheckNonSpaceRandomCharacterGenerator,
  fastCheckRandomEntityIDPrefix,
  fastCheckTestBaseCountriesGenerator,
  fastCheckTestCompletelyRandomBaseClubIndex,
  fastCheckTestCompletelyRandomBaseDomesticLeagueIndex,
  fastCheckTestRandomBaseCountryIndex,
} from "../../../Common/TestDataGenerationUtilities";
import {
  convertArrayOfStringsIntoArrayOfIntegers,
  convertArrayToSetThenGetSize,
  createStringID,
  isEveryIntegerInRange,
} from "../../../Common/Transformers";
import { BaseCountries } from "../../../Common/Types";
import {
  getIDsOfElements,
  getTextOfElements,
  getValuesOfElements,
  setup,
} from "../../UITestingUtilities";
import {
  CreateClubOptions,
  CreateCountryOptions,
  CreateDomesticLeagueOptions,
  CreateEntityOptions,
  NewSaveForm,
} from "../NewSaveForm";

describe("NewSaveForm", async () => {
  test.prop([fc.gen(), fc.integer({ min: 2, max: 100 }), fc.string()])(
    "Test CreateEntityOptions",
    async (fcGen, testOptionsCount) => {
      const testOptions: Array<string> =
        fastCheckNLengthUniqueStringArrayGenerator(fcGen, testOptionsCount);
      const testIDPrefix: string = fastCheckRandomEntityIDPrefix(fcGen);

      setup(
        <div>
          <select>
            <CreateEntityOptions
              idCreator={createStringID(testIDPrefix)}
              strings={testOptions}
            />
          </select>
        </div>,
      );

      const actualOptions: Array<HTMLOptionElement> =
        screen.getAllByRole("option");
      const [actualIDs, actualValues, actualTextValues] = over([
        getIDsOfElements,
        getValuesOfElements,
        getTextOfElements,
      ])(actualOptions);
      const actualUniqueValues: number =
        convertArrayToSetThenGetSize(actualValues);
      const actualCorrectIDsCount: number =
        getCountOfItemsFromArrayThatStartWithX(testIDPrefix, actualIDs);

      pairIntegersAndAssertEqual([
        actualUniqueValues,
        testOptionsCount,
        actualCorrectIDsCount,
        testOptionsCount,
      ]);
      pairArraysAndAssertStrictEqual([actualTextValues, testOptions]);
      const areAllValuesInRange = pipe([
        convertArrayOfStringsIntoArrayOfIntegers,
        isEveryIntegerInRange([0, testOptionsCount]),
      ])(actualValues);

      expect(areAllValuesInRange).toBeTruthy();
      cleanup();
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 8 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "Test CreateCountryOptions",
    async (testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseCountries: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticsLeaguesClubsCount,
        );

      const [expectedCountriesCount] = testCountriesDomesticsLeaguesClubsCount;

      setup(<CreateCountryOptions countriesLeaguesClubs={testBaseCountries} />);

      const options: Array<HTMLOptionElement> = screen.getAllByRole("option");
      pairIntegersAndAssertEqual([options.length, expectedCountriesCount]);

      cleanup();
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 8 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "Test CreateDomesticLeagueOptions",
    async (testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseCountries: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticsLeaguesClubsCount,
        );

      const testCountryIndex: string = fastCheckTestRandomBaseCountryIndex(
        fcGen,
        testBaseCountries,
      );

      const [, expectedDomesticLeaguesPerCountryCount] =
        testCountriesDomesticsLeaguesClubsCount;

      setup(
        <CreateDomesticLeagueOptions
          countriesLeaguesClubs={testBaseCountries}
          countryIndex={testCountryIndex}
        />,
      );

      const options: Array<HTMLOptionElement> = screen.getAllByRole("option");
      pairIntegersAndAssertEqual([
        options.length,
        expectedDomesticLeaguesPerCountryCount,
      ]);
      cleanup();
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 8 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "Test CreateClubOptions",
    async (testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseCountries: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticsLeaguesClubsCount,
        );

      const [testCountryIndex, testDomesticLeagueIndex]: [string, string] =
        fastCheckTestCompletelyRandomBaseDomesticLeagueIndex(
          fcGen,
          testBaseCountries,
        );

      const [, , expectedClubsPerDomesticLeagues] =
        testCountriesDomesticsLeaguesClubsCount;

      setup(
        <CreateClubOptions
          countriesLeaguesClubs={testBaseCountries}
          countryIndex={testCountryIndex}
          domesticLeagueIndex={testDomesticLeagueIndex}
        />,
      );

      const options: Array<HTMLOptionElement> = screen.getAllByRole("option");
      pairIntegersAndAssertEqual([
        options.length,
        expectedClubsPerDomesticLeagues,
      ]);
      cleanup();
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 8 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "Test NewSaveForm with no options selected",
    async (testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseCountries: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticsLeaguesClubsCount,
        );

      const [expectedCountriesCount] = testCountriesDomesticsLeaguesClubsCount;

      setup(<NewSaveForm countriesLeaguesClubs={testBaseCountries} />);
      expect(
        screen.getByRole("textbox", { name: "Choose a name:" }),
      ).toBeTruthy();
      expect(
        screen.getByLabelText("Choose a country:", { selector: "select" }),
      ).toBeTruthy();

      expect(
        screen.getByLabelText("Choose a domestic league:", {
          selector: "select",
        }),
      ).toBeTruthy();
      expect(
        screen.getByLabelText("Choose a club:", { selector: "select" }),
      ).toBeTruthy();

      const options: Array<HTMLOptionElement> = screen.getAllByRole("option");
      pairIntegersAndAssertEqual([options.length, expectedCountriesCount]);
      cleanup();
    },
  );

  test.prop(
    [
      fc.tuple(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 8 }),
        fc.integer({ min: 1, max: 20 }),
      ),
      fc.gen(),
    ],
    { numRuns: 75 },
  )(
    "Test NewSaveForm selecting a country, domestic league and club",
    async (testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseCountries: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticsLeaguesClubsCount,
        );

      const testName: string = fastCheckNonSpaceRandomCharacterGenerator(fcGen);
      const [
        testCountryNameValue,
        testDomesticLeagueNameValue,
        testClubNameValue,
      ] = fastCheckTestCompletelyRandomBaseClubIndex(fcGen, testBaseCountries);

      const { user } = setup(
        <NewSaveForm countriesLeaguesClubs={testBaseCountries} />,
      );

      const actualNameTextArea: HTMLInputElement = screen.getByRole("textbox", {
        name: "Choose a name:",
      });

      await user.type(actualNameTextArea, testName);
      expect(actualNameTextArea.value).toBe(testName);

      const actualCountryOptions: HTMLSelectElement = screen.getByLabelText(
        "Choose a country:",
        { selector: "select" },
      );
      await user.selectOptions(actualCountryOptions, testCountryNameValue);

      const actualDomesticLeagueOptions: HTMLSelectElement =
        screen.getByLabelText("Choose a domestic league:", {
          selector: "select",
        });
      await user.selectOptions(
        actualDomesticLeagueOptions,
        testDomesticLeagueNameValue,
      );

      const actualClubOptions: HTMLSelectElement = screen.getByLabelText(
        "Choose a club:",
        { selector: "select" },
      );
      await user.selectOptions(actualClubOptions, testClubNameValue);
      expect(screen.getByRole("button", { name: "Submit" })).toBeTruthy();

      cleanup();
    },
  );
});
