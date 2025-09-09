import { test, fc } from "@fast-check/vitest";
import { describe, expect, assert } from "vitest";
import { pipe, map, property } from "lodash/fp";
import { getBaseCountryDomesticLeagues, getBaseCountryClubs } from "../Getters";
import {
  convertDomesticLeagueRelativeNumberIntoAbsoluteNumber,
  convertClubRelativeNumberIntoAbsoluteNumber,
  flattenToDomesticLeaguesDepth,
  flattenToClubsDepth,
} from "../Transformers";
import type { BaseCountries } from "../Types";
import {
  fastCheckTestCompletelyRandomBaseClub,
  fastCheckGenerateRandomBaseCountries,
  fastCheckTestCompletelyRandomBaseDomesticLeagueNameWithIndex,
  fastCheckRandomSeason,
} from "../TestDataGenerators";

describe("BaseCountriesGetters test suite", () => {
  test("convertDomesticLeagueRelativeNumberIntoAbsoluteNumber", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const testBaseCountries: BaseCountries =
          fastCheckGenerateRandomBaseCountries(fcGen);

        const [
          [, expectedDomesticLeagueName],
          testDomesticLeagueRelativeNumber,
        ]: [[string, string], [number, number]] =
          fastCheckTestCompletelyRandomBaseDomesticLeagueNameWithIndex(
            fcGen,
            testBaseCountries,
          );

        const actualDomesticLeagueNumber: number =
          convertDomesticLeagueRelativeNumberIntoAbsoluteNumber(
            testDomesticLeagueRelativeNumber,
          );
        const actualDomesticLeagueName: string = pipe([
          map(getBaseCountryDomesticLeagues),
          flattenToDomesticLeaguesDepth,
          property([actualDomesticLeagueNumber]),
        ])(testBaseCountries);

        expect(actualDomesticLeagueName).toBe(expectedDomesticLeagueName);
      }),
    );
  });
  test("convertClubRelativeNumberIntoAbsoluteNumber", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const testBaseCountries: BaseCountries =
          fastCheckGenerateRandomBaseCountries(fcGen);
        const [testClubRelativeNumber, [, , expectedClubName]] =
          fastCheckTestCompletelyRandomBaseClub(fcGen, testBaseCountries);

        const actualClubNumber: number =
          convertClubRelativeNumberIntoAbsoluteNumber(testClubRelativeNumber);
        const actualClubName: string = pipe([
          map(getBaseCountryClubs),
          flattenToClubsDepth,
          property([actualClubNumber]),
        ])(testBaseCountries);
        expect(actualClubName).toBe(expectedClubName);
      }),
    );
  });
});
