import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  isSunday,
  isMonday,
  isAfter,
  eachDayOfInterval,
  format,
  isBefore,
  isSameMonth,
  isSameYear,
  isSameDay,
  getWeekOfMonth,
  isFirstDayOfMonth,
  subDays,
  startOfYear
} from "date-fns/fp";
import {
  sampleSize,
  flatMap,
  sample,
  overEvery,
  isEqual,
  zipAll,
} from "lodash/fp";
import { fakerToArb } from "../testingUtilities";
import { JUNE, AUGUST, JANUARY, FEBRUARY, SEPTEMBER, DECEMBER,
  TRANSFERWINDOWOPEN, TRANSFERWINDOWCLOSED } from "../Constants";
import { CalendarEntry, Calendar, Entity } from "../CommonTypes";
import { convertArrayOfArraysToArrayOfSets, convertToSet } from "../CommonUtilities";
import {
  createCalendar,
  totalDoubleRoundRobinGames,
  getThirdSundayOfAugust,
  getLastDayOfJuneOfNextYear,
  getLastDayOfAugust,
  getFirstMondayOfFebruaryOfNextYear,
  addOneYear,
} from "../Calendar";

describe("Calendar", async () => {
  test.prop([fakerToArb((faker) => faker.date.anytime().getFullYear())])(
    "getThirdSundayOfAugust",
    async (year) => {
      const actualDate: string = getThirdSundayOfAugust(year.toString());
      const asserter = overEvery([
        isSunday,
        (date: string) => isEqual(4, getWeekOfMonth(date)),
        isSameMonth(new Date(year, AUGUST, 1)),
        isSameYear(new Date(year, 1, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fakerToArb((faker) => faker.date.anytime().getFullYear())])(
    "getLastDayOfAugust",
    async (year) => {
      const actualDate: string = getLastDayOfAugust(year.toString());
      const asserter = overEvery([
        isSameMonth(new Date(year, AUGUST)),
        isSameYear(new Date(year, 1, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fakerToArb((faker) => faker.date.anytime().getFullYear())])(
    "getLastDayOfJuneOfNextYear",
    async (year) => {
      const actualDate: string = getLastDayOfJuneOfNextYear(year.toString());

      const asserter = overEvery([
        isSameMonth(new Date(year + 1, JUNE)),
        isSameYear(new Date(year + 1, 1, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fakerToArb((faker) => faker.date.anytime().getFullYear())])(
    "getFirstMondayOfFebruaryOfNextYear",
    async (year) => {
      const actualDate: string = getFirstMondayOfFebruaryOfNextYear(
        year.toString(),
      );
      const asserter = overEvery([
        isMonday,
        isSameMonth(new Date(year + 1, FEBRUARY)),
        isSameYear(new Date(year + 1, 1, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fakerToArb((faker) => faker.date.anytime().getFullYear())])(
    "getJuneFifteenOfNextYear",
    async (year) => {
      const actualDate: string = getFirstMondayOfFebruaryOfNextYear(
        year.toString(),
      );
      const asserter = overEvery([	
        isSameMonth(new Date(year + 1, JUNE)),	
        isSameYear(new Date(year + 1, 1, 1)),
	isSameDay(new Date(year+1, 15, JUNE),)
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fakerToArb((faker) => faker.date.anytime().getFullYear())])(
    "createBeginningOfSeasonTransferWindow",
    async (year) => {
      const actualFirstTransferWindow: Array<[string, CalendarEntry]> =
        await createBeginningOfSeasonTransferWindow(year.toString());
      const [actualDates, actualCalendarEntries] = zipAll(
        actualFirstTransferWindow,
      );

      const expectedFirstDay: Date = flowAsync(getThirdSundayOfAugust, subDays(1))(year)
      const expectedLastDay: Date = new Date(year, SEPTEMBER,1)
      const expectCalendarEntriesSet = new Set([TRANSFERWINDOWOPEN]);
      
      const actualCalendarEntriesSet: Set<CalendarEntry> = convertToSet(actualCalendarEntries)
      const dateAsserter = overEvery([
	isSameMonth(new Date(year, AUGUST)),
	isBefore(expectedLastDay),
	isAfter(expectedFirstDay)
      ])

      expect(actualCalendarEntriesSet).toStrictEqual(
        expectedCalendarEntriesSet,
      );
    },
  );

  test.prop([fakerToArb((faker) => faker.date.anytime().getFullYear())])(
    "createWinterTransferWindow",
    async (year) => {
      
      const actualSecondTransferWindow: Array<[string, CalendarEntry]> =
        await createWinterTransferWindow(year.toString());
      const [actualDates, actualCalendarEntries] = zipAll(
        actualFirstTransferWindow,
      );

      const expectedFirstDay: Date = startOfYear(new Date(year+1,1,1))
      const expectedLastDay: Date = getFirstMondayOfFebruaryOfNextYear(year)
      const expectCalendarEntriesSet = new Set([TRANSFERWINDOWOPEN]);

      const actualCalendarEntriesSet: Set<CalendarEntry> = convertToSet(actualCalendarEntries)
      const dateAsserter = overEvery([
	isAfter(new Date(year,DECEMBER,31)),
	isBefore(expectedLastDay)
      ])

      expect(actualCalendarEntriesSet).toStrictEqual(
        expectedCalendarEntriesSet,
      );
      
      
    },
  );

  test.prop([fakerToArb((faker) => faker.date.anytime().getFullYear())])(
    "createSeasonEndTransferWindow",
    async (year) => {

      const actualThirdTransferWindow: Array<[string, CalendarEntry]> =
        await createSeasonEndTransferWindow(year.toString());
      const [actualDates, actualCalendarEntries] = zipAll(
        actualFirstTransferWindow,
      );

      const expectedFirstDay: Date = getJuneFifteenOfNextYear(year)
      const expectedLastDay: Date = getLastDayOfJuneOfNextYear(year)
      const expectCalendarEntriesSet = new Set([TRANSFERWINDOWOPEN]);

      const actualCalendarEntriesSet: Set<CalendarEntry> = convertToSet(actualCalendarEntries)
      const dateAsserter = overEvery([
	isAfter(new Date(year,DECEMBER,31)),
	isBefore(expectedLastDay)
      ])

      expect(actualCalendarEntriesSet).toStrictEqual(
        expectedCalendarEntriesSet,
      );
      
      
    },
  );

  // test("totalDoubleRoundRobinGames", () => {
  //   const tests: Array<[number, number]> = [
  //     [4, 12],
  //     [6, 30],
  //     [18, 306],
  //     [20, 380],
  //   ];
  //   tests.forEach(([clubs, expectedValue]) => {
  //     const actualValue: number = totalDoubleRoundRobinGames(clubs);
  //     expect(actualValue).toBe(expectedValue);
  //   });
  // });

  // test("test getCurrentDateAsObject", async () => {
  //   const { Date: actualCurrentDate } = await getCurrentDateAsObject(testSave);
  //   expect(actualCurrentDate).toBe(testSave.CurrentDate.toDateString());
  // });
});
