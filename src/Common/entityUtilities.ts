import {
  flowAsync,
  mapValuesIndexed,
  updatePaths,
  updateAllPaths,
} from "futil-js";
import { merge, partial, mapValues, property, mergeAll, map } from "lodash/fp";
import { Save } from "../StorageUtilities/SaveTypes";
import { Entity } from "./CommonTypes";

export const getID = property(["ID"]);
export const getIDs = map(getID);
export const getName = property(["Name"]);
export const getEntities = property(["Entities"]);
export const getNames = map(getName);

export const getEntity = async <T extends Entity>(
  save: Save,
  key: string,
): Promise<T> => {
  return save.Entities[key] as T;
};
// can we use something form lodash
// export const getEntities = async <T extends Entity>(
//   save: Save,
//   keys: Array<string>,
// ): Promise<Array<T>> => {
//   return await Promise.all(
//     keys.map(async (key: string) => {
//       return await getEntity(save, key);
//     }),
//   );
// };



export const getEntityName = async <T extends Entity>(
  save: Save,
  key: string,
): Promise<string> => {
  return property(["Entities", key], save)
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

// make statistics a constant
export const statisticsObjectCreator = async (
  season: string,
): Promise<StatisticsType> => {
  return {
    [season]: {
      Goals: 0,
      "Expected Goals": 0,
      Wins: 0,
      Draws: 0,
      Losses: 0,
    },
  };
};

export const entitiesStatisticsCreator = async (
  season: string,
  entityKeys: Array<string>,
): Promise<Record<string, StatisticsType>> => {
  const creator = async (keys: Array<string>) =>
    await Promise.all(
      keys.map(async (key: string) => {
        return [key, await statisticsObjectCreator(season)];
      }),
    );
  return await flowAsync(creator, Object.fromEntries)(entityKeys);
};

// think it would be better to use updateAllPaths here, for speed purposes, so we need to directly use the STATISTICS constant
export const addSeasonOfStatistics = async (
  season: string,
  entityStatistics: StatisticsType,
): Promise<StatisticsType> => {
  return await flowAsync(
    statisticsObjectCreator,
    merge(entityStatistics),
  )(season);
};

export const addSeasonOfStatisticsToEntities = async (
  season: string,
  entities: Record<string, StatisticsType>,
): Promise<Record<string, StatisticsType>> => {
  const adder = partial(addSeasonOfStatistics, [season]);
  return await flowAsync(mapValuesIndexed(adder))(entities);
};

export const statisticsObjectUpdater = async (
  statsToAdd: StatisticsObject,
  oldStats: StatisticsObject,
): Promise<StatisticsObject> => {
  const updater = (statValue: number, stat: string): number => {
    return statValue + statsToAdd[stat];
  };
  return mapValuesIndexed(updater, oldStats);
};

export const updateEntityStatistics = async (
  season: string,
  [entityStatistics, statsToAdd]: [StatisticsType, StatisticsObject],
): Promise<StatisticsType> => {
  const transformer = {
    [season]: async (currentStats: StatisticsObject) =>
      await statisticsObjectUpdater(statsToAdd, currentStats),
  };
  return await flowAsync(updatePaths(transformer))(entityStatistics);
};

// we should add matches to clubs, countries and competitions
// possibly like <matchID, tournamentID>; this should be one function - addMatchesToEntities
export const updateEntitiesStatistics = async (
  season: string,
  [entitiesStatistics, statsToAddWithIDs]: [
    Record<string, StatisticsType>,
    Record<string, StatisticsObject>,
  ],
): Promise<Record<string, StatisticsType>> => {
  const transformers = await flowAsync(
    mapValuesIndexed(async (statsToAdd: StatisticsObject) => {
      return async (currentStats: StatisticsType) =>
        await updateEntityStatistics(season, [currentStats, statsToAdd]);
    }),
  )(statsToAddWithIDs);

  return await flowAsync(updatePaths(transformers))(entitiesStatistics);
};

export const getSeasonOfEntitiesStatistics = async (
  season: string,
  statistics: Record<string, StatisticsType>,
): Promise<Record<string, StatisticsObject>> => {
  return mapValues(property([season]))(statistics);
};
