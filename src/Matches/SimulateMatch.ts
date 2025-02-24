import { mergeAll, filter, map, partial, negate } from "lodash/fp";
import { flowAsync } from "futil-js";
import { StatisticsObject, MatchEntry } from "../Common/CommonTypes";
import { Save } from "../StorageUtilities/SaveTypes";
import { MatchLog } from "./MatchTypes";
import { MATCHRESULTS } from "./MatchConstants";
import {
  generateMatchResultFromMatchEntry,
  generatePartialMatchLogFromMatchEntry,
  getScoreFromMatchResult,
  matchEntryConverter,
} from "./MatchCreationUtilities";

const matchFilter = ([matchKey, matchEntry]: [string, MatchEntry]): boolean => {
  return matchEntry.match?.bye == false;
};

export const simulateMatch = async (
  save: Save,
  [matchKey, matchEntry]: [string, MatchEntry],
): Promise<
  [Record<string, MatchLog>, [string, string, Record<string, StatisticsObject>]]
> => {
  // replace with flowasync over
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
    [matchKey, matchEntry.season, matchStatistics],
  ];
};

export const simulateMatches = async (
  save: Save,
  matches: Record<string, MatchEntry>,
): Promise<
  Array<
    [
      Record<string, MatchLog>,
      [string, string, Record<string, StatisticsObject>],
    ]
  >
> => {
  return await flowAsync(
    Object.entries,
    filter(matchFilter),
    map(partial(simulateMatch, [save])),
  )(matches);
};

export const simulateBye = async (
  save: Save,
  [matchKey, matchEntry]: [string, MatchEntry],
): Promise<
  [Record<string, MatchLog>, [string, string, Record<string, StatisticsObject>]]
> => {
  const partialMatchLog: Record<string, string> =
    await matchEntryConverter(matchEntry);

  return [
    {
      [matchKey]: mergeAll([
        partialMatchLog,
        { Name: "Bye" },
        { Score: { [matchEntry.match.player1.id]: 0 } },
      ]),
    },
    [
      matchKey,
      matchEntry.season,
      { [matchEntry.match.player1.id]: MATCHRESULTS.bye },
    ],
  ];
};

export const simulateByes = async (
  save: Save,
  matches: Record<string, MatchEntry>,
): Promise<
  Array<
    [
      Record<string, MatchLog>,
      [string, string, Record<string, StatisticsObject>],
    ]
  >
> => {
  return await flowAsync(
    Object.entries,
    filter(negate(matchFilter)),
    map(partial(simulateBye, [save])),
  )(matches);
};
