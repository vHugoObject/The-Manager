import { describe, expect, assert } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { BaseCountries } from "../Types";
import {
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
  DEFAULTCLUBSPERCOUNTRY,
  DEFAULTPLAYERSPERCOUNTRY,
  DEFAULTCLUBSPERDOMESTICLEAGUE,
} from "../Constants";
import { pipe, over, size } from "lodash/fp";
import {
  getCountOfUniqueStringsFromArray,
  getFirstLevelArrayLengths,
  getSecondLevelArrayLengths,
  getDomesticLeaguesOfCountryFromBaseCountries,
  getClubsOfDomesticLeagueFromBaseCountries,
  getClubNameFromBaseCountries,
  getDomesticLeagueNameFromBaseCountries,
} from "../Getters";
import {
  zipAllAndGetFirstArrayAsSet,
  convertArrayOfArraysToArrayOfSets,
  convertToSet,
} from "../Transformers";
import {
  convertArraysToSetsAndAssertStrictEqual,
  assertIntegerInRangeInclusive,
  assertNumbers,
  assertStrings,
  assertSubset,
  assertArrayOfIntegersInRangeExclusive,
} from "../Asserters";
import {
  fastCheckTestClubsForBaseCountriesGenerator,
  fastCheckTestDomesticLeaguesForBaseCountriesGenerator,
  fastCheckTestCountriesForBaseCountriesGenerator,
  fastCheckTestBaseCountriesGenerator,
  fastCheckTestRandomBaseCountryIndex,
  fastCheckTestRandomBaseDomesticLeagueIndexFromCountry,
  fastCheckTestRandomBaseClubIndexFromCountryAndDomesticLeague,
  fastCheckTestCompletelyRandomBaseDomesticLeagueIndex,
  fastCheckTestCompletelyRandomBaseClubIndex,
  fastCheckTestCompletelyRandomBaseClub,
  fastCheckGenerateTestDomesticLeaguesCount,
  fastCheckGenerateTestClubsCount,
  fastCheckGenerateTestPlayersCount,
  fastCheckGenerateTestCountriesLeaguesClubsPlayersCount,
  fastCheckGenerateRandomBaseCountries,
  fastCheckTestCompletelyRandomBaseDomesticLeagueNameWithIndex,
  fastCheckGetTwoRandomBaseClubNamesFromRandomLeague,
  fastCheckGetTwoRandomBaseRelativeClubNumbersFromRandomLeague,
  fastCheckGetTwoRandomBaseClubNumbersFromRandomLeague,
} from "../TestDataGenerators";

describe("TestBaseCountriesGenerators", () => {
  test.prop([fc.integer({ min: 2, max: 100 }), fc.gen()])(
    "fastCheckTestCountriesForBaseCountriesGenerator",
    (testCountriesCount, fcGen) => {
      const actualTestCountries: Array<string> =
        fastCheckTestCountriesForBaseCountriesGenerator(
          fcGen,
          testCountriesCount,
        );
      const actualCountriesCount =
        getCountOfUniqueStringsFromArray(actualTestCountries);
      expect(actualCountriesCount).toEqual(testCountriesCount);
    },
  );
  test.prop([
    fc.tuple(fc.integer({ min: 2, max: 5 }), fc.integer({ min: 2, max: 20 })),
    fc.gen(),
  ])(
    "fastCheckTestDomesticLeaguesForBaseCountriesGenerator",
    (testCountriesDomesticLeaguesCount, fcGen) => {
      const actualTestDomesticLeagues =
        fastCheckTestDomesticLeaguesForBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticLeaguesCount,
        );
      const [expectedCountriesCount, expectedDomesticLeaguesPerCountryCounts]: [
        number,
        number,
      ] = testCountriesDomesticLeaguesCount;
      const [actualCountriesCount, actualDomesticLeaguesPerCountryCounts] =
        over([size, getFirstLevelArrayLengths])(actualTestDomesticLeagues);

      convertArraysToSetsAndAssertStrictEqual([
        actualDomesticLeaguesPerCountryCounts,
        [expectedDomesticLeaguesPerCountryCounts],
      ]);

      expect(actualCountriesCount).toEqual(expectedCountriesCount);
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 2, max: 5 }),
      fc.integer({ min: 2, max: 5 }),
      fc.integer({ min: 2, max: 10 }),
    ),
    fc.gen(),
  ])(
    "fastCheckTestClubsForBaseCountriesGenerator",
    (testCountriesDomesticLeaguesClubsCount, fcGen) => {
      const actualTestClubs = fastCheckTestClubsForBaseCountriesGenerator(
        fcGen,
        testCountriesDomesticLeaguesClubsCount,
      );

      const [
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
        expectedClubsPerDomesticLeaguesCount,
      ]: [number, number, number] = testCountriesDomesticLeaguesClubsCount;

      const [
        actualCountriesCount,
        actualDomesticLeaguesPerCountryCounts,
        actualClubsPerDomesticLeaguesCount,
      ] = over([size, getFirstLevelArrayLengths, getSecondLevelArrayLengths])(
        actualTestClubs,
      );

      expect(actualCountriesCount).toEqual(expectedCountriesCount);

      convertArraysToSetsAndAssertStrictEqual([
        actualDomesticLeaguesPerCountryCounts,
        [expectedDomesticLeaguesPerCountryCount],
        actualClubsPerDomesticLeaguesCount,
        [expectedClubsPerDomesticLeaguesCount],
      ]);
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "fastCheckTestBaseCountriesGenerator",
    (testCountriesDomesticLeaguesClubsCount, fcGen) => {
      const actualTestCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticLeaguesClubsCount,
        );
      const [expectedCountriesCount]: [number, number, number] =
        testCountriesDomesticLeaguesClubsCount;
      expect(actualTestCountriesDomesticLeaguesClubs.length).toEqual(
        expectedCountriesCount,
      );
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "fastCheckTestRandomBaseCountryIndex",
    (testCountriesDomesticLeaguesClubsCount, fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticLeaguesClubsCount,
        );
      const [expectedCountriesCount]: [number, number, number] =
        testCountriesDomesticLeaguesClubsCount;
      const actualRandomBaseCountryIndex: number =
        fastCheckTestRandomBaseCountryIndex(
          fcGen,
          testCountriesDomesticLeaguesClubs,
        );

      assertIntegerInRangeInclusive(
        [0, expectedCountriesCount],
        actualRandomBaseCountryIndex,
      );
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "fastCheckTestRandomBaseDomesticLeagueIndexFromCountry",
    (testCountriesDomesticLeaguesClubsCount, fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticLeaguesClubsCount,
        );

      const testRandomBaseCountryIndex: number =
        fastCheckTestRandomBaseCountryIndex(
          fcGen,
          testCountriesDomesticLeaguesClubs,
        );

      const [, expectedDomesticLeaguesPerCountryCount]: [
        number,
        number,
        number,
      ] = testCountriesDomesticLeaguesClubsCount;

      const actualRandomBaseDomesticLeagueIndex: number =
        fastCheckTestRandomBaseDomesticLeagueIndexFromCountry(
          fcGen,
          testCountriesDomesticLeaguesClubs,
          testRandomBaseCountryIndex,
        );

      assertIntegerInRangeInclusive(
        [0, expectedDomesticLeaguesPerCountryCount],
        actualRandomBaseDomesticLeagueIndex,
      );
    },
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 8 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "fastCheckTestRandomBaseClubIndexFromCountryAndDomesticLeague",
    (testCountriesDomesticLeaguesClubsCount, fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticLeaguesClubsCount,
        );

      const testRandomFullBaseDomesticLeagueIndex: [number, number] =
        fastCheckTestCompletelyRandomBaseDomesticLeagueIndex(
          fcGen,
          testCountriesDomesticLeaguesClubs,
        );

      const [, , expectedClubsPerDomesticLeague]: [number, number, number] =
        testCountriesDomesticLeaguesClubsCount;

      const actualRandomClubIndex: number =
        fastCheckTestRandomBaseClubIndexFromCountryAndDomesticLeague(
          fcGen,
          testCountriesDomesticLeaguesClubs,
          testRandomFullBaseDomesticLeagueIndex,
        );

      assertIntegerInRangeInclusive(
        [0, expectedClubsPerDomesticLeague],
        actualRandomClubIndex,
      );
    },
  );

  test.prop([fc.gen()])(
    "fastCheckTestCompletelyRandomBaseDomesticLeagueIndex",
    (fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckGenerateRandomBaseCountries(fcGen);
      const actualDomesticLeagueIndex: [number, number] =
        fastCheckTestCompletelyRandomBaseDomesticLeagueIndex(
          fcGen,
          testCountriesDomesticLeaguesClubs,
        );

      const actualDomesticLeagueName: string =
        getDomesticLeagueNameFromBaseCountries(
          actualDomesticLeagueIndex,
          testCountriesDomesticLeaguesClubs,
        );
      assert.isString(actualDomesticLeagueName);
    },
  );

  test.prop([fc.gen()])(
    "fastCheckTestCompletelyRandomBaseDomesticLeagueNameWithIndex",
    (fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckGenerateRandomBaseCountries(fcGen);
      const [
        actualCountryAndDomesticLeagueName,
        actualCountryAndDomesticLeagueIndices,
      ]: [[string, string], [number, number]] =
        fastCheckTestCompletelyRandomBaseDomesticLeagueNameWithIndex(
          fcGen,
          testCountriesDomesticLeaguesClubs,
        );

      assertStrings(actualCountryAndDomesticLeagueName);
      assertNumbers(actualCountryAndDomesticLeagueIndices);
    },
  );

  test.prop([fc.gen()])(
    "fastCheckTestCompletelyRandomBaseClubIndex",
    (fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckGenerateRandomBaseCountries(fcGen);

      const actualClubIndex: [number, number, number] =
        fastCheckTestCompletelyRandomBaseClubIndex(
          fcGen,
          testCountriesDomesticLeaguesClubs,
        );
      const actualClubName: string = getClubNameFromBaseCountries(
        actualClubIndex,
        testCountriesDomesticLeaguesClubs,
      );
      assert.isString(actualClubName);
    },
  );

  test.prop([fc.gen()])("fastCheckTestCompletelyRandomBaseClub", (fcGen) => {
    const testCountriesDomesticLeaguesClubs: BaseCountries =
      fastCheckGenerateRandomBaseCountries(fcGen);
    const [
      [actualCountryIndex, actualDomesticLeagueIndex],
      [actualCountryName, actualDomesticLeagueName, actualClubName],
    ] = fastCheckTestCompletelyRandomBaseClub(
      fcGen,
      testCountriesDomesticLeaguesClubs,
    );

    const expectedCountryNamesSet = zipAllAndGetFirstArrayAsSet(
      testCountriesDomesticLeaguesClubs,
    );
    expect(expectedCountryNamesSet.has(actualCountryName)).toBeTruthy();

    const [expectedDomesticLeagueNamesSet, expectedClubNamesSet] = pipe([
      over([
        getDomesticLeaguesOfCountryFromBaseCountries(actualCountryIndex),
        getClubsOfDomesticLeagueFromBaseCountries([
          actualCountryIndex,
          actualDomesticLeagueIndex,
        ]),
      ]),
      convertArrayOfArraysToArrayOfSets,
    ])(testCountriesDomesticLeaguesClubs);

    expect(
      expectedDomesticLeagueNamesSet.has(actualDomesticLeagueName),
    ).toBeTruthy();
    expect(expectedClubNamesSet.has(actualClubName)).toBeTruthy();
  });

  test.prop([fc.gen()])(
    "fastCheckGetTwoRandomBaseClubNamesFromRandomLeague",
    (fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckGenerateRandomBaseCountries(fcGen);
      const [
        [actualCountryIndex, actualDomesticLeagueIndex],
        [actualClubOneName, actualClubTwoName],
      ] = fastCheckGetTwoRandomBaseClubNamesFromRandomLeague(
        fcGen,
        testCountriesDomesticLeaguesClubs,
      );
      const actualClubNamesSet = convertToSet([
        actualClubOneName,
        actualClubTwoName,
      ]);

      const expectedClubNamesSet = pipe([
        getClubsOfDomesticLeagueFromBaseCountries([
          actualCountryIndex,
          actualDomesticLeagueIndex,
        ]),
        convertToSet,
      ])(testCountriesDomesticLeaguesClubs);

      expect(actualClubOneName).not.toBe(actualClubTwoName);
      assertSubset([actualClubNamesSet, expectedClubNamesSet]);
    },
  );

  test.prop([fc.gen()])(
    "fastCheckGetTwoRandomBaseRelativeClubNumbersFromRandomLeague",
    (fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckGenerateRandomBaseCountries(fcGen);
      const [, [actualClubOneIndex, actualClubTwoIndex]] =
        fastCheckGetTwoRandomBaseRelativeClubNumbersFromRandomLeague(
          fcGen,
          testCountriesDomesticLeaguesClubs,
        );

      expect(actualClubOneIndex).not.toBe(actualClubTwoIndex);
      assertArrayOfIntegersInRangeExclusive(
        [0, DEFAULTCLUBSPERDOMESTICLEAGUE],
        [actualClubOneIndex, actualClubTwoIndex],
      );
    },
  );

  test.prop([fc.gen()])(
    "fastCheckGetTwoRandomBaseClubNumbersFromRandomLeague",
    (fcGen) => {
      const testCountriesDomesticLeaguesClubs: BaseCountries =
        fastCheckGenerateRandomBaseCountries(fcGen);
      const [[actualClubNumberOne, actualClubNumberTwo]] =
        fastCheckGetTwoRandomBaseClubNumbersFromRandomLeague(
          fcGen,
          testCountriesDomesticLeaguesClubs,
        );

      expect(actualClubNumberOne).not.toBe(actualClubNumberTwo);
    },
  );

  describe("Counts", () => {
    test.prop([fc.gen()])(
      "fastCheckGenerateTestCountriesLeaguesClubsPlayersCount",
      (fcGen) => {
        const [
          ,
          actualDomesticLeaguesCount,
          actualClubsCount,
          actualPlayersCount,
        ] = fastCheckGenerateTestCountriesLeaguesClubsPlayersCount(fcGen);

        expect(actualDomesticLeaguesCount).toBeGreaterThanOrEqual(
          DEFAULTDOMESTICLEAGUESPERCOUNTRY,
        );
        expect(actualClubsCount).toBeGreaterThanOrEqual(DEFAULTCLUBSPERCOUNTRY);
        expect(actualPlayersCount).toBeGreaterThanOrEqual(
          DEFAULTPLAYERSPERCOUNTRY,
        );
      },
    );

    test.prop([fc.gen()])(
      "fastCheckGenerateTestDomesticLeaguesCount",
      (fcGen) => {
        const [actualDomesticLeaguesCount] =
          fastCheckGenerateTestDomesticLeaguesCount(fcGen);
        expect(actualDomesticLeaguesCount).toBeGreaterThanOrEqual(
          DEFAULTDOMESTICLEAGUESPERCOUNTRY,
        );
      },
    );

    test.prop([fc.gen()])("fastCheckGenerateTestClubsCount", (fcGen) => {
      const [actualClubsCount] = fastCheckGenerateTestClubsCount(fcGen);
      expect(actualClubsCount).toBeGreaterThanOrEqual(DEFAULTCLUBSPERCOUNTRY);
    });

    test.prop([fc.gen()])("fastCheckGenerateTestPlayersCount", (fcGen) => {
      const [actualPlayersCount] = fastCheckGenerateTestPlayersCount(fcGen);
      expect(actualPlayersCount).toBeGreaterThanOrEqual(
        DEFAULTPLAYERSPERCOUNTRY,
      );
    });
  });
});
