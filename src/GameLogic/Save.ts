import { openDB, IDBPDatabase, deleteDB } from "idb";
import {
  map,
  pipe,
  property,
  over,
  max,
  toString,
  curry,
  forEach
} from "lodash/fp";
import { fromNullable, Option, map as optionMap, getOrElse } from "fp-ts/Option";
import { DBVERSION } from "./Constants";
import { SaveSchema, SaveOptions, SaveArguments, Club, Player } from "./Types";
import {
  getClubsCountFromBaseCountries,
  getPlayersCountForBaseCountries,
} from "./Getters";
import { createClub, createPlayer, unfold, addOne } from "./Transformers";

export const indexedDBCleanup = async(): Promise<void> => {
  const databases = await indexedDB.databases();
  const databaseNames = property("name", databases)
  forEach(async(databaseName: string): Promise<void> => {
    await deleteDB(databaseName);
  })(databaseNames)
}


export const getAllSaveNames = async (): Promise<Option<Array<string>>> => {
  const allSaves = await indexedDB.databases();
  return pipe([fromNullable, optionMap(map(property("name")))])(allSaves)
};


export const getNextSaveName = async (): Promise<string> => {
  const saveNames: Option<Array<string>> = await getAllSaveNames();
  return pipe([optionMap(pipe([map(parseInt), max, addOne, toString])), getOrElse(() => "1")])(saveNames);
  
};

export const createNewDBForSave = async ({
  SaveOptions,
  Clubs,
  Players,
}: SaveArguments): Promise<IDBPDatabase<SaveSchema>> => {
  const saveName: string = await getNextSaveName();
  
  const db = await openDB<SaveSchema>(saveName, DBVERSION, {
    upgrade(db) {
      db.createObjectStore("SaveOptions");
      db.createObjectStore("Clubs", {
        keyPath: "ClubNumber",
      });
      db.createObjectStore("Players", {
        keyPath: "PlayerNumber",
      });
      db.createObjectStore("Matches", {
        keyPath: "MatchNumber",
      });
    },
  });

  await db.put("SaveOptions", SaveOptions, saveName);

  await Promise.all(
    map(async (club: Club) => {
      const tx = db.transaction("Clubs", "readwrite");
      await tx.objectStore("Clubs").put(club);
      await tx.done;
    })(Clubs),
  );

  await Promise.all(
    map(async (player: Player) => {
      const tx = db.transaction("Players", "readwrite");
      await tx.objectStore("Players").put(player);
      await tx.done;
    })(Players),
  );

  return db;
};

export const createSave = async (
  SaveOptions: SaveOptions,
): Promise<IDBPDatabase<SaveSchema>> => {
  const createSaveClubs = pipe([
    getClubsCountFromBaseCountries,
    unfold(createClub),
  ]);
  const createSavePlayers = pipe([
    getPlayersCountForBaseCountries,
    unfold(createPlayer),
  ]);
  const [Clubs, Players]: [Array<Club>, Array<Player>] = pipe([
    property(["Countries"]),
    over([createSaveClubs, createSavePlayers]),
  ])(SaveOptions);

  return await createNewDBForSave({ SaveOptions, Clubs, Players });
};

export const getSaveOptionsForSave = curry(
  async ([saveName, dbVersion]: [string, number]): Promise<
    Option<SaveOptions>
  > => {    
    const db = await openDB(saveName, dbVersion);
    const saveOptions = await db.get("SaveOptions", saveName);

    return fromNullable(saveOptions);
  },
);

export const getSaveOptionsOfAllSaves = async (): Promise<
Array<Option<[string, SaveOptions]>>> => {
  const saves = await indexedDB.databases();
  const saveGetter = async ({
    name,
    version,
  }: IDBDatabaseInfo): Promise<Option<[string, SaveOptions]>> => {
    const saveOptions = await getSaveOptionsForSave([name, version])
    return optionMap((saveOptions: SaveOptions): [string, SaveOptions] => [name, saveOptions])(saveOptions)
  }

  return await Promise.all(map(saveGetter)(saves));
};
