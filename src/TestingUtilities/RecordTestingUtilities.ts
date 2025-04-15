import { pipe } from "lodash/fp";
import { fc } from "@fast-check/vitest";
import { fastCheckRandomItemFromArray } from "./ArrayTestingUtilities"
import {
  curry
} from "lodash/fp"
  
export const fastCheckRandomObjectKey = curry(
  (fcGen: fc.GeneratorValue, object: Record<string, any>): string => {
    return pipe([Object.keys, fastCheckRandomItemFromArray(fcGen)])(object);
  },
);
