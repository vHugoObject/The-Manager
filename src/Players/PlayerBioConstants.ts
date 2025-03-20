import {
  Midfielder,
  Attacker,
  Defender,
  Goalkeeper,
  PositionGroup,
} from "./PlayerTypes";


export const POSITIONS = {
  Attacker,
  Midfielder,
  Defender,
  Goalkeeper,
};


export const PLAYERBIOKEYS: Array<string> = [
  "First Name",
  "Last Name",
  "National Team",
  "Position",
  "Position Group",
]


export const POSITIONGROUPSLIST: Array<PositionGroup> = [
  PositionGroup.Goalkeeper,
  PositionGroup.Defender,
  PositionGroup.Midfielder,  
  PositionGroup.Attacker,
];

export const ALLPOSITIONS: Array<string> = [
  "GK",

  "RCB",
  "LCB",
  "LB",
  "RB",

  "CDM",
  "CM",
  "RM",
  "LM",

  "LW",
  "RW",
  "ST",
  "CF"
]

export const PLAYERBIODATABYPOSITION: Record<
  PositionGroup,
  Array<[number, number]>
> = {
  [PositionGroup.Goalkeeper]: [
    [0,0],
    [0,0]
  ],
  [PositionGroup.Defender]: [
    [1,1],
    [1,4]
  ],
  [PositionGroup.Midfielder]: [
    [2,2],
    [5,8]
  ],  
  [PositionGroup.Attacker]: [
    [3,3],
    [9,12]
  ]  
};

