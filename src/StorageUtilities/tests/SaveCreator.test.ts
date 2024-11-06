import { describe, expect, test, expectTypeOf } from "vitest";
import { Manager as TournamentManager } from 'tournament-organizer/components';
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
import {
  Competition,
  BaseCompetitions,
   AllCompetitions
} from "../../Competitions/CompetitionTypes";
import { createSave } from "../SaveCreator";
import { createSeasonCalendar } from "../../Common/scheduler";
import { Calendar } from "../../Common/CommonTypes";
import { Save } from "../SaveTypes";

describe("Competition Utilities tests", async () => {


 

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
    ID: "1",
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

  const testClubsOneArray: Array<Club> = [testClubOne, testClubTwo,
    testClubThree, testClubFour];

  const expectedClubNames: Array<string> = testClubsOneArray.map((club: Club) => club.Name);
  
  const clubsObjectCreator = (clubs: Array<Club>): Record<string, Club> => {
      return Object.fromEntries(
	clubs.map((club: Club) => [club.ID, club])
      )
  }

  const testClubsOne: Record<string, Club> = clubsObjectCreator(testClubsOneArray)
  
  
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
   

  const testCompetitionOne: Competition = {
    ID: "0",
    Name: "English Premier League",
    Clubs: testClubsOne,
    Statistics: testCompetitionStatistics,
  };

  const testAllCompetitionsOne: AllCompetitions = {
    England: {
      "English Premier League": testCompetitionOne,
    },
  };

  const testCountry: string = "England";
  const testCompetitionName: string = "English Premier League";
  const testSeason: string = "2024";
  const testClub: string = "Arsenal";
  const testClubs: Array<string> = ["Arsenal","Chelsea", "Ashton Villa", "Everton"]
  const testPlayerName: string = "Mikel Arteta";
  const testCompetitions: BaseCompetitions = {
    England: { "English Premier League": testClubs },
  };

  const testFirstDay: string = "08/18/24";
  const expectedFirstDay: Date = new Date(testFirstDay);

  test("Test createSave", async() => {
    const expectedClub: Club = {
      ID: expect.any(String),
      Name: expect.any(String),
      Statistics: testClubStatistics,
      Squad: expect.anything(),
      Starting11: {},
      Bench: {},
      
    };

    const expectedCompetition: Competition = {
      ID: expect.any(String),
      Name: "English Premier League",
      Clubs: expect.anything(),
      Statistics: testCompetitionStatistics,
    };

    const [testCalendar, testScheduleManager] = await createSeasonCalendar(testAllCompetitionsOne,
      testSeason);

    const expectedSave: Save = {
      Name: testPlayerName,
      Country: testCountry,
      MainCompetition: testCompetitionName,
      Club: testClub,
      Seasons: 1,
      CurrentSeason: "2024",
      CurrentDate: expectedFirstDay,
      allCompetitions: expect.anything(),
      saveID: expect.any(String),
      calendar: testCalendar,
      scheduleManager: testScheduleManager
      
    };

    const actualSave: Save = await createSave(
      testPlayerName,
      testCountry,
      testCompetitionName,
      testSeason,
      testFirstDay,
      testClub,
      testCompetitions,
    );

    expectTypeOf(actualSave).toEqualTypeOf(expectedSave);
    expectTypeOf(actualSave.calendar).toEqualTypeOf(testCalendar)
    expectTypeOf(actualSave.scheduleManager).toEqualTypeOf(testScheduleManager)
    
    const actualCompetitions: Array<Competition> = Object.values(
      actualSave.allCompetitions,
    ).flatMap((actualComp) => Object.values(actualComp));
    

    actualCompetitions.forEach((actualCompetition) => {
      expect(actualCompetition).toStrictEqual(expectedCompetition);
      expectTypeOf(actualCompetition).toEqualTypeOf(expectedCompetition);
      expect(actualCompetition.Name).toStrictEqual(expectedCompetition.Name);

      const actualClubs: Array<Club> = Object.values(actualCompetition.Clubs);
      const actualClubNames: Array<string> = actualClubs.map((club: Club) => club.Name);
      expect(actualClubNames.toSorted()).toStrictEqual(expectedClubNames.toSorted())
      
      actualClubs.forEach((actualClub: Club) => {
        expect(actualClub).toStrictEqual(expectedClub);
        expectTypeOf(actualClub).toEqualTypeOf(expectedClub);
	
        const actualPlayers: Array<Player> = Object.values(actualClub.Squad);
        expect(actualPlayers.length).toBe(25);
        expectTypeOf(actualPlayers).toEqualTypeOf(testPlayersOneArray);
        actualPlayers.forEach((testPlayer) => {
          expectTypeOf(testPlayer).toEqualTypeOf(testPlayerOne);
        });
      });
    });
  });
});
