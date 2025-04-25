import { test, fc } from "@fast-check/vitest";
import { describe, expect, assert } from "vitest";
import {
  over,
  map,
  size,
  sum,
  last,
  pipe,
  zipAll,
  first,
  zipObject,
  multiply,
  flatMap,
  min,
  flatten,
  rangeStep,
  range,
  add,
  max,
  head,
  mean,
  at,
  overEvery,
  isEqual,
  sample,
  chunk,
  zip,
  flattenDepth
} from "lodash/fp";
import {
  addDays,
  isWithinInterval,
  isSunday,
  isEqual as isDateEqual,
  getWeekOfMonth,
  isSameMonth,
  isSameYear,
  isMonday,
  isSameDay,
  eachDayOfInterval,
  format
} from "date-fns/fp";
import fastCartesian from "fast-cartesian"

import { Entity, BaseEntities, BaseCountries, PositionGroup, PLAYERSKILLSPHYSICALCONTRACTINDICES } from "../Types";
import { POSSIBLEGOALS, AUGUST, JANUARY, FEBRUARY, JUNE, CLUBSDEPTH, COMPETITIONSDEPTH } from "../Constants"
import { pairArraysAndAssertStrictEqual, pairIntegersAndAssertEqual  } from "../Asserters"
import { fastCheckTestBaseCountriesGenerator,
  fastCheckNLengthArrayOfStringCountTuplesGenerator,
  fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator,
  fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator,
  fastCheckTestLinearRangeGenerator,
  generateTestStartingEleven,
  generateTwoTestStartingElevens,
  generateTwoTestStartingElevenTuples,
  fakerToArb
} from "../TestDataGenerationUtilities";
import {
  getFirstLevelArrayLengths,
  getSecondLevelArrayLengths,
  getMinAndMaxOfArray,
  getFirstAndLastItemsOfArray,
  getClubsSliceLengths,
  getTestBaseEntitiesCount,
  pickCountries,
  pickDomesticLeagues,
  getCountryDomesticLeagues,
  getClubSquad,
  filterPlayersByID,
  filterClubsByID,
  filterDomesticLeaguesByID,
  pickClubs,
  getCompetitionName,
  getIDPrefixes,
  getCountOfStringsFromArray,
  getCompetitionClubs,
  getCountryName,
  getClubName,
  getTestBaseEntitiesPlayersCount,
  getExpectedPlayersCount,
  getSumOfFlattenedArray,
  getExpectedLastID,
  getActualPositionGroupSet,
} from "../Getters";
import {
  getActualPositionCountStartingIndexTuplesSet,
  generateMatchScorers,
  getNextDomesticMatchDayDate,
  convertArrayOfArraysToArrayOfSets,
  unflatten,
  sliceUpArray,
  transformNestedAsFlat,
  convertArrayOfArraysIntoArrayOfLinearRanges,
  convertArrayIntoLinearRange,
  convertCharacterCodeIntoCharacter,
  convertCharacterIntoCharacterCode,
  convertBaseCountriesToBaseEntities,
  createEntities,
  createCountry,
  createCompetition,
  roundRobinScheduler,
  totalRoundRobinMatches,
  totalRoundRobinRounds,
  matchesPerRoundOfRoundRobin,
  firstWeekOfRoundRobinWithEvenNumberClubs,
  everyWeekAfterFirstWeekofRoundRobin,
  doubleRoundRobinScheduler,
  totalDoubleRoundRobinRounds,
  totalDoubleRoundRobinMatches,
  convertIntegerYearToDate,
  getThirdSundayOfAugust,
  getLastDayOfJuneOfNextYear,
  getLastDayOfAugust,
  getFirstMondayOfFebruaryOfNextYear,
  getJuneFifteenOfNextYear,
  getStartOfNextYear,
  createSeasonWindows,
  isTransferWindowOpen,
  getDaysLeftInCurrentSeason,
  addOneDay,
  subOneDay,
  defaultIsTransferWindowOpen,
  convertToSet,
  apply,
  zipApply,
  unfold,
  unfoldStartingIndexAndCountIntoRange,
  addMinusOne,
  minusOne,
  unfoldItemCountTupleIntoArray,
  unfoldItemCountTuplesIntoMixedArray,
  zipAllAndGetSumOfLastArray,
  unfoldStringStartingIndexAndCountTuplesIntoArrayOfArrayOfStringIDs,
  spreadZipObject,
  zipAllAndGetInitial,
  zipAllAndGetSumOfSecondArray,
  unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs,
  sortTuplesByFirstValueInTuple,
  createClub,
  zipAllAndGetSumOfArrayAtIndex,
  createPlayerIDsForClubs,
  runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers,
  getAverageModularStepForRangeOfData,
  generateDataForAGroupOfPlayersByAveragingModularIncreases,
  boundedModularAddition,
  generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers,
  generateSkillsPhysicalContractDataForMultiplePositionGroups,
  generatePlayerBioDataForMultiplePositionGroups,
  generatePlayerSkillsPhysicalContractDataForListOfClubs,
  normalizePercentages,
  generatePlayerBioDataForListOfClubs,
  weightedMean,
  weightedRandom,
  getRunningSumOfList,
  getRunningSumOfListOfTuples,
  simpleModularArithmetic,
  addOne,
  multiplyByTwo,
  getRandomNumberInRange,
  getUndadjustedAverageStepForASetOfModularRanges,
  mapModularIncreasersWithTheSameAverageStep,
  mapModularIncreasersWithDifferentStepsForARange,
  getRandomPlusOrMinus,
  accumulate,
  reverseThenSpreadSubtract,
  calculateMeanCategoryStrengthForPlayer,
  convertArrayOfIntegersIntoArrayOfStrings,
  calculateMeanCategoryStrengthForGroupOfPlayers,
  calculateDefenseStrength,
  calculateAttackStrength,
  calculateClubStrengths,
  calculateHomeStrength,
  calculateAwayStrength,
  calculateMatchStrengths,
  weibullCDFGoalsList,
  weibullCDFGoals,
  calculateJointProbability,
  createJointProbabilitiesMatrixForGoals,
  convertObjectKeysIntoSet,
  assignRandomScorer,
  generateMatchGoals,
  runModularIncreasersModularlyOverARangeOfPlayers
} from "../Transformers";

describe("Converters test suite", () => {
  const POSITIONGROUPSLIST = Object.values(PositionGroup)
  const COUNTOFPLAYERSKILLS = pipe([Object.values], size)(PLAYERSKILLSPHYSICALCONTRACTINDICES)
  test.prop([
    fc
      .tuple(fc.integer({ min: 2, max: 50 }), fc.integer({ min: 2 }))
      .chain(([testArrayLength, testArrayMinValue]: [number, number]) => {
        return fc.tuple(
          fc.array(fc.string(), {
            minLength: testArrayLength,
            maxLength: testArrayLength,
          }),
          fc.array(fc.integer({ min: testArrayMinValue }), {
            minLength: testArrayLength,
            maxLength: testArrayLength,
          }),
          fc.constant(testArrayLength),
          fc.constant(testArrayMinValue),
        );
      }),
  ],{numRuns: 0})("apply", (testArraysAndExpectedValues) => {
    const [
      testArrayOne,
      testArrayTwo,
      expectedArrayLength,
      expectedArrayMinValue,
    ] = testArraysAndExpectedValues;
    const actualArrayLength: number = apply(size, testArrayOne);
    const actualArrayMinValue: number = apply(min, testArrayTwo);
    pairArraysAndAssertStrictEqual([actualArrayLength, expectedArrayLength]);
    assert.isAtLeast(actualArrayMinValue, expectedArrayMinValue);
  });

  test.prop([
    fc
      .tuple(fc.integer({ min: 2, max: 50 }), fc.integer({ min: 2 }))
      .chain(([testArrayLength, testArrayMinValue]: [number, number]) => {
        return fc.tuple(
          fc.tuple(
            fc.array(fc.string(), {
              minLength: testArrayLength,
              maxLength: testArrayLength,
            }),
            fc.array(fc.integer({ min: testArrayMinValue }), {
              minLength: testArrayLength,
              maxLength: testArrayLength,
            }),
          ),
          fc.constant(testArrayLength),
          fc.constant(testArrayMinValue),
        );
      }),
  ],{numRuns: 0})("zipApply", (testArraysAndExpectedValues) => {
    const [testArrays, expectedArrayLength, expectedArrayMinValue] =
      testArraysAndExpectedValues;
    const [actualArrayLength, actualArrayMinValue] = zipApply(
      [size, min],
      testArrays,
    );
    pairArraysAndAssertStrictEqual([actualArrayLength, expectedArrayLength]);
    assert.isAtLeast(actualArrayMinValue, expectedArrayMinValue);
  });

  test.prop([fc.integer({ min: 2, max: 1000 }), fc.nat()],{numRuns: 0})(
    "unfold",
    (testArraySize, testValueToAdd) => {
      const testAdder = add(testValueToAdd);
      const actualArray: Array<number> = unfold(testAdder, testArraySize);
      const [actualFirstValue, actualLastValue] =
        getFirstAndLastItemsOfArray(actualArray);
      const expectedLastValue: number = addMinusOne(
        testValueToAdd,
        testArraySize,
      );
      pairIntegersAndAssertEqual([
        actualFirstValue,
        testValueToAdd,
        actualLastValue,
        expectedLastValue,
      ]);
    },
  );
  test.prop([fc.nat(), fc.integer({ min: 3, max: 50 })],{numRuns: 0})(
    "unfoldStartingIndexAndCountIntoRange",
    (testStartingIndex, testCount) => {
      const actualRange: Array<number> = unfoldStartingIndexAndCountIntoRange(
        testStartingIndex,
        testCount,
      );
      expect(actualRange.length).toEqual(testCount);
      const [actualFirstItem, actualLastItem] =
        getFirstAndLastItemsOfArray(actualRange);
      const expectedLastIndex: number = minusOne(testStartingIndex + testCount);
      expect(actualFirstItem).toEqual(testStartingIndex);
      expect(actualLastItem).toEqual(expectedLastIndex);
    },
  );

  test.prop([fc.tuple(fc.string(), fc.integer({ min: 3, max: 1000 }))],{numRuns: 0})(
    "unfoldItemCountTupleIntoArray",
    (testItemCountTuple) => {
      const actualArray: Array<string> =
        unfoldItemCountTupleIntoArray(testItemCountTuple);
      const [, expectedCount] = testItemCountTuple;
      expect(actualArray.length).toEqual(expectedCount);
    },
  );

  test.prop([fc.gen(), fc.integer({ min: 3, max: 1000 })],{numRuns: 0})(
    "unfoldItemCountTuplesIntoMixedArray",
    (fcGen, testTupleCount) => {
      const testTuples: Array<[string, number]> =
        fastCheckNLengthArrayOfStringCountTuplesGenerator(
          fcGen,
          testTupleCount,
        );
      const actualArray = unfoldItemCountTuplesIntoMixedArray(testTuples);
      const expectedCount: number = zipAllAndGetSumOfLastArray(testTuples);
      expect(actualArray.length).toEqual(expectedCount);
    },
  );

  test.prop([fc.integer({ min: 3, max: 100 }), fc.gen()],{numRuns: 0})(
    "unfoldStringStartingIndexAndCountTuplesIntoArrayOfArrayOfStringIDs",
    (testArraySize, fcGen) => {
      const testTuples: Array<[string, number, number]> =
        fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator(
          fcGen,
          testArraySize,
        );

      const actualStringIDs: Array<Array<string>> =
        unfoldStringStartingIndexAndCountTuplesIntoArrayOfArrayOfStringIDs(
          testTuples,
        );
      const expectedCountsObject: Record<string, number> = pipe([
        zipAllAndGetInitial,
        spreadZipObject,
      ])(testTuples);
      const actualCountsObject: Record<string, number> = pipe([
        map(getIDPrefixes),
        over([map(first), getFirstLevelArrayLengths]),
        spreadZipObject,
      ])(actualStringIDs);

      expect(actualCountsObject).toStrictEqual(expectedCountsObject);
    },
  );

  test.prop([fc.integer({ min: 3, max: 10 }), fc.gen()],{numRuns: 0})(
    "unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs",
    (testArraySize, fcGen) => {
      const testTuples: Array<[string, number, number]> =
        fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator(
          fcGen,
          testArraySize,
        );

      const actualStringIDs: Array<string> =
        unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs(testTuples);
      const expectedStringCount: number =
        zipAllAndGetSumOfSecondArray(testTuples);
      const actualStringCount: number =
        getCountOfStringsFromArray(actualStringIDs);
      pairIntegersAndAssertEqual([actualStringCount, expectedStringCount]);
    },
  );

  test.prop([
    fc
      .array(fc.integer({ min: 2, max: 10 }), { minLength: 2, maxLength: 5 })
      .chain((vals) => {
        const minLength: number = sum(vals) * 2;
        return fc.tuple(
          fc.constant(vals),
          fc.array(
            fc.oneof(
              fc.string({ minLength: 1 }),
              fc.integer(),
              fc.dictionary(
                fc.string(),
                fc.oneof(fc.string({ minLength: 1 }), fc.integer()),
                {
                  minKeys: 2,
                },
              ),
            ),
            { minLength },
          ),
        );
      }),
  ],{numRuns: 0})("sliceUpArray", (testArrayAndChunkLengths) => {
    const [testChunkLengths, testArray] = testArrayAndChunkLengths;

    const actualArray = sliceUpArray(testChunkLengths, testArray);
    assert.sameMembers(map(size)(actualArray), testChunkLengths);
  });

  test.prop([
    fc.array(
      fc.array(fc.tuple(fc.string(), fc.string()), {
        minLength: 5,
        maxLength: 10,
      }),
      {
        minLength: 2,
        maxLength: 20,
      },
    ),
    fc.array(
      fc.array(
        fc.array(fc.tuple(fc.string(), fc.string()), {
          minLength: 20,
          maxLength: 40,
        }),
        {
          minLength: 2,
          maxLength: 20,
        },
      ),
      { minLength: 2, maxLength: 20 },
    ),
  ],{numRuns: 0})("tranformNestedAsFlat", (testDomesticLeagues, testClubs) => {
    const testTransformer = (x) => structuredClone(x);

    const transformCompetitions = transformNestedAsFlat(
      [flattenDepth(COMPETITIONSDEPTH), getFirstLevelArrayLengths, sliceUpArray],
      testTransformer,
    );

    const actualDomesticLeagues = transformCompetitions(testDomesticLeagues);

    assert.sameDeepOrderedMembers(actualDomesticLeagues, testDomesticLeagues);

    const transformClubs = transformNestedAsFlat(
      [flattenDepth(CLUBSDEPTH), getClubsSliceLengths, unflatten],
      testTransformer,
    );

    const actualClubs = transformClubs(testClubs);
    assert.sameDeepOrderedMembers(actualClubs, testClubs);
  });

  test.prop([
    fc.array(
      fc.array(
        fc.array(fc.tuple(fc.string(), fc.string()), {
          minLength: 20,
          maxLength: 40,
        }),
        {
          minLength: 2,
          maxLength: 20,
        },
      ),
      { minLength: 2, maxLength: 50 },
    ),
  ],{numRuns: 0})("unflatten", (clubs) => {
    const clubsSliceLengths: Array<Array<number>> = over([
      getSecondLevelArrayLengths,
      getFirstLevelArrayLengths,
    ])(clubs);

    const testClubs = flattenDepth(CLUBSDEPTH)(clubs);
    const actualClubs = unflatten(clubsSliceLengths, testClubs);
    assert.sameDeepOrderedMembers(actualClubs, clubs);
  });

  test.prop([fc.string({ minLength: 1, maxLength: 1 })],{numRuns: 0})(
    "convertCharacterIntoCharacterCode",
     (testChar) => {
      const actualCharCode: number =
        convertCharacterIntoCharacterCode(testChar);
      assert.isNumber(actualCharCode);
    },
  );

  test.prop([fc.integer({ min: 1, max: 100 })],{numRuns: 0})(
    "convertCharacterCodeIntoCharacter",
     (testInteger) => {
      const actualChar: string = convertCharacterCodeIntoCharacter(testInteger);
      assert.isString(actualChar);
    },
  );

  test.prop([fc.array(fc.string(), { minLength: 3, maxLength: 200 })],{numRuns: 0})(
    "convertArrayIntoLinearRange",
     (testArrayOfStrings) => {
      const [firstIndex, lastIndex]: [number, number] =
        convertArrayIntoLinearRange(testArrayOfStrings);
      expect(testArrayOfStrings[firstIndex]).toBe(first(testArrayOfStrings));
      expect(testArrayOfStrings[lastIndex]).toBe(last(testArrayOfStrings));
    },
  );

  test.prop([
    fc.array(fc.array(fc.string(), { minLength: 10, maxLength: 20 }), {
      minLength: 3,
      maxLength: 50,
    }),
  ], {numRuns: 0})(
    "convertArrayOfArraysIntoArrayOfLinearRanges",
     (testArrayOfArraysOfStrings) => {
      const actualRanges: Array<[number, number]> =
        convertArrayOfArraysIntoArrayOfLinearRanges(testArrayOfArraysOfStrings);
      expect(actualRanges.length).toEqual(testArrayOfArraysOfStrings.length);
    },
  );

  test.prop([
    fc.array(fc.tuple(fc.integer(), fc.integer()), {
      minLength: 4,
      maxLength: 100,
    }),
  ],{numRuns: 0})("sortTuplesByFirstValueInTuple", (testTuples) => {
    const actualSortedTuples: Array<[number, number]> =
      sortTuplesByFirstValueInTuple(testTuples);
    const [expectedFirstValue, expectedLastValue]: [number, number] = pipe([
      zipAll,
      first,
      getMinAndMaxOfArray,
    ])(testTuples);
    const [[actualFirstValue], [actualLastValue]] =
      getFirstAndLastItemsOfArray(actualSortedTuples);
    expect(actualFirstValue).toEqual(expectedFirstValue);
    expect(actualLastValue).toEqual(expectedLastValue);
  });

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ], {numRuns: 0})(
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

  test.prop([], { numRuns: 0 })(
    "createEntities",
    (testSeason, testCountriesLeaguesClubs) => {
      const testBaseEntities: BaseEntities = convertBaseCountriesToBaseEntities(
        testSeason,
        testCountriesLeaguesClubs,
      );

      const actualEntities: Record<string, Entity> =
        createEntities(testBaseEntities);

      const getActualCountriesCount = pipe(pickCountries, size);
      const getActualDomesticLeaguesCountFromCountries = pipe(
        pickCountries,
        flatMap(getCountryDomesticLeagues),
        filterDomesticLeaguesByID,
        size,
      );
      const getActualClubsCountFromDomesticLeagues = pipe(
        pickDomesticLeagues,
        flatMap(getCompetitionClubs),
        filterClubsByID,
        size,
      );
      const getActualPlayersCountFromClubs = pipe(
        pickClubs,
        flatMap(getClubSquad),
        filterPlayersByID,
        size,
      );

      const [
        actualCountriesCount,
        actualDomesticLeaguesCountFromCountries,
        actualClubsCountFromDomesticLeagues,
        actualPlayersCountFromClubs,
      ] = pipe(
        over([
          getActualCountriesCount,
          getActualDomesticLeaguesCountFromCountries,
          getActualClubsCountFromDomesticLeagues,
          getActualPlayersCountFromClubs,
        ]),
      )(actualEntities);

      const {
        countries: expectedCountriesCount,
        domesticLeagues: expectedDomesticLeaguesCount,
        clubs: expectedClubsCount,
      } = getTestBaseEntitiesCount(testBaseEntities);
      const expectedPlayersCount: number =
        getExpectedPlayersCount(testBaseEntities);

      expect(actualCountriesCount).toEqual(expectedCountriesCount);
      expect(actualDomesticLeaguesCountFromCountries).toEqual(
        expectedDomesticLeaguesCount,
      );
      expect(actualClubsCountFromDomesticLeagues).toEqual(expectedClubsCount);
      expect(actualPlayersCountFromClubs).toEqual(expectedPlayersCount);
    },
  );

  test.prop([
    fakerToArb((faker) => faker.location.country()),
    fc.array(
      fc.tuple(
        fc.uuid(),
        fakerToArb((faker) => faker.company.name()),
      ),
      { minLength: 3, maxLength: 8 },
    ),
  ],{numRuns: 0})("createCountry",  (testCountryName, testCompetitions) => {
    const actualCountry: Entity = createCountry(
      testCountryName,
      testCompetitions,
    );

    const [testCompetitionIDs] = zipAll(testCompetitions);

    const [actualCountryName, actualCountryCompetitionIDs] = over([
      getCountryName,
      getCountryDomesticLeagues,
    ])(actualCountry);

    expect(actualCountryName).toMatch(testCountryName);

    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      testCompetitionIDs,
      actualCountryCompetitionIDs,
    ]);

    expect(expectedIDs).toStrictEqual(actualIDs);
  });

  test.prop([
    fakerToArb((faker) => faker.company.name()),
    fc.array(fc.tuple(fc.uuid(), fc.string()), {
      minLength: 18,
      maxLength: 50,
    }),
  ],{numRuns: 0})("createCompetition",  (testCompetitionName, testClubs) => {
    const actualCompetition: Entity = createCompetition(
      testCompetitionName,
      testClubs,
    );

    const [testCompetitionClubIDs] = zipAll(testClubs);

    const [actualCompetitionName, actualCompetitionClubIDs] = over([
      getCompetitionName,
      getCompetitionClubs,
    ])(actualCompetition);

    expect(actualCompetitionName).toMatch(testCompetitionName);

    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      testCompetitionClubIDs,
      actualCompetitionClubIDs,
    ]);

    expect(expectedIDs).toStrictEqual(actualIDs);
  });

  test.prop([
    fakerToArb((faker) => faker.company.name()),
    fc.array(fc.uuid(), {
      minLength: 25,
      maxLength: 25,
    }),
  ],{numRuns: 0})("createClub",  (testClubName, testPlayers) => {
    const actualClub: Entity = createClub(testClubName, testPlayers);

    const [actualClubName, actualClubSquad] = over([getClubName, getClubSquad])(
      actualClub,
    );

    expect(actualClubName).toMatch(testClubName);

    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      testPlayers,
      actualClubSquad,
    ]);
    expect(expectedIDs).toStrictEqual(actualIDs);
  });

  test.prop(
    [
      fc.integer({ min: 2, max: 50 }),
      fc.integer({ min: 2, max: 10 }),
      fc.integer({ min: 1, max: 500 }),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
    "createPlayerIDsForClubs",
    (testTotalClubs, testMinItemCount, testRangeSize, fcGen) => {
      const testTuples: Array<[string, number, number]> =
        fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator(
          POSITIONGROUPSLIST,
          fcGen,
          [testMinItemCount, testRangeSize],
        );

      //Array<Array<Array<Array<BaseEntity>>>>
      const actualPlayerIDs = createPlayerIDsForClubs(
        testTotalClubs,
        testTuples,
      );
      expect(actualPlayerIDs.length).toEqual(testTotalClubs);
      const expectedTotalPlayers: number = zipAllAndGetSumOfArrayAtIndex(
        1,
        testTuples,
      );
      const actualPlayersCount: number =
        getTestBaseEntitiesPlayersCount(actualPlayerIDs);
      expect(actualPlayersCount).toEqual(expectedTotalPlayers);
    },
  );
  test.prop([
    fc
      .tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 }))
      .chain(([min, max]: [number, number]) => {
        return fc.tuple(
          fc.array(fc.integer({ min, max }), {
            minLength: 3,
          }),
          fc.integer({ min: Math.floor(max / 10), max: Math.floor(max / 5) }),
        );
      }),
    fc.tuple(
      fc.constantFrom(...POSITIONGROUPSLIST),
      fc.integer({ min: 100, max: 300 }),
      fc.nat(),
    ),
  ], {numRuns: 0})(
    "runModularIncreasersModularlyOverARangeOfPlayers",
     (testStartingRangeAndIncrease, testPositionCountStartingIndex) => {
      const [testStartingRange, testIncrease]: [Array<number>, number] =
        testStartingRangeAndIncrease;

      const testIncreasers = map((_: number) => add(testIncrease))(
        testStartingRange,
      );

      const actualPlayers: Array<[string, Array<number>]> =
        runModularIncreasersModularlyOverARangeOfPlayers(
          [testStartingRange, testIncreasers],
          testPositionCountStartingIndex,
        );

      const [expectedPosition, expectedCount, expectedStartingIndex]: [
        PositionGroup,
        number,
        number,
      ] = testPositionCountStartingIndex;

      expect(actualPlayers.length).toEqual(expectedCount);

      const expectedLastID = getExpectedLastID([
        expectedPosition,
        expectedCount,
        expectedStartingIndex,
      ]);

      const [actualPlayersIDs, actualPlayerDataValues] = zipAll(actualPlayers);
      const actualPlayersIDsSet: Set<string> = convertToSet(actualPlayersIDs);
      expect(actualPlayersIDsSet.has(expectedLastID)).toBeTruthy();

      const expectedPositionGroupSet = new Set([
        expectedPosition,
      ]);
      const actualPositionGroupSet: Set<string> =
        getActualPositionGroupSet(actualPlayersIDs);
      expect(actualPositionGroupSet).toStrictEqual(expectedPositionGroupSet);

      const sumOfActualPlayerDataValues: number = getSumOfFlattenedArray(
        actualPlayerDataValues,
      );

      const expectedStartingRangeMultipliedByPlayerCount = pipe([
        sum,
        multiply(expectedCount),
      ])(testStartingRange);
      expect(sumOfActualPlayerDataValues).toBeGreaterThan(
        expectedStartingRangeMultipliedByPlayerCount,
      );
    },
  );

  test.prop([
    fc
      .tuple(
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 1001 }),
        fc.integer({ min: 3, max: 30 }),
      )
      .chain(([min, max, minLength]: [number, number, number]) => {
        return fc.tuple(
          fc.array(fc.integer({ min, max }), {
            minLength,
            maxLength: minLength,
          }),
          fc.array(
            fc.integer({ min: Math.floor(max / 10), max: Math.floor(max / 5) }),
            { minLength, maxLength: minLength },
          ),
        );
      }),
    fc.tuple(
      fc.constantFrom(...POSITIONGROUPSLIST),
      fc.integer({ min: 100, max: 300 }),
      fc.nat(),
    ),
  ], {numRuns: 0})(
    "runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers",
     (testStartingRangeAndIncreases, testPositionCountStartingIndex) => {
      const [testStartingRange, testIncreases]: [Array<number>, Array<number>] =
        testStartingRangeAndIncreases;

      const testIncreasers = map((testIncrease: number) => add(testIncrease))(
        testIncreases,
      );
      const actualPlayers: Array<[string, Array<number>]> =
        runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers(
          [testStartingRange, testIncreasers],
          testPositionCountStartingIndex,
        );

      const [expectedPosition, expectedCount, expectedStartingIndex]: [
        PositionGroup,
        number,
        number,
      ] = testPositionCountStartingIndex;

      expect(actualPlayers.length).toEqual(expectedCount);

      const expectedLastID = getExpectedLastID([
        expectedPosition,
        expectedCount,
        expectedStartingIndex,
      ]);

      const [actualPlayersIDs, actualPlayerDataValues] = zipAll(actualPlayers);
      const actualPlayersIDsSet: Set<string> = convertToSet(actualPlayersIDs);
      expect(actualPlayersIDsSet.has(expectedLastID)).toBeTruthy();

      const expectedPositionGroupSet: Set<PositionGroup> = new Set([
        expectedPosition,
      ]);
      const actualPositionGroupSet: Set<string> =
        getActualPositionGroupSet(actualPlayersIDs);
      expect(actualPositionGroupSet).toStrictEqual(expectedPositionGroupSet);

      const sumOfActualPlayerDataValues: number = getSumOfFlattenedArray(
        actualPlayerDataValues,
      );

      const expectedStartingRangeMultipliedByPlayerCount = pipe([
        sum,
        multiply(expectedCount),
      ])(testStartingRange);
      expect(sumOfActualPlayerDataValues).toBeGreaterThan(
        expectedStartingRangeMultipliedByPlayerCount,
      );
    },
  );

  test.prop([
    fc.array(
      fc.tuple(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 51, max: 100 }),
      ),
      { minLength: 3 },
    ),
    fc.tuple(
      fc.constantFrom(...POSITIONGROUPSLIST),
      fc.integer({ min: 100, max: 300 }),
      fc.nat(),
    ),
    fc.gen(),
  ], {numRuns: 0})(
    "generateDataForAGroupOfPlayersByAveragingModularIncreases",
     (testRanges, testPositionCountAndStartingIndex, g) => {
      const [, expectedCount]: [PositionGroup, number, number] =
        testPositionCountAndStartingIndex;

      const testRandomPlusOrMinusMax: number =
        getAverageModularStepForRangeOfData(testRanges, expectedCount);
      const testRandomPlusOrMinus: number = g(fc.integer, {
        min: 0,
        max: testRandomPlusOrMinusMax - 1,
      });

      const actualPlayers: Array<[string, Array<number>]> =
         generateDataForAGroupOfPlayersByAveragingModularIncreases(
          [testRanges, testRandomPlusOrMinus],
          testPositionCountAndStartingIndex,
        );

      const [, actualPlayerDataValues] = zipAll(actualPlayers);
      const sumOfActualPlayerDataValues: number = getSumOfFlattenedArray(
        actualPlayerDataValues,
      );

      const [sumOfExpectedMinOfSkillRanges, sumOfExpectedMaxOfSkillRanges] =
        pipe([
          over([map(min), map(max)]),
          map(sum),
          map(multiply(expectedCount)),
        ])(testRanges);

      expect(sumOfActualPlayerDataValues).toBeGreaterThan(
        sumOfExpectedMinOfSkillRanges,
      );
      expect(sumOfActualPlayerDataValues).toBeLessThan(
        sumOfExpectedMaxOfSkillRanges,
      );
    },
  );

  test.prop([
    fc.array(
      fc.tuple(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 51, max: 100 }),
      ),
      { minLength: 3 },
    ),
    fc.tuple(
      fc.constantFrom(...POSITIONGROUPSLIST),
      fc.integer({ min: 100, max: 300 }),
      fc.nat(),
    ),
  ], {numRuns: 0})(
    "generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers",
     (testRanges, testPositionCountAndStartingIndex) => {
      const [, expectedCount]: [PositionGroup, number, number] =
        testPositionCountAndStartingIndex;

      const testIncreasers = map(([min, max]: [number, number]) => {
        const testIncrease: number = (max - min) / expectedCount;
        return boundedModularAddition([[min, max], testIncrease]);
      })(testRanges);

      const actualPlayers: Array<[string, Array<number>]> =
         generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers(
          [testRanges, testIncreasers],
          testPositionCountAndStartingIndex,
        );

      const [, actualPlayerDataValues] = zipAll(actualPlayers);
      const sumOfActualPlayerDataValues: number = getSumOfFlattenedArray(
        actualPlayerDataValues,
      );

      const [sumOfExpectedMinOfSkillRanges, sumOfExpectedMaxOfSkillRanges] =
        pipe([
          over([map(min), map(max)]),
          map(sum),
          map(multiply(expectedCount)),
        ])(testRanges);

      expect(sumOfActualPlayerDataValues).toBeGreaterThan(
        sumOfExpectedMinOfSkillRanges,
      );
      expect(sumOfActualPlayerDataValues).toBeLessThan(
        sumOfExpectedMaxOfSkillRanges,
      );
    },
  );

  test.prop([
    fc.tuple(
      fc.tuple(
        fc.constant(PositionGroup.Midfielder),
        fc.integer({ min: 100, max: 300 }),
        fc.nat(),
      ),
      fc.tuple(
        fc.constant(PositionGroup.Defender),
        fc.integer({ min: 100, max: 300 }),
        fc.nat(),
      ),
      fc.tuple(
        fc.constant(PositionGroup.Attacker),
        fc.integer({ min: 100, max: 300 }),
        fc.nat(),
      ),
      fc.tuple(
        fc.constant(PositionGroup.Goalkeeper),
        fc.integer({ min: 100, max: 300 }),
        fc.nat(),
      ),
    ),
  ], {numRuns: 0})(
    "generateSkillsPhysicalContractDataForMultiplePositionGroups",
     (testPositionCountStartingIndexTuples) => {
      const expectedPositionCountStartingIndexTuplesSet = convertToSet(
        testPositionCountStartingIndexTuples,
      );

      const actualPlayers: Record<string, Entity> =
         generateSkillsPhysicalContractDataForMultiplePositionGroups(
          testPositionCountStartingIndexTuples,
        );

      const [actualPlayerIDs, actualPlayerDataValues] = pipe([
        Object.entries,
        zipAll
      ])(actualPlayers);

      const actualPositionCountStartingIndexTuplesSet =
        getActualPositionCountStartingIndexTuplesSet(actualPlayerIDs);

      expect(actualPositionCountStartingIndexTuplesSet).toStrictEqual(
        expectedPositionCountStartingIndexTuplesSet,
      );

      const sumOfActualPlayerDataValues: number = getSumOfFlattenedArray(
        actualPlayerDataValues,
      );

      expect(sumOfActualPlayerDataValues).toBeGreaterThan(0);
    },
  );

  test.prop([
    fc.tuple(
      fc.tuple(
        fc.constant(PositionGroup.Midfielder),
        fc.integer({ min: 100, max: 300 }),
        fc.nat(),
      ),
      fc.tuple(
        fc.constant(PositionGroup.Defender),
        fc.integer({ min: 100, max: 300 }),
        fc.nat(),
      ),
      fc.tuple(
        fc.constant(PositionGroup.Attacker),
        fc.integer({ min: 100, max: 300 }),
        fc.nat(),
      ),
      fc.tuple(
        fc.constant(PositionGroup.Goalkeeper),
        fc.integer({ min: 100, max: 300 }),
        fc.nat(),
      ),
    ),
  ], {numRuns: 0})(
    "generatePlayerBioDataForMultiplePositionGroups",
     (testPositionCountStartingIndexTuples) => {
      const expectedPositionCountStartingIndexTuplesSet = convertToSet(
        testPositionCountStartingIndexTuples,
      );

      const actualPlayers: Array<[string, Array<number>]> =
         generatePlayerBioDataForMultiplePositionGroups(
          testPositionCountStartingIndexTuples,
        );

      const [actualPlayerIDs, actualPlayerDataValues] = zipAll(actualPlayers);

      const actualPositionCountStartingIndexTuplesSet =
        getActualPositionCountStartingIndexTuplesSet(actualPlayerIDs);

      expect(actualPositionCountStartingIndexTuplesSet).toStrictEqual(
        expectedPositionCountStartingIndexTuplesSet,
      );

      const sumOfActualPlayerDataValues: number = getSumOfFlattenedArray(
        actualPlayerDataValues,
      );

      expect(sumOfActualPlayerDataValues).toBeGreaterThan(0);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.nat(),
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
        { minLength: 1, maxLength: 3 },
      );
    }),
  ], {numRuns: 0})(
    "generatePlayerSkillsPhysicalContractDataForListOfClubs",
     (testSeason, testStartingIndex, testCountriesLeaguesClubs) => {
      const testBaseEntities: BaseEntities =
         convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );

      const expectedPlayersCount: number =
        getExpectedPlayersCount(testBaseEntities);

      const actualPlayers: Record<string, Entity> =
         generatePlayerSkillsPhysicalContractDataForListOfClubs(
          testStartingIndex,
          testBaseEntities,
        );

      const actualPlayersCount: number = pipe([
        Object.keys,
        size,
      ])(actualPlayers);

      expect(actualPlayersCount).toEqual(expectedPlayersCount);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.nat(),
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
        { minLength: 1, maxLength: 3 },
      );
    }),
  ], {numRuns: 0})(
    "generatePlayerBioDataForListOfClubs",
     (testSeason, testStartingIndex, testCountriesLeaguesClubs) => {
      const testBaseEntities: BaseEntities =
         convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );

      const expectedPlayersCount: number =
        getExpectedPlayersCount(testBaseEntities);

      const actualPlayers: Array<[string, Entity]> =
         generatePlayerBioDataForListOfClubs(
          testStartingIndex,
          testBaseEntities,
        );

      expect(actualPlayers.length).toEqual(expectedPlayersCount);
    },
  );

  test.prop([

    fc.array(
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
      { minLength: 3 },
    ),
  ],{numRuns: 0})("normalizePercentages",  (testPercentages) => {
    const actualPercentages: Array<number> =
      normalizePercentages(testPercentages);
    actualPercentages.forEach((actualPercentage: number) => {
      expect(actualPercentage).toBeGreaterThan(0);
      expect(actualPercentage).toBeLessThan(1);
    });
  });

  test.prop([
    fc.integer({ min: 3, max: 1000 }).chain((minLength: number) => {
      return fc.tuple(
        fc.array(
          fc.double({
            maxExcluded: true,
            noDefaultInfinity: true,
            noNaN: true,
            min: 0.1,
            max: 1,
          }),
          { minLength, maxLength: minLength },
        ),
        fc.array(fc.nat(), { minLength, maxLength: minLength }),
      );
    }),
  ],{numRuns: 0})("weightedMean",  (testPercentagesAndIntegers) => {
    const [testPercentages, testIntegers]: [Array<number>, Array<number>] =
      testPercentagesAndIntegers;
    const [expectedMin, expectedMax] = over([min, max])(testIntegers) as [
      number,
      number,
    ];

    const actualMean: number = weightedMean(testPercentages, testIntegers);
    expect(actualMean).toBeGreaterThanOrEqual(expectedMin);
    expect(actualMean).toBeLessThan(expectedMax);
  });

  test.prop([
    fc.integer({ min: 3, max: 1000 }).chain((minLength: number) => {
      return fc.tuple(
        fc.array(
          fc.double({
            maxExcluded: true,
            noDefaultInfinity: true,
            noNaN: true,
            min: 0.1,
            max: 1,
          }),
          { minLength, maxLength: minLength },
        ),
        fc.array(fc.nat(), { minLength, maxLength: minLength }),
      );
    }),
  ],{numRuns: 0})("weightedRandom",  (testPercentagesAndIntegers) => {
    const [testPercentages, testIntegers]: [Array<number>, Array<number>] =
      testPercentagesAndIntegers;

    const actualChosenNumber: number = weightedRandom([
      testPercentages,
      testIntegers,
    ]);

    const setOfTestIntegers: Set<number> = new Set(testIntegers);
    expect(setOfTestIntegers.has(actualChosenNumber)).toBeTruthy();
    expect(
      testPercentages[testIntegers.indexOf(actualChosenNumber)],
    ).toBeGreaterThan(0);
  });

  test.prop([fc.array(fc.integer({ min: 1 }), { minLength: 2 })],{numRuns: 0})(
    "getRunningSumOfList",
     (testNums) => {
      const actualSummedArray: Array<number> = getRunningSumOfList(testNums);
      const expectedLastValue: number = sum(testNums);

      assert.lengthOf(actualSummedArray, testNums.length);
      expect(head(actualSummedArray)).toEqual(head(testNums));
      expect(last(actualSummedArray)).toEqual(expectedLastValue);
    },
  );

  test.prop([
    fc.array(fc.tuple(fc.string(), fc.integer({ min: 1 })), { minLength: 4 }),
  ],{numRuns: 0})("getRunningSumOfListOfTuples",  (testStringCountTuples) => {
    const actualTuples: Array<[string, number, number]> =
      getRunningSumOfListOfTuples(0, testStringCountTuples);
    const expectedLastValue: number = pipe([
      map(last),
      sum,
    ])(testStringCountTuples);

    assert.lengthOf(actualTuples, testStringCountTuples.length);
    const expectedFirstTuple: [string, number, number] = pipe([
      first,
      ([expectedString, expectedCount]: [string, number]) => [
        expectedString,
        expectedCount,
        expectedCount,
      ],
    ])(testStringCountTuples);
    const expectedLastTuple: [string, number, number] = pipe([
      last,
      ([expectedString, expectedCount]: [string, number]) => [
        expectedString,
        expectedCount,
        expectedLastValue,
      ],
    ])(testStringCountTuples);

    expect(first(actualTuples)).toStrictEqual(expectedFirstTuple);
    expect(last(actualTuples)).toStrictEqual(expectedLastTuple);
  });

  test.prop([
    fc.integer({ min: 5, max: 100 }).chain((rangeMax: number) => {
      return fc.tuple(
        fc.integer({ min: 1, max: rangeMax }),
        fc.constant(rangeMax),
      );
    }),
  ],{numRuns: 0})("simpleModularArithmetic",  (testNumAndRangeMax) => {
    const [testNum, rangeMax]: [number, number] = testNumAndRangeMax;
    const testRangeMax = pipe([multiplyByTwo, minusOne])(rangeMax);
    const testModularAddition = simpleModularArithmetic(addOne);
    const testModularSubtraction = simpleModularArithmetic(minusOne);
    const actualNumberAfterSutraction = testModularSubtraction(
      testRangeMax,
      testNum,
    );
    const actualNumberAfterAddition = testModularAddition(
      testRangeMax,
      testNum,
    );

    map((actualNumber) => {
      expect(actualNumber).toBeGreaterThanOrEqual(0);
      expect(actualNumber).toBeLessThanOrEqual(testRangeMax);
      expect(actualNumber).not.toEqual(testNum);
    })([actualNumberAfterAddition, actualNumberAfterSutraction]);
  });

  test.prop([
    fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1000 })),
  ],{numRuns: 0})("getRandomNumberInRange",  (testRange) => {
    const [expectedMin, expectedMax]: [number, number] = testRange;

    const actualNumber = getRandomNumberInRange(testRange);
    expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
    expect(actualNumber).toBeLessThanOrEqual(expectedMax);
  });

  test.prop([
    fc.array(
      fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 })),
      { minLength: 3 },
    ),
  ],{numRuns: 0})("getUndadjustedAverageStepForASetOfModularRanges",  (testRanges) => {
    const [expectedMin, expectedMax]: [number, number] = over([
      pipe([map(first), min]),
      pipe([map(last), max]),
    ])(testRanges);
    const actualStep: number =
      getUndadjustedAverageStepForASetOfModularRanges(testRanges);
    expect(actualStep).toBeGreaterThan(expectedMin);
    expect(actualStep).toBeLessThan(expectedMax);
  });

  test.prop([
    fc.array(
      fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 })),
      { minLength: 3 },
    ),
    fc.integer({ min: 100, max: 1000 }),
  ], {numRuns: 0})(
    "getAverageModularStepForRangeOfData",
     (testRanges, testPlayerCount) => {
      const actualAdjustedStep: number = getAverageModularStepForRangeOfData(
        testRanges,
        testPlayerCount,
      );
      const unadjustedStep: number =
        getUndadjustedAverageStepForASetOfModularRanges(testRanges);
      expect(actualAdjustedStep).toBeLessThan(unadjustedStep);
    },
  );

  test.prop([
    fc
      .tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 }))
      .chain(([min, max]: [number, number]) => {
        return fc.tuple(
          fc.tuple(
            fc.tuple(fc.constant(min), fc.constant(max)),
            fc.integer({ min, max }),
          ),
          fc.integer({ min, max: min * 3 }),
        );
      }),
  ],{numRuns: 0})("boundedModularAddition",  (testRangeIncreaseAndCurrentNumber) => {
    const [[testRange, testIncrease], testCurrentNumber]: [
      [[number, number], number],
      number,
    ] = testRangeIncreaseAndCurrentNumber;
    const testPartialBoundedModularAdditionFunction = boundedModularAddition(
      testRange,
      testIncrease,
    );
    const actualNumber: number =
      testPartialBoundedModularAdditionFunction(testCurrentNumber);
    const [expectedMin, expectedMax]: [number, number] = testRange;
    expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
    expect(actualNumber).toBeLessThanOrEqual(expectedMax);
  });

  test.prop([
    fc.array(
      fc.tuple(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 51, max: 100 }),
      ),
      { minLength: 3 },
    ),
    fc.integer({ min: 5, max: 10 }),
    fc.integer({ min: 100, max: 1000 }),
  ], {numRuns: 0})(
    "mapModularIncreasersWithTheSameAverageStep",
     (testRanges, testRandomPlusOrMinus, testPlayerCount) => {
      const actualModularIncreasers =
        mapModularIncreasersWithTheSameAverageStep(
          [testRandomPlusOrMinus, testPlayerCount],
          testRanges,
        );

      pipe([
        zipAll,
        map(([[min, max], actualFunction]: [[number, number], Function]) => {
          const actualValue = actualFunction(max);
          assert.isNumber(actualValue);
        }),
      ])([testRanges, actualModularIncreasers]);
    },
  );

  test.prop([
    fc.array(
      fc.tuple(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 51, max: 100 }),
      ),
      { minLength: 3 },
    ),
    fc.integer({ min: 100, max: 1000 }),
  ], {numRuns: 0})(
    "mapModularIncreasersWithDifferentStepsForARange",
     (testRanges, testPlayerCount) => {
      const actualModularIncreasers =
        mapModularIncreasersWithDifferentStepsForARange(
          testPlayerCount,
          testRanges,
        );
      pipe([
        zipAll,
        map(([[min, max], actualFunction]: [[number, number], Function]) => {
          const actualValue = actualFunction(max);
          expect(actualValue).toBeLessThanOrEqual(max);
          expect(actualValue).toBeGreaterThanOrEqual(min);
        }),
      ])([testRanges, actualModularIncreasers]);
    },
  );

  test.prop([fc.integer({ min: 1 })],{numRuns: 0})(
    "getRandomPlusOrMinus",
     (testNumber) => {
      const actualNumber =  getRandomPlusOrMinus(testNumber);
      const expectedMin: number = -1 * testNumber;
      expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
      expect(actualNumber).toBeLessThan(testNumber);
    },
  );

  test.prop([fc.gen(), fc.integer({ min: 2 })],{numRuns: 0})(
    "reverseThenSpreadSubtract",
     (fcGen, testRangeSize) => {
      const actualRange: [number, number] = fastCheckTestLinearRangeGenerator(
        fcGen,
        testRangeSize,
      );
      const actualDifference: number = reverseThenSpreadSubtract(actualRange);
      const expectedDifference: number = addOne(testRangeSize);
      expect(actualDifference).toEqual(expectedDifference);
    },
  );

  test.prop([fc.array(fc.integer({ min: 1 }), { minLength: 2 })],{numRuns: 0})(
    "accumulate",
    (testNums) => {
      const actualSummedArray: Array<number> = accumulate([add, 0], testNums);
      const expectedLastValue: number = sum(testNums);

      expect(actualSummedArray.length).toEqual(testNums.length);
      expect(head(actualSummedArray)).toEqual(head(testNums));
      expect(last(actualSummedArray)).toEqual(expectedLastValue);

      const actualMultipliedArray: Array<number> = accumulate(
        [multiply, 1],
        testNums,
      );
      expect(head(actualMultipliedArray)).toEqual(head(testNums));
      const [firstVal, secondVal] = testNums;
      expect(last(actualMultipliedArray)).toBeGreaterThanOrEqual(
        multiply(firstVal, secondVal),
      );
    },
  );
  test.prop([
    fc
      .uniqueArray(fc.integer({ min: 0, max: COUNTOFPLAYERSKILLS }), {
        minLength: 5,
        maxLength: 25,
      })
      .chain((nums: Array<number>) => {
        return fc.constant(convertArrayOfIntegersIntoArrayOfStrings(nums));
      }),
    fc.tuple(
      fc.string(),
      fc.array(fc.nat({ max: 100 }), { minLength: 21, maxLength: 21 }),
    ),
  ], {numRuns: 0})(
    "calculateMeanCategoryStrengthForPlayer",
     (testSkills, testPlayer) => {
      const testCalculateMeanCategoryStrengthForPlayer =
        calculateMeanCategoryStrengthForPlayer(testSkills);

      const actualMeanCategoryStrength: number =
        testCalculateMeanCategoryStrengthForPlayer(testPlayer);

      const [expectedMin, expectedMax] = pipe([
        last,
        over([min, max]),
      ])(testPlayer);
      expect(actualMeanCategoryStrength).toBeGreaterThanOrEqual(expectedMin);
      expect(actualMeanCategoryStrength).toBeLessThanOrEqual(expectedMax);
    },
  );

  test.prop([
    fc
      .uniqueArray(fc.integer({ min: 0, max: COUNTOFPLAYERSKILLS }), {
        minLength: 5,
        maxLength: 25,
      })
      .chain((nums: Array<number>) => {
        return fc.constant(convertArrayOfIntegersIntoArrayOfStrings(nums));
      }),
    fc.array(
      fc.tuple(
        fc.string(),
        fc.array(fc.nat({ max: 100 }), { minLength: 21, maxLength: 21 }),
      ),
      { minLength: 11, maxLength: 11 },
    ),
  ], {numRuns: 0})(
    "calculateMeanCategoryStrengthForGroupOfPlayers",
     (testSkills, testPlayers) => {
      const testCalculateMeanCategoryStrength =
        calculateMeanCategoryStrengthForGroupOfPlayers(testSkills);
      const actualMeanCategoryStrength: number =
        testCalculateMeanCategoryStrength(testPlayers);
      const meanCalculator = pipe([at(testSkills), mean]);
      const [expectedMin, expectedMax] = pipe([
        map(last),
        map(meanCalculator),
        over([min, max]),
      ])(testPlayers);
      expect(actualMeanCategoryStrength).toBeGreaterThanOrEqual(expectedMin);
      expect(actualMeanCategoryStrength).toBeLessThanOrEqual(expectedMax);
    },
  );

  test.prop([fc.gen()],{numRuns: 0})("calculateDefenseStrength",  (fcGen) => {
    const testPlayers: Record<
      string,
      Array<number>
    > =  generateTestStartingEleven(fcGen);
    const actualDefenseStrength: number =
       calculateDefenseStrength(testPlayers);
    expect(actualDefenseStrength).toBeGreaterThan(0);
    expect(actualDefenseStrength).toBeLessThan(100);
  });

  test.prop([fc.gen()],{numRuns: 0})("calculateAttackStrength",  (fcGen) => {
    const testPlayers: Record<
      string,
      Array<number>
    > =  generateTestStartingEleven(fcGen);
    const actualAttackStrength: number =
       calculateAttackStrength(testPlayers);
    expect(actualAttackStrength).toBeGreaterThan(0);
    expect(actualAttackStrength).toBeLessThan(100);
  });

  test.prop([fc.gen()],{numRuns: 0})("calculateClubStrength",  (fcGen) => {
    const testPlayers: Record<
      string,
      Array<number>
    > =  generateTestStartingEleven(fcGen);
    const actualStrengths: Array<number> =
       calculateClubStrengths(testPlayers);
    expect(actualStrengths.length).toEqual(2);
    map((actualStrength: number) => {
      expect(actualStrength).toBeGreaterThan(0);
      expect(actualStrength).toBeLessThan(100);
    })(actualStrengths);
  });

  test.prop([
    fc.tuple(
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
    ),
  ], {numRuns: 0})("calculateHomeStrength",  (testHomeAttackAndAwayDefense) => {
    const actualHomeStrength: number = calculateHomeStrength(
      testHomeAttackAndAwayDefense,
    );
    expect(actualHomeStrength).toBeGreaterThan(0);
    expect(actualHomeStrength).toBeLessThan(1);
  });

  test.prop([
    fc.tuple(
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
    ),
  ], {numRuns: 0})("calculateAwayStrength",  (testAwayAttackAndHomeDefense) => {
    const actualAwayStrength: number = calculateAwayStrength(
      testAwayAttackAndHomeDefense,
    );
    expect(actualAwayStrength).toBeGreaterThan(0);
    expect(actualAwayStrength).toBeLessThan(1);
  });

  test.prop([fc.tuple(fc.gen(), fc.gen())],{numRuns: 0})(
    "calculateMatchStrengths",
     (fcGens) => {
      const testStartingElevens =  generateTwoTestStartingElevens(fcGens);

      const actualStrengths: [number, number] =
         calculateMatchStrengths(testStartingElevens);

      expect(actualStrengths.length).toBe(2);
      const [actualHomeStrength, actualAwayStrength] = actualStrengths;

      expect(actualHomeStrength).not.toEqual(actualAwayStrength);

      map((actualStrength: number) => {
        expect(actualStrength).toBeGreaterThan(0);
        expect(actualStrength).toBeLessThan(1);
      })(actualStrengths);
    },
  );

  test.prop([
    fc.double({
      noDefaultInfinity: true,
      noNaN: true,
      min: 0.1,
      max: 2,
    }),
    fc.double({
      maxExcluded: true,
      noDefaultInfinity: true,
      noNaN: true,
      min: 0.1,
      max: 1,
    }),
    fc.nat({ max: 5 }),
  ], {numRuns: 0})("weibullCDFGoals",  (testShape, testClubStrength, testGoals) => {
    const testWeibullCDFGoals = weibullCDFGoals(testShape);
    const actualCDF: number =  testWeibullCDFGoals(
      testClubStrength,
      testGoals,
    );

    expect(actualCDF).toBeGreaterThan(0);
    expect(actualCDF).toBeLessThan(1);
  });

  test.prop([
    fc.double({
      maxExcluded: true,
      noDefaultInfinity: true,
      noNaN: true,
      min: 0.1,
      max: 1,
    }),
  ], {numRuns: 0})("weibullCDFGoalsList",  (testClubStrength) => {
    const actualCDFGoalsList: Array<number> =
       weibullCDFGoalsList(testClubStrength);
    expect(actualCDFGoalsList.length).toEqual(POSSIBLEGOALS.length);
  });

  test.prop([
    fc.double({
      maxExcluded: true,
      noDefaultInfinity: true,
      noNaN: true,
      min: 0.1,
      max: 1,
    }),
    fc.tuple(
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
    ),
  ], {numRuns: 0})("calculateJointProbability",  (testTheta, testProbabilities) => {
    const testCalculateJointProbability = calculateJointProbability(testTheta);
    const actualJointProbability: number =
       testCalculateJointProbability(testProbabilities);
    expect(actualJointProbability).toBeGreaterThan(0);
    expect(actualJointProbability).toBeLessThan(1);
  });

  test.prop([fc.tuple(fc.gen(), fc.gen())],{numRuns: 0})(
    "createJointProbabilitiesMatrixForGoals",
     (fcGens) => {
      const getTestWeibullCDFGoalsList = pipe([
        generateTwoTestStartingElevens,
        calculateMatchStrengths,
        map(weibullCDFGoalsList)
      ]);
      const testWeibullCDFGoalsList: [Array<number>, Array<number>] =
         getTestWeibullCDFGoalsList(fcGens);

      const actualProbabilitiesGoalsTuples: Array<[number, [number, number]]> =
         createJointProbabilitiesMatrixForGoals(testWeibullCDFGoalsList);

      const [actualProbabilities, actualScores]: [
        Array<number>,
        Array<[number, number]>,
      ] = zipAll(actualProbabilitiesGoalsTuples);
      const expectedPossibleScores: Array<[number, number]> = fastCartesian([
        POSSIBLEGOALS,
        POSSIBLEGOALS,
      ]);

      const [actualSum, expectedSum] = map(getSumOfFlattenedArray)([
        expectedPossibleScores,
        actualScores,
      ]);

      expect(actualSum).toEqual(expectedSum);
    },
  );

  test.prop([fc.tuple(fc.gen(), fc.gen())],{numRuns: 0})(
    "generateMatchGoals",
     (fcGens) => {
      const testStartingElevens: Array<
        [number, Record<string, Array<number>>]
      > =  generateTwoTestStartingElevenTuples(fcGens);

      const actualTuples: [
        [Record<string, Array<number>>, Record<string, Array<number>>],
        [number, number],
      ] =  generateMatchGoals(testStartingElevens);

      const [, [actualHomeGoals, actualAwayGoals]] = actualTuples;
      const [expectedMin, expectedMax]: [number, number] = over([min, max])(
        POSSIBLEGOALS,
      ) as [number, number];

      map((actualGoalsScored: number) => {
        expect(actualGoalsScored).toBeGreaterThanOrEqual(expectedMin);
        expect(actualGoalsScored).toBeLessThanOrEqual(expectedMax);
      })([actualHomeGoals, actualAwayGoals]);
    },
  );

  test.prop([fc.gen()],{numRuns: 0})("assignRandomScorer",  (fcGen) => {
    const testPlayers: Record<
      string,
      Array<number>
    > =  generateTestStartingEleven(fcGen);
    const expectedPlayerSets: Set<string> =
      convertObjectKeysIntoSet(testPlayers);
    const actualScorer: string = assignRandomScorer(testPlayers);
    expect(expectedPlayerSets.has(actualScorer)).toBeTruthy();
  });

  test.prop([fc.tuple(fc.gen(), fc.gen())], { numRuns: 0 })(
    "generateMatchScorers",
     (fcGens) => {
      const testStartingElevensAndMatchResult: [
        [Record<string, Array<number>>, Record<string, Array<number>>],
        [number, number],
      ] =  pipe([
        generateTwoTestStartingElevenTuples,
        generateMatchGoals,
      ])(fcGens);
      const actualMatchStatisticsAndScore: [
        [Record<string, Array<number>>, Record<string, Array<number>>],
        [number, number],
      ] =  generateMatchScorers(testStartingElevensAndMatchResult);

      const actualZippedStatsAndScoreTuples = zipAll(
        actualMatchStatisticsAndScore,
      );

      map(
        ([actualStats, actualScore]: [
          Record<string, Array<number>>,
          number,
        ]) => {
          const actualSumOfStats: number = pipe([
            Object.values,
            flatten,
            sum,
          ])(actualStats);
          expect(actualSumOfStats).toEqual(actualScore);
        },
      )(actualZippedStatsAndScoreTuples);
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })],{numRuns: 0})(
    "convertIntegerYearToDate",
     (testYear) => {
      const actualDate: Date = convertIntegerYearToDate(testYear);
      expect(actualDate.getFullYear()).toEqual(testYear);
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })],{numRuns: 0})(
    "getThirdSundayOfAugust",
     (testYear) => {
      // need a constant AUGUST and JANPLUSAUGUST
      const actualDate: Date = getThirdSundayOfAugust(testYear);
      const asserter = overEvery([
        isSunday,
        pipe([getWeekOfMonth, isEqual(4)]),
        isSameMonth(new Date(testYear, AUGUST, 1)),
        isSameYear(new Date(testYear, 0, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })],{numRuns: 0})(
    "getLastDayOfAugust",
     (testYear) => {
      const actualDate: Date = getLastDayOfAugust(testYear);
      const asserter = overEvery([
        isSameMonth(new Date(testYear, AUGUST)),
        isSameYear(new Date(testYear, 0, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })],{numRuns: 0})(
    "getLastDayOfJuneOfNextYear",
     (testYear) => {
      const actualDate: Date = getLastDayOfJuneOfNextYear(testYear);
      const asserter = overEvery([
        isSameMonth(new Date(testYear + 1, JUNE)),
        isSameYear(new Date(testYear + 1, 0, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })],{numRuns: 0})(
    "getFirstMondayOfFebruaryOfNextYear",
     (testYear) => {
      const actualDate: Date = getFirstMondayOfFebruaryOfNextYear(testYear);
      const asserter = overEvery([
        isMonday,
        isSameMonth(new Date(testYear + 1, FEBRUARY)),
        isSameYear(new Date(testYear + 1, 0, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })],{numRuns: 0})(
    "getJuneFifteenOfNextYear",
     (testYear) => {
      const actualDate: Date = getJuneFifteenOfNextYear(testYear);
      const asserter = overEvery([
        isSameMonth(new Date(testYear + 1, JUNE)),
        isSameYear(new Date(testYear + 1, 0, 1)),
        isSameDay(new Date(testYear + 1, JUNE, 15)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })],{numRuns: 0})(
    "getStartOfNextYear",
     (testYear) => {
      const actualDate: Date = getStartOfNextYear(testYear);
      const asserter = overEvery([
        isSameMonth(new Date(testYear + 1, JANUARY)),
        isSameYear(new Date(testYear + 1, JANUARY, 1)),
        isSameDay(new Date(testYear + 1, JANUARY, 1)),
      ]);
      expect(asserter(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.integer({ min: 2000, max: 2100 })],{numRuns: 0})(
    "createSeasonWindows",
     (testSeason) => {
      const testStartsAndEnds: Array<Date> = over([
        getThirdSundayOfAugust,
        getLastDayOfAugust,
        pipe([getLastDayOfAugust, addOneDay]),
        pipe([getStartOfNextYear, subOneDay]),
        getStartOfNextYear,
        getFirstMondayOfFebruaryOfNextYear,
        pipe([getFirstMondayOfFebruaryOfNextYear, addOneDay]),
        pipe([getJuneFifteenOfNextYear, subOneDay]),
        getJuneFifteenOfNextYear,
        getLastDayOfJuneOfNextYear,
      ])(testSeason) as Array<Date>;

      const testDates: Array<Date> = pipe([
        chunk(2),
        map(([start, end]: [Date, Date]) => {
          return {
            start,
            end,
          };
        }),
        map(pipe([eachDayOfInterval, sample]))
      ])(testStartsAndEnds);

      const listOfExpectedBooleanValues: Array<Array<boolean>> = [
        [true, false, false, false, false],
        [false, false, true, false, false],
        [false, false, false, false, true],
      ];

      const testFunctionTuples: Array<
        [(season: number) => Date, (season: number) => Date]
      > = [
        [getThirdSundayOfAugust, getLastDayOfAugust],
        [getStartOfNextYear, getFirstMondayOfFebruaryOfNextYear],
        [getJuneFifteenOfNextYear, getLastDayOfJuneOfNextYear],
      ];

      const actualTransferWindowFunctions = createSeasonWindows(
        testFunctionTuples,
        testSeason,
      );

      const asserter = (
        testFunction: (date: Date) => boolean,
        testDate: Date,
        expectedValue: boolean,
      ) => {
        if (!testFunction(testDate)) {
        }
        expect(testFunction(testDate)).toBe(expectedValue);
      };
      pipe([
        map((expectedBooleanValues: Array<boolean>) =>
          zip(testDates, expectedBooleanValues),
        ),
        zip(actualTransferWindowFunctions),
        map(
          ([testFunction, testDateAndExpectedValues]: [
            (date: Date) => boolean,
            Array<[Date, boolean]>,
          ]) => {
            map(([testDate, expectedValue]: [Date, boolean]) => {
              asserter(testFunction, testDate, expectedValue);
            })(testDateAndExpectedValues);
          },
        ),
      ])(listOfExpectedBooleanValues);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }).chain((testSeason: number) => {
      return fc.tuple(
        fc.date({
          min: getThirdSundayOfAugust(testSeason),
          max: getLastDayOfJuneOfNextYear(testSeason),
        }),
        fc.constant(testSeason),
        fc.constant(getLastDayOfJuneOfNextYear(testSeason)),
      );
    }),
  ], {numRuns: 0})(
    "isTransferWindowOpen",
     (testDateTestSeasonAndExpectedSeasonEndDate) => {
      const [testDate, testSeason, expectedSeasonEndDate]: [
        Date,
        number,
        Date,
      ] = testDateTestSeasonAndExpectedSeasonEndDate;
      const testFunctionTuples: Array<
        [(season: number) => Date, (season: number) => Date]
      > = [
        [getThirdSundayOfAugust, getLastDayOfAugust],
        [getStartOfNextYear, getFirstMondayOfFebruaryOfNextYear],
        [getJuneFifteenOfNextYear, getLastDayOfJuneOfNextYear],
      ];
      const testDefaultIsTransferWindowOpen =
        isTransferWindowOpen(testFunctionTuples);
      const actualResult: boolean = testDefaultIsTransferWindowOpen([
        testSeason,
        testDate,
      ]);
      expect(actualResult).toBeTypeOf("boolean");
      expect(defaultIsTransferWindowOpen([testSeason, testDate])).toBeTypeOf(
        "boolean",
      );
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }).chain((testSeason: number) => {
      return fc.tuple(
        fc.date({
          min: getThirdSundayOfAugust(testSeason),
          max: getLastDayOfJuneOfNextYear(testSeason),
        }),
        fc.constant(testSeason),
        fc.constant(getLastDayOfJuneOfNextYear(testSeason)),
      );
    }),
  ], {numRuns: 0})(
    "getDaysLeftInCurrentSeason",
     (testDateTestSeasonAndExpectedSeasonEndDate) => {
      const [testDate, testSeason, expectedSeasonEndDate]: [
        Date,
        number,
        Date,
      ] = testDateTestSeasonAndExpectedSeasonEndDate;
      const actualDaysLeft: number = getDaysLeftInCurrentSeason(
        testSeason,
        testDate,
      );
      const testDatePlusActualDaysLeft: Date =
        addDays(actualDaysLeft)(testDate);
      pipe([map(format("MM/dd/yyyy")), ([actual, expected]: [Date, Date]) =>
        expect(isDateEqual(actual, expected)).toBeTruthy(),
      ])([testDatePlusActualDaysLeft, expectedSeasonEndDate]);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }).chain((testSeason: number) => {
      return fc.tuple(
        fc.date({
          min: getThirdSundayOfAugust(testSeason),
          max: getJuneFifteenOfNextYear(testSeason),
        }),
        fc.constant(getLastDayOfJuneOfNextYear(testSeason)),
      );
    }),
  ], {numRuns: 0})(
    "getNextDomesticMatchDayDate",
     (testDateAndExpectedSeasonEndDate) => {
      const [testDate, expectedSeasonEndDate]: [Date, Date] =
        testDateAndExpectedSeasonEndDate;
      const actualDate: Date = getNextDomesticMatchDayDate(testDate);
      const asserters = overEvery([
        isSunday,
        isWithinInterval({
          start: testDate,
          end: expectedSeasonEndDate,
        }),
      ]);
      expect(asserters(actualDate)).toBeTruthy();
    },
  );

  test.prop([fc.constantFrom(...rangeStep(2, 18, 100))],{numRuns: 0})(
    "matchesPerRoundOfRoundRobin",
     (testClubsCount) => {
      const actualMatchesPerRound: number =
        matchesPerRoundOfRoundRobin(testClubsCount);
      expect(actualMatchesPerRound).toEqual(testClubsCount / 2);
    },
  );

  test.prop([fc.constantFrom(...rangeStep(2, 18, 100))],{numRuns: 0})(
    "firstWeekOfRoundRobinWithEvenNumberClubs",
     (testClubsCount) => {
      const [actualClubsCount, actualMatches]: [
        number,
        Array<[number, number]>,
      ] = firstWeekOfRoundRobinWithEvenNumberClubs(testClubsCount);
      expect(actualClubsCount).toEqual(testClubsCount);
      const actualSum: number = pipe([flatten, sum])(actualMatches);
      const expectedSum: number = pipe([range(0), sum])(testClubsCount);
      expect(actualSum).toEqual(expectedSum);
    },
  );

  test.prop([fc.constantFrom(...rangeStep(2, 18, 100))],{numRuns: 0})(
    "everyWeekAfterFirstWeekofRoundRobin",
     (testClubsCount) => {
      const testClubsCountAndFirstRound: [number, Array<[number, number]>] =
        firstWeekOfRoundRobinWithEvenNumberClubs(testClubsCount);
      const actualFullSchedule: Array<Array<[number, number]>> =
        everyWeekAfterFirstWeekofRoundRobin(testClubsCountAndFirstRound);

      const actualRoundsSet = new Set(actualFullSchedule);
      const expectedRounds = totalRoundRobinRounds(testClubsCount);
      expect(actualRoundsSet.size).toEqual(expectedRounds);

      const actualMatchupsSet = pipe([
        flatten,
        convertToSet,
      ])(actualFullSchedule);
      const expectedTotalMatches = totalRoundRobinMatches(testClubsCount);
      expect(actualMatchupsSet.size).toEqual(expectedTotalMatches);

      map((actualMatches) => {
        const actualSum: number = pipe([flatten, sum])(actualMatches);
        const expectedSum: number = pipe([range(0), sum])(testClubsCount);
        expect(actualSum).toEqual(expectedSum);
      })(actualFullSchedule);
    },
  );

  test.prop([fc.constantFrom(...rangeStep(2, 18, 100))],{numRuns: 0})(
    "roundRobinScheduler",
     (testClubsCount) => {
      const actualSchedule: Array<Array<[number, number]>> =
        roundRobinScheduler(testClubsCount);
      const expectedRounds: number = totalRoundRobinRounds(testClubsCount);
      expect(actualSchedule.length).toEqual(expectedRounds);
      const expectedMatchesCount: number =
        totalRoundRobinMatches(testClubsCount);
      const actualMatchesCount: number = pipe([
        flatten,
        size,
      ])(actualSchedule);
      expect(actualMatchesCount).toEqual(expectedMatchesCount);
    },
  );

  test.prop([fc.constantFrom(...rangeStep(2, 18, 100))],{numRuns: 0})(
    "doubleRoundRobinScheduler",
     (testClubsCount) => {
      const actualSchedule: Array<Array<[number, number]>> =
        doubleRoundRobinScheduler(testClubsCount);
      const expectedRounds: number =
        totalDoubleRoundRobinRounds(testClubsCount);
      expect(actualSchedule.length).toEqual(expectedRounds);

      const expectedMatchesCount: number =
        totalDoubleRoundRobinMatches(testClubsCount);
      const actualMatchesSet: Set<[number, number]> = pipe([
        flatten,
        convertToSet,
      ])(actualSchedule);
      expect(actualMatchesSet.size).toEqual(expectedMatchesCount);
    },
  );
});
