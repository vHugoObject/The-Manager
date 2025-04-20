import { map, curry, spread, pipe, shuffle, flatMap, add, flatten } from "lodash/fp";

export const unfold = curry(
  (unfolder: (index: number) => any, arraySize: number): Array<any> => {
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
    return Array.from(
      { length: count },
      (_, index: number) => startingIndex + index,
    );
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

export const unfoldStringStartingIndexAndCountTuplesIntoArrayOfArrayOfStringIDs = (
  stringStartingIndexAndCountTuples: Array<[string, number, number]>): Array<Array<string>> => {
    const createStringID = curry(
      (string: string, idNumber: number) => `${string}_${idNumber}`,
    );
    return pipe([
      map(([string, count, startingIndex]:[string, number, number]) => {
	return [pipe([add(startingIndex), createStringID(string)]), count]
      }),
      mapSpreadUnfold
    ])(stringStartingIndexAndCountTuples)
  }

export const unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs = (stringStartingIndexAndCountTuples: Array<[string, number, number]>): Array<string> => {
  return pipe(
    [
      unfoldStringStartingIndexAndCountTuplesIntoArrayOfArrayOfStringIDs,
      flatten
    ]
  )(stringStartingIndexAndCountTuples)
  };

export const unfoldStringStartingIndexAndCountTuplesIntoShuffledArrayOfStringIDs = (stringStartingIndexAndCountTuples: Array<[string, number, number]>): Array<string> => {
  return pipe(
    [
      unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs,
      shuffle,
    ]
  )(stringStartingIndexAndCountTuples)
}


