import { Manager as TournamentManager } from "tournament-organizer/components";
import { LoadableTournamentValues } from "tournament-organizer/interfaces";
import { Competition } from "../Competitions/CompetitionTypes";
import { BaseCountries, Country } from "../Countries/CountryTypes";
import { Match } from "../Matches/MatchTypes";
import { Club } from "../Clubs/ClubTypes";
import { Player } from "../Players/PlayerTypes";
import { Calendar } from "../Common/CommonTypes";

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
  countriesLeaguesClubs: BaseCountries;
  allCountries: Record<string, Country>;
  allCompetitions: Record<string, Competition>;
  allClubs: Record<string, Club>;
  allPlayers: Record<string, Player>;
  allMatches: Record<string, Match>;
  saveID: SaveID;
  calendar: Calendar;
  scheduleManager: TournamentManager | LoadableTournamentValues;
}
