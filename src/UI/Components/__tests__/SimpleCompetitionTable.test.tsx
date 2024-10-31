// @vitest-environment jsdom
import React from "react";
import { setup } from "../../UITestingUtilities";
import { screen, cleanup, waitFor } from "@testing-library/react";
import { describe, expect, test, afterEach } from "vitest";
import { StatisticsObject, StatisticsType } from "../../../Common/CommonTypes";
import { Save, SaveID } from "../../../StorageUtilities/SaveTypes";
import {
  Competition,
  AllCompetitions,
} from "../../../Competitions/CompetitionTypes";
import { Club } from "../../../Clubs/ClubTypes";
import {
  Player,
  SkillSet,
  PositionGroup,
  Midfielder,
  Defender,
  Foot,
  ContractType,
} from "../../../Players/PlayerTypes";
import { playerSkills } from "../../../Players/PlayerSkills";
import { SaveContext } from "../../DatabaseManagement";
import { SimpleCompetitionTable } from "../SimpleCompetitionTable";

describe("SimpleCompetitionTable component", async () => {
  const simpleCompetitionTableRowHeaders: Array<string> = [
    "Club",
    "Wins",
    "Draws",
    "Losses",
    "Points",
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
    Record: "",
    HomeRecord: "",
    AwayRecord: "",
    DomesticCompetition: "",
    DomesticCups: "",
    ContinentalCup: "",
    MatchesPlayed: 0,
    Minutes: 0,
    NonPenaltyGoals: 0,
    PenaltyKicksMade: 0,
    PenaltyKicksAttempted: 0,
    YellowCards: 0,
    RedCards: 0,
  };

  const playerStatisticsArray: Array<string> = [
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

  const playerStatisticsObject: Record<string, number> = Object.fromEntries(
    playerStatisticsArray.map((entry) => [entry, 0]),
  );

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

  const testClubs: Array<Club> = [
    testClubOne,
    testClubTwo,
    testClubThree,
    testClubFour,
  ];

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

  afterEach(async () => {
    cleanup();
  });

  test("test SimpleCompetitionTable component", async () => {
    const TestSimpleCompetitionTable = ({ testInitialSaveContext }) => {
      return (
        <div id="test-simple-comp-table">
          <SaveContext.Provider value={testInitialSaveContext}>
            <SimpleCompetitionTable season={testSeason} />
          </SaveContext.Provider>
        </div>
      );
    };

    setup(<TestSimpleCompetitionTable testInitialSaveContext={testSave} />);

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
  });
});
