import { test, fc } from "@fast-check/vitest";
import { describe, expect, assert } from "vitest";
import { BaseCountries } from "../Types";
import { pipe, multiply } from "lodash/fp";
import {
  fastCheckGenerateRandomBaseCountries,
  fastCheckRandomSeason,
  fastCheckRandomMatchWeekNumber,
  fastCheckGetTwoRandomBaseClubNumbersFromRandomLeague,
} from "../TestDataGenerators";
import { DEFAULTCLUBSPERDOMESTICLEAGUE } from "../Constants";
import { getDomesticLeaguesCountFromBaseCountries } from "../Getters";
import {
  createMatchAddress,
  matchesPerRoundOfRoundRobin,
  createMatchPairingsForWeek,
} from "../Transformers";

describe("MatchTranformers test suite", () => {
  test.prop([fc.gen()])("createMatchAddress", (fcGen) => {
    const testBaseCountries: BaseCountries =
      fastCheckGenerateRandomBaseCountries(fcGen);
    const testSeason: number = fastCheckRandomSeason(fcGen);
    const testMatchWeek: number = fastCheckRandomMatchWeekNumber(fcGen);
    const [testClubIDs, testCountryAndDomesticLeagueIndices]: [
      [number, number],
      [number, number],
    ] = fastCheckGetTwoRandomBaseClubNumbersFromRandomLeague(
      fcGen,
      testBaseCountries,
    ) as [[number, number], [number, number]];
    const actualMatchAddress = createMatchAddress(
      testCountryAndDomesticLeagueIndices,
      [testSeason, testMatchWeek],
      testClubIDs,
    );
    const [testCountryIndex, testDomesticLeagueIndex] =
      testCountryAndDomesticLeagueIndices;

    assert.lengthOf(actualMatchAddress, 5);
    expect(actualMatchAddress).toContain(testCountryIndex);
    expect(actualMatchAddress).toContain(testDomesticLeagueIndex);
    expect(actualMatchAddress).toContain(testSeason);
  });

  test.prop([fc.gen()])("createMatchPairingsForWeek", (fcGen) => {
    const testBaseCountries: BaseCountries =
      fastCheckGenerateRandomBaseCountries(fcGen);
    const expectedDomesticLeaguesCount: number =
      getDomesticLeaguesCountFromBaseCountries(testBaseCountries);
    const expectedMatchesCount: number = pipe([
      matchesPerRoundOfRoundRobin,
      multiply(expectedDomesticLeaguesCount),
    ])(DEFAULTCLUBSPERDOMESTICLEAGUE);
    const testMatchWeekNumber: number = fastCheckRandomMatchWeekNumber(fcGen);
    const actualMatchPairings: Array<[number, number]> =
      createMatchPairingsForWeek(testMatchWeekNumber, testBaseCountries);
    const actualMatchPairingsSet = new Set(actualMatchPairings);
    expect(actualMatchPairingsSet.size).toEqual(expectedMatchesCount);
  });
});
