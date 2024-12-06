import { MatchValues } from "tournament-organizer/interfaces";
import { Club } from "../Clubs/ClubTypes";
import { Player } from "../Players/PlayerTypes";
import { Competition } from "../Competitions/CompetitionTypes";
import { Country } from "../Countries/CountryTypes";

export type ComponentKeysObject = Record<string, Array<string>>;
export type StatisticsObject = Record<string, number | string>;
export type StatisticsEntry = Record<string, StatisticsObject>;

export type StatisticsType = Record<string, StatisticsObject>;

export interface MatchEntry {
  match: MatchValues;
  tournamentID: string;
}

export interface CalendarEntry {
  matches: Record<string, MatchEntry>;
  seasonStartDate: boolean;
  seasonEndDate: boolean;
  transferWindowOpen: boolean;
}
export type Calendar = Record<string, CalendarEntry>;

export type Entity = Club | Player | Competition | Country;

export type GameObject = Club | Player | Competition | Country | Calendar;
