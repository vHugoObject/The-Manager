import {
  sum,
  map,
  last,
  takeRight,
  take,
  flatMapDeep,
  min,
  max,
  flatten,
  pipe,
  compact,
  property,
  flatMap,
  size,
  over,
  split,
  first,
  isEqual,
  isString,
  isInteger,
  isBoolean,
  countBy,
  identity,
  curry,
  filter,
  isArray,
  pick
} from "lodash/fp";

export const isTrue = isEqual(true);
export const isFalse = isEqual(false);

export const getFirstLevelArrayLengths = map(size);
export const getFirstLevelArrayMinValues = map(min);
export const getFirstLevelArrayMaxValues = map(max);
export const getSumOfFirstLevelArrayLengths = pipe([
  getFirstLevelArrayLengths,
  sum,
]);
export const getSecondArrayValue = property([1]);
export const getSecondArrayValuesOfNestedArrays = map(getSecondArrayValue);
export const getSizeOfCompactedAray = pipe([compact, size]);
export const getFirstLevelArrayLengthsAsSet = pipe([getFirstLevelArrayLengths]);
export const getSecondLevelArrayLengths = pipe([flatMapDeep(map(size))]);

export const getSecondLevelArrayLengthsAndFlatten = pipe([
  flatMap(getSecondLevelArrayLengths),
]);

export const getFirstAndLastItemsOfArray = over([first, last]);
export const getMinAndMaxOfArray = over([min, max]);
export const getSizeMinAndMaxOfArray = over([size, min, max]);

export const getLastTwoArrayValues = takeRight(2);
export const getFirstTwoArrayValues = take(2);

export const getSumOfFlattenedArray = pipe([flatten, sum]);
export const getSizeOfFlattenedArray = pipe([flatten, size]);
export const getObjectKeysCount = pipe([Object.keys, size]);

export const getPartsOfIDAsArray = split("_")
export const getIDPrefix = pipe([getPartsOfIDAsArray, first]);
export const getIDPrefixes = map(getIDPrefix)
export const getIDSuffix = pipe([getPartsOfIDAsArray, last]);
export const getLastEntityIDNumber = pipe([last, getIDSuffix]);
export const getLastIDNumberOutOfIDNameTuple = pipe([last, first, getIDSuffix]);

export const countByIdentity = countBy(identity);

export const getCountOfItemsFromArrayForPredicate = curry(
  <T>(predicate: (arg: T) => boolean, array: Array<T>): number => {
    return pipe([filter(predicate), size])(array);
  },
);

export const getCountOfStringsFromArray =
  getCountOfItemsFromArrayForPredicate(isString);
export const getCountOfIntegersFromArray =
  getCountOfItemsFromArrayForPredicate(isInteger);
export const getCountOfArraysFromArrays = getCountOfItemsFromArrayForPredicate(isArray);
export const getCountOfBooleansFromArray =
  getCountOfItemsFromArrayForPredicate(isBoolean);
export const getCountOfTrueFromArray = getCountOfItemsFromArrayForPredicate(isTrue);
export const getCountOfFalseFromArray = getCountOfItemsFromArrayForPredicate(isFalse);

export const countByIDPrefix = countBy(getIDPrefix);

export const getCountOfStringsFromFlattenedArray = pipe([flatten, getCountOfStringsFromArray])

export const getCountsForASetOfIDPrefixes = (
  idPrefixes: Array<string>,
  ids: Array<string>,
): Record<string, number> => {
  return pipe([countByIDPrefix, pick(idPrefixes)])(ids);
};
