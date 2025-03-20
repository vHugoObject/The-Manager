import {
  sum,
  constant,
  map,
  sortBy,
  first,
  last,
  add,
  multiply,
  takeRight,
  take
} from "lodash/fp";
import { flowAsync, mapIndexed, mapValuesIndexed } from "futil-js";

export const addOne = add(1);
export const minusOne = add(-1);
export const multiplyByTwo = multiply(2);
export const half = multiply(1 / 2);
export const lastTwoArrayValues = takeRight(2);
export const firstTwoArrayValues = take(2);


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
  return percentages.map((percent: number) => percent / sumOfPercentages);
};

export const weightedMean = async (
  arrWeights: number[],
  arrValues: number[],
): Promise<number> => {
  const normalizedWeights: Array<number> =
    await normalizePercentages(arrWeights);
  const result = arrValues
    .map((value, i) => {
      const weight = normalizedWeights[i];
      const sum = value * weight;
      return [sum, weight];
    })
    .reduce((p, c) => [p[0] + c[0], p[1] + c[1]], [0, 0]);

  return result[0] / result[1];
};

export const weightedRandom = async ([weights, items]: [
  number[],
  any[],
]): Promise<any> => {
  const initialValue: number = 0;
  const cumulativeWeights: number[] = [];
  const _: number = weights.reduce((accumulator, currentValue) => {
    accumulator += currentValue;
    cumulativeWeights.push(accumulator);
    return accumulator;
  }, initialValue);

  const maxCumulativeWeight: number = Math.max(...cumulativeWeights);
  const randomNumber: number = maxCumulativeWeight * Math.random();
  const randomIndex: number = cumulativeWeights.findIndex(
    (weight) => weight >= randomNumber,
  );
  return items[randomIndex];
};

export const constantifyObjectValues = mapValuesIndexed(constant);

export const convertToSet = (collection: Array<any>): Set<any> => {
  return new Set(collection);
};

export const convertArrayOfArraysToArrayOfSets = map(convertToSet);
