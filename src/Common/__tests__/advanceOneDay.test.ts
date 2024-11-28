import { describe, expect, test, expectTypeOf } from "vitest";
import "fake-indexeddb/auto";
import { simpleFaker } from "@faker-js/faker";
import { pickBy } from "lodash/fp";
import { isSunday, addWeeks, isBefore } from "date-fns";
import {
  Manager as TournamentManager,
  Tournament,
  Match as TournamentMatch,
} from "tournament-organizer/components";
import { MatchValues } from "tournament-organizer/interfaces";
import { deleteDB } from "idb";
import { range, flow, sum } from "lodash";
import { StatisticsObject, StatisticsType } from "../../Common/CommonTypes";
import { Entity } from '../../Common/CommonTypes'
import { Player } from "../../Players/PlayerTypes";
import { BaseCountries } from "../../Countries/CountryTypes";
import { Club } from "../../Clubs/ClubTypes";
import { Competition } from "../../Competitions/CompetitionTypes";
import { Match } from "../../Matches/MatchTypes";
import { Save, SaveID } from "../../StorageUtilities/SaveTypes";
import { createSave } from "../../StorageUtilities/SaveCreator";
import { addSaveToDB, getSaveValue} from "../../StorageUtilities/SaveUtilities";
import { Calendar, CalendarEntry, MatchEntry } from "../../Common/CommonTypes";
import { totalDoubleRoundRobinGames } from "../simulationUtilities";
import { advanceOneDay } from "../advanceOneDay";

describe("advanceOneDay  tests", async () => {

  const testDBName: string = "the-manager";
  const testPlayerCountry: string = "England";
  const testSeason: string = "2024"
  const testPlayerCompetitionName: string = "English Premier League";
  const testPlayerClub: string = "Arsenal";
  const testPlayerName: string = "Mikel Arteta";  
  const testCountryOne: string = "England";

  const testCompetitionsOne: Record<string, Record<string, string>> = {
    "English Premier League": {
      [simpleFaker.string.numeric(6)]: "Arsenal",
      [simpleFaker.string.numeric(6)]: "Brentford",
      [simpleFaker.string.numeric(6)]: "Manchester United",
      [simpleFaker.string.numeric(6)]: "Liverpool",
    },
    "The Championship": {
      [simpleFaker.string.numeric(6)]: "Watford",
      [simpleFaker.string.numeric(6)]: "Stoke City",
      [simpleFaker.string.numeric(6)]: "Manchester City",
      [simpleFaker.string.numeric(6)]: "Hull City",
    },
    "League One": {
      [simpleFaker.string.numeric(6)]: "Walsall",
      [simpleFaker.string.numeric(6)]: "Swindon",
      [simpleFaker.string.numeric(6)]: "Farnham",
      [simpleFaker.string.numeric(6)]: "Cambridge",
    },
  };

  const testCountryTwo: string = "Spain";

  // add more teams
  const testCompetitionsTwo: Record<string, Record<string, string>> = {
    "Primera Division": {
      [simpleFaker.string.numeric(6)]: "Real Madrid CF",
      [simpleFaker.string.numeric(6)]: "FC Barcelona",
    },
    "Segunda Division": {
      [simpleFaker.string.numeric(6)]: "Almeria",
      [simpleFaker.string.numeric(6)]: "Granada",
    },
    "Primera Federacion": {
      [simpleFaker.string.numeric(6)]: "Andorra",
      [simpleFaker.string.numeric(6)]: "Atzeneta",
    },
  }

  const testCountriesLeaguesClubs: BaseCountries = {
    [testCountryOne]: testCompetitionsOne,
    [testCountryTwo]: testCompetitionsTwo,
  }

  const testSave: Save = await createSave(
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      { clubID: simpleFaker.string.numeric(6), clubName: testPlayerClub },
      testCountriesLeaguesClubs,
    );
   
  
  const expectedClubNames: Array<string> = Object.values(
    testCountriesLeaguesClubs,
  )
    .flatMap((competition: Record<string, Record<string, string>>) =>
      Object.values(competition),
    )
    .flatMap((clubs: Record<string, string>) => Object.values(clubs));

  const expectedCompetitonNames: Array<string> = Object.values(
    testCountriesLeaguesClubs,
  )
    .map((competitions) => Object.keys(competitions))
    .flat();

  const expectedPlayerNames: Array<string> = Object.values(testSave.allPlayers)
    .map((player: Player) => player.Name)

  const getEntityNames = (entities: Record<string,Entity>): Array<string> => Object.values(entities).map((entity: Entity) => entity.Name)
  const getStatsOfEntities = (entities: Record<string,Entity>): Array<StatisticsObject> => Object.values(entities).map((entity: Entity) => entity.Statistics[testSeason])
  const getStatValuesArray = (arrayOfStats: Array<StatisticsObject>): Array<string | number> => arrayOfStats.flatMap((statObj: StatisticsObject) => Object.values(statObj))
    .filter((statValue) => Number.isInteger(statValue))
  const getAllStats = flow(getStatsOfEntities,getStatValuesArray)

  const filterCalendar = (
    calendar: Calendar,
    filterFunc: Function,
  ): Calendar => {
    const pickFunc = (entry: CalendarEntry, day: string): boolean =>
      filterFunc(day);
    return pickBy(pickFunc, calendar);
  };

  const expectedCompetitionNames: Array<string> =
    Object.keys(testCompetitionsOne).toSorted();

  const expectedTournaments: number = Object.keys(testCompetitionsOne).length;
  const expectedClubsPerTournaments: number = 4;
  const expectedTotalClubs: number =
    expectedTournaments * expectedClubsPerTournaments;

  const expectedTotalMatches: number = sum(
    expectedCompetitionNames.map((_) => {
      return totalDoubleRoundRobinGames(expectedClubsPerTournaments)
    }))

  const expectedMatchesPerComp: number =
    expectedTotalMatches / expectedTournaments;

  const expectedRounds: number = expectedMatchesPerComp / 2;

  const expectedMatchesPerMatchDate: number =
    expectedTotalMatches / expectedRounds;

  const expectedMatchesPerCompPerMatchDate: number =
    expectedMatchesPerMatchDate / expectedTournaments;
  const seasonStartDate: Date = new Date("08/18/24");
  const lastMatchDate: Date = addWeeks(seasonStartDate, 6);  
  

  
  test("Test advanceSaveOneDay once, to a day with no games", async () => {
    
    const expectedNextDay: Date = new Date("08/12/24");
    const saveID: SaveID = await addSaveToDB(testSave);
    await advanceOneDay(saveID);
    const actualSave: Save = await getSaveValue(saveID);

    expect(actualSave.CurrentDate).toStrictEqual(expectedNextDay);

    expectTypeOf(actualSave).toEqualTypeOf(testSave);

    const actualCompetitions: Record<string, Competition> =
      actualSave.allCompetitions;

 
    const actualCompetitionNames: Array<string> = getEntityNames(actualCompetitions)

    
    expect(actualCompetitionNames.toSorted()).toStrictEqual(
      expectedCompetitonNames.toSorted(),
    );
   
    const actualCompetitonStatValues: Array<string | number> = getAllStats(actualCompetitions)
    actualCompetitonStatValues.forEach((value) => expect(value).toBe(0))
    
    
    const actualClubs: Record<string, Club> = actualSave.allClubs;
    const actualClubNames: Array<string> = getEntityNames(actualClubs)

    expect(actualClubNames.toSorted()).toStrictEqual(
      expectedClubNames.toSorted(),
    );
    
    Object.values(actualClubs).forEach((actualClub: Club) => {
      expect(Object.values(actualClub.Squad).length).toBe(25);
    })

    const actualClubsStatValues: Array<string | number> = getAllStats(actualClubs)
    actualClubsStatValues.forEach((value) => expect(value).toBe(0))
    
    const actualPlayers: Record<string, Player> = actualSave.allPlayers;
    const actualPlayerNames: Array<string> = getEntityNames(actualPlayers)
    
    expect(actualPlayerNames).toStrictEqual(expectedPlayerNames);
    const actualPlayersStatValues: Array<string | number> = getAllStats(actualPlayers)
    actualPlayersStatValues.forEach((value) => expect(value).toBe(0))

    const actualMatches: Record<string, Match> = actualSave.allMatches;
    expect(Object.values(actualMatches).length).toBe(0)    
    await deleteDB(testDBName);
  });

  test("Test advanceSaveOneDay three times in a row, to a day with no games", async () => {
    const expectedNextDay: Date = new Date("08/14/24");
    const saveID: SaveID = await addSaveToDB(testSave);
    const days: number = 3;
    for (const _ of range(days)) {
      await advanceOneDay(saveID);
    }

    const actualSave: Save = await getSaveValue(saveID);

    expect(actualSave.CurrentDate).toStrictEqual(expectedNextDay);

    expectTypeOf(actualSave).toEqualTypeOf(testSave);

    const actualCompetitions: Record<string, Competition> =
      actualSave.allCompetitions;

 
    const actualCompetitionNames: Array<string> = getEntityNames(actualCompetitions)

    
    expect(actualCompetitionNames.toSorted()).toStrictEqual(
      expectedCompetitonNames.toSorted(),
    );
   
    const actualCompetitonStatValues: Array<string | number> = getAllStats(actualCompetitions)
    actualCompetitonStatValues.forEach((value) => expect(value).toBe(0))
    
    
    const actualClubs: Record<string, Club> = actualSave.allClubs;
    const actualClubNames: Array<string> = getEntityNames(actualClubs)

    expect(actualClubNames.toSorted()).toStrictEqual(
      expectedClubNames.toSorted(),
    );
    
    Object.values(actualClubs).forEach((actualClub: Club) => {
      expect(Object.values(actualClub.Squad).length).toBe(25);
    })

    const actualClubsStatValues: Array<string | number> = getAllStats(actualClubs)
    actualClubsStatValues.forEach((value) => expect(value).toBe(0))
    
    const actualPlayers: Record<string, Player> = actualSave.allPlayers;
    const actualPlayerNames: Array<string> = getEntityNames(actualPlayers)
    
    expect(actualPlayerNames).toStrictEqual(expectedPlayerNames);
    const actualPlayersStatValues: Array<string | number> = getAllStats(actualPlayers)
    actualPlayersStatValues.forEach((value) => expect(value).toBe(0))

    const actualMatches: Record<string, Match> = actualSave.allMatches;
    expect(Object.values(actualMatches).length).toBe(0)    
    
    await deleteDB(testDBName);
  });

  test("Test advanceSaveOneDay eight days, including a matchDay", async () => {
    const expectedNextDay: Date = new Date("08/19/24");
    const saveID: SaveID = await addSaveToDB(testSave);
    const days: number = 8;
    for (const _ of range(days)) {
      await advanceOneDay(saveID);
    }    

    const actualSave: Save = await getSaveValue(saveID);

    expect(actualSave.CurrentDate).toStrictEqual(expectedNextDay);

    expectTypeOf(actualSave).toEqualTypeOf(testSave);

    const actualCompetitions: Record<string, Competition> =
      actualSave.allCompetitions;

 
    const actualCompetitionNames: Array<string> = getEntityNames(actualCompetitions)

    
    expect(actualCompetitionNames.toSorted()).toStrictEqual(
      expectedCompetitonNames.toSorted(),
    );
   
    const actualCompetitonStatValues: Array<string | number> = getAllStats(actualCompetitions)
    actualCompetitonStatValues.forEach((value) => expect(value).toBe(0))
    
    
    const actualClubs: Record<string, Club> = actualSave.allClubs;
    const actualClubNames: Array<string> = getEntityNames(actualClubs)

    expect(actualClubNames.toSorted()).toStrictEqual(
      expectedClubNames.toSorted(),
    );
    
    Object.values(actualClubs).forEach((actualClub: Club) => {
      expect(Object.values(actualClub.Squad).length).toBe(25);
    })

    const actualClubsStatValues: Array<string | number> = getAllStats(actualClubs)
    actualClubsStatValues.forEach((value) => expect(value).toBe(0))
    
    const actualPlayers: Record<string, Player> = actualSave.allPlayers;
    const actualPlayerNames: Array<string> = getEntityNames(actualPlayers)
    
    expect(actualPlayerNames).toStrictEqual(expectedPlayerNames);
    const actualPlayersStatValues: Array<string | number> = getAllStats(actualPlayers)
    actualPlayersStatValues.forEach((value) => expect(value).toBe(0))
    

    const actualCalendar: Calendar = actualSave.calendar
    const simulatedMatchDay: string = new Date("08/18/24").toDateString();
    const expectedSimulatedMatches: Record<string, MatchEntry> = actualCalendar[simulatedMatchDay].matches

    
    const actualMatches: Record<string, Match> = actualSave.allMatches;
    Object.entries(expectedSimulatedMatches).forEach(([matchId, matchEntry]) => {
      const {match: actualMatchValues, tournamentID: actualTournamentID, country: actualCountry} = matchEntry
      const actualMatch: Match = actualMatches[matchId]
      expect(actualMatch[competitionID]).toBe(tournamentID)
    })
    
    const testScheduleManager = testSave.scheduleManager
    const testTournamentRounds: number =
      testScheduleManager?.tournaments[0].stageOne.rounds;

    const testTournament: Tournament = testScheduleManager.tournaments[0];
    const expectedRound: number = 2;
    
    expect(testTournament.round).toBe(expectedRound);
    const simulatedRound: number = 1;
    testTournament.matches.filter(
      (match: TournamentMatch) => match.round == simulatedRound)
    .forEach((match: TournamentMatch) => {
      expect(match.active).toBeFalsy();
    });
        
    
    await deleteDB(testDBName);
  });

  test("Test advanceOneDay for the whole season", async () => {

    const saveID: SaveID = await addSaveToDB(testSave);
    const actualSave: Save = await getSaveValue(saveID);
    const actualCalendar: Calendar = actualSave.calendar
  const testAvailableMatchDates: Calendar = filterCalendar(actualCalendar, isSunday);
    const simulatedMatchDay: string = Object.keys(testAvailableMatchDates)
      .filter((date: string) => isBefore(date, new Date(lastMatchDate)))[0]

  })
});
