import "lodash.product";
import _ from "lodash";
import { StatisticsObject } from "../Common/CommonTypes";
import { MatchResult } from "./MatchTypes";

export const U: number = -1.035;
export const HOMEEFFECT: number = 0.383;
export const POSSIBLEGOALS: Array<number> = [0, 1, 2, 3, 4, 5];
export const THETA: number = 0.562;
export const SHAPE: number = 1.864;

export const EMPTYSCOREMATRIX: Array<number[]> = _.product(
  POSSIBLEGOALS,
  POSSIBLEGOALS,
);

type MatchResults = Record<MatchResult, Array<StatisticsObject>>;

export const MATCHRESULTS: MatchResults = {
  [MatchResult.homeWin]: [
    { Wins: 1, Draws: 0, Losses: 0 },
    { Wins: 0, Draws: 0, Losses: 1 },
  ],
  [MatchResult.draw]: [
    { Wins: 0, Draws: 1, Losses: 0 },
    { Wins: 0, Draws: 1, Losses: 0 },
  ],
  [MatchResult.awayWin]: [
    { Wins: 0, Draws: 0, Losses: 1 },
    { Wins: 1, Draws: 0, Losses: 0 },
  ],
  [MatchResult.bye]: [{ "Matches Played": 0 }],
};
