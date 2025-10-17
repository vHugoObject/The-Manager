import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  over,
  map,
  size,
  sum,
  pipe,
  flatten,
  range,
  overEvery,
  isEqual,
  sample,
  chunk,
  zip,
  divide,
} from "lodash/fp";
import {
  addDays,
  isWithinInterval,
  isSunday,
  isEqual as isDateEqual,
  getWeekOfMonth,
  isSameMonth,
  isSameYear,
  isMonday,
  isSameDay,
  eachDayOfInterval,
  format,
} from "date-fns/fp";
import { AUGUST, JANUARY, FEBRUARY, JUNE } from "../Constants";
import {
  fastCheckRandomRoundRobinClubsCount,
  fastCheckRandomIntegerBetweenOneAnd,
} from "../TestDataGenerators";
import {
  roundRobinScheduler,
  totalRoundRobinMatches,
  totalRoundRobinRounds,
  matchesPerRoundOfRoundRobin,
  firstWeekOfRoundRobinWithEvenNumberClubs,
  everyWeekAfterFirstWeekofRoundRobin,
  doubleRoundRobinScheduler,
  totalDoubleRoundRobinRounds,
  totalDoubleRoundRobinMatches,
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
  addOneDay,
  subOneDay,
  defaultIsTransferWindowOpen,
  convertToSet,
  createScheduleForRoundOfDoubleRobinRound,
} from "../Transformers";

describe("DateTransformers test suite", () => {
  test.prop([fc.integer({ min: 2000, max: 2100 })])(
    "convertIntegerYearToDate",
    (testYear) => {
      const actualDate: Date = convertIntegerYearToDate(testYear);
      expect(actualDate.getFullYear()).toEqual(testYear);
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })])(
    "getThirdSundayOfAugust",
    (testYear) => {
      // need a constant AUGUST and JANPLUSAUGUST
      const actualDate: Date = getThirdSundayOfAugust(testYear);
      const asserter = overEvery([
        isSunday,
        pipe([getWeekOfMonth, isEqual(4)]),
        isSameMonth(new Date(testYear, AUGUST, 1)),
        isSameYear(new Date(testYear, 0, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })])(
    "getLastDayOfAugust",
    (testYear) => {
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
    (testYear) => {
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
    (testYear) => {
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
    (testYear) => {
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
    (testYear) => {
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
    (testSeason) => {
      const testStartsAndEnds: Array<Date> = over([
        getThirdSundayOfAugust,
        getLastDayOfAugust,
        pipe([getLastDayOfAugust, addOneDay]),
        pipe([getStartOfNextYear, subOneDay]),
        getStartOfNextYear,
        getFirstMondayOfFebruaryOfNextYear,
        pipe([getFirstMondayOfFebruaryOfNextYear, addOneDay]),
        pipe([getJuneFifteenOfNextYear, subOneDay]),
        getJuneFifteenOfNextYear,
        getLastDayOfJuneOfNextYear,
      ])(testSeason) as Array<Date>;

      const testDates: Array<Date> = pipe([
        chunk(2),
        map(([start, end]: [Date, Date]) => {
          return {
            start,
            end,
          };
        }),
        map(pipe([eachDayOfInterval, sample])),
      ])(testStartsAndEnds);

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
      pipe([
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
      ])(listOfExpectedBooleanValues);
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
  ])("isTransferWindowOpen", (testDateTestSeasonAndExpectedSeasonEndDate) => {
    const [testDate, testSeason, expectedSeasonEndDate]: [Date, number, Date] =
      testDateTestSeasonAndExpectedSeasonEndDate;
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
  });

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
    (testDateTestSeasonAndExpectedSeasonEndDate) => {
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
      pipe([
        map(format("MM/dd/yyyy")),
        ([actual, expected]: [Date, Date]) =>
          expect(isDateEqual(actual, expected)).toBeTruthy(),
      ])([testDatePlusActualDaysLeft, expectedSeasonEndDate]);
    },
  );

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }).chain((testSeason: number) => {
        return fc.tuple(
          fc.date({
            min: getThirdSundayOfAugust(testSeason),
            max: getJuneFifteenOfNextYear(testSeason),
          }),
          fc.constant(getLastDayOfJuneOfNextYear(testSeason)),
        );
      }),
    ],
    { numRuns: 0 },
  )("getNextDomesticMatchDayDate", (testDateAndExpectedSeasonEndDate) => {
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
  });

  test.prop([fc.gen()])("matchesPerRoundOfRoundRobin", (fcGen) => {
    const testClubsCount: number = fastCheckRandomRoundRobinClubsCount(fcGen);
    const actualMatchesPerRound: number =
      matchesPerRoundOfRoundRobin(testClubsCount);
    expect(actualMatchesPerRound).toEqual(testClubsCount / 2);
  });

  test.prop([fc.gen()])("firstWeekOfRoundRobinWithEvenNumberClubs", (fcGen) => {
    const testClubsCount: number = fastCheckRandomRoundRobinClubsCount(fcGen);
    const [actualClubsCount, actualMatches]: [number, Array<[number, number]>] =
      firstWeekOfRoundRobinWithEvenNumberClubs(testClubsCount);
    expect(actualClubsCount).toEqual(testClubsCount);
    const actualSum: number = pipe([flatten, sum])(actualMatches);
    const expectedSum: number = pipe([range(0), sum])(testClubsCount);
    expect(actualSum).toEqual(expectedSum);
  });

  test.prop([fc.gen()])("everyWeekAfterFirstWeekofRoundRobin", (fcGen) => {
    const testClubsCount: number = fastCheckRandomRoundRobinClubsCount(fcGen);
    const testClubsCountAndFirstRound: [number, Array<[number, number]>] =
      firstWeekOfRoundRobinWithEvenNumberClubs(testClubsCount);
    const actualFullSchedule: Array<Array<[number, number]>> =
      everyWeekAfterFirstWeekofRoundRobin(testClubsCountAndFirstRound);

    const actualRoundsSet = new Set(actualFullSchedule);
    const expectedRounds = totalRoundRobinRounds(testClubsCount);
    expect(actualRoundsSet.size).toEqual(expectedRounds);

    const actualMatchupsSet = pipe([flatten, convertToSet])(actualFullSchedule);
    const expectedTotalMatches = totalRoundRobinMatches(testClubsCount);
    expect(actualMatchupsSet.size).toEqual(expectedTotalMatches);

    map((actualMatches) => {
      const actualSum: number = pipe([flatten, sum])(actualMatches);
      const expectedSum: number = pipe([range(0), sum])(testClubsCount);
      expect(actualSum).toEqual(expectedSum);
    })(actualFullSchedule);
  });

  test.prop([fc.gen()])("roundRobinScheduler", (fcGen) => {
    const testClubsCount: number = fastCheckRandomRoundRobinClubsCount(fcGen);
    const actualSchedule: Array<Array<[number, number]>> =
      roundRobinScheduler(testClubsCount);
    const expectedRounds: number = totalRoundRobinRounds(testClubsCount);
    expect(actualSchedule.length).toEqual(expectedRounds);
    const expectedMatchesCount: number = totalRoundRobinMatches(testClubsCount);
    const actualMatchesCount: number = pipe([flatten, size])(actualSchedule);
    expect(actualMatchesCount).toEqual(expectedMatchesCount);
  });

  test.prop([fc.gen()])("doubleRoundRobinScheduler", (fcGen) => {
    const testClubsCount: number = fastCheckRandomRoundRobinClubsCount(fcGen);
    const actualSchedule: Array<Array<[number, number]>> =
      doubleRoundRobinScheduler(testClubsCount);
    const expectedRounds: number = totalDoubleRoundRobinRounds(testClubsCount);
    expect(actualSchedule.length).toEqual(expectedRounds);

    const expectedMatchesCount: number =
      totalDoubleRoundRobinMatches(testClubsCount);
    const actualMatchesSet: Set<[number, number]> = pipe([
      flatten,
      convertToSet,
    ])(actualSchedule);
    expect(actualMatchesSet.size).toEqual(expectedMatchesCount);
  });

  test.prop([fc.gen()])("createScheduleForRoundOfDoubleRobinRound", (fcGen) => {
    const testClubsCount: number = fastCheckRandomRoundRobinClubsCount(fcGen);
    const expectedRounds: number = totalDoubleRoundRobinRounds(testClubsCount);
    const expectedTotalMatchesCount: number =
      totalDoubleRoundRobinMatches(testClubsCount);
    const expectedMatchesCount: number = divide(
      expectedTotalMatchesCount,
      expectedRounds,
    );
    const testRound: number = fastCheckRandomIntegerBetweenOneAnd(
      fcGen,
      expectedRounds,
    );
    const actualSchedule = createScheduleForRoundOfDoubleRobinRound(
      testClubsCount,
      testRound,
    );

    expect(actualSchedule.length).toEqual(expectedMatchesCount);
  });
});
