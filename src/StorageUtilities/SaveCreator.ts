import {
  TournamentValues,
  StandingsValues,
} from "tournament-organizer/interfaces";
import { Manager as TournamentManager } from "tournament-organizer/components";
import { partial, flattenDeep } from "lodash/fp";
import { flowAsync, promiseProps } from "futil-js";
import { Save } from "./SaveTypes";
import { Entity, Calendar, SaveArguments } from "../Common/CommonTypes";
import { createEntities } from "../Common/CreateEntities";
import { createSeasonCalendar } from "../Common/scheduler";
import { serializeCompetitionStates } from "../Common/scheduleManagementUtilities";
import { updateCompetitionStates } from "../Competitions/CompetitionUtilities";

export const createSave = async ({
  Name,
  Country,
  MainCompetition,
  CurrentSeason,
  Club,
  BaseEntities,
}: SaveArguments): Promise<Save> => {
  return await promiseProps({
    Name,
    Country,
    MainCompetition,
    Club,
    Seasons: 1,
    CurrentSeason,
    CurrentDate,
    // should we wait to create an object for entities until here?
    Entities: await flowAsync(createEntities),
    EntitiesStatistics: {},
    // might be  a way we can just get the key the first time we store in idb
    SaveID: crypto.randomUUID(),
    Calendar,
    ScheduleManager,
    CompetitionStates,
  });
};
