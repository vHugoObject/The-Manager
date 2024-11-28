import "fake-indexeddb/auto";
import { simpleFaker } from "@faker-js/faker";
import {
  Manager as TournamentManager,
  Tournament,
} from "tournament-organizer/components";
import { LoadableTournamentValues } from "tournament-organizer/interfaces";
import { deleteDB, IDBPDatabase } from "idb";
import { describe, expect, test } from "vitest";
import { Save, SaveID } from "../SaveTypes";
import { BaseCountries } from "../../Countries/CountryTypes";
import {
  openSaveDB,
  addSaveToDB,
  getSaveValue,
  deleteSave,
  getAllSaveValues,
  getAllSaveKeys,
  updateSaveValue,
  serializeTournamentManager,
  deserializeTournamentManager,
} from "../SaveUtilities";
import { createSave } from "../SaveCreator";
import { createCountry } from "../../Countries/CountryUtilities";
import { createScheduler } from "../../Common/scheduler";

describe("SaveUtilities tests", async () => {
  const testCountry: string = "England";
  const testCompetitionName: string = "English Premier League";
  const testClub: string = "Arsenal";
  const testPlayerName: string = "Mikel Arteta";

  const testCountryOne: string = "England";

  const testCompetitionsOne: Record<string, Record<string, string>> = {
    "English Premier League": {
      [simpleFaker.string.numeric(6)]: "Arsenal",
      [simpleFaker.string.numeric(6)]: "Brentford",
    },
    "The Championship": {
      [simpleFaker.string.numeric(6)]: "Watford",
      [simpleFaker.string.numeric(6)]: "Stoke City",
    },
    "League One": {
      [simpleFaker.string.numeric(6)]: "Walsall",
      [simpleFaker.string.numeric(6)]: "Swindon",
    },
  };

  const testCountryTwo: string = "Spain";

  const testCompetitionsTwo: Record<string, Record<string, string>> = {
    "Primera Division": {
      [simpleFaker.string.numeric(6)]: "Real Madrid CF",
      [simpleFaker.string.numeric(6)]: "FC Barcelona",
    },
    "Segunda Division": {
      [simpleFaker.string.numeric(6)]: "Almeria",
      [simpleFaker.string.numeric(6)]: "Granada",
    },
    "Primera Federacion": {
      [simpleFaker.string.numeric(6)]: "Andorra",
      [simpleFaker.string.numeric(6)]: "Atzeneta",
    },
  };

  const testSeason: string = "2024";

  const testCountriesLeaguesClubs: BaseCountries = {
    [testCountryOne]: testCompetitionsOne,
    [testCountryTwo]: testCompetitionsTwo,
  };
  const expectedSaveOne: Save = await createSave(
    testPlayerName,
    testCountry,
    testCompetitionName,
    testSeason,
    { clubID: simpleFaker.string.numeric(6), clubName: testClub },
    testCountriesLeaguesClubs,
  );

  const expectedSaveTwo: Save = await createSave(
    testPlayerName,
    testCountry,
    testCompetitionName,
    testSeason,
    { clubID: simpleFaker.string.numeric(6), clubName: testClub },
    testCountriesLeaguesClubs,
  );

  const expectedSaves: Array<Save> = [expectedSaveOne, expectedSaveTwo];
  const testDBName: string = "the-manager";
  const testDBVersion: number = 1;
  const saveStore: string = "save-games";

  test("Test openSaveDB", async () => {
    const actualDB: IDBPDatabase = await openSaveDB();
    expect(actualDB.name).toBe(testDBName);
    expect(actualDB.version).toBe(testDBVersion);
    const actualStoreNames = new Set(actualDB.objectStoreNames);
    expect(actualStoreNames.has(saveStore)).toBeTruthy();
    actualDB.close();
    await deleteDB(testDBName);
  });

  test("Test addSaveToDB", async () => {
    const saveID: SaveID = await addSaveToDB(expectedSaveOne);

    const actualValue: Save = await getSaveValue(saveID);
    expect(expectedSaveOne).toStrictEqual(actualValue);
    await deleteDB(testDBName);
  });

  test("Test getSaveValue", async () => {
    const saveID: SaveID = await addSaveToDB(expectedSaveOne);
    const actualValue: Save = await getSaveValue(saveID);
    expect(expectedSaveOne).toStrictEqual(actualValue);
    await deleteDB(testDBName);
  });

  test("Test updateSaveValue", async () => {
    const saveID: SaveID = await addSaveToDB(expectedSaveOne);
    let expectedSaveValue: Save = await getSaveValue(saveID);
    await updateSaveValue(expectedSaveValue);
    let actualValue: Save = await getSaveValue(saveID);
    expect(expectedSaveOne).toStrictEqual(actualValue);

    expectedSaveValue.Name = "Bald Fraud";
    await updateSaveValue(expectedSaveValue);
    actualValue = await getSaveValue(saveID);
    expect(expectedSaveValue).toStrictEqual(actualValue);
    await deleteDB(testDBName);
  });

  test("Test getAllSaveValues", async () => {
    await addSaveToDB(expectedSaveOne);
    await addSaveToDB(expectedSaveTwo);
    const actualSaves: Array<Save> = await getAllSaveValues();
    expect(expectedSaves).toStrictEqual(actualSaves);
    await deleteDB(testDBName);
  });

  test("Test getAllSaveKeys", async () => {
    const keyOne: SaveID = await addSaveToDB(expectedSaveOne);
    const keyTwo: SaveID = await addSaveToDB(expectedSaveTwo);
    const expectedSaveIDs: Array<SaveID> = [keyOne, keyTwo];
    const actualSavesIDs: Array<SaveID> = await getAllSaveKeys();

    expect(actualSavesIDs).toStrictEqual(expectedSaveIDs);
    await deleteDB(testDBName);
  });

  test("Test deleteSave", async () => {
    const _: SaveID = await addSaveToDB(expectedSaveOne);
    const keyTwo: SaveID = await addSaveToDB(expectedSaveTwo);

    await deleteSave(keyTwo);

    const actualSaves: Array<Save> = await getAllSaveValues();
    expect(actualSaves).toStrictEqual([expectedSaveOne]);
    await deleteDB(testDBName);
  });

  test("Test serializeTournamentManager", async () => {
    const [testCountry, testCompetitions, testClubs, testPlayers] =
      await createCountry(testCountryOne, testCompetitionsOne, testSeason);

    const actualScheduler: TournamentManager =
      await createScheduler(testCompetitions);

    const expectedSerializedTournaments: Array<LoadableTournamentValues> =
      actualScheduler.tournaments.map((tournament: Tournament) => {
        return structuredClone(tournament);
      });

    const actualSerializedTournaments: Array<LoadableTournamentValues> =
      serializeTournamentManager(actualScheduler);

    expect(actualSerializedTournaments).toStrictEqual(
      expectedSerializedTournaments,
    );
  });

  test("Test deserializeTournamentManager", async () => {
    const [testCountry, testCompetitions, testClubs, testPlayers] =
      await createCountry(testCountryOne, testCompetitionsOne, testSeason);

    const actualScheduler: TournamentManager =
      await createScheduler(testCompetitions);

    const testSerializedTournamentManager: Array<LoadableTournamentValues> =
      serializeTournamentManager(actualScheduler);

    const actualDeserializedTournamentManager: TournamentManager =
      deserializeTournamentManager(testSerializedTournamentManager);
    expect(actualDeserializedTournamentManager).toStrictEqual(actualScheduler);
  });
});
