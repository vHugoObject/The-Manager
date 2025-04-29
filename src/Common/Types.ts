export type BaseEntity = [string, string];

export interface BaseEntities {
  countries: Array<BaseEntity>;
  domesticLeagues: Array<Array<BaseEntity>>;
  clubs: Array<Array<Array<BaseEntity>>>;
  players?: Array<Array<Array<Array<BaseEntity>>>>;
}

export type Entity = Array<number | string | Array<string>>;

export type BaseCountry = [string, Array<string>, Array<Array<string>>];
export type BaseCountries = Array<BaseCountry>;

export enum CountryArrayIndices {
  Name,
  Competitions,
}
export enum CompetitionArrayIndices {
  Name,
  Clubs,
}
export enum ClubArrayIndices {
  Name,
  Squad,
}

export enum PositionGroup {
  Attacker = "0",
  Midfielder = "1",
  Defender = "2",
  Goalkeeper = "3",
}

export enum PLAYERBIOINDICES {
  FirstName = "0",
  LastName = "1",
  NationalTeam = "2",
  Position = "3",
  PositionGroup = "4",
}

export enum PLAYERSKILLSPHYSICALCONTRACTINDICES {
  Tackling = "0",
  Passing = "1",
  Shooting = "2",
  Dribbling = "3",

  Marking = "4",
  Vision = "5",
  Strength = "6",

  AttackingWorkRate = "7",
  DefendingWorkRate = "8",
  PositionalAwareness = "9",
  SprintSpeed = "10",
  Agility = "11",

  GKPositioning = "12",
  GKDiving = "13",
  GKHandling = "14",
  GKReflexes = "15",

  Height = "16",
  Weight = "17",
  Age = "18",
  YearsLeftOnContract = "19",
  Wages = "20",
}

export enum ALLPOSITIONS {
  GK,

  RCB,
  LCB,
  LB,
  RB,

  CDM,
  CM,
  RM,
  LM,

  LW,
  RW,
  ST,
  CF,
}

export enum DEFENDINGSKILLS {
  Tackling = "0",
  PositionalAwareness = "9",
  Marking = "5",
  SprintSpeed = "10",
  Agility = "11",
  DefendingWorkRate = "8",
}

export enum GOALKEEPINGSKILLS {
  GKPositioning = "12",
  GKDiving = "13",
  GKHandling = "14",
  GKReflexes = "15",
}

export enum ATTACKINGSKILLS {
  Passing = "1",
  Shooting = "2",
  Dribbling = "3",
  Vision = "5",
  SprintSpeed = "10",
  PositionalAwareness = "9",
  AttackingWorkRate = "7",
}

export interface SaveArguments {
  Name: string;
  UserMainDomesticLeagueID: string;
  CurrentSeason: number;
  UserClubID: string;
  BaseEntities: BaseEntities;
}

export type SaveID = string | IDBValidKey;

export interface Save {
  Name: string;
  UserMainDomesticLeagueID: string;
  UserClubID: string;
  SeasonsPlayed: number;
  CurrentSeason: number;
  CurrentDate: Date;
  Entities: Record<string, Entity>;
  EntitiesStatistics: Record<string, number>;
  PlayerSkillsAndPhysicalData: Record<string, Record<string, number>>;
  SaveID: SaveID;
}
