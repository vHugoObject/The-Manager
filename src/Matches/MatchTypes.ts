import { Club } from "../Clubs/ClubTypes";
import { Player } from "../Players/PlayerTypes";
import { StatisticsObject } from "../Common/CommonTypes";

export interface SquadStatus {
  onField: Record<string, Player>;
  onBench: Record<string, Player>;
  subbedOut: Record<string, Player>;
  injured: Record<string, Player>;
  suspended: Record<string, Player>;
}

export type GoalMatrix = Array<[[number, number], number]>;
export type MatchScore = Record<string, number>;

export interface Match {
  MatchID: string;
  MatchDate: Date;
  MatchScore: MatchScore;
  Country: string;
  Competition: string;
  Home: Club;
  Away: Club;
  HomeSquad: SquadStatus;
  AwaySquad: SquadStatus;
  HomeOverallStatistics: StatisticsObject;
  AwayOverallStatistics: StatisticsObject;
  Simulated: boolean;
}


