import { StatisticsType } from "../Common/CommonTypes";

export interface Country {
  ID: string;
  Name: string;
  Statistics: StatisticsType;
  Competitions: Record<string, string>;
  CurrentSeason: string;
}

export type BaseCountries = Record<
  string,
  Record<string, Record<string, string>>
>;
