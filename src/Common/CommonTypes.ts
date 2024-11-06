import { Match as TournamentMatch } from 'tournament-organizer/components';
export type ComponentKeysObject = Record<string, Array<string>>;
export type StatisticsObject = Record<string, number | string>;

export type StatisticsEntry = Record<string, StatisticsObject>;

export interface StatisticsType {
  BySeason: Record<string, StatisticsObject>;
  GameLog: Record<string, StatisticsObject>;
}

export interface CalendarEntry {
   matches: Array<TournamentMatch>;
   seasonStartDate: boolean;
   seasonEndDate: boolean;
   transferWindowOpen: boolean;
}
export type Calendar = Record<string, CalendarEntry>;
