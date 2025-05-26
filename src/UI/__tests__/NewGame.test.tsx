// @vitest-environment jsdom
import React from "react";
import { screen, cleanup } from "@testing-library/react";
import { describe, expect, test, expectTypeOf } from "vitest";
import "fake-indexeddb/auto";
import { renderWithRouter } from "../UITestingUtilities";

describe("NewGame Components", async () => {
  test("test NewGame with nothing selected", async () => {
    renderWithRouter(
      <NewGame countriesLeaguesClubs={testAvailableCountriesLeaguesClubs} />,
    );

    expect(screen.getByLabelText("Choose a name:")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "save-name" }));

    expect(screen.getByLabelText("Choose a country:")).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "country-options" }),
    ).toBeTruthy();

    expect(screen.getByLabelText("Choose a domestic league:")).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "domestic-league-options" }),
    ).toBeTruthy();

    expect(screen.getByLabelText("Choose a club:")).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "club-options" })).toBeTruthy();

    // Can only start game when all info has been entered
    expect(() =>
      screen.getByText("Start Game", { selector: "button[name=start-game]" }),
    ).toThrowError();
  });

  cleanup();

  test("test NewGame countries options", async () => {
    const { user } = renderWithRouter(
      <NewGame countriesLeaguesClubs={testAvailableCountriesLeaguesClubs} />,
    );

    const element = screen.getByRole("combobox", { name: "country-options" });
    expect(element.length).toBe(expectedCountries.length + 1);
    await user.selectOptions(element, expectedCountries[0]);

    expect(
      screen.getByRole("option", { name: expectedCountries[0] }).selected,
    ).toBeTruthy();

    await user.selectOptions(element, expectedCountries[1]);

    expect(
      screen.getByRole("option", { name: expectedCountries[1] }).selected,
    ).toBeTruthy();

    cleanup();
  });

  test("test select country and then league", async () => {
    const testCountry = expectedCountries[0];

    const { user } = renderWithRouter(
      <NewGame countriesLeaguesClubs={testAvailableCountriesLeaguesClubs} />,
    );
    // select a country
    const countryElement = screen.getByRole("combobox", {
      name: "country-options",
    });
    const leaguesElement = screen.getByRole("combobox", {
      name: "domestic-league-options",
    });
    expect(countryElement.length).toBe(expectedCountries.length + 1);
    expect(leaguesElement.length).toBe(0);

    await user.selectOptions(countryElement, testCountry);
    expect(
      screen.getByRole("option", { name: testCountry }).selected,
    ).toBeTruthy();

    // assert that there are league options and that they are correct for the country
    const expectedLeagues = Object.keys(
      testAvailableCountriesLeaguesClubs[expectedCountries[0]],
    );

    expectedLeagues.forEach((expectedLeague) => {
      expect(screen.getByRole("option", { name: expectedLeague })).toBeTruthy();
    });
  });
});
