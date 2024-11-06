import { openDB, IDBPDatabase } from "idb";
import { update } from 'lodash/fp'
import { SaveID, Save } from "./SaveTypes";
import {
  Manager as TournamentManager,
  Player as TournamentPlayer,
    Match as TournamentMatch,
    Tournament
} from 'tournament-organizer/components';
import { LoadableTournamentValues } from 'tournament-organizer/interfaces';

// add error handle
export const openSaveDB = async (): Promise<IDBPDatabase> => {
  const mainDatabase: string = "the-manager";
  const saveStore: string = "save-games";
  const version: number = 1;
  const db = await openDB(mainDatabase, version, {
    upgrade(db) {
      db.createObjectStore(saveStore, {
        keyPath: "saveID",
      });
    },
  });
  return db;
};

// add error handle
export const addSaveToDB = async (save: Save): Promise<IDBValidKey> => {
  const saveStore: string = "save-games";
  const db: IDBPDatabase = await openSaveDB();
  let preparedSave: Save = update("scheduleManager", serializeTournamentManager, save);
  
  const saveID: SaveID = await db.add(saveStore, preparedSave);
  db.close();
  return saveID;
};

export const getSaveValue = async (key: SaveID): Promise<Save> => {
  const saveStore: string = "save-games";
  const db: IDBPDatabase = await openSaveDB();  

  const save: Save = await db.get(saveStore, key);
  db.close();
  
  return update("scheduleManager", deserializeTournamentManager, save);
};

export const updateSaveValue = async (save: Save): Promise<void> => {
  const saveStore: string = "save-games";
  const db: IDBPDatabase = await openSaveDB();
  let preparedSave: Save = update("scheduleManager", serializeTournamentManager, save);
  await db.put(saveStore, preparedSave);
  db.close();
};

export const getAllSaveKeys = async (): Promise<Array<IDBValidKey>> => {
  const saveStore: string = "save-games";
  const db: IDBPDatabase = await openSaveDB();

  const saveKeys = await db.getAllKeys(saveStore);
  db.close();
  return saveKeys;
};

export const getAllSaveValues = async (): Promise<Array<Save>> => {
  const saveStore: string = "save-games";
  const db: IDBPDatabase = await openSaveDB();

  const saveValues: Array<Save> = await db.getAll(saveStore);
  
  db.close();
  return saveValues.map((save: Save) => update("scheduleManager", deserializeTournamentManager, save))
};

export const deleteSave = async (key: SaveID): Promise<void> => {
  const mainDatabase = "the-manager";
  const saveStore = "save-games";
  const db = await openDB(mainDatabase);
  await db.delete(saveStore, key);
  db.close();
};


export const serializeTournamentManager = (tournamentManager: TournamentManager): Array<LoadableTournamentValues> => {
   return tournamentManager.tournaments.map((tournament: Tournament) => {
     return structuredClone(tournament)
    });
}

export const  deserializeTournamentManager = (tournamentValues: Array<LoadableTournamentValues>): TournamentManager => {
  const tournamentManager: TournamentManager = new TournamentManager();

  tournamentValues.forEach((tournamentValue: LoadableTournamentValues ) => tournamentManager.reloadTournament(tournamentValue))
  return tournamentManager
}
