import { Match, SquadStatus, GoalMatrix, MatchScore } from "./MatchTypes";
import { StatisticsObject } from "../Common/CommonTypes";
import { Player } from "../Players/PlayerTypes"
import { Save } from "../StorageUtilities/SaveTypes"
import {

} from "./MatchSimulationUtilities";
import { map } from "lodash/fp";


export const getClubPlayerObjects = async (save: Save, playerIDs: Array<string>): Promise<Record<string, Player>> => {
  const getPlayer = (playerID: string): [string, Player] => {
    return [playerID,save.allPlayers[playerID]]
  }
  return Object.fromEntries(map(getPlayer, playerIDs))
}

//getMatchPlayerObjects

export const createMatch = async (
  ID: string,
  MatchDate: Date,
  Home: Club,
  Away: Club,
  Competition: string,
  Country: string,
): Promise<Match> => {
  const homeStatus: SquadStatus = {
    onField: Home.Starting11,
    onBench: Home.Bench,
    subbedOut: {},
    injured: {},
    suspended: {},
  };

  const awayStatus: SquadStatus = {
    onField: Away.Starting11,
    onBench: Away.Bench,
    subbedOut: {},
    injured: {},
    suspended: {},
  };

   const notImplemented = {
    ID,
    MatchDate,
    MatchScore: { [Home.Name]: 0, [Away.Name]: 0 },
    Competition,
    Country,
    Home,
    Away,
    HomeSquad: homeStatus,
    AwaySquad: awayStatus,
    Simulated: false,
  };
};

