import { Entity, BaseEntities } from "../Common/CommonTypes";

export interface SaveArguments {
  Name: string;
  UserMainCompetitionID: string;
  CurrentSeason: number;
  UserClubID: string;
  BaseEntities: BaseEntities;
}

export type SaveID = string | IDBValidKey;

export interface Save {
  Name: string;
  UserMainCompetitionID: string;
  UserClubID: string;
  SeasonsPlayed: number;
  CurrentSeason: number;
  CurrentDate: Date;
  Entities: Record<string, Entity>;
  EntitiesStatistics: Record<string, number>;
  PlayerSkillsAndPhysicalData: Record<string, Record<string, number>>;
  SaveID: SaveID;
}
