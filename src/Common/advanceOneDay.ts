import { Manager as TournamentManager } from "tournament-organizer/components";
import { addDays } from "date-fns/fp";
import { update, set } from "lodash/fp";
import { StatisticsObject, StatisticsType } from "../Common/CommonTypes";
import {
  Player,
  PositionGroup,
  Midfielder,
  Defender,
  SkillSet,
  Foot,
  ContractType,
} from "../Players/PlayerTypes";
import { Club } from "../Clubs/ClubTypes";
import { playerSkills } from "../Players/PlayerSkills";
import {
  Competition,
  BaseCompetitions,
} from "../Competitions/CompetitionTypes";
import { createSave } from "../StorageUtilities/SaveCreator";
import {
  addSaveToDB,
  getSaveValue,
  updateSaveValue,
} from "../StorageUtilities/SaveUtilities";
import { createSeasonCalendar } from "../Common/scheduler";
import { Calendar, CalendarEntry } from "../Common/CommonTypes";
import { Save, SaveID } from "../StorageUtilities/SaveTypes";

export const advanceOneDay = async (saveID: SaveID): Promise<void> => {
  const addOneDay = addDays(1);
  const getCurrentDayEvents = (save: Save): CalendarEntry => {
    const currentDate: string = save.CurrentDate.toDateString();
    return save.calendar[currentDate];
  };

  const setupMatches = async () => {};

  const save: Save = await getSaveValue(saveID);

  const currentDayEvents: CalendarEntry = getCurrentDayEvents(save);

  console.assert(currentDayEvents !== undefined);

  let updatedSave: Save = update("CurrentDate", addOneDay, save);

  await updateSaveValue(updatedSave);
};
