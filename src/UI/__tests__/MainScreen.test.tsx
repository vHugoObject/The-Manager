// @vitest-environment jsdom
import React from "react";
import { StrictMode } from "react";
import { screen, cleanup, waitFor } from "@testing-library/react";
import { describe, expect, test, afterEach } from "vitest";
import "fake-indexeddb/auto";
import { openDB, deleteDB } from "idb";
import { Route, Routes } from "react-router-dom";
import { renderWithRouter } from "../UITestingUtilities";
import {
  ComponentKeysObject,
  StatisticsObject,
  StatisticsType,
} from "../../Common/CommonTypes";
import {
  Player,
  SkillSet,
  PositionGroup,
  Midfielder,
  Goalkeeper,
  Foot,
  ContractType,
  Defender,
} from "../../Players/PlayerTypes";
import { playerSkills } from "../../Players/PlayerSkills";
import {
  Competition,
  AllCompetitions,
} from "../../Competitions/CompetitionTypes";
import { Club } from "../../Clubs/ClubTypes";
import { Save, SaveID } from "../../StorageUtilities/SaveTypes";
import { addSaveToDB } from "../../StorageUtilities/SaveUtilities";
import { MainScreen } from "../MainScreen";

describe("Competition Components", async () => {
  const simpleCompetitionTableRowHeaders: Array<string> = [
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

  const competitionStatisticsArray: Array<string> = [
    "Wins",
    "Draws",
    "Losses",
    "GoalsFor",
    "GoalsAgainst",
    "GoalDifference",
    "Points",
    "MatchesPlayed",
    "Minutes",
    "NonPenaltyGoals",
    "PenaltyKicksMade",
    "PenaltyKicksAttempted",
    "YellowCards",
    "RedCards",
  ];

  const competitionStatisticsObject: Record<string, number> =
    Object.fromEntries(competitionStatisticsArray.map((entry) => [entry, 0]));

  const testClubStatisticsOne: StatisticsObject = {
    Wins: 0,
    Draws: 0,
    Losses: 0,
    GoalsFor: 0,
    GoalsAgainst: 0,
    GoalDifference: 0,
    Points: 0,
    Record: "0-0-0",
    HomeRecord: "0-0-0",
    AwayRecord: "0-0-0",
    DomesticCompetition: "1st Round",
    DomesticCups: "1st Round",
    ContinentalCup: "1st Round",
    MatchesPlayed: 0,
    Minutes: 0,
    NonPenaltyGoals: 0,
    PenaltyKicksMade: 0,
    PenaltyKicksAttempted: 0,
    YellowCards: 0,
    RedCards: 0,
  };

  const playerStatisticsObject: StatisticsObject = {
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

  const expectedPlayerStatistics: StatisticsType = {
    BySeason: { "2024": playerStatisticsObject },
    GameLog: {},
  };

  const expectedContract: ContractType = {
    Wage: 1,
    Years: 1,
  };

  const testPlayerSkills: Record<string, SkillSet> = Object.fromEntries(
    Object.entries(playerSkills).map(([name, set]) => [
      name,
      set.map((skill: string) => [skill, 0]),
    ]),
  );

  const testPlayerOne: Player = {
    ID: 0,
    Name: "John Doe",
    PositionGroup: PositionGroup.Midfielder,
    Position: Midfielder.CDM,
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
    Statistics: expectedPlayerStatistics,
  };

  const testPlayerTwo: Player = {
    ID: 1,
    Name: "John Stones",
    PositionGroup: PositionGroup.Defender,
    Position: Defender.LCB,
    PreferredFoot: Foot.Right,
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "England",
    Club: "Arsenal",
    Contract: expectedContract,
    Value: 1,
    Rating: 80,
    Skills: testPlayerSkills,
    Statistics: expectedPlayerStatistics,
  };

  const testPlayerThree: Player = {
    ID: 2,
    Name: "Luis Enrique",
    PositionGroup: PositionGroup.Midfielder,
    Position: Midfielder.CDM,
    PreferredFoot: Foot.Right,
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Spain",
    Club: "Manchester City",
    Contract: expectedContract,
    Value: 1,
    Rating: 80,
    Skills: testPlayerSkills,
    Statistics: expectedPlayerStatistics,
  };

  const testPlayerFour: Player = {
    ID: 3,
    Name: "Bernardo Silva",
    PositionGroup: PositionGroup.Defender,
    Position: Defender.LCB,
    PreferredFoot: Foot.Right,
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "England",
    Club: "Manchester City",
    Contract: expectedContract,
    Value: 1,
    Rating: 80,
    Skills: testPlayerSkills,
    Statistics: expectedPlayerStatistics,
  };

  const testPlayersOne: Array<Player> = [testPlayerOne, testPlayerTwo];
  const testPlayersTwo: Array<Player> = [testPlayerThree, testPlayerFour];

  const testClubStatistics: StatisticsType = {
    BySeason: { "2024": testClubStatisticsOne },
    GameLog: {},
  };

  const testClubOne: Club = {
    ID: 0,
    Name: "Arsenal",
    Statistics: testClubStatistics,
    Squad: testPlayersOne,
    Starting11: [],
    Bench: [],
  };

  const testClubTwo: Club = {
    ID: 1,
    Name: "Chelsea",
    Statistics: testClubStatistics,
    Squad: testPlayersTwo,
    Starting11: [],
    Bench: [],
  };

  const testClubThree: Club = {
    ID: 2,
    Name: "Everton",
    Statistics: testClubStatistics,
    Squad: testPlayersOne,
    Starting11: [],
    Bench: [],
  };

  const testClubFour: Club = {
    ID: 3,
    Name: "Ashton Villa",
    Statistics: testClubStatistics,
    Squad: testPlayersOne,
    Starting11: [],
    Bench: [],
  };

  const testClubs: Array<Club> = [testClubOne, testClubTwo];

  const testCompetitionStatistics: StatisticsType = {
    BySeason: { "2024": competitionStatisticsObject },
    GameLog: {},
  };

  const testCompetitionOne: Competition = {
    Name: "English Premier League",
    Clubs: testClubs,
    Statistics: testCompetitionStatistics,
  };

  const testAllCompetitionsOne: AllCompetitions = {
    England: {
      "English Premier League": testCompetitionOne,
    },
  };

  const testCountry: string = "England";
  const testCompetitionName: string = "English Premier League";
  const testNameOne: string = "Mikel Arteta";
  const testClubNameOne: string = "Arsenal";
  const testSeason: string = "2024";
  const testFirstDay: Date = new Date("8/18/24");

  const expectedPlayerStats = testPlayersOne.map((player: Player) => {
    return {
      Name: player.Name,
      NationalTeam: player.NationalTeam,
      Position: player.Position,
      ...player.Statistics.BySeason[testSeason],
    };
  });

  const testSave: Save = {
    Name: testNameOne,
    Country: testCountry,
    MainCompetition: testCompetitionName,
    Club: testClubNameOne,
    Seasons: 1,
    CurrentSeason: "2024",
    CurrentDate: testFirstDay,
    allCompetitions: testAllCompetitionsOne,
    saveID: "1",
  };

  const testSeasonStatistics: Array<StatisticsObject> = [
    testClubOne.Statistics,
    testClubTwo.Statistics,
  ].map((club, index) => {
    const statisticsOnly = club["BySeason"][testSeason];

    statisticsOnly["Club"] = testClubs[index].Name;
    return statisticsOnly;
  });

  const testDBName: string = "the-manager";

  const saveID: SaveID = await addSaveToDB(testSave);

  const simButtonNames: Array<string> = [
    "one-day",
    "one-week",
    "one-month",
    "until-deadline",
    "until-season-end",
  ];

  afterEach(async () => {
    cleanup();
    await deleteDB(testDBName);
  });

  test("test MainScreen", async () => {
    const App = () => (
      <StrictMode>
        <Routes>
          <Route path="/save/:saveID" element={<MainScreen />} />
        </Routes>
      </StrictMode>
    );
    const { user } = renderWithRouter(<App />, { route: `save/${saveID}` });
    expect(
      screen.getByText("The Manager", { selector: "h2[id='site-banner']" }),
    ).toBeTruthy();

    expect(
      screen.getByRole("button", { name: "control-side-menu" }),
    ).toBeTruthy();

    expect(() => {
      screen.getByText("Switch Save", { selector: "a[href='/']" });
    }).toThrowError();

    await user.click(screen.getByRole("button", { name: "control-side-menu" }));

    expect(
      screen.getByText("Switch Save", { selector: "a[href='/']" }),
    ).toBeTruthy();

    expect(screen.getByRole("button", { name: "sim-button" }));

    simButtonNames.forEach((buttonName: string) => {
      expect(() =>
        screen.getByRole("button", { name: buttonName }),
      ).toThrowError();
    });

    await user.click(screen.getByRole("button", { name: "sim-button" }));

    simButtonNames.forEach((buttonName: string) => {
      expect(screen.getByRole("button", { name: buttonName })).toBeTruthy();
    });

    const expectedDate: string = testFirstDay.toDateString();
    await waitFor(() =>
      expect(
        screen.getByText(expectedDate, { selector: "h2[id=current-date]" }),
      ).toBeTruthy(),
    );
    await waitFor(() =>
      expect(
        screen.getByText(testCompetitionName, { selector: "h2" }),
      ).toBeTruthy(),
    );

    const lastSimpleCompHeaderKey = simpleCompetitionTableRowHeaders.length - 1;
    const lastSimpleCompHeader =
      simpleCompetitionTableRowHeaders[lastSimpleCompHeaderKey];
    const lastSimpleCompHeaderJoined = lastSimpleCompHeader.replace(/\s/g, "");

    await waitFor(() =>
      expect(
        screen.getByText(lastSimpleCompHeader, {
          selector: `th[id='${lastSimpleCompHeaderKey}']`,
        }),
      ).toBeTruthy(),
    );

    simpleCompetitionTableRowHeaders.forEach((expectedColumnHeader) => {
      expect(
        screen.getByText(expectedColumnHeader, { selector: "th" }),
      ).toBeTruthy();
    });

    await waitFor(() => {
      const lastClub: Club = testClubs[testClubs.length - 1];
      const lastStatFromLastClub: StatisticsObject =
        lastClub.Statistics.BySeason[testSeason];
      expect(
        screen.getByText(lastStatFromLastClub[lastSimpleCompHeaderJoined], {
          selector: `td[id='${lastSimpleCompHeaderJoined}_${testClubs.length - 1}']`,
        }),
      ).toBeTruthy();
    });

    testClubs.forEach((club: Club, index) => {
      const clubStats: StatisticsObject = club.Statistics.BySeason[testSeason];
      clubStats["Club"] = club.Name;
      simpleCompetitionTableRowHeaders.forEach((header: string) => {
        expect(
          screen.getByText(clubStats[header], {
            selector: `td[id='${header}_${index}']`,
          }),
        ).toBeTruthy();
      });
    });

    expect(screen.getByText(testClubOne.Name, { selector: "h2" })).toBeTruthy();

    expectedClubSummaryStatsHeaders.forEach((expectedClubHeader) => {
      const testStat =
        testClubOne.Statistics.BySeason[testSeason][
          expectedClubHeader.replace(/\s/g, "")
        ];
      const expectedParagraphValue = new RegExp(
        String.prototype.concat("^", expectedClubHeader, ":", " ", testStat),
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
            lastSimpleClubStandardStatsHeader.replace(/\s/g, "")
          ],
          {
            selector: `td[id='${lastSimpleClubStandardStatsHeaderJoined}_${expectedPlayerStats.length - 1}']`,
          },
        ),
      ),
    );

    expectedPlayerStats.forEach((player, index) => {
      expectedSimpleClubStandardStatsHeaders.forEach((expectedColumnHeader) => {
        const expectedColumnHeaderJoined = expectedColumnHeader.replace(
          /\s/g,
          "",
        );
        expect(
          screen.getByText(player[expectedColumnHeaderJoined], {
            selector: `td[id='${expectedColumnHeaderJoined}_${index}']`,
          }),
        ).toBeTruthy();
      });
    });
  });
});
