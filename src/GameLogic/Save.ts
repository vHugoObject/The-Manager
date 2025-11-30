import { openDB, IDBPDatabase, deleteDB } from "idb";
import {
  map,
  pipe,
  property,
  over,
  max,
  toString,
  curry,
  forEach,
  noop,
} from "lodash/fp";
import {
  fromNullable,
  Option,
  map as optionMap,
  getOrElse,
  none as optionNone,
  some as optionSome,
  fromPredicate,
} from "fp-ts/Option";
import { compact, isNonEmpty } from "fp-ts/ReadonlyArray";
import { SaveSchema } from "./Types";
import {
  PLAYERINDEXES,
  CLUBINDEXES,
  DOMESTICLEAGUEINDEXES,
  MATCHLOGINDEXES,
  DBVERSION,
} from "./SaveConstants";
import {
  SaveOptions,
  SaveArguments,
  DomesticLeague,
  Club,
  Player,
} from "./Types";
import {
  createSaveDomesticLeagues,
  createSaveClubs,
  createSavePlayers,
  addOne,
  convertClubRelativeIndexIntoAbsoluteNumber,
  convertDomesticLeagueRelativeIndexIntoAbsoluteNumber,
  convertToSet,
} from "./Transformers";

export const asyncTryCatchK = curry(
  async <A, B>(
    f: (args: Array<A>) => Promise<B>,
    args: Array<A>,
  ): Promise<Option<B>> => {
    try {
      const val = await f(...args);
      return optionSome(val);
    } catch (e) {
      return optionNone;
    }
  },
);

export const getDBObjectStoreNames = pipe([
  property("objectStoreNames"),
  Object.values,
]);

export const getDBObjectStoreNamesAsSet = pipe([
  property("objectStoreNames"),
  Object.values,
  convertToSet,
]);

export const validDB = (db: IDBPDatabase): boolean => {
  const objectStoreNames = getDBObjectStoreNamesAsSet(db);
  return objectStoreNames.has("SaveOptions");
};

export const getDBObjectStoreIndexNames = pipe([
  property(["store", "indexNames"]),
  Object.values,
]);

export const getDBObjectStoreIndexNamesAsSet = pipe([
  getDBObjectStoreIndexNames,
  convertToSet,
]);

export const defaultOpenDB = async (
  saveNumber: string,
): Promise<IDBPDatabase> => await openDB(saveNumber, DBVERSION);

export const getDBNames = async (): Promise<Array<string>> => {
  const databases = await indexedDB.databases();
  return map("name")(databases);
};

export const indexedDBCleanup = async (): Promise<void> => {
  const databases = await indexedDB.databases();
  const databaseNames = map("name")(databases);
  forEach(async (databaseName: string): Promise<void> => {
    await deleteDB(databaseName, {
      blocked() {
        setTimeout(noop, 3);
      },
    });
  })(databaseNames);
};

export const getAllSaveNames = async (): Promise<Option<Array<string>>> => {
  const allSaves = await indexedDB.databases();
  return pipe([fromNullable, optionMap(map(property("name")))])(allSaves);
};

export const getNextSaveNumber = async (): Promise<string> => {
  const saveNames: Option<Array<string>> = await getAllSaveNames();
  return pipe([
    optionMap(pipe([map(parseInt), max, addOne, toString])),
    getOrElse(() => "1"),
  ])(saveNames);
};

const indexCreator = curry(
  (
    objectStore: IDBObjectStore,
    [indexName, keyPath]: [string, string | Array<string>],
  ) => {
    objectStore.createIndex(indexName, keyPath);
  },
);
const createIndexes = curry(
  <T>(indexes: Array<string>, objectStore: IDBObjectStore): void => {
    forEach(indexCreator(objectStore), indexes);
  },
);

const createPlayerIndexes = createIndexes(PLAYERINDEXES);
const createClubIndexes = createIndexes(CLUBINDEXES);
const createDomesticLeagueIndexes = createIndexes(DOMESTICLEAGUEINDEXES);
const createMatchLogIndexes = createIndexes(MATCHLOGINDEXES);

export const createNewDBForSave = async ({
  SaveOptions,
  DomesticLeagues,
  Clubs,
  Players,
}: SaveArguments): Promise<IDBPDatabase<SaveSchema>> => {
  const saveNumber: string = await getNextSaveNumber();

  const db = await openDB<SaveSchema>(saveNumber, DBVERSION, {
    upgrade(db) {
      db.createObjectStore("SaveOptions");

      const domesticLeaguesStore = db.createObjectStore("DomesticLeagues", {
        keyPath: "LeagueNumber",
      });

      createDomesticLeagueIndexes(domesticLeaguesStore);
      const clubsStore = db.createObjectStore("Clubs", {
        keyPath: "ClubNumber",
      });

      createClubIndexes(clubsStore);

      const playersStore = db.createObjectStore("Players", {
        keyPath: "PlayerNumber",
      });

      createPlayerIndexes(playersStore);

      const matchLogsStore = db.createObjectStore("MatchLogs", {
        keyPath: "MatchNumber",
      });

      createMatchLogIndexes(matchLogsStore);
    },
  });

  const tx = db.transaction("SaveOptions", "readwrite");
  await tx.objectStore("SaveOptions").put(SaveOptions, saveNumber);
  await tx.done;

  await Promise.all(
    forEach(async (domesticLeague: DomesticLeague) => {
      const tx = db.transaction("DomesticLeagues", "readwrite");
      await tx.objectStore("DomesticLeagues").put(domesticLeague);
      await tx.done;
    })(DomesticLeagues),
  );

  await Promise.all(
    forEach(async (club: Club) => {
      const tx = db.transaction("Clubs", "readwrite");
      await tx.objectStore("Clubs").put(club);
      await tx.done;
    })(Clubs),
  );

  await Promise.all(
    forEach(async (player: Player) => {
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
  const [DomesticLeagues, Clubs, Players]: [
    Array<DomesticLeague>,
    Array<Club>,
    Array<Player>,
  ] = pipe([
    property(["Countries"]),
    over([createSaveDomesticLeagues, createSaveClubs, createSavePlayers]),
  ])(SaveOptions);

  return await createNewDBForSave({
    SaveOptions,
    DomesticLeagues,
    Clubs,
    Players,
  });
};

export const baseGetSaveOptionsForSave = async (
  saveNumber: string,
  dbVersion: number,
): Promise<SaveOptions> => {
  const db = await openDB(saveNumber, dbVersion);
  const saveOptions = await db.get("SaveOptions", saveNumber);
  db.close();
  return saveOptions;
};

export const getSaveOptionsForSave = asyncTryCatchK(baseGetSaveOptionsForSave);

export const getSaveOptionsOfAllSaves = async (): Promise<
  Option<Array<[string, SaveOptions]>>
> => {
  const saves = await indexedDB.databases();
  const saveGetter = async ({
    name,
    version,
  }: IDBDatabaseInfo): Promise<Option<[string, SaveOptions]>> => {
    const saveOptions = await getSaveOptionsForSave([name, version]);
    return optionMap((saveOptions: SaveOptions): [string, SaveOptions] => [
      name,
      saveOptions,
    ])(saveOptions);
  };
  const result = await Promise.all(map(saveGetter)(saves));
  return pipe([compact, fromPredicate(isNonEmpty)])(result);
};

export const getUserClubNumberFromSaveOptions = pipe([
  over([
    property("CountryIndex"),
    property("DomesticLeagueIndex"),
    property("ClubIndex"),
  ]),
  convertClubRelativeIndexIntoAbsoluteNumber,
]);

export const getUserLeagueFromSaveOptions = pipe([
  over([property("CountryIndex"), property("DomesticLeagueIndex")]),
  convertDomesticLeagueRelativeIndexIntoAbsoluteNumber,
]);
