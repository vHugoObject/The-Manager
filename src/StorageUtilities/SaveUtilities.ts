import { openDB, IDBPDatabase } from "idb";
import { property, curry, pick } from "lodash/fp";
import { flowAsync } from "futil-js";
import { SaveID, Save } from "./SaveTypes";
import { Entity } from "../Common/CommonTypes"
import { DBNAME, SAVESTORE, DBVERSION, KEYPATH } from "./SaveConstants"

export const getUserName = property(["Name"])
export const getUserMainCompetitionID = property(["UserMainCompetitionID"])
export const getUserClubID = property(["UserClubID"])
export const getCurrentSeason = property(["CurrentSeason"])
export const getSaveEntities = 	property(["Entities"])
export const getSavePlayerSkills = property(["PlayerSkillsAndPhysicalData"])
export const getAllEntitiesKeysFromSave = flowAsync(getSaveEntities, Object.keys)

export const getEntityFromSavePath = curry((savePath: string, [save, entityID]: [Save, string]): Entity => {
  return property([savePath, entityID])(save)
})

export const getEntityFromSaveEntities = getEntityFromSavePath("Entities")

export const getEntitiesFromSavePath = curry((savePath: string, [save, entityIDs]: [Save, Array<string>]): Record<string, Entity> => {
  return flowAsync(property([savePath]), pick(entityIDs))(save)
})

export const getGroupOfPlayerSkillsFromSave = getEntitiesFromSavePath("PlayerSkillsAndPhysicalData")


export const openSaveDB = async (): Promise<IDBPDatabase> => {    
  const db = await openDB(DBNAME, DBVERSION, {
    upgrade(db) {
      db.createObjectStore(SAVESTORE, {
        keyPath: KEYPATH,
      });
    },
  });
  return db;
};

export const addSaveToDB = async (save: Save): Promise<IDBValidKey> => {
  const db: IDBPDatabase = await openSaveDB();
  const saveID: SaveID = await db.add(SAVESTORE, save);
  db.close();
  return saveID;
};

export const getSave = async (key: SaveID): Promise<Save> => {
  const db: IDBPDatabase = await openSaveDB();
  const save: Save = await db.get(SAVESTORE, key);
  db.close();
  return save;
};

export const updateSave = async (save: Save): Promise<void> => {
  const db: IDBPDatabase = await openSaveDB();
  await db.put(SAVESTORE, save);
  db.close();
};

export const getAllSaveKeys = async (): Promise<Array<IDBValidKey>> => {
  const db: IDBPDatabase = await openSaveDB();
  const saveKeys = await db.getAllKeys(SAVESTORE);
  db.close();
  return saveKeys;
};

export const getAllSaves = async (): Promise<Array<Save>> => {
  const db: IDBPDatabase = await openSaveDB();
  const saveValues: Array<Save> = await db.getAll(SAVESTORE);
  db.close();
  return saveValues;
};

export const deleteSave = async (key: SaveID): Promise<void> => {  
  const db: IDBPDatabase = await openDB(DBNAME);
  await db.delete(SAVESTORE, key);
  db.close();
};
