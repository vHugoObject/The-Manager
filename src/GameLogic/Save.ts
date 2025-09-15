import { openDB, IDBPDatabase } from "idb";
import { property, curry, map } from "lodash/fp";
import { DBVERSION } from "./Constants";
import { SaveSchema, SaveArguments, Club, Player } from "./Types";

export const createNewDBForSave = async ({
  SaveOptions,
  Clubs,
  Players,
}: SaveArguments): Promise<IDBPDatabase<SaveSchema>> => {
  const { SaveName } = SaveOptions;

  const db = await openDB<SaveSchema>(SaveName, DBVERSION, {
    upgrade(db) {
      db.createObjectStore("SaveOptions", {
        keyPath: "SaveName",
      });
      // db.createObjectStore("Clubs", {
      //   keyPath: "ClubNumber",
      // });
      // db.createObjectStore("Players", {
      // 	keyPath: "PlayerNumber"
      // });
      // db.createObjectStore("Matches", {
      // 	keyPath: "MatchNumber"
      // });
    },
  });

  await db.add("SaveOptions", SaveOptions);

  // const clubTransaction = db.transaction("Clubs", "readwrite")

  // await Promise.all(map(async(club: Club) => {
  //   await clubTransaction.store.add(club)
  // })(Clubs))

  // const playerTransaction = db.transaction("Players", "readwrite")
  // await Promise.all(map(async(player: Player) => {
  //   await playerTransaction.store.add(player)
  // })(Players))

  return db;
};
