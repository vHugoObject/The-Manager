import { promiseProps } from "futil-js";
import { Save, SaveArguments } from "./SaveTypes";
import { createEntities, getThirdSundayOfAugust } from "../Common/index";
import { generatePlayerSkillsAndPhysicalDataForListOfClubs } from "../Players/PlayerUtilities";

export const createSave = async ({
  Name,
  MainCompetition,
  CurrentSeason,
  Club,
  BaseEntities,
}: SaveArguments): Promise<Save> => {
  return await promiseProps({
    Name,
    MainCompetition,
    Club,
    Seasons: 1,
    CurrentSeason,
    CurrentDate: getThirdSundayOfAugust(CurrentSeason),
    Entities: await createEntities(BaseEntities),
    EntitiesStatistics: {},
    PlayerSkillsAndPhysicalData:
      await generatePlayerSkillsAndPhysicalDataForListOfClubs(0, BaseEntities),
    SaveID: crypto.randomUUID()
  });
};
