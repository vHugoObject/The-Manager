import { fc } from "@fast-check/vitest";
import {
  map,
  over,
  range,
  sum,
  eq,
  filter,
  concat,
  zip,
  zipAll,
  curry,
  spread,
  zipWith,
} from "lodash/fp";
import { flowAsync } from "futil-js";
import fastCartesian from "fast-cartesian";
import { PositionGroup } from "../Players/PlayerTypes";
import { generateSkillsAndPhysicalDataForMultiplePositionGroups } from "../Players/PlayerUtilities";
import { fastCheckRandomNumber } from "../Common/index";

export const generateTestOutfieldPlayersComposition = (
  fcGen: fc.GeneratorValue,
): Array<number> => {
  return flowAsync(
    (nums: Array<number>) => fastCartesian([nums, nums, nums]),
    filter(flowAsync(sum, eq(10))),
    (compositons: Array<Array<number>>) =>
      fcGen(fc.constantFrom, ...compositons),
  )(range(1, 11));
};

export const generateTestComposition = curry(
  async (
    startingIndex: number,
    fcGen: fc.GeneratorValue,
  ): Promise<Array<[number, number, number]>> => {
    return flowAsync(
      generateTestOutfieldPlayersComposition,
      concat([1]),
      zipWith(
        (
          positionGroup: string,
          positionCount: number,
        ): [string, number, number] => {
          return [positionGroup, positionCount, startingIndex];
        },
        Object.values(PositionGroup),
      ),
    )(fcGen);
  },
);

export const generateTestStartingEleven = flowAsync(
  generateTestComposition(0),
  generateSkillsAndPhysicalDataForMultiplePositionGroups,
);

export const generateTwoTestStartingElevens = flowAsync(
  zip([0, 11]),
  map(spread(generateTestComposition)),
  flowAsync(map(generateSkillsAndPhysicalDataForMultiplePositionGroups)),
);

export const generateTwoTestStartingElevenTuples = flowAsync(
  over([map(fastCheckRandomNumber), generateTwoTestStartingElevens]),
  zipAll,
);
