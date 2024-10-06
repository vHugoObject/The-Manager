// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, test, afterEach } from "vitest";
import "fake-indexeddb/auto";
import { openDB, deleteDB } from "idb";
import { StartScreen } from "../StartScreen";

const renderWithRouter = (ui, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: BrowserRouter }),
  };
};

describe("StartingScreen Components", async () => {
  afterEach(async () => {
    cleanup();
  });

  const fullCompetitionTableRowHeaders = [
    "Club",
    "Wins",
    "Draws",
    "Losses",
    "Goals For",
    "Goals Against",
    "Goal Difference",
    "Points",
  ];

  const simpleCompetitionTableRowHeaders = [
    "Club",
    "Wins",
    "Draws",
    "Losses",
    "Points",
  ];

  const expectedPlayerStandardStatsHeaders = [
    "Season",
    "Matches Played",
    "Starts",
    "Minutes",
    "Full 90s",
    "Goals",
    "Assists",
    "Goals Plus Assists",
    "Non Penalty Goals",
    "Penalty Kicks Made",
    "Penalty Kicks Attempted",
    "Yellow Cards",
    "Red Cards",
  ];

  const expectedBioParagraphs = [
    "Position",
    "Footed",
    "Height",
    "Weight",
    "Age",
    "National Team",
    "Club",
    "Wages",
  ];

  const clubStandardStatsHeaders = [
    "Name",
    "National Team",
    "Position",
    "Matches Played",
    "Starts",
    "Minutes",
    "Full 90s",
    "Goals",
    "Assists",
    "Goals Plus Assists",
    "Non Penalty Goals",
    "Penalty Kicks Made",
    "Penalty Kicks Attempted",
    "Yellow Cards",
    "Red Cards",
  ];

  const clubSummaryStatsHeaders = [
    "Record",
    "Home Record",
    "Away Record",
    "Manager",
    "Country",
    "Domestic Competition",
    "Domestic Cups",
    "Continental Cup",
  ];

  const expectedPlayerComponentKeys = {
    standardStatsHeaders: expectedPlayerStandardStatsHeaders,
    bioParagraphs: expectedBioParagraphs,
  };

  const expectedStatisticsOne = {
    ID: 0,
    Season: 2024,
    MatchesPlayed: 3,
    Starts: 4,
    Minutes: 5,
    Full90s: 6,
    Goals: 7,
    Assists: 8,
    GoalsPlusAssists: 9,
    NonPenaltyGoals: 10,
    PenaltyKicksMade: 11,
    PenaltyKicksAttempted: 12,
    YellowCards: 13,
    RedCards: 14,
  };

  const expectedClubStatisticsOne = {
    2024: {
      ID: 0,
      Wins: 0,
      Draws: 0,
      Losses: 0,
      GoalsFor: 0,
      GoalsAgainst: 0,
      GoalDifference: 0,
      Points: 0,
      Record: "",
      HomeRecord: "",
      AwayRecord: "",
      DomesticCompetition: "",
      DomesticCups: "",
      ContinentalCup: "",
    },
  };
  const expectedClubOne = {
    ID: 1,
    Name: "Arsenal",
    Statistics: {
      BySeason: expectedClubStatisticsOne,
      GameLog: {},
    },
    Players: expect.anything(),
    ComponentKeys: {
      clubSummaryStatsHeaders,
      clubStandardStatsHeaders,
    },
  };

  const expectedClubTwo = {
    ID: 0,
    Name: "Brentford",
    Statistics: {
      BySeason: expectedClubStatisticsOne,
      GameLog: {},
    },
    Players: expect.anything(),
    ComponentKeys: {
      clubSummaryStatsHeaders,
      clubStandardStatsHeaders,
    },
  };

  const expectedCompetition = {
    Name: "English Premier League",
    Clubs: [expectedClubTwo, expectedClubOne],
    ComponentKeys: {
      simpleCompetitionTableRowHeaders,
      fullCompetitionTableRowHeaders,
    },
  };

  const expectedSave = {
    playerName: "Jose Mourinho",
    currentSeason: "2024",
    playerClub: expectedClubOne,
    playerMainCompetition: expectedCompetition,
  };

  const expectedDBName = "the-manager";
  const saves = "save-games";

  const testAvailableCountriesLeaguesClubs = {
    England: {
      "English Premier League": ["Arsenal", "Brentford"],
      "The Championship": ["Burnley", "Stoke City"],
    },
    France: {
      "La Ligue 1": ["Paris Saint Germain", "Olympique Lyonnais"],
      "La Ligue 2": ["Metz", "Stade Laval"],
    },
  };

  const expectedCountries = Object.keys(testAvailableCountriesLeaguesClubs);

  test("test StartingScreen with nothing selected", async () => {
    renderWithRouter(
      <StartScreen
        countriesLeaguesClubs={testAvailableCountriesLeaguesClubs}
      />,
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

  test("test StartingScreen countries options", async () => {
    const { user } = renderWithRouter(
      <StartScreen
        countriesLeaguesClubs={testAvailableCountriesLeaguesClubs}
      />,
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
  });

  test("test select country and then league", async () => {
    const testCountry = expectedCountries[0];

    const { user } = renderWithRouter(
      <StartScreen
        countriesLeaguesClubs={testAvailableCountriesLeaguesClubs}
      />,
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

  test("test start new game", async () => {
    const testName = "Jose Mourinho";
    const testCountry = expectedCountries[0];
    const expectedLeagues = Object.keys(
      testAvailableCountriesLeaguesClubs[testCountry],
    );
    const testLeague = expectedLeagues[0];
    const testClub =
      testAvailableCountriesLeaguesClubs[testCountry][testLeague][0];

    const { user } = renderWithRouter(
      <StartScreen
        countriesLeaguesClubs={testAvailableCountriesLeaguesClubs}
      />,
    );
    const form = screen.getByRole("form");
    const saveNameElement = screen.getByRole("textbox", { name: "save-name" });
    const countryElement = screen.getByRole("combobox", {
      name: "country-options",
    });
    const leaguesElement = screen.getByRole("combobox", {
      name: "domestic-league-options",
    });
    const teamsElement = screen.getByRole("combobox", { name: "club-options" });

    expect(countryElement.length).toBe(expectedCountries.length + 1);
    expect(leaguesElement.length).toBe(0);
    expect(teamsElement.length).toBe(0);
    // Can only start game when all info has been entered
    expect(() =>
      screen.getByText("Start Game", { selector: "button[name=start-game]" }),
    ).toThrowError();

    //enter a name
    await user.type(saveNameElement, testName);

    await user.selectOptions(countryElement, expectedCountries[0]);
    expect(
      screen.getByRole("option", { name: testCountry }).selected,
    ).toBeTruthy();

    await user.selectOptions(leaguesElement, testLeague);
    expect(
      screen.getByRole("option", { name: testLeague }).selected,
    ).toBeTruthy();

    await user.selectOptions(teamsElement, testClub);
    expect(
      screen.getByRole("option", { name: testClub }).selected,
    ).toBeTruthy();

    // press start game
    await user.click(
      screen.getByText("Start Game", { selector: "button[type='submit']" }),
    );

    // confirm new save was added to the db
    const saveID = 1; // need to find a better solution for this

    const db = await openDB(expectedDBName);
    const actualValue = await db.get(saves, saveID);
    expect(actualValue).toEqual(expectedSave);
  });
});
