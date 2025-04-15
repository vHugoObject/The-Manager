import {
  curry,  
  zipWith,
  pipe,
  shuffle,
  spread,
  map,
  startsWith,
  toNumber,
  constant,
  flatMap,
  isEqual,
  add,
} from "lodash/fp";

export const isTrue = isEqual(true)
export const isFalse = isEqual(false)

export const apply = <T>(func: (arg: T) => T, funcArg: T): T => {
  return func(funcArg)
}

export const zipApply = zipWith(apply)
export const zipAdd = zipWith<number, number, number>(add)


export const unfold = curry((unfolder: (index: number) => any, arraySize: number): Array<any> => {
  return Array.from({length: arraySize}, (_, index: number) => unfolder(index))
})

export const spreadUnfold = spread(unfold)
export const flatMapSpreadUnfold = flatMap(spreadUnfold)
export const unfoldAndShuffle = curry((arraySize: number, unfolder: (index: number) => any): Array<any> => {
  return pipe([unfold, shuffle])(unfolder, arraySize)
})

export const mapStartsWith = map(startsWith)
export const mapZeros = map(constant(0))
export const convertBooleansIntoIntegers = map(toNumber)
export const convertIntegersIntoBooleans = map(Boolean)



