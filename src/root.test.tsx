// @vitest-environment jsdom
import React from "react";
import { screen, cleanup, waitFor } from "@testing-library/react";
import { describe, expect, test, afterEach } from "vitest";
import "fake-indexeddb/auto";
import { deleteDB } from "idb";
import { renderWithRouter } from "./UI/UITestingUtilities";
import {
  ComponentKeysObject,
  StatisticsObject,
  StatisticsType,
} from "./Common/CommonTypes";
import { Competition, AllCompetitions } from "./Competitions/CompetitionTypes";
import {
  Player,
  SkillSet,
  PositionGroup,
  Midfielder,
  Goalkeeper,
  Defender,
  Foot,
  ContractType,
} from "./Players/PlayerTypes";
import { playerSkills } from "./Players/PlayerSkills";
import { Club } from "./Clubs/ClubTypes";
import { addSaveToDB } from "./StorageUtilities/SaveUtilities";
import { Save, SaveID } from './StorageUtilities/SaveTypes'
import { App } from "./root";

describe("test the app from the root", async () => {


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


  const expectedPlayerStats = testPlayersOne.map((player: Player) => {
    return {
      Name: player.Name,
      NationalTeam: player.NationalTeam,
      Position: player.Position,
      ...player.Statistics.BySeason[testSeason]
    }
  })

  const testSave: Save = {
      Name: testNameOne,
      Country: testCountry,
      MainCompetition: testCompetitionName,
      Club: testClubNameOne,
      Seasons: 1,
      CurrentSeason: "2024",
      allCompetitions: testAllCompetitionsOne
  };
  
  const testSeasonStatistics: Array<StatisticsObject> = [
    testClubOne.Statistics,
    testClubTwo.Statistics    
  ].map((club, index) => {

    const statisticsOnly = club["BySeason"][testSeason];

    statisticsOnly["Club"] = testClubs[index].Name;
    return statisticsOnly;
  });

      const lastSimpleClubStandardStatsHeaderKey: number =
      expectedSimpleClubStandardStatsHeaders.length - 1;
    const lastSimpleClubStandardStatsHeader: string =
      expectedSimpleClubStandardStatsHeaders[
        lastSimpleClubStandardStatsHeaderKey
      ];

      const lastSimpleCompHeaderKey: number =
      simpleCompetitionTableRowHeaders.length - 1;
    const lastSimpleCompHeader: string =
      simpleCompetitionTableRowHeaders[lastSimpleCompHeaderKey];
    const lastSimpleCompHeaderJoined: string = lastSimpleCompHeader.replace(
      /\s/g,
      "",
    );

  
  const testDBName = "the-manager";
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

    await user.click(screen.getByRole("button", { name: "new-game" }));

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
    await user.type(saveNameElement, testNameOne);

    await user.selectOptions(countryElement, testCountry);
    expect(
      screen.getByRole("option", { name: testCountry }).selected,
    ).toBeTruthy();

    await user.selectOptions(leaguesElement, testCompetitionName);
    expect(
      screen.getByRole("option", { name: testCompetitionName }).selected,
    ).toBeTruthy();

    await user.selectOptions(teamsElement, testClubNameOne);
    expect(
      screen.getByRole("option", { name: testClubNameOne }).selected,
    ).toBeTruthy();

    // press start game
    await user.click(
      screen.getByText("Start Game", { selector: "button[type='submit']" }),
    );

    // wait for main screen to load
    await waitFor(() =>
      expect(
        screen.getByText(testCompetitionName, { selector: "h2" }),
      ).toBeTruthy(),
    );


    await waitFor(() =>
      expect(
        screen.getByText(lastSimpleCompHeader, {
          selector: `th[id='${lastSimpleCompHeaderKey}']`,
        }),
      ).toBeTruthy(),
    );

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
	  lastSimpleClubStandardStatsHeader.replace(/\s/g, "")
          ],
          {
            selector: `td[id='${lastSimpleClubStandardStatsHeaderJoined}_${expectedPlayerStats.length - 1}']`,
          },
        ),
      ),
    );
  });

  test("start an old save ", async () => {
    await addSaveToDB(testSave);
    const TestApp = () => (
      <div>
        <App />
      </div>
    );
    const { user } = renderWithRouter(<TestApp />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Play_0" })).toBeTruthy(),
    );
    await user.click(screen.getByRole("button", { name: "Play_0" }));

    // wait for main screen to load
    await waitFor(() =>
      expect(
        screen.getByText(testCompetitionName, { selector: "h2" }),
      ).toBeTruthy(),
    );


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
            lastSimpleClubStandardStatsHeaderJoined
          ],
          {
            selector: `td[id='${lastSimpleClubStandardStatsHeaderJoined}_${expectedPlayerStats.length - 1}']`,
          },
        ),
      ),
    );
    await deleteDB(testDBName);
  });

  test("test go back to start screen from main screen ", async () => {
    await addSaveToDB(testSave);
    const TestApp = () => (
      <div>
        <App />
      </div>
    );
    const { user } = renderWithRouter(<TestApp />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Play_0" })).toBeTruthy(),
    );
    await user.click(screen.getByRole("button", { name: "Play_0" }));

    
    await waitFor(() =>
      expect(
        screen.getByText(testCompetitionName, { selector: "h2" }),
      ).toBeTruthy(),
    );
  });
});
