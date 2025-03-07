import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  isSunday,
  isMonday,
  isSameMonth,
  isSameYear,
  isSameDay,
  getWeekOfMonth,
  eachDayOfInterval,
  isEqual as isDateEqual,
  isWithinInterval,
  addDays,
  format,
} from "date-fns/fp";
import type { Interval } from "date-fns";
import { overEvery, isEqual, over, map, zip, chunk, sample } from "lodash/fp";
import { flowAsync } from "futil-js";
import { JUNE, AUGUST, JANUARY, FEBRUARY } from "../Constants";
import {
  convertIntegerYearToDate,
  getThirdSundayOfAugust,
  getLastDayOfJuneOfNextYear,
  getLastDayOfAugust,
  getFirstMondayOfFebruaryOfNextYear,
  getJuneFifteenOfNextYear,
  getStartOfNextYear,
  createSeasonWindows,
  isTransferWindowOpen,
  getDaysLeftInCurrentSeason,
  getNextDomesticMatchDayDate,
  addOneDay,
  subOneDay,
  defaultIsTransferWindowOpen,
} from "../CalendarFunctions";

describe("Calendar", async () => {
  test.prop([fc.integer({ min: 2000, max: 2100 })])(
    "convertIntegerYearToDate",
    async (testYear) => {
      const actualDate: Date = convertIntegerYearToDate(testYear);
      expect(actualDate.getFullYear()).toEqual(testYear);
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })])(
    "getThirdSundayOfAugust",
    async (testYear) => {
      // need a constant AUGUST and JANPLUSAUGUST
      const actualDate: Date = getThirdSundayOfAugust(testYear);
      const asserter = overEvery([
        isSunday,
        flowAsync(getWeekOfMonth, isEqual(4)),
        isSameMonth(new Date(testYear, AUGUST, 1)),
        isSameYear(new Date(testYear, 0, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })])(
    "getLastDayOfAugust",
    async (testYear) => {
      const actualDate: Date = getLastDayOfAugust(testYear);
      const asserter = overEvery([
        isSameMonth(new Date(testYear, AUGUST)),
        isSameYear(new Date(testYear, 0, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })])(
    "getLastDayOfJuneOfNextYear",
    async (testYear) => {
      const actualDate: Date = getLastDayOfJuneOfNextYear(testYear);
      const asserter = overEvery([
        isSameMonth(new Date(testYear + 1, JUNE)),
        isSameYear(new Date(testYear + 1, 0, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })])(
    "getFirstMondayOfFebruaryOfNextYear",
    async (testYear) => {
      const actualDate: Date = getFirstMondayOfFebruaryOfNextYear(testYear);
      const asserter = overEvery([
        isMonday,
        isSameMonth(new Date(testYear + 1, FEBRUARY)),
        isSameYear(new Date(testYear + 1, 0, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })])(
    "getJuneFifteenOfNextYear",
    async (testYear) => {
      const actualDate: Date = getJuneFifteenOfNextYear(testYear);
      const asserter = overEvery([
        isSameMonth(new Date(testYear + 1, JUNE)),
        isSameYear(new Date(testYear + 1, 0, 1)),
        isSameDay(new Date(testYear + 1, JUNE, 15)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })])(
    "getStartOfNextYear",
    async (testYear) => {
      const actualDate: Date = getStartOfNextYear(testYear);
      const asserter = overEvery([
        isSameMonth(new Date(testYear + 1, JANUARY)),
        isSameYear(new Date(testYear + 1, JANUARY, 1)),
        isSameDay(new Date(testYear + 1, JANUARY, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })])(
    "createSeasonWindows",
    async (testSeason) => {
      const testStartsAndEnds: Array<Date> = over([
        getThirdSundayOfAugust,
        getLastDayOfAugust,
        flowAsync(getLastDayOfAugust, addOneDay),
        flowAsync(getStartOfNextYear, subOneDay),
        getStartOfNextYear,
        getFirstMondayOfFebruaryOfNextYear,
        flowAsync(getFirstMondayOfFebruaryOfNextYear, addOneDay),
        flowAsync(getJuneFifteenOfNextYear, subOneDay),
        getJuneFifteenOfNextYear,
        getLastDayOfJuneOfNextYear,
      ])(testSeason) as Array<Date>;

      const testDates: Array<Date> = flowAsync(
        chunk(2),
        map(([start, end]: [Date, Date]): Interval => {
          return {
            start,
            end,
          };
        }),
        map(flowAsync(eachDayOfInterval, sample)),
      )(testStartsAndEnds);

      const listOfExpectedBooleanValues: Array<Array<boolean>> = [
        [true, false, false, false, false],
        [false, false, true, false, false],
        [false, false, false, false, true],
      ];

      const testFunctionTuples: Array<
        [(season: number) => Date, (season: number) => Date]
      > = [
        [getThirdSundayOfAugust, getLastDayOfAugust],
        [getStartOfNextYear, getFirstMondayOfFebruaryOfNextYear],
        [getJuneFifteenOfNextYear, getLastDayOfJuneOfNextYear],
      ];

      const actualTransferWindowFunctions = createSeasonWindows(
        testFunctionTuples,
        testSeason,
      );

      const asserter = (
        testFunction: (date: Date) => boolean,
        testDate: Date,
        expectedValue: boolean,
      ) => {
        if (!testFunction(testDate)) {
        }
        expect(testFunction(testDate)).toBe(expectedValue);
      };
      flowAsync(
        map((expectedBooleanValues: Array<boolean>) =>
          zip(testDates, expectedBooleanValues),
        ),
        zip(actualTransferWindowFunctions),
        map(
          ([testFunction, testDateAndExpectedValues]: [
            (date: Date) => boolean,
            Array<[Date, boolean]>,
          ]) => {
            map(([testDate, expectedValue]: [Date, boolean]) => {
              asserter(testFunction, testDate, expectedValue);
            })(testDateAndExpectedValues);
          },
        ),
      )(listOfExpectedBooleanValues);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }).chain((testSeason: number) => {
      return fc.tuple(
        fc.date({
          min: getThirdSundayOfAugust(testSeason),
          max: getLastDayOfJuneOfNextYear(testSeason),
        }),
        fc.constant(testSeason),
        fc.constant(getLastDayOfJuneOfNextYear(testSeason)),
      );
    }),
  ])(
    "isTransferWindowOpen",
    async (testDateTestSeasonAndExpectedSeasonEndDate) => {
      const [testDate, testSeason, expectedSeasonEndDate]: [
        Date,
        number,
        Date,
      ] = testDateTestSeasonAndExpectedSeasonEndDate;
      const testFunctionTuples: Array<
        [(season: number) => Date, (season: number) => Date]
      > = [
        [getThirdSundayOfAugust, getLastDayOfAugust],
        [getStartOfNextYear, getFirstMondayOfFebruaryOfNextYear],
        [getJuneFifteenOfNextYear, getLastDayOfJuneOfNextYear],
      ];
      const testDefaultIsTransferWindowOpen =
        isTransferWindowOpen(testFunctionTuples);
      const actualResult: boolean = testDefaultIsTransferWindowOpen([
        testSeason,
        testDate,
      ]);
      expect(actualResult).toBeTypeOf("boolean");
      expect(defaultIsTransferWindowOpen([testSeason, testDate])).toBeTypeOf(
        "boolean",
      );
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }).chain((testSeason: number) => {
      return fc.tuple(
        fc.date({
          min: getThirdSundayOfAugust(testSeason),
          max: getLastDayOfJuneOfNextYear(testSeason),
        }),
        fc.constant(testSeason),
        fc.constant(getLastDayOfJuneOfNextYear(testSeason)),
      );
    }),
  ])(
    "getDaysLeftInCurrentSeason",
    async (testDateTestSeasonAndExpectedSeasonEndDate) => {
      const [testDate, testSeason, expectedSeasonEndDate]: [
        Date,
        number,
        Date,
      ] = testDateTestSeasonAndExpectedSeasonEndDate;
      const actualDaysLeft: number = getDaysLeftInCurrentSeason(
        testSeason,
        testDate,
      );
      const testDatePlusActualDaysLeft: Date =
        addDays(actualDaysLeft)(testDate);
      flowAsync(map(format("MM/dd/yyyy")), ([actual, expected]: [Date, Date]) =>
        expect(isDateEqual(actual, expected)).toBeTruthy(),
      )([testDatePlusActualDaysLeft, expectedSeasonEndDate]);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }).chain((testSeason: number) => {
      return fc.tuple(
        fc.date({
          min: getThirdSundayOfAugust(testSeason),
          max: getJuneFifteenOfNextYear(testSeason),
        }),
        fc.constant(getLastDayOfJuneOfNextYear(testSeason)),
      );
    }),
  ])(
    "getNextDomesticMatchDayDate",
    async (testDateAndExpectedSeasonEndDate) => {
      const [testDate, expectedSeasonEndDate]: [Date, Date] =
        testDateAndExpectedSeasonEndDate;
      const actualDate: Date = getNextDomesticMatchDayDate(testDate);
      const asserters = overEvery([
        isSunday,
        isWithinInterval({
          start: testDate,
          end: expectedSeasonEndDate,
        }),
      ]);
      expect(asserters(actualDate)).toBeTruthy();
    },
  );
});
