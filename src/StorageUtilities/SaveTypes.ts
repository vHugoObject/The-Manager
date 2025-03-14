import { Entity, BaseEntities } from "../Common/CommonTypes";

export interface SaveArguments {
  Name: string;
  MainCompetition: string;
  CurrentSeason: number;
  Club: string;
  BaseEntities: BaseEntities;
}


export type SaveID = string | IDBValidKey;

export interface Save {
  Name: string;
  MainCompetition: string;
  Club: string;
  Seasons: number;
  CurrentSeason: number;
  CurrentDate: Date;
  Entities: Record<string, Entity>;
  EntitiesStatistics: Record<string, number>;
  PlayerData: Record<string, Record<string, number>>;
  SaveID: SaveID;
}
