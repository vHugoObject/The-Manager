import { fc } from "@fast-check/vitest";
import { Faker, Randomizer, en } from "@faker-js/faker";
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
  spread,
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
  concat
} from "lodash/fp";
import { BaseCountries } from "./Types";
import {
  PositionGroup,
  POSITIONGROUPSRANGE,
  PLAYERSKILLSONLYINDICESRANGE,
  PLAYERIDINDICESRANGE,
} from "./PlayerDataConstants";
import {
  NONSPACESCHARACTERRANGE,
  TESTRANDOMSEASONRANGE,
  DOUBLEBETWEENZEROAND1RANGE,
  TESTROUNDROBINCLUBSRANGE,
  BASECOUNTRIESDOMESTICLEAGUESINDEX,
  BASECOUNTRIESCLUBSINDEX,
  DEFAULTTOTALPLAYERS,
  DEFAULTPLAYERSPERCOUNTRY,
  DEFAULTDOMESTICLEAGUESPERCOUNTRYIDRANGE,
  DEFAULTTOTALCLUBS
} from "./Constants";
import {
  getFirstLevelArrayLengths,
  getCountryNameFromBaseCountries,
  getDomesticLeagueNameFromBaseCountries,
  getClubNameFromBaseCountries,
} from "./Getters";
import {
  unfold,
  unfoldStringCountStartingIndexTuplesIntoShuffledArrayOfStringIDs,
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
  createPlayerID,
  multiplyByDEFAULTDOMESTICLEAGUESPERCOUNTRY,
  multiplyByDEFAULTCLUBSPERCOUNTRY,
  multiplyByDEFAULTPLAYERSPERCOUNTRY,
  simpleModularArithmetic,
  addOne,
  unfoldItemCountTuplesIntoMixedArray,
} from "./Transformers";

class FakerBuilder<TValue> extends fc.Arbitrary<TValue> {
  constructor(private readonly generator: (faker: Faker) => TValue) {
    super();
  }
  generate(mrng: fc.Random, biasFactor: number | undefined): fc.Value<TValue> {
    const randomizer: Randomizer = {
      next: (): number => mrng.nextDouble(),
      seed: () => {}, // no-op, no support for updates of the seed, could even throw
    };
    const customFaker = new Faker({ locale: en, randomizer });
    return new fc.Value(this.generator(customFaker), undefined);
  }
  canShrinkWithoutContext(value: unknown): value is TValue {
    return false;
  }
  shrink(value: TValue, context: unknown): fc.Stream<fc.Value<TValue>> {
    return fc.Stream.nil();
  }
}

export function fakerToArb<TValue>(
  generator: (faker: Faker) => TValue,
): fc.Arbitrary<TValue> {
  return new FakerBuilder(generator);
}

export const fastCheckRandomItemFromArray = curry(
  <T>(
    fcGen: fc.GeneratorValue,
    testArray: Array<T>,
  ): fc.Arbitrary<T> => {
    return fcGen(fc.constantFrom, ...shuffle(testArray));
  },
);


export const fastCheckRandomObjectKey = curry(
  (fcGen: fc.GeneratorValue, object: Record<string, any>): string => {
    return pipe([Object.keys, fastCheckRandomItemFromArray(fcGen)])(object);
  },
);

export const fastCheckRandomItemFromArrayWithIndex = curry(
  <T>(
    fcGen: fc.GeneratorValue,
    testArray: Array<T>,
  ): [fc.Arbitrary<T>, number] => {
    return pipe([fastCheckRandomObjectKey(fcGen),
      over([partialRight(property, [testArray]), identity])])(testArray)
  },
);

export const fastCheckGetRandomArrayChunk = curry(
  <T>(
    fcGen: fc.GeneratorValue,
    [testArray, testChunkSize]: [Array<T>, number],
  ): fc.Arbitrary<T> => {
    return pipe([chunk(testChunkSize), fastCheckRandomItemFromArrayWithIndex(fcGen)])(testArray)
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

export const fastCheckRandomIntegerBetweenOneAnd = curry(
  (
    fcGen: fc.GeneratorValue,
    rangeMax: number
  ): number => {
    return pipe([concat([1]), fastCheckRandomIntegerInRange(fcGen)])(rangeMax)
  },
);

export const fastCheckRandomArrayChunkSize = curry(
  <T>(
    fcGen: fc.GeneratorValue,
    array: Array<T>
  ): number => {
    return pipe([size, concat([1]), fastCheckRandomIntegerInRange(fcGen)])(array)
  },
);

export const fastCheckNRandomArrayIndices = curry(
  <T>(
    fcGen: fc.GeneratorValue,
    count: number, 
    array: Array<T>
  ): Array<string> => {
    return fcGen(fc.shuffledSubarray, Object.keys(array), {minLength: count, maxLength: count})
  },
);

export const fastCheckNRandomItemsFromArray = curry(
  <T>(
    count: number, 
    fcGen: fc.GeneratorValue,
    array: Array<T>
  ): Array<T> => {
    return fcGen(fc.shuffledSubarray, array, {minLength: count, maxLength: count})
  },
);

export const fastCheckGet2RandomItemsFromArray = fastCheckNRandomItemsFromArray(2)

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

export const fastCheckPlayerIDNumberGenerator =
  fastCheckRandomNaturalNumberWithMax(DEFAULTTOTALPLAYERS);

export const fastCheckRandomClubIDNumberGenerator = fastCheckRandomNaturalNumberWithMax(DEFAULTTOTALCLUBS)


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

export const fastCheckTestSeasonAndPlayerNumber = over([
  fastCheckRandomSeason,
  fastCheckPlayerIDNumberGenerator,
]);
export const fastCheckTestPlayerIDGenerator = pipe([
  fastCheckTestSeasonAndPlayerNumber,
  spread(createPlayerID),
]);

export const fastCheckTestArrayOfPlayerIDsGenerator = unfold(
  fastCheckTestPlayerIDGenerator,
);

export const fastCheckRandomIntegerInRangeAsString = curry(
  (
    [rangeMin, rangeMax]: [number, number],
    fcGen: fc.GeneratorValue,
  ): string => {
    return pipe([fastCheckRandomIntegerInRange(fcGen), toString])(
      [rangeMin, rangeMax],
      fcGen,
    );
  },
);


export const fastCheckRandomLeagueLevel =
  fastCheckRandomIntegerInRangeAsString(
    DEFAULTDOMESTICLEAGUESPERCOUNTRYIDRANGE,
  );

export const fastCheckGenerateRandomPlayerIDDataIndex =
  fastCheckRandomIntegerInRangeAsString(PLAYERIDINDICESRANGE);

export const fastCheckGenerateRandomSkillIndex =
  fastCheckRandomIntegerInRangeAsString(PLAYERSKILLSONLYINDICESRANGE);

export const fastCheckRandomPositionGroup =
  fastCheckRandomIntegerInRangeAsString(POSITIONGROUPSRANGE);

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

export const fastCheckTestSingleStringIDGenerator = pipe([
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

const fastCheckTestIDUnfolder = over([
  unfoldStringCountStartingIndexTuplesIntoShuffledArrayOfStringIDs,
  identity,
]);

export const fastCheckTestMixedArrayOfStringIDsGivenStringsGenerator = pipe([
  fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator,
  fastCheckTestIDUnfolder,
]);

export const fastCheckTestMixedArrayOfPositionGroupIDsGenerator = pipe([
  fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator(
    Object.values(PositionGroup),
  ),
  fastCheckTestIDUnfolder,
]);

export const fastCheckTestMixedArrayOfStringIDsGenerator = pipe([
  fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator,
  fastCheckTestIDUnfolder,
]);

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
  (fcGen: fc.GeneratorValue, testBaseCountries: BaseCountries): string => {
    return pipe([zipAllAndGetFirstArray, fastCheckRandomObjectKey(fcGen)])(
      testBaseCountries,
    );
  },
);

export const fastCheckGetNRandomBaseCountries = curry(
  (count: number, fcGen: fc.GeneratorValue, testBaseCountries: BaseCountries): string => {
    return pipe([zipAllAndGetFirstArray, fastCheckNRandomItemsFromArray(count, fcGen)])(
      testBaseCountries,
    );
  },
);

export const fastCheckGet2RandomBaseCountries = fastCheckGetNRandomBaseCountries(2)

export const fastCheckTestRandomBaseCountryWithIndex = curry(
  (fcGen: fc.GeneratorValue, testBaseCountries: BaseCountries): [string, string] => {
    const countryGetter = (index: string) => property([index, 0], testBaseCountries)
    return pipe([fastCheckTestRandomBaseCountryIndex, over([countryGetter, identity])])(fcGen, testBaseCountries)
  },
);

export const fastCheckTestRandomBaseDomesticLeagueIndexFromCountry = curry(
  (
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
    testCountryIndex: string,
  ): string => {
    return pipe([
      property([testCountryIndex, BASECOUNTRIESDOMESTICLEAGUESINDEX]),
      fastCheckRandomObjectKey(fcGen),
    ])(testBaseCountries);
  },
);


export const fastCheckTestCompletelyRandomBaseDomesticLeagueIndex = curry(
  (
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
  ): [string, string] => {
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

export const fastCheckGetNRandomBaseDomesticLeagues = curry(
  (
    count: number,
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
  ): [string, Array<string>] => {
    return pipe([
      fastCheckTestRandomBaseCountryIndex(fcGen),
      over([identity, pipe([
	(countryIndex: string): [string, string] => [countryIndex, BASECOUNTRIESDOMESTICLEAGUESINDEX.toString()],
	partialRight(property, [testBaseCountries]),
	fastCheckNRandomItemsFromArray(count, fcGen)])])
    ])(testBaseCountries);
  },
);

export const fastCheckGet2RandomBaseDomesticLeagues = fastCheckGetNRandomBaseDomesticLeagues(2)


export const fastCheckTestCompletelyRandomBaseDomesticLeagueWithIndex = curry(
  (
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
  ): [[string, string], [string, string]] => {
    return pipe([
      fastCheckTestRandomBaseCountryWithIndex(fcGen),
      over([
        identity,
        pipe([last, fastCheckTestRandomBaseDomesticLeagueIndexFromCountry(
          fcGen,
          testBaseCountries,
        )])
      ]),
    ])(testBaseCountries);
  },
);


export const fastCheckTestRandomBaseClubIndexFromCountryAndDomesticLeague =
  curry(
    (
      fcGen: fc.GeneratorValue,
      testBaseCountries: BaseCountries,
      [testCountryIndex, testDomesticLeagueIndex]: [string, string],
    ): string => {
      return pipe([
        property([
          testCountryIndex,
          BASECOUNTRIESCLUBSINDEX,
          testDomesticLeagueIndex,
        ]),
        fastCheckRandomObjectKey(fcGen),
      ])(testBaseCountries);
    },
  );

export const fastCheckTestCompletelyRandomBaseClubIndex = curry(
  (
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
  ): [string, string, string] => {
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
  ): [[string, string, string], [string, string, string]] => {
    const [randomCountryIndex, randomDomesticLeagueIndex, randomClubIndex]: [
      string,
      string,
      string,
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

export const fastCheckGetNRandomBaseClubs = curry(
  (
    count: number,
    fcGen: fc.GeneratorValue,
    testBaseCountries: BaseCountries,
  ): [string, string, Array<string>] => {
    return pipe([
      fastCheckTestCompletelyRandomBaseDomesticLeagueIndex,
      over([identity,
	pipe([
	  ([countryIndex, domesticLeagueIndex]: [string, string]): [string, string, string] => [countryIndex, BASECOUNTRIESCLUBSINDEX.toString(), domesticLeagueIndex],	  
	  partialRight(property, [testBaseCountries]),
	  fastCheckNRandomItemsFromArray(count, fcGen),
	])
      ]),
    ])(fcGen, testBaseCountries)      
  }
);

export const fastCheckGet2RandomBaseClubs = fastCheckGetNRandomBaseClubs(2)

export const fastCheckGenerateTestCountriesCount = partialRight(
  fastCheckRandomIntegerInRange,
  [[2, 8]],
);
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
