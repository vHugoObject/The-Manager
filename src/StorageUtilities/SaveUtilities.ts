import { openDB, IDBPDatabase } from "idb";
import { SaveID, Save } from "./SaveTypes";

export const openSaveDB = async (): Promise<IDBPDatabase> => {
  const mainDatabase: string = "the-manager";
  const saveStore: string = "save-games";
  const version: number = 1;
  const db = await openDB(mainDatabase, version, {
    upgrade(db) {
      db.createObjectStore(saveStore, {
        keyPath: "saveID"
      });
    },
  });
  return db
}

export const addSaveToDB = async (save: Save): Promise<IDBValidKey> => {

  const saveStore: string = "save-games";
  const db: IDBPDatabase = await openSaveDB()

  const saveID: SaveID = await db.add(saveStore, save);
  db.close();
  return saveID;
};

export const getSaveValue = async (key: SaveID): Promise<Save> => {
  const saveStore: string = "save-games";
  const db: IDBPDatabase = await openSaveDB()

  const result = await db.get(saveStore, key);
  db.close();
  return result;
};

export const updateSaveValue = async (save: Save): Promise<void> => {

  const saveStore: string = "save-games";
  const db: IDBPDatabase = await openSaveDB()

  await db.put(saveStore, save);
  db.close();
};

export const getAllSaveKeys = async (): Promise<Array<IDBValidKey>> => {

  const saveStore: string = "save-games";
  const db: IDBPDatabase = await openSaveDB()

  
  const saveKeys = await db.getAllKeys(saveStore);
  db.close();
  return saveKeys;
};

export const getAllSaveValues = async (): Promise<Array<Save>> => {

  const saveStore: string = "save-games";
  const db: IDBPDatabase = await openSaveDB()

  
  const saveValues = await db.getAll(saveStore);
  db.close();
  return saveValues;
};

export const deleteSave = async (key: SaveID): Promise<void> => {
  const mainDatabase = "the-manager";
  const saveStore = "save-games";
  const db = await openDB(mainDatabase);
  await db.delete(saveStore, key);
  db.close();
};
