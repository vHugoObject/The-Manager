import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { identity, multiply, pipe, over, add } from "lodash/fp";
import {
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
  DEFAULTTOTALDOMESTICLEAGUES,
  DEFAULTCLUBSPERDOMESTICLEAGUE,
} from "../Constants";
import { DomesticLeague } from "../Types";
import {
  assertIsDomesticLeagueObject,
  convertArraysToSetsAndAssertStrictEqual,
  assertIntegerInRangeExclusive,
} from "../Asserters";
import {
  fastCheckRandomDomesticLeagueNumberGenerator,
  fastCheckUnfoldRandomNaturalNumberRangeChunk,
  fastCheckRandomItemFromArray,
} from "../TestDataGenerators";
import { getCountOfUniqueIntegersFromArray } from "../Getters";
import {
  countryNumberRepeaterForDomesticLeagues,
  levelNumberRepeaterForDomesticLeagues,
  generateDomesticLeagueStartingClubNumbers,
  createDomesticLeague,
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
        fastCheckRandomDomesticLeagueNumberGenerator(fcGen);
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

  test.prop([fc.gen()])("createDomesticLeague", (fcGen) => {
    const testDomesticLeagueNumber: number =
      fastCheckRandomDomesticLeagueNumberGenerator(fcGen);

    const actualLeagueObject: DomesticLeague = createDomesticLeague(
      testDomesticLeagueNumber,
    );

    assertIsDomesticLeagueObject(actualLeagueObject);
  });
});
