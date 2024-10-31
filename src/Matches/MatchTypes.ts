import { Club } from "../Clubs/ClubTypes";
import { Player } from "../Players/PlayerTypes";
import { StatisticsObject } from "../Common/CommonTypes";

export interface SquadStatus {
  onField: Array<Player>;
  onBench: Array<Player>;
  subbedOut: Array<Player>;
  injured: Array<Player>;
  suspended: Array<Player>;
}

export type GoalMatrix = Array<[[number, number], number]>;
export type MatchScore = Record<string, number>;

export interface Match {
  MatchDate: Date;
  MatchScore: MatchScore;
  Competition: string;
  Home: Club;
  Away: Club;
  HomeSquad: SquadStatus;
  AwaySquad: SquadStatus;
  HomeOverallStatistics: StatisticsObject;
  AwayOverallStatistics: StatisticsObject;
  Simulated: boolean;
}
