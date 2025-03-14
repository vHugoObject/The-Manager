import { isSunday } from "date-fns";
import { PositionGroup } from "../Players/PlayerTypes";

export const JANUARY: number = 0;
export const FEBRUARY: number = 1;
export const JUNE: number = 5;
export const AUGUST: number = 7;
export const SEPTEMBER: number = 8;
export const DECEMBER: number = 11;

export const MATCHDAYFUNCTIONS: Record<string, Function> = {
  domesticLeague: isSunday,
};

export const BASECLUBCOMPOSITION: Array<[PositionGroup, number]> = [
  [PositionGroup.Goalkeeper, 4],
  [PositionGroup.Defender, 7],
  [PositionGroup.Midfielder, 7],
  [PositionGroup.Attacker, 7],
];

export const DEFAULTSQUADSIZE: number = 25;
