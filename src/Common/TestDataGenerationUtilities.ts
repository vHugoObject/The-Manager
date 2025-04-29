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
  join,
  map,
  spread,
  concat,
  range,
  zipWith,
  filter,
  sum,
  eq,
  size,
  property,
} from "lodash/fp";
import fastCartesian from "fast-cartesian";
import { IDPREFIXES } from "./Constants";
import {
  PositionGroup,
  BaseEntities,
  BaseCountries,
  SaveArguments,
  Save,
} from "./Types";
import {
  NONSPACESCHARACTERRANGE,
  DEFAULTTESTMATCHESCOUNT,
  TESTRANDOMSEASONRANGE,
  DOUBLEBETWEENZEROAND1RANGE,
  TESTROUNDROBINCLUBSRANGE,
} from "./Constants";
import {
  getFirstLevelArrayLengths,
  getPartsOfIDAsArray,
  filterGoalkeepersByID,
  filterMidfieldersByID,
  filterAttackersByID,
  filterDefendersByID,
  getPlayerPositionGroupFromID,
  getBaseEntitiesClubIDAtSpecificIndex,
  getBaseEntitiesDomesticLeagueIDAtSpecificIndex,
  getBaseEntitiesClubIDsForADomesticLeagueIndex,
  getBaseEntitiesDomesticLeagueIDsForACountryIndex,
  getBaseEntitiesClubs,
  getBaseEntitiesDomesticLeagues,
  getBaseEntitiesCountries,
  getFirstAndTailOfArray,
} from "./Getters";
import {
  unfold,
  unfoldStringStartingIndexAndCountTuplesIntoShuffledArrayOfStringIDs,
  unfoldAndShuffleArray,
  nonZeroBoundedModularAddition,
  minusOne,
  addMinusOne,
  generateSkillsPhysicalContractDataForMultiplePositionGroups,
  convertToSet,
  sortByIdentity,
  convertBaseCountriesToBaseEntities,
  createSave,
  convertRangeSizeAndMinIntoRange,
  mapFlatten,
  convertCharacterCodeIntoCharacter,
  convertArrayOfArraysIntoShuffledArray,
  addOne,
  unfoldSingleStringStartingIndexAndCountTupleIntoArrayOfStringIDs,
  zipApply,
  joinOnUnderscores,
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

export const fastCheckRandomObjectKey = curry(
  (fcGen: fc.GeneratorValue, object: Record<string, any>): string => {
    return pipe([Object.keys, fastCheckRandomItemFromArray(fcGen)])(object);
  },
);

export const fastCheckRandomItemFromArray = curry(
  <TValue>(
    fcGen: fc.GeneratorValue,
    testArray: Array<TValue>,
  ): fc.Arbitrary<TValue> => {
    return fcGen(fc.constantFrom, ...testArray);
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
  unfoldStringStartingIndexAndCountTuplesIntoShuffledArrayOfStringIDs,
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

export const createTestSave = curry(
  (
    fcGen: fc.GeneratorValue,
    [testPlayerName, testSeason, testCountriesDomesticsLeaguesClubsCount]: [
      string,
      number,
      [number, number, number],
    ],
  ): Save => {
    const testBaseEntities: BaseEntities = fastCheckTestBaseEntitiesGenerator(
      [testSeason, testCountriesDomesticsLeaguesClubsCount],
      fcGen,
    );

    const [testPlayerMainDomesticLeague, testPlayerClub]: [string, string] =
      getCompletelyRandomClubIDAndDomesticLeagueID(fcGen, testBaseEntities);

    const testSaveArguments: SaveArguments = {
      Name: testPlayerName,
      UserMainDomesticLeagueID: testPlayerMainDomesticLeague,
      UserClubID: testPlayerClub,
      CurrentSeason: testSeason,
      BaseEntities: testBaseEntities,
    };

    return createSave(testSaveArguments);
  },
);

export const fastCheckTestCountriesForBaseCountriesGenerator =
  fastCheckNLengthUniqueStringArrayGenerator;

export const fastCheckTestDomesticLeaguesForBaseCountriesGenerator = (
  fcGen: fc.GeneratorValue,
  [countriesCount, competitionsPerCountryCount]: [number, number],
): Array<Array<string>> => {
  return pipe([
    multiply(countriesCount),
    fastCheckNLengthUniqueStringArrayGenerator(fcGen),
    chunk(competitionsPerCountryCount),
  ])(competitionsPerCountryCount);
};

export const fastCheckTestClubsForBaseCountriesGenerator = (
  fcGen: fc.GeneratorValue,
  [countriesCount, competitionsPerCountryCount, clubsPerDomesticLeaguesCount]: [
    number,
    number,
    number,
  ],
): Array<Array<Array<string>>> => {
  return pipe([
    multiply(competitionsPerCountryCount),
    multiply(clubsPerDomesticLeaguesCount),
    fastCheckNLengthUniqueStringArrayGenerator(fcGen),
    chunk(clubsPerDomesticLeaguesCount),
    chunk(competitionsPerCountryCount),
  ])(countriesCount);
};

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
      zipWith(
        (func: Function, args) => {
          return func(fcGen, args);
        },
        [
          fastCheckTestCountriesForBaseCountriesGenerator,
          fastCheckTestDomesticLeaguesForBaseCountriesGenerator,
          fastCheckTestClubsForBaseCountriesGenerator,
        ],
      ),
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

export const fastCheckTestSingleBaseEntityWithSubEntitiesGenerator = curry(
  (
    testSubEntityIDPrefix: IDPREFIXES,
    fcGen: fc.GeneratorValue,
    [startingIndex, subEntitiesCount]: [number, number],
  ): [string, Array<[string, string]>] => {
    const subEntityIDs: Array<string> =
      unfoldSingleStringStartingIndexAndCountTupleIntoArrayOfStringIDs(
        testSubEntityIDPrefix,
        [startingIndex, subEntitiesCount],
      );
    return pipe([
      addOne,
      fastCheckNLengthUniqueStringArrayGenerator(fcGen),
      getFirstAndTailOfArray,
      zipApply([identity, zip(subEntityIDs)]),
    ])(subEntitiesCount);
  },
);

export const fastCheckTestSingleCountryWithCompetitionsGenerator =
  fastCheckTestSingleBaseEntityWithSubEntitiesGenerator(
    IDPREFIXES.DomesticLeague,
  );

export const fastCheckTestSingleDomesticLeagueWithClubsGenerator =
  fastCheckTestSingleBaseEntityWithSubEntitiesGenerator(IDPREFIXES.Club);

export const fastCheckTestBaseEntitiesGenerator = curry(
  (
    fcGen: fc.GeneratorValue,
    [testSeason, testCountriesDomesticsLeaguesClubsCount]: [
      number,
      [number, number, number],
    ],
  ): BaseEntities => {
    return pipe([
      fastCheckTestBaseCountriesGenerator(fcGen),
      convertBaseCountriesToBaseEntities(testSeason),
    ])(testCountriesDomesticsLeaguesClubsCount);
  },
);

export const getRandomCountryIndex = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): string => {
  return pipe([getBaseEntitiesCountries, fastCheckRandomObjectKey(fcGen)])(
    testBaseEntities,
  );
};

export const getRandomDomesticLeagueIndex = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): [string, string] => {
  const randomCountryIndex: string = getRandomCountryIndex(
    fcGen,
    testBaseEntities,
  );
  return pipe([
    getBaseEntitiesDomesticLeagues,
    property([randomCountryIndex]),
    fastCheckRandomObjectKey(fcGen),
    concat([randomCountryIndex]),
  ])(testBaseEntities);
};

export const getRandomClubIndex = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): [string, string, string] => {
  const randomClubIndex: [string, string] = getRandomDomesticLeagueIndex(
    fcGen,
    testBaseEntities,
  );
  return pipe([
    getBaseEntitiesClubs,
    property(randomClubIndex),
    fastCheckRandomObjectKey(fcGen),
    concat(randomClubIndex),
  ])(testBaseEntities);
};

export const getRandomDomesticLeagueIndexFromSpecificCountryIndex = curry(
  (
    [fcGen, testBaseEntities]: [fc.GeneratorValue, BaseEntities],
    countryIndex: string,
  ): [string, string] => {
    return pipe([
      getBaseEntitiesDomesticLeagueIDsForACountryIndex,
      fastCheckRandomObjectKey(fcGen),
      concat([countryIndex]),
    ])(testBaseEntities, countryIndex);
  },
);

export const getRandomClubIndexFromSpecificCountryDomesticLeagueIndex = curry(
  (
    [fcGen, testBaseEntities]: [fc.GeneratorValue, BaseEntities],
    countryDomesticLeagueIndicesTuple: [string, string],
  ): [string, string, string] => {
    return pipe([
      getBaseEntitiesClubIDsForADomesticLeagueIndex,
      fastCheckRandomObjectKey(fcGen),
      concat(countryDomesticLeagueIndicesTuple),
    ])(testBaseEntities, countryDomesticLeagueIndicesTuple);
  },
);

export const getCompletelyRandomDomesticLeagueID = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): string => {
  return pipe([
    getRandomDomesticLeagueIndex,
    getBaseEntitiesDomesticLeagueIDAtSpecificIndex(testBaseEntities),
  ])(fcGen, testBaseEntities);
};

export const getCompletelyRandomClubID = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): string => {
  return pipe([
    getRandomClubIndex,
    getBaseEntitiesClubIDAtSpecificIndex(testBaseEntities),
  ])(fcGen, testBaseEntities);
};

export const getCompletelyRandomClubIDAndDomesticLeagueID = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): [string, string] => {
  const [randomCountryIndex, randomCompetitionIndex, randomClubIndex] =
    getRandomClubIndex(fcGen, testBaseEntities);
  const randomCompetitionID: string =
    getBaseEntitiesDomesticLeagueIDAtSpecificIndex(testBaseEntities, [
      randomCountryIndex,
      randomCompetitionIndex,
    ]);
  const randomClubID: string = getBaseEntitiesClubIDAtSpecificIndex(
    testBaseEntities,
    [randomCountryIndex, randomCompetitionIndex, randomClubIndex],
  );

  return sortByIdentity([randomClubID, randomCompetitionID]) as [
    string,
    string,
  ];
};

export const getAListOfRandomClubIDs = curry(
  (
    [fcGen, testBaseEntities]: [fc.GeneratorValue, BaseEntities],
    clubsCount: number,
  ): Array<string> => {
    return unfold(() => getCompletelyRandomClubID(fcGen, testBaseEntities))(
      clubsCount,
    );
  },
);

export const getAListOfRandomMatches = curry(
  (
    matchCount: number,
    [fcGen, testBaseEntities]: [fc.GeneratorValue, BaseEntities],
  ): Array<[string, string]> => {
    return pipe([
      multiply(2),
      getAListOfRandomClubIDs([fcGen, testBaseEntities]),
      chunk(2),
    ])(matchCount);
  },
);

export const defaultGetAListOfRandomMatches = getAListOfRandomMatches(
  DEFAULTTESTMATCHESCOUNT,
);

export const getActualPositionGroupSet = pipe([
  map(getPlayerPositionGroupFromID),
  convertToSet,
]);

export const getActualPositionCountStartingIndexTuplesSet = pipe(
  over([
    filterGoalkeepersByID,
    filterMidfieldersByID,
    filterAttackersByID,
    filterDefendersByID,
  ]),
  map((players: Array<string>): [string, number, number] => {
    const [playerPosition, playerIndex] = pipe([first, getPartsOfIDAsArray])(
      players,
    );
    return [playerPosition, size(players), parseInt(playerIndex)];
  }),
  convertToSet,
);
export const generateTestOutfieldPlayersComposition = (
  fcGen: fc.GeneratorValue,
): Array<number> => {
  return pipe([
    (nums: Array<number>) => fastCartesian([nums, nums, nums]),
    filter(pipe([sum, eq(10)])),
    (compositons: Array<Array<number>>) =>
      fcGen(fc.constantFrom, ...compositons),
  ])(range(1, 11));
};

export const generateTestComposition = curry(
  (
    startingIndex: number,
    fcGen: fc.GeneratorValue,
  ): Array<[number, number, number]> => {
    const testPositionGroups = Object.values(PositionGroup);
    return pipe([
      generateTestOutfieldPlayersComposition,
      concat([1]),
      zipWith(
        (
          positionGroup: string,
          positionCount: number,
        ): [string, number, number] => {
          return [positionGroup, positionCount, startingIndex];
        },
        testPositionGroups,
      ),
    ])(fcGen);
  },
);

export const generateTestStartingEleven = pipe([
  generateTestComposition(0),
  generateSkillsPhysicalContractDataForMultiplePositionGroups,
]);

export const generateTwoTestStartingElevens = pipe([
  zip([0, 11]),
  map(spread(generateTestComposition)),
  map(generateSkillsPhysicalContractDataForMultiplePositionGroups),
]);

export const generateTwoTestStartingElevenTuples = pipe([
  over([map(fastCheckRandomInteger), generateTwoTestStartingElevens]),
  zipAll,
]);
