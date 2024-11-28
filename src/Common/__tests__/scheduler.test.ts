import { describe, expect, test } from "vitest";
import { pickBy, reduce } from "lodash/fp";
import { isSunday, addWeeks, isBefore } from "date-fns";
import type { Interval } from "date-fns";
import { simpleFaker } from "@faker-js/faker";
import { MatchValues } from "tournament-organizer/interfaces";
import {
  Manager as TournamentManager,
  Player as TournamentPlayer,
  Tournament,
} from "tournament-organizer/components";
import { CalendarEntry, Calendar, MatchEntry } from "../CommonTypes";
import { createCountry } from "../../Countries/CountryUtilities";
import { createCalendar } from "../simulationUtilities";
import {
  createScheduler,
  scheduleTournament,
  scheduleMatchs,
  createSeasonCalendar,
} from "../scheduler";
import { totalDoubleRoundRobinGames } from "../simulationUtilities";

describe("createScheduler test suite", async () => {
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

  const expectedCompetitionNames: Array<string> =
    Object.keys(testCompetitionsOne).toSorted();

  const expectedTournaments: number = Object.keys(testCompetitionsOne).length;
  const expectedClubsPerTournaments: number = 4;
  const expectedTotalClubs: number =
    expectedTournaments * expectedClubsPerTournaments;

  const expectedTotalMatches: number = reduce(
    (acc, val) => acc + val,
    0,
    expectedCompetitionNames.map((_) => {
      return totalDoubleRoundRobinGames(expectedClubsPerTournaments);
    }),
  );

  const expectedMatchesPerComp: number =
    expectedTotalMatches / expectedTournaments;

  const expectedRounds: number = expectedMatchesPerComp / 2;

  const expectedMatchesPerMatchDate: number =
    expectedTotalMatches / expectedRounds;

  const expectedMatchesPerCompPerMatchDate: number =
    expectedMatchesPerMatchDate / expectedTournaments;

  const testFirstDay: Date = new Date("08/11/24");
  const testLastDay: Date = new Date("06/14/25");
  const seasonStartDate: Date = new Date("08/18/24");
  const lastMatchDate: Date = addWeeks(seasonStartDate, 6);
  const testSeason: string = "2024";

  const testInterval: Interval = {
    start: testFirstDay,
    end: testLastDay,
  };

  const [testCountry, testCompetitions, testClubs, testPlayers] =
    await createCountry(testCountryOne, testCompetitionsOne, testSeason);

  const filterCalendar = (
    calendar: Calendar,
    filterFunc: Function,
  ): Calendar => {
    const pickFunc = (entry: CalendarEntry, day: string): boolean =>
      filterFunc(day);
    return pickBy(pickFunc, calendar);
  };

  test("Test createScheduler", async () => {
    const actualSchedule: TournamentManager =
      await createScheduler(testCompetitions);
    const actualTournaments: Array<Tournament> = actualSchedule.tournaments;
    expect(actualTournaments.length).toBe(Object.keys(testCompetitions).length);

    actualTournaments.forEach((tournament: Tournament, index: number) => {
      const actualTournamentName: string = tournament.name;
      expect(
        testCompetitionsOne.hasOwnProperty(actualTournamentName),
      ).toBeTruthy();
      expect(tournament.standings).toBeTruthy();
      expect(tournament.matches.length).toBe(totalDoubleRoundRobinGames(4));
      const actualClubs: Array<string> = tournament.players.map(
        (player: TournamentPlayer) => {
          return player.name;
        },
      );

      const expectedClubs: Array<string> = Object.values(
        testCompetitions[tournament.id].Clubs,
      );
      expect(actualClubs.toSorted()).toEqual(expectedClubs.toSorted());
    });
  });

  test("Test scheduleTournament", async () => {
    const actualScheduler: TournamentManager =
      await createScheduler(testCompetitions);
    const testTournament: Tournament = actualScheduler.tournaments[0];
    const testCalendar: Calendar = createCalendar(testFirstDay);
    const testAvailableDates = filterCalendar(testCalendar, isSunday);

    const actualSchedule: Calendar = await scheduleTournament(
      testTournament,
      testAvailableDates,
    );

    const expectedMatchDates: Array<string> = Object.keys(
      testAvailableDates,
    ).slice(0, 6);

    expectedMatchDates.forEach((date: string, index: number) => {
      const actualDayOfMatches: Array<MatchValues> = Object.values(
        actualSchedule[date]["matches"],
      ).map((entry: MatchEntry) => entry.match);
      const actualCountOfMatches: number = actualDayOfMatches.length;
      expect(actualCountOfMatches).toBe(expectedMatchesPerCompPerMatchDate);
      actualDayOfMatches.forEach((match: MatchValues) => {
        expect(match.round).toBe(index + 1);
      });
    });
  });

  test("Test scheduleMatchs", async () => {
    const testCalendar: Calendar = createCalendar(testFirstDay);
    const testAvailableDates = filterCalendar(testCalendar, isSunday);
    const expectedMatchDates: Array<string> = Object.keys(
      testAvailableDates,
    ).slice(0, expectedRounds);

    const [actualFilledCalendar, tournamentManager] = await scheduleMatchs(
      testCalendar,
      testCompetitions,
    );

    expectedMatchDates.forEach((date: string, index: number) => {
      const actualDayOfMatches: Array<MatchValues> = Object.values(
        actualFilledCalendar[date]["matches"],
      ).map((entry: MatchEntry) => entry.match);
      const actualCountOfMatches: number = actualDayOfMatches.length;
      expect(actualCountOfMatches).toBe(expectedMatchesPerMatchDate);

      actualDayOfMatches.forEach((match: MatchValues) => {
        expect(match.round).toBe(index + 1);
      });
    });
  });

  test("Test createSeasonCalendar", async () => {
    const testCalendar: Calendar = createCalendar(testFirstDay);
    const testAvailableDates: Calendar = filterCalendar(testCalendar, isSunday);
    const expectedMatchDates: Array<string> = Object.keys(testAvailableDates)
      .filter((date: string) => isBefore(date, new Date(lastMatchDate)))
      .slice(1, expectedRounds + 1);

    const [actualFilledCalendar, _] = await createSeasonCalendar(
      testCompetitions,
      testSeason,
    );

    let actualMatchCount: number = 0;
    expectedMatchDates.forEach((date: string, index: number) => {
      const actualDayOfMatches: Array<MatchValues> = Object.values(
        actualFilledCalendar[date]["matches"],
      ).map((entry: MatchEntry) => entry.match);
      const actualCountOfMatches: number = actualDayOfMatches.length;
      expect(actualCountOfMatches).toBe(expectedMatchesPerMatchDate);
      actualDayOfMatches.forEach((match: MatchValues) => {
        expect(match.round).toBe(index + 1);
      });

      actualMatchCount += actualCountOfMatches;
    });

    expect(actualMatchCount).toBe(expectedTotalMatches);
  });
});
