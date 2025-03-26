import {
  PositionGroup,
} from "./PlayerTypes";


//
export const POSITIONGROUPSLIST: Array<PositionGroup> = [
  PositionGroup.Goalkeeper,
  PositionGroup.Defender,
  PositionGroup.Midfielder,
  PositionGroup.Attacker,
];


export const PLAYERBIODATABYPOSITION: Record<
  PositionGroup,
  Array<[number, number]>
> = {
  [PositionGroup.Goalkeeper]: [
    [0, 0],
    [0, 0],
  ],
  [PositionGroup.Defender]: [
    [1, 1],
    [1, 4],
  ],
  [PositionGroup.Midfielder]: [
    [2, 2],
    [5, 8],
  ],
  [PositionGroup.Attacker]: [
    [3, 3],
    [9, 12],
  ],
};
