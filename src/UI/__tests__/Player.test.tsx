// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, afterEach } from "vitest";
import { PlayerStandardStats } from "../Player";

describe("Player Components", async () => {
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

  const testComponentKeys = {
    standardStatsHeaders: expectedPlayerStandardStatsHeaders,
    bioParagraphs: expectedBioParagraphs,
  };

  const testStatisticsOne = {
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

  const testStatisticsTwo = {
    ID: 1,
    Season: 2023,
    MatchesPlayed: 15,
    Starts: 16,
    Minutes: 17,
    Full90s: 18,
    Goals: 19,
    Assists: 20,
    GoalsPlusAssists: 21,
    NonPenaltyGoals: 22,
    PenaltyKicksMade: 23,
    PenaltyKicksAttempted: 24,
    YellowCards: 25,
    RedCards: 26,
  };

  const testPlayerOne = {
    ID: 0,
    Name: "John Doe",
    Position: "Midfielder",
    Footed: "Right",
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Spain",
    Club: "Arsenal",
    Wages: 60_000,
    Statistics: {
      BySeason: { 2024: testStatisticsOne, 2023: testStatisticsTwo },
      GameLog: {},
    },
    ComponentKeys: testComponentKeys,
  };

  afterEach(async () => {
    cleanup();
  });

  test("test PlayerStats", async () => {
    render(<PlayerStandardStats player={testPlayerOne} />);
    expect(
      screen.getByText(testPlayerOne.Name, { selector: "h2" }),
    ).toBeTruthy();

    expectedBioParagraphs.forEach((expectedPlayerHeader) => {
      const expectedParagraphValue = new RegExp(
        String.prototype.concat(
          "^",
          expectedPlayerHeader,
          ":",
          " ",
          testPlayerOne[expectedPlayerHeader.replace(/\s/g, "")],
        ),
      );
      expect(
        screen.getByText(expectedParagraphValue, { selector: "strong" }),
      ).toBeTruthy();
    });

    expectedPlayerStandardStatsHeaders.forEach(
      (expectedColumnHeader, index) => {
        expect(
          screen.getByText(expectedColumnHeader, {
            selector: `th[id='${index}']`,
          }),
        ).toBeTruthy();

        Object.values(testPlayerOne.Statistics.BySeason).forEach(
          (testSeason, index) => {
            const expectedKey = expectedColumnHeader.replace(/\s/g, "");
            expect(
              screen.getByText(testSeason[expectedKey], {
                selector: `td[id='${expectedKey}_${index}']`,
              }),
            ).toBeTruthy();
          },
        );
      },
    );
  });
});
