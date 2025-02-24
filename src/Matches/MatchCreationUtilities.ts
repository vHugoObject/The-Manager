import { flowAsync } from "futil-js";
import { map, mergeAll, pick, mapValues, zipObject } from "lodash/fp";
import { StatisticsObject, MatchEntry } from "../Common/CommonTypes";
import { getEntities, getEntitiesNames } from "../Common/entityUtilities";
import { getCurrentDateAsObject } from "../Common/Calendar";
import { Club } from "../Clubs/ClubTypes";
import { Player } from "../Players/PlayerTypes";
import { Save } from "../StorageUtilities/SaveTypes";
import { generateMatchStatistics } from "./MatchSimulationUtilities";

export const getClubsPlayerObjects = async (
  save: Save,
  players: Array<Array<string>>,
): Promise<Array<Array<Player>>> => {
  return await Promise.all(
    players.map(async (setOfPlayers: Array<string>) => {
      return await getEntities<Player>(save, setOfPlayers);
    }),
  );
};

export const getClubsStarting11s = async (
  save: Save,
  clubs: Array<Club>,
): Promise<Array<Array<Player>>> => {
  const starting11s: Array<Array<string>> = map(
    (club: Club) => Object.keys(club.Starting11),
    clubs,
  );
  return await getClubsPlayerObjects(save, starting11s);
};

export const generateMatchResults = async (
  save: Save,
  clubIDs: Array<string>,
): Promise<Record<string, StatisticsObject>> => {
  const clubObjects: Array<Club> = await getEntities<Club>(save, clubIDs);
  return await flowAsync(
    getClubsStarting11s,
    generateMatchStatistics,
    zipObject(clubIDs),
  )(save, clubObjects);
};

export const getClubIDsFromMatchEntry = async (
  matchEntry: MatchEntry,
): Promise<[string, string]> => {
  return [
    matchEntry.match.player1.id as string,
    matchEntry.match.player2.id as string,
  ];
};

export const matchNameObjectCreator = async ([home, away]: [
  string,
  string,
]): Promise<Record<string, string>> => {
  return { Name: `${home} vs ${away}` };
};

export const createMatchNameFromIDs = flowAsync(
  getEntitiesNames,
  matchNameObjectCreator,
);

export const matchEntryConverter = async (
  matchEntry: MatchEntry,
): Promise<Record<string, string>> => {
  return {
    ID: matchEntry.match.id,
    Home: matchEntry.match.player1.id as string,
    Away: matchEntry.match.player2.id as string,
    CompetitionID: matchEntry.tournamentID,
    Season: matchEntry.season,
  };
};

export const getScoreFromMatchResult = (
  matchStatistics: Record<string, StatisticsObject>,
): Record<string, Record<string, number>> => {
  const [homeID, awayID]: Array<string> = Object.keys(matchStatistics);
  return {
    Score: {
      [homeID]: matchStatistics[homeID]["Goals"] as number,
      [awayID]: matchStatistics[awayID]["Goals"] as number,
    },
  };
};

export const createMatchNameFromMatchEntry = async (
  save: Save,
  matchEntry: MatchEntry,
): Promise<Record<string, string>> => {
  const clubIDs: [string, string] = await getClubIDsFromMatchEntry(matchEntry);
  return await createMatchNameFromIDs(save, clubIDs);
};

export const generatePartialMatchLogFromMatchEntry = async (
  save: Save,
  matchEntry: MatchEntry,
): Promise<Record<string, string>> => {
  const partialMatchParts: Array<Record<string, string>> = await Promise.all([
    await matchEntryConverter(matchEntry),
    await getCurrentDateAsObject(save),
  ]);
  return mergeAll(partialMatchParts);
};

export const generateMatchResultFromMatchEntry = async (
  save: Save,
  matchEntry: MatchEntry,
): Promise<[Record<string, string>, Record<string, StatisticsObject>]> => {
  const clubIDs: [string, string] = await getClubIDsFromMatchEntry(matchEntry);
  return (await Promise.all(
    [createMatchNameFromIDs, generateMatchResults].map(
      async (func: Function) => await func(save, clubIDs),
    ),
  )) as [Record<string, string>, Record<string, StatisticsObject>];
};
