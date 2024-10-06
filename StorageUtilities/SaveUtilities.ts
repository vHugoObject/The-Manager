import { openDB, deleteDB } from "idb";

export const addSaveToDB = async (save) => {
  const mainDatabase = "the-manager";
  const saves = "save-games";
  const version = 1;
  const db = await openDB(mainDatabase, version, {
    upgrade(db) {
      db.createObjectStore(saves, {
        autoIncrement: true,
      });
    },
  });

  const result = await db.add(saves, save);
  db.close();
  return result;
};

export const getSaveFromDB = async (key: number) => {
  const mainDatabase = "the-manager";
  const saves = "save-games";

  const db = await openDB(mainDatabase);
  const result = await db.get(saves, key);
  db.close();
  return result;
};
