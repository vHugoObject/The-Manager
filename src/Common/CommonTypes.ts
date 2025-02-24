import { MatchValues } from "tournament-organizer/interfaces";
import { Club } from "../Clubs/ClubTypes";
import { Player } from "../Players/PlayerTypes";
import { Competition } from "../Competitions/CompetitionTypes";
import { Country } from "../Countries/CountryTypes";
import { MatchLog } from "../Matches/MatchTypes";

export type BaseEntity = [string, string];

export interface BaseEntities {
  countries: Array<BaseEntity>;
  competitions: Array<Array<BaseEntity>>;
  clubs: Array<Array<Array<BaseEntity>>>;
  players?: Array<Array<Array<Array<BaseEntity>>>>;
}

export interface SaveArguments {
  Name: string;
  Country: string;
  MainCompetition: string;
  CurrentSeason: string;
  Club: string;
  BaseEntities: BaseEntities;
}

// tournamentID should be change to competitionID
export interface MatchEntry {
  match: MatchValues;
  competitionID: string;
  season: string;
}

export interface CalendarEntry {
  matches: Record<string, MatchEntry>;
  seasonEndDate: boolean;
  transferWindowOpen: boolean;
}
export type Calendar = Record<string, CalendarEntry>;

export type Entity = Club | Player | Competition | Country | MatchLog;

export type GameObject = Club | Player | Competition | Country | Calendar;
