// @vitest-environment jsdom
import { StrictMode } from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { describe, expect, test, afterEach } from "vitest";
import "fake-indexeddb/auto";
import { openDB, deleteDB } from "idb";
import { Route, Routes } from "react-router-dom";
import { renderWithRouter } from "./TestingUtilities";
import { MainScreen } from "../MainScreen";
import {
  Player,
  SkillSet,
  PlayerStatistics,
  StatisticsObject,
  PositionGroup,
  Midfielder,
  Attacker,
  Goalkeeper,
  Defender,
  BiographicalDetails,
  Foot,
} from "../../Players/PlayerTypes";
import { playerSkills } from "../../Players/PlayerSkills";

describe("Competition Components", async () => {
  const expectedSimpleCompetitionTableRowHeaders = [
    "Club",
    "Wins",
    "Draws",
    "Losses",
    "Points",
  ];

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
    Value: 1,
    Rating: 80,
    Skills: testPlayerSkills,
    Statistics: expectedStatistics,
    ComponentKeys: testComponentKeys,
  };

  const expectedPlayerTwo: Player = {
    ID: 1,
    Name: "Ederson",
    PositionGroup: PositionGroup.Midfielder,
    PreferredPosition: Goalkeeper.GK,
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
      simpleCompetitionTableRowHeaders:
        expectedSimpleCompetitionTableRowHeaders,
    },
  };

  const testSave = {
    currentSeason: testSeason,
    playerClub: testClubOne,
    playerMainCompetition: testCompetition,
  };

  const testDBName = "the-manager";
  const saves = "save-games";

  const version: number = 1;
  const db = await openDB(testDBName, version, {
    upgrade(db) {
      db.createObjectStore(saves, {
        autoIncrement: true,
      });
    },
  });

  const saveID: number = await db.add(saves, testSave);

  afterEach(async () => {
    cleanup();
    db.close();
    await deleteDB(testDBName);
  });

  test("test MainScreen", async () => {
    // MainScreen needs to be rendered with the route
    const App = () => (
      <StrictMode>
        <Routes>
          <Route path="/save/:saveID" element={<MainScreen />} />
        </Routes>
      </StrictMode>
    );
    renderWithRouter(<App />, { route: `save/${saveID}` });

    await waitFor(() =>
      expect(
        screen.getByText(testCompetitionName, { selector: "h2" }),
      ).toBeTruthy(),
    );

    const lastSimpleCompHeaderKey =
      expectedSimpleCompetitionTableRowHeaders.length - 1;
    const lastSimpleCompHeader =
      expectedSimpleCompetitionTableRowHeaders[lastSimpleCompHeaderKey];
    const lastSimpleCompHeaderJoined = lastSimpleCompHeader.replace(/\s/g, "");

    await waitFor(() =>
      expect(
        screen.getByText(lastSimpleCompHeader, {
          selector: `th[id='${lastSimpleCompHeaderKey}']`,
        }),
      ).toBeTruthy(),
    );

    expectedSimpleCompetitionTableRowHeaders.forEach((expectedColumnHeader) => {
      expect(
        screen.getByText(expectedColumnHeader, { selector: "th" }),
      ).toBeTruthy();
    });

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

    testSeasonStatistics.forEach((testClub, index) => {
      expectedSimpleCompetitionTableRowHeaders.forEach((columnHeader) => {
        const expectedKey = columnHeader.replace(/\s/g, "");
        expect(
          screen.getByText(testClub[expectedKey], {
            selector: `td[id='${expectedKey}_${index}']`,
          }),
        ).toBeTruthy();
      });
    });

    expect(screen.getByText(testClubOne.Name, { selector: "h2" })).toBeTruthy();

    expectedClubSummaryStatsHeaders.forEach((expectedClubHeader) => {
      const expectedParagraphValue = new RegExp(
        String.prototype.concat(
          "^",
          expectedClubHeader,
          ":",
          " ",
          testClubOne.Statistics.BySeason[testSeason][
            expectedClubHeader.replace(/\s/g, "")
          ],
        ),
      );
      expect(
        screen.getByText(expectedParagraphValue, { selector: "strong" }),
      ).toBeTruthy();
    });

    const lastSimpleClubStandardStatsHeaderKey =
      expectedSimpleClubStandardStatsHeaders.length - 1;
    const lastSimpleClubStandardStatsHeader =
      expectedSimpleClubStandardStatsHeaders[
        lastSimpleClubStandardStatsHeaderKey
      ];

    const lastSimpleClubStandardStatsHeaderJoined =
      lastSimpleClubStandardStatsHeader.replace(/\s/g, "");
    await waitFor(() =>
      expect(
        screen.getByText(lastSimpleClubStandardStatsHeader, {
          selector: `th[id='${lastSimpleClubStandardStatsHeaderKey}']`,
        }),
      ).toBeTruthy(),
    );

    expectedSimpleClubStandardStatsHeaders.forEach(
      (expectedColumnHeader, index) => {
        expect(
          screen.getByText(expectedColumnHeader, {
            selector: `th[id='${index}']`,
          }),
        ).toBeTruthy();
      },
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

    expectedPlayerStats.forEach((player, index) => {
      Object.entries(player).forEach(([columnHeader, expectedValue]) => {
        const expectedKey = columnHeader.replace(/\s/g, "");
        expect(
          screen.getByText(expectedValue, {
            selector: `td[id='${expectedKey}_${index}']`,
          }),
        ).toBeTruthy();
      });
    });
  });
});
