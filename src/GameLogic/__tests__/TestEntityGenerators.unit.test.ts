import { describe, expect, assert } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { Player, Club, DomesticLeague } from "../Types";
import {
  DEFAULTSQUADSIZE,
  DEFAULTTOTALCLUBS,
  DEFAULTTOTALPLAYERS,
  DEFAULTCLUBSPERDOMESTICLEAGUE,
} from "../Constants";
import {
  pipe,
  multiply,
  over,
  identity,
  add,
  inRange,
  zipAll,
  flatten,
} from "lodash/fp";
import { getCountOfUniqueItemsFromArrayForPredicate } from "../Getters";
import {
  assertIntegerInRangeInclusive,
  assertIsClubObject,
  assertIsPlayerObject,
  assertIsDomesticLeagueObject,
} from "../Asserters";
import {
  fastCheckCreateNTestPlayers,
  fastCheckCreateNTestClubs,
  fastCheckTestPlayerNumberAndSeason,
  fastCheckGenerateTestCountriesCount,
  fastCheckTestClubNumberAndSeason,
  fastCheckRandomClubAndPlayerNumberGenerator,
  fastCheckGenerateAllPlayerNumbersOfRandomClub,
  fastCheckGetNRandomClubNumbers,
  fastCheckGetAllPlayersOfNRandomClubs,
  fastCheckRandomItemFromArray,
  fastCheckCreateNTestDomesticLeagues,
} from "../TestDataGenerators";

describe("TestEntityGenerators", () => {
  test.prop([fc.gen()])("fastCheckGenerateTestCountriesCount", (fcGen) => {
    const actualCountriesCount: number =
      fastCheckGenerateTestCountriesCount(fcGen);
    expect(actualCountriesCount).toBeGreaterThanOrEqual(1);
  });

  describe("entityNumberGenerators", () => {
    test.prop([fc.gen()])("fastCheckTestPlayerNumberAndSeason", (fcGen) => {
      const [actualSeason, actualPlayerNumber] =
        fastCheckTestPlayerNumberAndSeason(fcGen);
      expect(actualSeason).toBeGreaterThanOrEqual(0);
      expect(actualPlayerNumber).toBeGreaterThanOrEqual(0);
    });

    test.prop([fc.gen()])("fastCheckTestClubNumberAndSeason", (fcGen) => {
      const [actualSeason, actualClubNumber] =
        fastCheckTestClubNumberAndSeason(fcGen);
      expect(actualSeason).toBeGreaterThanOrEqual(0);
      expect(actualClubNumber).toBeGreaterThanOrEqual(0);
    });

    test.prop([fc.gen()])(
      "fastCheckRandomClubAndPlayerNumberGenerator",
      (fcGen) => {
        const [actualClubNumber, actualPlayerNumber]: Array<number> =
          fastCheckRandomClubAndPlayerNumberGenerator(fcGen);

        const expectedRange: [number, number] = pipe([
          multiply(actualClubNumber),
          over<number>([identity, add(DEFAULTSQUADSIZE)]),
        ])(DEFAULTSQUADSIZE) as [number, number];
        assertIntegerInRangeInclusive(expectedRange, actualPlayerNumber);
      },
    );

    test.prop([fc.gen()])(
      "fastCheckGenerateAllPlayerNumbersOfRandomClub",
      (fcGen) => {
        const actualPlayerNumbers: Array<number> =
          fastCheckGenerateAllPlayerNumbersOfRandomClub(identity, fcGen);
        assert.lengthOf(actualPlayerNumbers, DEFAULTSQUADSIZE);
      },
    );

    test.prop([fc.gen(), fc.integer({ min: 1, max: 20 })])(
      "fastCheckGetNRandomClubNumbers",
      (fcGen, testCount) => {
        const actualClubNumbers: Array<number> = fastCheckGetNRandomClubNumbers(
          testCount,
          fcGen,
        );
        const predicate = inRange(0, DEFAULTTOTALCLUBS);
        expect(
          getCountOfUniqueItemsFromArrayForPredicate(predicate)(
            actualClubNumbers,
          ),
        ).toEqual(testCount);
      },
    );

    test.prop([fc.gen(), fc.integer({ min: 1, max: 10 })])(
      "fastCheckGetAllPlayersOfNRandomClubs",
      (fcGen, testCount) => {
        const actualClubPlayerNumberTuples: Array<[number, Array<number>]> =
          fastCheckGetAllPlayersOfNRandomClubs(testCount, fcGen);
        const [actualClubNumbers, actualPlayerNumbers]: [
          Array<number>,
          Array<Array<number>>,
        ] = zipAll(actualClubPlayerNumberTuples) as [
          Array<number>,
          Array<Array<number>>,
        ];
        assert.lengthOf(actualClubNumbers, testCount);
        const expectedPlayersCount: number = multiply(
          DEFAULTSQUADSIZE,
          testCount,
        );
        const predicate = inRange(0, DEFAULTTOTALPLAYERS);

        const actualUniquePlayersCount = pipe([
          flatten,
          getCountOfUniqueItemsFromArrayForPredicate(predicate),
        ])(actualPlayerNumbers);
        expect(actualUniquePlayersCount).toEqual(expectedPlayersCount);
      },
    );
  });

  describe("Players, Clubs and DomesticLeagues", () => {
    test.prop([fc.integer({ min: 2, max: 10 }), fc.gen()])(
      "fastCheckCreateNTestPlayers",
      (testPlayersCount, fcGen) => {
        const actualPlayers: Array<Player> = fastCheckCreateNTestPlayers(
          testPlayersCount,
          fcGen,
        );
        const actualRandomPlayer: Player = fastCheckRandomItemFromArray(
          fcGen,
          actualPlayers,
        );
        assertIsPlayerObject(actualRandomPlayer);
      },
    );

    test.prop([fc.integer({ min: 2, max: 10 }), fc.gen()])(
      "fastCheckCreateNTestClubs",
      (testClubsCount, fcGen) => {
        const actualClubs: Array<Club> = fastCheckCreateNTestClubs(
          testClubsCount,
          fcGen,
        );
        const actualRandomClub: Club = fastCheckRandomItemFromArray(
          fcGen,
          actualClubs,
        );
        assertIsClubObject(actualRandomClub);
      },
    );
    test.prop([fc.integer({ min: 2, max: 10 }), fc.gen()])(
      "fastCheckCreateNTestDomesticLeagues",
      (testDomesticLeaguesCount, fcGen) => {
        const actualDomesticLeagues: Array<DomesticLeague> =
          fastCheckCreateNTestDomesticLeagues(testDomesticLeaguesCount, fcGen);
        const actualRandomDomesticLeague: DomesticLeague =
          fastCheckRandomItemFromArray(fcGen, actualDomesticLeagues);
        assertIsDomesticLeagueObject(actualRandomDomesticLeague);
      },
    );
  });
});
