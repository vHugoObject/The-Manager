import { fc } from "@fast-check/vitest";
import { Faker, Randomizer, en } from "@faker-js/faker";
import {
  curry,
  over,
  add,
  zip,
  identity,
  partialRight,
  pipe,
  multiply,
  chunk,
  first,
  zipAll,
  property,
  flatten,
  join,
} from "lodash/fp";
import fastCartesian from "fast-cartesian";
import { IDPREFIXES } from "./Constants";
import { PositionGroup, BaseCountries } from "./Types";
import {
  NONSPACESCHARACTERRANGE,
  TESTRANDOMSEASONRANGE,
  DOUBLEBETWEENZEROAND1RANGE,
  TESTROUNDROBINCLUBSRANGE,
  BASECOUNTRIESDOMESTICLEAGUESINDEX,
  BASECOUNTRIESCLUBSINDEX,
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
  <TValue>(
    fcGen: fc.GeneratorValue,
    testArray: Array<TValue>,
  ): fc.Arbitrary<TValue> => {
    return fcGen(fc.constantFrom, ...testArray);
  },
);

export const fastCheckRandomObjectKey = curry(
  (fcGen: fc.GeneratorValue, object: Record<string, any>): string => {
    return pipe([Object.keys, fastCheckRandomItemFromArray(fcGen)])(object);
  },
);

export const fastCheckRandomObjectKeyAsInteger = curry(
  (fcGen: fc.GeneratorValue, object: Record<string, any>): number => {
    return pipe([fastCheckRandomObjectKey(fcGen), parseInt])(object);
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

export const fastCheckRandomEntityIDPrefix = (
  fcGen: fc.GeneratorValue,
): IDPREFIXES => {
  return fcGen(fc.constantFrom, ...Object.values(IDPREFIXES));
};

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

export const fastCheckRandomSeason = partialRight(
  fastCheckRandomIntegerInRange,
  [TESTRANDOMSEASONRANGE],
);
export const fastCheckRandomIntegerInRangeAsString = curry(
  (
    fcGen: fc.GeneratorValue,
    [rangeMin, rangeMax]: [number, number],
  ): string => {
    return pipe([fastCheckRandomIntegerInRange(fcGen), toString])(
      [rangeMin, rangeMax],
      fcGen,
    );
  },
);

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

export const fastCheckNLengthArrayOfXGenerator = curry(
  (
    unfolder: (index: number) => any,
    range: [number, number],
    fcGen: fc.GeneratorValue,
    arraySize: number,
  ): Array<any> => {
    return pipe([
      fastCheckRandomIntegerInRange(fcGen),
      unfolder,
      unfoldAndShuffleArray(arraySize),
    ])(range);
  },
);

export const nonZeroBoundedModularAdditionForNONSPACESCHARACTERRANGE = curry(
  (start: number, index: number) =>
    pipe([
      nonZeroBoundedModularAddition(NONSPACESCHARACTERRANGE),
      convertCharacterCodeIntoCharacter,
    ])(start, index),
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
      // try map for random number selection
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
    ])(testBaseCountries);

    return [
      [randomCountryIndex, randomDomesticLeagueIndex, randomClubIndex],
      randomClub,
    ];
  },
);
