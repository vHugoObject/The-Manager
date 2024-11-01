import { describe, expect, test, expectTypeOf } from "vitest";
import {
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
import { Competition } from '../CompetitionTypes';
import {
  createCompetitionClubsWithGeneratedPlayers,
  createCompetitionClubsWithGivenPlayers,
  generateCompetitionStatisticsObject,
  createCompetitionScheduler,
  createCompetition,
} from "../CompetitionUtilities";

describe("Competition Utilities tests", () => {

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
    ID: "4",
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

  const testCompetitionName: string = "English Premier League";
  const testSeason: string = "2024";
  const testClubsNoPlayers: Array<string> = ["Arsenal", "Brentford"];
  const testClubsWithPlayers: Record<string,  Array<Player>> = {
    Arsenal: testPlayersOneArray,
    Brentford: testPlayersTwoArray,
  };

  const testClubsWithPlayersObject: Record<string,  Record<string,Player>> = {
    Arsenal: testPlayersOne,
    Brentford: testPlayersTwo,
  };


  const clubsObjectCreator = (clubs: Array<Club>): Record<string, Club> => {
      return Object.fromEntries(
	clubs.map((club: Club) => [club.ID, club])
      )
    }


  test("test generateCompetitionStatisticsObject", () => {
    const testSeason: string = "2024";
    const actualStatistics: StatisticsType =
      generateCompetitionStatisticsObject(testSeason);
    expect(actualStatistics).toMatchObject(expectedCompetitionStatistics);
  });

  test("Test createCompetitionClubsWithGeneratedPlayers", () => {
    const expectedClubOne: Club = {
      ID: expect.any(String),
      Name: "Arsenal",
      Statistics: expectedClubStatistics,
      Squad: expect.anything(),
      Starting11: {},
      Bench: {},
    };

    const expectedClubTwo: Club = {
      ID: expect.any(String),
      Name: "Brentford",
      Statistics: expectedClubStatistics,
      Squad: expect.anything(),
      Starting11: {},
      Bench: {},
    };

    const expectedClubs: Array<Club> = [expectedClubOne, expectedClubTwo];

    const actualClubs: Array<Club> = createCompetitionClubsWithGeneratedPlayers(
      testSeason,
      testClubsNoPlayers,
    );

    // expect 25 players

    expect(actualClubs).toStrictEqual(expectedClubs);
  });

  test("Test createCompetitionClubsWithGivenPlayers", () => {
    const expectedClubOne: Club = {
      ID: expect.any(String),
      Name: "Arsenal",
      Statistics: expectedClubStatistics,
      Squad: testPlayersOne,
      Starting11: {},
      Bench: {},
    };

    const expectedClubTwo: Club = {
      ID: expect.any(String),
      Name: "Brentford",
      Statistics: expectedClubStatistics,
      Squad: testPlayersTwo,
      Starting11: {},
      Bench: {},
    };

    const expectedClubs: Array<Club> = [expectedClubOne, expectedClubTwo];

    const actualClubs: Array<Club> = createCompetitionClubsWithGivenPlayers(
      testSeason,
      testClubsWithPlayers,
    );

    expect(actualClubs).toStrictEqual(expectedClubs);
  });


  

  test("Test createCompetition - all players are randomly generated", () => {
    const expectedClubOne: Club = {
      ID: expect.any(String),
      Name: "Arsenal",
      Statistics: expectedClubStatistics,
      Squad: expect.anything(),
      Starting11: {},
      Bench: {},
    };

    const expectedClubTwo: Club = {
      ID: expect.any(String),
      Name: "Brentford",
      Statistics: expectedClubStatistics,
      Squad: expect.anything(),
      Starting11: {},
      Bench: {},
    };

    const expectedClubsArray: Array<Club> = [expectedClubOne, expectedClubTwo];
    const expectedClubs = Object.fromEntries(expectedClubsArray.map((club: Club) => {
      return [expect.any(String), club]
    }))
    const expectedCompetitionNoPlayers: Competition = {
      ID: expect.any(String),
      Name: "English Premier League",
      Clubs: expectedClubs,
      Statistics: expectedCompetitionStatistics,
    };

    
    const actualCompetition: Competition = createCompetition(
      testCompetitionName,
      testSeason,
      testClubsNoPlayers,
    );

    expect(actualCompetition.Name).toBe(testCompetitionName)
    expect(actualCompetition.Statistics).toStrictEqual(expectedCompetitionStatistics)
    const actualClubs: Array<Club> = Object.values(actualCompetition.Clubs);
    actualClubs.forEach((actualClub: Club) => {
      expectTypeOf(actualClub).toEqualTypeOf(expectedClubOne);
      const actualPlayers: Array<Player> = Object.values(actualClub.Squad);
      expect(actualPlayers.length).toBe(25);
      actualPlayers.forEach((testPlayer) => {
        expectTypeOf(testPlayer).toEqualTypeOf(testPlayerOne);
      });
    });
  });

  test("Test createCompetition with given players", () => {
    const expectedClubOne: Club = {
      ID: expect.any(String),
      Name: "Arsenal",
      Statistics: expectedClubStatistics,
      Squad: testPlayersOne,
      Starting11: {},
      Bench: {},
    };

    const expectedClubTwo: Club = {
      ID: expect.any(String),
      Name: "Brentford",
      Statistics: expectedClubStatistics,
      Squad: testPlayersTwo,
      Starting11: {},
      Bench: {},
    };

    const expectedClubs: Record<string, Club> = {
      Arsenal: expectedClubOne,
      Brentford: expectedClubTwo
    }
    
    
    const actualCompetition: Competition = createCompetition(
      testCompetitionName,
      testSeason,
      testClubsWithPlayers,
    );


    const getPlayerNames = (players: Array<Player>): Array<string> => {
      return players.map((player: Player) => player.Name)
    }
    expect(actualCompetition.Name).toBe(testCompetitionName)
    expect(actualCompetition.Statistics).toStrictEqual(expectedCompetitionStatistics)
    const actualClubs: Array<Club> = Object.values(actualCompetition.Clubs);
    actualClubs.forEach((actualClub: Club) => {
      const expectedClub: Club = expectedClubs[actualClub.Name]
      const expectedPlayers: Array<Player> = Object.values(expectedClub.Squad)
      expectTypeOf(actualClub).toEqualTypeOf(expectedClub);
      const actualPlayers: Array<Player> = Object.values(actualClub.Squad);      
      expect(actualPlayers.length).toBe(expectedPlayers.length);      
      actualPlayers.forEach((testPlayer) => {
        expectTypeOf(testPlayer).toEqualTypeOf(testPlayerOne);
      });
      const actualPlayerNames: Array<String> = getPlayerNames(actualPlayers)
      const expectedPlayerNames: Array<String> = getPlayerNames(expectedPlayers)

      expect(actualPlayerNames).toStrictEqual(expectedPlayerNames)
    });

    
    
  });
});
