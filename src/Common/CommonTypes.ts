import { Club } from "../Clubs/ClubTypes";
import { Player } from "../Players/PlayerTypes";
import { Competition } from "../Competitions/CompetitionTypes";
import { Country } from "../Countries/CountryTypes";
import { MatchLog } from "../Matches/MatchTypes";

export type BaseEntity = [string, string];

export interface BaseEntities {
  countries: Array<BaseEntity>;
  domesticLeagues: Array<Array<BaseEntity>>;
  clubs: Array<Array<Array<BaseEntity>>>;
  players?: Array<Array<Array<Array<BaseEntity>>>>;
}

export type Entity = Club | Player | Competition | Country | MatchLog;
