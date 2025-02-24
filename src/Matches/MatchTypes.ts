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

export interface MatchLog {
  ID: string;
  Name: string;
  Date: Date;
  Score: MatchScore;
  CompetitionID: string;
  Home: String;
  Away: String;
}

export enum MatchResult {
  homeWin = "homeWin",
  draw = "draw",
  awayWin = "awayWin",
  bye = "bye",
}
