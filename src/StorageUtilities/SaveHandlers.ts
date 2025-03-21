import { constant, partial, property } from "lodash/fp";
import {
  updatePaths,
  updateAllPaths,
  flowAsync,
  mapValuesIndexed,
} from "futil-js";
import { Save } from "../StorageUtilities/SaveTypes";
import {
  Entity,
  StatisticsObject,
  StatisticsType,
} from "../Common/CommonTypes";
import { updateEntitiesStatistics, getEntity } from "../Common/entityUtilities";

export const constantifyObjectValues = mapValuesIndexed(constant);

export const makeEntityAddable = async (
  entity: Entity,
): Promise<Record<string, Record<string, Function>>> => {
  return { [entity.ID]: constantifyObjectValues(entity) };
};

export const makeEntitiesAddable = async (
  entities: Array<Entity>,
): Promise<Record<string, Record<string, Function>>> => {
  const converter = async (arrayOfEntities: Array<Entity>) =>
    await Promise.all(
      arrayOfEntities.map(async (entity: Entity) => [
        entity.ID,
        constantifyObjectValues(entity),
      ]),
    );
  return await flowAsync(converter, Object.fromEntries)(entities);
};

export const addValuesToSave = async (
  save: Save,
  saveKeysTransformer: Record<string, Function>,
): Promise<Save> => {
  return await flowAsync(updatePaths(saveKeysTransformer))(save);
};

export const addEntitiesToSave = async (
  save: Save,
  entities: Array<Entity>,
): Promise<Save> => {
  const addable = await makeEntitiesAddable(entities);
  return await addValuesToSave(save, {
    Entities: (currentEntities: Record<string, Entity>) =>
      updateAllPaths(addable, currentEntities),
  });
};

export const addEntitiesWithStatisticsToSave = async (
  save: Save,
  entitiesAndStatisticsTuple: [
    Record<string, Entity>,
    Record<string, StatisticsType>,
  ],
): Promise<Save> => {
  const [addableEntities, addableEntitiesStatistics] = await Promise.all(
    entitiesAndStatisticsTuple.map(async (entitiesObject) => {
      return await constantifyObjectValues(entitiesObject);
    }),
  );
  return await addValuesToSave(save, {
    Entities: (currentEntities: Record<string, Entity>) =>
      updateAllPaths(addableEntities, currentEntities),
    EntitiesStatistics: (currentStats: Record<string, StatisticsType>) =>
      updateAllPaths(addableEntitiesStatistics, currentStats),
  });
};

export const updateSaveEntitiesStatistics = async (
  save: Save,
  [season, statsToAddWithIDs]: [string, Record<string, StatisticsObject>],
): Promise<Save> => {
  return await addValuesToSave(save, {
    EntitiesStatistics: async (
      entitiesStatistics: Record<string, StatisticsType>,
    ) =>
      await updateEntitiesStatistics(season, [
        entitiesStatistics,
        statsToAddWithIDs,
      ]),
  });
};
