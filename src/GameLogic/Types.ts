import { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";
import { DBSchema } from "idb";

export type BaseCountry = [string, Array<string>, Array<Array<string>>];
export type BaseCountries = Array<BaseCountry>;

export interface MatchArguments {
  HomeClubID: string;
  AwayClubID: string;
  HomePlayers: ReadonlyNonEmptyArray<string>;
  AwayPlayers: ReadonlyNonEmptyArray<string>;
  CountryIndex: number;
  DomesticLeagueIndex: number;
  Season: number;
}

export interface MatchResult {
  Home: boolean;
  Wins: number;
  Losses: number;
  Draws: number;
  GoalsFor: number;
  GoalsAgainst: number;
}

export type MatchResultsTuple = [MatchResult, MatchResult];

export interface PlayerMatchLog {
  Starts: number;
  Minutes: number;
  Wins: number;
  Losses: number;
  Draws: number;
  Goals: number;
  Assists: number;
  Tackles: number;
}

export type PlayerMatchLogs = Record<string, PlayerMatchLog>;

export type SaveID = string | IDBValidKey;

export interface ClubMatchLog {
  MatchResult: MatchResult;
  PlayerStatistics: PlayerMatchLogs;
}

export type ClubMatchLogs = Record<string, ClubMatchLog>;
export interface MatchLog extends ClubMatchLog {
  MatchID: string;
}

export interface Club {
  ClubNumber: number;
  Country: number;
  DomesticLeagueLevel: number;
  DomesticLeagueID: number;
  ScheduleID: number;
  Attendance: number;
  FaciltiesCosts: number;
  SponsorPayment: number;
  TicketPrice: number;
  ManagerPay: number;
  ScoutingCosts: number;
  HealthCosts: number;
  PlayerDevelopmentCosts: number;
  Players: ReadonlyNonEmptyArray<number>;
}

export interface Player {
  PlayerNumber: number;
  FirstName: number;
  LastName: number;
  PlayerCountry: number;
  Age: number;
  Wage: number;
  PlayerLeagueCountry: number;
  DomesticLeagueLevel: number;
  DomesticLeagueID: number;
  ClubID: number;
  PositionGroup: number;
}

export interface SaveOptions {
  SaveName: string;
  CountryIndex: number;
  DomesticLeagueIndex: number;
  ClubIndex: number;
  Season: number;
  Countries: BaseCountries;
}

export interface SaveArguments {
  SaveOptions: SaveOptions;
  Clubs: Array<Club>;
  Players: Array<Player>;
}

export interface SaveSchema extends DBSchema {
  SaveOptions: {
    key: string;
    value: SaveOptions;
  };
  Clubs: {
    key: string;
    value: Club;
  };
  Players: {
    key: string;
    value: Player;
  };
  Matches: {
    key: string;
    value: MatchLog;
  };
}
