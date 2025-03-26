import { openDB, IDBPDatabase } from "idb";
import { SaveID, Save } from "./SaveTypes";
import { DBNAME, SAVESTORE, DBVERSION, KEYPATH } from "./SaveConstants"

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
