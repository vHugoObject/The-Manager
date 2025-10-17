import React from "react";
import { expect } from "vitest";
import { fc, test } from "@fast-check/vitest";
import { renderWithRouter, getElementValue } from "../UITestingUtilities";
import { screen, cleanup } from "@testing-library/react";
import { describe } from "vitest";
import { BASECOUNTRIES } from "../../GameLogic/Constants";
import { fastCheckTestCompletelyRandomBaseClub } from "../../GameLogic/TestDataGenerators";
import { NewSave } from "../NewSave";

describe("NewSave", async () => {
  test("Test", async () => {
    await fc.assert(
      fc
        .asyncProperty(fc.string(), fc.gen(), async (testName, fcGen) => {
          const [
            ,
            [
              testCountryNameValue,
              testDomesticLeagueNameValue,
              testClubNameValue,
            ],
          ] = fastCheckTestCompletelyRandomBaseClub(fcGen, BASECOUNTRIES);

          const { user } = renderWithRouter(<NewSave />);

          const actualNameTextArea = screen.getByRole("textbox", {
            name: "Choose a name:",
          });

          await user.type(actualNameTextArea, testName);
          expect(getElementValue(actualNameTextArea)).toBe(testName);

          const actualCountryOptions =
            screen.getByLabelText("Choose a country:");

          await user.selectOptions(actualCountryOptions, testCountryNameValue);

          const actualDomesticLeagueOptions = screen.getByLabelText(
            "Choose a domestic league:",
          );

          await user.selectOptions(
            actualDomesticLeagueOptions,
            testDomesticLeagueNameValue,
          );

          const actualClubOptions = screen.getByLabelText("Choose a club:");

          await user.selectOptions(actualClubOptions, testClubNameValue);

          screen.getByRole("button", { name: "Submit" });
        })
        .beforeEach(async () => {
          window.addEventListener("submit", (e) => e.preventDefault());
          cleanup();
        }),
      { numRuns: 1 },
    );
  });
});
