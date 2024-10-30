// @vitest-environment jsdom
import React from "react";
import {
  screen,
  cleanup,
  waitFor
} from "@testing-library/react";
import { describe, expect, test, afterEach } from "vitest";
import "fake-indexeddb/auto";
import { renderWithRouter, setup } from "../UITestingUtilities";
import { deleteDB } from "idb";
import {
  ComponentKeysObject,
  StatisticsObject,
  StatisticsType,
} from "../../Common/CommonTypes";
import {
  Player,
  PositionGroup,
  Midfielder,
  Defender,
  SkillSet,
  Foot,
  ContractType,
} from "../../Players/PlayerTypes";
import { Club } from "../../Clubs/ClubTypes";
import { playerSkills } from "../../Players/PlayerSkills";
import { Competition, AllCompetitions } from "../../Competitions/CompetitionTypes";
import {
  getSaveValue,
  addSaveToDB,
} from "../../StorageUtilities/SaveUtilities";
import { Save, SaveID } from "../../StorageUtilities/SaveTypes";
import {
  DBContext,
  DBDispatchContext,
  CurrentDBState,
  SaveSummary,
} from "../DatabaseManagement";
import {
  StartScreen,
  NewGameButton,
  PlayButton,
  DeleteButton,
  SaveGamesTable,
  SaveGamesTableRow,
} from "../StartScreen";

describe("StartScreen test suite", async () => {
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
    Statistics: expectedPlayerStatistics
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
    Statistics: expectedPlayerStatistics
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
    Statistics: expectedPlayerStatistics
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
    Squad: testPlayersOne,
    Starting11: [],
    Bench: []
  };

  const testClubTwo: Club = {
    ID: 1,
    Name: "Chelsea",
    Statistics: testClubStatistics,
    Squad: testPlayersTwo,
    Starting11: [],
    Bench: []
  };

  const testClubThree: Club = {
    ID: 2,
    Name: "Everton",
    Statistics: testClubStatistics,
    Squad: testPlayersOne,
    Starting11: [],
    Bench: []
  };

  const testClubFour: Club = {
    ID: 3,
    Name: "Ashton Villa",
    Statistics: testClubStatistics,
    Squad: testPlayersOne,
    Starting11: [],
    Bench: []
  };


  const testClubsOne: Array<Club> = [testClubOne, testClubTwo];
  const testClubsTwo: Array<Club> = [testClubThree, testClubFour];
  
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
    Clubs: testClubsOne,
    Statistics: testCompetitionStatistics,
  };    

  const testCompetitionTwo: Competition = {
    Name: "The Championship",
    Clubs: testClubsTwo,
    Statistics: testCompetitionStatistics,
  };

  const testAllCompetitionsOne: AllCompetitions = {
    England: {
      "English Premier League": testCompetitionOne,
    },
  };

  const testAllCompetitionsTwo: AllCompetitions = {
    England: {
      "English Premier League": testCompetitionOne,
      "The Championship": testCompetitionTwo
    },
  };

  const testCountry: string = "England";
  const testCompetitionNameOne: string = "English Premier League";
  const testCompetitionNameTwo: string = "The Championship";  
  const testNameOne = "Mikel Arteta";
  const testNameTwo = "Unai Emery";
  const testClubNameOne: string = "Arsenal";
  const testClubNameTwo: string = "Ashton Villa";
  const testSeason: string = "2024";
  const testFirstDay: Date = new Date("8/18/24");


  const testSaveOne: Save = {
      Name: testNameOne,
      Country: testCountry,
      MainCompetition: testCompetitionNameOne,
      Club: testClubNameOne,
      Seasons: 1,
    CurrentSeason: "2024",
    CurrentDate: testFirstDay,
    allCompetitions: testAllCompetitionsOne,
    saveID: "0"
    
  };

  const testSaveTwo: Save = {
      Name: testNameTwo,
      Country: testCountry,
      MainCompetition: testCompetitionNameTwo,
      Club: testClubNameTwo,
      Seasons: 1,
    CurrentSeason: "2024",
    CurrentDate: testFirstDay,
    allCompetitions: testAllCompetitionsTwo,
    saveID: "1"
  };


  const expectedSaveOne: Save = {
      Name: testNameOne,
      Country: testCountry,
      MainCompetition: testCompetitionNameOne,
      Club: testClubNameOne,
      Seasons: 1,
    CurrentSeason: "2024",
    CurrentDate: testFirstDay,
    allCompetitions: testAllCompetitionsOne,
    saveID: "0"
  };

  const expectedSaveTwo: Save = {
      Name: testNameTwo,
      Country: testCountry,
      MainCompetition: testCompetitionNameTwo,
      Club: testClubNameTwo,
      Seasons: 1,
    CurrentSeason: "2024",
    CurrentDate: testFirstDay,
    allCompetitions: testAllCompetitionsTwo,
    saveID: "1"
  };

    
  const testSaves: Array<Save> = [testSaveOne, testSaveTwo];
  const expectedSaves: Array<Save> = [expectedSaveOne, expectedSaveTwo];  
  const testSavesCount: number = testSaves.length - 1;

  const testDBName: string = "the-manager";


  const firstTestSaveSummary: SaveSummary = {
    SaveID: 0,
    Name: testNameOne,
    MainCompetition: testCompetitionNameOne,
    Club: testClubNameOne,
    Seasons: 1,
  };
  const secondTestSaveSummary: SaveSummary = {
    SaveID: 1,
    Name: testNameTwo,
    MainCompetition: testCompetitionNameTwo,
    Club: testClubNameTwo,
    Seasons: 1,
  };

  const testSaveSummaries: Array<SaveSummary> = [
    firstTestSaveSummary,
    secondTestSaveSummary,
  ];

  const testInitialDBState: CurrentDBState = CurrentDBState.initializing


  const testDispatcher = () => {
    return;
  };

  const expectedRowText: Array<string> = [
    "Name",
    "Main Competition",
    "Club",
    "Seasons",
  ];

  const expectedTableHeaders: Array<string> = [
    "",
    "Name",
    "Main Competition",
    "Club",
    "Seasons",
    "",
  ];
  const expectedButtons: Array<string> = ["Play", "Delete"];

  const tableHeadersCount = expectedTableHeaders.length - 1;
  const lastTableHeader = expectedTableHeaders[tableHeadersCount];

  const expectedButtonsLength = expectedButtons.length - 1;

  afterEach(async () => {
    cleanup();
  });

  test("Assert appearance of PlayButton", async () => {
    renderWithRouter(<PlayButton saveID={0} index={0} />);
    expect(screen.getByRole("button", { name: "Play_0" })).toBeTruthy();
    expect(screen.getByText("Play", { selector: "button[id='Play_0']" }));
  });

  test("Assert appearance of DeleteButton", async () => {
    const TestDeleteButton = () => {
      return (
        <div id="test-delete">
          <DBContext.Provider value={testInitialDBState}>
            <DBDispatchContext.Provider value={testDispatcher}>
              <DeleteButton saveID={0} index={0} />
            </DBDispatchContext.Provider>
          </DBContext.Provider>
        </div>
      );
    };

    setup(<TestDeleteButton />);
    expect(screen.getByRole("button", { name: "Delete_0" })).toBeTruthy();
    expect(screen.getByText("Delete", { selector: "button[id='Delete_0']" }));
  });

  test("Assert appearance of NewGameButton", async () => {
    renderWithRouter(<NewGameButton />);
    expect(screen.getByRole("button", { name: "new-game" })).toBeTruthy();
  });

  test("Assert appearance of SaveGamesTableRow", async () => {
    const TestSaveGamesTableRow = () => {
      return (
        <div id="test-delete">
          <DBContext.Provider value={testInitialDBState}>
            <DBDispatchContext.Provider value={testDispatcher}>
              <table>
                <tbody>
                  <SaveGamesTableRow
                    saveSummary={firstTestSaveSummary}
                    rowIndex={0}
                  />
                </tbody>
              </table>
            </DBDispatchContext.Provider>
          </DBContext.Provider>
        </div>
      );
    };

    renderWithRouter(<TestSaveGamesTableRow />);

    expect(
      screen.getByRole("row", { name: "save_games_table_row_0" }),
    ).toBeTruthy();

    expectedButtons.forEach((buttonName: string) => {
      expect(
        screen.getByText(buttonName, {
          selector: `button[id='${buttonName.replace(/\s/g, "")}_0']`,
        }),
      );
    });

    expectedRowText.forEach((cellText: string) => {
      expect(
        screen.getByText(firstTestSaveSummary[cellText.replace(/\s/g, "")], {
          selector: `td[id='${cellText.replace(/\s/g, "")}_0']`,
        }),
      );
    });
  });

  test("Assert appearance of SaveGamesTable with multiple saves", async () => {
    const TestSaveGamesTable = () => {
      return (
        <DBContext.Provider value={testInitialDBState}>
          <DBDispatchContext.Provider value={testDispatcher}>
            <SaveGamesTable saves={testSaves} />
          </DBDispatchContext.Provider>
        </DBContext.Provider>
      );
    };

    renderWithRouter(<TestSaveGamesTable />);

    await waitFor(() =>
      expect(
        screen.getByText(lastTableHeader, {
          selector: `th[id='${lastTableHeader}_${tableHeadersCount}']`,
        }),
      ).toBeTruthy(),
    );

    expectedTableHeaders.forEach((tableHeader: string, index: number) => {
      expect(
        screen.getByText(tableHeader, {
          selector: `th[id='${tableHeader}_${index}']`,
        }),
      ).toBeTruthy();
    });

    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: `${expectedButtons[expectedButtonsLength]}_${testSavesCount}`,
        }),
      ).toBeTruthy(),
    );

    testSaveSummaries.forEach((testSave, index) => {
      expectedButtons.forEach((buttonName) => {
        expect(
          screen.getByText(buttonName, {
            selector: `button[id='${buttonName}_${index}']`,
          }),
        );
      });

      expect(
        screen.getByText(testSave.Name, {
          selector: `td[id='Name_${index}']`,
        }),
      ).toBeTruthy();

      expect(
        screen.getByText(testSave.MainCompetition, {
          selector: `td[id='MainCompetition_${index}']`,
        }),
      ).toBeTruthy();

      expect(
        screen.getByText(testSave.Club, {
          selector: `td[id='Club_${index}']`,
        }),
      ).toBeTruthy();

      expect(
        screen.getByText(testSave.Seasons, {
          selector: `td[id='Seasons_${index}']`,
        }),
      ).toBeTruthy();
    });
  });

  test("Test delete two olds saves", async () => {
    const saveIDOne = await addSaveToDB(testSaveOne);
    const saveIDTwo = await addSaveToDB(testSaveTwo);
    const testSaveIDs = [saveIDOne, saveIDTwo];
    const saveIDSCount = testSaveIDs.length - 1;    

    const { user } = renderWithRouter(<StartScreen />);

    expect(
      screen.getByText("The Manager", { selector: "h2[id='site-banner']" }),
    ).toBeTruthy();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "new-game" })).toBeTruthy(),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("table", { name: "save-games-table" }),
      ).toBeTruthy(),
    );

    await waitFor(() =>
      expect(
        screen.getByText(lastTableHeader, {
          selector: `th[id='${lastTableHeader}_${tableHeadersCount}']`,
        }),
      ).toBeTruthy(),
    );

    expectedTableHeaders.forEach((tableHeader: string, index: number) => {
      expect(
        screen.getByText(tableHeader, {
          selector: `th[id='${tableHeader}_${index}']`,
        }),
      ).toBeTruthy();
    });

    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: `${expectedButtons[expectedButtonsLength]}_${saveIDSCount}`,
        }),
      ).toBeTruthy(),
    );

    testSaveSummaries.forEach((testSave, index) => {
      expectedButtons.forEach((buttonName) => {
        expect(
          screen.getByText(buttonName, {
            selector: `button[id='${buttonName}_${index}']`,
          }),
        );
      });

      expect(
        screen.getByText(testSave.Name, {
          selector: `td[id='Name_${index}']`,
        }),
      ).toBeTruthy();

      expect(
        screen.getByText(testSave.MainCompetition, {
          selector: `td[id='MainCompetition_${index}']`,
        }),
      ).toBeTruthy();

      expect(
        screen.getByText(testSave.Club, {
          selector: `td[id='Club_${index}']`,
        }),
      ).toBeTruthy();

      expect(
        screen.getByText(testSave.Seasons, {
          selector: `td[id='Seasons_${index}']`,
        }),
      ).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: "Delete_1" }));
    await expect(getSaveValue(saveIDTwo)).resolves.toBeUndefined();
    expect(() => {
      screen.getByText("Delete", {
        selector: `button[id='Delete_1]']`,
      });
    }).toThrowError();

    await user.click(screen.getByRole("button", { name: "Delete_0" }));
    await expect(getSaveValue(saveIDTwo)).resolves.toBeUndefined();
    expect(() => {
      screen.getByText("Delete", {
        selector: `button[id='Delete_0]']`,
      });
    }).toThrowError();

    await deleteDB(testDBName);
  });
});
