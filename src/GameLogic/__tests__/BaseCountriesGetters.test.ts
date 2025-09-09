import { test, fc } from "@fast-check/vitest";
import { describe } from "vitest";
import { over } from "lodash/fp";
import { pairIntegersAndAssertEqual } from "../Asserters";
import {
  getCountriesCountFromBaseCountries,
  getDomesticLeaguesPerCountryCountFromBaseCountries,
  getClubsPerDomesticLeaguesCountFromBaseCountries,
} from "../Getters";
import type { BaseCountries } from "../Types";
import {
  fastCheckGenerateRandomBaseCountries,
  fastCheckGenerateTestCountriesLeaguesClubsCount,
} from "../TestDataGenerators";

describe("BaseCountriesGetters test suite", () => {
  test("getters", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const testCounts: Array<number> =
          fastCheckGenerateTestCountriesLeaguesClubsCount(fcGen);

        const testCountriesDomesticsLeaguesClubs: BaseCountries =
          fastCheckGenerateRandomBaseCountries(fcGen);
        const [
          expectedCountriesCount,
          expectedDomesticLeaguesPerCountryCount,
          expectedClubsPerDomesticLeaguesCount,
        ] = testCounts;

        const [
          actualCountriesCount,
          actualDomesticLeaguesPerCountryCount,
          actualClubsPerDomesticLeagueCount,
        ] = over([
          getCountriesCountFromBaseCountries,
          getDomesticLeaguesPerCountryCountFromBaseCountries,
          getClubsPerDomesticLeaguesCountFromBaseCountries,
        ])(testCountriesDomesticsLeaguesClubs);

        pairIntegersAndAssertEqual([
          expectedCountriesCount,
          actualCountriesCount,
          expectedDomesticLeaguesPerCountryCount,
          actualDomesticLeaguesPerCountryCount,
          expectedClubsPerDomesticLeaguesCount,
          actualClubsPerDomesticLeagueCount,
        ]);
      }),
    );
  });
});
