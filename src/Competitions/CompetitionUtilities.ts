import {
  TournamentValues,
  StandingsValues,
} from "tournament-organizer/interfaces";
import { set, mapValues, partial, zipAll } from "lodash/fp";
import { flowAsync, updatePaths } from "futil-js";
import { Competition } from "./CompetitionTypes";

export const createCompetition = async (
  [ID, Name]: [string, string],
  clubs: Array<[string, string]>,
): Promise<Competition> => {
  const [clubIDs] = zipAll(clubs) as [Array<string>, Array<string>];
  return {
    ID,
    Name,
    Clubs: clubIDs,
  };
};

export const updateCompetitionState = async (
  serializedCompetitionState: [TournamentValues, StandingsValues[]],
  competition: Competition,
): Promise<Competition> => {
  return set(["CurrentState"], serializedCompetitionState, competition);
};

export const updateCompetitionStates = async (
  serializedCompetitionStates: Record<
    string,
    [TournamentValues, StandingsValues[]]
  >,
  competitions: Record<string, Competition>,
): Promise<Record<string, Competition>> => {
  const transformers = mapValues(
    (competitionStateValues: [TournamentValues, StandingsValues[]]) =>
      partial(updateCompetitionState, [competitionStateValues]),
  )(serializedCompetitionStates);
  return await flowAsync(updatePaths(transformers))(competitions);
};
