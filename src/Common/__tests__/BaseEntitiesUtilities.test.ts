import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  map,
  zipAll,
  size,
  mapValues,
  sum,
  zipObject,
  range,
  toString,
  last,
  toArray,
} from "lodash/fp";
import { flowAsync, updatePaths } from "futil-js";
import { BaseEntities } from "../CommonTypes";
import {
  fakerToArb,
  getRandomCountryIndex,
  getRandomDomesticLeagueIndex,
  getRandomClubIndex,
} from "../testingUtilities";
import {
  getFirstLevelArrayLengths,
  getSecondLevelArrayLengths,
} from "../CommonUtilities";
import { getCountryIDsCount } from "../../Countries/CountryUtilities";
import { getClubIDsCount } from "../../Clubs/ClubUtilities";
import { getDomesticLeagueIDsCount } from "../../Competitions/CompetitionUtilities";
import {
  flattenCompetitions,
  flattenClubs,
  getIDNumber,
  getBaseEntitiesCountryIDsAsSet,
  getLastEntityIDNumber,
  getBaseEntitiesClubsCount,
  convertBaseCountriesToBaseEntities,
  getActualBaseEntitiesCount,
  getBaseEntitiesDomesticLeagueIDsAsSet,
  getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet,
  getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet,
  getBaseEntitiesCountryIDAtSpecificIndex,
  getBaseEntitiesDomesticLeagueIDAtSpecificIndex,
  getBaseEntitiesClubIDAtSpecificIndex,
  getTestBaseEntitiesDomesticLeaguesCount,
  getTestBaseEntitiesClubsCount,
  getTestBaseEntitiesCount,
  getBaseEntitiesClubIDsAsSet,
} from "../BaseEntitiesUtilities";

describe("BaseEntitiesUtilities", async () => {
  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.constantFrom(1, 2).chain((testDomesticLeaguesCount: number) => {
      return fc.array(
        fc.tuple(
          fakerToArb((faker) => faker.location.country()),
          fc.array(
            fakerToArb((faker) => faker.company.name()),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
          fc.array(
            fc.array(
              fakerToArb((faker) => faker.company.name()),
              { minLength: 20, maxLength: 20 },
            ),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
        ),
        { minLength: 1, maxLength: 2 },
      );
    }),
  ])(
    "getBaseEntitiesCountryIDsAsSet",
    async (testSeason, testCountriesLeaguesClubs) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );
      const actualCountries: Set<string> =
        getBaseEntitiesCountryIDsAsSet(testBaseEntities);
      const expectedSize: number = flowAsync(
        toArray,
        getCountryIDsCount,
      )(actualCountries);
      expect(actualCountries.size).toEqual(expectedSize);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.constantFrom(1, 2).chain((testDomesticLeaguesCount: number) => {
      return fc.array(
        fc.tuple(
          fakerToArb((faker) => faker.location.country()),
          fc.array(
            fakerToArb((faker) => faker.company.name()),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
          fc.array(
            fc.array(
              fakerToArb((faker) => faker.company.name()),
              { minLength: 20, maxLength: 20 },
            ),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
        ),
        { minLength: 1, maxLength: 3 },
      );
    }),
    fc.gen(),
  ])(
    "getBaseEntitiesCountryIDAtSpecificIndex",
    async (testSeason, testCountriesLeaguesClubs, fcGen) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );

      const randomCountryIndex: string = getRandomCountryIndex(
        fcGen,
        testBaseEntities,
      );
      const actualCountryID: string = getBaseEntitiesCountryIDAtSpecificIndex(
        testBaseEntities,
        toString(randomCountryIndex),
      );

      const expectedCountryIDsAsSet: Set<string> =
        getBaseEntitiesCountryIDsAsSet(testBaseEntities);

      expect(expectedCountryIDsAsSet.has(actualCountryID)).toBeTruthy();
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.constantFrom(1, 2).chain((testDomesticLeaguesCount: number) => {
      return fc.array(
        fc.tuple(
          fakerToArb((faker) => faker.location.country()),
          fc.array(
            fakerToArb((faker) => faker.company.name()),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
          fc.array(
            fc.array(
              fakerToArb((faker) => faker.company.name()),
              { minLength: 20, maxLength: 20 },
            ),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
        ),
        { minLength: 1, maxLength: 3 },
      );
    }),
  ])(
    "getBaseEntitiesDomesticLeagueIDsAsSet",
    async (testSeason, testCountriesLeaguesClubs) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );
      const actualDomesticLeagueIDs: Set<string> =
        getBaseEntitiesDomesticLeagueIDsAsSet(testBaseEntities);

      const actualDomesticLeagueIDsCount: number = flowAsync(
        toArray,
        getDomesticLeagueIDsCount,
      )(actualDomesticLeagueIDs);
      expect(actualDomesticLeagueIDs.size).toStrictEqual(
        actualDomesticLeagueIDsCount,
      );
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.constantFrom(1, 2).chain((testDomesticLeaguesCount: number) => {
      return fc.array(
        fc.tuple(
          fakerToArb((faker) => faker.location.country()),
          fc.array(
            fakerToArb((faker) => faker.company.name()),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
          fc.array(
            fc.array(
              fakerToArb((faker) => faker.company.name()),
              { minLength: 20, maxLength: 20 },
            ),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
        ),
        { minLength: 1, maxLength: 3 },
      );
    }),
  ])(
    "getBaseEntitiesClubIDsAsSet",
    async (testSeason, testCountriesLeaguesClubs) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );
      const actualClubIDsAsSet: Set<string> =
        getBaseEntitiesClubIDsAsSet(testBaseEntities);

      const actualClubIDsCount: number = flowAsync(
        toArray,
        getClubIDsCount,
      )(actualClubIDsAsSet);
      expect(actualClubIDsAsSet.size).toStrictEqual(actualClubIDsCount);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.constantFrom(1, 2).chain((testDomesticLeaguesCount: number) => {
      return fc.array(
        fc.tuple(
          fakerToArb((faker) => faker.location.country()),
          fc.array(
            fakerToArb((faker) => faker.company.name()),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
          fc.array(
            fc.array(
              fakerToArb((faker) => faker.company.name()),
              { minLength: 20, maxLength: 20 },
            ),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
        ),
        { minLength: 1, maxLength: 3 },
      );
    }),
    fc.gen(),
  ])(
    "getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet",
    async (testSeason, testCountriesLeaguesClubs, fcGen) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );

      const randomCountryIndex: string = getRandomCountryIndex(
        fcGen,
        testBaseEntities,
      );
      const actualDomesticLeagueIDs: Set<string> =
        getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet(
          testBaseEntities,
          randomCountryIndex,
        );

      const actualDomesticLeagueIDsCount: number = flowAsync(
        toArray,
        getDomesticLeagueIDsCount,
      )(actualDomesticLeagueIDs);
      expect(actualDomesticLeagueIDs.size).toEqual(
        actualDomesticLeagueIDsCount,
      );
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.constantFrom(1, 2).chain((testDomesticLeaguesCount: number) => {
      return fc.array(
        fc.tuple(
          fakerToArb((faker) => faker.location.country()),
          fc.array(
            fakerToArb((faker) => faker.company.name()),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
          fc.array(
            fc.array(
              fakerToArb((faker) => faker.company.name()),
              { minLength: 20, maxLength: 20 },
            ),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
        ),
        { minLength: 1, maxLength: 3 },
      );
    }),
    fc.gen(),
  ])(
    "getBaseEntitiesDomesticLeagueIDAtSpecificIndex",
    async (testSeason, testCountriesLeaguesClubs, fcGen) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );

      const randomDomesticLeagueIndex: [string, string] =
        getRandomDomesticLeagueIndex(fcGen, testBaseEntities);
      const actualDomesticLeagueID: string =
        getBaseEntitiesDomesticLeagueIDAtSpecificIndex(
          testBaseEntities,
          randomDomesticLeagueIndex,
        );

      const [expectedDomesticLeagueIndex]: [string, string] =
        randomDomesticLeagueIndex;
      const expectedDomesticLeagueIDsSet: Set<string> =
        getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet(
          testBaseEntities,
          expectedDomesticLeagueIndex,
        );
      expect(
        expectedDomesticLeagueIDsSet.has(actualDomesticLeagueID),
      ).toBeTruthy();
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.constantFrom(1, 2, 3, 4, 5).chain((testCompetitionsCount: number) => {
      return fc.array(
        fc.tuple(
          fakerToArb((faker) => faker.location.country()),
          fc.array(
            fakerToArb((faker) => faker.company.name()),
            {
              minLength: testCompetitionsCount,
              maxLength: testCompetitionsCount,
            },
          ),
          fc.array(
            fc.array(
              fakerToArb((faker) => faker.company.name()),
              { minLength: 20, maxLength: 20 },
            ),
            {
              minLength: testCompetitionsCount,
              maxLength: testCompetitionsCount,
            },
          ),
        ),
        { minLength: 1, maxLength: 5 },
      );
    }),
  ])(
    "getBaseEntitiesClubsCount",
    async (testSeason, testCountriesLeaguesClubs) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );

      const expectedClubsCount: number = flowAsync(
        map(last),
        flattenClubs,
        size,
      )(testCountriesLeaguesClubs);

      const actualClubsCount = getBaseEntitiesClubsCount(testBaseEntities);
      expect(actualClubsCount).toEqual(expectedClubsCount);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.constantFrom(1, 2).chain((testDomesticLeaguesCount: number) => {
      return fc.array(
        fc.tuple(
          fakerToArb((faker) => faker.location.country()),
          fc.array(
            fakerToArb((faker) => faker.company.name()),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
          fc.array(
            fc.array(
              fakerToArb((faker) => faker.company.name()),
              { minLength: 20, maxLength: 20 },
            ),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
        ),
        { minLength: 1, maxLength: 3 },
      );
    }),
    fc.gen(),
  ])(
    "getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet",
    async (testSeason, testCountriesLeaguesClubs, fcGen) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );

      const randomDomesticLeagueIndex: [string, string] =
        getRandomDomesticLeagueIndex(fcGen, testBaseEntities);
      const actualClubIDs: Set<string> =
        getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet(
          testBaseEntities,
          randomDomesticLeagueIndex,
        );
      const actualClubIDsCount: number = flowAsync(
        toArray,
        getClubIDsCount,
      )(actualClubIDs);
      expect(actualClubIDs.size).toEqual(actualClubIDsCount);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.constantFrom(1, 2).chain((testDomesticLeaguesCount: number) => {
      return fc.array(
        fc.tuple(
          fakerToArb((faker) => faker.location.country()),
          fc.array(
            fakerToArb((faker) => faker.company.name()),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
          fc.array(
            fc.array(
              fakerToArb((faker) => faker.company.name()),
              { minLength: 20, maxLength: 20 },
            ),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
        ),
        { minLength: 1, maxLength: 3 },
      );
    }),
    fc.gen(),
  ])(
    "getBaseEntitiesClubIDAtSpecificIndex",
    async (testSeason, testCountriesLeaguesClubs, fcGen) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );

      const randomClubIndex: [string, string, string] = getRandomClubIndex(
        fcGen,
        testBaseEntities,
      );

      const actualClubID: string = getBaseEntitiesClubIDAtSpecificIndex(
        testBaseEntities,
        randomClubIndex,
      );
      const [randomCountryIndex, randomDomesticLeagueIndex]: [
        string,
        string,
        string,
      ] = randomClubIndex;
      const expectedDomesticLeagueClubsIDSet: Set<string> =
        getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet(testBaseEntities, [
          randomCountryIndex,
          randomDomesticLeagueIndex,
        ]);

      expect(expectedDomesticLeagueClubsIDSet.has(actualClubID)).toBeTruthy();
    },
  );

  test.prop([
    fc
      .tuple(fc.integer(), fc.nat())
      .chain(([testIDNumber, testSeason]: [number, number]) => {
        return fc.oneof(
          fc.constant(`Country_${testIDNumber}`),
          fc.constant(`DomesticLeague_${testSeason}_${testIDNumber}`),
          fc.constant(`Club_${testSeason}_${testIDNumber}`),
          fc.constant(`Midfielder_${testIDNumber}`),
          fc.constant(`Attacker_${testIDNumber}`),
          fc.constant(`Defender_${testIDNumber}`),
          fc.constant(`GoalKeeper_${testIDNumber}`),
        );
      }),
  ])("getIDNumber", async (testEntityID) => {
    const actualIDNumber: number = getIDNumber(testEntityID);
    expect(actualIDNumber).toBeTypeOf("number");
    flowAsync(toString, (actualNumber: string) =>
      expect(testEntityID.includes(actualNumber)).toBeTruthy(),
    )(actualIDNumber);
  });

  test.prop([
    fc
      .tuple(
        fc.constantFrom(
          "Country",
          "DomesticLeague",
          "Club",
          "Midfielder",
          "GoalKeeper",
          "Attacker",
          "Defender",
        ),
        fc.integer({ min: 1, max: 1000 }),
      )
      .chain(([testEntityType, testEntityCount]: [string, number]) => {
        return fc.tuple(
          fc.constant(
            map((testIDNumber: number) => `${testEntityType}_${testIDNumber}`)(
              range(1, testEntityCount + 1),
            ),
          ),
          fc.constant(testEntityCount),
        );
      }),
  ])("getLastEntityIDNumber", async (testEntityIDsAndCount) => {
    const [testEntityIDs, testCount]: [Array<string>, number] =
      testEntityIDsAndCount;
    const actualIDNumber: number = getLastEntityIDNumber(testEntityIDs);
    expect(actualIDNumber).toEqual(testCount);
  });

  test.prop([
    fc.array(
      fc.array(
        fc.tuple(fc.string(), fc.string({ minLength: 4, maxLength: 6 })),
        {
          minLength: 2,
        },
      ),
      { minLength: 2 },
    ),
    fc.array(
      fc.array(
        fc.array(
          fc.tuple(fc.string(), fc.string({ minLength: 4, maxLength: 6 })),
          { minLength: 2 },
        ),
        { minLength: 2 },
      ),
      { minLength: 2 },
    ),
  ])("flatteners", async (testDomesticLeagues, testClubs) => {
    const zipper = zipObject(["domesticLeagues", "clubs"]);
    const [actualCompetitions, actualClubs, expected]: [
      Array<[string, string]>,
      Array<[string, string]>,
      Record<string, number>,
    ] = await Promise.all([
      flattenCompetitions(testDomesticLeagues),
      flattenClubs(testClubs),
      flowAsync(
        zipper,
        updatePaths({
          domesticLeagues: getTestBaseEntitiesDomesticLeaguesCount,
          clubs: getTestBaseEntitiesClubsCount,
        }),
      )([testDomesticLeagues, testClubs]),
    ]);

    const actual: Record<string, number> = flowAsync(
      zipper,
      mapValues(size),
    )([actualCompetitions, actualClubs]);

    expect(actual).toStrictEqual(expected);
  });

  test.prop([
    fc.array(fc.array(fc.tuple(fc.string(), fc.string()), { minLength: 2 }), {
      minLength: 2,
    }),
    fc.array(
      fc.array(fc.array(fc.tuple(fc.string(), fc.string()), { minLength: 2 }), {
        minLength: 2,
      }),
      { minLength: 2 },
    ),
  ])("getLevelLengths", async (testDomesticLeagues, testClubs) => {
    const zipper = zipObject(["domesticLeagues", "clubs"]);

    const [
      expectedDomesticLeagues,
      expectedClubs,
      actualDomesticLeagues,
      actualClubs,
    ]: Array<number> = await Promise.all([
      await flowAsync(flattenCompetitions, size)(testDomesticLeagues),
      await flowAsync(flattenClubs, size)(testClubs),
      await flowAsync(getFirstLevelArrayLengths, sum)(testDomesticLeagues),
      await flowAsync(getSecondLevelArrayLengths, sum)(testClubs),
    ]);

    const [actual, expected]: [Record<string, number>, Record<string, number>] =
      map(zipper)([
        [actualDomesticLeagues, actualClubs],
        [expectedDomesticLeagues, expectedClubs],
      ]);

    expect(actual).toStrictEqual(expected);
  });

  test.prop([
    fc.array(
      fc.tuple(
        fc.string(),
        fc.array(fc.string(), { minLength: 5, maxLength: 10 }),
        fc.array(fc.array(fc.string(), { minLength: 2 }), {
          minLength: 20,
          maxLength: 40,
        }),
      ),
      { minLength: 5, maxLength: 15 },
    ),
    fc.integer({ min: 2000, max: 2100 }),
  ])(
    "convertBaseCountriesToBaseEntities",
    async (testCountriesLeaguesClubs, testSeason) => {
      const zipper = zipObject(["countries", "domesticLeagues", "clubs"]);

      const expectedCounts = flowAsync(
        zipAll,
        zipper,
        getTestBaseEntitiesCount,
      )(testCountriesLeaguesClubs);

      const actualBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );
      const actualCounts = getActualBaseEntitiesCount(actualBaseEntities);

      expect(actualCounts).toStrictEqual(expectedCounts);
    },
  );
});
