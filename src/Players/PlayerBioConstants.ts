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

export const POSITIONGROUPSLIST: Array<PositionGroup> = [
  PositionGroup.Midfielder,
  PositionGroup.Defender,
  PositionGroup.Attacker,
  PositionGroup.Goalkeeper,
];

export const PLAYERBIOKEYS: Array<string> = [
  "Name",
  "PositionGroup",
  "Position",
  "NationalTeam"
]

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
