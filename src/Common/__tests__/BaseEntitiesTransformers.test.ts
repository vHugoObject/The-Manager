import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { over, pipe, zipAll, zipObject, multiply } from "lodash/fp";
import { DEFAULTSQUADSIZE } from "../Constants";
import {
  Entity,
  BaseEntities,
  BaseCountries,
  PLAYERSKILLSPHYSICALCONTRACTINDICES,
} from "../Types";
import {
  pairArraysAndAssertStrictEqual,
  convertArraysToSetsAndAssertStrictEqual,
} from "../Asserters";
import {
  fastCheckTestBaseCountriesGenerator,
  fastCheckTestMixedArrayOfPositionGroupIDsGenerator,
  fastCheckTestSingleCountryWithCompetitionsGenerator,
  fastCheckTestSingleDomesticLeagueWithClubsGenerator,
} from "../TestDataGenerationUtilities";
import {
  getTestBaseEntitiesCount,
  getCountryDomesticLeagues,
  getClubSquad,
  getCompetitionName,
  getCompetitionClubs,
  getCountryName,
  getClubName,
  getCountOfObjectValues,
} from "../Getters";
import {
  convertBaseCountriesToBaseEntities,
  createCountry,
  createCompetition,
  createClub,
} from "../Transformers";

describe("BaseEntitiesTransformers test suite", () => {
  test.prop([
    fc.integer({ min: 2, max: 10 }),
    fc.integer({ min: 1, max: 100 }),
    fc.gen(),
  ])("createCountry", (testStartingIndex, testDomesticLeaguesCount, fcGen) => {
    const [testCountryName, testCountryCompetitions] =
      fastCheckTestSingleCountryWithCompetitionsGenerator(fcGen, [
        testStartingIndex,
        testDomesticLeaguesCount,
      ]);

    const actualCountry: Entity = createCountry(
      testCountryName,
      testCountryCompetitions,
    );

    const [expectedCompetitionIDs] = zipAll(testCountryCompetitions);

    const [actualCountryName, actualCountryCompetitionIDs] = over([
      getCountryName,
      getCountryDomesticLeagues,
    ])(actualCountry);

    expect(actualCountryName).toMatch(testCountryName);

    pairArraysAndAssertStrictEqual([
      expectedCompetitionIDs,
      actualCountryCompetitionIDs,
    ]);
  });

  test.prop([
    fc.integer({ min: 2, max: 10 }),
    fc.integer({ min: 1, max: 100 }),
    fc.gen(),
  ])("createCompetition", (testStartingIndex, testClubsCount, fcGen) => {
    const [testCompetitionName, testCompetitionClubs] =
      fastCheckTestSingleDomesticLeagueWithClubsGenerator(fcGen, [
        testStartingIndex,
        testClubsCount,
      ]);

    const actualCompetition: Entity = createCompetition(
      testCompetitionName,
      testCompetitionClubs,
    );

    const [expectedClubIDs] = zipAll(testCompetitionClubs);

    const [actualCompetitionName, actualCompetitionClubIDs] = over([
      getCompetitionName,
      getCompetitionClubs,
    ])(actualCompetition);

    expect(actualCompetitionName).toMatch(testCompetitionName);

    pairArraysAndAssertStrictEqual([actualCompetitionClubIDs, expectedClubIDs]);
  });

  test.prop([fc.string(),
    fc.integer({ min: 2, max: 10 }),
    fc.integer({ min: 1, max: 100 }),
    fc.gen()
  ])(
    "createClub",
    (testClubName, testMinCountOfPlayersPerPosition, testRangeSize, fcGen) => {

      const [testClubSquad]: [
        Array<string>,
        Array<[string, number]>,
      ] = fastCheckTestMixedArrayOfPositionGroupIDsGenerator(
        fcGen,
        [testMinCountOfPlayersPerPosition, testRangeSize],
      );
      
      const actualClub = createClub(testClubName, testClubSquad);
      const [actualClubName, actualClubSquad] = over([
        getClubName,
        getClubSquad,
      ])(actualClub);

      expect(actualClubName).toBe(testClubName);
      pairArraysAndAssertStrictEqual([actualClubSquad, testClubSquad]);
    },
  );

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.tuple(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
    "convertBaseCountriesToBaseEntities",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseCountries: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticsLeaguesClubsCount,
        );
      const [
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
        expectedClubsPerDomesticLeaguesCount,
      ] = testCountriesDomesticsLeaguesClubsCount;
      const expectedDomesticLeaguesCount: number = multiply(
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
      );
      const expectedClubsCount: number = pipe([
        multiply(expectedCountriesCount),
        multiply(expectedDomesticLeaguesPerCountryCount),
      ])(expectedClubsPerDomesticLeaguesCount);

      const expectedCountsObject = zipObject(
        ["countries", "domesticLeagues", "clubs"],
        [
          expectedCountriesCount,
          expectedDomesticLeaguesCount,
          expectedClubsCount,
        ],
      );

      const actualBaseEntities: BaseEntities =
        convertBaseCountriesToBaseEntities(testSeason, testBaseCountries);

      const actualCountsObject: Record<string, number> =
        getTestBaseEntitiesCount(actualBaseEntities);
      expect(actualCountsObject).toStrictEqual(expectedCountsObject);
    },
  );
});
