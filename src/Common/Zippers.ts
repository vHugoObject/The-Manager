import {
  pipe,
  zipAll,
  zipWith,
  chunk,
  initial,
  spread,
  curry,
  property,
  min,
  sum,
  first,
  last,
  add,
  zipObject
} from "lodash/fp";

export const apply = <T>(func: (arg: T) => T, funcArg: T): T => {
  return func(funcArg);
};

export const spreadZipObject = spread(zipObject);
export const zipApply = zipWith(apply);
export const spreadZipApply = spread(zipApply);
export const zipAdd = zipWith<number, number, number>(add);

export const zipChunk = zipWith(chunk);
export const spreadZipChunk = spread(zipChunk);

export const zipAllAndGetInitial = pipe([zipAll, initial]);

export const zipAllAndGetArrayAtIndex = curry(
  (index: number, array: Array<Array<any>>) =>
    pipe([zipAll, property(index)])(array),
);
export const zipAllAndGetMinOfArrayAtIndex = curry(
  (index: number, array: Array<Array<any>>) =>
    pipe([zipAllAndGetArrayAtIndex(index), min])(array),
);
export const zipAllAndGetSumOfArrayAtIndex = curry(
  (index: number, array: Array<Array<any>>) =>
    pipe([zipAllAndGetArrayAtIndex(index), sum])(array),
);

export const zipAllAndGetFirstArray = pipe([zipAll, first]);
export const zipAllAndGetFirstArrayAsSet = pipe([
  zipAllAndGetFirstArray,
  <T>(collection: Array<T>): Set<T> => new Set(collection),
]);
export const zipAllAndGetSumOfFirstArray = pipe([zipAllAndGetFirstArray, sum]);

export const zipAllAndGetSumOfSecondArray = zipAllAndGetSumOfArrayAtIndex(1)

export const zipAllAndGetLastArray = pipe([zipAll, last]);
export const zipAllAndGetSumOfLastArray = pipe([zipAllAndGetLastArray, sum]);
export const zipAllAndGetMinOfLastArray = pipe([zipAllAndGetLastArray, min]);
export const zipAllAndGetLastArrayAsSet = pipe([
  zipAllAndGetLastArray,
  <T>(collection: Array<T>): Set<T> => new Set(collection),
]);
