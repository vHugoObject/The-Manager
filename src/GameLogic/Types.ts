import { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";
import { DBSchema } from "idb";

export type SaveID = string | IDBValidKey;
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
export type ClubMatchLogs = Record<string, PlayerMatchLogs>;

export interface ClubMatchResult {
  Home: number;
  Wins: number;
  Losses: number;
  Draws: number;
  "Goals For": number;
  "Goals Against": number;
  Points: number;
}

export interface LeagueTableRow extends ClubMatchResult {
  "Club Name": string;
  "Matches Played": number;
  "Goal Difference": number;
}


export type MatchResult = [
  [number, ClubMatchResult],
  [number, ClubMatchResult],
];

export interface MatchLog {
  MatchID: string;
  LeagueNumber: number;
  Season: number;
  MatchWeek: number;
  MatchResult: MatchResult;
  ClubMatchLogs: ClubMatchLogs;
}

export interface League {
  LeagueNumber: number;
  Country: number;
  Level: number;
  Clubs: ReadonlyNonEmptyArray<number>;
}

export interface Club {
  ClubNumber: number;
  Country: number;
  DomesticLeagueLevel: number;
  DomesticLeagueNumber: number;
  ScheduleNumber: number;
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
  DomesticLeagueNumber: number;
  ClubNumber: number;
  PositionGroup: number;
}

export interface SaveOptions {
  CountryIndex: number;
  DomesticLeagueIndex: number;
  ClubIndex: number;
  Countries: BaseCountries;
  StartSeason: number;
  CurrentSeason: number;
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
  Leagues: {
    key: string;
    value: League;
  };
  Clubs: {
    key: string;
    value: Club;
  };
  Players: {
    key: string;
    value: Player;
  };
  MatchLogs: {
    key: string;
    value: MatchLog;
  };
}
