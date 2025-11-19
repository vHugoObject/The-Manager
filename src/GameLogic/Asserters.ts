import {
  chunk,
  forEach,
  pipe,
  curry,
  map,
  mean,
  startsWith,
  endsWith,
  property,
  shuffle,
  first,
} from "lodash/fp";
import { expect, assert } from "vitest";
import { DEFAULTSQUADSIZE, DEFAULTCLUBSPERDOMESTICLEAGUE } from "./Constants";
import {
  convertArrayOfArraysToArrayOfSets,
  convertArrayToSetThenGetSize,
} from "./Transformers";

export const assertIntegerPairsAreEqual = forEach(
  ([actual, expected]: [number, number]): void => {
    expect(actual).toEqual(expected);
  },
);
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

export const assertSetDoesNotHave = <T>(
  expectedSet: Set<T>,
  actualValue: any,
) => {
  expect(expectedSet.has(actualValue)).not.toBeTruthy();
};

export const assertSetHas = <T>(expectedSet: Set<T>, actualValue: any) => {
  expect(expectedSet.has(actualValue)).toBeTruthy();
};

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
  expect(received).toStrictEqual(expectedTestMatchArguments);
};

export const assertIsBasicClubMatchResultObject = curry(
  (received: any): void => {
    expect(received).toStrictEqual({
      Home: expect.any(Number),
      Wins: expect.any(Number),
      Losses: expect.any(Number),
      Draws: expect.any(Number),
      "Goals For": expect.any(Number),
      "Goals Against": expect.any(Number),
      Points: expect.any(Number),
    });
  },
);

export const assertIsLeagueTableRow = (received: any): void => {
  expect(received).toStrictEqual({
    "Club Name": expect.any(String),
    "Matches Played": expect.any(Number),
    Home: expect.any(Number),
    Wins: expect.any(Number),
    Losses: expect.any(Number),
    Draws: expect.any(Number),
    "Goals For": expect.any(Number),
    "Goals Against": expect.any(Number),
    "Goal Difference": expect.any(Number),
    Points: expect.any(Number),
  });
};

export const assertIsClubMatchResultObject = curry(
  (
    Home: number,
    Wins: number,
    Losses: number,
    Draws: number,
    Points: number,
    received: any,
  ): void => {
    expect(received).toStrictEqual({
      Home,
      Wins,
      Losses,
      Draws,
      "Goals For": expect.any(Number),
      "Goals Against": expect.any(Number),
      Points,
    });
  },
);

export const assertIsHomeClubMatchWinResultObject =
  assertIsClubMatchResultObject(1, 1, 0, 0, 3);
export const assertIsAwayClubMatchLossResultObject =
  assertIsClubMatchResultObject(0, 0, 1, 0, 0);

export const assertIsHomeClubMatchLossResultObject =
  assertIsClubMatchResultObject(1, 0, 1, 0, 0);
export const assertIsAwayClubMatchWinResultObject =
  assertIsClubMatchResultObject(0, 1, 0, 0, 3);

export const assertIsHomeClubMatchDrawResultObject =
  assertIsClubMatchResultObject(1, 0, 0, 1, 1);
export const assertIsAwayClubMatchDrawResultObject =
  assertIsClubMatchResultObject(0, 0, 0, 1, 1);

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
  expect(received).toStrictEqual(expectedPlayerMatchLog);
};

export const assertIsArrayOfPlayerMatchLogs = map(assertIsPlayerMatchLog);

export const assertIsClubMatchLog = (received: any): void => {
  const randomPlayerStats = pipe([Object.values, shuffle, first])(received);
  assertIsPlayerMatchLog(randomPlayerStats);
};

export const assertIsArrayOfClubMatchLogs = map(assertIsClubMatchLog);

export const assertIsMatchLog = (received: any): void => {
  expect(received).toStrictEqual({
    MatchID: expect.any(String),
    MatchLeagueNumber: expect.any(Number),
    MatchSeason: expect.any(Number),
    MatchWeek: expect.any(Number),
    MatchResult: expect.any(Array),
    ClubMatchLogs: expect.any(Object),
  });

  const [
    [actualHomeClubNumber, actualHomeResult],
    [actualAwayClubNumber, actualAwayResult],
  ] = received.MatchResult;
  assertNumbers([actualHomeClubNumber, actualAwayClubNumber]);
  assertIsBasicClubMatchResultObject(actualHomeResult);
  assertIsBasicClubMatchResultObject(actualAwayResult);
  pipe([
    property("ClubMatchLogs"),
    Object.values,
    assertIsArrayOfClubMatchLogs,
  ])(received);
};

export const assertIsDomesticLeagueObject = (received: any): void => {
  expect(received).toStrictEqual({
    LeagueNumber: expect.any(Number),
    LeagueCountry: expect.any(Number),
    LeagueLevel: expect.any(Number),
    LeagueClubs: expect.any(Array),
  });
  assert.lengthOf(received.LeagueClubs, DEFAULTCLUBSPERDOMESTICLEAGUE);
};

export const assertIsClubObject = (received: any): void => {
  expect(received).toStrictEqual({
    ClubNumber: expect.any(Number),
    ClubCountry: expect.any(Number),
    ClubDomesticLeagueLevel: expect.any(Number),
    ClubDomesticLeagueNumber: expect.any(Number),
    ClubScheduleNumber: expect.any(Number),
    ClubAttendance: expect.any(Number),
    ClubFaciltiesCosts: expect.any(Number),
    ClubSponsorPayment: expect.any(Number),
    ClubTicketPrice: expect.any(Number),
    ClubManagerPay: expect.any(Number),
    ClubScoutingCosts: expect.any(Number),
    ClubHealthCosts: expect.any(Number),
    ClubPlayerDevelopmentCosts: expect.any(Number),
    ClubPlayers: expect.any(Array),
  });
  assert.lengthOf(received.ClubPlayers, DEFAULTSQUADSIZE);
};

export const assertIsPlayerObject = (received: any): void => {
  expect(received).toStrictEqual({
    PlayerNumber: expect.any(Number),
    PlayerFirstName: expect.any(Number),
    PlayerLastName: expect.any(Number),
    PlayerCountry: expect.any(Number),
    PlayerAge: expect.any(Number),
    PlayerWage: expect.any(Number),
    PositionGroup: expect.any(Number),
    PlayerLeagueCountry: expect.any(Number),
    PlayerDomesticLeagueLevel: expect.any(Number),
    PlayerDomesticLeagueNumber: expect.any(Number),
    PlayerClubNumber: expect.any(Number),
  });
};

export const assertIsSaveOptions = (received: any): void => {
  expect(received).toStrictEqual({
    CountryIndex: expect.any(Number),
    DomesticLeagueIndex: expect.any(Number),
    ClubIndex: expect.any(Number),
    Countries: expect.any(Array),
    CurrentSeason: expect.any(Number),
    StartSeason: expect.any(Number),
  });
};
