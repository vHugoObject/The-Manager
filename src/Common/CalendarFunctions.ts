import {
  addMonths,
  nextMonday,
  addWeeks,
  eachWeekendOfMonth,
  isSunday,
  getWeekOfMonth,
  addYears,
  lastDayOfMonth,
  addDays,
  nextSunday,
  startOfYear,
  isWithinInterval,
  subDays,
  differenceInCalendarDays,
} from "date-fns/fp";
import {
  filter,
  overEvery,
  overSome,
  isEqual,
  first,
  map,
  curry,
} from "lodash/fp";
import { flowAsync } from "futil-js";

import { JANUARY, FEBRUARY, AUGUST, JUNE } from "./Constants";

export const addOneDay = addDays(1);
export const subOneDay = subDays(1);
export const addOneWeek = addWeeks(1);
export const addTwoWeeks = addWeeks(2);
export const addOneMonth = addMonths(1);
export const addOneYear = addYears(1);

export const convertIntegerYearToDate = (year: number): Date =>
  new Date(year, JANUARY, 1);

export const getThirdSundayOfAugust = flowAsync(
  convertIntegerYearToDate,
  addMonths(AUGUST),
  eachWeekendOfMonth,
  filter(
    overEvery([isSunday, (date: string) => isEqual(4, getWeekOfMonth(date))]),
  ),
  first,
);

export const getLastDayOfAugust = flowAsync(
  convertIntegerYearToDate,
  addMonths(AUGUST),
  lastDayOfMonth,
);

export const getLastDayOfJuneOfNextYear = flowAsync(
  convertIntegerYearToDate,
  addOneYear,
  addMonths(JUNE),
  lastDayOfMonth,
);

export const getFirstMondayOfFebruaryOfNextYear = flowAsync(
  convertIntegerYearToDate,
  addOneYear,
  addMonths(FEBRUARY),
  nextMonday,
);

export const getJuneFifteenOfNextYear = flowAsync(
  convertIntegerYearToDate,
  addOneYear,
  addMonths(JUNE),
  addTwoWeeks,
);

export const getStartOfNextYear = flowAsync(
  convertIntegerYearToDate,
  addOneYear,
  startOfYear,
);

const defaultTransferWindows: Array<
  [(season: number) => Date, (season: number) => Date]
> = [
  [getThirdSundayOfAugust, getLastDayOfAugust],
  [getStartOfNextYear, getFirstMondayOfFebruaryOfNextYear],
  [getJuneFifteenOfNextYear, getLastDayOfJuneOfNextYear],
];

export const createSeasonWindows = (
  transferWindowFunctionTuples: Array<
    [(season: number) => Date, (season: number) => Date]
  >,
  season: number,
) => {
  return map(
    ([startFunction, endFunction]: [
      (season: number) => Date,
      (season: number) => Date,
    ]) => {
      return isWithinInterval({
        start: startFunction(season),
        end: endFunction(season),
      });
    },
  )(transferWindowFunctionTuples);
};

export const isTransferWindowOpen = curry(
  (
    transferWindowFunctionTuples: Array<
      [(season: number) => Date, (season: number) => Date]
    >,
    [currentSeason, currentDate]: [number, Date],
  ): boolean => {
    return overSome(
      createSeasonWindows(transferWindowFunctionTuples, currentSeason),
    )(currentDate);
  },
);

export const defaultIsTransferWindowOpen = isTransferWindowOpen(
  defaultTransferWindows,
);

export const getNextDomesticMatchDayDate = nextSunday;

export const getDaysLeftInCurrentSeason = (
  currentSeason: number,
  currentDate: Date,
): number => {
  return flowAsync(
    getLastDayOfJuneOfNextYear,
    differenceInCalendarDays(currentDate),
  )(currentSeason);
};
