import { property, filter, startsWith, pickBy, curry, take, zipWith, map, flatten } from "lodash/fp";
import { flowAsync } from "futil-js";
import { Entity } from "../Common/CommonTypes";
import { ClubArrayIndices } from "./ClubTypes";
import { Save } from "../StorageUtilities/SaveTypes"
import { getEntityFromSaveEntities, getGroupOfPlayerSkillsFromSave } from "../StorageUtilities/SaveUtilities"
import { groupPlayersByPosition, sortPlayersByRatings  } from "../Players/PlayerUtilities"

export const isClubID = startsWith("Club")
export const filterClubsByID = filter(isClubID)
export const pickClubs = pickBy((_:Entity, entityID: string) => isClubID(entityID))
export const getClubName = property([ClubArrayIndices.Name])
export const getClubSquad = property([ClubArrayIndices.Squad])

export const createClub = async (
  name: string,
  squad: Array<string>
): Promise<Entity> => {
  return [name, squad]
};


export const getClubSquadFromSave = flowAsync(getEntityFromSaveEntities, getClubSquad)

export const getClubPlayerSkillsFromSave = ([save, clubID]: [Save, string]): Record<string, Array<number>> => {
  return flowAsync(getClubSquadFromSave, (players: Array<string>) => [save, players], getGroupOfPlayerSkillsFromSave)([save, clubID])
}


export const getClubBestStarting11FromSave = curry((composition: Array<number>, [save, clubID]: [Save, string]): Record<string, Array<number>> => {
  return flowAsync(getClubPlayerSkillsFromSave,
    groupPlayersByPosition,
    map(sortPlayersByRatings),
    zipWith((positionCount: number, positionPlayers: Array<Record<string, Array<number>>>): Array<Record<string, Array<number>>> => {
      return flowAsync(Object.entries, take(positionCount))(positionPlayers)
    },     
      composition),
    flatten,
    Object.fromEntries,
  )([save, clubID]) 
})
