import { promiseProps } from "futil-js";
import { Save, SaveArguments } from "./SaveTypes";
import { createEntities, getThirdSundayOfAugust } from "../Common/index";
import { generatePlayerSkillsAndPhysicalDataForListOfClubs } from "../Players/PlayerUtilities";

export const createSave = async ({
  Name,
  UserMainCompetitionID,
  CurrentSeason,
  UserClubID,
  BaseEntities,
}: SaveArguments): Promise<Save> => {
  return await promiseProps({
    Name,
    UserMainCompetitionID,
    UserClubID,
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
