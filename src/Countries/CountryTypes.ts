export interface Country {
  ID: string;
  Name: string;
  Competitions: Record<string, string>;
  CurrentSeason: string;
}

export type BaseCountries = Record<string, Record<string, Record<string,string>>>;


