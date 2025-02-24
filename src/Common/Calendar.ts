import {
  eachDayOfInterval,
  getYear,
  addMonths,
  parse,
  nextMonday,
  addWeeks,
  eachWeekendOfMonth,
  isSunday,
  getWeekOfMonth,
  addYears,
  lastDayOfMonth,
  addDays,
} from "date-fns/fp";
import type { EachDayOfIntervalResult, Interval } from "date-fns";
import {
  reduce,
  merge,
  mergeAll,
  map,
  concat,
  pickBy,
  filter,
  overEvery,
  isEqual,
  first,
} from "lodash/fp";
import { flowAsync } from "futil-js";
import { CalendarEntry, Calendar, Entity } from "./CommonTypes";
import { JUNE, AUGUST, FEBRUARY } from "./Constants";

export const addOneDay = addDays(1);
export const addOneWeek = addWeeks(1);
export const addOneYear = addYears(1);
export const parseYear = parse(new Date(1, 1), "y");

// how does date--fns do week numbers
export const getThirdSundayOfAugust = flowAsync(
  parseYear,
  addMonths(AUGUST),
  eachWeekendOfMonth,
  filter(
    overEvery([isSunday, (date: string) => isEqual(4, getWeekOfMonth(date))]),
  ),
  first,
);

export const getLastDayOfAugust = flowAsync(
  parseYear,
  addMonths(AUGUST),
  lastDayOfMonth,
);

export const getLastDayOfJuneOfNextYear = flowAsync(
  parseYear,
  addOneYear,
  addMonths(JUNE),
  lastDayOfMonth,
);

export const getFirstMondayOfFebruaryOfNextYear = flowAsync(
  addOneYear,
  addMonths(FEBRUARY),
  nextMonday,
);

const augustInterval = {
  start: new Date(year, AUGUST, 1),
  end: new Date(year, AUGUST, 31),
};

export const createCalendar = (start: Date): Calendar => {};

export const totalDoubleRoundRobinGames = (clubs: number): number => {
  return clubs * (clubs - 1);
};
