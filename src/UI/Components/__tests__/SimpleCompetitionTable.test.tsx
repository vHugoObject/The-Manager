// @vitest-environment jsdom
import React from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { describe, expect, test, afterEach } from "vitest";
import {
  ComponentKeysObject,
  StatisticsObject,
  StatisticsType,
} from "../../../Common/CommonTypes";
import { Save, SaveID } from "../../../StorageUtilities/SaveTypes";
import { Competition, AllCompetitions } from "../../../Competitions/CompetitionTypes";
import { Club } from "../../../Clubs/ClubTypes";
import {
  Player,
  SkillSet,
  PositionGroup,
  Midfielder,
  Attacker,
  Goalkeeper,
  Defender,
  BiographicalDetails,
  Foot,
  ContractType,
} from "../../../Players/PlayerTypes";
import { playerSkills } from "../../../Players/PlayerSkills";
import { SimpleCompetitionTable } from "../SimpleCompetitionTable";

describe("SimpleCompetitionTable component", async () => {

  const simpleCompetitionTableRowHeaders: Array<string> = [
    "Club",
    "Wins",
    "Draws",
    "Losses",
    "Points",
  ];

    const fullCompetitionTableRowHeaders: Array<string> = [
    "Club",
    "Wins",
    "Draws",
    "Losses",
    "Goals For",
    "Goals Against",
    "Goal Difference",
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

  const testComponentKeys = {
    standardStatsHeaders: expectedPlayerStandardStatsHeaders,
    bioParagraphs: expectedBioParagraphs,
  };

  

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
  
  const expectedCompetitionStatistics: StatisticsType = {
    BySeason: { "2024": competitionStatisticsObject },
    GameLog: {},
  };

  const expectedCompetitionComponentKeys: ComponentKeysObject = {
    simpleCompetitionTableRowHeaders,
    fullCompetitionTableRowHeaders,
  };

  const clubStandardStatsHeaders: Array<string> = [
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

  const clubSummaryStatsHeaders: Array<string> = [
    "Record",
    "Home Record",
    "Away Record",
    "Manager",
    "Country",
    "Domestic Competition",
    "Domestic Cups",
    "Continental Cup",
  ];

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

  const expectedClubStatistics: StatisticsType = {
    BySeason: { "2024": testClubStatisticsOne },
    GameLog: {},
  };

  const expectedClubComponentKeys: ComponentKeysObject = {
    clubStandardStatsHeaders,
    clubSummaryStatsHeaders,
  };

  const playerStandardStatsHeaders: Array<string> = [
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

  const playerBioParagraphs: Array<string> = [
    "Position",
    "Footed",
    "Height",
    "Weight",
    "Age",
    "National Team",
    "Club",
    "Wages",
  ];

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

  const expectedPlayerComponentKeys: ComponentKeysObject = {
    playerStandardStatsHeaders,
    playerBioParagraphs,
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

  const testClubComponentKeys: ComponentKeysObject = {
    clubStandardStatsHeaders,
    clubSummaryStatsHeaders,
  };
  const testClubOne: Club = {
    ID: 0,
    Name: "Arsenal",
    Statistics: testClubStatistics,
    Players: testPlayersOne,

  };

  const testClubTwo: Club = {
    ID: 1,
    Name: "Chelsea",
    Statistics: testClubStatistics,
    Players: testPlayersTwo,
  };

  const testClubThree: Club = {
    ID: 2,
    Name: "Everton",
    Statistics: testClubStatistics,
    Players: testPlayersOne,
  
  };

  const testClubFour: Club = {
    ID: 3,
    Name: "Ashton Villa",
    Statistics: testClubStatistics,
    Players: testPlayersOne,

  };


  const testClubs: Array<Club> = [testClubOne, testClubTwo];
  
  const testCompetitionStatistics: StatisticsType = {
    BySeason: { "2024": competitionStatisticsObject },
    GameLog: {},
  };

  const testCompetitionComponentKeys: ComponentKeysObject = {
    simpleCompetitionTableRowHeaders,
    fullCompetitionTableRowHeaders,
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



  const testSave: Save = {
      Name: testNameOne,
      Country: testCountry,
      MainCompetition: testCompetitionName,
      Club: testClubNameOne,
      Seasons: 1,
      CurrentSeason: "2024",
      allCompetitions: testAllCompetitionsOne
  };


  afterEach(async () => {
    cleanup();
  });

  test("test SimpleCompetitionTable component", async () => {
    render(<SimpleCompetitionTable save={testSave}
	     season={testSeason}
    />);
    await waitFor(() =>
      expect(
        screen.getByText(testCompetitionName, { selector: "h2" }),
      ).toBeTruthy(),
    );

    const lastSimpleCompHeaderKey =
      simpleCompetitionTableRowHeaders.length - 1;
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
      const lastStatFromLastClub: StatisticsObject = lastClub.Statistics.BySeason[testSeason];      
      expect(
        screen.getByText(
	  lastStatFromLastClub[lastSimpleCompHeaderJoined]
          ,
          {
            selector: `td[id='${lastSimpleCompHeaderJoined}_${testClubs.length - 1}']`,
          },
        ),
      ).toBeTruthy();
    });

    testClubs.forEach((club: Club, index) => {
      const clubStats: StatisticsObject = club.Statistics.BySeason[testSeason];
      clubStats["Club"] = club.Name;
      simpleCompetitionTableRowHeaders.forEach((header: string) => {
	expect(
        screen.getByText(
	  clubStats[header],          
          {
            selector: `td[id='${header}_${index}']`,
          },
        ),
      ).toBeTruthy();
      })
    })
   

  });
});
