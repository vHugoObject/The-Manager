import { mergeAll } from "lodash/fp";
import { StatisticsObject, MatchEntry } from "../Common/CommonTypes";
import { Save } from "../StorageUtilities/SaveTypes";
import { MatchLog } from "./MatchTypes";
import {
  generateMatchResultFromMatchEntry,
  generatePartialMatchLogFromMatchEntry,
  getScoreFromMatchResult,
} from "./MatchCreationUtilities";

export const simulateMatch = async (
  save: Save,
  [matchKey, matchEntry]: [string, MatchEntry],
): Promise<
  [
    Record<string, MatchLog>,
    Record<string, Record<string,StatisticsObject>>,
  ]
> => {
  const [partialMatchLog, [matchName, matchStatistics]] = await Promise.all(
    [
      generatePartialMatchLogFromMatchEntry,
      generateMatchResultFromMatchEntry,
    ].map(async (func: Function) => {
      return await func(save, matchEntry);
    }),
  );
  return [
    {
      [matchKey]: mergeAll([
        partialMatchLog,
        matchName,
        getScoreFromMatchResult(matchStatistics),
      ]),
    },
    { [matchKey]: matchStatistics },
  ];
};

export const simulateMatches = async (
  save: Save,
  matches: Record<string, MatchEntry>,
): Promise<
  Array<
    [
      Record<string, MatchLog>,
    Record<string, Record<string,StatisticsObject>>,
    ]
  >
> => {
  return await Promise.all(
    Object.entries(matches).map(async (testMatch) => {
      return await simulateMatch(save, testMatch);
    }),
  );
};
