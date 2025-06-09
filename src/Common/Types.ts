export type BaseCountry = [string, Array<string>, Array<Array<string>>];
export type BaseCountries = Array<BaseCountry>;

export interface SaveArguments {
  Name: string;
  UserMainDomesticLeagueID: string;
  CurrentSeason: number;
  UserClubID: string;
  Countries: BaseCountries;
}

export type SaveID = string | IDBValidKey;

export interface Save {
  Name: string;
  UserMainDomesticLeagueID: string;
  UserClubID: string;
  SeasonsPlayed: number;
  CurrentSeason: number;
  CurrentDate: Date;
  Entities: Record<string, Array<number|string>>;
  EntitiesStatistics: Record<string, number>;
  PlayerSkillsAndPhysicalData: Record<string, Record<string, number>>;
  SaveID: SaveID;
}
