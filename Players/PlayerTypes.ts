export enum Foot {
  Right = "Right",
  Left = "Left",
}

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

export type Position = Attacker | Midfielder | Defender | Goalkeeper;

export type StatisticsObject = Record<string, number>;

export interface PlayerStatistics {
  BySeason: Record<string, StatisticsObject>;
  GameLog: Record<string, StatisticsObject>;
}

export type ComponentKeysObject = Record<string, Array<string>>;

export type SkillSet = Record<string, Number>;

export interface BiographicalDetails {
  Name: string;
  PreferredFoot: Foot;
  Height: number;
  Weight: number;
  Age: number;
  NationalTeam: string;
}

export interface ContractType {
  Wage: number;
  Years: number;
}

export interface Player {
  ID: number;
  Name: string;
  PositionGroup: PositionGroup;
  PreferredPosition: Position;
  PreferredFoot: Foot;
  Height: number;
  Weight: number;
  Age: number;
  NationalTeam: string;
  Club: string | null;
  Contract: ContractType | null;
  Value: number;
  Rating: number;
  Skills: Record<string, SkillSet>;
  Statistics: PlayerStatistics;
  ComponentKeys: ComponentKeysObject;
}
