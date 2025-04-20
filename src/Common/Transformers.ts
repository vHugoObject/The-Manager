import { pipe, concat, size, map, flatten,
  curry, over, identity, add, first, last, split, shuffle,
  reduce, sum, slice, flip,
  sortBy, join 
} from "lodash/fp";
export const convertToSet = <T>(collection: Array<T>): Set<T> => {
  return new Set(collection);
};

export const convertConcatenatedArraysIntoSet = pipe([concat, convertToSet]);
export const convertFlattenedArrayIntoSet = pipe([flatten, convertToSet]);
export const convertToSetAndGetSize = pipe([convertToSet, size]);
export const convertArrayOfArraysToArrayOfSets = map(convertToSet);
export const convertArrayOfArraysToArrayOfSetsAndGetSizes = map(
  convertToSetAndGetSize,
);
export const convertArrayOfIntegersIntoArrayOfStrings = map(toString);
export const convertArrayOfStringsIntoArrayOfIntegers = map(parseInt);

export const mapFlatten = map(flatten)
export const convertArrayOfArraysIntoShuffledArray = pipe([flatten, shuffle]);

export const convertRangeSizeAndMinIntoRange = curry(
  (rangeSize: number, rangeMin: number): [number, number] => {
    return over<number>([identity, pipe([add(rangeSize), add(1)])])(rangeMin) as [
      number,
      number,
    ];
  },
);

export const convertArrayIntoLinearRange = pipe([
  Object.keys,
  over([first, last]),
  convertArrayOfStringsIntoArrayOfIntegers,
]);

export const convertArrayOfArraysIntoArrayOfLinearRanges = map(
  convertArrayIntoLinearRange
);


export const convertObjectKeysIntoSet = pipe([
  Object.keys,
  <T>(collection: Array<T>): Set<T> => new Set(collection),
]);




export const splitOnUnderscores = split("_");
export const joinOnUnderscores = join("_");
export const convertCharacterIntoCharacterCode = (character: string): number =>
  character.charCodeAt(0);
export const convertCharacterCodeIntoCharacter = (integer: number): string =>
  String.fromCharCode(integer);
export const  convertArrayOfIntegersIntoArrayOfCharacters = map(convertCharacterIntoCharacterCode);

export const sliceUpArray = curry(
  <T>(arrayOfSliceLengths: Array<number>, array: Array<T>): Array<T> => {
    return pipe([
      reduce(
        (
          [slices, currentStartIndex]: [Array<any>, number],
          currentSliceLength: number,
        ) => {
          return pipe([
            sum,
            (currentEndIndex: number) => [
              concat(slices, [
                slice(currentStartIndex, currentEndIndex, array),
              ]),
              currentEndIndex,
            ],
          ])([currentStartIndex, currentSliceLength]);
        },
        [[], 0],
      ),
      first,
    ])(arrayOfSliceLengths);
  },
);

export const unflatten = curry(
  <T>(arrayOfArraysOfSliceLengths: Array<Array<number>>, array: Array<T>): Array<T> => {
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
    return pipe([flattener, transformer, sliceCreator(levels)])(nestedData);
  },
);



export const sortByIdentity = sortBy(identity);
export const sortTuplesByFirstValueInTuple = sortBy(first);
