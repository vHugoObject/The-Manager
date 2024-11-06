import { Manager as TournamentManager } from 'tournament-organizer/components';
import { LoadableTournamentValues } from 'tournament-organizer/interfaces';
import { AllCompetitions } from "../Competitions/CompetitionTypes";
import { Calendar } from "../Common/CommonTypes";

export type SaveID = string | IDBValidKey;

export interface Save {
  Name: string;
  Country: string;
  MainCompetition: string;
  Club: string;
  Seasons: number;
  CurrentSeason: string;
  CurrentDate: Date;
  allCompetitions: AllCompetitions;
  saveID: SaveID;
  calendar: Calendar;
  scheduleManager: TournamentManager | LoadableTournamentValues;
}

