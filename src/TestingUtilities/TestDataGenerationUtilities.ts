import { Faker, Randomizer, en } from "@faker-js/faker";
import { fc } from "@fast-check/vitest";
import {
  curry,
  over,
  add,
  zip,
  identity,
  partialRight,
  pipe,
  multiply,
  chunk,
  first,
  zipAll,
} from "lodash/fp";
import { NONSPACESCHARACTERRANGE } from "./Constants"
import {
  unfoldBooleanCountTuplesIntoShuffledArrayOfBooleans,
  boundedModularAddition,
  minusOne,
  integerToCharacter,
  convertRangeSizeAndMinIntoRange,
  unfoldAndShuffle,
  addMinusOne,
  mapFlatten,
  unfoldStringStartingIndexAndCountTuplesIntoShuffledArrayOfStringIDs,
  flattenAndShuffle,
  getFirstLevelArrayLengths,
} from "../Common/index"



class FakerBuilder<TValue> extends fc.Arbitrary<TValue> {
  constructor(private readonly generator: (faker: Faker) => TValue) {
    super();
  }
  generate(mrng: fc.Random, biasFactor: number | undefined): fc.Value<TValue> {
    const randomizer: Randomizer = {
      next: (): number => mrng.nextDouble(),
      seed: () => {}, // no-op, no support for updates of the seed, could even throw
    };
    const customFaker = new Faker({ locale: en, randomizer });
    return new fc.Value(this.generator(customFaker), undefined);
  }
  canShrinkWithoutContext(value: unknown): value is TValue {
    return false;
  }
  shrink(value: TValue, context: unknown): fc.Stream<fc.Value<TValue>> {
    return fc.Stream.nil();
  }
}

export function fakerToArb<TValue>(
  generator: (faker: Faker) => TValue,
): fc.Arbitrary<TValue> {
  return new FakerBuilder(generator);
}



export const fastCheckRandomInteger = (fcGen: fc.GeneratorValue) =>
  fcGen(fc.integer);


export const fastCheckRandomIntegerInRange = curry(
  (fcGen: fc.GeneratorValue, [rangeMin, rangeMax]: [number, number],): number => {
    return fcGen(fc.integer, { min: rangeMin, max: minusOne(rangeMax) });
  },
);

export const fastCheckRandomIntegerInRangeAsString = curry(
  (fcGen: fc.GeneratorValue, [rangeMin, rangeMax]: [number, number]): string => {
    return pipe([fastCheckRandomIntegerInRange(fcGen), toString])([rangeMin, rangeMax], fcGen)
  },
);

export const fastCheckRandomCharacterGenerator = curry(
  ([rangeMin, rangeMax]: [number, number], fcGen: fc.GeneratorValue): string => {
    return pipe([fastCheckRandomIntegerInRange(fcGen), integerToCharacter])([rangeMin, rangeMax])
  },
);

export const fastCheckNonSpaceRandomCharacterGenerator = fastCheckRandomCharacterGenerator(NONSPACESCHARACTERRANGE)


export const fastCheckTestLinearRangeGenerator = curry((fcGen: fc.GeneratorValue, rangeSize: number): [number, number] => {
  
  return pipe([fastCheckRandomInteger, convertRangeSizeAndMinIntoRange(rangeSize)])(fcGen)
})


export const fastCheckTestLinearRangeWithMinimumGenerator = curry((fcGen: fc.GeneratorValue, [rangeMin, rangeSize]: [number, number]): [number, number] => {
  return pipe([convertRangeSizeAndMinIntoRange, fastCheckRandomIntegerInRange(fcGen), convertRangeSizeAndMinIntoRange(rangeSize)])(rangeSize, rangeMin)
})



export const fastCheckNLengthUniqueIntegerArrayGenerator = curry((fcGen: fc.GeneratorValue, arraySize: number): Array<number> => {
  
  return pipe([fastCheckRandomInteger, add, unfoldAndShuffle(arraySize)])(fcGen)
})



export const fastCheckNLengthArrayOfXGenerator = curry((unfolder: (index: number) => any,
  range: [number, number],
  fcGen: fc.GeneratorValue,
  arraySize: number): Array<any> => {
  
    return pipe([fastCheckRandomIntegerInRange(fcGen),
    unfolder,
    unfoldAndShuffle(arraySize)])(range)
  })



export const boundedModularAdditionForNONSPACESCHARACTERRANGE = curry((start: number, index: number) => pipe([boundedModularAddition(NONSPACESCHARACTERRANGE), integerToCharacter])(start, index))

export const fastCheckNLengthUniqueStringArrayGenerator = fastCheckNLengthArrayOfXGenerator(boundedModularAdditionForNONSPACESCHARACTERRANGE, NONSPACESCHARACTERRANGE)

export const fastCheckNUniqueIntegersFromRangeAsArrayGenerator = curry((fcGen: fc.GeneratorValue, [range, arraySize]: [[number,number], number]): Array<number> => {
    
  return pipe([fastCheckRandomIntegerInRange(fcGen),
    boundedModularAddition(range),
    unfoldAndShuffle(arraySize)])(range)
})

const addersForStringCountTuples = curry((start: number, index: number) => over([boundedModularAdditionForNONSPACESCHARACTERRANGE, add])(start, index))

export const fastCheckNLengthArrayOfStringCountTuplesGenerator = fastCheckNLengthArrayOfXGenerator(addersForStringCountTuples, NONSPACESCHARACTERRANGE) 

export const fastCheckTestSingleStringCountTupleGenerator = pipe([partialRight(fastCheckNLengthArrayOfStringCountTuplesGenerator, [1]), first])

export const fastCheckNLengthArrayOfStringsAndIntegersGenerator = pipe([
  fastCheckNLengthArrayOfStringCountTuplesGenerator,
  zipAll,
  over([flattenAndShuffle, getFirstLevelArrayLengths])
])

const addersForStringCountIndexTuples  = curry((start: number, index: number) => over([boundedModularAdditionForNONSPACESCHARACTERRANGE, add, addMinusOne])(start, index))


export const fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator = fastCheckNLengthArrayOfXGenerator(addersForStringCountIndexTuples, NONSPACESCHARACTERRANGE) 
	     
export const fastCheckTestSingleStringCountStartingIndexTupleGenerator = pipe([partialRight(fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator, [1]), first])



export const fastCheckArrayOfNIntegerArraysGenerator = curry((fcGen: fc.GeneratorValue, [arrayCount, sizeOfArrays]: [number, number]): Array<Array<number>> => {
  
  return pipe([multiply,
    fastCheckNLengthUniqueIntegerArrayGenerator(fcGen),
    chunk(sizeOfArrays),
  ])(arrayCount, sizeOfArrays)
  
})



export const fastCheckNLengthArrayXTuplesGivenItemsAndRangeOfCountsGenerator = curry(<T>(unfolder: (index: number) => any,
  items: Array<T>,
  fcGen: fc.GeneratorValue,
  [rangeMin, rangeSize]: [number, number]): Array<[T, number, number]> => {

    // try map for random number selection
    return pipe([
      convertRangeSizeAndMinIntoRange,
      fastCheckRandomIntegerInRange(fcGen),
      unfolder,
      unfoldAndShuffle(items.length),
      zip(items)
  ])(rangeSize, rangeMin)

})

export const fastCheckNLengthArrayOfItemCountTuplesGivenItemsAndRangeOfCountsGenerator = fastCheckNLengthArrayXTuplesGivenItemsAndRangeOfCountsGenerator(add)


const addersForCountIndexTuples = curry((start: number, index: number) => over([add, addMinusOne])(start, index))


export const fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator = pipe([
  fastCheckNLengthArrayXTuplesGivenItemsAndRangeOfCountsGenerator(addersForCountIndexTuples),
  mapFlatten
])

const fastCheckTestIDUnfolder = over([unfoldStringStartingIndexAndCountTuplesIntoShuffledArrayOfStringIDs, identity])

export const fastCheckTestMixedArrayOfStringIDsGivenStringsGenerator = pipe([
  fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator,
  fastCheckTestIDUnfolder
])

export const fastCheckTestMixedArrayOfStringIDsGenerator = pipe([
  fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator,
  fastCheckTestIDUnfolder
])

const fastCheckTestItemsUnfolder = over([unfoldBooleanCountTuplesIntoShuffledArrayOfBooleans, identity])

export const fastCheckTestMixedArrayOfBooleansGenerator = pipe([
  fastCheckNLengthArrayXTuplesGivenItemsAndRangeOfCountsGenerator(add, [0, 1]),
  fastCheckTestItemsUnfolder,  
])
