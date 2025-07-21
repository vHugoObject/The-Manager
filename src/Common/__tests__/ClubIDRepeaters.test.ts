import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { pipe, flatten } from "lodash/fp";
import {
  DEFAULTCLUBSPERDOMESTICLEAGUE,
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
  DEFAULTCLUBSPERCOUNTRY,
  DEFAULTSQUADSIZE,
} from "../Constants";
import {
  fastCheckGenerateTestClubsCount,
  fastCheckGenerateTestCountriesLeaguesClubsPlayersCount,
} from "../TestDataGenerators";
import {
  unfold,
  convertToSet,
  countryIDRepeaterForClubIDs,
  domesticLeagueIDRepeaterForClubIDs,
  domesticLeagueLevelRepeaterForClubIDs,
  convertArrayChunksIntoSets,
  clubIDRepeaterForPlayerIDs,
  clubScheduleIDRepeater,
} from "../Transformers";

describe("ClubIDRepeaters test suite", () => {
  test.prop([fc.gen()])("countryIDRepeaterForClubIDss", (fcGen) => {
    const [testClubsCount, testCountriesCount] =
      fastCheckGenerateTestClubsCount(fcGen);

    const expectedIDCountsSets: Array<Set<number>> = unfold(
      (countryIndex: number) => new Set([countryIndex]),
      testCountriesCount,
    );

    const actualIDs: Array<number> = unfold(
      countryIDRepeaterForClubIDs,
      testClubsCount,
    );
    const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(
      DEFAULTCLUBSPERCOUNTRY,
      actualIDs,
    );

    expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets);
  });

  test.prop([fc.gen()])("domesticLeagueIDRepeaterForClubIDss", (fcGen) => {
    const [, testDomesticLeaguesCount, testClubsCount] =
      fastCheckGenerateTestCountriesLeaguesClubsPlayersCount(fcGen);
    const expectedIDCountsSets: Array<Set<number>> = unfold(
      (leagueIndex: number) => new Set([leagueIndex]),
      testDomesticLeaguesCount,
    );

    const actualIDs: Array<number> = unfold(
      domesticLeagueIDRepeaterForClubIDs,
      testClubsCount,
    );
    const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(
      DEFAULTCLUBSPERDOMESTICLEAGUE,
      actualIDs,
    );
    expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets);
  });

  test.prop([fc.gen()])("domesticLeagueLevelRepeaterForClubIDs", (fcGen) => {
    const [testClubsCount, testCountriesCount] =
      fastCheckGenerateTestClubsCount(fcGen);
    const testDomesticLeagueLevelsSets: Array<Set<number>> = unfold(
      (domesticLeagueLevelIndex: number) => new Set([domesticLeagueLevelIndex]),
      DEFAULTDOMESTICLEAGUESPERCOUNTRY,
    );
    const expectedIDCountsSets: Array<Set<number>> = pipe([
      unfold((_: number) => testDomesticLeagueLevelsSets),
      flatten,
    ])(testCountriesCount);

    const actualIDs: Array<number> = unfold(
      domesticLeagueLevelRepeaterForClubIDs,
      testClubsCount,
    );
    const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(
      DEFAULTCLUBSPERDOMESTICLEAGUE,
      actualIDs,
    );
    expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets);
  });

  test.prop([fc.gen()])("clubIDRepeaterForPlayerIDs", (fcGen) => {
    const [, , expectedClubsCount, testPlayersCount] =
      fastCheckGenerateTestCountriesLeaguesClubsPlayersCount(fcGen);

    const expectedIDCountsSets: Array<Set<number>> = unfold(
      (clubIndex: number) => new Set([clubIndex]),
      expectedClubsCount,
    );

    const actualIDs: Array<number> = unfold(
      clubIDRepeaterForPlayerIDs,
      testPlayersCount,
    );
    const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(
      DEFAULTSQUADSIZE,
      actualIDs,
    );
    expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets);
  });

  test.prop([fc.gen()])("clubScheduleIDRepeater", (fcGen) => {
    const [, testDomesticLeaguesCount, testClubsCount] =
      fastCheckGenerateTestCountriesLeaguesClubsPlayersCount(fcGen);

    const testClubScheduleIDs: Array<number> = pipe([
      unfold((scheduleID: number) => scheduleID),
      convertToSet,
    ])(DEFAULTCLUBSPERDOMESTICLEAGUE);
    const expectedIDCountsSets: Array<Set<number>> = pipe([
      unfold((_: number) => testClubScheduleIDs),
      flatten,
    ])(testDomesticLeaguesCount);

    const actualIDs: Array<number> = unfold(
      clubScheduleIDRepeater,
      testClubsCount,
    );
    const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(
      DEFAULTCLUBSPERDOMESTICLEAGUE,
      actualIDs,
    );
    expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets);
  });
});
