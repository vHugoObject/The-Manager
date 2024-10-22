import "fake-indexeddb/auto";
import { deleteDB, IDBPDatabase } from "idb";
import { describe, expect, test } from "vitest";
import {
  openSaveDB,
  addSaveToDB,
  getSaveValue,
  deleteSave,
  getAllSaveValues,
  getAllSaveKeys,
  updateSaveValue,
} from "../SaveUtilities";
import { Save, SaveID } from '../SaveTypes'
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
import { playerSkills } from "../../Players/PlayerSkills";
import { Competition, AllCompetitions } from "../../Competitions/CompetitionTypes";
import { Club } from "../../Clubs/ClubTypes";



describe("SaveUtilities tests", async () => {

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

  const testCompetitionStatistics: StatisticsType = {
    BySeason: { "2024": competitionStatisticsObject },
    GameLog: {},
  };

  const testCompetitionComponentKeys: ComponentKeysObject = {
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

  const testClubStatistics: StatisticsType = {
    BySeason: { "2024": testClubStatisticsOne },
    GameLog: {},
  };

  const testClubComponentKeys: ComponentKeysObject = {
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


  const testClubsOne: Array<Club> = [testClubOne, testClubTwo];
  const testClubsTwo: Array<Club> = [testClubThree, testClubFour];
  
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
  const testDBName: string = "the-manager";
  const testDBVersion: number = 1;
  const saveStore: string = "save-games";

  test("Test openSaveDB", async () => {

    const actualDB: IDBPDatabase = await openSaveDB();
    expect(actualDB.name).toBe(testDBName);
    expect(actualDB.version).toBe(testDBVersion);
    const actualStoreNames = new Set(actualDB.objectStoreNames);
    expect(actualStoreNames.has(saveStore)).toBeTruthy();
    actualDB.close()
    await deleteDB(testDBName)
  });

    test("Test addSaveToDB", async () => {
    
    const saveID: SaveID = await addSaveToDB(testSaveOne);

    const actualValue: Save = await getSaveValue(saveID);
    expect(expectedSaveOne).toStrictEqual(actualValue);
    await deleteDB(testDBName);
  });

  test("Test getSaveValue", async () => {
    const saveID: SaveID = await addSaveToDB(testSaveOne);
    const actualValue: Save = await getSaveValue(saveID);
    expect(expectedSaveOne).toStrictEqual(actualValue);
    await deleteDB(testDBName);
  });

  test("Test updateSaveValue", async () => {
    const saveID: SaveID = await addSaveToDB(testSaveOne);
    let testSaveValue: Save = await getSaveValue(saveID);
    await updateSaveValue(testSaveValue);
    let actualValue: Save = await getSaveValue(saveID);    
    expect(expectedSaveOne).toStrictEqual(actualValue);

    // change name    
    testSaveValue.Name = "Bald Fraud"
    await updateSaveValue(testSaveValue);
    actualValue = await getSaveValue(saveID);    
    expect(testSaveValue).toStrictEqual(actualValue);    
    await deleteDB(testDBName);
    
  });

  test("Test getAllSaveValues", async () => {
    await addSaveToDB(testSaveOne);
    await addSaveToDB(testSaveTwo);
    const actualSaves: Array<Save> = await getAllSaveValues();
    expect(expectedSaves).toStrictEqual(actualSaves);
    await deleteDB(testDBName);
  });

  test("Test getAllSaveKeys", async () => {
    const keyOne: SaveID = await addSaveToDB(testSaveOne);
    const keyTwo: SaveID = await addSaveToDB(testSaveTwo);  
    const testSaveIDs: Array<SaveID> = [keyOne, keyTwo];
    const actualSavesIDs: Array<SaveID>  = await getAllSaveKeys();

    expect(actualSavesIDs).toStrictEqual(testSaveIDs);
    await deleteDB(testDBName);
  });

  test("Test deleteSave", async () => {
    const keyOne: SaveID = await addSaveToDB(testSaveOne);
    const keyTwo: SaveID = await addSaveToDB(testSaveTwo);
    
    await deleteSave(keyTwo);

    await expect(getSaveValue(keyTwo)).resolves.toBeUndefined();
    
    const actualSaves: Array<Save> = await getAllSaveValues();
    expect(actualSaves).toStrictEqual([expectedSaveOne]);

    await deleteDB(testDBName);
  });
  

  
  
});
