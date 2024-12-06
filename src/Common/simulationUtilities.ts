import { eachDayOfInterval, addWeeks } from "date-fns";
import type { EachDayOfIntervalResult, Interval } from "date-fns";
import { reduce, merge, mergeAll, map } from "lodash/fp";
import { flowAsync } from "futil-js";
import { Save } from "../StorageUtilities/SaveTypes";
import { CalendarEntry, Calendar, Entity, GameObject } from "./CommonTypes";

export const createCalendar = (start: Date): Calendar => {
  const end: Date = new Date("06/14/25");
  const seasonStartDate: Date = addWeeks(start, 1);
  const summerTransferWindowClose: Date = new Date("08/30/24");
  const winterTransferWindowOpen: Date = new Date("01/01/25");
  const winterTransferWindowClose: Date = new Date("02/03/25");

  const allDatesInterval: Interval = {
    start,
    end,
  };

  const summerTransferWindowInterval: Interval = {
    start,
    end: summerTransferWindowClose,
  };

  const winterTransferWindowInterval: Interval = {
    start: winterTransferWindowOpen,
    end: winterTransferWindowClose,
  };

  const seasonStartDateValues: CalendarEntry = {
    matches: {},
    seasonStartDate: true,
    seasonEndDate: false,
    transferWindowOpen: true,
  };

  const seasonEndDateValues: CalendarEntry = {
    matches: {},
    seasonStartDate: false,
    seasonEndDate: true,
    transferWindowOpen: false,
  };

  const transferWindowOpenValues: CalendarEntry = {
    matches: {},
    seasonStartDate: false,
    seasonEndDate: false,
    transferWindowOpen: true,
  };

  const transferWindowClosedValues: CalendarEntry = {
    matches: {},
    seasonStartDate: false,
    seasonEndDate: false,
    transferWindowOpen: false,
  };

  const addDayValues = (
    interval: EachDayOfIntervalResult<Interval, undefined>,
    dayValues: CalendarEntry,
  ) => {
    return Object.fromEntries(
      interval.map((date: Date) => [date.toDateString(), dayValues]),
    );
  };

  const mergeIntervals = (accumulator: Calendar, value: Calendar): Calendar => {
    return merge(accumulator, value);
  };

  const createCalendarSection = (
    interval: Interval,
    dayValues: CalendarEntry,
  ): Calendar => {
    const fullDateRange: EachDayOfIntervalResult<Interval, undefined> =
      eachDayOfInterval(interval);
    return addDayValues(fullDateRange, dayValues);
  };

  const emptyCalendar: Calendar = createCalendarSection(
    allDatesInterval,
    transferWindowClosedValues,
  );
  const summerTransferWindow: Calendar = createCalendarSection(
    summerTransferWindowInterval,
    transferWindowOpenValues,
  );
  const winterTransferWindow: Calendar = createCalendarSection(
    winterTransferWindowInterval,
    transferWindowOpenValues,
  );

  const seasonFirstDay: Calendar = {
    [seasonStartDate.toDateString()]: seasonStartDateValues,
  };
  const seasonEndDay: Calendar = { [end.toDateString()]: seasonEndDateValues };
  const calendarSections: Array<Calendar> = [
    summerTransferWindow,
    winterTransferWindow,
    seasonFirstDay,
    seasonEndDay,
  ];

  return reduce(mergeIntervals, emptyCalendar, calendarSections);
};

export const totalDoubleRoundRobinGames = (clubs: number): number => {
  return 2 * ((clubs / 2) * (clubs - 1));
};

export const entityObjectsCreator = async <T extends Entity>(
  entities: Array<T>,
): Promise<Record<string, T>> => {
  return Object.fromEntries(entities.map((entity: T) => [entity.ID, entity]));
};

export const entityReferencesCreator = async <T extends Entity>(
  entities: Array<T>,
): Promise<Record<string, string>> => {
  return Object.fromEntries(
    entities.map((entity: T) => [entity.ID, entity.Name]),
  );
};

export const entityObjectsMerger = <T extends GameObject>(
  accumulator: Record<string, T>,
  value: Record<string, T>,
): Record<string, T> => {
  return merge(accumulator, value);
};
// can we mergeall
export const entityObjectsReducer = async <T extends GameObject>(
  entities: Array<Record<string, T>>,
): Promise<Record<string, T>> => {
  return reduce(entityObjectsMerger, {}, entities);
};

export const getEntity = async <T extends Entity>(
  save: Save,
  key: string,
): Promise<T> => {
  return save.Entities[key] as T;
};

export const getEntities = async <T extends Entity>(
  save: Save,
  keys: Array<string>,
): Promise<Array<T>> => {
  return await Promise.all(
    keys.map(async (key: string) => {
      return await getEntity(save, key);
    }),
  );
};

export const getEntityName = async <T extends Entity>(
  save: Save,
  key: string,
): Promise<string> => {
  return save.Entities[key].Name;
};

export const getEntitiesNames = async <T extends Entity>(
  save: Save,
  keys: Array<string>,
): Promise<Array<string>> => {
  return await Promise.all(
    keys.map(async (key: string) => {
      return await getEntityName(save, key);
    }),
  );
};

export const getEntityWithID = async <T extends Entity>(
  save: Save,
  key: string,
): Promise<Record<string, Entity>> => {
  return { [key]: (await getEntity<T>(save, key)) as T };
};

export const getEntitiesWithIDs = async <T extends Entity>(
  save: Save,
  keys: Array<string>,
): Promise<Record<string, Entity>> => {
  const entityMapper = async (
    entityKeys: Array<string>,
  ): Promise<Array<Record<string, Entity>>> => {
    return await Promise.all(
      entityKeys.map(async (entityKey: string) => {
        return await getEntityWithID(save, entityKey);
      }),
    );
  };
  return await flowAsync(entityMapper, mergeAll)(keys);
};

export const getCurrentDateAsObject = async (
  save: Save,
): Promise<Record<string, string>> => {
  return { Date: save.CurrentDate.toDateString() };
};
