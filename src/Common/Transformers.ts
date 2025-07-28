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
  sortBy,
  partition,
  every,
  size,
  inRange,
  partialRight,
  round,
  flip,
  floor,
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
import { mapIndexed } from "futil-js";
import { Save, SaveArguments } from "./Types";
import { FIRSTNAMES, LASTNAMES, COUNTRYNAMES } from "./Names";
import {
  ATTACKINGSKILLS,
  DEFENDINGSKILLS,
  GOALKEEPINGSKILLS,
  PLAYERBIODATA,
  MAXCONTRACTYEARS,
  DEFAULTAGERANGE,
  DEFAULTMINAGE,
} from "./PlayerDataConstants";
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
  DEFAULTCLUBSPERDOMESTICLEAGUE,
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
  DEFAULTCLUBSPERCOUNTRY,
  DEFAULTPLAYERSPERCOUNTRY,
  DEFAULTPLAYERSPERDOMESTICLEAGUE,
  DEFAULTSQUADSIZE,
  DEFAULTPLAYERSPEROUTFIELDPOSITIONGROUP,
  DEFAULTATTENDANCERANGE,
  DEFAULTADJUSTMENTPERDIVISION,
  DEFAULTTICKETSPRICERANGE,
  DEFAULTCLUBDATARANGES,
} from "./Constants"
import {
  getFirstTwoArrayValues,
  getLastTwoArrayValues,
  getRangeStep,
} from "./Getters";

export const mapSum = map(sum);

export const convertToSet = <T>(collection: Array<T>): Set<T> => {
  return new Set(collection);
};

export const convertToList = <T>(object: T): Array<T> => {
  return new Array(object);
};

export const convertArrayChunksIntoSets = pipe([chunk, map(convertToSet)]);

export const subString = curry((start: number, end: number, string: string) => {
  const stringer = Function.prototype.call.bind(String.prototype.substring);
  return stringer(string, start, end);
});

export const convertArrayToSetThenGetSize = pipe([convertToSet, size]);
export const isEveryIntegerInRange = curry(
  ([start, end]: [number, number], arrayOfIntegers: Array<number>): Boolean => {
    return every(inRange(start, end), arrayOfIntegers);
  },
);

export const sortByIdentity = sortBy(identity);
export const sortTuplesByFirstValueInTuple = sortBy(first);

export const flattenCompetitions = flattenDepth(1);
export const flattenClubs = flattenDepth(2);

export const createStringID = curry(
  (string: string, idNumber: number): string =>
    joinOnUnderscores([string, idNumber]),
);

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

export const unfoldCountStartingIndexIntoRange = curry(
  (count: number, startingIndex: number): Array<number> => {
    return unfold(add(startingIndex), count);
  },
);

export const unfoldIntoObject = pipe([unfold, Object.fromEntries]);
export const spreadUnfold = spread(unfold);
export const mapSpreadUnfold = map(spreadUnfold);
export const flatMapSpreadUnfold = flatMap(spreadUnfold);
export const unfoldAndShuffleArray = curry(
  <T>(arraySize: number, unfolder: (index: number) => T): Array<T> => {
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

export const unfoldSingleStringCountStartingIndexTupleIntoArrayOfStringIDs =
  curry(
    (
      id: string | IDPREFIXES,
      [count, startingIndex]: [number, number],
    ): Array<string> => {
      return unfold(pipe([add(startingIndex), createStringID(id)]), count);
    },
  );

export const unfoldStringCountStartingIndexTuplesIntoArrayOfArrayOfStringIDs = (
  stringCountStartingIndexTuples: Array<[string | IDPREFIXES, number, number]>,
): Array<Array<string>> => {
  return pipe([
    map(([string, count, startingIndex]: [string, number, number]) => {
      return [pipe([add(startingIndex), createStringID(string)]), count];
    }),
    mapSpreadUnfold,
  ])(stringCountStartingIndexTuples);
};

export const unfoldStringCountStartingIndexTuplesIntoArrayOfStringIDs = (
  stringCountStartingIndexTuples: Array<[string, number, number]>,
): Array<string> => {
  return pipe([
    unfoldStringCountStartingIndexTuplesIntoArrayOfArrayOfStringIDs,
    flatten,
  ])(stringCountStartingIndexTuples);
};

export const unfoldStringCountStartingIndexTuplesIntoShuffledArrayOfStringIDs =
  (
    stringCountStartingIndexTuples: Array<[string, number, number]>,
  ): Array<string> => {
    return pipe([
      unfoldStringCountStartingIndexTuplesIntoArrayOfStringIDs,
      shuffle,
    ])(stringCountStartingIndexTuples);
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

export const zipAllAndGetSizeOfFirstArray = zipAllAndTransformXArrayWithY([
  first,
  size,
]);

export const zipAllAndGetFirstArrayAsSet = zipAllAndTransformXArrayWithY([
  first,
  convertToSet,
]);


export const append = flip(concat)

export const splitOnUnderscores = split("_");
export const joinOnUnderscores = join("_");


export const convertConcatenatedArraysIntoSet = pipe([concat, convertToSet]);
export const convertFlattenedArrayIntoSet = pipe([flatten, convertToSet]);
export const convertArrayOfArraysToArrayOfSets = map(convertToSet);
export const convertArrayOfIntegersIntoArrayOfStrings = map(toString);
export const convertArrayOfStringsIntoArrayOfIntegers = map(parseInt);
export const calculateTheSumOfArrayOfStringIntegers = pipe([
  convertArrayOfStringsIntoArrayOfIntegers,
  sum,
]);
export const splitOnUnderscoresAndParseInts = pipe([
  splitOnUnderscores,
  convertArrayOfStringsIntoArrayOfIntegers,
]);


export const splitUnderscoresMapAndSum = pipe([splitOnUnderscoresAndParseInts, sum])

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

export const convertObjectKeysIntoSet = pipe([Object.keys, convertToSet]);

export const zipDivide = zipWith(divide);
export const spreadZipDivide = spread(zipDivide);
export const spreadDivide = spread(divide);
export const divideByTwo = multiply(1 / 2);

export const spreadMultiply = spread(multiply);
export const spreadAdd = spread(add);
export const addOne = add(1);
export const minusOne = add(-1);
export const multiplyByTwo = multiply(2);
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
export const mod = curry(
  (divisor: number, dividend: number): number => dividend % divisor,
);
export const getBaseLog = curry((baseLog: number, of: number) => {
  return Math.log(of) / Math.log(baseLog);
});

export const log3 = getBaseLog(3);

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
export const spreadMultiplyAccumulate = pipe([multiplyAccumulate, last]);

export const adjustRangeByPercentage = curry(
  (range: [number, number], percentage: number) => {
    return map(pipe([multiply(percentage), floor]))(range);
  },
);

export const normalizeArrayOfNumbers = (
  percentages: Array<number>,
): Array<number> => {
  const sumOfPercentages: number = sum(percentages);
  return map((percent: number): number => percent / sumOfPercentages)(
    percentages,
  );
};

export const weightedMean = curry(
  (arrWeights: Array<number>, arrValues: Array<number>): number => {
    return pipe([
      normalizeArrayOfNumbers,
      over([pipe([zipWith(multiply, arrValues), sum]), sum]),
      ([totalOfValues, totalOfWeights]: [number, number]) =>
        totalOfValues / totalOfWeights,
    ])(arrWeights);
  },
);

export const weightedRandom = <T>([weights, items]: [
  Array<number>,
  Array<T>,
]): T => {
  return pipe([
    normalizeArrayOfNumbers,
    getRunningSumOfList,
    max,
    multiply(Math.random()),
    (randomNumber: number): number =>
      findIndex((weight: number) => weight >= randomNumber)(weights),
    (randomIndex: number): T => items.at(randomIndex),
  ])(weights);
};

export const sumOfAnArithmeticSeries = (lastNumberInSeries: number): number => {
  return lastNumberInSeries * ((lastNumberInSeries + 1) / 2);
};

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
    const rangeSize: number = subtract(rangeMax, rangeMin);
    const adjustedIncrease = mod(rangeSize, standardIncrease);
    const currentIndexOfNumber: number = max([
      0,
      subtract(currentNumber, rangeMin),
    ]) as number;
    const indexOfNextNumber: number = mod(
      rangeSize,
      add(currentIndexOfNumber, adjustedIncrease),
    );
    return add(rangeMin, indexOfNextNumber);
  },
);

export const convertRangeIndexIntoInteger = curry(
  (range: [number, number], [rangeStep, index]: [number, number]): number => {
    return pipe([
      multiply(rangeStep),
      nonZeroBoundedModularAddition(range, 0),
      round,
    ])(index);
  },
);

export const convertRangeIndexAndCycleCountIntoInteger = curry(
  (
    range: [number, number],
    cycles: number,
    itemsCount: number,
    index: number,
  ): number => {
    return pipe([
      getRangeStep(range, cycles),
      concat([index]),
      convertRangeIndexIntoInteger(range),
    ])(itemsCount);
  },
);

export const getRandomIntegerInRange = ([min, max]: [
  number,
  number,
]): number => {
  const minCeiled = Math.ceil(min),
    maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

export const getRandomIntegerInRanges = map(getRandomIntegerInRange);

export const getRandomPlusOrMinus = pipe([
  over([multiply(-1), identity]),
  getRandomIntegerInRange,
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


export const convertCharacterAtIndexIntoCharacterCode =
  Function.prototype.call.bind(String.prototype.charCodeAt);
export const convertCharacterIntoCharacterCode = partialRight(
  convertCharacterAtIndexIntoCharacterCode,
  [0],
);

export const convertCharacterCodeIntoCharacter = String.fromCharCode;

export const convertArrayOfIntegersIntoArrayOfCharacters = map(
  convertCharacterIntoCharacterCode,
);

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

export const floorDivision = curry(
  (divisor: number, dividend: number): number => {
    return Math.floor(dividend / divisor);
  },
);

export const multiplyByDEFAULTDOMESTICLEAGUESPERCOUNTRY = multiply(
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
);
export const multiplyByDEFAULTCLUBSPERCOUNTRY = multiply(
  DEFAULTCLUBSPERCOUNTRY,
);
export const multiplyByDEFAULTPLAYERSPERCOUNTRY = multiply(
  DEFAULTPLAYERSPERCOUNTRY,
);

export const countryIDRepeaterForClubIDs = floorDivision(
  DEFAULTCLUBSPERCOUNTRY,
);
export const domesticLeagueIDRepeaterForClubIDs = floorDivision(
  DEFAULTCLUBSPERDOMESTICLEAGUE,
);
export const domesticLeagueLevelRepeaterForClubIDs = pipe([
  domesticLeagueIDRepeaterForClubIDs,
  mod(DEFAULTDOMESTICLEAGUESPERCOUNTRY),
]);
export const clubScheduleIDRepeater = mod(DEFAULTCLUBSPERDOMESTICLEAGUE);

export const countryIDRepeaterForPlayerIDs = floorDivision(
  DEFAULTPLAYERSPERCOUNTRY,
);
export const domesticLeagueIDRepeaterForPlayerIDs = floorDivision(
  DEFAULTPLAYERSPERDOMESTICLEAGUE,
);
export const domesticLeagueLevelRepeaterForPlayerIDs = pipe([
  domesticLeagueIDRepeaterForPlayerIDs,
  mod(DEFAULTDOMESTICLEAGUESPERCOUNTRY),
]);
export const clubIDRepeaterForPlayerIDs = floorDivision(DEFAULTSQUADSIZE);
export const positionGroupIDRepeaterForPlayerIDs = pipe([
  mod(DEFAULTSQUADSIZE),
  floorDivision(DEFAULTPLAYERSPEROUTFIELDPOSITIONGROUP),
]);
export const contractYearsRepeaterForPlayerIDs = mod(MAXCONTRACTYEARS);

export const generateAgeForPlayerID = pipe([
  add(DEFAULTMINAGE),
  nonZeroBoundedModularAddition(DEFAULTAGERANGE, 1),
]);

export const getDefaultDefaultAdjustmentByDivision = partialRight(property, [
  DEFAULTADJUSTMENTPERDIVISION,
]);

export const adjustRangeForDivision = curry(
  (
    dataRange: [number, number],
    divisionNumber: string | number,
  ): [number, number] => {
    return pipe([
      getDefaultDefaultAdjustmentByDivision,
      adjustRangeByPercentage(dataRange),
    ])(divisionNumber);
  },
);

export const getClubLeagueLevelAndScheduleID = over<number>([
  domesticLeagueLevelRepeaterForClubIDs,
  clubScheduleIDRepeater,
]);

export const generateDataForClubID = curry(
  (dataRange: [number, number], clubIDNumber: number): number => {
    const [domesticLeagueLevel, clubScheduleIDNumber]: Array<number> =
      getClubLeagueLevelAndScheduleID(clubIDNumber);
    const adjustedRange: [number, number] = adjustRangeForDivision(
      dataRange,
      domesticLeagueLevel,
    );

    return convertRangeIndexAndCycleCountIntoInteger(
      adjustedRange,
      1,
      DEFAULTCLUBSPERDOMESTICLEAGUE,
      clubScheduleIDNumber,
    );
  },
);

export const [
  generateAttendanceForClubID,
  generateFacilitiesCostsForClubID,
  generateSponsorRevenueForClubID,
  generateTicketPriceForClubID,
  generateManagerPayForClubID,
  generateScoutingCostsForClubID,
  generateHealthCostsForClubID,
  generatePlayerDevelopmentCostsForClubID,
  generateWageBillToRevenueRatioForClubID,
] = map(generateDataForClubID)(DEFAULTCLUBDATARANGES);



export const createClubID = (
  season: number,
  clubNumber: number,
): string => {
  return pipe([
    over([
      countryIDRepeaterForClubIDs,
      domesticLeagueIDRepeaterForClubIDs,
      domesticLeagueLevelRepeaterForClubIDs,
      identity,
      clubScheduleIDRepeater,      
    ]),
    append([season]),
    joinOnUnderscores,
  ])(clubNumber)
}

export const createPlayerID = (
  season: number,
  playerNumber: number,
): string => {
  return pipe([
    over([
      countryIDRepeaterForPlayerIDs,
      domesticLeagueIDRepeaterForPlayerIDs,
      domesticLeagueLevelRepeaterForPlayerIDs,
      clubIDRepeaterForPlayerIDs,
      positionGroupIDRepeaterForPlayerIDs,
      
      identity,
    ]),
    append([season]),
    joinOnUnderscores,
  ])(playerNumber);
};

export const convertPlayerIDIntoPlayerNameAsInteger = curry(
  (nameRangeLength: number, playerID: string): number => {
    return pipe([
      over([
        property([PLAYERBIODATA.Season]),
        property([PLAYERBIODATA.PlayerNumber]),
      ]),
      calculateTheSumOfArrayOfStringIntegers,
      mod(nameRangeLength),
    ])(playerID);
  },
);

export const convertPlayerIDIntoPlayerFirstNameAsInteger =
  convertPlayerIDIntoPlayerNameAsInteger(FIRSTNAMES.length);
export const convertPlayerIDIntoPlayerLastNameAsInteger =
  convertPlayerIDIntoPlayerNameAsInteger(LASTNAMES.length);
export const convertPlayerIDIntoPlayerCountryAsInteger =
  convertPlayerIDIntoPlayerNameAsInteger(COUNTRYNAMES.length);
