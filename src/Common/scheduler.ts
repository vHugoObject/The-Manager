import {
  pickBy,
  mapValues,
  flatMap,
  partial,
  map,
  groupBy,
  zipObject,
  constant,
  fromPairs,
  zipWith,
  min,
  zipAll,
  slice,
} from "lodash/fp";
import { mapValuesIndexed, flowAsync, updatePaths } from "futil-js";
import {
  Manager as TournamentManager,
  Player as TournamentPlayer,
  Match as TournamentMatch,
  Tournament,
} from "tournament-organizer/components";
import { isAfter, isSunday, addWeeks, nextSunday } from "date-fns/fp";
import { Competition } from "../Competitions/CompetitionTypes";
import { CalendarEntry, Calendar, MatchEntry, Entity } from "./CommonTypes";
import { MATCHDAYFUNCTIONS } from "./Constants";
import { createTournament } from "./scheduleManagementUtilities";
import { createCalendar } from "./Calendar";

export const createScheduler = async (
  allCompetitions: Array<Competition>,
): Promise<TournamentManager> => {
  const scheduler: TournamentManager = new TournamentManager();

  await flowAsync(map(partial(createTournament, [scheduler])))(allCompetitions);

  return scheduler;
};

export const filterCalendar = (
  filterFunc: Function,
  calendar: Calendar,
): Calendar => {
  const pickFunc = (_: CalendarEntry, day: string): boolean => {
    return filterFunc(day);
  };
  return pickBy(pickFunc, calendar);
};

export const addOneWeek = addWeeks(1);

export const getCalendarStartDate = (season: string): Date => {
  const startOfAugust = (year: string): Date => new Date(parseInt(year), 7, 1);
  return flowAsync(startOfAugust, nextSunday, nextSunday)(season);
};

export const calendarFilterCombiner = (
  predOne: Function,
  predTwo: Function,
): Function => {
  return (date) => predOne(date) && predTwo(date);
};

export const zipShortest = (
  arrayOne: Array<any>,
  arrayTwo: Array<any>,
): Array<[any, any]> => {
  const minLength: number = flowAsync(
    map((array: Array<any>) => array.length),
    min,
  )([arrayOne, arrayTwo]);

  return flowAsync(
    map((array: Array<any>) => slice(0, minLength, array)),
    zipAll,
  )([arrayOne, arrayTwo]);
};

export const scheduleMatches = async (
  season: string,
  [competitions, calendar]: [Array<Competition>, Calendar],
): Promise<[Calendar, TournamentManager]> => {
  const scheduler: TournamentManager = await createScheduler(competitions);
  const updater = await flowAsync(
    flatMap((competition: Tournament) =>
      map((match: TournamentMatch) => [competition.id, match])(
        competition.matches,
      ),
    ),
    groupBy(([, match]: [string, TournamentMatch]) => match.round),
    mapValues((matches: Array<[string, TournamentMatch]>) => {
      return flowAsync(
        map(
          ([tournamentID, match]: [string, TournamentMatch]): [
            string,
            MatchEntry,
          ] => [match.id, { match, tournamentID, season }],
        ),
        Object.fromEntries,
        (matchEntries: Record<string, MatchEntry>) =>
          Object.fromEntries([["matches", constant(matchEntries)]]),
      )(matches);
    }),
    Object.values,
    partial(zipShortest, [Object.keys(calendar)]),
    Object.fromEntries,
  )(scheduler.tournaments);

  return [updatePaths(updater, calendar), scheduler];
};

export const createSeasonCalendar = async (
  season: string,
  allCompetitions: Array<Competition>,
): Promise<[Calendar, TournamentManager]> => {
  // need an enum for CompetitionType for each Competition
  const calendarStartDate = getCalendarStartDate(season);
  const domesticLeaguesFilter = calendarFilterCombiner(
    isSunday,
    isAfter(calendarStartDate),
  );
  const getDomesticLeagueCalendar = flowAsync(
    createCalendar,
    partial(filterCalendar, [domesticLeaguesFilter]),
  );

  const calendar: Calendar = getDomesticLeagueCalendar(calendarStartDate);

  return await scheduleMatches(season, [allCompetitions, calendar]);
};
