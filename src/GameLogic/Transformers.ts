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
  partial,
  partialRight,
  round,
  memoize,
} from "lodash/fp";
import { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";
import { State, traverseReadonlyNonEmptyArrayWithIndex } from "fp-ts/State";
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
import { FIRSTNAMES, LASTNAMES, COUNTRYNAMES } from "./Names";
import { Club, Player, BaseCountries } from "./Types";
import {
  ATTACKINGSKILLS,
  DEFENDINGSKILLS,
  GOALKEEPINGSKILLS,
  PLAYERFIELDKEYS,
  DEFAULTCONTRACTYEARSRANGE,
  DEFAULTAGERANGE,
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
  DEFAULTADJUSTMENTPERDIVISION,
  DEFAULTCLUBDATARANGES,
  COMPETITIONSDEPTH,
  CLUBSDEPTH,
  CLUBKEYS,
} from "./Constants";
import {
  getFirstTwoArrayValues,
  getLastTwoArrayValues,
  getRangeStep,
  getPositionGroupPlayerCountAndWageBillPercentage,
  getDomesticLeaguesCountFromBaseCountries,
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

export const flattenToDomesticLeaguesDepth = flattenDepth(COMPETITIONSDEPTH);
export const flattenToClubsDepth = flattenDepth(CLUBSDEPTH);

export const unfold = curry(
  <T>(unfolder: (index: number) => T, arraySize: number): Array<T> => {
    return Array.from({ length: arraySize }, (_, index: number) =>
      unfolder(index),
    );
  },
);

export const unfoldIntoSet = curry(
  <T>(unfolder: (index: number) => T, arraySize: number): Array<T> => {
    return pipe([unfold, convertToSet])(unfolder, arraySize);
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

export const append = curry(<T>(item: T, array: Array<T>): Array<T> => {
  return concat(array, [item]);
});

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

export const splitUnderscoresMapAndSum = pipe([
  splitOnUnderscoresAndParseInts,
  sum,
]);

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
export const addTwo = add(1);
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
export const modTwo = mod(2);
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
    return map(multiply(percentage))(range);
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
    return pipe([multiply(rangeStep), nonZeroBoundedModularAddition(range, 0)])(
      index,
    );
  },
);

export const convertRangeIndexAndCycleCountIntoInteger = curry(
  (
    cycles: number,
    range: [number, number],
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

export const generalizedPentagonalNumbersFromFive = memoize(
  (index: number): number => {
    //Source: https://oeis.org/A046092
    // 7, 12, 15, 22, 26, 35, 40 ....
    const n: number = index + 4;
    return (1 / 2) * Math.ceil(n / 2) * Math.ceil((3 * n + 1) / 2);
  },
);

export const sumOfFirstNGeneralizedPentagonalNumbersFromFive = memoize(
  (index: number): number => {
    return pipe([unfold(generalizedPentagonalNumbersFromFive), sum])(index);
  },
);

export const percentageOfGeneralizedPentagonalNumbersFromFiveForGivenRange = (
  currentIndex: number,
  rangeSize: number,
): number => {
  const currentNumber: number =
    generalizedPentagonalNumbersFromFive(currentIndex);
  return pipe([
    sumOfFirstNGeneralizedPentagonalNumbersFromFive,
    partial(divide, [currentNumber]),
  ])(rangeSize);
};

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

// even number of teams only
export const totalRoundRobinRounds = minusOne;
export const totalDoubleRoundRobinRounds = pipe([minusOne, multiplyByTwo]);
export const totalRoundRobinMatches = pipe([
  over([partialRight(divide, [2]), partialRight(subtract, [-1])]),
  spreadMultiply,
]);
export const matchesPerRoundOfRoundRobin = partialRight(divide, [2]);
export const totalDoubleRoundRobinMatches = pipe([
  totalRoundRobinMatches,
  multiplyByTwo,
]);

// Credit: Tournament Schedules Using Combinatorial Design Theory By Christian Serup Ravn Thorsen
export const firstWeekOfRoundRobinWithEvenNumberClubs = memoize(
  (clubs: number): [number, Array<[number, number]>] => {
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
  },
);

export const everyWeekAfterFirstWeekofRoundRobin = memoize(
  ([clubs, firstRound]: [number, Array<[number, number]>]): Array<
    Array<[number, number]>
  > => {
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
          const [firstMatch, allOtherMatches] = pipe([
            last,
            over([head, tail]),
          ])(rounds);
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
  },
);

export const roundRobinScheduler = pipe([
  firstWeekOfRoundRobinWithEvenNumberClubs,
  everyWeekAfterFirstWeekofRoundRobin,
]);

export const doubleRoundRobinScheduler = memoize(
  pipe([
    roundRobinScheduler,
    (
      firstHalf: Array<Array<[number, number]>>,
    ): Array<Array<[number, number]>> =>
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
  ]),
);

export const createScheduleForRoundOfDoubleRobinRound = curry((
  round: number,
  clubsCount: number,
): Array<[number, number]> => {
  return pipe([doubleRoundRobinScheduler, property(round)])(clubsCount);
  })

export const createMatchPairingsForWeek = (
  round: number,
  baseCountries: BaseCountries,
): Array<[number, number]> => {
  const firstSetOfMatches: Array<number> = pipe([
    createScheduleForRoundOfDoubleRobinRound,
    flatten,
  ])(round, DEFAULTCLUBSPERDOMESTICLEAGUE);
  const leaguesCount: number =
    getDomesticLeaguesCountFromBaseCountries(baseCountries);
  const unfolder = (leagueNumber: number): Array<number> => {
    const valueToAdd: number = multiply(
      leagueNumber,
      DEFAULTCLUBSPERDOMESTICLEAGUE,
    );
    return map(add(valueToAdd))(firstSetOfMatches);
  };
  return pipe([unfold(unfolder), flatten, chunk(2)])(leaguesCount);
};

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

export const chunkDEFAULTSQUADSIZE = chunk(DEFAULTSQUADSIZE);

export const multiplyByDEFAULTDOMESTICLEAGUESPERCOUNTRY = multiply(
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
);
export const multiplyByDEFAULTCLUBSPERCOUNTRY = multiply(
  DEFAULTCLUBSPERCOUNTRY,
);
export const multiplyByDEFAULTPLAYERSPERCOUNTRY = multiply(
  DEFAULTPLAYERSPERCOUNTRY,
);

export const addDEFAULTSQUADSIZE = add(DEFAULTSQUADSIZE);
export const multiplyByDEFAULTSQUADSIZE = multiply(DEFAULTSQUADSIZE);

export const countryNumberRepeaterForClubs = floorDivision(
  DEFAULTCLUBSPERCOUNTRY,
);
export const domesticLeagueNumberRepeaterForClubs = floorDivision(
  DEFAULTCLUBSPERDOMESTICLEAGUE,
);
export const domesticLeagueLevelRepeaterForClubs = pipe([
  domesticLeagueNumberRepeaterForClubs,
  mod(DEFAULTDOMESTICLEAGUESPERCOUNTRY),
]);
export const clubScheduleNumberRepeater = mod(DEFAULTCLUBSPERDOMESTICLEAGUE);

export const countryNumberRepeaterForPlayers = floorDivision(
  DEFAULTPLAYERSPERCOUNTRY,
);
export const domesticLeagueNumberRepeaterForPlayers = floorDivision(
  DEFAULTPLAYERSPERDOMESTICLEAGUE,
);
export const domesticLeagueLevelRepeaterForPlayers = pipe([
  domesticLeagueNumberRepeaterForPlayers,
  mod(DEFAULTDOMESTICLEAGUESPERCOUNTRY),
]);
export const clubNumberRepeaterForPlayers = floorDivision(DEFAULTSQUADSIZE);

export const positionGroupNumberRepeaterForPlayers = pipe([
  mod(DEFAULTSQUADSIZE),
  floorDivision(DEFAULTPLAYERSPEROUTFIELDPOSITIONGROUP),
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

export const getClubLeagueLevelAndScheduleNumber = over<number>([
  domesticLeagueLevelRepeaterForClubs,
  clubScheduleNumberRepeater,
]);

export const generateDataForClubNumber = curry(
  (dataRange: [number, number], clubNumber: number): number => {
    const [domesticLeagueLevel, clubScheduleNumberNumber]: Array<number> =
      getClubLeagueLevelAndScheduleNumber(clubNumber);
    const adjustedRange: [number, number] = adjustRangeForDivision(
      dataRange,
      domesticLeagueLevel,
    );

    return convertRangeIndexAndCycleCountIntoInteger(
      1,
      adjustedRange,
      DEFAULTCLUBSPERDOMESTICLEAGUE,
      clubScheduleNumberNumber,
    );
  },
);

export const [
  generateAttendanceForClubNumber,
  generateFacilitiesCostsForClubNumber,
  generateSponsorPaymentForClubNumber,
  generateTicketPriceForClubNumber,
  generateManagerPayForClubNumber,
  generateScoutingCostsForClubNumber,
  generateHealthCostsForClubNumber,
  generatePlayerDevelopmentCostsForClubNumber,
  generateWageBillToRevenueRatioForClubNumber,
] = map<[number, number], (clubNumber: number) => number>(
  generateDataForClubNumber,
)(DEFAULTCLUBDATARANGES);

export const calculatePreviousSeasonRevenueForClubNumber = (
  clubNumber: number,
): number => {
  const sponsorPayment: number =
    generateSponsorPaymentForClubNumber(clubNumber);
  return pipe([
    over([generateAttendanceForClubNumber, generateTicketPriceForClubNumber]),
    spreadMultiply,
    add(sponsorPayment),
  ])(clubNumber);
};

export const calculatePreviousSeasonWageBillForClubNumber = pipe([
  over([
    calculatePreviousSeasonRevenueForClubNumber,
    generateWageBillToRevenueRatioForClubNumber,
  ]),
  spreadMultiply,
  partialRight(divide, [100]),
  round,
]);

export const convertDomesticLeagueRelativeNumberIntoAbsoluteNumber = memoize(
  ([countryIndex, domesticLeagueIndex]: [number, number]): number => {
    return pipe([
      multiply(DEFAULTDOMESTICLEAGUESPERCOUNTRY),
      add(domesticLeagueIndex),
    ])(countryIndex);
  },
);

export const convertClubRelativeNumberIntoAbsoluteNumber = memoize(
  ([countryIndex, domesticLeagueIndex, clubIndex]: [
    number,
    number,
    number,
  ]): number => {
    return pipe([
      zipWith(multiply, [
        DEFAULTDOMESTICLEAGUESPERCOUNTRY,
        DEFAULTCLUBSPERDOMESTICLEAGUE,
      ]),
      sum,
      add(clubIndex),
    ])([countryIndex, domesticLeagueIndex]);
  },
);

export const positionGroupRankRepeaterForPlayerNumber = pipe([
  mod(DEFAULTSQUADSIZE),
  mod(DEFAULTPLAYERSPEROUTFIELDPOSITIONGROUP),
]);

export const squadNumberRepeaterForPlayerNumber = mod(DEFAULTSQUADSIZE);

export const contractYearsRepeaterForPlayerNumber =
  nonZeroBoundedModularAddition(DEFAULTCONTRACTYEARSRANGE, 1);

export const ageRepeaterForPlayerNumber = nonZeroBoundedModularAddition(
  DEFAULTAGERANGE,
  1,
);

export const getPlayerPositionGroupAndPositionGroupRank = over([
  positionGroupNumberRepeaterForPlayers,
  positionGroupRankRepeaterForPlayerNumber,
]);

export const generateWageToWageBillRatioForPlayerNumber = (
  playerNumber: number,
): number => {
  const [positionGroup, playerPositionGroupRank] =
    getPlayerPositionGroupAndPositionGroupRank(playerNumber);
  const [positionGroupSize, positionGroupTotalWageBillPercentage]: [
    number,
    number,
  ] = getPositionGroupPlayerCountAndWageBillPercentage(positionGroup) as [
    number,
    number,
  ];
  const playerPercentageForPosition: number =
    percentageOfGeneralizedPentagonalNumbersFromFiveForGivenRange(
      playerPositionGroupRank,
      positionGroupSize,
    );

  return (
    playerPercentageForPosition * positionGroupTotalWageBillPercentage * 100
  );
};

export const getClubWageBillForPlayerNumber = pipe([
  clubNumberRepeaterForPlayers,
  calculatePreviousSeasonWageBillForClubNumber,
]);

export const assignWageToPlayerNumber = (playerNumber: number): number => {
  return pipe([
    over([
      generateWageToWageBillRatioForPlayerNumber,
      getClubWageBillForPlayerNumber,
    ]),
    spreadMultiply,
  ])(playerNumber);
};

export const [
  firstNameIndexForPlayerNumber,
  lastNameIndexForPlayerNumber,
  countryNameIndexForPlayerNumber,
] = map<Array<string>, (num: number) => string>(pipe([size, mod]))([
  FIRSTNAMES,
  LASTNAMES,
  COUNTRYNAMES,
]);

export const createPlayer = curry((playerNumber: number): [number, Player] => {
  const playerFieldValues = over([
    firstNameIndexForPlayerNumber,
    lastNameIndexForPlayerNumber,
    countryNameIndexForPlayerNumber,
    ageRepeaterForPlayerNumber,
    assignWageToPlayerNumber,
    positionGroupNumberRepeaterForPlayers,
    countryNumberRepeaterForPlayers,
    domesticLeagueNumberRepeaterForPlayers,
    domesticLeagueLevelRepeaterForPlayers,
    clubNumberRepeaterForPlayers,
  ])(playerNumber);
  return [playerNumber, zipObject(PLAYERFIELDKEYS, playerFieldValues)];
});

export const generateClubFirstSeasonPlayersWithTransform = curry(
  <T>(
    transformer: <T>(index: number) => T,
    clubNumber: number,
  ): ReadonlyNonEmptyArray<T> => {
    return pipe([
      multiplyByDEFAULTSQUADSIZE,
      (start: number) =>
        unfold(pipe([add(start), transformer]), DEFAULTSQUADSIZE),
    ])(clubNumber);
  },
);

export const generateClubStartingPlayerNumbers =
	     memoize(generateClubFirstSeasonPlayersWithTransform(identity))

export const createClub = curry((clubNumber: number): [number, Club] => {
  const clubFieldValues = over([
    countryNumberRepeaterForClubs,
    domesticLeagueNumberRepeaterForClubs,
    domesticLeagueLevelRepeaterForClubs,
    clubScheduleNumberRepeater,
    generateAttendanceForClubNumber,
    generateFacilitiesCostsForClubNumber,
    generateSponsorPaymentForClubNumber,
    generateTicketPriceForClubNumber,
    generateManagerPayForClubNumber,
    generateScoutingCostsForClubNumber,
    generateHealthCostsForClubNumber,
    generatePlayerDevelopmentCostsForClubNumber,
    generateClubStartingPlayerNumbers,
  ])(clubNumber);
  return [clubNumber, zipObject(CLUBKEYS, clubFieldValues)];
});

export const createMatchAddress = curry(
  (
    [countryIndex, domesticLeagueIndex]: [number, number],
    [season, matchWeek]: [number, number],
    [homeClubNumber, awayClubNumber]: [number, number],
  ): [number, number, number, number, string] => {
    return [
      countryIndex,
      domesticLeagueIndex,
      season,
      matchWeek,
      joinOnUnderscores([homeClubNumber, awayClubNumber]),
    ];
  },
);
