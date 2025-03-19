import { PositionGroup } from "./PlayerTypes";
export const PLAYERSKILLSANDPHYSICALDATAKEYS: Array<string> = [
  "Tackling",
  "Passing",
  "Shooting",
  "Dribbling",

  "Marking",
  "Vision",
  "Strength",

  "Attacking Work Rate",
  "Defending Work Rate",
  "Positional Awareness",
  "Sprint Speed",
  "Agility",

  "GK Positioning",
  "GK Diving",
  "GK Handling",
  "GK Reflexes",

  "Height",
  "Weight",
  "Age",
  "Years Left On Contract",
  "Wages"  
];

const HEIGHTRANGE: [number, number] = [160, 200];
const WEIGHTRANGE: [number, number] = [60, 100];
const AGERANGE: [number, number] = [18, 40];
const YEARS: [number, number] = [1, 5];
const WAGES: [number, number] = [5_000, 1_000_000];


const POSITIONPRIMARYSKILLSRANGE: [number, number] = [50, 99];
const POSITIONSECONDARYSKILLSRANGE: [number, number] = [25, 75];
const BASICSKILLSRANGE: [number, number] = [25, 99];
const OTHERSKILLSRANGE: [number, number] = [25, 50];

export const PLAYERSKILLSANDPHYSICALDATARANDOMPLUSORMINUS: number = 5

// https://gist.github.com/mstn/5f75651100556dbe30e405691471afe3
type FixedSizeArray<N extends number, T, M extends string = "0"> = {
  readonly [k in M]: any;
} & { length: N } & ReadonlyArray<T>;

export const PLAYERSKILLSANDPHYSICALDATARANGESBYPOSITION: Record<
  PositionGroup,
  FixedSizeArray<21, [number, number]>
> = {
  [PositionGroup.Midfielder]: [
    POSITIONSECONDARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,

    POSITIONSECONDARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,

    POSITIONSECONDARYSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,
    BASICSKILLSRANGE,

    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,

    HEIGHTRANGE,
    WEIGHTRANGE,
    AGERANGE,
    YEARS,
    WAGES
  ],
  [PositionGroup.Defender]: [
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,
    BASICSKILLSRANGE,
    BASICSKILLSRANGE,

    POSITIONPRIMARYSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,
    BASICSKILLSRANGE,

    BASICSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,
    BASICSKILLSRANGE,

    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,

    HEIGHTRANGE,
    WEIGHTRANGE,
    AGERANGE,
    YEARS,
    WAGES
  ],
  [PositionGroup.Attacker]: [
    BASICSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,

    BASICSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,

    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,
    BASICSKILLSRANGE,

    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,

    HEIGHTRANGE,
    WEIGHTRANGE,
    AGERANGE,
    YEARS,
    WAGES
  ],
  [PositionGroup.Goalkeeper]: [
    POSITIONSECONDARYSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,
    OTHERSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,

    POSITIONSECONDARYSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,
    BASICSKILLSRANGE,

    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,
    BASICSKILLSRANGE,

    POSITIONPRIMARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,

    HEIGHTRANGE,
    WEIGHTRANGE,
    AGERANGE,
    YEARS,
    WAGES
  ],
};

export const DEFENDINGSKILLS = new Set([
  "Tackling",
  "Positional Awareness",
  "Marking",
  "Sprint Speed",
  "Agility",
  "Defending Work Rate",
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
  "Attacking Work Rate",
]);
