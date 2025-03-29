import {
  keyBy
} from "lodash/fp";
import { unkeyBy } from "futil-js";

export const convertEntitiesObjectIntoArrayOfEntitiesObjects = unkeyBy("ID")
export const convertArrayOfEntitiesObjectsIntoEntitiesObject = keyBy("ID")
