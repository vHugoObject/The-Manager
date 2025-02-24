import {
  SettableTournamentValues,
  TournamentValues,
  StandingsValues,
} from "tournament-organizer/interfaces";
import { Tournament } from "tournament-organizer/components";
import {
  mergeAll,
  map,
  zipAll,
  zipWith,
  head,
  toPairs,
  flatMap,
  groupBy,
  tail,
  mapValues,
  partial,
  toArray,
} from "lodash/fp";
import { flowAsync, flowAsyncDeep } from "futil-js";
import { MatchLog } from "../Matches/MatchTypes";
import { Save } from "../StorageUtilities/SaveTypes";
import {
  StatisticsObject,
  StatisticsType,
  MatchEntry,
} from "../Common/CommonTypes";
import {
  enterResults,
  loadCompetitionState,
  serializeCompetitionState,
} from "../Common/scheduleManagementUtilities";
import {
  addEntitiesWithStatisticsToSave,
  updateSaveEntitiesStatistics,
  getCompetitionState,
  updateSaveCompetitionStates,
} from "../StorageUtilities/SaveHandlers";

// save needs to be last arg
export const addMatchLogsAndStatisticsToSave = async (
  matchResultTuples: Array<
    [
      Record<string, MatchLog>,
      [string, string, Record<string, StatisticsObject>],
    ]
  >,
  save: Save,
): Promise<Save> => {
  const mapper = map(
    async (
      matchResultTuple: [
        Record<string, MatchLog>,
        [string, string, Record<string, StatisticsObject>],
      ],
    ): Promise<[Record<string, MatchLog>, Record<string, StatisticsType>]> => {
      const [matchLog, [matchID, , clubStats]] = matchResultTuple;
      return [matchLog, { [matchID]: clubStats }];
    },
  );

  return await flowAsync(
    mapper,
    zipAll,
    map(mergeAll),
    partial(addEntitiesWithStatisticsToSave, [save]),
  )(matchResultTuples);
};

const zipApply = zipWith((a: Function, b: any) => a(b));

export const updateEntitiesStatisticsAfterMatches = async (
  matchResultTuples: Array<
    [
      Record<string, MatchLog>,
      [string, string, Record<string, StatisticsObject>],
    ]
  >,
  save: Save,
): Promise<Save> => {
  const mapper = map(
    async (
      matchResultTuple: [
        Record<string, MatchLog>,
        [string, string, Record<string, StatisticsObject>],
      ],
    ): Promise<[string, Record<string, StatisticsObject>]> => {
      const [, [, season, clubStats]] = matchResultTuple;
      return [season, clubStats];
    },
  );

  return await flowAsync(
    mapper,
    zipAll,
    zipApply([head, mergeAll]),
    partial(updateSaveEntitiesStatistics, [save]),
  )(matchResultTuples);
};

export const createMatchResultArgs = async (
  matchResultTuples: Array<
    [
      Record<string, MatchLog>,
      [string, string, Record<string, StatisticsObject>],
    ]
  >,
): Promise<[string, [string, number, number, number]]> => {
  const [matchLog, [, , clubStats]] = matchResultTuples;
  const [
    [matchID, { CompetitionID }],
    [, { Wins: clubOneWins, Draws: matchDraws }],
    [, { Wins: clubTwoWins }],
  ] = flatMap(toPairs, [matchLog, clubStats]);
  return [CompetitionID, [matchID, clubOneWins, clubTwoWins, matchDraws]];
};

export const updateScheduleManagerAfterMatches = async (
  matchResultTuples: Array<
    [
      Record<string, MatchLog>,
      [string, string, Record<string, StatisticsObject>],
    ]
  >,
  save: Save,
): Promise<Save> => {
  const updater = async ([competitionID, matchResults]: [
    string,
    Array<[string, number, number, number]>,
  ]): Promise<[string, [TournamentValues, StandingsValues[]]]> => {
    return await flowAsync(
      partial(getCompetitionState, [save]),
      head,
      partial(loadCompetitionState, [save.scheduleManager]),
      partial(enterResults, [matchResults]),
      serializeCompetitionState,
    )(competitionID);
  };
  return await flowAsync(
    flowAsync(map(createMatchResultArgs)),
    groupBy(head),
    mapValues(flatMap(tail)),
    toPairs,
    flowAsync(map(updater)),
    Object.fromEntries,
    partial(updateSaveCompetitionStates, [save]),
  )(matchResultTuples);
};
