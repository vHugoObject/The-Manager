import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { mapIndexed } from "futil-js";
import { pipe, flatten, chunk, map, constant } from "lodash/fp";
import {
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
  DEFAULTPLAYERSPERCOUNTRY,
  DEFAULTPLAYERSPERDOMESTICLEAGUE,
  DEFAULTSQUADSIZE,
  BASECLUBCOMPOSITION,
} from "../Constants";
import {
  MAXCONTRACTYEARS,
  DEFAULTAGERANGE,
} from "../PlayerDataConstants";
import {
  fastCheckGenerateTestPlayersCount,
  fastCheckGenerateTestCountriesLeaguesClubsPlayersCount,
} from "../TestDataGenerators";
import {
  assertMeanInRangeExclusive,
} from "../Asserters";
import {
  countryIDRepeaterForPlayerIDs,
  domesticLeagueIDRepeaterForPlayerIDs,
  domesticLeagueLevelRepeaterForPlayerIDs,
  unfold,
  convertArrayChunksIntoSets,
  clubIDRepeaterForPlayerIDs,
  positionGroupIDRepeaterForPlayerIDs,
  convertToSet,
  convertToList,
  unfoldCountStartingIndexIntoRange,
  contractYearsRepeaterForPlayerIDs,
  generateAgeForPlayerID,
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

  test.prop([fc.gen()])("positionGroupIDRepeaterForPlayerIDs", (fcGen) => {
    const [, , expectedClubsCount, testPlayersCount] =
      fastCheckGenerateTestCountriesLeaguesClubsPlayersCount(fcGen);

    const expectedComposition = pipe([
      mapIndexed((positionCount: number, position: number) =>
        unfold(() => position, positionCount),
      ),
      flatten,
      convertToList,
      convertToSet,
    ])(BASECLUBCOMPOSITION);

    const expectedIDCountsSets: Array<Set<number>> = unfold(
      (_: number) => expectedComposition,
    )(expectedClubsCount);

    const actualIDs: Array<number> = unfold(
      positionGroupIDRepeaterForPlayerIDs,
      testPlayersCount,
    );
    const actualIDCountsSets: Array<Set<number>> = pipe([
      chunk(DEFAULTSQUADSIZE),
      map(pipe([convertToList, convertToSet])),
    ])(actualIDs);
    expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets);
  });

  test.prop([fc.gen()])("contractYearsRepeaterForPlayerIDs", (fcGen) => {
    const [, , expectedClubsCount, testPlayersCount] =
      fastCheckGenerateTestCountriesLeaguesClubsPlayersCount(fcGen);

    const expectedIDCountsSets = pipe([
      unfoldCountStartingIndexIntoRange,
      constant,
      (array: (args: any) => Array<number>) =>
        unfold(array, MAXCONTRACTYEARS * expectedClubsCount),
      flatten,
      chunk(DEFAULTSQUADSIZE),
      map(pipe([convertToList, convertToSet])),
    ])(MAXCONTRACTYEARS, 0);

    const actualIDs: Array<number> = unfold(
      contractYearsRepeaterForPlayerIDs,
      testPlayersCount,
    );
    const actualIDCountsSets: Array<Array<number>> = pipe([
      chunk(DEFAULTSQUADSIZE),
      map(pipe([convertToList, convertToSet])),
    ])(actualIDs);
    expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets);
  });

  test.prop([fc.gen()])("generateAgeForPlayerID", (fcGen) => {
    const [testPlayersCount] = fastCheckGenerateTestPlayersCount(fcGen);
    const actualAges: Array<number> = unfold(
      generateAgeForPlayerID,
      testPlayersCount,
    );
    assertMeanInRangeExclusive(DEFAULTAGERANGE, actualAges);
  });


});
