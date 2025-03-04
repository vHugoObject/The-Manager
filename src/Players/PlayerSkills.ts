import { PositionGroup } from "./PlayerTypes";
export const PLAYERSKILLS: Array<string> = [
  "Tackling",
  "Passing",
  "Shooting",
  "Dribbling",
  "Marking",
  "Vision",
  "Aggression",
  "Stamina",
  "Strength",
  "Positional Awareness",
  "Sprint Speed",
  "Agility",
  "GK Positioning",
  "GK Diving",
  "GK Handling",
  "GK Reflexes",
];

const BASICRANGE: [number, number] = [25, 99];

export const SKILLRANGESBYPOSITION: Record<
  PositionGroup,
  Array<[number, number]>
> = {
  [PositionGroup.Midfielder]: [
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
  ],
  [PositionGroup.Defender]: [
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
  ],
  [PositionGroup.Attacker]: [
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
  ],
  [PositionGroup.Goalkeeper]: [
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
    BASICRANGE,
  ],
};

export const DEFENDINGSKILLS = new Set([
  "Tackling",
  "Positional Awareness",
  "Marking",
  "Sprint Speed",
  "Agility",
  "Stamina",
]);

export const GOALKEEPINGSKILLS = new Set([
  "GK Positioning",
  "GK Diving",
  "GK Handling",
  "GK Reflexes",
]);
export const ATTACKINGSKILLS = new Set([
  "Passing",
  "Shooting",
  "Dribbling",
  "Vision",
  "Sprint Speed",
  "Positional Awareness",
  "Stamina",
]);
