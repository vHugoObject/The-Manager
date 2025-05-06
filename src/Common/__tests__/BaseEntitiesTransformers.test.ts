import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { over, pipe, zipAll, zipObject, map } from "lodash/fp";
import {
  Entity,
  BaseCountries,
} from "../Types";
import { DEFAULTCOUNTRYSTRUCTURE } from "../Constants"
import {
  pairArraysAndAssertStrictEqual,
  convertArraysToSetsAndAssertStrictEqual
} from "../Asserters";
import {
  fastCheckTestMixedArrayOfPositionGroupIDsGenerator,
  fastCheckTestSingleCountryWithCompetitionsGenerator,
  fastCheckTestSingleDomesticLeagueWithClubsGenerator,
  fastCheckRandomSeason
} from "../TestDataGenerationUtilities";
import {
  getCountryDomesticLeagues,
  getClubSquad,
  getCompetitionName,
  getCompetitionClubs,
  getCountryName,
  getClubName,
  countByIDPrefix
} from "../Getters";
import {
  createCountry,
  createCompetition,
  createClub,
  multiplyAccumulate,
  joinOnUnderscores,
  createIDsForCountries, 
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

  test.prop([    
    fc.integer({ min: 2, max: 10 }),
    fc.gen()
  ])(
    "createIDsForCountries",
    (testCountriesCount, fcGen) => {

      const testSeason: number = fastCheckRandomSeason(fcGen)
      const actualIDs: Array<string> = createIDsForCountries(testCountriesCount)
      const expectedComposition: string = joinOnUnderscores(DEFAULTCOUNTRYSTRUCTURE)

      const actualCompositions: Array<string> = pipe([
        map(pipe([countByIDPrefix, Object.values])),
        map(joinOnUnderscores),
      ])(actualIDs);

      convertArraysToSetsAndAssertStrictEqual([
        actualCompositions,
        [expectedComposition],
      ]);
     
      
    },
  );
  

});
