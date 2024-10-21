import { ComponentKeysObject, StatisticsType } from "../Common/CommonTypes";
import { Club } from "../Clubs/ClubTypes";

export interface Competition {
  Name: string;
  Clubs: Array<Club>;
  Statistics: StatisticsType;
}

export type BaseCompetitions = Record<string, Record<string, Array<string>>>;
export type AllCompetitions = Record<string, Record<string, Competition>>;
