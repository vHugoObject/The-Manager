import { sortBy, map, last, first, reduce, range, over, concat, zip, spread, divide } from "lodash/fp"
import { flowAsync, mapIndexed } from "futil-js";

export const arrayRotator = ([array, rotations]: Array<any>): Array<any> => {
  const arrayLength: number = array.length
  const effectiveRotations: number = rotations % arrayLength
  return flowAsync(
    mapIndexed((item: any, index: number) => [(index + effectiveRotations) % arrayLength, item]),
    sortBy(first),
    map(last)
  )(array)
  
}


export const totalRoundRobinMatches = (clubs: number): number => {
  return (clubs/2) * (clubs - 1)

}

export const totalRoundRobinRounds = (clubs: number): number => {
  return clubs % 2 == 0 ? clubs/2 : (clubs - 1)/2

}

export const matchesPerRoundOfRoundRobin = flowAsync(over([totalRoundRobinMatches, totalRoundRobinRounds]), spread(divide))

//// reverse second level, flatten Array, rotate, take, takeRight, flattenArray
export const roundRobinScheduler = async(clubs: Array<string>): Promise<Array<Array<[string, string]>>> => {
  return 
}



    
    
