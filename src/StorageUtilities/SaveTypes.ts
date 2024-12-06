import { Manager as TournamentManager } from "tournament-organizer/components";
import { LoadableTournamentValues } from "tournament-organizer/interfaces";
import { Calendar, Entity, StatisticsType } from "../Common/CommonTypes";

export type SaveID = string | IDBValidKey;

export interface ClubReference {
  clubID: string;
  clubName: string;
}

export interface Save {
  Name: string;
  Country: string;
  MainCompetition: string;
  Club: ClubReference;
  Seasons: number;
  CurrentSeason: string;
  CurrentDate: Date;
  Entities: Record<string, Entity>;
  EntityStatistics: Record<string, StatisticsType>;
  saveID: SaveID;
  calendar: Calendar;
  scheduleManager: TournamentManager | LoadableTournamentValues;
}
