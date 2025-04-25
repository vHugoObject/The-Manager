import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  pipe,
  first,
  over,
  map,
  isString,
  isNumber,
  multiply,
  toString,
  toArray,
  sum,
  zipAll,
  zipObject,
  countBy,
  flatMapDeep,
  size,
} from "lodash/fp";
import { BaseEntities, PositionGroup, Save } from "../Types";
import {
  DEFAULTMATCHCOMPOSITION,
  DEFAULTTESTMATCHESCOUNT,
  DEFAULTPLAYERSPERTESTMATCHES,
} from "../Constants";
import {
  pairArraysAndAssertStrictEqual,
  convertArraysToSetsAndAssertStrictEqual,
} from "../Asserters";
import {
  fastCheckTestSingleStringIDGenerator,
  fastCheckTestMixedArrayOfStringIDsGenerator,
  fastCheckNLengthArrayOfStringsAndIntegersGenerator,
  fastCheckTestLinearRangeGenerator,
  fastCheckNLengthArrayOfItemCountTuplesGivenItemsAndRangeOfCountsGenerator,
  fastCheckTestBaseEntitiesGenerator,
  getRandomCountryIndex,
  getRandomDomesticLeagueIndex,
  getRandomClubIndex,
  fakerToArb,
  getCompletelyRandomClubID,
  createTestSave,
} from "../TestDataGenerationUtilities";
import {
  convertRangeSizeAndMinIntoRange,
  spreadZipObject,
  zipAllAndGetInitial,
  spreadMultiply,
  getLengthOfLinearRange,
  convertArrayOfArraysToArrayOfSets,
} from "../Transformers";
import {
  sortPlayersByRatings,
  getCountsForASetOfIDPrefixes,
  getIDPrefix,
  getIDSuffix,
  getCountOfItemsFromArrayForPredicate,
  getObjectKeysCount,
  getCountriesCountFromBaseCountries,
  getDomesticLeaguesPerCountryCountFromBaseCountries,
  getClubsPerDomesticLeaguesCountFromBaseCountries,
  getBaseEntitiesCountryIDsAsSet,
  getBaseEntitiesCountryIDAtSpecificIndex,
  getBaseEntitiesDomesticLeagueIDsAsSet,
  getBaseEntitiesClubIDsAsSet,
  getClubIDsCount,
  getBaseEntitiesDomesticLeagueIDsForACountryIndex,
  getDomesticLeagueIDsCount,
  getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet,
  getBaseEntitiesDomesticLeagueIDAtSpecificIndex,
  getBaseEntitiesClubsCount,
  getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet,
  getBaseEntitiesClubIDAtSpecificIndex,
  getTotalPlayersToGenerateBasedOnGivenComposition,
  getClubBestStarting11FromSave,
  getPlayerPositionGroupFromID,
  getClubSquadFromSave,
  getClubPlayerSkillsFromSave,
} from "../Getters";

describe("Getters test suite", () => {
  const POSITIONGROUPSLIST = Object.values(PositionGroup);
  test.prop([fc.gen(), fc.integer()])("getIDPrefix", (fcGen) => {
    const [testStringID, [testString]] =
      fastCheckTestSingleStringIDGenerator(fcGen);
    const actualIDPrefix: string = getIDPrefix(testStringID);
    expect(actualIDPrefix).toEqual(testString);
  });

  test.prop([fc.gen(), fc.integer()])("getIDSuffix", (fcGen) => {
    const [testStringID, [, testIDNumber]] =
      fastCheckTestSingleStringIDGenerator(fcGen);
    const actualIDNumber: string = getIDSuffix(testStringID);
    const expectedIDNumber: string = testIDNumber.toString();
    expect(actualIDNumber).toBe(expectedIDNumber);
  });

  test.prop([fc.gen(), fc.integer({ min: 2, max: 100 })])(
    "getCountOfItemsFromArrayForPredicate",
    (fcGen, testPredicatesCount) => {
      const [testItems, [expectedStringCount, expectedIntegerCount]] =
        fastCheckNLengthArrayOfStringsAndIntegersGenerator(
          fcGen,
          testPredicatesCount,
        );
      const [testGetStringCount, testGetIntegerCount] = map(
        getCountOfItemsFromArrayForPredicate,
      )([isString, isNumber]);
      const [actualStringCount, actualIntegerCount] = over([
        testGetStringCount,
        testGetIntegerCount,
      ])(testItems);

      pairArraysAndAssertStrictEqual([
        actualStringCount,
        expectedStringCount,
        actualIntegerCount,
        expectedIntegerCount,
      ]);
    },
  );

  test.prop([fc.integer({ min: 2, max: 10 }), fc.gen()])(
    "getCountsForASetOfIDPrefixes",
    (testIDPrefixes, fcGen) => {
      const [testStringIDs, testStringCountIndexTuples]: [
        Array<string>,
        Array<[string, number]>,
      ] = fastCheckTestMixedArrayOfStringIDsGenerator(fcGen, testIDPrefixes);
      const [testStrings, expectedCountsObject] = pipe([
        zipAllAndGetInitial,
        over([first, spreadZipObject]),
      ])(testStringCountIndexTuples);
      const actualCountsObject: Record<string, number> =
        getCountsForASetOfIDPrefixes(testStrings, testStringIDs);
      expect(actualCountsObject).toStrictEqual(expectedCountsObject);
    },
  );

  test.prop([fc.gen(), fc.integer({ min: 2 })])(
    "getLengthOfLinearRange",
     (fcGen, testRangeSize) => {
      const testRange: [number, number] = fastCheckTestLinearRangeGenerator(
        fcGen,
        testRangeSize,
      );
      const actualRangeSize: number = getLengthOfLinearRange(testRange);
      expect(actualRangeSize).toEqual(testRangeSize);
    },
  );

  test.prop([fc.integer({ min: 3 }), fc.integer({ min: 2 })])(
    "convertRangeMinAndSizeIntoRange",
     (testRangeMin, testRangeSize) => {
      const actualRange: [number, number] = convertRangeSizeAndMinIntoRange(
        testRangeSize,
        testRangeMin,
      );

      const actualRangeSize = getLengthOfLinearRange(actualRange);

      expect(actualRangeSize).toEqual(testRangeSize);
    },
  );
  test.prop([
    fc.nat({ max: 100 }).chain((expectedKeysCount: number) => {
      return fc.tuple(
        fc.constant(expectedKeysCount),
        fc.dictionary(fc.string(), fc.integer(), {
          minKeys: expectedKeysCount,
          maxKeys: expectedKeysCount,
        }),
      );
    }),
  ])("getObjectKeysCount",  (testTuple) => {
    const [expectedKeysCount, testRecord] = testTuple;
    const actualKeysCount: number = getObjectKeysCount(testRecord);
    expect(actualKeysCount).toEqual(expectedKeysCount);
  });

  test.prop([
    fc
      .tuple(
        fc.constantFrom(1, 2),
        fc.integer({ min: 1, max: 3 }),
        fc.integer({ min: 1, max: 20 }),
      )
      .chain(
        ([testCountriesCount, testDomesticLeaguesCount, testClubsCount]: [
          number,
          number,
          number,
        ]) => {
          return fc.tuple(
            fc.array(
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
                    { minLength: testClubsCount, maxLength: testClubsCount },
                  ),
                  {
                    minLength: testDomesticLeaguesCount,
                    maxLength: testDomesticLeaguesCount,
                  },
                ),
              ),
              { minLength: testCountriesCount, maxLength: testCountriesCount },
            ),
            fc.tuple(
              fc.constant(testCountriesCount),
              fc.constant(testDomesticLeaguesCount),
              fc.constant(testClubsCount),
            ),
          );
        },
      ),
  ])(
    "getCountriesCountFromBaseCountries, getDomesticLeaguesPerCountryCountFromBaseCountries, getClubsPerDomesticLeaguesCountFromBaseCountries,",
     (testCountriesDomesticsLeaguesClubsWithCounts) => {
      const [
        testCountriesDomesticsLeaguesClubs,
        [
          expectedCountriesCount,
          expectedDomesticLeaguesPerCountryCount,
          expectedClubsPerDomesticLeaguesCount,
        ],
      ] = testCountriesDomesticsLeaguesClubsWithCounts;

      const [
        actualCountriesCount,
        actualDomesticLeaguesPerCountryCount,
        actualClubsPerDomesticLeagueCount,
      ] = over([
        getCountriesCountFromBaseCountries,
        getDomesticLeaguesPerCountryCountFromBaseCountries,
        getClubsPerDomesticLeaguesCountFromBaseCountries,
      ])(testCountriesDomesticsLeaguesClubs);

      convertArraysToSetsAndAssertStrictEqual([
        [actualCountriesCount],
        [expectedCountriesCount],
        actualDomesticLeaguesPerCountryCount,
        [expectedDomesticLeaguesPerCountryCount],
        actualClubsPerDomesticLeagueCount,
        [expectedClubsPerDomesticLeaguesCount],
      ]);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesCountryIDsAsSet",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const [expectedCountriesCount] = testCountriesDomesticsLeaguesClubsCount;
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
      );
      const actualCountries: Set<string> =
        getBaseEntitiesCountryIDsAsSet(testBaseEntities);

      expect(actualCountries.size).toEqual(expectedCountriesCount);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesCountryIDAtSpecificIndex",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
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
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesDomesticLeagueIDsAsSet",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const [expectedCountriesCount, expectedDomesticLeaguesPerCountryCount] =
        testCountriesDomesticsLeaguesClubsCount;
      const expectedDomesticLeagueIDsCount: number = multiply(
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
      );
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
      );

      const actualDomesticLeagueIDs: Set<string> =
        getBaseEntitiesDomesticLeagueIDsAsSet(testBaseEntities);

      expect(actualDomesticLeagueIDs.size).toEqual(
        expectedDomesticLeagueIDsCount,
      );
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesClubIDsAsSet",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const [
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
        expectedClubsPerDomesticLeaguesCount,
      ] = testCountriesDomesticsLeaguesClubsCount;

      const expectedClubIDsCount: number = spreadMultiply([
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
        expectedClubsPerDomesticLeaguesCount,
      ]);

      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
      );

      const actualClubIDs: Set<string> =
        getBaseEntitiesClubIDsAsSet(testBaseEntities);
      const actualClubIDsCount: number = pipe([toArray, getClubIDsCount])(
        actualClubIDs,
      );
      expect(actualClubIDsCount).toEqual(expectedClubIDsCount);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesDomesticLeagueIDsForACountryIndex",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
      );
      const [, expectedDomesticLeaguesPerCountryCount] =
        testCountriesDomesticsLeaguesClubsCount;
      const testRandomCountryIndex: string = getRandomCountryIndex(
        fcGen,
        testBaseEntities,
      );
      const actualDomesticLeagueIDs: Array<string> =
        getBaseEntitiesDomesticLeagueIDsForACountryIndex(
          testBaseEntities,
          testRandomCountryIndex,
        );
      const actualDomesticLeagueIDsCount: number = getDomesticLeagueIDsCount(
        actualDomesticLeagueIDs,
      );
      expect(actualDomesticLeagueIDsCount).toEqual(
        expectedDomesticLeaguesPerCountryCount,
      );
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesDomesticLeagueIDAtSpecificIndex",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
      );

      const testDomesticLeagueIndex: [string, string] =
        getRandomDomesticLeagueIndex(fcGen, testBaseEntities);

      const actualDomesticLeagueID: string =
        getBaseEntitiesDomesticLeagueIDAtSpecificIndex(
          testBaseEntities,
          testDomesticLeagueIndex,
        );

      const [expectedCountryIndexOfDomesticLeague]: [string, string] =
        testDomesticLeagueIndex;
      const expectedDomesticLeagueIDsSet: Set<string> =
        getBaseEntitiesDomesticLeagueIDsForACountryIndexAsSet(
          testBaseEntities,
          expectedCountryIndexOfDomesticLeague,
        );
      expect(
        expectedDomesticLeagueIDsSet.has(actualDomesticLeagueID),
      ).toBeTruthy();
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesClubsCount",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const [
        expectedCountriesCount,
        expectedDomesticLeaguesPerCountryCount,
        expectedClubsPerDomesticLeaguesCount,
      ] = testCountriesDomesticsLeaguesClubsCount;

      const expectedClubsCount: number = pipe([
        multiply(expectedCountriesCount),
        multiply(expectedDomesticLeaguesPerCountryCount),
      ])(expectedClubsPerDomesticLeaguesCount);

      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
      );

      const actualClubsCount = getBaseEntitiesClubsCount(testBaseEntities);

      expect(actualClubsCount).toEqual(expectedClubsCount);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
      );

      const randomDomesticLeagueIndex: [string, string] =
        getRandomDomesticLeagueIndex(fcGen, testBaseEntities);
      const actualClubIDs: Set<string> =
        getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet(
          testBaseEntities,
          randomDomesticLeagueIndex,
        );
      const actualClubIDsCount: number = pipe([toArray, getClubIDsCount])(
        actualClubIDs,
      );
      expect(actualClubIDs.size).toEqual(actualClubIDsCount);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "getBaseEntitiesClubIDAtSpecificIndex",
    (testSeason, testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
        fcGen,
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
      );

      const testClubIndex: [string, string, string] = getRandomClubIndex(
        fcGen,
        testBaseEntities,
      );

      const actualClubID: string = getBaseEntitiesClubIDAtSpecificIndex(
        testBaseEntities,
        testClubIndex,
      );
      const [expectedCountryIndex, expectedDomesticLeagueIndex]: [
        string,
        string,
        string,
      ] = testClubIndex;

      const expectedDomesticLeagueClubsIDSet: Set<string> =
        getBaseEntitiesClubIDsForADomesticLeagueIndexAsSet(testBaseEntities, [
          expectedCountryIndex,
          expectedDomesticLeagueIndex,
        ]);

      expect(expectedDomesticLeagueClubsIDSet.has(actualClubID)).toBeTruthy();
    },
  );

  test.prop([
    fc.integer({ min: 5, max: 25 }).chain((totalTestSkills: number) => {
      return fc.dictionary(
        fc.string(),
        fc.array(fc.integer({ min: 0, max: 100 }), {
          minLength: totalTestSkills,
          maxLength: totalTestSkills,
        }),
        { minKeys: 5 },
      );
    }),
  ])("sortPlayersByRatings",  (testPlayers) => {
    const actualSortedPlayers: Record<
      string,
      Array<number>
    > = sortPlayersByRatings(testPlayers);

    expect(actualSortedPlayers).toMatchObject(testPlayers);
  });

  test.prop(
    [
      fc.dictionary(
        fc.constantFrom(...POSITIONGROUPSLIST),
        fc.array(fc.nat({ max: 1 }), { minLength: 1 }),
      ),
    ],
    { numRuns: 0 },
  )("getPositionBreakdownOfRecordOfPlayers",  (testPlayers) => {
    const actualSortedPlayers: Record<
      string,
      Array<number>
    > = sortPlayersByRatings(testPlayers);

    expect(actualSortedPlayers).toMatchObject(testPlayers);
  });

  test.prop(
    [
      fc.integer({ min: 3, max: 10 }),
      fc.integer({ min: 3, max: 100 }),
      fc.integer({ min: 3 }),
      fc.nat(),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
    "getTotalPlayersToGenerateBasedOnGivenComposition",
    (
      testMinItemCount,
      testRangeSize,
      testTotalClubs,
      testStartingIndex,
      fcGen,
    ) => {
      const testComposition =
        fastCheckNLengthArrayOfItemCountTuplesGivenItemsAndRangeOfCountsGenerator(
          POSITIONGROUPSLIST,
          fcGen,
          [testMinItemCount, testRangeSize],
        );

      const testCompositionGenerator =
        getTotalPlayersToGenerateBasedOnGivenComposition(testComposition);

      const actualPlayers: Array<[PositionGroup, number, number]> =
        testCompositionGenerator(testStartingIndex, testTotalClubs);
      const [
        [actualPositions, actualCounts, actualStartingIndices],
        [expectedPositions, expectedCountsPerClub],
      ] = map(zipAll)([actualPlayers, testComposition]);

      pairArraysAndAssertStrictEqual([
        actualPositions,
        expectedPositions,
        actualStartingIndices,
        [testStartingIndex],
      ]);
      expect(sum(actualCounts)).toBeGreaterThanOrEqual(
        sum(expectedCountsPerClub),
      );
    },
  );
  const getActualComposition = pipe([
    Object.keys,
    countBy(getPlayerPositionGroupFromID),
  ]);
  const getActualPlayerIDsCountsFromStartingElevens = pipe([
    flatMapDeep(map(Object.keys)),
    size,
  ]);

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.string(),
      fc.tuple(
        fc.integer({ min: 1, max: 3 }),
        fc.integer({ min: 1, max: 3 }),
        fc.integer({ min: 1, max: 20 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
    "getClubSquadFromSave, getClubPlayerSkillsFromSave, getClubBestStarting11FromSave",
     (
      testSeason,
      testPlayerName,
      testCountriesDomesticsLeaguesClubsCount,
      fcGen,
    ) => {
      const testSave: Save =  createTestSave(fcGen, [
        testPlayerName,
        testSeason,
        testCountriesDomesticsLeaguesClubsCount,
      ]);
      const testBaseEntities: BaseEntities =
         fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const testClubID: string = getCompletelyRandomClubID(
        fcGen,
        testBaseEntities,
      );

      const actualPlayerSkills: Record<
        string,
        Array<number>
      > = getClubPlayerSkillsFromSave([testSave, testClubID]);

      const [actualPlayerIDs]: [Array<string>, Array<Array<number>>] =
        pipe([Object.entries, zipAll])(actualPlayerSkills);

      const expectedPlayerIDs = getClubSquadFromSave([testSave, testClubID]);

      const [actualPlayerIDsSet, expectedPlayerIDsSet] =
        convertArrayOfArraysToArrayOfSets([actualPlayerIDs, expectedPlayerIDs]);

      expect(actualPlayerIDsSet).toStrictEqual(expectedPlayerIDsSet);
    },
  );

  test.prop(
    [
      fc.integer({ min: 2000, max: 2100 }),
      fc.string(),
      fc.tuple(
        fc.integer({ min: 1, max: 1 }),
        fc.integer({ min: 1, max: 2 }),
        fc.integer({ min: 1, max: 20 }),
      ),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
    "getClubBestStarting11FromSave, getClubBestStarting11ForAGroupOfMatchupsWithDefaultCompFromSave",
     (
      testSeason,
      testPlayerName,
      testCountriesDomesticsLeaguesClubsCount,
      fcGen,
    ) => {
      const testSave: Save = createTestSave(fcGen, [
        testPlayerName,
        testSeason,
        testCountriesDomesticsLeaguesClubsCount,
      ]);
      const testBaseEntities: BaseEntities =
        fastCheckTestBaseEntitiesGenerator(
          [testSeason, testCountriesDomesticsLeaguesClubsCount],
          fcGen,
        );

      const testClubID: string = getCompletelyRandomClubID(
        fcGen,
        testBaseEntities,
      );

      const testGetClubBestStarting11FromSaveWithDEFAULT433 =
        getClubBestStarting11FromSave(DEFAULTMATCHCOMPOSITION);

      const actualBestStartingEleven: Record<
        string,
        Array<number>
      > = testGetClubBestStarting11FromSaveWithDEFAULT433([
        testSave,
        testClubID,
      ]);

      const expectedComposition: Record<string, number> = zipObject(
        Object.values(PositionGroup),
        DEFAULTMATCHCOMPOSITION,
      );

      const actualComposition: Record<string, number> = getActualComposition(
        actualBestStartingEleven,
      );
      expect(actualComposition).toStrictEqual(expectedComposition);

      const testMatchUps: Array<[string, string]> =
        defaultGetAListOfRandomMatches([fcGen, testBaseEntities]);

      const actualBestStartingElevens: Array<
        [Record<string, Array<number>>, Record<string, Array<number>>]
      > = getClubBestStarting11ForAGroupOfMatchupsWithDefaultCompFromSave(
        testSave,
        testMatchUps,
      );

      const expectedPlayersCount: number =
        DEFAULTTESTMATCHESCOUNT * DEFAULTPLAYERSPERTESTMATCHES;
      const actualPlayersCount: number =
        getActualPlayerIDsCountsFromStartingElevens(actualBestStartingElevens);
      expect(actualPlayersCount).toEqual(expectedPlayersCount);
    },
  );
});
