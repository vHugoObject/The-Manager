import { pickBy } from 'lodash/fp'
import { addDays, eachDayOfInterval, isSunday } from 'date-fns'
import type { EachDayOfIntervalResult, Interval } from "date-fns";
import { describe, expect, test } from "vitest";
import {
  Manager as TournamentManager,
  Player as TournamentPlayer,
    Match as TournamentMatch,
    Tournament
} from 'tournament-organizer/components';

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
import { CalendarEntry, Calendar } from '../CommonTypes'
import { createCompetition } from '../../Competitions/CompetitionUtilities';
import { createCalendar } from '../simulationUtilities'
import { createScheduler, scheduleTournament, scheduleMatchs,
  createSeasonCalendar } from '../scheduler'
import { totalDoubleRoundRobinGames } from '../simulationUtilities'

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
    
    const expectedTotalMatches: number = 12;

    
    const testCompetitions: AllCompetitions = {
      England : {
	[testCompetitionNameOne]: testCompetitionOne,
	[testCompetitionNameTwo]: testCompetitionTwo
	
      }
    }

  const testFirstDay: Date = new Date("08/11/24")
  const testLastDay: Date = new Date("06/14/25");
  const seasonStartDate: Date = new Date("08/18/24");

  const testSeason: string = "2024"

  const testInterval: Interval = {
      start: testFirstDay,
      end: testLastDay
  }

      const filterCalendar = (calendar: Calendar, filterFunc: Function): Calendar => {
      const pickFunc = (entry: CalendarEntry, day: string): boolean => filterFunc(day)
      return pickBy(pickFunc, calendar)

    }

  
  test("Test createScheduler", async() => {
            
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
  })

  test("Test scheduleTournament", async() => {

    const expectedMatches: number = totalDoubleRoundRobinGames(testClubNames.length)
    const expectedRounds: number = expectedMatches/2
    const expectedMatchesPerMatchDate: number = expectedMatches/expectedRounds
    const actualScheduler: TournamentManager = await createScheduler(testCompetitions);
    const testTournament: Tournament = actualScheduler.tournaments[0];
    
    const testCalendar: Calendar = createCalendar(testFirstDay);
    
    const testAvailableDates = filterCalendar(testCalendar, isSunday)        
    
    const actualSchedule: Calendar = await scheduleTournament(testTournament, testAvailableDates)

    const expectedMatchDates: Array<string> = Object.keys(testAvailableDates).slice(0,6)
    
    expectedMatchDates.forEach((date: string, index: number) => {
      const actualDayOfMatches: Array<TournamentMatch> = actualSchedule[date]["matches"];
      const actualCountOfMatches: number = actualDayOfMatches.length
      expect(actualCountOfMatches).toBe(expectedMatchesPerMatchDate)      
      actualDayOfMatches.forEach((match: TournamentMatch) => {
	expect(match.round).toBe(index+1)
      })

    })

    
  })

  test("Test scheduleMatchs", async() => {

    const expectedMatches: number = totalDoubleRoundRobinGames(testClubNames.length) * 2
    const expectedRounds: number = totalDoubleRoundRobinGames(testClubNames.length)/2
    const expectedMatchesPerMatchDate: number = expectedMatches/expectedRounds

    const testCalendar: Calendar = createCalendar(testFirstDay);    
    const testAvailableDates = filterCalendar(testCalendar, isSunday)        
    const expectedMatchDates: Array<string> = Object.keys(testAvailableDates).slice(0,6)
        
    const [actualFilledCalendar, tournamentManager] = await scheduleMatchs(testCalendar, testCompetitions)    
    
    expectedMatchDates.forEach((date: string, index: number) => {
      const actualDayOfMatches: Array<TournamentMatch> = actualFilledCalendar[date]["matches"];
      const actualCountOfMatches: number = actualDayOfMatches.length
      expect(actualCountOfMatches).toBe(expectedMatchesPerMatchDate)      
      actualDayOfMatches.forEach((match: TournamentMatch) => {
	expect(match.round).toBe(index+1)
      })
    })

    
    

  })

  test("Test createSeasonCalendar", async() => {
    const expectedMatches: number = totalDoubleRoundRobinGames(testClubNames.length) * 2
    const expectedRounds: number = totalDoubleRoundRobinGames(testClubNames.length)/2
    const expectedMatchesPerMatchDate: number = expectedMatches/expectedRounds

    const testCalendar: Calendar = createCalendar(testFirstDay);    
    const testAvailableDates: Calendar = filterCalendar(testCalendar, isSunday)        
    const expectedMatchDates: Array<string> = Object.keys(testAvailableDates).slice(1,expectedRounds+1) 
        
    const [actualFilledCalendar, _] = await createSeasonCalendar(testCompetitions, testSeason)                          

    let actualMatchCount: number = 0;
    expectedMatchDates.forEach((date: string, index: number) => {
      const actualDayOfMatches: Array<TournamentMatch> = actualFilledCalendar[date]["matches"];   
      const actualCountOfMatches: number = actualDayOfMatches.length
      expect(actualCountOfMatches).toBe(expectedMatchesPerMatchDate)      
      actualDayOfMatches.forEach((match: TournamentMatch) => {
	expect(match.round).toBe(index+1)
      })

      actualMatchCount += actualCountOfMatches
    })

    expect(actualMatchCount).toBe(expectedMatches)


    
  })
    

        

    

  });

