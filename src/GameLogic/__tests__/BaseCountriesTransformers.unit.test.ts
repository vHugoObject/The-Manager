import { test, fc } from "@fast-check/vitest";
import { describe, expect, assert } from "vitest";
import { pipe, map, property } from "lodash/fp";
import { getBaseCountryDomesticLeagues, getBaseCountryClubs } from "../Getters";
import {
  convertDomesticLeagueRelativeIndexIntoAbsoluteNumber,
  convertClubRelativeIndexIntoAbsoluteNumber,
  convertClubAbsoluteNumberIntoCountryIndex,
  convertClubAbsoluteNumberIntoDomesticLeagueIndex,
  convertClubAbsoluteNumberIntoRelativeIndex,
  convertClubNumberIntoClubName,
  flattenToDomesticLeaguesDepth,
  flattenToClubsDepth,
} from "../Transformers";
import type { BaseCountries } from "../Types";
import {
  fastCheckTestCompletelyRandomBaseClub,
  fastCheckGenerateRandomBaseCountries,
  fastCheckTestCompletelyRandomBaseDomesticLeagueNameWithPath,
  fastCheckTestRandomBaseCountryWithIndex,
  fastCheckRandomSeason,
} from "../TestDataGenerators";

describe("BaseCountriesGetters test suite", () => {
  test("convertDomesticLeagueRelativeIndexIntoAbsoluteNumber", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const testBaseCountries: BaseCountries =
          fastCheckGenerateRandomBaseCountries(fcGen);

        const [
          [, expectedDomesticLeagueName],
          testDomesticLeagueRelativeNumber,
        ]: [[string, string], [number, number]] =
          fastCheckTestCompletelyRandomBaseDomesticLeagueNameWithPath(
            fcGen,
            testBaseCountries,
          );

        const actualDomesticLeagueNumber: number =
          convertDomesticLeagueRelativeIndexIntoAbsoluteNumber(
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
  test("convertClubRelativeIndexIntoAbsoluteNumber", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const testBaseCountries: BaseCountries =
          fastCheckGenerateRandomBaseCountries(fcGen);
        const [testClubRelativeNumber, [, , expectedClubName]] =
          fastCheckTestCompletelyRandomBaseClub(fcGen, testBaseCountries);

        const actualClubNumber: number =
          convertClubRelativeIndexIntoAbsoluteNumber(testClubRelativeNumber);

        const actualClubName: string = pipe([
          map(getBaseCountryClubs),
          flattenToClubsDepth,
          property([actualClubNumber]),
        ])(testBaseCountries);
        expect(actualClubName).toBe(expectedClubName);
      }),
    );
  });

  describe("convertClubAbsoluteNumberIntoRelativeIndex test suite", () => {
    test("convertClubAbsoluteNumberIntoCountryIndex", () => {
      fc.assert(
        fc.property(fc.gen(), (fcGen) => {
          const testBaseCountries: BaseCountries =
            fastCheckGenerateRandomBaseCountries(fcGen);

          const [testClubRelativeIndex] = fastCheckTestCompletelyRandomBaseClub(
            fcGen,
            testBaseCountries,
          );

          const testClubNumber: number =
            convertClubRelativeIndexIntoAbsoluteNumber(testClubRelativeIndex);
          const [expectedCountryIndex] = testClubRelativeIndex;

          const actualCountryIndex: number =
            convertClubAbsoluteNumberIntoCountryIndex(testClubNumber);
          expect(actualCountryIndex).toEqual(expectedCountryIndex);
        }),
      );
    });

    test("convertClubAbsoluteNumberIntoDomesticLeagueIndex", () => {
      fc.assert(
        fc.property(fc.gen(), (fcGen) => {
          const testBaseCountries: BaseCountries =
            fastCheckGenerateRandomBaseCountries(fcGen);

          const [testClubRelativeIndex] = fastCheckTestCompletelyRandomBaseClub(
            fcGen,
            testBaseCountries,
          );

          const testClubNumber: number =
            convertClubRelativeIndexIntoAbsoluteNumber(testClubRelativeIndex);
          const [expectedCountryIndex, expectedDomesticLeagueIndex] =
            testClubRelativeIndex;

          const actualDomesticLeagueIndex: [number, number] =
            convertClubAbsoluteNumberIntoDomesticLeagueIndex(testClubNumber);
          expect(actualDomesticLeagueIndex).toStrictEqual([
            expectedCountryIndex,
            expectedDomesticLeagueIndex,
          ]);
        }),
      );
    });

    test("convertClubAbsoluteNumberIntoRelativeIndex", () => {
      fc.assert(
        fc.property(fc.gen(), (fcGen) => {
          const testBaseCountries: BaseCountries =
            fastCheckGenerateRandomBaseCountries(fcGen);

          const [expectedClubRelativeIndex] =
            fastCheckTestCompletelyRandomBaseClub(fcGen, testBaseCountries);

          const testClubNumber: number =
            convertClubRelativeIndexIntoAbsoluteNumber(
              expectedClubRelativeIndex,
            );

          const actualRelativeIndex: [number, number, number] =
            convertClubAbsoluteNumberIntoRelativeIndex(testClubNumber);
          expect(actualRelativeIndex).toStrictEqual(expectedClubRelativeIndex);
        }),
      );
    });
  });

  test("convertClubNumberIntoClubName", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const testBaseCountries: BaseCountries =
          fastCheckGenerateRandomBaseCountries(fcGen);

        const [testRelativeClubIndex, [, , expectedClubName]] =
          fastCheckTestCompletelyRandomBaseClub(fcGen, testBaseCountries);

        const testClubNumber: number =
          convertClubRelativeIndexIntoAbsoluteNumber(testRelativeClubIndex);

        const actualClubName: string = convertClubNumberIntoClubName(
          testBaseCountries,
          testClubNumber,
        );

        expect(actualClubName).toEqual(expectedClubName);
      }),
    );
  });
});
