import { reduce, merge, set, pickBy, concat, update } from "lodash/fp";
import {
  Manager as TournamentManager,
  Player as TournamentPlayer,
  Match as TournamentMatch,
  Tournament,
} from "tournament-organizer/components";
import { isSunday, addWeeks } from "date-fns";
import { isBefore } from "date-fns/fp";
import { SettableTournamentValues } from "tournament-organizer/interfaces";
import { Competition } from "../Competitions/CompetitionTypes";
import { CalendarEntry, Calendar, MatchEntry, Entity } from "./CommonTypes";
import { createCalendar } from "./simulationUtilities";

// don't think createTournament can be async
// we need to tests this with at least two comps
export const createScheduler = async (
  allCompetitions: Record<string, Competition>,
): Promise<TournamentManager> => {
  const scheduler: TournamentManager = new TournamentManager();

  const createTournamentClubs = (
    clubs: Record<string, string>,
  ): Array<TournamentPlayer> => {
    return Object.entries(clubs).map(([clubID, clubName]) => {
      return new TournamentPlayer(clubID, clubName);
    });
  };

  const createTournament = async (
    scheduler: TournamentManager,
    competition: Competition,
  ): Promise<void> => {
    const scoring: Record<string, number> = {
      win: 3,
      draw: 1,
      loss: 0,
      bye: 2,
    };

    const tournamentValues: SettableTournamentValues = {
      players: createTournamentClubs(competition.Clubs),
      stageOne: { format: "double-round-robin" },
      sorting: "descending",
      scoring,
    };

    scheduler
      .createTournament(competition.Name, tournamentValues, competition.ID)
      .start();
  };

  await Promise.all(
    Object.values(allCompetitions).map((competition: Competition) =>
      createTournament(scheduler, competition),
    ),
  );

  return scheduler;
};

export const scheduleTournament = async (
  tournament: Tournament,
  availableDates: Calendar,
): Promise<Calendar> => {
  const matches: Array<TournamentMatch> = tournament.matches;
  return Object.fromEntries(
    Object.entries(availableDates).map(([date, calendarEntry], index) => {
      const matchesForDate: Record<string, MatchEntry> = Object.fromEntries(
        matches
          .filter((match: TournamentMatch) => match.round == index + 1)
          .map((match: TournamentMatch) => [
            match.id,
            { match: structuredClone(match), tournamentID: tournament.id },
          ]),
      );
      const newCalendarEntry: CalendarEntry = set(
        "matches",
        matchesForDate,
        calendarEntry,
      );
      return [date, newCalendarEntry];
    }),
  );
};

export const scheduleMatchs = async (
  calendar: Calendar,
  allCompetitions: Record<string, Competition>,
): Promise<[Calendar, TournamentManager]> => {
  const matchDayFunctions: Record<string, Function> = {
    domesticLeague: isSunday,
  };

  // need an enum for CompetitionType for each Competition
  const schedule: TournamentManager = await createScheduler(allCompetitions);

  const getMatchDays = (calendar: Calendar, filterFunc: Function): Calendar => {
    const pickFunc = (_: CalendarEntry, day: string): boolean =>
      filterFunc(day);
    return pickBy(pickFunc, calendar);
  };

  const calendarEntryAccumulator = (
    accumulator: CalendarEntry,
    value: CalendarEntry,
  ): CalendarEntry => {
    const matchesToAdd: Record<string, MatchEntry> = value.matches;
    const updater = (
      accumulatedMatches: Record<string, MatchEntry>,
    ): Record<string, MatchEntry> => {
      return merge(accumulatedMatches, matchesToAdd);
    };
    return update("matches", updater, accumulator);
  };

  const calendarReducer = (
    availableDate: CalendarEntry,
    schedules: Array<CalendarEntry>,
  ): CalendarEntry => {
    return reduce(calendarEntryAccumulator, availableDate, schedules);
  };

  const getCalendarEntries = (
    calendars: Array<Calendar>,
    day: string,
  ): Array<CalendarEntry> => {
    return calendars.map((calendar: Calendar) => calendar[day]);
  };

  const calendarCombiner = (
    availableDates: Calendar,
    schedules: Array<Calendar>,
  ): Calendar => {
    return Object.fromEntries(
      Object.entries(availableDates).map(([date, calendarEntry]) => {
        const calendarEntries: Array<CalendarEntry> = getCalendarEntries(
          schedules,
          date,
        );
        const combinedCalendarEntry: CalendarEntry = calendarReducer(
          calendarEntry,
          calendarEntries,
        );
        return [date, combinedCalendarEntry];
      }),
    );
  };

  const availableDatesForDomesticLeagues: Calendar = getMatchDays(
    calendar,
    matchDayFunctions["domesticLeague"],
  );

  const domesticLeaguesMatches: Array<Tournament> = schedule.tournaments;

  const domesticLeagueSchedules: Array<Calendar> = await Promise.all(
    domesticLeaguesMatches.map((domesticLeague: Tournament) => {
      return scheduleTournament(
        domesticLeague,
        availableDatesForDomesticLeagues,
      );
    }),
  );

  const combinedCalendar: Calendar = calendarCombiner(
    availableDatesForDomesticLeagues,
    domesticLeagueSchedules,
  );
  return [merge(calendar, combinedCalendar), schedule];
};

export const createSeasonCalendar = async (
  allCompetitions: Record<string, Competition>,
  season: string,
): Promise<[Calendar, TournamentManager]> => {
  const getCalendarStartDate = (season: string): Date => {
    return new Date("08/11/24");
  };

  const getSeasonStartDate = (date: Date) => {
    return addWeeks(date, 1);
  };

  const filterCalendar = (
    calendar: Calendar,
    filterFunc: Function,
  ): Calendar => {
    const pickFunc = (_: CalendarEntry, day: string): boolean =>
      filterFunc(day);
    return pickBy(pickFunc, calendar);
  };

  const calendarStartDate: Date = getCalendarStartDate(season);
  const seasonStartDate: Date = getSeasonStartDate(calendarStartDate);
  const isBeforeStartDate = isBefore(seasonStartDate);
  const isAfterSeasonStartDate = (date: Date) => {
    return !isBeforeStartDate(date);
  };

  const emptyCalendar: Calendar = createCalendar(calendarStartDate);
  const filteredCalendar: Calendar = filterCalendar(
    emptyCalendar,
    isAfterSeasonStartDate,
  );
  const [matchCalendar, tournamentManager] = await scheduleMatchs(
    filteredCalendar,
    allCompetitions,
  );

  return [merge(emptyCalendar, matchCalendar), tournamentManager];
};
