import { fc } from "@fast-check/vitest";
import {
  curry,
  over,
  add,
  zip,
  partialRight,
  pipe,
  multiply,
  chunk,
  first,
  zipAll,
  property,
  flatten,
  join,
  toString,
  identity,
  map,
  shuffle,
  sortBy,
  groupBy,
  mapValues,
  last,
  sum,
  size,
  concat,
  subtract,
  update,
  zipWith,
} from "lodash/fp";
import { Option, fromNullable } from "fp-ts/Option";
import { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";
import {
  State,
  traverseReadonlyNonEmptyArrayWithIndex as StateTraverseReadonlyNonEmptyArrayWithIndex,
  evaluate as evaluateState,
  traverseArray as StateTraverseReadonlyNonEmptyArray,
} from "fp-ts/State";
import {
  BaseCountries,
  SaveOptions,
  MatchResult,
  PlayerMatchLog,
  MatchResultsTuple,
  PlayerMatchLogs,
  MatchLog,
  Player,
  Club,
  SaveArguments
} from "./Types";
import { POSITIONGROUPSRANGE, PLAYERBIODATA } from "./PlayerDataConstants";
import {
  BASECOUNTRIES,
  DEFAULTCLUBSPERDOMESTICLEAGUE,
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
  DEFAULTPLAYERSONBENCH,
  DEFAULTDOMESTICLEAGUESPERCOUNTRYNUMBERRANGE,
  NONSPACESCHARACTERRANGE,
  TESTRANDOMSEASONRANGE,
  DOUBLEBETWEENZEROAND1RANGE,
  TESTROUNDROBINCLUBSRANGE,
  BaseCountriesIndices,
  DEFAULTTOTALPLAYERS,
  DEFAULTTOTALCLUBS,
  DEFAULTSQUADSIZE,
  DEFAULTTOTALDOMESTICLEAGUES,
  DEFAULTMATCHESPERDOMESTICLEAGUE,
  DEFAULTMATCHLENGTH,
  DEFAULTMATCHPERWEEKPERDOMESTICLEAGUE,
} from "./Constants";
import {
  getFirstLevelArrayLengths,
  getCountryNameFromBaseCountries,
  getDomesticLeagueNameFromBaseCountries,
  getClubNameFromBaseCountries,
} from "./Getters";
import {
  unfold,
  unfoldAndShuffleArray,
  nonZeroBoundedModularAddition,
  minusOne,
  addMinusOne,
  convertRangeSizeAndMinIntoRange,
  mapFlatten,
  convertCharacterCodeIntoCharacter,
  convertArrayOfArraysIntoShuffledArray,
  zipApply,
  joinOnUnderscores,
  zipAllAndGetFirstArray,
  multiplyByDEFAULTDOMESTICLEAGUESPERCOUNTRY,
  multiplyByDEFAULTCLUBSPERCOUNTRY,
  multiplyByDEFAULTPLAYERSPERCOUNTRY,
  simpleModularArithmetic,
  addOne,
  unfoldItemCountTuplesIntoMixedArray,
  generateClubFirstSeasonPlayersWithTransform,
  floorDivision,
  convertClubRelativeNumberIntoAbsoluteNumber,
  createScheduleForRoundOfDoubleRobinRound,
  generateClubStartingPlayerNumbers,
  domesticLeagueNumberRepeaterForClubs,
  modularAddition,
  createPlayer,
  createClub,
} from "./Transformers";

export const fastCheckNRandomItemsFromArray = curry(
  <T>(count: number, fcGen: fc.GeneratorValue, array: Array<T>): Array<T> => {
    return fcGen(fc.shuffledSubarray, array, {
      minLength: count,
      maxLength: count,
    });
  },
);

export const fastCheckRandomItemFromArray = curry(
  <T>(fcGen: fc.GeneratorValue, testArray: Array<T>): fc.Arbitrary<T> => {
    return fcGen(fc.constantFrom, ...shuffle(testArray));
  },
);

export const fastCheckGetTwoRandomItemsFromArray =
  fastCheckNRandomItemsFromArray(2);

export const fastCheckRandomObjectKey = curry(
  (fcGen: fc.GeneratorValue, object: Record<string, any>): string => {
    return pipe([Object.keys, fastCheckRandomItemFromArray(fcGen)])(object);
  },
);

export const fastCheckRandomObjectValue = curry(
  (fcGen: fc.GeneratorValue, object: Record<string, any>): string => {
    return pipe([Object.values, fastCheckRandomItemFromArray(fcGen)])(object);
  },
);

export const fastCheckNRandomArrayIndicesAsIntegers = curry(
  (
    count: number,
    fcGen: fc.GeneratorValue,
    array: Array<any>,
  ): Array<number> => {
    return pipe([
      Object.keys,
      fastCheckNRandomItemsFromArray(count, fcGen),
      map(parseInt),
    ])(array);
  },
);

export const fastCheckGetRandomArrayChunk = curry(
  <T>(
    fcGen: fc.GeneratorValue,
    [testArray, testChunkSize]: [Array<T>, number],
  ): fc.Arbitrary<T> => {
    return pipe([
      chunk(testChunkSize),
      fastCheckRandomItemFromArrayWithIndex(fcGen),
    ])(testArray);
  },
);

export const fastCheckRandomInteger = (fcGen: fc.GeneratorValue) =>
  fcGen(fc.integer);

export const fastCheckRandomIntegerInRange = curry(
  (
    fcGen: fc.GeneratorValue,
    [rangeMin, rangeMax]: [number, number],
  ): number => {
    return fcGen(fc.integer, { min: rangeMin, max: minusOne(rangeMax) });
  },
);
export const fastCheckRandomIntegerBetweenZeroAnd = curry(
  (fcGen: fc.GeneratorValue, rangeMax: number): number => {
    return pipe([concat([0]), fastCheckRandomIntegerInRange(fcGen)])(rangeMax);
  },
);

export const fastCheckRandomIntegerBetweenOneAnd = curry(
  (fcGen: fc.GeneratorValue, rangeMax: number): number => {
    return pipe([concat([1]), fastCheckRandomIntegerInRange(fcGen)])(rangeMax);
  },
);

export const fastCheckRandomIntegerBetweenTwoAnd = curry(
  (fcGen: fc.GeneratorValue, rangeMax: number): number => {
    return pipe([concat([2]), fastCheckRandomIntegerInRange(fcGen)])(rangeMax);
  },
);

export const fastCheckOneRandomArrayIndexAsInteger = curry(
  (fcGen: fc.GeneratorValue, array: Array<any>): number => {
    return pipe([size, concat([0]), fastCheckRandomIntegerInRange(fcGen)])(
      array,
    );
  },
);

export const fastCheckRandomItemFromArrayWithIndex = curry(
  <T>(fcGen: fc.GeneratorValue, testArray: Array<T>): [T, number] => {
    return pipe([
      fastCheckOneRandomArrayIndexAsInteger(fcGen),
      over([partialRight(property, [testArray]), identity]),
    ])(testArray);
  },
);

export const fastCheckCallRandomFCGen = curry(
  <T>(
    arrayOfFCGens: Array<(fcGen: fc.GeneratorValue) => T>,
    fcGen: fc.GeneratorValue,
  ): T => {
    // shuffledSubarray causes issues when given arrays of functions
    const index: number = fastCheckOneRandomArrayIndexAsInteger(
      fcGen,
      arrayOfFCGens,
    );
    return arrayOfFCGens[index](fcGen);
  },
);

export const fastCheckRandomArrayChunkSize = curry(
  <T>(fcGen: fc.GeneratorValue, array: Array<T>): number => {
    return pipe([size, concat([1]), fastCheckRandomIntegerInRange(fcGen)])(
      array,
    );
  },
);

export const fastCheckUnfoldRandomRangeChunk = curry(
  <T>(
    range: [number, number],
    chunkSize: number,
    unfolder: <T>(index: number) => T,
    fcGen: fc.GeneratorValue,
  ): fc.Arbitrary<T> => {
    return pipe([
      zipApply([identity, partialRight(subtract, [chunkSize])]),
      fastCheckRandomIntegerInRange(fcGen),
      (start: number) => pipe([add(start), unfolder]),
      partialRight(unfold, [chunkSize]),
    ])(range);
  },
);

export const fastCheckUnfoldRandomNaturalNumberRangeChunk = curry(
  <T>(
    rangeMax: number,
    chunkSize: number,
    unfolder: <T>(index: number) => T,
    fcGen: fc.GeneratorValue,
  ): fc.Arbitrary<T> => {
    return fastCheckUnfoldRandomRangeChunk(
      [0, rangeMax],
      chunkSize,
      unfolder,
      fcGen,
    );
  },
);

export const fastCheckGetNRandomClubNumbers = curry(
  (
    testCount: number,
    fcGen: fc.GeneratorValue,
  ): ReadonlyNonEmptyArray<number> => {
    return fastCheckUnfoldRandomNaturalNumberRangeChunk(
      DEFAULTTOTALCLUBS,
      testCount,
      addOne,
      fcGen,
    );
  },
);

export const fastCheckGetAllPlayersOfNRandomClubs = curry(
  (
    testCount: number,
    fcGen: fc.GeneratorValue,
  ): ReadonlyNonEmptyArray<[number, ReadonlyNonEmptyArray<number>]> => {
    return pipe([
      fastCheckGetNRandomClubNumbers(testCount),
      map(
        over([identity, generateClubFirstSeasonPlayersWithTransform(identity)]),
      ),
    ])(fcGen);
  },
);

export const fastCheckGetAllPlayersOfTwoRandomClubs =
  fastCheckGetAllPlayersOfNRandomClubs(2);

export const fastCheckGenerateAllPlayerNumbersOfRandomClub = curry(
  <T>(
    transformer: <T>(index: number) => T,
    fcGen: fc.GeneratorValue,
  ): fc.Arbitrary<T> => {
    return pipe([
      fastCheckRandomClubNumberGenerator,
      generateClubFirstSeasonPlayersWithTransform(transformer),
    ])(fcGen);
  },
);

export const fastCheckNRandomArrayIndicesAsStrings = curry(
  <T>(
    fcGen: fc.GeneratorValue,
    count: number,
    array: Array<T>,
  ): Array<string> => {
    return fcGen(fc.shuffledSubarray, Object.keys(array), {
      minLength: count,
      maxLength: count,
    });
  },
);

export const fastCheckRandomNaturalNumberWithMax = curry(
  (max: number, fcGen: fc.GeneratorValue): number => {
    return fcGen(fc.nat, { max });
  },
);

export const fastCheckRandomFloatBetweenZeroAndOne = (
  fcGen: fc.GeneratorValue,
): number => {
  return fcGen(fc.float, {
    noDefaultInfinity: true,
    noNaN: true,
    min: Math.fround(0.1),
    max: Math.fround(0.99),
  });
};

export const fastCheckArrayOfNFloatsBetweenZeroAndOne = (
  fcGen: fc.GeneratorValue,
  floatCount: number,
): Array<number> => {
  return unfold((_: number) => fastCheckRandomFloatBetweenZeroAndOne(fcGen))(
    floatCount,
  );
};

export const fastCheckRandomDoubleInRange = curry(
  ([min, max]: [number, number], fcGen: fc.GeneratorValue): number => {
    return fcGen(fc.double, {
      maxExcluded: true,
      noDefaultInfinity: true,
      noNaN: true,
      min,
      max,
    });
  },
);

export const fastCheckRandomDoubleBetweenZeroAndOne =
  fastCheckRandomDoubleInRange(DOUBLEBETWEENZEROAND1RANGE);

export const fastCheckNLengthArrayOfDoublesInRange = curry(
  (
    range: [number, number],
    arrayLength: number,
    fcGen: fc.GeneratorValue,
  ): Array<number> => {
    return unfold(
      (_: number) => fastCheckRandomDoubleInRange(range, fcGen),
      arrayLength,
    );
  },
);

export const fastCheckNLengthArrayOfDoublesBetweenZeroAndOne =
  fastCheckNLengthArrayOfDoublesInRange(DOUBLEBETWEENZEROAND1RANGE);

export const fastCheckRandomEvenIntegerInRange = curry(
  (
    [rangeMin, rangeMax]: [number, number],
    fcGen: fc.GeneratorValue,
  ): number => {
    const int: number = fcGen(fc.integer, {
      min: rangeMin,
      max: minusOne(rangeMax),
    });
    return int % 2 == 0 ? int : int + 1;
  },
);

export const fastCheckRandomRoundRobinClubsCount =
  fastCheckRandomEvenIntegerInRange(TESTROUNDROBINCLUBSRANGE);

export const fastCheckRandomSeason = partialRight(
  fastCheckRandomIntegerInRange,
  [TESTRANDOMSEASONRANGE],
);

export const fastCheckRandomDomesticLeagueNumber =
  fastCheckRandomNaturalNumberWithMax(DEFAULTTOTALDOMESTICLEAGUES);

export const fastCheckRandomClubNumberGenerator =
  fastCheckRandomNaturalNumberWithMax(DEFAULTTOTALCLUBS);

export const fastCheckPlayerNumberGenerator =
  fastCheckRandomNaturalNumberWithMax(DEFAULTTOTALPLAYERS);

export const fastCheckRandomSquadNumber =
  fastCheckRandomNaturalNumberWithMax(DEFAULTSQUADSIZE);

export const fastCheckRandomMatchNumber = fastCheckRandomNaturalNumberWithMax(
  DEFAULTMATCHPERWEEKPERDOMESTICLEAGUE,
);

export const fastCheckTestPlayerNumberAndSeason = over<number>([
  fastCheckPlayerNumberGenerator,
  fastCheckRandomSeason,
]);

export const fastCheckTestSeasonAndClubNumber = over([
  fastCheckRandomClubNumberGenerator,
  fastCheckRandomSeason,
]);

export const fastCheckRandomMatchWeekNumber =
  fastCheckRandomNaturalNumberWithMax(
    minusOne(DEFAULTMATCHESPERDOMESTICLEAGUE),
  );

export const fastCheckRandomSeasonDomesticLeagueNumberAndMatchWeekNumber = over(
  [
    fastCheckRandomSeason,
    fastCheckRandomDomesticLeagueNumber,
    fastCheckRandomMatchWeekNumber,
  ],
);

export const fastCheckRandomSeasonDomesticLeagueNumberAndMatchNumber = over([
  fastCheckRandomSeason,
  fastCheckRandomDomesticLeagueNumber,
  fastCheckRandomMatchNumber,
]);

export const fastCheckRandomSeasonDomesticLeagueNumberMatchWeekAndMatchNumber =
  over([
    fastCheckRandomSeason,
    fastCheckRandomDomesticLeagueNumber,
    fastCheckRandomMatchWeekNumber,
    fastCheckRandomMatchNumber,
  ]);

export const fastCheckCreateNTestPlayers = curry(
  (testPlayersCount: number, fcGen: fc.GeneratorValue): Array<Player> => {
    const firstPlayerNumber: number = fastCheckPlayerNumberGenerator(fcGen);
    return unfold(
      pipe([add(firstPlayerNumber), createPlayer]),
      testPlayersCount,
    );
  },
);

export const fastCheckCreateNTestClubs = curry(
  (testClubsCount: number, fcGen: fc.GeneratorValue): Array<Club> => {
    const firstClubNumber: number = fastCheckRandomClubNumberGenerator(fcGen);
    return unfold(pipe([add(firstClubNumber), createClub]), testClubsCount);
  },
);

export const fastCheckRandomClubAndPlayerNumberGenerator = (
  fcGen: fc.GeneratorValue,
): [number, number] => {
  return pipe([
    fastCheckRandomClubNumberGenerator,
    over([
      identity,
      pipe([
        multiply(DEFAULTSQUADSIZE),
        over([identity, add(DEFAULTSQUADSIZE)]),
        fastCheckRandomIntegerInRange(fcGen),
      ]),
    ]),
  ])(fcGen);
};

export const fastCheckRandomIntegerInRangeAsT = curry(
  <T>([rangeMin, rangeMax]: [number, number], fcGen: fc.GeneratorValue): T => {
    return pipe([fastCheckRandomIntegerInRange(fcGen), toString])(
      [rangeMin, rangeMax],
      fcGen,
    );
  },
);

export const fastCheckRandomLeagueLevel = fastCheckRandomIntegerInRangeAsT(
  DEFAULTDOMESTICLEAGUESPERCOUNTRYNUMBERRANGE,
);

export const fastCheckRandomPositionGroup =
  fastCheckRandomIntegerInRangeAsT(POSITIONGROUPSRANGE);

export const fastCheckRandomBioDataRange = fastCheckRandomIntegerInRangeAsT([
  0,
  Object.keys(PLAYERBIODATA).length,
]);

export const fastCheckRandomCharacterGenerator = curry(
  (range: [number, number], fcGen: fc.GeneratorValue): string => {
    return pipe([
      fastCheckRandomIntegerInRange(fcGen),
      convertCharacterCodeIntoCharacter,
    ])(range);
  },
);

export const fastCheckNonSpaceRandomCharacterGenerator =
  fastCheckRandomCharacterGenerator(NONSPACESCHARACTERRANGE);

export const fastCheckTestLinearRangeGenerator = curry(
  (fcGen: fc.GeneratorValue, rangeSize: number): [number, number] => {
    return pipe([
      fastCheckRandomInteger,
      convertRangeSizeAndMinIntoRange(rangeSize),
    ])(fcGen);
  },
);

export const fastCheckTestLinearRangeWithMinimumGenerator = curry(
  (
    fcGen: fc.GeneratorValue,
    [rangeMin, rangeSize]: [number, number],
  ): [number, number] => {
    return pipe([
      convertRangeSizeAndMinIntoRange,
      fastCheckRandomIntegerInRange(fcGen),
      convertRangeSizeAndMinIntoRange(rangeSize),
    ])(rangeSize, rangeMin);
  },
);

export const fastCheckNLengthUniqueIntegerArrayGenerator = curry(
  (fcGen: fc.GeneratorValue, arraySize: number): Array<number> => {
    return pipe([
      fastCheckRandomInteger,
      add,
      unfoldAndShuffleArray(arraySize),
    ])(fcGen);
  },
);

export const fastCheckListOfXNatNumbersWithMaxGenerator = curry(
  (
    fcGen: fc.GeneratorValue,
    maxValue: number,
    arraySize: number,
  ): Array<number> => {
    const randomNat: number = fastCheckRandomNaturalNumberWithMax(
      maxValue,
      fcGen,
    );
    return unfoldAndShuffleArray(arraySize)(
      pipe([add(randomNat), simpleModularArithmetic(addOne, maxValue)]),
    );
  },
);

export const fastCheckNLengthArrayOfXGenerator = curry(
  <T>(
    unfolder: (index: number) => T,
    range: [number, number],
    fcGen: fc.GeneratorValue,
    arraySize: number,
  ): Array<T> => {
    return pipe([
      fastCheckRandomIntegerInRange(fcGen),
      unfolder,
      unfoldAndShuffleArray(arraySize),
    ])(range);
  },
);

export const nonZeroBoundedModularAdditionForNONSPACESCHARACTERRANGE = curry(
  (standardIncrease: number, currentNumber: number) =>
    pipe([
      curry((startingIndex: number, currentNumber: number): number =>
        nonZeroBoundedModularAddition(
          NONSPACESCHARACTERRANGE,
          1,
          startingIndex + currentNumber,
        ),
      ),
      convertCharacterCodeIntoCharacter,
    ])(standardIncrease, currentNumber),
);

export const fastCheckNLengthUniqueStringArrayGenerator =
  fastCheckNLengthArrayOfXGenerator(
    nonZeroBoundedModularAdditionForNONSPACESCHARACTERRANGE,
    NONSPACESCHARACTERRANGE,
  );

export const fastCheckNLengthStringGenerator = (
  fcGen: fc.GeneratorValue,
  stringLength: number,
): [string, Array<string>] => {
  return pipe([
    fastCheckNLengthUniqueStringArrayGenerator,
    over([join(""), identity]),
  ])(fcGen, stringLength);
};

export const fastCheckRandomStringGenerator = (
  fcGen: fc.GeneratorValue,
): string => {
  return pipe([
    fastCheckRandomIntegerBetweenTwoAnd(fcGen),
    fastCheckNLengthUniqueStringArrayGenerator(fcGen),
    join(""),
  ])(8);
};

export const fastCheckNUniqueIntegersFromRangeAsArrayGenerator = curry(
  (
    fcGen: fc.GeneratorValue,
    [range, arraySize]: [[number, number], number],
  ): Array<number> => {
    return pipe([
      fastCheckRandomIntegerInRange(fcGen),
      nonZeroBoundedModularAddition(range),
      unfoldAndShuffleArray(arraySize),
    ])(range);
  },
);

const addersForStringCountTuples = curry((start: number, index: number) =>
  over([nonZeroBoundedModularAdditionForNONSPACESCHARACTERRANGE, add])(
    start,
    index,
  ),
);

export const fastCheckNLengthArrayOfStringCountTuplesGenerator =
  fastCheckNLengthArrayOfXGenerator(
    addersForStringCountTuples,
    NONSPACESCHARACTERRANGE,
  );

export const fastCheckTestSingleStringNumberGenerator = pipe([
  partialRight(fastCheckNLengthArrayOfStringCountTuplesGenerator, [1]),
  first,
  over([joinOnUnderscores, identity]),
]);

export const fastCheckNLengthArrayOfStringsAndIntegersGenerator = pipe([
  fastCheckNLengthArrayOfStringCountTuplesGenerator,
  zipAll,
  over([convertArrayOfArraysIntoShuffledArray, getFirstLevelArrayLengths]),
]);

const addersForStringCountIndexTuples = curry((start: number, index: number) =>
  over([
    nonZeroBoundedModularAdditionForNONSPACESCHARACTERRANGE,
    add,
    addMinusOne,
  ])(start, index),
);

export const fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator =
  fastCheckNLengthArrayOfXGenerator(
    addersForStringCountIndexTuples,
    NONSPACESCHARACTERRANGE,
  );

export const fastCheckTestSingleStringCountStartingIndexTupleGenerator = pipe([
  partialRight(fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator, [
    1,
  ]),
  first,
]);

export const fastCheckArrayOfNIntegerArraysGenerator = curry(
  (
    fcGen: fc.GeneratorValue,
    [arrayCount, sizeOfArrays]: [number, number],
  ): Array<Array<number>> => {
    return pipe([
      multiply,
      fastCheckNLengthUniqueIntegerArrayGenerator(fcGen),
      chunk(sizeOfArrays),
    ])(arrayCount, sizeOfArrays);
  },
);

export const fastCheckNLengthArrayXTuplesGivenItemsAndRangeOfCountsGenerator =
  curry(
    <T>(
      unfolder: (index: number) => any,
      items: Array<T>,
      fcGen: fc.GeneratorValue,
      [rangeMin, rangeSize]: [number, number],
    ): Array<[T, number, number]> => {
      return pipe([
        convertRangeSizeAndMinIntoRange,
        fastCheckRandomIntegerInRange(fcGen),
        unfolder,
        unfoldAndShuffleArray(items.length),
        zip(items),
      ])(rangeSize, rangeMin);
    },
  );

export const fastCheckNLengthArrayOfItemCountTuplesGivenItemsAndRangeOfCountsGenerator =
  fastCheckNLengthArrayXTuplesGivenItemsAndRangeOfCountsGenerator(add);

const addersForCountIndexTuples = curry((start: number, index: number) =>
  over([add, addMinusOne])(start, index),
);

export const fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator =
  curry(
    <T>(
      items: Array<T>,
      fcGen: fc.GeneratorValue,
      range: [number, number],
    ): Array<[T, number, number]> => {
      return pipe([
        fastCheckNLengthArrayXTuplesGivenItemsAndRangeOfCountsGenerator(
          addersForCountIndexTuples,
        ),
        mapFlatten,
      ])(items, fcGen, range);
    },
  );

export const fastCheckTestArrayWithDefinedItemsPerChunk = curry(
  <T>(
    generatorFunction: (fcGen: fc.GeneratorValue, arg: number) => Array<T>,
    fcGen: fc.GeneratorValue,
    uniqueStringsCount: number,
  ): [Array<string>, Array<[string, number]>, number] => {
    const [counts, strings] = over([
      fastCheckListOfXNatNumbersWithMaxGenerator(fcGen, 10),
      generatorFunction(fcGen),
    ])(uniqueStringsCount);
    const getItemCounts = pipe([
      map(sortBy(first)),
      zipAll,
      flatten,
      groupBy(first),
      mapValues(map(last)),
      Object.entries,
    ]);

    return pipe([
      unfold(() => pipe([map(shuffle), zipAll])([strings, counts])),
      over([
        pipe([flatten, unfoldItemCountTuplesIntoMixedArray]),
        getItemCounts,
        pipe([first, map(last), sum]),
      ]),
    ])(fastCheckRandomIntegerInRange(fcGen, [2, 5]));
  },
);

export const fastCheckTestStringArrayWithDefinedStringsPerChunk =
  fastCheckTestArrayWithDefinedItemsPerChunk(
    fastCheckNLengthUniqueStringArrayGenerator,
  );
export const fastCheckTestIntegerArrayWithDefinedIntegersPerChunk =
  fastCheckTestArrayWithDefinedItemsPerChunk(
    fastCheckNLengthUniqueStringArrayGenerator,
  );

export const fastCheckTestCountriesForBaseCountriesGenerator =
  fastCheckNLengthUniqueStringArrayGenerator;

export const fastCheckTestDomesticLeaguesForBaseCountriesGenerator = curry(
  (
    fcGen: fc.GeneratorValue,
    [countriesCount, competitionsPerCountryCount]: [number, number],
  ): Array<Array<string>> => {
    return pipe([
      multiply(countriesCount),
      fastCheckNLengthUniqueStringArrayGenerator(fcGen),
      chunk(competitionsPerCountryCount),
    ])(competitionsPerCountryCount);
  },
);

export const fastCheckTestClubsForBaseCountriesGenerator = curry(
  (
    fcGen: fc.GeneratorValue,
    [
      countriesCount,
      competitionsPerCountryCount,
      clubsPerDomesticLeaguesCount,
    ]: [number, number, number],
  ): Array<Array<Array<string>>> => {
    return pipe([
      multiply(competitionsPerCountryCount),
      multiply(clubsPerDomesticLeaguesCount),
      fastCheckNLengthUniqueStringArrayGenerator(fcGen),
      chunk(clubsPerDomesticLeaguesCount),
      chunk(competitionsPerCountryCount),
    ])(countriesCount);
  },
);

export const fastCheckTestBaseCountriesGenerator = curry(
  (
    fcGen: fc.GeneratorValue,
    [
      countriesCount,
      competitionsPerCountryCount,
      clubsPerDomesticLeaguesCount,
    ]: [number, number, number],
  ): BaseCountries => {
    return pipe([
      zipApply([
        fastCheckTestCountriesForBaseCountriesGenerator(fcGen),
        fastCheckTestDomesticLeaguesForBaseCountriesGenerator(fcGen),
        fastCheckTestClubsForBaseCountriesGenerator(fcGen),
      ]),
      zipAll,
    ])([
      countriesCount,
      [countriesCount, competitionsPerCountryCount],
      [
        countriesCount,
        competitionsPerCountryCount,
        clubsPerDomesticLeaguesCount,
      ],
    ]);
  },
);

export const fastCheckTestRandomBaseCountryIndex = curry(
  (fcGen: fc.GeneratorValue, testBaseCountries: BaseCountries): number => {
    return pipe([
      zipAllAndGetFirstArray,
      fastCheckOneRandomArrayIndexAsInteger(fcGen),
    ])(testBaseCountries);
  },
);

export const fastCheckGetNRandomBaseCountries = curry(
  (
    count: number,
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
  ): Array<string> => {
    return pipe([
      zipAllAndGetFirstArray,
      fastCheckNRandomItemsFromArray(count, fcGen),
    ])(testBaseCountries);
  },
);

export const fastCheckGetTwoRandomBaseCountries =
  fastCheckGetNRandomBaseCountries(2);

export const fastCheckTestRandomBaseCountryWithIndex = curry(
  (
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
  ): [string, number] => {
    const countryGetter = (index: string) =>
      property([index, 0], testBaseCountries);
    return pipe([
      fastCheckTestRandomBaseCountryIndex,
      over([countryGetter, identity]),
    ])(fcGen, testBaseCountries);
  },
);

export const fastCheckTestRandomBaseDomesticLeagueIndexFromCountry = curry(
  (
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
    testCountryIndex: number,
  ): number => {
    return pipe([
      property([testCountryIndex, BaseCountriesIndices.DOMESTICLEAGUESINDEX]),
      fastCheckOneRandomArrayIndexAsInteger(fcGen),
    ])(testBaseCountries);
  },
);

export const fastCheckTestCompletelyRandomBaseDomesticLeagueIndex = curry(
  (
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
  ): [number, number] => {
    return pipe([
      fastCheckTestRandomBaseCountryIndex(fcGen),
      over([
        identity,
        fastCheckTestRandomBaseDomesticLeagueIndexFromCountry(
          fcGen,
          testBaseCountries,
        ),
      ]),
    ])(testBaseCountries);
  },
);

export const fastCheckTestCompletelyRandomBaseDomesticLeagueNameWithIndex =
  curry(
    (
      fcGen: fc.GeneratorValue,
      testBaseCountries: BaseCountries,
    ): [[string, string], [number, number]] => {
      const [testCountryIndex, testDomesticLeagueIndex]: [number, number] =
        fastCheckTestCompletelyRandomBaseDomesticLeagueIndex(
          fcGen,
          testBaseCountries,
        );
      return [
        [
          getCountryNameFromBaseCountries(testCountryIndex, testBaseCountries),
          getDomesticLeagueNameFromBaseCountries(
            [testCountryIndex, testDomesticLeagueIndex],
            testBaseCountries,
          ),
        ],
        [testCountryIndex, testDomesticLeagueIndex],
      ];
    },
  );

export const fastCheckGetNRandomBaseDomesticLeagues = curry(
  (
    count: number,
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
  ): [number, Array<string>] => {
    return pipe([
      fastCheckTestRandomBaseCountryIndex(fcGen),
      over([
        identity,
        pipe([
          (countryIndex: number): [number, number] => [
            countryIndex,
            BaseCountriesIndices.DOMESTICLEAGUESINDEX,
          ],
          partialRight(property, [testBaseCountries]),
          fastCheckNRandomItemsFromArray(count, fcGen),
        ]),
      ]),
    ])(testBaseCountries);
  },
);

export const fastCheckGetTwoRandomBaseDomesticLeagues =
  fastCheckGetNRandomBaseDomesticLeagues(2);

export const fastCheckTestRandomBaseClubIndexFromCountryAndDomesticLeague =
  curry(
    (
      fcGen: fc.GeneratorValue,
      testBaseCountries: BaseCountries,
      [testCountryIndex, testDomesticLeagueIndex]: [number, number],
    ): number => {
      return pipe([
        property([
          testCountryIndex,
          BaseCountriesIndices.CLUBSINDEX,
          testDomesticLeagueIndex,
        ]),
        fastCheckOneRandomArrayIndexAsInteger(fcGen),
      ])(testBaseCountries);
    },
  );

export const fastCheckTestCompletelyRandomBaseClubIndex = curry(
  (
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
  ): [number, number, number] => {
    return pipe([
      fastCheckTestCompletelyRandomBaseDomesticLeagueIndex(fcGen),
      over([
        identity,
        fastCheckTestRandomBaseClubIndexFromCountryAndDomesticLeague(
          fcGen,
          testBaseCountries,
        ),
      ]),
      flatten,
    ])(testBaseCountries);
  },
);

export const fastCheckTestCompletelyRandomBaseClub = curry(
  (
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
  ): [[number, number, number], [string, string, string]] => {
    const [randomCountryIndex, randomDomesticLeagueIndex, randomClubIndex]: [
      number,
      number,
      number,
    ] = fastCheckTestCompletelyRandomBaseClubIndex(fcGen, testBaseCountries);
    const randomClub: [string, string, string] = over([
      getCountryNameFromBaseCountries(randomCountryIndex),
      getDomesticLeagueNameFromBaseCountries([
        randomCountryIndex,
        randomDomesticLeagueIndex,
      ]),
      getClubNameFromBaseCountries([
        randomCountryIndex,
        randomDomesticLeagueIndex,
        randomClubIndex,
      ]),
    ])(testBaseCountries) as [string, string, string];

    return [
      [randomCountryIndex, randomDomesticLeagueIndex, randomClubIndex],
      randomClub,
    ];
  },
);

export const fastCheckGetNRandomBaseClubsFromRandomLeague = curry(
  <T>(
    getter: (count: number, fcGen: fc.GeneratorValue) => Array<T>,
    count: number,
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
  ): [[number, number], Array<T>] => {
    return pipe([
      fastCheckTestCompletelyRandomBaseDomesticLeagueIndex,
      over([
        identity,
        pipe([
          ([countryIndex, domesticLeagueIndex]: [number, number]): [
            number,
            number,
            number,
          ] => [
            countryIndex,
            BaseCountriesIndices.CLUBSINDEX,
            domesticLeagueIndex,
          ],
          partialRight(property, [testBaseCountries]),
          getter(count, fcGen),
        ]),
      ]),
    ])(fcGen, testBaseCountries);
  },
);

export const fastCheckGetNRandomBaseRelativeClubNumbersFromRandomLeague =
  fastCheckGetNRandomBaseClubsFromRandomLeague(
    fastCheckNRandomArrayIndicesAsIntegers,
  );

export const fastCheckGetTwoRandomBaseRelativeClubNumbersFromRandomLeague =
  fastCheckGetNRandomBaseClubsFromRandomLeague(
    fastCheckNRandomArrayIndicesAsIntegers,
    2,
  );

export const fastCheckGetTwoRandomBaseClubNamesFromRandomLeague =
  fastCheckGetNRandomBaseClubsFromRandomLeague(
    fastCheckNRandomItemsFromArray,
    2,
  );

export const fastCheckGetNRandomBaseClubNumbersFromRandomLeague = curry(
  (
    count: number,
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
  ): [Array<number>, [number, number]] => {
    const [[countryIndex, domesticLeagueIndex], relativeClubNumbers]: [
      Array<number>,
      [number, number],
    ] = fastCheckGetNRandomBaseRelativeClubNumbersFromRandomLeague(
      count,
      fcGen,
      testBaseCountries,
    );
    const clubNumbers: Array<number> = map((clubIndex: number): number =>
      convertClubRelativeNumberIntoAbsoluteNumber([
        countryIndex,
        domesticLeagueIndex,
        clubIndex,
      ]),
    )(relativeClubNumbers);

    return [clubNumbers, [countryIndex, domesticLeagueIndex]];
  },
);

export const fastCheckGetTwoRandomBaseClubNumbersFromRandomLeague =
  fastCheckGetNRandomBaseClubNumbersFromRandomLeague(2);

export const fastCheckGenerateTestCountriesCount = partialRight(
  fastCheckRandomIntegerInRange,
  [[1, 2]],
);
export const fastCheckGenerateTestCountriesLeaguesClubsCount = pipe([
  fastCheckGenerateTestCountriesCount,
  over([
    identity,
    multiplyByDEFAULTDOMESTICLEAGUESPERCOUNTRY,
    multiplyByDEFAULTCLUBSPERCOUNTRY,
  ]),
]);

export const fastCheckGenerateTestCountriesLeaguesClubsPlayersCount = pipe([
  fastCheckGenerateTestCountriesCount,
  over([
    identity,
    multiplyByDEFAULTDOMESTICLEAGUESPERCOUNTRY,
    multiplyByDEFAULTCLUBSPERCOUNTRY,
    multiplyByDEFAULTPLAYERSPERCOUNTRY,
  ]),
]);

export const fastCheckGenerateTestDomesticLeaguesCount = pipe([
  fastCheckGenerateTestCountriesCount,
  over([multiplyByDEFAULTDOMESTICLEAGUESPERCOUNTRY, identity]),
]);
export const fastCheckGenerateTestClubsCount = pipe([
  fastCheckGenerateTestCountriesCount,
  over([multiplyByDEFAULTCLUBSPERCOUNTRY, identity]),
]);
export const fastCheckGenerateTestPlayersCount = pipe([
  fastCheckGenerateTestCountriesCount,
  over([multiplyByDEFAULTPLAYERSPERCOUNTRY, identity]),
]);


export const fastCheckGenerateRandomBaseCountries = (
  fcGen: fc.GeneratorValue,
): BaseCountries => {
  const testCountriesLeaguesClubsCount: [number, number, number] = [
    fastCheckGenerateTestCountriesCount(fcGen),
    DEFAULTDOMESTICLEAGUESPERCOUNTRY,
    DEFAULTCLUBSPERDOMESTICLEAGUE,
  ];
  return fastCheckTestBaseCountriesGenerator(
    fcGen,
    testCountriesLeaguesClubsCount,
  );
};

export const fastCheckCreateTestSaveOptions = curry(
  (Countries: BaseCountries, fcGen: fc.GeneratorValue): SaveOptions => {
    const [[CountryIndex, DomesticLeagueIndex, ClubIndex]] =
	  fastCheckTestCompletelyRandomBaseClub(fcGen, Countries);
    const StartSeason: number = fastCheckRandomSeason(fcGen)
    return {
      CountryIndex,
      DomesticLeagueIndex,
      ClubIndex,      
      Countries,
      StartSeason,
      CurrentSeason: StartSeason,
    };
  },
);


export const fastCheckCreateTestSaveOptionsWithDefaultCountries =
  fastCheckCreateTestSaveOptions(BASECOUNTRIES);


export const fastCheckCreateTestSaveOptionsWithRandomCountries = (
  fcGen: fc.GeneratorValue,
): SaveOptions => {
  const countries = fastCheckGenerateRandomBaseCountries(fcGen);
  return fastCheckCreateTestSaveOptions(countries)(fcGen);
};

export const fastCheckCreateArrayOfTestSaveOptions = (fcGen: fc.GeneratorValue, count: number): Array<Option<[string, SaveOptions]>> => {
  const countries = fastCheckGenerateRandomBaseCountries(fcGen);
  return unfold((saveName: number): Option<[string, SaveOptions]> => {
    const saveOptions: SaveOptions = fastCheckCreateTestSaveOptions(countries)(fcGen)
    return fromNullable([saveName.toString(), saveOptions])
  }, count)
}

export const fastCheckCreateTestSaveArguments = (fcGen: fc.GeneratorValue): [SaveArguments, [number, number]] => {

  
  const [testPlayersCount, testClubsCount]: [number, number] =  unfold((_: number): number => fastCheckRandomIntegerInRange(fcGen,[2,10]), 2)
  
  const testSaveOptions: SaveOptions =
        fastCheckCreateTestSaveOptionsWithRandomCountries(fcGen);
  
  const testPlayers: Array<Player> = fastCheckCreateNTestPlayers(
    testPlayersCount,
    fcGen,
  );
  const testClubs: Array<Club> = fastCheckCreateNTestClubs(
    testClubsCount,
    fcGen,
  );

  const testSaveArguments: SaveArguments = {
    SaveOptions: testSaveOptions,
    Clubs: testClubs,
    Players: testPlayers,
  };
  return [testSaveArguments, [testPlayersCount, testClubsCount]]
  
}


export const fastCheckCreateTestMatchResult = curry(
  (
    homeWins: number,
    awayWins: number,
    Draws: number,
    fcGen: fc.GeneratorValue,
  ): MatchResultsTuple => {
    const goalDifference: number = fastCheckRandomIntegerInRange(fcGen, [1, 5]);
    const minimumGoals: number = fastCheckRandomIntegerInRange(fcGen, [0, 2]);
    const homeGoalsFor: number = pipe([
      multiply(goalDifference),
      add(minimumGoals),
    ])(homeWins);
    const awayGoalsFor: number = pipe([
      multiply(goalDifference),
      add(minimumGoals),
    ])(awayWins);

    return [
      {
        Home: true,
        Wins: homeWins,
        Losses: awayWins,
        Draws,
        GoalsFor: homeGoalsFor,
        GoalsAgainst: awayGoalsFor,
      },
      {
        Home: false,
        Wins: awayWins,
        Losses: homeWins,
        Draws,
        GoalsFor: awayGoalsFor,
        GoalsAgainst: homeGoalsFor,
      },
    ];
  },
);

export const fastCheckCreateTestHomeWinResult = fastCheckCreateTestMatchResult(
  1,
  0,
  0,
);
export const fastCheckCreateTestAwayWinResult = fastCheckCreateTestMatchResult(
  0,
  1,
  0,
);
export const fastCheckCreateTestDrawResult = fastCheckCreateTestMatchResult(
  0,
  0,
  1,
);

export const fastCheckCreateRandomMatchResult = fastCheckCallRandomFCGen([
  fastCheckCreateTestHomeWinResult,
  fastCheckCreateTestAwayWinResult,
  fastCheckCreateTestDrawResult,
]);

type Statistics<A> = State<MatchResult, A>;
export const fastCheckCreateTestPlayerMatchLog =
  (index: number, playerNumber: number) =>
  (matchResult: MatchResult): Statistics<[string, PlayerMatchLog]> => {
    const { Wins, Losses, Draws, GoalsFor } = matchResult;
    const Starts: number = floorDivision(DEFAULTPLAYERSONBENCH, index);
    const Minutes: number = multiply(Starts, DEFAULTMATCHLENGTH);
    const Tackles: number = multiply(Starts, index);
    const Goals: number = Math.max(0, subtract(GoalsFor, Starts));
    const matchLog: PlayerMatchLog = {
      Starts,
      Wins,
      Losses,
      Draws,
      Goals,
      Assists: 0,
      Minutes,
      Tackles,
    };
    const updatedResult: MatchResult = update(
      "GoalsFor",
      partialRight(subtract, [Goals]),
      matchResult,
    );
    return [[playerNumber, matchLog], updatedResult] as unknown as Statistics<
      [string, PlayerMatchLog]
    >;
  };

export const fastCheckCreateTestPlayerMatchLogs = curry(
  (
    [testHomePlayers, testAwayPlayers]: [
      ReadonlyNonEmptyArray<number>,
      ReadonlyNonEmptyArray<number>,
    ],
    [testHomeResult, testAwayResult]: MatchResultsTuple,
  ): [PlayerMatchLogs, PlayerMatchLogs] => {
    // evaluate
    const homePlayersStats = StateTraverseReadonlyNonEmptyArrayWithIndex(
      fastCheckCreateTestPlayerMatchLog,
    )(testHomePlayers);
    const awayPlayersStats = StateTraverseReadonlyNonEmptyArrayWithIndex(
      fastCheckCreateTestPlayerMatchLog,
    )(testAwayPlayers);

    return pipe([
      zipWith(
        (
          matchResult: MatchResult,
          playerStats: Statistics<[string, PlayerMatchLog]>,
        ) => evaluateState(matchResult)(playerStats),
        [testHomeResult, testAwayResult],
      ),
      map(
        (
          clubStats: ReadonlyNonEmptyArray<[string, PlayerMatchLog]>,
        ): Record<string, PlayerMatchLog> => Object.fromEntries(clubStats),
      ),
    ])([homePlayersStats, awayPlayersStats]);
  },
);

export const fastCheckCreateTestMatchLog = curry(
  (
    MatchID: string,
    [[homeClubNumber, homePlayers], [awayClubNumber, awayPlayers]]: [
      [number, ReadonlyNonEmptyArray<number>],
      [number, ReadonlyNonEmptyArray<number>],
    ],
    fcGen: fc.GeneratorValue,
  ): MatchLog => {
    const [homeMatchResult, awayMatchResult]: MatchResultsTuple =
      fastCheckCreateRandomMatchResult(fcGen);
    const [homePlayerStatistics, awayPlayerStatistics] =
      fastCheckCreateTestPlayerMatchLogs(
        [homePlayers, awayPlayers],
        [homeMatchResult, awayMatchResult],
      );
    return {
      MatchID,
      [homeClubNumber.toString()]: {
        MatchResult: homeMatchResult,
        PlayerStatistics: homePlayerStatistics,
      },
      [awayClubNumber.toString()]: {
        MatchResult: awayMatchResult,
        PlayerStatistics: awayPlayerStatistics,
      },
    };
  },
);

export const fastCheckCreateTestMatchLogsObject = (
  [testMatchWeeksCount, testSeason]: [number, number],
  fcGen: fc.GeneratorValue,
): Array<MatchLog> => {
  const traversal =
    ([testHomeClubNumber, testAwayClubNumber]: [number, number]) =>
    ([testMatchWeek, testMatchNumber]: [number, number]): State<
      [number, number],
      MatchLog
    > => {
      const [testHomePlayers, testAwayPlayers] = map<
        number,
        ReadonlyNonEmptyArray<number>
      >(generateClubStartingPlayerNumbers)([
        testHomeClubNumber,
        testAwayClubNumber,
      ]);
      const clubs: [
        [number, ReadonlyNonEmptyArray<number>],
        [number, ReadonlyNonEmptyArray<number>],
      ] = [
        [testHomeClubNumber, testHomePlayers],
        [testAwayClubNumber, testAwayPlayers],
      ];
      const testDomesticLeagueNumber: number =
        domesticLeagueNumberRepeaterForClubs(testHomeClubNumber);
      const testMatchNumberForLeague: number = modularAddition(
        DEFAULTMATCHPERWEEKPERDOMESTICLEAGUE,
        testMatchNumber,
      );
      // season_domesticLeague_matchweek_matchnumber
      const id: string = joinOnUnderscores([
        testSeason,
        testDomesticLeagueNumber,
        testMatchWeek,
        testMatchNumberForLeague,
      ]);
      return [
        fastCheckCreateTestMatchLog(id, clubs, fcGen),
        [testMatchWeek, testMatchNumberForLeague],
      ];
    };
  const matchWeeks = unfold((testMatchWeek: number) => {
    const schedule: ReadonlyNonEmptyArray<[number, number]> =
      createScheduleForRoundOfDoubleRobinRound(
        testMatchWeek,
        DEFAULTTOTALCLUBS,
      );
    const monad = StateTraverseReadonlyNonEmptyArray(traversal)(schedule);
    return evaluateState([testMatchWeek, 0])(monad);
  }, testMatchWeeksCount);

  return flatten(matchWeeks);
};

