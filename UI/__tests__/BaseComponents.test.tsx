// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, test, afterEach } from "vitest";
import {
  TableColumnHeaders,
  TableRow,
  SimpleHeader,
  ExtendedHeader,
  TableWithExtendedHeader,
  TableWithSimpleHeader,
  BaseTable,
} from "../BaseComponents";

describe("Base Component tests", async () => {
  const expectedSummaryStats = [
    "Name",
    "Wins",
    "Draws",
    "Losses",
    "Goals For",
    "Goals Against",
    "Goal Difference",
    "Points",
  ];

  const expectedClubStandardStats = [
    "Player",
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

  const expectedClubHeaders = [
    "Record",
    "Home Record",
    "Away Record",
    "Manager",
    "Country",
    "Domestic Competition",
    "Domestic Cups",
    "Continental Cup",
  ];

  const testComponentKeys = {
    tableColumnHeaders: expectedClubStandardStats,
    clubHeaders: expectedClubHeaders,
  };

  const expectedCompetitionNames = [
    "English Premier Competition",
    "Spanish La Liga",
    "German Bundesliga",
    "Italian Serie A",
    "French Ligue 1",
  ];

  const testDataOne = {
    ID: 0,
    Player: "John Doe",
    NationalTeam: "Spain",
    Position: "Midfielder",
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

  const testPlayerTwo = {
    ID: 1,
    Name: "Ederson",
    NationalTeam: "Brazil",
    Position: "Goalkeeper",
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

  const testPlayers = [testDataOne, testPlayerTwo];
  const testClubOne = {
    ID: 0,
    Name: "Arsenal",
    Wins: 3,
    Draws: 1,
    Losses: 0,
    GoalsFor: 6,
    GoalsAgainst: 1,
    GoalDifference: 5,
    Points: 10,
    Record: "3-1-0, 10 points, 2nd in Premier Competition",
    HomeRecord: "1-1-0, 4 points",
    AwayRecord: "2-0-0, 6 points",
    Manager: "Mike Arteta",
    Country: "England",
    DomesticCompetition: "English Premier Competition",
    ContinentalCups: "Champions Competition",
    DomesticCups: "EFL Cup",
    Players: testPlayers,
    ComponentKeys: testComponentKeys,
  };

  const testClubTwo = {
    ID: 1,
    Name: "Liverpool",
    Wins: 3,
    Draws: 0,
    Losses: 1,
    GoalsFor: 7,
    GoalsAgainst: 1,
    GoalDifference: 6,
    Points: 10,
    Record: "3-0-1, 9 points, 4th in Premier Competition",
    HomeRecord: "1-0-1, 3 points",
    AwayRecord: "2-0-0, 6 points",
    Manager: "Arne Slot",
    Country: "England",
    DomesticCompetition: "English Premier Competition",
    ContinentalCup: "Champions Competition",
    DomesticCups: "EFL Cup",
    Players: [],
    ComponentKeys: testComponentKeys,
  };

  const testClubs = [testClubOne, testClubTwo];
  const testCompetitionName = "The Premier Competition";
  const testCompetition = {
    Name: testCompetitionName,
    Clubs: testClubs,
    ComponentKeys: { tableColumnHeaders: expectedSummaryStats },
  };

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
      1: testStatisticsOne,
      2: testStatisticsTwo,
    },
    ComponentKeys: testComponentKeys,
  };

  afterEach(async () => {
    cleanup();
  });

  test("test SimpleHeader", async () => {
    expectedCompetitionNames.forEach((expectedHeader) => {
      render(<SimpleHeader entityName={expectedHeader} />);
      expect(screen.getByText(expectedHeader, { selector: "h2" })).toBeTruthy();
    });
  });

  test("test ClubHeader", async () => {
    testClubs.forEach((testClub) => {
      render(
        <ExtendedHeader entity={testClub} paragraphs={expectedClubHeaders} />,
      );
      expect(screen.getByText(testClub.Name, { selector: "h2" })).toBeTruthy();

      expectedClubHeaders.forEach((expectedClubHeader) => {
        expect(
          screen.getByText(
            new RegExp(String.prototype.concat("^", expectedClubHeader, ":")),
            { selector: "strong" },
          ),
        ).toBeTruthy();
      });
      cleanup();
    });
  });

  test("test TableColumnHeaders", async () => {
    const table = document.createElement("table");

    render(<TableColumnHeaders columnHeaders={expectedSummaryStats} />, {
      container: document.body.appendChild(table),
    });

    expectedSummaryStats.forEach((expectedColumnHeader) => {
      expect(
        screen.getByText(expectedColumnHeader, { selector: "th" }),
      ).toBeTruthy();
    });
  });

  test("test TableRow", async () => {
    const table = document.createElement("table");

    render(
      <tbody>
        <TableRow
          key={testDataOne.ID}
          entity={testDataOne}
          tableColumnHeaders={expectedClubStandardStats}
          rowKey={1}
        />
      </tbody>,
      { container: document.body.appendChild(table) },
    );

    expectedClubStandardStats.forEach((expectedColumnHeader) => {
      const expectedKey = expectedColumnHeader.replace(/\s/g, "");
      expect(
        screen.getByText(testDataOne[expectedKey], {
          selector: `td[id=${expectedKey}_1]`,
        }),
      ).toBeTruthy();
    });
  });

  test("test BaseTable", async () => {
    render(
      <BaseTable
        rows={testPlayerOne.Statistics}
        columnHeaders={expectedPlayerStandardStatsHeaders}
      />,
    );

    expectedPlayerStandardStatsHeaders.forEach(
      (expectedColumnHeader, index) => {
        expect(
          screen.getByText(expectedColumnHeader, {
            selector: `th[id='${index}']`,
          }),
        ).toBeTruthy();

        Object.values(testPlayerOne.Statistics).forEach((testSeason, index) => {
          const expectedKey = expectedColumnHeader.replace(/\s/g, "");
          expect(
            screen.getByText(testSeason[expectedKey], {
              key: expectedColumnHeader,
              selector: `td[id='${expectedKey}_${index}']`,
            }),
          ).toBeTruthy();
        });
      },
    );
  });
});
