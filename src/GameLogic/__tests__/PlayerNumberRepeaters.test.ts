import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { mapIndexed } from "futil-js";
import { pipe, flatten, map, sum, head } from "lodash/fp";
import {
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
  DEFAULTPLAYERSPERCOUNTRY,
  DEFAULTPLAYERSPERDOMESTICLEAGUE,
  DEFAULTPLAYERSPERPOSITIONGROUP,
} from "../Constants";
import {
  fastCheckGenerateTestPlayersCount,
  fastCheckGenerateTestCountriesLeaguesClubsPlayersCount,
  fastCheckGetRandomArrayChunk,
  fastCheckGenerateAllPlayerNumbersOfRandomClub,
} from "../TestDataGenerators";
import { convertArraysToSetsAndAssertStrictEqual } from "../Asserters";
import {
  countryNumberRepeaterForPlayers,
  domesticLeagueNumberRepeaterForPlayers,
  domesticLeagueLevelRepeaterForPlayers,
  positionGroupRankRepeaterForPlayerNumber,
  unfold,
  addOne,
  convertArrayChunksIntoSets,
  clubNumberRepeaterForPlayers,
  positionGroupNumberRepeaterForPlayers,
  squadNumberRepeaterForPlayerNumber,
  convertArrayToSetThenGetSize,
} from "../Transformers";

describe("PlayerNumberRepeaters test suite", () => {
  test.prop([fc.gen()])("countryNumberRepeaterForPlayers", (fcGen) => {
    const [testPlayersCount, testCountriesCount] =
      fastCheckGenerateTestPlayersCount(fcGen);
    const expectedNumberCountsSets: Array<Set<number>> = unfold(
      (countryIndex: number) => new Set([countryIndex]),
      testCountriesCount,
    );

    const actualNumbers: Array<number> = unfold(
      countryNumberRepeaterForPlayers,
      testPlayersCount,
    );
    const actualNumberCountsSets: Array<Array<number>> =
      convertArrayChunksIntoSets(DEFAULTPLAYERSPERCOUNTRY, actualNumbers);
    expect(actualNumberCountsSets).toStrictEqual(expectedNumberCountsSets);
  });

  test.prop([fc.gen()])("domesticLeagueNumberRepeaterForPlayers", (fcGen) => {
    const [, testDomesticLeaguesCount, , testPlayersCount] =
      fastCheckGenerateTestCountriesLeaguesClubsPlayersCount(fcGen);
    const expectedNumberCountsSets: Array<Set<number>> = unfold(
      (leagueIndex: number) => new Set([leagueIndex]),
      testDomesticLeaguesCount,
    );

    const actualNumbers: Array<number> = unfold(
      domesticLeagueNumberRepeaterForPlayers,
      testPlayersCount,
    );
    const actualNumberCountsSets: Array<Array<number>> =
      convertArrayChunksIntoSets(
        DEFAULTPLAYERSPERDOMESTICLEAGUE,
        actualNumbers,
      );
    expect(actualNumberCountsSets).toStrictEqual(expectedNumberCountsSets);
  });

  test.prop([fc.gen()])("domesticLeagueLevelRepeaterForPlayers", (fcGen) => {
    const [testPlayersCount, testCountriesCount] =
      fastCheckGenerateTestPlayersCount(fcGen);
    const testDomesticLeagueLevelsSets: Array<Set<number>> = unfold(
      (domesticLeagueLevelIndex: number) => new Set([domesticLeagueLevelIndex]),
      DEFAULTDOMESTICLEAGUESPERCOUNTRY,
    );
    const expectedNumberCountsSets: Array<Set<number>> = pipe([
      unfold((_: number) => testDomesticLeagueLevelsSets),
      flatten,
    ])(testCountriesCount);

    const actualNumbers: Array<number> = unfold(
      domesticLeagueLevelRepeaterForPlayers,
      testPlayersCount,
    );
    const actualNumberCountsSets: Array<Array<number>> =
      convertArrayChunksIntoSets(
        DEFAULTPLAYERSPERDOMESTICLEAGUE,
        actualNumbers,
      );
    expect(actualNumberCountsSets).toStrictEqual(expectedNumberCountsSets);
  });

  test.prop([fc.gen()])("clubNumberRepeaterForPlayers", (fcGen) => {
    const actualClubNumbers: Array<number> =
      fastCheckGenerateAllPlayerNumbersOfRandomClub(
        clubNumberRepeaterForPlayers,
        fcGen,
      );

    const actualClubNumbersCount: number =
      convertArrayToSetThenGetSize(actualClubNumbers);
    expect(actualClubNumbersCount).toEqual(1);
  });

  test.prop([fc.gen()])("positionGroupNumberRepeaterForPlayers", (fcGen) => {
    const [testPlayersCount]: [number, number] =
      fastCheckGenerateTestPlayersCount(fcGen);

    const actualPositionGroupNumbers: Array<number> = unfold(
      positionGroupNumberRepeaterForPlayers,
      testPlayersCount,
    );

    const unfolder = (count: number, index: number): Array<number> => {
      return unfold((_: number) => index, count);
    };

    const expectedRandomChunk: Array<number> = pipe([
      mapIndexed(unfolder),
      flatten,
    ])(DEFAULTPLAYERSPERPOSITIONGROUP);
    const [actualRandomChunk]: Array<number> = fastCheckGetRandomArrayChunk(
      fcGen,
      [actualPositionGroupNumbers, 25],
    );

    convertArraysToSetsAndAssertStrictEqual([
      actualRandomChunk,
      expectedRandomChunk,
    ]);
  });

  test.prop([fc.gen()])("positionGroupRankRepeaterForPlayerNumber", (fcGen) => {
    const [testPlayersCount]: [number, number] =
      fastCheckGenerateTestPlayersCount(fcGen);

    const actualPositionGroupNumbers: Array<number> = unfold(
      positionGroupRankRepeaterForPlayerNumber,
      testPlayersCount,
    );

    const unfolder = (count: number): Array<number> => {
      return unfold((index: number) => index, count);
    };

    const expectedRandomChunk: Array<number> = pipe([map(unfolder), flatten])(
      DEFAULTPLAYERSPERPOSITIONGROUP,
    );
    const [actualRandomChunk]: Array<number> = fastCheckGetRandomArrayChunk(
      fcGen,
      [actualPositionGroupNumbers, 25],
    );

    convertArraysToSetsAndAssertStrictEqual([
      actualRandomChunk,
      expectedRandomChunk,
    ]);
  });

  test.prop([fc.gen()])("squadNumberRepeaterForPlayerNumber", (fcGen) => {
    const [testPlayersCount]: [number, number] =
      fastCheckGenerateTestPlayersCount(fcGen);
    const actualSquadNumbers: Array<number> = unfold(
      squadNumberRepeaterForPlayerNumber,
      testPlayersCount,
    );

    const actualRandomChunkSum: number = pipe([
      fastCheckGetRandomArrayChunk(fcGen),
      head,
      sum,
    ])([actualSquadNumbers, 25]);
    const expectedSum = pipe([unfold(addOne), sum])(24);
    expect(actualRandomChunkSum).toEqual(expectedSum);
  });
});
