import {
  chunk,
  forEach,
  pipe,
  curry,
  map,
  mean,
  startsWith,
  endsWith,
} from "lodash/fp";
import { expect, assert } from "vitest";
import { DEFAULTSQUADSIZE } from "./Constants";
import {
  convertArrayOfArraysToArrayOfSets,
  convertArrayToSetThenGetSize,
} from "./Transformers";

export const pairIntegersAndAssertEqual = pipe([
  chunk(2),
  forEach(([actual, expected]: [number, number]) => {
    expect(actual).toEqual(expected);
  }),
]);

export const pairStringsAndAssertEqual = pipe([
  chunk(2),
  forEach(([actual, expected]: [number, number]) => {
    expect(actual).toBe(expected);
  }),
]);

export const pairSetsAndAssertStrictEqual = pipe([
  chunk(2),
  forEach(([actual, expected]: [Set<any>, Set<any>]) => {
    expect(actual).toStrictEqual(expected);
  }),
]);

export const convertArraysToSetsAndAssertStrictEqual = pipe([
  convertArrayOfArraysToArrayOfSets,
  pairSetsAndAssertStrictEqual,
]);

export const assertSubset = <T>([expectedSubset, expectedSuperset]: [
  Set<T>,
  Set<T>,
]) => {
  expect(expectedSubset.isSubsetOf(expectedSuperset)).toBeTruthy();
};

export const convertArraysToSetsAndAssertSubset = pipe([
  convertArrayOfArraysToArrayOfSets,
  assertSubset,
]);

export const assertIntegerInRangeInclusive = curry(
  ([min, max]: [number, number], integer: number) => {
    expect(integer).toBeGreaterThanOrEqual(min);
    expect(integer).toBeLessThanOrEqual(max);
  },
);

export const assertArrayOfIntegersInRangeInclusive = curry(
  (range: [number, number], integers: Array<number>) => {
    map(assertIntegerInRangeInclusive(range))(integers);
  },
);

export const assertIntegerInRangeExclusive = curry(
  ([min, max]: [number, number], integer: number) => {
    expect(integer).toBeGreaterThanOrEqual(min);
    expect(integer).toBeLessThan(max);
  },
);

export const assertIntegerInRangeDoubleExclusive = curry(
  ([min, max]: [number, number], integer: number) => {
    expect(integer).toBeGreaterThan(min);
    expect(integer).toBeLessThan(max);
  },
);

export const assertBetweenZeroAndOneHundred =
  assertIntegerInRangeDoubleExclusive([0, 100]);

export const assertArrayOfIntegersInRangeExclusive = curry(
  (range: [number, number], integers: Array<number>) => {
    map(assertIntegerInRangeExclusive(range))(integers);
  },
);

export const assertMeanInRangeExclusive = curry(
  (range: [number, number], integers: Array<number>): void => {
    pipe([mean, assertIntegerInRangeExclusive(range)])(integers);
  },
);

export const parseIntAndAssert = curry(
  (asserter: Function, range: [number, number], integerAsString: string) => {
    return pipe([parseInt, asserter(range)])(integerAsString);
  },
);

export const parseIntAndAssertIntegerInRangeInclusive = parseIntAndAssert(
  assertIntegerInRangeInclusive,
);
export const parseIntAndAssertIntegerInRangeExclusive = parseIntAndAssert(
  assertIntegerInRangeExclusive,
);

export const assertAllArrayValuesAreUnique = <T>(array: Array<T>) => {
  expect(array.length).toEqual(convertArrayToSetThenGetSize(array));
};

export const assertNumbers = map(assert.isNumber);
export const assertStrings = map(assert.isString);

export const assertStartsWith = (substring: string, string: string): void => {
  expect(startsWith(substring, string)).toBeTruthy();
};
export const assertEndsWith = (substring: string, string: string): void => {
  expect(endsWith(substring, string)).toBeTruthy();
};

const expectedTestMatchArguments = {
  HomeClubNumber: expect.any(String),
  AwayClubNumber: expect.any(String),
  HomePlayers: expect.any(Array),
  AwayPlayers: expect.any(Array),
  DomesticLeagueIndex: expect.any(Number),
  CountryIndex: expect.any(Number),
  Season: expect.any(Number),
};

export const assertIsMatchArgumentsObject = (received: any): void => {
  expect(received).toMatchObject(expectedTestMatchArguments);
};

export const assertIsBasicClubMatchResultObject = curry(
  (received: any): void => {
    expect(received).toMatchObject({
      Home: expect.any(Boolean),
      Wins: expect.any(Number),
      Losses: expect.any(Number),
      Draws: expect.any(Number),
      GoalsFor: expect.any(Number),
      GoalsAgainst: expect.any(Number),
    });
  },
);

export const assertIsClubMatchResultObject = curry(
  (
    Home: boolean,
    Wins: number,
    Losses: number,
    Draws: number,
    received: any,
  ): void => {
    expect(received).toMatchObject({
      Home,
      Wins,
      Losses,
      Draws,
      GoalsFor: expect.any(Number),
      GoalsAgainst: expect.any(Number),
    });
  },
);

export const assertIsHomeClubMatchWinResultObject =
  assertIsClubMatchResultObject(true, 1, 0, 0);
export const assertIsAwayClubMatchWinResultObject =
  assertIsClubMatchResultObject(false, 1, 0, 0);

export const assertIsHomeClubMatchLossResultObject =
  assertIsClubMatchResultObject(true, 0, 0, 1);
export const assertIsAwayClubMatchLossResultObject =
  assertIsClubMatchResultObject(false, 0, 0, 1);

export const assertIsHomeClubMatchDrawResultObject =
  assertIsClubMatchResultObject(true, 0, 1, 0);
export const assertIsAwayClubMatchDrawResultObject =
  assertIsClubMatchResultObject(false, 0, 1, 0);

const expectedPlayerMatchLog = {
  Starts: expect.any(Number),
  Wins: expect.any(Number),
  Losses: expect.any(Number),
  Draws: expect.any(Number),
  Goals: expect.any(Number),
  Assists: expect.any(Number),
  Minutes: expect.any(Number),
  Tackles: expect.any(Number),
};

export const assertIsPlayerMatchLog = (received: any): void => {
  expect(received).toMatchObject(expectedPlayerMatchLog);
};

export const assertIsArrayOfPlayerMatchLogs = map(assertIsPlayerMatchLog);

export const assertIsClubMatchLog = (received: any): void => {
  expect(received).toMatchObject({
    MatchResult: expect.any(Object),
    PlayerStatistics: expect.any(Object),
  });

  assertIsBasicClubMatchResultObject(received.MatchResult);
};

export const assertIsArrayOfClubMatchLogs = map(assertIsClubMatchLog);

export const assertIsClubObject = (received: any): void => {
  expect(received).toMatchObject({
    ClubNumber: expect.any(Number),
    Country: expect.any(Number),
    DomesticLeagueLevel: expect.any(Number),
    DomesticLeagueNumber: expect.any(Number),
    ScheduleNumber: expect.any(Number),
    Attendance: expect.any(Number),
    FaciltiesCosts: expect.any(Number),
    SponsorPayment: expect.any(Number),
    TicketPrice: expect.any(Number),
    ManagerPay: expect.any(Number),
    ScoutingCosts: expect.any(Number),
    HealthCosts: expect.any(Number),
    PlayerDevelopmentCosts: expect.any(Number),
  });
  assert.lengthOf(received.Players, DEFAULTSQUADSIZE);
};

export const assertIsPlayerObject = (received: any): void => {
  expect(received).toMatchObject({
    PlayerNumber: expect.any(Number),
    FirstName: expect.any(Number),
    LastName: expect.any(Number),
    PlayerCountry: expect.any(Number),
    Age: expect.any(Number),
    Wage: expect.any(Number),
    PositionGroup: expect.any(Number),
    PlayerLeagueCountry: expect.any(Number),
    DomesticLeagueLevel: expect.any(Number),
    DomesticLeagueNumber: expect.any(Number),
    ClubNumber: expect.any(Number),
  });
};

export const assertIsSaveOptions = (received: any): void => {
  expect(received).toMatchObject({
    SaveName: expect.any(String),
    CountryIndex: expect.any(Number),
    DomesticLeagueIndex: expect.any(Number),
    ClubIndex: expect.any(Number),
    Season: expect.any(Number),
    Countries: expect.any(Array),
  });
};
