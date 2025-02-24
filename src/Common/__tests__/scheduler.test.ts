import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { fakerToArb } from "../testingUtilities";
import { convertToSet } from "../CommonUtilities";
import {
  flatMap,
  map,
  property,
  flattenDeep,
  slice,
  sum,
  partial,
  max,
  last,
  min,
} from "lodash/fp";
import { flowAsync } from "futil-js";
import {
  isSunday,
  isAfter,
  eachDayOfIntervalWithOptions,
  format,
  isBefore,
} from "date-fns/fp";
import type { Interval } from "date-fns";
import {
  Manager as TournamentManager,
  Player as TournamentClub,
  Match as TournamentMatch,
  Tournament,
} from "tournament-organizer/components";
import { CalendarEntry, Calendar, MatchEntry, Entity } from "../CommonTypes";
import { Competition } from "../../Competitions/CompetitionTypes";
import { createCountry } from "../../Countries/CountryUtilities";
import {
  createCalendar,
  calendarFilterCombiner,
  filterCalendar,
  addOneWeek,
} from "../Calendar";
import {
  createScheduler,
  createSeasonCalendar,
  scheduleMatches,
  zipShortest,
} from "../scheduler";

describe("createScheduler test suite", async () => {
  const getCount = (array: Array<any>): number => array.length;
  const getTestArrayLengths = map(getCount);
  const assertSetsEquality = map(([actual, expected]: [Set<any>, Set<any>]) => {
    expect(actual).toStrictEqual(expected);
  });

  const getSetOfEntityNameIDTuples = flowAsync(
    map((testEntity: Entity) => [testEntity.ID, testEntity.Name]),
    convertToSet,
  );

  const getRandomIndex = (collection: Array<any>, g): number =>
    g(fc.integer, { min: 0, max: collection.length - 1 });

  const getMatchEntries = (
    calendar: Calendar,
    date: string,
  ): Array<MatchEntry> => {
    return Object.values(calendar[date]["matches"]);
  };

  const getMatchEntriesCount = (schedule: Calendar, date: string): number =>
    getMatchEntries(schedule, date).length;

  const getMatchValues = map(property(["match"]));

  const getExpectedWeeks = (totalMatches: number, totalClubs: number) =>
    totalMatches / totalClubs;
  const getMatchDates = (availableDates: Calendar, weeks: number) =>
    slice(0, weeks - 1)(Object.keys(availableDates));
  const getExpectedMatchesPerWeek = (clubs: number) => Math.round(clubs / 2);

  const getCompetitionIDNameTuplesFromScheduleManager = flowAsync(
    map((actualCompetition: Tournament) => [
      actualCompetition.id,
      actualCompetition.name,
    ]),
    convertToSet,
  );

  const getClubIDNameTuplesFromScheduleManager = flowAsync(
    flatMap((actualCompetition: Tournament) => actualCompetition.players),
    map((club: TournamentClub) => [club.id, club.name]),
    convertToSet,
  );

  const getExpectedTotalMatchesPerCompetition = map(totalDoubleRoundRobinGames);

  const getEverySevenDaysOfInterval = flowAsync(
    eachDayOfIntervalWithOptions({ step: 7 }),
    map(format("iii MMM dd yyyy")),
  );

  const getSliceOfDateRange = (index: number, interval) => {
    return slice(0, index, interval);
  };

  const getCountOfClubsPerTournament = map(
    (competition: Tournament): number => competition.players.length,
  );
  const getCountOfClubsPerCompetition = map(
    (competition: Competition): number => Object.keys(competition.Clubs).length,
  );
  const getMatchesPerTournament = map(
    (competition: Tournament): number =>
      Object.keys(competition.matches).length,
  );

  const getSetOfCountOfClubsPerTournament = flowAsync(
    getCountOfClubsPerTournament,
    convertToSet,
  );

  const getSetOfCountOfClubsPerCompetition = flowAsync(
    getCountOfClubsPerCompetition,
    convertToSet,
  );

  const getExpectedTotalMatches = flowAsync(getMatchesPerTournament, sum);

  const getExpectedWeeksBasedOnCompWithMostRounds = flowAsync(
    flatMap((competition: Tournament) => competition.matches),
    map((match: TournamentMatch) => match.round),
    max,
  );

  const expectedMatchCountOfLastDay = (competitions: Array<Tournament>) => {
    const expectedMaxMatches: number = flowAsync(
      getMatchesPerTournament,
      max,
    )(competitions);
    const expectedMaxRounds: number =
      getExpectedWeeksBasedOnCompWithMostRounds(competitions);
    return Math.round(expectedMaxMatches / expectedMaxRounds);
  };

  test.prop(
    [
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.company.name()),
        fc.dictionary(
          fakerToArb((faker) => faker.string.uuid()),
          fakerToArb((faker) => faker.company.name()),
          { minKeys: 2 },
        ),
        { minKeys: 1 },
      ),
    ],
    { numRuns: 50 },
  )(
    "createScheduler",
    async (testCountryName, testSeason, testCountryCompetitions) => {
      const [testCountry, testCompetitions, testClubs, testPlayers] =
        await createCountry(
          testCountryName,
          testCountryCompetitions,
          testSeason,
        );

      const actualSchedule: TournamentManager =
        await createScheduler(testCompetitions);

      const actualCompetitions: Array<Tournament> = actualSchedule.tournaments;

      const expectedCompetitionIDNameTuples: Set<[string, string]> =
        getSetOfEntityNameIDTuples(testCompetitions);

      const expectedClubIDNameTuples: Set<[string, string]> =
        getSetOfEntityNameIDTuples(flattenDeep(testClubs));

      const actualClubIDNameTuples: Set<[string, string]> =
        getClubIDNameTuplesFromScheduleManager(actualCompetitions);

      const actualCompetitionIDNameTuples: Set<[string, string]> =
        getCompetitionIDNameTuplesFromScheduleManager(actualCompetitions);

      assertSetsEquality([
        [expectedClubIDNameTuples, actualClubIDNameTuples],
        [expectedCompetitionIDNameTuples, actualCompetitionIDNameTuples],
      ]);
    },
  );

  test.prop(
    [
      fc.array(fc.integer(), { minLength: 1 }),
      fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
    ],
    { numRuns: 50 },
  )("zipShortest", async (testArrayOne, testArrayTwo) => {
    const getMinTestArrayLengths = flowAsync(getTestArrayLengths, min);

    const minLength: number = getMinTestArrayLengths([
      testArrayOne,
      testArrayTwo,
    ]);
    const zippedArray = zipShortest(testArrayOne, testArrayTwo);
    expect(zippedArray.length).toEqual(minLength);
  });

  test.prop(
    [
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.company.name()),
        fc.dictionary(
          fakerToArb((faker) => faker.string.uuid()),
          fakerToArb((faker) => faker.company.name()),
          { minKeys: 4, maxKeys: 20 },
        ),
        { minKeys: 1 },
      ),
    ],
    { numRuns: 50 },
  )(
    "scheduleMatches",
    async (testCountryName, testSeason, testCountryCompetitions) => {
      const testFirstMatchDate: Date = new Date("08/11/2024");
      const [testCountry, testCompetitions, testClubs, testPlayers] =
        await createCountry(
          testCountryName,
          testCountryCompetitions,
          testSeason,
        );

      const testFilter = calendarFilterCombiner(
        isSunday,
        isAfter(testFirstMatchDate),
      );
      const getDomesticLeagueCalendar = flowAsync(
        createCalendar,
        partial(filterCalendar, [testFilter]),
      );

      const testCalendar: Calendar =
        getDomesticLeagueCalendar(testFirstMatchDate);

      const [actualCalendar, actualScheduler]: [Calendar, TournamentManager] =
        await scheduleMatches(testSeason, [testCompetitions, testCalendar]);
      const dates: Array<string> = Object.keys(actualCalendar);
      const lastDate = last(dates);

      const expectedDateRange = {
        start: addOneWeek(testFirstMatchDate),
        end: lastDate,
      };

      const expectedTotalClubsBasedOnTournaments: Set<string> =
        getSetOfCountOfClubsPerTournament(actualScheduler.tournaments);
      const expectedTotalClubsBasedOnCompetitions: Set<string> =
        getSetOfCountOfClubsPerCompetition(testCompetitions);

      expect(expectedTotalClubsBasedOnTournaments).toStrictEqual(
        expectedTotalClubsBasedOnCompetitions,
      );

      const expectedTotalMatches: number = getExpectedTotalMatches(
        actualScheduler.tournaments,
      );

      const expectedWeeks: number = getExpectedWeeksBasedOnCompWithMostRounds(
        actualScheduler.tournaments,
      );

      const possibleMatchDates = getEverySevenDaysOfInterval(expectedDateRange);
      const expectedDates = getSliceOfDateRange(
        expectedWeeks,
        possibleMatchDates,
      );

      const getCountOfMatchEntriesInRangeOfDates = flowAsync(
        map((date: string) => property([date], actualCalendar)),
        flatMap(property(["matches"])),
        flatMap(Object.keys),
        getCount,
      );

      const getActualMatchCountOfDate = (
        actualCalendar: Calendar,
        date: string,
      ): number => {
        return flowAsync(
          property([date, "matches"]),
          Object.keys,
          getCount,
        )(actualCalendar);
      };

      const getActualMatchCountOfLastDay = flowAsync(
        last,
        partial(getActualMatchCountOfDate, [actualCalendar]),
      );

      const actualTotalMatches: number =
        getCountOfMatchEntriesInRangeOfDates(expectedDates);
      const actualTotalMatchesOnLastDay: number =
        getActualMatchCountOfLastDay(expectedDates);
      const expectedTotalMatchesOnLastDay: number = expectedMatchCountOfLastDay(
        actualScheduler.tournaments,
      );

      expect(actualTotalMatchesOnLastDay).toBeGreaterThanOrEqual(
        expectedTotalMatchesOnLastDay,
      );
      expect(actualTotalMatches).toEqual(expectedTotalMatches);
    },
  );

  test.prop(
    [
      fakerToArb((faker) => faker.location.country()),
      fakerToArb((faker) => faker.date.anytime().getFullYear().toString()),
      fc.dictionary(
        fakerToArb((faker) => faker.company.name()),
        fc.dictionary(
          fakerToArb((faker) => faker.string.uuid()),
          fakerToArb((faker) => faker.company.name()),
          { minKeys: 4, maxKeys: 20 },
        ),
        { minKeys: 1 },
      ),
    ],
    { numRuns: 50 },
  )(
    "createSeasonCalendar",
    async (testCountryName, testSeason, testCountryCompetitions) => {
      // pretty sure this test sucks
      const testFirstMatchDate: Date = new Date("08/11/2024");
      const testStartSeason = "2024";
      const [testCountry, testCompetitions, testClubs, testPlayers] =
        await createCountry(
          testCountryName,
          testCountryCompetitions,
          testSeason,
        );

      const [actualCalendar, actualScheduler]: [Calendar, TournamentManager] =
        await createSeasonCalendar(testStartSeason, testCompetitions);
      const dates: Array<string> = Object.keys(actualCalendar);
      const lastDate = last(dates);

      const expectedDateRange = {
        start: addOneWeek(testFirstMatchDate),
        end: lastDate,
      };

      const expectedTotalClubsBasedOnTournaments: Set<string> =
        getSetOfCountOfClubsPerTournament(actualScheduler.tournaments);
      const expectedTotalClubsBasedOnCompetitions: Set<string> =
        getSetOfCountOfClubsPerCompetition(testCompetitions);

      expect(expectedTotalClubsBasedOnTournaments).toStrictEqual(
        expectedTotalClubsBasedOnCompetitions,
      );

      const expectedTotalMatches: number = getExpectedTotalMatches(
        actualScheduler.tournaments,
      );

      const expectedWeeks: number = getExpectedWeeksBasedOnCompWithMostRounds(
        actualScheduler.tournaments,
      );

      const possibleMatchDates = getEverySevenDaysOfInterval(expectedDateRange);
      const expectedDates = getSliceOfDateRange(
        expectedWeeks,
        possibleMatchDates,
      );

      const getCountOfMatchEntriesInRangeOfDates = flowAsync(
        map((date: string) => property([date], actualCalendar)),
        flatMap(property(["matches"])),
        flatMap(Object.keys),
        getCount,
      );

      const actualTotalMatches: number =
        getCountOfMatchEntriesInRangeOfDates(expectedDates);

      expect(actualTotalMatches).toEqual(expectedTotalMatches);
    },
  );
});
