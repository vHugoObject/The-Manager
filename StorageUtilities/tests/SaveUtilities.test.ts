import "fake-indexeddb/auto";
import { openDB, deleteDB } from "idb";
import { addSaveToDB, getSaveFromDB } from "../SaveUtilities";
import { describe, expect, test } from "vitest";

describe("SaveUtilities tests", async () => {
  const testSave = {
    "manager-name": "Jose Mourinho",
    country: "England",
    "domestic-league": "English Premier League",
    club: "Arsenal",
  };

  const testDBName = "the-manager";
  const saves = "save-games";

  test("Test addSaveToDB", async () => {
    const saveID = await addSaveToDB(testSave);
    const db = await openDB(testDBName);
    const actualValue = await db.get(saves, saveID);
    expect(actualValue).toStrictEqual(testSave);
  });

  test("Test getSaveFromDB", async () => {
    const version = 1;
    const db = await openDB(testDBName, version, {
      upgrade(db) {
        db.createObjectStore(saves, {
          autoIncrement: true,
        });
      },
    });

    const key = await db.add(saves, testSave);
    const actualValue = await getSaveFromDB(key);
    expect(actualValue).toStrictEqual(testSave);
  });
});
