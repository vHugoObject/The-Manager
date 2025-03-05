import { Entity } from "../Common/CommonTypes";

export type SaveID = string | IDBValidKey;

export interface Save {
  Name: string;
  Country: string;
  MainCompetition: string;
  Club: string;
  Seasons: number;
  CurrentSeason: number;
  CurrentDate: Date;
  //Schedule
  Entities: Record<string, Entity>;
  EntitiesStatistics: Record<string, number>;
  Skills: Record<string, Record<string, number>>;
  SaveID: SaveID;
  
}
