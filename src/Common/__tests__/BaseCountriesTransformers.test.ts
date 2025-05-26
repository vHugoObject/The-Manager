import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { mapIndexed, flatMapIndexed } from "futil-js"
import { pipe, flatten, multiply, chunk, map } from "lodash/fp";
import {
  DEFAULTCLUBSPERDOMESTICLEAGUE,
  IDPREFIXES,
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
  DEFAULTCLUBSPERCOUNTRY,
  DEFAULTPLAYERSPERCOUNTRY,
  DEFAULTPLAYERSPERDOMESTICLEAGUE,
  DEFAULTSQUADSIZE,
  BASECLUBCOMPOSITION
} from "../Constants";
import { fastCheckRandomSeason } from "../TestDataGenerationUtilities";
import { pairAndAssertStrictEqual } from "../Asserters";
import { countByFirstFourIDParts, countByIdentity } from "../Getters";
import { countryIDRepeaterForClubs,
  countryIDRepeaterForPlayers,
  domesticLeagueIDRepeaterForClubs,
  domesticLeagueIDRepeaterForPlayers,
  domesticLeagueLevelRepeaterForClubs,
  domesticLeagueLevelRepeaterForPlayers,
  unfold,
  unfoldIntoObject,
  convertArrayChunksIntoSets,
  clubIDRepeaterForPlayers,
  clubScheduleIDRepeater,
  positionIDRepeaterForPlayers,
  convertToSet,
  convertToList,
  createClubIDs,
} from "../Transformers";

describe("BaseCountriesTransformers test suite", () => {

  test.prop([fc.integer({ min: 2, max: 10 })])(
    "countryIDRepeaterForClubs",
    (testCountriesCount) => {

      const testClubsCount: number = multiply(testCountriesCount, DEFAULTCLUBSPERCOUNTRY)
      const expectedIDCountsSets: Array<Set<number>> = unfold((countryIndex: number) => new Set([countryIndex]), testCountriesCount)      
      
      const actualIDs: Array<number> = unfold(countryIDRepeaterForClubs, testClubsCount)
      const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(DEFAULTCLUBSPERCOUNTRY, actualIDs)

      expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets)
      
      
    },
  );

  test.prop([fc.integer({ min: 2, max: 10 })])(
    "countryIDRepeaterForPlayers",
    (testCountriesCount) => {

      const testPlayersCount: number = multiply(testCountriesCount, DEFAULTPLAYERSPERCOUNTRY)
      const expectedIDCountsSets: Array<Set<number>> = unfold((countryIndex: number) => new Set([countryIndex]), testCountriesCount)      

      
      const actualIDs: Array<number> = unfold(countryIDRepeaterForPlayers, testPlayersCount)
      const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(DEFAULTPLAYERSPERCOUNTRY, actualIDs)
      expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets)
      
      
    },
  );

  test.prop([fc.integer({ min: 2, max: 10 })])(
    "domesticLeagueIDRepeaterForClubs",
    (testCountriesCount) => {

      const testClubsCount: number = multiply(testCountriesCount, DEFAULTCLUBSPERCOUNTRY)
      const testDomesticLeaguesCount: number = multiply(testCountriesCount, DEFAULTDOMESTICLEAGUESPERCOUNTRY)
      const expectedIDCountsSets: Array<Set<number>> = unfold((leagueIndex: number) => new Set([leagueIndex]), testDomesticLeaguesCount)      
      
      
      const actualIDs: Array<number> = unfold(domesticLeagueIDRepeaterForClubs, testClubsCount)
      const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(DEFAULTCLUBSPERDOMESTICLEAGUE, actualIDs)
      expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets)

      
      
    },
  );

    test.prop([fc.integer({ min: 2, max: 10 })])(
    "domesticLeagueIDRepeaterForPlayers",
    (testCountriesCount) => {

      const testPlayersCount: number = multiply(testCountriesCount, DEFAULTPLAYERSPERCOUNTRY)
      const testDomesticLeaguesCount: number = multiply(testCountriesCount, DEFAULTDOMESTICLEAGUESPERCOUNTRY)
      const expectedIDCountsSets: Array<Set<number>> = unfold((leagueIndex: number) => new Set([leagueIndex]), testDomesticLeaguesCount)      

      
      const actualIDs: Array<number> = unfold(domesticLeagueIDRepeaterForPlayers, testPlayersCount)
      const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(DEFAULTPLAYERSPERDOMESTICLEAGUE, actualIDs)
      expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets)

      
    },
  );

    test.prop([fc.integer({ min: 2, max: 10 })])(
    "domesticLeagueLevelRepeaterForClubs",
    (testCountriesCount) => {

      const testClubsCount: number = multiply(testCountriesCount, DEFAULTCLUBSPERCOUNTRY)
      const testDomesticLeagueLevelsSets: Array<Set<number>> = unfold((domesticLeagueLevelIndex: number) => new Set([domesticLeagueLevelIndex]), DEFAULTDOMESTICLEAGUESPERCOUNTRY)
      const expectedIDCountsSets: Array<Set<number>> = pipe([
	unfold((_: number) => testDomesticLeagueLevelsSets),
	flatten
      ])(testCountriesCount)
      
      
      const actualIDs: Array<number> = unfold(domesticLeagueLevelRepeaterForClubs, testClubsCount)
      const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(DEFAULTCLUBSPERDOMESTICLEAGUE, actualIDs)
      expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets)
      
      
    },
    );

  test.prop([fc.integer({ min: 2, max: 10 })])(
    "domesticLeagueLevelRepeaterForPlayers",
    (testCountriesCount) => {

      const testPlayersCount: number = multiply(testCountriesCount, DEFAULTPLAYERSPERCOUNTRY)
      const testDomesticLeagueLevelsSets: Array<Set<number>> = unfold((domesticLeagueLevelIndex: number) => new Set([domesticLeagueLevelIndex]), DEFAULTDOMESTICLEAGUESPERCOUNTRY)
      const expectedIDCountsSets: Array<Set<number>> = pipe([
	unfold((_: number) => testDomesticLeagueLevelsSets),
	flatten
      ])(testCountriesCount)


      
      const actualIDs: Array<number> = unfold(domesticLeagueLevelRepeaterForPlayers, testPlayersCount)
      const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(DEFAULTPLAYERSPERDOMESTICLEAGUE, actualIDs)
      expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets)
      
    },
  );


  test.prop([fc.integer({ min: 2, max: 10 })])(
    "clubIDRepeaterForPlayers",
    (testCountriesCount) => {

      const testPlayersCount: number = multiply(testCountriesCount, DEFAULTPLAYERSPERCOUNTRY)
      const expectedClubs: number = multiply(testCountriesCount, DEFAULTCLUBSPERCOUNTRY)      
      const expectedIDCountsSets: Array<Set<number>> = unfold((clubIndex: number) => new Set([clubIndex]), expectedClubs)
      
      const actualIDs: Array<number> = unfold(clubIDRepeaterForPlayers, testPlayersCount)
      const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(DEFAULTSQUADSIZE, actualIDs)
      expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets)
      
    },
  );

  test.prop([fc.integer({ min: 2, max: 10 })])(
    "clubScheduleIDRepeater",
    (testCountriesCount) => {

      const testClubsCount: number = multiply(testCountriesCount, DEFAULTCLUBSPERCOUNTRY)
      const testDomesticLeaguesCount: number = multiply(testCountriesCount, DEFAULTDOMESTICLEAGUESPERCOUNTRY)
      const testClubScheduleIDs: Array<number> = pipe([unfold((scheduleID: number) => scheduleID), convertToSet])(DEFAULTCLUBSPERDOMESTICLEAGUE)
      const expectedIDCountsSets: Array<Set<number>>  = pipe([
	unfold((_: number) => testClubScheduleIDs),
	flatten
      ])(testDomesticLeaguesCount)
            

      const actualIDs: Array<number> = unfold(clubScheduleIDRepeater, testClubsCount)
      const actualIDCountsSets: Array<Array<number>> = convertArrayChunksIntoSets(DEFAULTCLUBSPERDOMESTICLEAGUE, actualIDs)
      expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets)
      
    },
  );

  test.prop([fc.integer({ min: 2, max: 10 })])(
    "positionIDRepeaterForPlayers",
    (testCountriesCount) => {

      const testPlayersCount: number = multiply(testCountriesCount, DEFAULTPLAYERSPERCOUNTRY)
      const expectedClubs: number = multiply(testCountriesCount, DEFAULTCLUBSPERCOUNTRY)
      const expectedComposition = pipe([
	mapIndexed((positionCount: number, position: number) => unfold(() => position, positionCount)),
	flatten,
	convertToList,
	convertToSet,
      ])(BASECLUBCOMPOSITION)

      const expectedIDCountsSets: Array<Set<number>> = unfold((_: number) => expectedComposition)(expectedClubs)
      
      const actualIDs: Array<number> = unfold(positionIDRepeaterForPlayers, testPlayersCount)
      const actualIDCountsSets: Array<Array<number>> = pipe([
	chunk(DEFAULTSQUADSIZE),
	map(pipe([convertToList, convertToSet])),	
      ])(actualIDs)
      expect(actualIDCountsSets).toStrictEqual(expectedIDCountsSets)

    },
  );



});
