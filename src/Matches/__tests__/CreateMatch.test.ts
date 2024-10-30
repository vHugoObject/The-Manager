import { describe, expect, test, expectTypeOf } from "vitest";
import 'lodash.product';
import _ from 'lodash';
import {
  StatisticsObject,
  StatisticsType,
} from "../../Common/CommonTypes";
import { playerSkills } from "../../Players/PlayerSkills";
import { Club } from "../../Clubs/ClubTypes";
import { Match, SquadStatus } from '../MatchTypes'
import {
  Player,
  SkillSet,
  PositionGroup,
  Midfielder,
  Attacker,
  Goalkeeper,
  Foot,
  ContractType,
  Defender
} from "../../Players/PlayerTypes";
import { createMatch } from '../CreateMatch';

describe("createMatch test suite",  async() => {

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


  const getRandomNumberInRange = (min: number, max: number): number => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

  const testPlayerSkills = (): Record<string, SkillSet> => {
    return Object.fromEntries(
    Object.entries(playerSkills).map(([name, set]) => [
      name,
      Object.fromEntries(set.map((skill: string) => [skill, getRandomNumberInRange(25,100)])),
    ]),
  )};

  const testPlayerOne: Player = {
    ID: 0,
    Name: "Rodri",
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
    Rating: 65,
    Skills: testPlayerSkills(),
    Statistics: expectedPlayerStatistics,

  };

  const testPlayerTwo: Player = {
    ID: 1,
    Name: "Luka Modric",
    PositionGroup: PositionGroup.Midfielder,
    Position: Midfielder.LM,
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
    ID: 2,
    Name: "Toni Kroos",
    PositionGroup: PositionGroup.Midfielder,
    Position: Midfielder.RM,
    PreferredFoot: Foot.Right,
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Spain",
    Club: "Manchester City",
    Contract: expectedContract,
    Value: 1,
    Rating: 85,
    Skills: testPlayerSkills(),
    Statistics: expectedPlayerStatistics,

  };

  const testPlayerFour: Player = {
    ID: 3,
    Name: "Gabriel",
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


  const testPlayerFive: Player = {
    ID: 4,
    Name: "William Saliba",
    PositionGroup: PositionGroup.Defender,
    Position: Defender.RCB,
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

  const testPlayerSix: Player = {
    ID: 5,
    Name: "Marcelo",
    PositionGroup: PositionGroup.Defender,
    Position: Defender.LB,
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

  const testPlayerSeven: Player = {
    ID: 6,
    Name: "Trent",
    PositionGroup: PositionGroup.Defender,
    Position: Defender.RB,
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

  const testPlayerEight: Player = {
    ID: 7,
    Name: "Karim Benzema",
    PositionGroup: PositionGroup.Attacker,
    Position: Attacker.ST,
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

  const testPlayerNine: Player = {
    ID: 8,
    Name: "Bernardo Silva",
    PositionGroup: PositionGroup.Attacker,
    Position: Attacker.LW,
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

  const testPlayerTen: Player = {
    ID: 9,
    Name: "Rodrygo",
    PositionGroup: PositionGroup.Attacker,
    Position: Attacker.RW,
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

  const testPlayerEleven: Player = {
    ID: 9,
    Name: "Ederson",
    PositionGroup: PositionGroup.Goalkeeper,
    Position: Goalkeeper.GK,
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

  const allTestOutfieldPlayers: Array<Player> = [testPlayerOne, testPlayerTwo,
    testPlayerThree, testPlayerFour, testPlayerFive, testPlayerSix,
    testPlayerSeven, testPlayerEight, testPlayerNine, testPlayerTen,
  ];

  const allTestPlayers: Array<Player> = [testPlayerOne, testPlayerTwo,
    testPlayerThree, testPlayerFour, testPlayerFive, testPlayerSix,
    testPlayerSeven, testPlayerEight, testPlayerNine, testPlayerTen,
    testPlayerEleven
  ];
  
  const testPlayersOne: Array<Player> = [testPlayerOne, testPlayerTwo,
    testPlayerThree, testPlayerFour];
  const testStartersOne: Array<Player> = [testPlayerOne, testPlayerTwo,
    testPlayerThree, testPlayerFour];
  const testBenchOne: Array<Player> = [testPlayerOne, testPlayerTwo,
    testPlayerThree, testPlayerFour];

  
  const testPlayersTwo: Array<Player> = [testPlayerFive, testPlayerSix,
    testPlayerSeven, testPlayerEight];
  const testStartersTwo: Array<Player> = [testPlayerFive, testPlayerSix,
    testPlayerSeven, testPlayerEight, testPlayerNine, testPlayerTen];
  const testBenchTwo: Array<Player> = [testPlayerFive, testPlayerSix,
    testPlayerSeven, testPlayerEight];
  
  const testClubStatistics: StatisticsType = {
    BySeason: { "2024": testClubStatisticsOne },
    GameLog: {},
  };
  
  const testClubOne: Club = {
    ID: 0,
    Name: "Arsenal",
    Statistics: testClubStatistics,
    Squad: testPlayersOne,
    Starting11: testStartersOne,
    Bench: testBenchOne
  };

  const testClubTwo: Club = {
    ID: 1,
    Name: "Chelsea",
    Statistics: testClubStatistics,
    Squad: testPlayersTwo,
    Starting11: testStartersTwo,
    Bench: testBenchOne
  };

  const expectedTeamStatistics = [
    "Possession",
    "Shots on target",
    "Expected Goals",
    "Saves",
    "Fouls",
    "Corners",
    "Crosses",
    "Touches",
    "Tackles",
    "Interceptions",
    "Aerials Won",
    "Clearances",
    "Offsides",
    "Goal Kicks",
    "Throw Ins",
    "Long Balls",
  ];
  
  const testEmptyTeamStatistics = Object.fromEntries(
    expectedTeamStatistics.map((header) => [header.replace(/\s/g, ""), 0]),
  );

  const expectedPlayerGameStandardStatsHeaders = [
    "Player",
    "Minutes",
    "Goals",
    "Assists",
    "Goals Plus Assists",
    "Non Penalty Goals",
    "Penalty Kicks Made",
    "Penalty Kicks Attempted",
    "Yellow Cards",
    "Red Cards",
    "Passes",
    "Carries",
    "Touches",
    "Tackles",
    "Interception",
    "Blocks",
  ];

  const testEmptyPlayerGameStandardStats = (name) => {
    const stats = Object.fromEntries(
      expectedPlayerGameStandardStatsHeaders.map((header) => [
        header.replace(/\s/g, ""),
        0,
      ]),
    );
    stats.Player = name;
    return stats;
  };

  const testMatchDate: Date = new Date("September 21, 2024");

  const testCompetition: string = "English Premier League"

  const testHomeStatus: SquadStatus = {
    onField: testClubOne.Starting11,
    onBench: testClubOne.Bench,
    subbedOut: [],
    injured: [],
    suspended: []    
  }

  const testAwayStatus: SquadStatus = {
    onField: testClubTwo.Starting11,
    onBench: testClubTwo.Bench,
    subbedOut: [],
    injured: [],
    suspended: []    
  }
  
  const expectedMatch: Match = {
    MatchDate: testMatchDate,
    MatchScore: { Arsenal: 0, Chelsea: 0 },
    Competition: testCompetition,
    Home: testClubOne,
    Away: testClubTwo,  
    HomeSquad: testHomeStatus,
    AwaySquad: testAwayStatus,
    HomeOverallStatistics: testEmptyTeamStatistics,
    AwayOverallStatistics: testEmptyTeamStatistics,
    Simulated: false
  };
      
  
  test("test createMatch",  async() => {
    const actualMatch: Match = await createMatch(testMatchDate, testClubOne, testClubTwo, testCompetition);
    expect(actualMatch).toStrictEqual(expectedMatch)
    
  });

});