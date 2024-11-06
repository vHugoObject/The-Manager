import "fake-indexeddb/auto";
import {
  Manager as TournamentManager,
  Player as TournamentPlayer,
    Match as TournamentMatch,
    Tournament
} from 'tournament-organizer/components';
import { SettableTournamentValues,
  LoadableTournamentValues } from 'tournament-organizer/interfaces';
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
  serializeTournamentManager,
  deserializeTournamentManager
} from "../SaveUtilities";
import { Save, SaveID } from "../SaveTypes";
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
import {
  Competition,
  AllCompetitions,
} from "../../Competitions/CompetitionTypes";
import { Club } from "../../Clubs/ClubTypes";
import { Calendar } from "../../Common/CommonTypes";
import { createCalendar } from "../../Common/simulationUtilities";

describe("SaveUtilities tests", async () => {

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

  const getRandomNumberInRange = (min: number, max: number): number => {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
  };

  const testPlayerSkills = (): Record<string, SkillSet> => {
    return Object.fromEntries(
      Object.entries(playerSkills).map(([name, set]) => [
        name,
        Object.fromEntries(
          set.map((skill: string) => [skill, getRandomNumberInRange(25, 100)]),
        ),
      ]),
    );
  };

  const testPlayerOne: Player = {
    ID: "0",
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
    Skills: testPlayerSkills(),
    Statistics: expectedPlayerStatistics,
  };

  const testPlayerTwo: Player = {
    ID: "1",
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
    Skills: testPlayerSkills(),
    Statistics: expectedPlayerStatistics,
  };

  const testPlayerThree: Player = {
    ID: "2",
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
    Skills: testPlayerSkills(),
    Statistics: expectedPlayerStatistics,
  };

  const testPlayerFour: Player = {
    ID: "3",
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
    Skills: testPlayerSkills(),
    Statistics: expectedPlayerStatistics,
  };


  const testPlayersOneArray: Array<Player> = [testPlayerOne, testPlayerTwo];
  const testPlayersTwoArray: Array<Player> = [testPlayerThree, testPlayerFour];

  const createSquadObject = (players: Array<Player>) => {
    return Object.fromEntries(players.map((player: Player) => [player.ID, player]))
  }

  const testPlayersOne: Record<string, Player> = createSquadObject(testPlayersOneArray)
  const testPlayersTwo: Record<string, Player> = createSquadObject(testPlayersTwoArray)
  
  const testClubOne: Club = {
    ID: "0",
    Name: "Arsenal",
    Statistics: testClubStatistics,
    Squad: testPlayersOne,
    Starting11: {},
    Bench: {},
  };

  const testClubTwo: Club = {
    ID: "1",
    Name: "Chelsea",
    Statistics: testClubStatistics,
    Squad: testPlayersTwo,
    Starting11: {},
    Bench: {},
  };

  const testClubThree: Club = {
    ID: "2",
    Name: "Everton",
    Statistics: testClubStatistics,
    Squad: testPlayersOne,
    Starting11: {},
    Bench: {},
  };

  const testClubFour: Club = {
    ID: "3",
    Name: "Ashton Villa",
    Statistics: testClubStatistics,
    Squad: testPlayersOne,
    Starting11: {},
    Bench: {},
  };

  const testClubsOneArray: Array<Club> = [testClubOne, testClubTwo];
  const testClubsTwoArray: Array<Club> = [testClubThree, testClubFour];

  const clubsObjectCreator = (clubs: Array<Club>): Record<string, Club> => {
      return Object.fromEntries(
	clubs.map((club: Club) => [club.ID, club])
      )
  }

  const testClubsOne: Record<string, Club> = clubsObjectCreator(testClubsOneArray)
  const testClubsTwo: Record<string, Club> = clubsObjectCreator(testClubsTwoArray)
   

  const testCompetitionOne: Competition = {
    ID: "0",
    Name: "English Premier League",
    Clubs: testClubsOne,
    Statistics: testCompetitionStatistics,
  };

  const testCompetitionTwo: Competition = {
    ID: "1",
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
      "The Championship": testCompetitionTwo,
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

  const createTournamentClubs = (clubs: Record<string, Club>): Array<TournamentPlayer> => {
    return Object.values(clubs).map((club: Club) => {
      return new TournamentPlayer(club.ID, club.Name)
    }
    )
  }

  // check this
  const createTournament = async(scheduler: TournamentManager,
    competition: Competition): Promise<void> => {
      const scoring: Record<string, number> = {
	win: 3,
	draw: 1,
	loss: 0,
	bye: 2
      }
      
      const tournamentValues: SettableTournamentValues = {
	players: createTournamentClubs(competition.Clubs),
	stageOne: {format: 'double-round-robin'},
	sorting: "descending",
	scoring
      }      
       scheduler.createTournament(competition.Name, tournamentValues, competition.ID).start()    
    }
  const testScheduler: TournamentManager = new TournamentManager();
  await createTournament(testScheduler, testCompetitionOne);
  const testSaveOne: Save = {
    Name: testNameOne,
    Country: testCountry,
    MainCompetition: testCompetitionNameOne,
    Club: testClubNameOne,
    Seasons: 1,
    CurrentSeason: "2024",
    CurrentDate: testFirstDay,
    allCompetitions: testAllCompetitionsOne,
    saveID: "0",
    calendar: createCalendar(testFirstDay),
    scheduleManager: testScheduler
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
    saveID: "1",
    calendar: createCalendar(testFirstDay),
    scheduleManager: testScheduler
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
    saveID: "0",
    calendar: createCalendar(testFirstDay),
    scheduleManager: testScheduler
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
    saveID: "1",
    calendar: createCalendar(testFirstDay),
    scheduleManager: testScheduler
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
    actualDB.close();
    await deleteDB(testDBName);
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

    testSaveValue.Name = "Bald Fraud";
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
    const actualSavesIDs: Array<SaveID> = await getAllSaveKeys();

    expect(actualSavesIDs).toStrictEqual(testSaveIDs);
    await deleteDB(testDBName);
  });

  test("Test deleteSave", async () => {
    const _: SaveID = await addSaveToDB(testSaveOne);
    const keyTwo: SaveID = await addSaveToDB(testSaveTwo);

    await deleteSave(keyTwo);

    const actualSaves: Array<Save> = await getAllSaveValues();
    expect(actualSaves).toStrictEqual([expectedSaveOne]);
    await deleteDB(testDBName);
  });

  test("Test serializeTournamentManager", async () => {    
    
    

    const expectedSerializedTournaments: Array<LoadableTournamentValues> = testScheduler.tournaments.map((tournament: Tournament) => {
	return structuredClone(tournament)
    });
    
    const actualSerializedTournaments: Array<LoadableTournamentValues> = serializeTournamentManager(testScheduler)

    expect(actualSerializedTournaments).toStrictEqual(expectedSerializedTournaments)
    
  });

  test("Test deserializeTournamentManager", async () => {

    const expectedDeserializedTournamentManager: TournamentManager = new TournamentManager();
    
    await createTournament(expectedDeserializedTournamentManager, testCompetitionOne);

    const testSerializedTournamentManager: Array<LoadableTournamentValues> = serializeTournamentManager(expectedDeserializedTournamentManager)

    const actualDeserializedTournamentManager: TournamentManager = deserializeTournamentManager(testSerializedTournamentManager);
    expect(actualDeserializedTournamentManager).toStrictEqual(expectedDeserializedTournamentManager)

    
  });
});
