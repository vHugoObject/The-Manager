import {
  sum,
  subtract,
  identity,
  map,
  sortBy,
  first,
  last,
  takeRight,
  take,
  reduce,
  over,
  slice,
  flip,
  concat,
  curry,
  size,
  flatMapDeep,
  countBy,
  toString,
  spread,
  zip,
  filter,
  isString,
  isArray,
  isInteger,
  zipAll,
  min,
  max,
  flatten,
  pipe,
  compact,
  property,
  initial,
  isBoolean,
  shuffle,
  flatMap,
  partialRight
} from "lodash/fp";
import { mapIndexed } from "futil-js";
import { overPredicatesThenConvertResultsToIntegers,
  convertIntegersIntoBooleans,
  mapZeros, zipAdd, isTrue, isFalse } from "./FunctionUtilities"



export const convertToSet = <T>(collection: Array<T>): Set<T> => {
  return new Set(collection);
};
export const flattenAndConvertToSet = pipe([flatten, convertToSet])
export const flattenAndShuffle = pipe([flatten, shuffle])
export const concatAndConvertToSet = pipe([concat, convertToSet])
export const convertToSetAndGetSize = pipe([convertToSet, size])

export const convertArrayOfArraysToArrayOfSets = map(convertToSet);
export const convertArrayOfArraysToArrayOfSetsAndGetSizes = map(convertToSetAndGetSize);

export const getFirstLevelArrayLengths = map(size);
export const getFirstLevelArrayMinValues = map(min);
export const getFirstLevelArrayMaxValues = map(max);
export const getSumOfFirstLevelArrayLengths = pipe([getFirstLevelArrayLengths, sum])
export const flattenAndGetSizeOfArray = pipe([flatten, size])
export const getSumOfFlattenedArray = pipe([flatten, sum]);
export const mapFlatten = map(flatten)
export const compactThenGetSize = pipe([compact, size])

export const getFirstLevelArrayLengthsAsSet = pipe([
  getFirstLevelArrayLengths,
  convertToSet,
]);
export const getSecondLevelArrayLengths = pipe([
  flatMapDeep(map(size)),
]);

export const getSecondLevelArrayLengthsAndFlatten = pipe([flatMap(getSecondLevelArrayLengths)])

export const getFirstAndLastItemsOfArray = over([first, last])
export const getMinAndMaxOfArray = over([min, max])
export const getSizeMinAndMaxOfArray = over([size, min, max])
export const sortByIdentity = sortBy(identity);
export const lastTwoArrayValues = takeRight(2);
export const firstTwoArrayValues = take(2);
export const zipAllAndGetInitial = pipe([zipAll, initial])

export const zipAndGetFirstArray = pipe([zipAll, first])
export const zipAndGetFirstArrayAsSet = pipe([zipAndGetFirstArray, convertToSet])
export const zipAndGetSumOfFirstArray = pipe([zipAndGetFirstArray, sum])

export const zipAndGetArrayAtIndex = curry((index: number, array: Array<Array<any>>) => pipe([zipAll, property(index)])(array))
export const zipAndGetMinOfArrayAtIndex = curry((index: number, array: Array<Array<any>>) => pipe([zipAndGetArrayAtIndex(index), min])(array))
export const zipAndGetSumOfArrayAtIndex = curry((index: number, array: Array<Array<any>>) => pipe([zipAndGetArrayAtIndex(index), sum])(array))

export const zipAndGetLastArray = pipe([zipAll, last])
export const zipAndGetSumOfLastArray = pipe([zipAndGetLastArray, sum])
export const zipAndGetMinOfLastArray = pipe([zipAndGetLastArray, min])
export const zipAndGetLastArrayAsSet = pipe([zipAndGetLastArray, convertToSet])


export const sortTuplesByFirstValueInTuple = sortBy(first);
export const convertArrayOfIntegersIntoArrayOfStrings = map(toString);
export const convertArrayOfStringsIntoArrayOfIntegers = map(parseInt);
export const countByIdentity = countBy(identity);


export const getArraysSizeDifference = pipe([map(size), spread(subtract)]);


export const getCountOfItemsFromArrayForPredicate = curry(<T>(predicate: (arg: T) => boolean, array: Array<T>): number => {
  return pipe([filter(predicate), size])(array)
})

export const getArrayStringCount = getCountOfItemsFromArrayForPredicate(isString)
export const getArrayIntegerCount = getCountOfItemsFromArrayForPredicate(isInteger)
export const getArrayArrayCount = getCountOfItemsFromArrayForPredicate(isArray)
export const getArrayBooleanCount = getCountOfItemsFromArrayForPredicate(isBoolean)
export const getArrayTrueCount = getCountOfItemsFromArrayForPredicate(isTrue)
export const getArrayFalseCount = getCountOfItemsFromArrayForPredicate(isFalse)



export const unfoldStartingIndexAndCountIntoRange = curry((startingIndex: number, count: number): Array<number> => {
  return Array.from({length: count}, (_, index: number) => startingIndex+index)
})



export const unfoldItemCountTupleIntoArray = curry(<T>([item, count]: [T, number]): Array<T> => {
  return Array(count).fill(item)
})

export const unfoldItemCountTuplesIntoTupleOfArrays = map(unfoldItemCountTupleIntoArray)

export const unfoldItemCountTuplesIntoMixedArray = flatMap(unfoldItemCountTupleIntoArray)

export const unfoldBooleanCountTuplesIntoArrayOfBooleans = pipe([unfoldItemCountTuplesIntoMixedArray, convertIntegersIntoBooleans])

export const unfoldBooleanCountTuplesIntoShuffledArrayOfBooleans = pipe([unfoldBooleanCountTuplesIntoArrayOfBooleans, shuffle])

export const arrayRotator = ([array, rotations]: Array<any>): Array<any> => {
  const arrayLength: number = array.length;
  const effectiveRotations: number = rotations % arrayLength;
  return pipe([
    mapIndexed((item: any, index: number) => [
      (index + effectiveRotations) % arrayLength,
      item,
    ]),
    sortBy(first),
    map(last),
  ])(array);
};



export const zipLongest = curry(
  <T>(
    fillValue: T,
    [arrayOne, arrayTwo]: [Array<T>, Array<T>],
  ): Array<[T, T]> => {
    return pipe([
      getArraysSizeDifference,
      (length: number) => Array.from({ length }, () => fillValue),
      concat(arrayTwo),
      zip(arrayOne),
    ])([arrayOne, arrayTwo]);
  },
);



export const sliceUpArray = curry(
  (arrayOfSliceLengths: Array<number>, array: Array<any>): Array<any> => {
    return pipe([
      reduce(
        (
          [slices, currentStartIndex]: [Array<any>, number],
          currentSliceLength: number,
        ) => {
          return pipe([sum, (currentEndIndex: number) => [
            concat(slices, [slice(currentStartIndex, currentEndIndex, array)]),
            currentEndIndex,
          ]])([currentStartIndex, currentSliceLength]);
        },
        [[], 0],
      ),
      first,
    ])(arrayOfSliceLengths);
  },
);

export const unflatten = curry(
   (
    arrayOfArraysOfSliceLengths: Array<Array<number>>,
    array: Array<any>,
  ) => {
    return reduce(flip(sliceUpArray), array)(arrayOfArraysOfSliceLengths);
  },
);

export const transformNestedAsFlat = curry(
   (
    [flattener, sliceCounter, sliceCreator]: [Function, Function, Function],
    transformer: Function,
    nestedData: Array<any>,
  ): Array<any> => {
    const levels = sliceCounter(nestedData);
    return pipe([
      flattener,
      transformer,
      sliceCreator(levels),
    ])(nestedData);
  },
);





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
