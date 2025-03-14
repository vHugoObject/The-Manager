import { promiseProps, updateAllPaths, flowAsync } from "futil-js";
import { Save, SaveArguments } from "./SaveTypes";
import { createEntities, getThirdSundayOfAugust } from "../Common/index";


export const createSave = async ({
  Name,
  MainCompetition,
  CurrentSeason,
  Club,
  BaseEntities,
}: SaveArguments): Promise<Save> => {
  const transformers = await createEntities(BaseEntities)
  const Entities = await flowAsync(updateAllPaths)(transformers, {})
  return {
    Name,
    MainCompetition,
    Club,
    Seasons: 1,
    CurrentSeason,
    CurrentDate: getThirdSundayOfAugust(CurrentSeason),
    Entities,
    EntitiesStatistics: {},
    PlayerData: {},
    SaveID: "",
  };
};
