import { openDB } from "idb";
import { merge } from "lodash";
import { SaveID, Save } from "./SaveTypes";

export const addSaveToDB = async (save: Save): Promise<IDBValidKey> => {
  const mainDatabase = "the-manager";
  const saveStore = "save-games";
  const version = 1;
  const db = await openDB(mainDatabase, version, {
    upgrade(db) {
      db.createObjectStore(saveStore, {
        autoIncrement: true,
      });
    },
  });

  const saveID: SaveID = await db.add(saveStore, save);
  const fullSave = merge({ saveID: saveID }, save);

  await db.put(saveStore, fullSave, saveID);
  await db.close();
  return saveID;
};

export const getSaveValue = async (key: SaveID): Promise<Save> => {
  const mainDatabase = "the-manager";
  const saveStore = "save-games";
  const version = 1;

  const db = await openDB(mainDatabase, version, {
    upgrade(db) {
      db.createObjectStore(saveStore, {
        autoIncrement: true,
      });
    },
  });
  const result = await db.get(saveStore, key);
  await db.close();
  return result;
};

export const updateSaveValue = async (key: SaveID, save: Save): Promise<void> => {
  const mainDatabase = "the-manager";
  const saveStore = "save-games";
  const version = 1;

  const db = await openDB(mainDatabase, version, {
    upgrade(db) {
      db.createObjectStore(saveStore, {
        autoIncrement: true,
      });
    },
  });
  await db.put(saveStore, save, key);
  await db.close();
};

export const getAllSaveKeys = async (): Promise<Array<IDBValidKey>> => {
  const mainDatabase = "the-manager";
  const saveStore = "save-games";
  const version = 1;

  const db = await openDB(mainDatabase, version, {
    upgrade(db) {
      db.createObjectStore(saveStore, {
        autoIncrement: true,
      });
    },
  });
  const saveKeys = await db.getAllKeys(saveStore);
  await db.close();
  return saveKeys;
};

export const getAllSaveValues = async (): Promise<Array<Save>> => {
  const mainDatabase = "the-manager";
  const saveStore = "save-games";
  const version = 1;

  const db = await openDB(mainDatabase, version, {
    upgrade(db) {
      db.createObjectStore(saveStore, {
        autoIncrement: true,
      });
    },
  });

  const saveValues = await db.getAll(saveStore);
  await db.close();
  return saveValues;
};

export const deleteSave = async (key: SaveID): Promise<void> => {
  const mainDatabase = "the-manager";
  const saveStore = "save-games";
  const db = await openDB(mainDatabase);
  await db.delete(saveStore, key);
  await db.close();
};
