import {
  pipe,
  concat,
  map,
  flatten,
  curry,
  over,
  identity,
  add,
  first,
  last,
  split,
  shuffle,
  reduce,
  sum,
  join,
  zipAll,
  zipObject,
  flattenDepth,
  zipWith,
  initial,
  flatMap,
  spread,
  range,
  overEvery,
  filter,
  take,
  reverse,
  takeRight,
  multiply,
  mean,
  at,
  property,
  subtract,
  max,
  findIndex,
  divide,
  min,
  chunk,
  overSome,
  head,
  tail,
  update,
  sortBy,
  partition,
} from "lodash/fp";
import {
  addDays,
  subDays,
  addWeeks,
  addMonths,
  addYears,
  isWithinInterval,
  differenceInCalendarDays,
  startOfYear,
  nextMonday,
  lastDayOfMonth,
  eachWeekendOfMonth,
  isSunday,
  isEqual,
  getWeekOfMonth,
} from "date-fns/fp";
import { mapIndexed, updatePaths, updateAllPaths } from "futil-js";
import {
  BaseEntities,
  Entity,
  BaseEntity,
  BaseCountry,
  Save,
  SaveArguments,
  PositionGroup,
  ATTACKINGSKILLS,
  DEFENDINGSKILLS,
  GOALKEEPINGSKILLS,
} from "./Types";
import {
  JANUARY,
  FEBRUARY,
  AUGUST,
  JUNE,
  THETA,
  SHAPE,
  POSSIBLEGOALS,
  U,
  HOMEEFFECT,
  DEFENSESTRENGTHBALANCE,
  BASECLUBCOMPOSITION,
  DEFAULTSQUADSIZE,
  PLAYERSPEROUTFIELDPOSITIONGROUP,
  MAXPLAYERIDPREFIXPLUSONE,
} from "./Constants";
import { PLAYERBIODATABYPOSITION } from "./PlayerBioConstants";
import {
  PLAYERSKILLSPHYSICALCONTRACTRANGESBYPOSITION,
  PLAYERSKILLSPHYSICALCONTRACTRANDOMPLUSORMINUS,
} from "./PlayerDataConstants";
import { FIRSTNAMES, LASTNAMES, COUNTRYNAMES } from "./Names";
import {
  getFirstTwoArrayValues,
  getLastTwoArrayValues,
  isGoalkeeperID,
  getBaseEntitiesClubs,
  getBaseEntitiesDomesticLeagues,
  getBaseEntitiesClubsCount,
} from "./Getters";

export const convertToSet = <T>(collection: Array<T>): Set<T> => {
  return new Set(collection);
};

export const sortByIdentity = sortBy(identity);
export const sortTuplesByFirstValueInTuple = sortBy(first);

export const flattenCompetitions = flattenDepth(1);
export const flattenClubs = flattenDepth(2);

export const createStringID = curry(
  (string: string, idNumber: number): string =>
    joinOnUnderscores([string, idNumber]),
);

const spreadCreateStringID = spread(createStringID);

export const createStringIDWithSeason = curry(
  (season: string, string: string, idNumber: number): string =>
    joinOnUnderscores([string, idNumber, season]),
);

export const unfold = curry(
  <T>(unfolder: (index: number) => T, arraySize: number): Array<T> => {
    return Array.from({ length: arraySize }, (_, index: number) =>
      unfolder(index),
    );
  },
);

export const unfoldItemCountTupleIntoArray = curry(
  <T>([item, count]: [T, number]): Array<T> => {
    return Array(count).fill(item);
  },
);

export const unfoldStartingIndexAndCountIntoRange = curry(
  (startingIndex: number, count: number): Array<number> => {
    return unfold(add(startingIndex), count);
  },
);

export const spreadUnfold = spread(unfold);
export const mapSpreadUnfold = map(spreadUnfold);
export const flatMapSpreadUnfold = flatMap(spreadUnfold);
export const unfoldAndShuffleArray = curry(
  (arraySize: number, unfolder: (index: number) => any): Array<any> => {
    return pipe([unfold, shuffle])(unfolder, arraySize);
  },
);

export const unfoldItemCountTuplesIntoTupleOfArrays = map(
  unfoldItemCountTupleIntoArray,
);

export const unfoldItemCountTuplesIntoMixedArray = flatMap(
  unfoldItemCountTupleIntoArray,
);

export const unfoldBooleanCountTuplesIntoArrayOfBooleans = pipe([
  unfoldItemCountTuplesIntoMixedArray,
  map(Boolean),
]);

export const unfoldBooleanCountTuplesIntoShuffledArrayOfBooleans = pipe([
  unfoldBooleanCountTuplesIntoArrayOfBooleans,
  shuffle,
]);

export const unfoldSingleStringStartingIndexAndCountTupleIntoArrayOfStringIDs =
  curry(
    (id: string, [startingIndex, count]: [number, number]): Array<string> => {
      return unfold(pipe([add(startingIndex), createStringID(id)]), count);
    },
  );

export const unfoldStringStartingIndexAndCountTuplesIntoArrayOfArrayOfStringIDs =
  (
    stringStartingIndexAndCountTuples: Array<[string, number, number]>,
  ): Array<Array<string>> => {
    return pipe([
      map(([string, count, startingIndex]: [string, number, number]) => {
        return [pipe([add(startingIndex), createStringID(string)]), count];
      }),
      mapSpreadUnfold,
    ])(stringStartingIndexAndCountTuples);
  };

export const unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs = (
  stringStartingIndexAndCountTuples: Array<[string, number, number]>,
): Array<string> => {
  return pipe([
    unfoldStringStartingIndexAndCountTuplesIntoArrayOfArrayOfStringIDs,
    flatten,
  ])(stringStartingIndexAndCountTuples);
};

export const unfoldStringStartingIndexAndCountTuplesIntoShuffledArrayOfStringIDs =
  (
    stringStartingIndexAndCountTuples: Array<[string, number, number]>,
  ): Array<string> => {
    return pipe([
      unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs,
      shuffle,
    ])(stringStartingIndexAndCountTuples);
  };

export const apply = <T>(func: (arg: T) => T, arg: T) => func(arg);

export const zipApply = zipWith(apply);
export const spreadZipApply = spread(zipApply);

export const spreadZipObject = spread(zipObject);
export const zipAdd = zipWith<number, number, number>(add);

export const zipChunk = zipWith(chunk);
export const spreadZipChunk = spread(zipChunk);

export const zipAllAndTransformXArrayWithY = curry(
  <T, V>(
    [getter, transformer]: [(arg: Array<T>) => T, (arg: Array<T>) => V],
    array: Array<Array<T>>,
  ): V => {
    return pipe([zipAll, getter, transformer])(array);
  },
);

export const zipAllAndGetFirstArray = zipAllAndTransformXArrayWithY([
  first,
  identity,
]);
export const zipAllAndGetInitial = zipAllAndTransformXArrayWithY([
  initial,
  identity,
]);
export const zipAllAndGetSecondArray = zipAllAndTransformXArrayWithY([
  property([1]),
  identity,
]);
export const zipAllAndGetLastArray = zipAllAndTransformXArrayWithY([
  last,
  identity,
]);

export const zipAllAndGetSumOfFirstArray = zipAllAndTransformXArrayWithY([
  first,
  sum,
]);
export const zipAllAndGetSumOfSecondArray = zipAllAndTransformXArrayWithY([
  property([1]),
  sum,
]);
export const zipAllAndGetSumOfLastArray = zipAllAndTransformXArrayWithY([
  last,
  sum,
]);

export const zipAllAndGetMinOfFirstArray = zipAllAndTransformXArrayWithY([
  first,
  min,
]);
export const zipAllAndGetMinOfSecondArray = zipAllAndTransformXArrayWithY([
  property([1]),
  min,
]);
export const zipAllAndGetMinOfLastArray = zipAllAndTransformXArrayWithY([
  last,
  min,
]);

export const convertConcatenatedArraysIntoSet = pipe([concat, convertToSet]);
export const convertFlattenedArrayIntoSet = pipe([flatten, convertToSet]);
export const convertArrayOfArraysToArrayOfSets = map(convertToSet);
export const convertArrayOfIntegersIntoArrayOfStrings = map(toString);
export const convertArrayOfStringsIntoArrayOfIntegers = map(parseInt);

export const mapFlatten = map(flatten);
export const convertArrayOfArraysIntoShuffledArray = pipe([flatten, shuffle]);

export const convertRangeSizeAndMinIntoRange = curry(
  (rangeSize: number, rangeMin: number): [number, number] => {
    return over<number>([identity, pipe([add(rangeSize), add(1)])])(
      rangeMin,
    ) as [number, number];
  },
);

export const convertArrayIntoLinearRange = pipe([
  Object.keys,
  over([first, last]),
  convertArrayOfStringsIntoArrayOfIntegers,
]);

export const foldArrayOfArraysIntoArrayOfLinearRanges = map(
  convertArrayIntoLinearRange,
);

export const convertObjectKeysIntoSet = pipe([
  Object.keys,
  <T>(collection: Array<T>): Set<T> => new Set(collection),
]);

export const zipDivide = zipWith(divide);
export const spreadZipDivide = spread(zipDivide);
export const spreadDivide = spread(divide);
export const addOne = add(1);
export const minusOne = add(-1);
export const multiplyByTwo = multiply(2);
export const divideByTwo = multiply(1 / 2);
export const half = multiply(1 / 2);
export const convertIntegerToPercentage = multiply(0.01);
export const convertIntegersToPercentages = map(convertIntegerToPercentage);
export const addMinusOne = curry((intOne: number, intTwo: number) =>
  pipe([add, minusOne])(intOne, intTwo),
);
export const addPlusOne = curry((intOne: number, intTwo: number) =>
  pipe([add, addOne])(intOne, intTwo),
);
export const spreadThenSubtract = spread(subtract);

export const reverseThenSpreadSubtract = pipe([reverse, spreadThenSubtract]);

export const accumulate = curry(
  <T>([func, initial]: [Function, T], array: Array<T>): Array<T> => {
    return reduce(
      (previous: Array<T>, current: any): Array<T> => {
        return concat(previous, func(current, last(previous) || initial));
      },
      [],
      array,
    );
  },
);

export const getRunningSumOfList = accumulate([add, 0]);
export const multiplyAccumulate = accumulate([multiply, 1]);
export const spreadMultiply = pipe([multiplyAccumulate, last]);

export const normalizePercentages = (
  percentages: Array<number>,
): Array<number> => {
  const sumOfPercentages: number = sum(percentages);
  return map((percent: number): number => percent / sumOfPercentages)(
    percentages,
  );
};

export const weightedMean = curry(
  (arrWeights: number[], arrValues: number[]): number => {
    return pipe([
      normalizePercentages,
      over([pipe([zipWith(multiply, arrValues), sum]), sum]),
      ([totalOfValues, totalOfWeights]: [number, number]) =>
        totalOfValues / totalOfWeights,
    ])(arrWeights);
  },
);

export const weightedRandom = <T>([weights, items]: [
  number[],
  Array<T>,
]): T => {
  return pipe([
    normalizePercentages,
    getRunningSumOfList,
    max,
    multiply(Math.random()),
    (randomNumber: number): number =>
      findIndex((weight: number) => weight >= randomNumber)(weights),
    (randomIndex: number): T => items.at(randomIndex),
  ])(weights);
};

export const getAverageModularStepForRangeOfData = (
  ranges: Array<[number, number]>,
  lengthOfRangeToBeFilled: number,
): number => {
  return pipe([
    map(([min, max]: [number, number]) => addOne(max - min)),
    sum,
    multiply(1 / lengthOfRangeToBeFilled),
    Math.ceil,
  ])(ranges);
};

export const mod = curry(
  (divisor: number, dividend: number): number => dividend % divisor,
);

export const simpleModularArithmetic = curry(
  (
    arithmeticFunction: (arg: number) => number,
    rangeMax: number,
    num: number,
  ): number => {
    return arithmeticFunction(num) % rangeMax;
  },
);

export const modularAddition = simpleModularArithmetic(addOne);
export const modularSubtraction = simpleModularArithmetic(minusOne);

export const nonZeroBoundedModularAddition = curry(
  (
    [rangeMin, rangeMax]: [number, number],
    standardIncrease: number,
    currentNumber: number,
  ): number => {
    if (rangeMax == 0) {
      return 0;
    }
    return add(
      subtract(add(standardIncrease, currentNumber), rangeMin) %
        subtract(addOne(rangeMax), rangeMin),
      rangeMin,
    );
  },
);

export const mapModularIncreasersWithTheSameAverageStep = curry(
  (
    [plusOrMinus, playerCount]: [number, number],
    ranges: Array<[number, number]>,
  ) => {
    const randomPlusOrMinus: number = getRandomPlusOrMinus(plusOrMinus);
    const step: number =
      getAverageModularStepForRangeOfData(ranges, playerCount) +
      randomPlusOrMinus;
    return map((range: [number, number]) => {
      return nonZeroBoundedModularAddition(range, step);
    })(ranges);
  },
);

export const mapModularIncreasersWithDifferentStepsForARange = curry(
  (playerCount: number, ranges: Array<[number, number]>) => {
    return map(([min, max]: [number, number]) => {
      const step: number = Math.ceil((max - min) / playerCount);
      return nonZeroBoundedModularAddition([min, max], step);
    })(ranges);
  },
);

export const getRandomNumberInRange = ([min, max]: [
  number,
  number,
]): number => {
  const minCeiled = Math.ceil(min),
    maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

export const getRandomNumberInRanges = map(getRandomNumberInRange);

export const getRandomPlusOrMinus = pipe([
  over([multiply(-1), identity]),
  getRandomNumberInRange,
]);

export const getRunningSumOfListOfTuples = curry(
  (
    initialValue: number,
    listOfTuples: Array<[any, number]>,
  ): Array<[string, number, number]> => {
    const getTupleRunningRange = (
      [currentAny, currentCount]: [any, number],
      [previousAny, previousCount, previousRunningTotal]: [any, number, number],
    ) => {
      return [[currentAny, currentCount, currentCount + previousRunningTotal]];
    };

    return accumulate(
      [getTupleRunningRange, ["", 0, initialValue]],
      listOfTuples,
    );
  },
);

export const getUndadjustedAverageStepForASetOfModularRanges = pipe([
  map(([min, max]: [number, number]) => addOne(max - min)),
  mean,
  Math.ceil,
]);

export const getLengthOfLinearRange = pipe([
  reverseThenSpreadSubtract,
  minusOne,
]);

export const splitOnUnderscores = split("_");
export const joinOnUnderscores = join("_");
export const convertCharacterIntoCharacterCode = (character: string): number =>
  character.charCodeAt(0);
export const convertCharacterCodeIntoCharacter = (integer: number): string =>
  String.fromCharCode(integer);
export const convertArrayOfIntegersIntoArrayOfCharacters = map(
  convertCharacterIntoCharacterCode,
);

export const createCountry = (
  name: string,
  competitions: Array<[string, string]>,
): Entity => {
  return pipe([zipAll, initial, concat([name])])(competitions);
};

export const createCompetition = (
  name: string,
  clubs: Array<[string, string]>,
): Entity => {
  return pipe([zipAll, initial, shuffle, concat([name])])(clubs);
};

export const createClub = (name: string, squad: Array<string>): Entity => {
  return [name, squad];
};

export const createPlayerIDsForClubs = (totalClubs: number) => {
  const adjuster = mod(DEFAULTSQUADSIZE);
  const idTransformer = (index: number) =>
    Math.floor(adjuster(index) / PLAYERSPEROUTFIELDPOSITIONGROUP) %
    MAXPLAYERIDPREFIXPLUSONE;

  return pipe([
    multiply(DEFAULTSQUADSIZE),
    unfold((index: number) =>
      pipe([over([idTransformer, identity]), spreadCreateStringID])(index),
    ),
    chunk(DEFAULTSQUADSIZE),
  ])(totalClubs);
};

export const convertBaseCountriesToBaseEntities = curry(
  (season: number, baseCountries: Array<BaseCountry>): BaseEntities => {
    const updater = {
      countries: mapIndexed((countryName: string, index: number) => [
        `Country_${index + 1}`,
        countryName,
      ]),
      domesticLeagues: transformCompetitions(
        mapIndexed((competitionName: string, index: number) => [
          `DomesticLeague_${season}_${index + 1}`,
          competitionName,
        ]),
      ),
      clubs: transformClubs(
        mapIndexed((clubName: string, index: number) => [
          `Club_${season}_${index + 1}`,
          clubName,
        ]),
      ),
    };
    return pipe([
      zipAll,
      zipObject(["countries", "domesticLeagues", "clubs"]),
      pipe([updatePaths(updater)]),
    ])(baseCountries);
  },
);

export const runModularIncreasersModularlyOverARangeOfPlayers = (
  [startingRange, modularIncreasers]: [Array<number>, Array<Function>],
  [positionGroup, count, startingIndex]: [PositionGroup, number, number],
): Array<[string, Array<number>]> => {
  const modularAdditionFuncForListOfRanges = modularAddition(
    startingRange.length,
  );

  return pipe([
    reduce(
      (
        [playerData, currentRange, indexToUpdate]: [
          Array<[string, Array<number>]>,
          Array<number>,
          number,
        ],
        playerNumber: number,
      ): [Array<[string, Array<number>]>, Array<number>, number] => {
        const updater: Function = property(indexToUpdate, modularIncreasers);
        const updatedRange = update(indexToUpdate, updater, currentRange);

        return [
          concat(playerData, [
            [`${positionGroup}_${playerNumber}`, currentRange],
          ]),
          updatedRange,
          modularAdditionFuncForListOfRanges(indexToUpdate),
        ];
      },
      [[], startingRange, 0],
    ),
    first,
  ])(range(startingIndex, startingIndex + count));
};

export const runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers = (
  [startingRange, modularIncreasers]: [Array<number>, Array<Function>],
  [positionGroup, count, startingIndex]: [PositionGroup, number, number],
): Array<[string, Array<number>]> => {
  return pipe([
    reduce(
      (
        [playerData, currentRange]: [
          Array<[string, Array<number>]>,
          Array<number>,
        ],
        playerNumber: number,
      ): [Array<[string, Array<number>]>, Array<number>] => {
        const updatedRange: Array<number> = zipWith(
          (func: Function, currentValue: number): number => {
            return func(currentValue);
          },
        )(modularIncreasers, currentRange);
        return [
          concat(playerData, [
            [`${positionGroup}_${playerNumber}`, currentRange],
          ]),
          updatedRange,
        ];
      },
      [[], startingRange],
    ),
    first,
  ])(range(startingIndex, startingIndex + count));
};

export const generateDataForAGroupOfPlayersByAveragingModularIncreases = curry(
  (
    [ranges, plusOrMinus]: [Array<[number, number]>, number],
    [positionGroup, count, startingIndex]: [PositionGroup, number, number],
  ): Promise<Array<[string, Array<number>]>> => {
    const [modularIncreasers, minOfRangesOnly] = pipe([
      over([
        mapModularIncreasersWithTheSameAverageStep([plusOrMinus, count]),
        map(first),
      ]),
    ])(ranges);

    return runModularIncreasersModularlyOverARangeOfPlayers(
      [minOfRangesOnly, modularIncreasers],
      [positionGroup, count, startingIndex],
    );
  },
);

export const generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers =
  curry(
    (
      [ranges, increasers]: [Array<[number, number]>, Array<Function>],
      [positionGroup, count, startingIndex]: [PositionGroup, number, number],
    ): Promise<Array<[string, Array<number>]>> => {
      const randomStarts: Array<number> = getRandomNumberInRanges(ranges);
      return runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers(
        [randomStarts, increasers],
        [positionGroup, count, startingIndex],
      );
    },
  );

export const generateSkillsPhysicalContractDataForMultiplePositionGroups = pipe(
  [
    map(
      ([positionGroup, count, startingIndex]: [
        PositionGroup,
        number,
        number,
      ]) => {
        return generateDataForAGroupOfPlayersByAveragingModularIncreases(
          [
            property(
              [positionGroup],
              PLAYERSKILLSPHYSICALCONTRACTRANGESBYPOSITION,
            ),
            PLAYERSKILLSPHYSICALCONTRACTRANDOMPLUSORMINUS,
          ],
          [positionGroup, count, startingIndex],
        );
      },
    ),
    flatten,
    Object.fromEntries,
  ],
);

export const generatePlayerBioDataForMultiplePositionGroups = (
  positionGroupCountStartingIndexTuples: Array<[PositionGroup, number, number]>,
): Promise<Array<[string, Array<number>]>> => {
  const namesAndCountriesRanges: Array<[number, number]> =
    foldArrayOfArraysIntoArrayOfLinearRanges([
      FIRSTNAMES,
      LASTNAMES,
      COUNTRYNAMES,
    ]);
  return pipe([
    map(
      ([positionGroup, playerCount, startingIndex]: [
        PositionGroup,
        number,
        number,
      ]) => {
        const [positionRange, positionGroupRange] = property(
          [positionGroup],
          PLAYERBIODATABYPOSITION,
        );
        const ranges = concat(namesAndCountriesRanges, [
          positionRange,
          positionGroupRange,
        ]);
        const namesAndCountriesIncreasers =
          mapModularIncreasersWithDifferentStepsForARange(
            playerCount,
            namesAndCountriesRanges,
          );
        const increasers = concat(namesAndCountriesIncreasers, [
          identity,
          nonZeroBoundedModularAddition([positionGroupRange, 1]),
        ]);

        return generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers(
          [ranges, increasers],
          [positionGroup, playerCount, startingIndex],
        );
      },
    ),
    flatten,
  ])(positionGroupCountStartingIndexTuples);
};

// can't export getClubs and flattenClubs?
export const generatePlayerSkillsPhysicalContractDataForListOfClubs = (
  startingIndex: number,
  entities: BaseEntities,
) => {
  return pipe([
    getBaseEntitiesClubsCount,
    getTotalPlayersToGenerateBasedOnGivenComposition(
      BASECLUBCOMPOSITION,
      startingIndex,
    ),
    generateSkillsPhysicalContractDataForMultiplePositionGroups,
  ])(entities);
};

export const generatePlayerBioDataForListOfClubs = (
  startingIndex: number,
  entities: BaseEntities,
) => {
  return pipe([
    getBaseEntitiesClubsCount,
    getTotalPlayersToGenerateBasedOnGivenComposition(
      BASECLUBCOMPOSITION,
      startingIndex,
    ),
    generatePlayerBioDataForMultiplePositionGroups,
  ])(entities);
};

// accepts a transformers object
export const createEntities = (
  baseEntities: BaseEntities,
): Promise<Record<string, Entity>> => {
  const baseEntitiesPlayers: Array<Array<string>> = pipe([
    getBaseEntitiesClubs,
    createPlayerIDsForClubs,
  ])(baseEntities);

  return pipe([
    updateAllPaths({
      countries: pipe([
        zipWith(
          (
            competitions: Array<BaseEntity>,
            [id, name]: BaseEntity,
          ): [string, Entity] => {
            return [id, createCountry(name, competitions)];
          },
          getBaseEntitiesDomesticLeagues(baseEntities),
        ),
      ]),
      domesticLeagues: pipe([
        flatten,
        zipWith(
          (
            clubs: Array<BaseEntity>,
            [id, name]: BaseEntity,
          ): [string, Entity] => {
            return [id, createCompetition(name, clubs)];
          },
          pipe([getBaseEntitiesClubs, flattenCompetitions])(baseEntities),
        ),
      ]),
      clubs: pipe([
        flattenDepth(2),
        zipWith(
          (
            players: Array<string>,
            [id, name]: BaseEntity,
          ): [string, Entity] => {
            return [id, createClub(name, players)];
          },
          baseEntitiesPlayers,
        ),
      ]),
      players: (): Promise<Array<[string, Array<number>]>> => {
        return generatePlayerBioDataForListOfClubs(0, baseEntities);
      },
    }),
    Object.values,
    flatten,
    Object.fromEntries,
  ])(baseEntities);
};

export const createSave = ({
  Name,
  UserMainDomesticLeagueID,
  CurrentSeason,
  UserClubID,
  BaseEntities,
}: SaveArguments): Promise<Save> => {
  return {
    Name,
    UserMainDomesticLeagueID,
    UserClubID,
    SeasonsPlayed: 1,
    CurrentSeason,
    CurrentDate: getThirdSundayOfAugust(CurrentSeason),
    Entities: createEntities(BaseEntities),
    EntitiesStatistics: {},
    PlayerSkillsAndPhysicalData:
      generateSkillsPhysicalContractDataForMultiplePositionGroups(
        0,
        BaseEntities,
      ),
    SaveID: crypto.randomUUID(),
  };
};

export const calculateMeanCategoryStrengthForPlayer = curry(
  (skills: Array<string>, player: [string, Array<number>]): number => {
    return pipe([last, at(skills), mean])(player);
  },
);

export const calculateMeanAttackingStrengthForPlayer =
  calculateMeanCategoryStrengthForPlayer(Object.values(ATTACKINGSKILLS));

export const calculateMeanCategoryStrengthForGroupOfPlayers = curry(
  (skills: Array<string>, players: Array<[string, Array<number>]>): number => {
    return pipe([map(calculateMeanCategoryStrengthForPlayer(skills)), mean])(
      players,
    );
  },
);

export const calculateDefenseStrength = (
  playerSkills: Record<string, Array<number>>,
): number => {
  const [DEFENDINGSKILLSASLIST, GOALKEEPINGSKILLSASLIST] = map(Object.values)([
    DEFENDINGSKILLS,
    GOALKEEPINGSKILLS,
  ]);

  return pipe(
    Object.entries,
    partition(pipe([first, isGoalkeeperID])),
    over([
      pipe([
        first,
        first,
        calculateMeanCategoryStrengthForPlayer(GOALKEEPINGSKILLSASLIST),
      ]),
      pipe([
        tail,
        first,
        calculateMeanCategoryStrengthForGroupOfPlayers(DEFENDINGSKILLSASLIST),
      ]),
    ]),
    weightedMean(DEFENSESTRENGTHBALANCE),
  )(playerSkills);
};

export const calculateAttackStrength = (
  playerSkills: Record<string, Array<number>>,
): number => {
  const ATTACKINGSKILLSASLIST = Object.values(ATTACKINGSKILLS);
  return pipe([
    Object.entries,
    calculateMeanCategoryStrengthForGroupOfPlayers(ATTACKINGSKILLSASLIST),
  ])(playerSkills);
};

export const calculateClubStrengths = pipe([
  over([calculateAttackStrength, calculateDefenseStrength]),
]);

export const calculateHomeStrength = ([homeAttack, awayDefense]: [
  number,
  number,
]): number => {
  return Math.exp(-Math.exp(U + HOMEEFFECT + homeAttack + awayDefense));
};

export const calculateAwayStrength = ([awayAttack, homeDefense]: [
  number,
  number,
]): number => {
  return Math.exp(-Math.exp(U + awayAttack + homeDefense));
};

export const calculateMatchStrengths = pipe([
  map(calculateClubStrengths),
  over([pipe([first, identity]), pipe([last, reverse])]),
  zipAll,
  map(convertIntegersToPercentages),
  over([
    pipe([first, calculateHomeStrength]),
    pipe([last, calculateAwayStrength]),
  ]),
]);

// Credit
export const weibullCDFGoals = curry(
  async (
    shape: number,
    clubStrength: number,
    goals: number,
  ): Promise<number> => {
    return 1 - Math.exp(-Math.pow((goals + 1) * clubStrength, shape));
  },
);

export const getBaseWeibullCDFGoals = weibullCDFGoals(SHAPE);

export const weibullCDFGoalsList = (clubStrength: number): Array<number> => {
  return map(getBaseWeibullCDFGoals(clubStrength))(POSSIBLEGOALS);
};

export const calculateJointProbability = curry(
  async (
    theta: number,
    [homeProb, awayProb]: [number, number],
  ): Promise<number> => {
    return (
      Math.log(
        1 +
          ((Math.exp(-theta * homeProb) - 1) *
            (Math.exp(-theta * awayProb) - 1)) /
            (Math.exp(-theta) - 1),
      ) * -(1 / theta)
    );
  },
);

export const getBaseJointProbability = calculateJointProbability(THETA);

export const createJointProbabilitiesMatrixForGoals = async ([
  homeWeibullCDFGoalsList,
  awayWeibullCDFGoalsList,
]: [Array<number>, Array<number>]): Promise<
  Array<[number, [number, number]]>
> => {
  return await pipe([
    mapIndexed(
      async (
        homeProbability: number,
        homeGoals: number,
      ): Promise<Array<[number, Array<[number, number]>]>> => {
        return await pipe([
          mapIndexed(async (awayProbability: number, awayGoals: number) => [
            await getBaseJointProbability([homeProbability, awayProbability]),
            [homeGoals, awayGoals],
          ]),
        ])(awayWeibullCDFGoalsList);
      },
    ),
    flatten,
  ])(homeWeibullCDFGoalsList);
};

export const generateMatchGoals = (
  startingElevenTuples: Array<[number, Record<string, Array<number>>]>,
): [
  [Record<string, Array<number>>, Record<string, Array<number>>],
  [number, number],
] => {
  const [, elevens] = zipAll(startingElevenTuples);

  return pipe([
    calculateMatchStrengths,
    map(weibullCDFGoalsList),
    createJointProbabilitiesMatrixForGoals,
    sortTuplesByFirstValueInTuple,
    zipAll,
    weightedRandom,
    (score: [number, number]) => concat([elevens], [score]),
  ])(elevens);
};

export const assignRandomScorer = pipe([
  Object.entries,
  over([map(calculateMeanAttackingStrengthForPlayer), map(first)]),
  weightedRandom,
]);

export const totalRoundRobinRounds = minusOne;
export const totalDoubleRoundRobinRounds = pipe([minusOne, multiplyByTwo]);
export const matchesPerRoundOfRoundRobin = half;
export const totalRoundRobinMatches = pipe([
  over([totalRoundRobinRounds, matchesPerRoundOfRoundRobin]),
  spread(multiply),
]);
export const totalDoubleRoundRobinMatches = pipe([
  totalRoundRobinMatches,
  multiplyByTwo,
]);

// Credit: Tournament Schedules Using Combinatorial Design Theory By Christian Serup Ravn Thorsen
export const firstWeekOfRoundRobinWithEvenNumberClubs = (
  clubs: number,
): [number, Array<[number, number]>] => {
  const adjustedRangeMax = multiplyByTwo(clubs) - 1;
  return [
    clubs,
    pipe([
      half,
      range(1),
      map((currentNum: number): [number, number] => {
        // check 2n+1
        const matchup = [
          simpleModularArithmetic(add(-currentNum), adjustedRangeMax, clubs),
          modularAddition(adjustedRangeMax, currentNum),
        ];
        return currentNum % 2 == 0 ? reverse(matchup) : matchup;
      }),
      concat([[0, 1]]),
    ])(clubs),
  ];
};

export const everyWeekAfterFirstWeekofRoundRobin = ([clubs, firstRound]: [
  number,
  Array<[number, number]>,
]): Array<Array<[number, number]>> => {
  const adjustedClubsCount: number = multiplyByTwo(clubs);
  const modularAdditionMapper = map(
    map((club: number): number =>
      modularAddition(adjustedClubsCount - addOne(club) - 1, club),
    ),
  );
  return pipe([
    range(1),
    reduce(
      (rounds: Array<Array<number>>, _: number) => {
        const [firstMatch, allOtherMatches] = pipe([last, over([head, tail])])(
          rounds,
        );
        return concat(rounds, [
          concat(
            [
              pipe([
                map((num: number) => (num !== 0 ? num + 1 : num)),
                reverse,
              ])(firstMatch),
            ],
            modularAdditionMapper(allOtherMatches),
          ),
        ]);
      },
      [firstRound],
    ),
  ])(totalRoundRobinRounds(clubs));
};

export const roundRobinScheduler = pipe([
  firstWeekOfRoundRobinWithEvenNumberClubs,
  everyWeekAfterFirstWeekofRoundRobin,
]);

export const doubleRoundRobinScheduler = pipe([
  roundRobinScheduler,
  (firstHalf: Array<Array<[number, number]>>): Array<Array<[number, number]>> =>
    pipe([
      pipe([
        getLastTwoArrayValues,
        map(
          (round: Array<[number, number]>): Array<[number, number]> =>
            pipe([
              getFirstTwoArrayValues,
              map(reverse),
              concat(takeRight(round.length - 2, round)),
            ])(round),
        ),
      ]),
      concat(take(firstHalf.length - 2, firstHalf)),
    ])(firstHalf),
  (matches: Array<Array<[number, number]>>): Array<Array<[number, number]>> =>
    pipe([map(map(reverse)), concat(matches)])(matches),
]);

export const addOneDay = addDays(1);
export const subOneDay = subDays(1);
export const addOneWeek = addWeeks(1);
export const addTwoWeeks = addWeeks(2);
export const addOneMonth = addMonths(1);
export const addOneYear = addYears(1);

export const convertIntegerYearToDate = (year: number): Date =>
  new Date(year, JANUARY, 1);

export const getThirdSundayOfAugust = pipe([
  convertIntegerYearToDate,
  addMonths(AUGUST),
  eachWeekendOfMonth,
  filter(
    overEvery([isSunday, (date: string) => isEqual(4, getWeekOfMonth(date))]),
  ),
  first,
]);

export const getLastDayOfAugust = pipe([
  convertIntegerYearToDate,
  addMonths(AUGUST),
  lastDayOfMonth,
]);

export const getLastDayOfJuneOfNextYear = pipe([
  convertIntegerYearToDate,
  addOneYear,
  addMonths(JUNE),
  lastDayOfMonth,
]);

export const getFirstMondayOfFebruaryOfNextYear = pipe([
  convertIntegerYearToDate,
  addOneYear,
  addMonths(FEBRUARY),
  nextMonday,
]);

export const getJuneFifteenOfNextYear = pipe([
  convertIntegerYearToDate,
  addOneYear,
  addMonths(JUNE),
  addTwoWeeks,
]);

export const getStartOfNextYear = pipe([
  convertIntegerYearToDate,
  addOneYear,
  startOfYear,
]);

const defaultTransferWindows: Array<
  [(season: number) => Date, (season: number) => Date]
> = [
  [getThirdSundayOfAugust, getLastDayOfAugust],
  [getStartOfNextYear, getFirstMondayOfFebruaryOfNextYear],
  [getJuneFifteenOfNextYear, getLastDayOfJuneOfNextYear],
];

export const createSeasonWindows = (
  transferWindowFunctionTuples: Array<
    [(season: number) => Date, (season: number) => Date]
  >,
  season: number,
) => {
  return map(
    ([startFunction, endFunction]: [
      (season: number) => Date,
      (season: number) => Date,
    ]) => {
      return isWithinInterval({
        start: startFunction(season),
        end: endFunction(season),
      });
    },
  )(transferWindowFunctionTuples);
};

export const isTransferWindowOpen = curry(
  (
    transferWindowFunctionTuples: Array<
      [(season: number) => Date, (season: number) => Date]
    >,
    [currentSeason, currentDate]: [number, Date],
  ): boolean => {
    return overSome(
      createSeasonWindows(transferWindowFunctionTuples, currentSeason),
    )(currentDate);
  },
);

export const defaultIsTransferWindowOpen = isTransferWindowOpen(
  defaultTransferWindows,
);

export const getDaysLeftInCurrentSeason = (
  currentSeason: number,
  currentDate: Date,
): number => {
  return pipe([
    getLastDayOfJuneOfNextYear,
    differenceInCalendarDays(currentDate),
  ])(currentSeason);
};
