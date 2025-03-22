import { zipAll, initial, concat, property } from "lodash/fp";
import { flowAsync } from "futil-js";
import { Entity } from "../Common/CommonTypes";
import { ClubArrayIndices } from "./ClubTypes";

export const getClubID = property([ClubArrayIndices.ID])
export const getClubName = property([ClubArrayIndices.Name])
export const getClubSquad = property([ClubArrayIndices.Squad])

export const createClub = async (
  [ID, Name]: [string, string],
  squad: Array<[string, string]>,
): Promise<Entity> => {
  return flowAsync(
    zipAll,
    initial,
    concat([ID, Name])
  )(squad)
};
