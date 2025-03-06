export enum PositionGroup {
  Midfielder = "Midfielder",
  Attacker = "Attacker",
  Defender = "Defender",
  Goalkeeper = "Goalkeeper",
}

export enum Attacker {
  ST = "ST",
  LW = "LW",
  RW = "RW",
  CF = "CF",
}

export enum Midfielder {
  CM = "CM",
  CDM = "CDM",
  RM = "RM",
  LM = "LM",
}

export enum Defender {
  RB = "RB",
  LB = "LB",
  RCB = "RCB",
  LCB = "LCB",
}

export enum Goalkeeper {
  GK = "GK",
}

export type PositionType = Attacker | Midfielder | Defender | Goalkeeper;

export interface ContractType {
  Wage: number;
  Years: number;
}

export interface Player {
  ID: string;
  Name: string;
  PositionGroup: PositionGroup;
  Position: PositionType;
  Height: number;
  Weight: number;
  Age: number;
  NationalTeam: string;
  Contract: ContractType | null;
  Value: number;
}
