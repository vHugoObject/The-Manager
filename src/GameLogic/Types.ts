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
  MatchLeagueNumber: number;
  MatchSeason: number;
  MatchWeek: number;
  MatchResult: MatchResult;
  ClubMatchLogs: ClubMatchLogs;
}

export interface DomesticLeague {
  LeagueNumber: number;
  LeagueCountry: number;
  LeagueLevel: number;
  LeagueClubs: ReadonlyNonEmptyArray<number>;
}

export interface Club {
  ClubNumber: number;
  ClubCountry: number;
  ClubDomesticLeagueLevel: number;
  ClubDomesticLeagueNumber: number;
  ClubScheduleNumber: number;
  ClubAttendance: number;
  ClubFaciltiesCosts: number;
  ClubSponsorPayment: number;
  ClubTicketPrice: number;
  ManagerPay: number;
  ClubScoutingCosts: number;
  ClubHealthCosts: number;
  ClubPlayerDevelopmentCosts: number;
  ClubPlayers: ReadonlyNonEmptyArray<number>;
}

export interface Player {
  PlayerNumber: number;
  PlayerFirstName: number;
  PlayerLastName: number;
  PlayerCountry: number;
  PlayerAge: number;
  PlayerWage: number;
  PlayerLeagueCountry: number;
  PlayerDomesticLeagueLevel: number;
  PlayerDomesticLeagueNumber: number;
  PlayerClubNumber: number;
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
  DomesticLeagues: Array<DomesticLeague>;
  Clubs: Array<Club>;
  Players: Array<Player>;
}



export interface SaveSchema extends DBSchema {
  SaveOptions: {
    key: string;
    value: SaveOptions;
  };
  DomesticLeagues: {
    key: string;
    value: DomesticLeague;
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
