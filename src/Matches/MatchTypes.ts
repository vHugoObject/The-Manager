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
  ID: string;
  Name: string;
  MatchDate: Date;
  MatchScore: MatchScore;
  CompetitionID: string;
  Home: Club;
  Away: Club;
  HomeSquad: SquadStatus;
  AwaySquad: SquadStatus;
  HomeOverallStatistics: StatisticsObject;
  AwayOverallStatistics: StatisticsObject;
}
