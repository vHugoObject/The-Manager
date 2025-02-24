import {
  Midfielder,
  Attacker,
  Defender,
  Goalkeeper,
  PositionGroup,
} from "./PlayerTypes";

export const HEIGHTRANGE: [number, number] = [160, 200];
export const WEIGHTRANGE: [number, number] = [60, 100];
export const AGERANGE: [number, number] = [18, 40];
export const YEARS: [number, number] = [1, 7];
export const WAGES: [number, number] = [5_000, 1_000_000];
export const BIORANGES: Array<[number, number]> = [
  HEIGHTRANGE,
  WEIGHTRANGE,
  AGERANGE,
  YEARS,
  WAGES,
];

export const POSITIONS = {
  Attacker,
  Midfielder,
  Defender,
  Goalkeeper,
};

export const POSITIONGROUPSLIST: Array<PositionGroup> = [
  PositionGroup.Midfielder,
  PositionGroup.Defender,
  PositionGroup.Attacker,
  PositionGroup.Goalkeeper,
];
