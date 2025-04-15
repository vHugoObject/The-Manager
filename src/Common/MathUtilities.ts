import {
  sum,
  subtract,
  map,
  add,
  multiply,
  zipWith,
  over,
  findIndex,
  max,
  curry,
  identity,
  mean,
  spread,
  reverse,
  pipe
} from "lodash/fp";
import { accumulate } from "./ArrayUtilities"




export const addOne = add(1);
export const minusOne = add(-1);
export const multiplyByTwo = multiply(2);
export const divideByTwo = multiply(1 / 2);
export const half = multiply(1 / 2);
export const convertIntegerToPercentage = multiply(0.01);
export const convertIntegersToPercentages = map(convertIntegerToPercentage);
export const addMinusOne = curry((intOne: number, intTwo: number) => pipe([add, minusOne])(intOne, intTwo))
export const addPlusOne = curry((intOne: number, intTwo: number) => pipe([add, addOne])(intOne, intTwo))
export const spreadThenSubtract = spread(subtract)

export const reverseThenSpreadSubtract = pipe([reverse, spreadThenSubtract])

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
      over([
        pipe([
          zipWith((value: number, weight: number): number => {
            return value * weight;
          }, arrValues),
          sum,
        ]),
        sum,
      ]),
      ([totalOfValues, totalOfWeights]: [number, number]) =>
        totalOfValues / totalOfWeights,
    ])(arrWeights);
  },
);


export const getRunningSumOfList = accumulate([add, 0]);
export const multiplyAccumulate = accumulate([multiply, 1]);

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

export const boundedModularAddition = curry(
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
      return boundedModularAddition(range, step);
    })(ranges);
  },
);

export const mapModularIncreasersWithDifferentStepsForARange = curry(
  (playerCount: number, ranges: Array<[number, number]>) => {
    return map(([min, max]: [number, number]) => {
      const step: number = Math.ceil((max - min) / playerCount);
      return boundedModularAddition([min, max], step);
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
