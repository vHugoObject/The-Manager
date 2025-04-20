import { PositionGroup } from "../Players/PlayerTypes";
export const DEFAULTMATCHCOMPOSITION: Array<number> = [1, 4, 3, 3];
export const DEFAULTSQUADSIZE: number = 25;
export const BASECLUBCOMPOSITION: Array<[PositionGroup, number]> = [
  [PositionGroup.Goalkeeper, 4],
  [PositionGroup.Defender, 7],
  [PositionGroup.Midfielder, 7],
  [PositionGroup.Attacker, 7],
];
