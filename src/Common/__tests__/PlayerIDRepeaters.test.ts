import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { mapIndexed } from "futil-js";
import {
  pipe,
  flatten,
  map,
  sum,
  head,
} from "lodash/fp";
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
  fastCheckGenerateAllPlayerNumbersOfRandomClub
} from "../TestDataGenerators";
import { convertArraysToSetsAndAssertStrictEqual } from "../Asserters";
import {
  countryIDRepeaterForPlayerIDs,
  domesticLeagueIDRepeaterForPlayerIDs,
  domesticLeagueLevelRepeaterForPlayerIDs,
  positionGroupRankRepeaterForPlayerNumber,
  unfold,
  addOne,
  convertArrayChunksIntoSets,
  clubIDRepeaterForPlayerIDs,
  positionGroupIDRepeaterForPlayerIDs,
  squadNumberRepeaterForPlayerNumber,
  convertArrayToSetThenGetSize
} from "../Transformers";

describe("PlayerIDRepeaters test suite", () => {
  test.prop([fc.gen()])("countryIDRepeaterForPlayerIDs", (fcGen) => {
    const [testPlayersCount, testCountriesCount] =
      fastCheckGenerateTestPlayersCount(fcGen);
    const expectedIDCountsSets: Array<Set<number>> = unfold(
      (countryIndex: number) => new Set([countryIndex]),
      testCountriesCount,
    );

    const actualIDs: Array<number> = unfold(
      countryIDRepeaterForPlayerIDs,
      testPlayersCount,
    );
    const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(
      DEFAULTPLAYERSPERCOUNTRY,
      actualIDs,
    );
    expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets);
  });

  test.prop([fc.gen()])("domesticLeagueIDRepeaterForPlayerIDs", (fcGen) => {
    const [, testDomesticLeaguesCount, , testPlayersCount] =
      fastCheckGenerateTestCountriesLeaguesClubsPlayersCount(fcGen);
    const expectedIDCountsSets: Array<Set<number>> = unfold(
      (leagueIndex: number) => new Set([leagueIndex]),
      testDomesticLeaguesCount,
    );

    const actualIDs: Array<number> = unfold(
      domesticLeagueIDRepeaterForPlayerIDs,
      testPlayersCount,
    );
    const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(
      DEFAULTPLAYERSPERDOMESTICLEAGUE,
      actualIDs,
    );
    expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets);
  });

  test.prop([fc.gen()])("domesticLeagueLevelRepeaterForPlayerIDs", (fcGen) => {
    const [testPlayersCount, testCountriesCount] =
      fastCheckGenerateTestPlayersCount(fcGen);
    const testDomesticLeagueLevelsSets: Array<Set<number>> = unfold(
      (domesticLeagueLevelIndex: number) => new Set([domesticLeagueLevelIndex]),
      DEFAULTDOMESTICLEAGUESPERCOUNTRY,
    );
    const expectedIDCountsSets: Array<Set<number>> = pipe([
      unfold((_: number) => testDomesticLeagueLevelsSets),
      flatten,
    ])(testCountriesCount);

    const actualIDs: Array<number> = unfold(
      domesticLeagueLevelRepeaterForPlayerIDs,
      testPlayersCount,
    );
    const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(
      DEFAULTPLAYERSPERDOMESTICLEAGUE,
      actualIDs,
    );
    expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets);
  });

  test.prop([fc.gen()])("clubIDRepeaterForPlayerIDs", (fcGen) => {

    const actualClubIDs: Array<number> =
          fastCheckGenerateAllPlayerNumbersOfRandomClub(
            clubIDRepeaterForPlayerIDs,
            fcGen,
          );
    

    const actualClubIDsCount: number = convertArrayToSetThenGetSize(actualClubIDs)
    expect(actualClubIDsCount).toEqual(1)
    

  });

  test.prop([fc.gen()])("positionGroupIDRepeaterForPlayerIDs", (fcGen) => {
    const [testPlayersCount]: [number, number] =
      fastCheckGenerateTestPlayersCount(fcGen);

    const actualPositionGroupIDs: Array<number> = unfold(
      positionGroupIDRepeaterForPlayerIDs,
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
      [actualPositionGroupIDs, 25],
    );

    convertArraysToSetsAndAssertStrictEqual([
      actualRandomChunk,
      expectedRandomChunk,
    ]);
  });

  test.prop([fc.gen()])("positionGroupRankRepeaterForPlayerNumber", (fcGen) => {
    const [testPlayersCount]: [number, number] =
      fastCheckGenerateTestPlayersCount(fcGen);

    const actualPositionGroupIDs: Array<number> = unfold(
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
      [actualPositionGroupIDs, 25],
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
