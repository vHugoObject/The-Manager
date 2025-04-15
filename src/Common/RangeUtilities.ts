// Ranges are not max inclusive
import {
  map,
  over,
  identity,
  curry,
  pipe
} from "lodash/fp";
import { getFirstAndLastItemsOfArray, convertArrayOfStringsIntoArrayOfIntegers } from "./ArrayUtilities"
import { reverseThenSpreadSubtract, minusOne, addPlusOne } from "./MathUtilities"

export const foldArrayIntoLinearRange = pipe([
  Object.keys,
  getFirstAndLastItemsOfArray,
  convertArrayOfStringsIntoArrayOfIntegers
]);

export const convertArrayOfArraysIntoArrayOfLinearRanges = map(foldArrayIntoLinearRange);

export const getLengthOfLinearRange = pipe([reverseThenSpreadSubtract, minusOne])

export const convertRangeSizeAndMinIntoRange = curry((rangeSize: number, rangeMin: number): [number, number] => {
  return over<number>([identity, addPlusOne(rangeSize)])(rangeMin) as [number, number]
})
