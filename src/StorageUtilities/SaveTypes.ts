import { Manager as TournamentManager } from "tournament-organizer/components";
import {
  LoadableTournamentValues,
  SettableTournamentValues,
  StandingsValues,
} from "tournament-organizer/interfaces";
import { Calendar, Entity } from "../Common/CommonTypes";

export type SaveID = string | IDBValidKey;

export interface Save {
  Name: string;
  Country: string;
  MainCompetition: string;
  Club: ClubReference;
  Seasons: number;
  CurrentSeason: string;
  CurrentDate: Date;
  Entities: Record<string, Entity>;
  EntitiesStatistics: Record<string, number>;
  Skills: Record<string, Record<string, number>>;
  SaveID: SaveID;
  Calendar: Calendar;
  ScheduleManager: TournamentManager | LoadableTournamentValues;
  CompetitionStates: Record<
    string,
    [SettableTournamentValues, StandingsValues[]]
  >;
}
