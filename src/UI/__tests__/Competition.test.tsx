// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, afterEach } from "vitest";
import { CompetitionTable } from "../Competition";

describe("Competition Components", async () => {
  const expectedCompetitionTableRowHeaders = [
    "Club",
    "Wins",
    "Draws",
    "Losses",
    "Goals For",
    "Goals Against",
    "Goal Difference",
    "Points",
  ];

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

  const testSeason = 2024;

  const testSeasonStatistics = [
    testClubStatisticsOne,
    testClubStatisticsTwo,
  ].map((club, index) => {
    const statisticsOnly = club[testSeason];
    statisticsOnly["Club"] = testClubs[index].Name;
    return statisticsOnly;
  });

  const testCompetitionName = "The Premier League";
  const testCompetition = {
    Name: testCompetitionName,
    Clubs: testClubs,
    ComponentKeys: {
      competitionTableRowHeaders: expectedCompetitionTableRowHeaders,
    },
  };

  afterEach(async () => {
    cleanup();
  });

  test("test CompetitionTable", async () => {
    render(
      <CompetitionTable competition={testCompetition} season={testSeason} />,
    );

    expect(screen.getByRole("table")).toBeTruthy();
    expect(
      screen.getByText(testCompetitionName, { selector: "h2" }),
    ).toBeTruthy();

    expectedCompetitionTableRowHeaders.forEach((expectedColumnHeader) => {
      expect(
        screen.getByText(expectedColumnHeader, { selector: "th" }),
      ).toBeTruthy();
    });

    testSeasonStatistics.forEach((testClub, index) => {
      expectedCompetitionTableRowHeaders.forEach((columnHeader) => {
        const expectedKey = columnHeader.replace(/\s/g, "");
        expect(
          screen.getByText(testClub[expectedKey], {
            selector: `td[id='${expectedKey}_${index}']`,
          }),
        ).toBeTruthy();
      });
    });
  });
});
