import "lodash.product";
import _ from "lodash";

export const U: number = -1.035;
export const HOMEEFFECT: number = 0.383;
export const POSSIBLEGOALS: Array<number> = [0, 1, 2, 3, 4, 5];  
export const THETA: number = 0.562;
export const SHAPE: number = 1.864;

export const EMPTYSCOREMATRIX: Array<number[]> = _.product(POSSIBLEGOALS, POSSIBLEGOALS);

