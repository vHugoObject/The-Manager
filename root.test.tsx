// @vitest-environment jsdom
import React from "react";
import { screen, cleanup, waitFor } from "@testing-library/react";
import { describe, expect, test, afterEach } from "vitest";
import "fake-indexeddb/auto";
import { renderWithRouter } from "./UI/tests/TestingUtilities";
import {
  Player,
  SkillSet,
  PlayerStatistics,
  StatisticsObject,
  PositionGroup,
  Midfielder,
  Goalkeeper,
  Foot,
  ContractType,
} from "./Players/PlayerTypes";
import { playerSkills } from "./Players/PlayerSkills";
import { App } from "./root";

describe("test the app from the root", async () => {
  const testName = "Mikel Arteta";
  const testCountry = "England";
  const testCompetition = "English Premier League";
  const testClub = "Arsenal";

  const expectedSimpleCompetitionTableRowHeaders = [
    "Club",
    "Wins",
    "Draws",
    "Losses",
    "Points",
  ];

  const testSeasonStatistics = {
    MatchesPlayed: 0,
    Starts: 0,
    Minutes: 0,
    Full90s: 0,
    Goals: 0,
    Assists: 0,
    GoalsPlusAssists: 0,
    NonPenaltyGoals: 0,
    PenaltyKicksMade: 0,
    PenaltyKicksAttempted: 0,
    YellowCards: 0,
    RedCards: 0,
  };

  const expectedClubSummaryStatsHeaders = [
    "Record",
    "Home Record",
    "Away Record",
    "Domestic Competition",
    "Domestic Cups",
    "Continental Cup",
  ];

  const expectedSimpleClubStandardStatsHeaders = [
    "Name",
    "National Team",
    "Position",
    "Matches Played",
    "Starts",
    "Minutes",
    "Goals",
    "Assists",
    "Yellow Cards",
    "Red Cards",
  ];

    const expectedStatisticsOne = {
    Name: "John Doe",
    "National Team": "Spain",
    Position: "CDM",
    "Matches Played": 0,
    Starts: 0,
    Minutes: 0,
    Goals: 0,
    Assists: 0,
    "Yellow Cards": 0,
    "Red Cards": 0,
  };

  const expectedStatisticsTwo = {
    Name: "Ederson",
    "National Team": "Brazil",
    Position: "GK",
    "Matches Played": 0,
    Starts: 0,
    Minutes: 0,
    Goals: 0,
    Assists: 0,
    "Yellow Cards": 0,
    "Red Cards": 0,
  };

  const expectedPlayerStats = [expectedStatisticsOne, expectedStatisticsTwo];

  const expectedPlayerStandardStatsHeaders: Array<string> = [
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

  const expectedBioParagraphs: Array<string> = [
    "Position",
    "Footed",
    "Height",
    "Weight",
    "Age",
    "National Team",
    "Club",
    "Wages",
  ];

  const testComponentKeys = {
    standardStatsHeaders: expectedPlayerStandardStatsHeaders,
    bioParagraphs: expectedBioParagraphs,
  };

  const emptyStatistics: StatisticsObject = {
    MatchesPlayed: 0,
    Starts: 0,
    Minutes: 0,
    Full90s: 0,
    Goals: 0,
    Assists: 0,
    GoalsPlusAssists: 0,
    NonPenaltyGoals: 0,
    PenaltyKicksMade: 0,
    PenaltyKicksAttempted: 0,
    YellowCards: 0,
    RedCards: 0,
  };

  const expectedStatistics: PlayerStatistics = {
    BySeason: { "2024": emptyStatistics },
    GameLog: {},
  };

  const expectedContract: ContractType = {
    Wage: 1,
    Years: 1,
  };

  const testPlayerSkills: Record<string, SkillSet> = Object.fromEntries(
    Object.entries(playerSkills).map(([name, set]) => [
      name,
      set.map((skill) => [skill, 0]),
    ]),
  );

  const expectedPlayerOne: Player = {
    ID: 0,
    Name: "John Doe",
    PositionGroup: PositionGroup.Midfielder,
    PreferredPosition: Midfielder.CDM,
    PreferredFoot: Foot.Right,
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Spain",
    Club: "Arsenal",
    Contract: expectedContract,
    Rating: 80,
    Skills: testPlayerSkills,
    Statistics: expectedStatistics,
    ComponentKeys: testComponentKeys,
  };

  const expectedPlayerTwo: Player = {
    ID: 1,
    Name: "Ederson",
    PositionGroup: PositionGroup.Midfielder,
    Position: Goalkeeper.GK,
    PreferredFoot: Foot.Right,
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Brazil",
    Club: "Arsenal",
    Contract: expectedContract,
    Rating: 80,
    Skills: testPlayerSkills,
    Statistics: expectedStatistics,
    ComponentKeys: testComponentKeys,
  };

  const testPlayers: Array<Player> = [expectedPlayerOne, expectedPlayerTwo];

  const testClubComponentKeys = {
    clubSummaryStatsHeaders: expectedClubSummaryStatsHeaders,
    clubStandardStatsHeaders: expectedSimpleClubStandardStatsHeaders,
  };

  const testClubStatisticsOne = {
    2024: {
      ID: 0,
      Wins: 1,
      Draws: 2,
      Losses: 3,
      GoalsFor: 4,
      GoalsAgainst: 5,
      GoalDifference: 6,
      Points: 7,
      Record: "1-2-5",
      HomeRecord: "1-0-0",
      AwayRecord: "1-0-0",
      DomesticCompetition: "Round 1",
      DomesticCups: "Round 2",
      ContinentalCup: "Round 3",
    },
    2023: {
      ID: 1,
      Wins: 8,
      Draws: 9,
      Losses: 10,
      GoalsFor: 11,
      GoalsAgainst: 12,
      GoalDifference: 13,
      Points: 14,
      Record: "1-2-3",
      HomeRecord: "1-0-0",
      AwayRecord: "1-0-0",
    },
  };

  const testClubStatisticsTwo = {
    2024: {
      ID: 0,
      Wins: 15,
      Draws: 16,
      Losses: 17,
      GoalsFor: 18,
      GoalsAgainst: 19,
      GoalDifference: 20,
      Points: 21,
    },
    2023: {
      ID: 1,
      Wins: 22,
      Draws: 23,
      Losses: 24,
      GoalsFor: 25,
      GoalsAgainst: 26,
      GoalDifference: 27,
      Points: 28,
    },
  };

  const testClubOne = {
    ID: 0,
    Name: "Arsenal",
    Statistics: {
      BySeason: testClubStatisticsOne,
      GameLog: {},
    },
    Players: testPlayers,
  };

  const testClubTwo = {
    ID: 1,
    Name: "Tottenham",
    Statistics: {
      BySeason: testClubStatisticsTwo,
      GameLog: {},
    },
  };

  const testClubs = [testClubOne, testClubTwo];


  afterEach(async () => {
    cleanup();
  });

  test("start a brand new game ", async () => {
    const TestApp = () => (
      <div>
        <App />
      </div>
    );
    const { user } = renderWithRouter(<TestApp />);

    expect(screen.getByLabelText("Choose a name:")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "save-name" }));
    const saveNameElement = screen.getByRole("textbox", { name: "save-name" });
    const countryElement = screen.getByRole("combobox", {
      name: "country-options",
    });
    const leaguesElement = screen.getByRole("combobox", {
      name: "domestic-league-options",
    });
    const teamsElement = screen.getByRole("combobox", { name: "club-options" });

    //enter a name
    await user.type(saveNameElement, testName);

    await user.selectOptions(countryElement, testCountry);
    expect(
      screen.getByRole("option", { name: testCountry }).selected,
    ).toBeTruthy();

    await user.selectOptions(leaguesElement, testCompetition);
    expect(
      screen.getByRole("option", { name: testCompetition }).selected,
    ).toBeTruthy();

    await user.selectOptions(teamsElement, testClub);
    expect(
      screen.getByRole("option", { name: testClub }).selected,
    ).toBeTruthy();

    // press start game
    await user.click(
      screen.getByText("Start Game", { selector: "button[type='submit']" }),
    );

    await waitFor(() =>
      expect(
        screen.getByText(testCompetition, { selector: "h2" }),
      ).toBeTruthy(),
    );

    const lastSimpleCompHeaderKey: number =
      expectedSimpleCompetitionTableRowHeaders.length - 1;
    const lastSimpleCompHeader: string =
      expectedSimpleCompetitionTableRowHeaders[lastSimpleCompHeaderKey];
    const lastSimpleCompHeaderJoined: string = lastSimpleCompHeader.replace(/\s/g, "");

    await waitFor(() =>
      expect(
        screen.getByText(lastSimpleCompHeader, {
          selector: `th[id='${lastSimpleCompHeaderKey}']`,
        }),
      ).toBeTruthy(),
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          testSeasonStatistics[testSeasonStatistics.length - 1][
            lastSimpleCompHeaderJoined
          ],
          {
            selector: `td[id='${lastSimpleCompHeaderJoined}_${testClubs.length - 1}']`,
          },
        ),
      ).toBeTruthy();
    });

    const lastSimpleClubStandardStatsHeaderKey: number =
      expectedSimpleClubStandardStatsHeaders.length - 1;
    const lastSimpleClubStandardStatsHeader: string =
      expectedSimpleClubStandardStatsHeaders[
        lastSimpleClubStandardStatsHeaderKey
      ];

    const lastSimpleClubStandardStatsHeaderJoined: string =
      lastSimpleClubStandardStatsHeader.replace(/\s/g, "");
    await waitFor(() =>
      expect(
        screen.getByText(lastSimpleClubStandardStatsHeader, {
          selector: `th[id='${lastSimpleClubStandardStatsHeaderKey}']`,
        }),
      ).toBeTruthy(),
    );

    await waitFor(() =>
      expect(
        screen.getByText(
          expectedPlayerStats[expectedPlayerStats.length - 1][
            lastSimpleClubStandardStatsHeader
          ],
          {
            selector: `td[id='${lastSimpleClubStandardStatsHeaderJoined}_${expectedPlayerStats.length - 1}']`,
          },
        ),
      ),
    );
  });
});
