import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  identity,
  multiply,
  pipe,
  over,
  add,
  first,
  last,
  map,
  property,
} from "lodash/fp";
import {
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
  DEFAULTTOTALDOMESTICLEAGUES,
  DEFAULTCLUBSPERDOMESTICLEAGUE,
} from "../Constants";
import { League, LeagueTable, BaseCountries } from "../Types";
import {
  assertIsLeagueObject,
  convertArraysToSetsAndAssertStrictEqual,
  assertIntegerInRangeExclusive,
} from "../Asserters";
import {
  fastCheckRandomDomesticLeagueNumber,
  fastCheckCreateTestListOfMatchLogsForLeague,
  fastCheckUnfoldRandomNaturalNumberRangeChunk,
  fastCheckRandomItemFromArray,
  fastCheckGenerateRandomBaseCountries,
  fastCheckRandomSeason,
  fastCheckTestCompletelyRandomBaseDomesticLeaguePath,
} from "../TestDataGenerators";
import { getCountOfUniqueIntegersFromArray } from "../Getters";
import {
  countryNumberRepeaterForDomesticLeagues,
  levelNumberRepeaterForDomesticLeagues,
  generateDomesticLeagueStartingClubNumbers,
  createLeague,
  createLeagueTable,
  unfold,
} from "../Transformers";

describe("LeagueDataGenerators test suite", () => {
  test.prop([fc.gen()])("countryNumberRepeaterForDomesticLeagues", (fcGen) => {
    const [testRandomChunk, testChunkNumber] =
      fastCheckUnfoldRandomNaturalNumberRangeChunk(
        DEFAULTTOTALDOMESTICLEAGUES,
        DEFAULTDOMESTICLEAGUESPERCOUNTRY,
        countryNumberRepeaterForDomesticLeagues,
        fcGen,
      );

    convertArraysToSetsAndAssertStrictEqual([
      testRandomChunk,
      [testChunkNumber],
    ]);
  });

  test.prop([fc.gen()])("levelNumberRepeaterForDomesticLeagues", (fcGen) => {
    const [testRandomChunk] = fastCheckUnfoldRandomNaturalNumberRangeChunk(
      DEFAULTTOTALDOMESTICLEAGUES,
      DEFAULTDOMESTICLEAGUESPERCOUNTRY,
      levelNumberRepeaterForDomesticLeagues,
      fcGen,
    );

    const expectedChunk: Array<number> = unfold(
      identity,
      DEFAULTDOMESTICLEAGUESPERCOUNTRY,
    );

    convertArraysToSetsAndAssertStrictEqual([testRandomChunk, expectedChunk]);
  });

  test.prop([fc.gen()])(
    "generateDomesticLeagueStartingClubNumbers",
    (fcGen) => {
      const testDomesticLeagueNumber: number =
        fastCheckRandomDomesticLeagueNumber(fcGen);
      const actualClubNumbers: Array<number> =
        generateDomesticLeagueStartingClubNumbers(testDomesticLeagueNumber);

      expect(getCountOfUniqueIntegersFromArray(actualClubNumbers)).toEqual(
        DEFAULTCLUBSPERDOMESTICLEAGUE,
      );
      const actualRandomClubNumber: number = fastCheckRandomItemFromArray(
        fcGen,
        actualClubNumbers,
      );

      const expectedRange: [number, number] = pipe([
        multiply(DEFAULTCLUBSPERDOMESTICLEAGUE),
        over([identity, add(DEFAULTCLUBSPERDOMESTICLEAGUE)]),
      ])(testDomesticLeagueNumber);
      assertIntegerInRangeExclusive(expectedRange, actualRandomClubNumber);
    },
  );

  test.prop([fc.gen()])("createLeague", (fcGen) => {
    const testDomesticLeagueNumber: number =
      fastCheckRandomDomesticLeagueNumber(fcGen);

    const actualLeagueObject: League = createLeague(testDomesticLeagueNumber);

    assertIsLeagueObject(actualLeagueObject);
  });
});
