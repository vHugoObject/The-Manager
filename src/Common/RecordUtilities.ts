import { size, pipe, spread, zipObject } from "lodash/fp"
import { convertToSet } from "./ArrayUtilities"

export const convertObjectKeysIntoSet = pipe([Object.keys, convertToSet]);
export const getObjectKeysCount = pipe([Object.keys, size]);
export const spreadZipObject = spread(zipObject)
