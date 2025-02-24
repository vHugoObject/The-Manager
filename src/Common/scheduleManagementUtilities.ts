import { partial, map, last, fromPairs, property } from "lodash/fp";
import { promiseProps, flowAsync } from "futil-js";
import {
  Manager as TournamentManager,
  Player as TournamentPlayer,
  Match as TournamentMatch,
  Tournament,
} from "tournament-organizer/components";
import {
  SettableTournamentValues,
  TournamentValues,
  StandingsValues,
} from "tournament-organizer/interfaces";
import { Competition } from "../Competitions/CompetitionTypes";

export const createTournamentClubs = async (
  clubs: Record<string, string>,
): Promise<Array<TournamentPlayer>> => {
  return await Promise.all(
    Object.entries(clubs).map(async ([clubID, clubName]) => {
      return new TournamentPlayer(clubID, clubName);
    }),
  );
};

export const createTournament = async (
  scheduler: TournamentManager,
  competition: Competition,
): Promise<Tournament> => {
  const scoring: Record<string, number> = {
    win: 3,
    draw: 1,
    loss: 0,
    bye: 2,
  };

  const tournamentValues: SettableTournamentValues = await promiseProps({
    players: await createTournamentClubs(competition.Clubs),
    stageOne: { format: "double-round-robin" },
    sorting: "descending",
    scoring,
  });

  const tournament: Tournament = scheduler.createTournament(
    competition.Name,
    tournamentValues,
    competition.ID,
  );

  tournament.start();
  return tournament;
};

export const serializeCompetitionState = async (
  competitionStateValues: Tournament,
): Promise<[string, [TournamentValues, StandingsValues[]]]> => {
  return [
    property(["id"], competitionStateValues),
    [
      structuredClone(competitionStateValues),
      structuredClone(competitionStateValues.standings()),
    ],
  ];
};

export const serializeCompetitionStates = async (
  competitionStateValues: Array<Tournament>,
): Promise<Record<string, [TournamentValues, StandingsValues[]]>> => {
  return await flowAsync(
    map(serializeCompetitionState),
    fromPairs,
  )(competitionStateValues);
};

export const loadCompetitionState = async (
  scheduler: TournamentManager,
  competitionState: TournamentValues,
): Promise<Tournament> => {
  return scheduler.reloadTournament(competitionState);
};

export const enterResult = async (
  competitionState: Tournament,
  matchResult: [string, number, number, number],
): Promise<Tournament> => {
  competitionState.enterResult(...matchResult);

  return competitionState;
};

export const enterResults = async (
  matchResults: Array<[string, number, number, number]>,
  competitionState: Tournament,
): Promise<Tournament> => {
  return await flowAsync(
    map(partial(enterResult, [competitionState])),
    last,
  )(matchResults);
};
