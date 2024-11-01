import { StatisticsType } from "../Common/CommonTypes";
import { Club } from "../Clubs/ClubTypes";

export interface Competition {
  ID: string;
  Name: string;
  Clubs: Record<string, Club>;
  Statistics: StatisticsType;
}

export type BaseCompetitions = Record<string, Record<string, Array<string>>>;
export type AllCompetitions = Record<string, Record<string, Competition>>;
