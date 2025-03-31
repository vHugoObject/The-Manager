import {
  sum,
  subtract,
  toNumber,
  identity,
  constant,
  map,
  sortBy,
  first,
  last,
  add,
  multiply,
  takeRight,
  take,
  zipWith,
  reduce,
  over,
  slice,
  flip,
  concat,
  curry,
  size,
  flattenDeep,
  split,
  findIndex,
  max,
} from "lodash/fp";


import { flowAsync, mapIndexed, mapValuesIndexed } from "futil-js";

export const addOne = add(1);
export const minusOne = add(-1);
export const multiplyByTwo = multiply(2);
export const divideByTwo = multiply(1/2);
export const half = multiply(1 / 2);
export const lastTwoArrayValues = takeRight(2);
export const firstTwoArrayValues = take(2);
export const getFirstLevelArrayLengths = map(size);
export const getSecondLevelArrayLengths = flowAsync(
  map(map(size)),
  flattenDeep,
);
export const splitIDOnUnderscores = split("_")
export const convertIntegerToPercentage = multiply(0.01);
export const convertIntegersToPercentages = map(convertIntegerToPercentage)
export const sortTuplesByFirstValueInTuple = sortBy(first)



export const arrayRotator = ([array, rotations]: Array<any>): Array<any> => {
  const arrayLength: number = array.length;
  const effectiveRotations: number = rotations % arrayLength;
  return flowAsync(
    mapIndexed((item: any, index: number) => [
      (index + effectiveRotations) % arrayLength,
      item,
    ]),
    sortBy(first),
    map(last),
  )(array);
};

export const normalizePercentages = async (
  percentages: Array<number>,
): Promise<Array<number>> => {
  const sumOfPercentages: number = sum(percentages);
  return map((percent: number): number => percent / sumOfPercentages)(
    percentages,
  );
};

export const weightedMean = curry(async(
  arrWeights: number[],
  arrValues: number[],
): Promise<number> => {
  return await flowAsync(
    normalizePercentages,
    over([flowAsync(
      zipWith((value: number, weight: number): number => {
	return value * weight
      }, arrValues),
      sum
    ),sum]),
    ([totalOfValues, totalOfWeights]: [number, number]) =>
      totalOfValues / totalOfWeights,
  )(arrWeights);  
});

export const accumulate = curry(
  ([func, initial]: [Function, any], array: Array<any>): Array<any> => {
    return reduce(
      (previous: Array<any>, current: any): Array<any> => {
        return concat(previous, func(current, last(previous) || initial));
      },
      [],
      array,
    );
  },
);

export const getRunningSumOfList = accumulate([add, 0]);
export const multiplyAccumulate = accumulate([multiply, 1]);


export const weightedRandom = async <T>([weights, items]: [
  number[],
  Array<T>
]): Promise<T> => {

  return flowAsync(
    normalizePercentages,
    getRunningSumOfList,  
    max,
    multiply(Math.random()),
    (randomNumber: number): number => findIndex((weight: number) => weight >= randomNumber)(weights),
    (randomIndex: number): T => items.at(randomIndex)
  )(weights)
};

export const constantifyObjectValues = mapValuesIndexed(constant);

export const convertToSet = (collection: Array<any>): Set<any> => {
  return new Set(collection);
};

export const convertArrayOfArraysToArrayOfSets = map(convertToSet);


export const sliceUpArray = curry(
  (listOfSliceLengths: Array<number>, array: Array<any>): Array<any> => {
    return flowAsync(
      reduce(
        (
          [slices, currentStartIndex]: [Array<any>, number],
          currentSliceLength: number,
        ) => {
          return flowAsync(sum, (currentEndIndex: number) => [
            concat(slices, [slice(currentStartIndex, currentEndIndex, array)]),
            currentEndIndex,
          ])([currentStartIndex, currentSliceLength]);
        },
        [[], 0],
      ),
      first,
    )(listOfSliceLengths);
  },
);

export const unflatten = curry(
  async (
    listOfListsOfSliceLengths: Array<Array<number>>,
    array: Array<any>,
  ) => {
    return reduce(flip(sliceUpArray), array)(listOfListsOfSliceLengths);
  },
);

export const transformNestedAsFlat = curry(
  async (
    [flattener, sliceCounter, sliceCreator]: [Function, Function, Function],
    transformer: Function,
    nestedData: Array<any>,
  ): Promise<Array<any>> => {
    const levels = sliceCounter(nestedData);
    return await flowAsync(
      flattener,
      transformer,
      sliceCreator(levels),
    )(nestedData);
  },
);

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

export const modularArithmetic = curry(
  (
    arithmeticFunction: (arg: number) => number,
    rangeMax: number,
    num: number,
  ): number => {
    return arithmeticFunction(num) % rangeMax;
  },
);

export const modularAddition = modularArithmetic(addOne);
export const modularSubtraction = modularArithmetic(minusOne);
export const getRandomNumberInRange = async ([min, max]: [
  number,
  number,
]): Promise<number> => {
  const minCeiled = Math.ceil(min),
    maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

export const getRandomNumberInRanges = flowAsync(map(getRandomNumberInRange));

export const convertListToRange = flowAsync(
  Object.keys,
  over([first, last]),
  map(toNumber),
);

export const convertListOfListsToListOfRanges = map(convertListToRange);

export const getRandomPlusOrMinus = flowAsync(
  over([multiply(-1), identity]),
  getRandomNumberInRange,
);

export const getAverageModularStepForRangeOfData = (
  ranges: Array<[number, number]>,
  lengthOfRangeToBeFilled: number,
): number => {
  return flowAsync(
    map(([min, max]: [number, number]) => addOne(max - min)),
    sum,
    multiply(1 / lengthOfRangeToBeFilled),
    Math.ceil,
  )(ranges);
};

export const boundedModularAddition = curry(
  (
    [[rangeMin, rangeMax], standardIncrease]: [[number, number], number],
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
  async (
    [plusOrMinus, playerCount]: [number, number],
    ranges: Array<[number, number]>,
  ) => {
    const randomPlusOrMinus: number = await getRandomPlusOrMinus(plusOrMinus);
    const step: number =
      getAverageModularStepForRangeOfData(ranges, playerCount) +
      randomPlusOrMinus;
    return map((range: [number, number]) => {
      return boundedModularAddition([range, step]);
    })(ranges);
  },
);

export const mapModularIncreasersWithDifferentStepsForARange = curry(
  (playerCount: number, ranges: Array<[number, number]>) => {
    return map(([min, max]: [number, number]) => {
      const step: number = Math.ceil((max - min) / playerCount);
      return boundedModularAddition([[min, max], step]);
    })(ranges);
  },
);
