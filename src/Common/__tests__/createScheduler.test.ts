import { describe, expect, test } from "vitest";
import {
  Manager as TournamentManager,
  Player as TournamentPlayer,
    Match as TournamentMatch,
    Tournament
} from 'tournament-organizer/components';

import {
    LoadableTournamentValues,
    MatchValues,
    PlayerValues,
    SettableMatchValues,
    SettablePlayerValues,
    SettableTournamentValues,
    StandingsValues,
    TournamentValues
} from 'tournament-organizer/interfaces';
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
import { Competition, AllCompetitions } from '../../Competitions/CompetitionTypes';
import { createCompetition } from '../../Competitions/CompetitionUtilities';
import { createScheduler } from '../createScheduler'

describe("createScheduler test suite", async() => {
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

  
  test("Test createScheduler", async() => {
    
    const testClubsWithPlayers: Record<string,  Array<Player>> = {
      Arsenal: testPlayersOneArray,
      Brentford: testPlayersTwoArray,
      Liverpool: testPlayersOneArray,
      Brighton: testPlayersTwoArray,
    };


    const testCompetitionSeason: string = "2024"
    const testCompetitionNameOne:  string = "English Premier League";
    const testCompetitionNameTwo:  string = "The Championship";
    const testCompetitionNames: Array<string> = [testCompetitionNameOne,
      testCompetitionNameTwo];

    const testClubNames: Array<string> = Object.keys(testClubsWithPlayers);
    
    const testCompetitionOne: Competition = createCompetition(
      testCompetitionNameOne,
      testCompetitionSeason,
      testClubsWithPlayers
    )

    const testCompetitionTwo: Competition = createCompetition(
      testCompetitionNameTwo,
      testCompetitionSeason,
      testClubsWithPlayers
    )
    
    // 4 teams = 6 matches
    const expectedTotalMatches: number = 6;

    
    const testCompetitions: AllCompetitions = {
      England : {
	[testCompetitionNameOne]: testCompetitionOne,
	[testCompetitionNameTwo]: testCompetitionTwo
	
      }
    }
    
    const actualSchedule: TournamentManager = await createScheduler(testCompetitions);
    const actualTournaments: Array<Tournament> = actualSchedule.tournaments;

    expect(actualTournaments.length).toBe(2)

    actualTournaments.forEach((tournament: Tournament, index: number) => {
      expect(tournament.name).toBe(testCompetitionNames[index]);
      expect(tournament.standings).toBeTruthy();
      expect(tournament.matches.length).toBe(expectedTotalMatches);
      const actualClubs: Array<string> = tournament.players.map((player: TournamentPlayer) => {
	return player.name
      })
      
      expect(actualClubs.toSorted()).toEqual(testClubNames.toSorted())
      
    })

        

    

  });

})
