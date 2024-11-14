import { StatisticsType } from "../Common/CommonTypes";
import { Club } from "../Clubs/ClubTypes";

// need to add country
export interface Competition {
  ID: string;
  Name: string;
  Country: string;
  Clubs: Record<string, string>;
  Statistics: StatisticsType;
}

export type Competitions = Record<string, Record<string, Competition>>;
