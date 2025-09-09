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
  countryNumberRepeaterForClubs,
  domesticLeagueNumberRepeaterForClubs,
  domesticLeagueLevelRepeaterForClubs,
  convertArrayChunksIntoSets,
  clubNumberRepeaterForPlayers,
  clubScheduleNumberRepeater,
} from "../Transformers";

describe("ClubNumberRepeaters test suite", () => {
  test.prop([fc.gen()])("countryNumberRepeaterForClubss", (fcGen) => {
    const [testClubsCount, testCountriesCount] =
      fastCheckGenerateTestClubsCount(fcGen);

    const expectedNumberCountsSets: Array<Set<number>> = unfold(
      (countryIndex: number) => new Set([countryIndex]),
      testCountriesCount,
    );

    const actualNumbers: Array<number> = unfold(
      countryNumberRepeaterForClubs,
      testClubsCount,
    );
    const actualNumberCountsSets: Array<Array<number>> =
      convertArrayChunksIntoSets(DEFAULTCLUBSPERCOUNTRY, actualNumbers);

    expect(actualNumberCountsSets).toStrictEqual(expectedNumberCountsSets);
  });

  test.prop([fc.gen()])("domesticLeagueNumberRepeaterForClubss", (fcGen) => {
    const [, testDomesticLeaguesCount, testClubsCount] =
      fastCheckGenerateTestCountriesLeaguesClubsPlayersCount(fcGen);
    const expectedNumberCountsSets: Array<Set<number>> = unfold(
      (leagueIndex: number) => new Set([leagueIndex]),
      testDomesticLeaguesCount,
    );

    const actualNumbers: Array<number> = unfold(
      domesticLeagueNumberRepeaterForClubs,
      testClubsCount,
    );
    const actualNumberCountsSets: Array<Array<number>> =
      convertArrayChunksIntoSets(DEFAULTCLUBSPERDOMESTICLEAGUE, actualNumbers);
    expect(actualNumberCountsSets).toStrictEqual(expectedNumberCountsSets);
  });

  test.prop([fc.gen()])("domesticLeagueLevelRepeaterForClubs", (fcGen) => {
    const [testClubsCount, testCountriesCount] =
      fastCheckGenerateTestClubsCount(fcGen);
    const testDomesticLeagueLevelsSets: Array<Set<number>> = unfold(
      (domesticLeagueLevelIndex: number) => new Set([domesticLeagueLevelIndex]),
      DEFAULTDOMESTICLEAGUESPERCOUNTRY,
    );
    const expectedNumberCountsSets: Array<Set<number>> = pipe([
      unfold((_: number) => testDomesticLeagueLevelsSets),
      flatten,
    ])(testCountriesCount);

    const actualNumbers: Array<number> = unfold(
      domesticLeagueLevelRepeaterForClubs,
      testClubsCount,
    );
    const actualNumberCountsSets: Array<Array<number>> =
      convertArrayChunksIntoSets(DEFAULTCLUBSPERDOMESTICLEAGUE, actualNumbers);
    expect(actualNumberCountsSets).toStrictEqual(expectedNumberCountsSets);
  });

  test.prop([fc.gen()])("clubNumberRepeaterForPlayers", (fcGen) => {
    const [, , expectedClubsCount, testPlayersCount] =
      fastCheckGenerateTestCountriesLeaguesClubsPlayersCount(fcGen);

    const expectedNumberCountsSets: Array<Set<number>> = unfold(
      (clubIndex: number) => new Set([clubIndex]),
      expectedClubsCount,
    );

    const actualNumbers: Array<number> = unfold(
      clubNumberRepeaterForPlayers,
      testPlayersCount,
    );
    const actualNumberCountsSets: Array<Array<number>> =
      convertArrayChunksIntoSets(DEFAULTSQUADSIZE, actualNumbers);
    expect(actualNumberCountsSets).toStrictEqual(expectedNumberCountsSets);
  });

  test.prop([fc.gen()])("clubScheduleNumberRepeater", (fcGen) => {
    const [, testDomesticLeaguesCount, testClubsCount] =
      fastCheckGenerateTestCountriesLeaguesClubsPlayersCount(fcGen);

    const testClubScheduleNumbers: Array<number> = pipe([
      unfold((scheduleNumber: number) => scheduleNumber),
      convertToSet,
    ])(DEFAULTCLUBSPERDOMESTICLEAGUE);
    const expectedNumberCountsSets: Array<Set<number>> = pipe([
      unfold((_: number) => testClubScheduleNumbers),
      flatten,
    ])(testDomesticLeaguesCount);

    const actualNumbers: Array<number> = unfold(
      clubScheduleNumberRepeater,
      testClubsCount,
    );
    const actualNumberCountsSets: Array<Array<number>> =
      convertArrayChunksIntoSets(DEFAULTCLUBSPERDOMESTICLEAGUE, actualNumbers);
    expect(actualNumberCountsSets).toStrictEqual(expectedNumberCountsSets);
  });
});
