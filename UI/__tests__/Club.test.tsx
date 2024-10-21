// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, afterEach } from "vitest";
import { ClubStandardStats } from "../Club";

describe("Club Components", async () => {
  const expectedClubStandardStatsHeaders = [
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

  const expectedClubSummaryStatsHeaders = [
    "Record",
    "Home Record",
    "Away Record",
    "Manager",
    "Country",
    "Domestic Competition",
    "Domestic Cups",
    "Continental Cup",
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

  const testClubComponentKeys = {
    clubSummaryStatsHeaders: expectedClubSummaryStatsHeaders,
    clubStandardStatsHeaders: expectedClubStandardStatsHeaders,
  };

  const testPlayerComponentKeys = {
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

  const testStatisticsThree = {
    ID: 0,
    Season: 2024,
    MatchesPlayed: 27,
    Starts: 28,
    Minutes: 29,
    Full90s: 30,
    Goals: 31,
    Assists: 32,
    GoalsPlusAssists: 33,
    NonPenaltyGoals: 34,
    PenaltyKicksMade: 35,
    PenaltyKicksAttempted: 36,
    YellowCards: 37,
    RedCards: 38,
  };

  const testStatisticsFour = {
    ID: 1,
    Season: 2023,
    MatchesPlayed: 39,
    Starts: 40,
    Minutes: 41,
    Full90s: 42,
    Goals: 43,
    Assists: 44,
    GoalsPlusAssists: 45,
    NonPenaltyGoals: 46,
    PenaltyKicksMade: 47,
    PenaltyKicksAttempted: 48,
    YellowCards: 49,
    RedCards: 50,
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
    ComponentKeys: testPlayerComponentKeys,
  };

  const testPlayerTwo = {
    ID: 1,
    Name: "Ederson",
    NationalTeam: "Brazil",
    Position: "Goalkeeper",
    Statistics: {
      BySeason: { 2024: testStatisticsThree, 2023: testStatisticsFour },
      GameLog: {},
    },
    ComponentKeys: testPlayerComponentKeys,
  };

  const testPlayers = [testPlayerOne, testPlayerTwo];

  const testClubStatisticsOne = {
    ID: 0,
    Wins: 3,
    Draws: 1,
    Losses: 0,
    GoalsFor: 6,
    GoalsAgainst: 1,
    GoalDifference: 5,
    Points: 10,
    Record: "3-1-0, 10 points, 2nd in Premier League",
    HomeRecord: "1-1-0, 4 points",
    AwayRecord: "2-0-0, 6 points",
  };

  const testClubOne = {
    ID: 0,
    Name: "Arsenal",
    Statistics: testClubStatisticsOne,
    Manager: "Mike Arteta",
    Country: "England",
    DomesticCompetition: "English Premier Competition",
    ContinentalCups: "Champions Competition",
    DomesticCups: "EFL Cup",
    Players: testPlayers,
    ComponentKeys: testClubComponentKeys,
  };

  const testClubStatisticsTwo = {
    ID: 0,
    Wins: 3,
    Draws: 0,
    Losses: 1,
    GoalsFor: 7,
    GoalsAgainst: 1,
    GoalDifference: 6,
    Points: 10,
    Record: "3-0-1, 9 points, 4th in Premier League",
    HomeRecord: "1-0-1, 3 points",
    AwayRecord: "2-0-0, 6 points",
  };
  const testClubTwo = {
    ID: 1,
    Name: "Liverpool",
    Statistics: testClubStatisticsTwo,
    Manager: "Arne Slot",
    Country: "England",
    DomesticCompetition: "English Premier League",
    ContinentalCup: "Champions Leagues",
    DomesticCups: "EFL Cup",
    Players: [],
    ComponentKeys: testClubComponentKeys,
  };

  const testClubs = [testClubOne, testClubTwo];
  const testSeason = 2024;
  afterEach(async () => {
    cleanup();
  });

  test("test ClubStandardStats", async () => {
    render(<ClubStandardStats tableClub={testClubOne} date={testSeason} />);

    expect(screen.getByText(testClubOne.Name, { selector: "h2" })).toBeTruthy();

    expectedClubSummaryStatsHeaders.forEach((expectedClubHeader) => {
      const expectedParagraphValue = new RegExp(
        String.prototype.concat(
          "^",
          expectedClubHeader,
          ":",
          " ",
          testClubOne[expectedClubHeader.replace(/\s/g, "")],
        ),
      );
      expect(
        screen.getByText(expectedParagraphValue, { selector: "strong" }),
      ).toBeTruthy();
    });

    expectedClubStandardStatsHeaders.forEach((expectedColumnHeader, index) => {
      expect(
        screen.getByText(expectedColumnHeader, {
          selector: `th[id='${index}']`,
        }),
      ).toBeTruthy();
    });

    testPlayers.forEach((testPlayer, index) => {
      const testPlayerSeason = testPlayer.Statistics.BySeason[testSeason];
      expectedClubStandardStatsHeaders.forEach((columnHeader) => {
        const expectedKey = columnHeader.replace(/\s/g, "");
        expect(
          screen.getByText(testPlayerSeason[expectedKey], {
            selector: `td[id='${expectedKey}_${index}']`,
          }),
        ).toBeTruthy();
      });
    });
  });
});
