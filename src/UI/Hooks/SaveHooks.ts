import { IDBPDatabase } from "idb";
import { useState, useEffect } from "react";
import { ReadonlyNonEmptyArray } from "fp-ts/ReadonlyNonEmptyArray";
import { Option, none as optionNone } from "fp-ts/Option";
import {
  SaveOptions,
  Player,
  LeagueTableRow,
  DomesticLeague,
  MatchLog
} from "../../GameLogic/Types";
import {
  getSaveOptionsOfAllSaves,
  getUserClubNumberFromSaveOptions,
  getUserLeagueFromSaveOptions,
  defaultOpenDB,
} from "../../GameLogic/Save";
import { createArrayOfLeagueTableRows } from "../../GameLogic/Transformers";

export const getAllSaveOptionsHook = (): Option<
  Array<[string, SaveOptions]>
> => {
  const [saveOptions, setSaveOptions] =
    useState<Option<Array<[string, SaveOptions]>>>(optionNone);

  useEffect(() => {
    async function startFetching() {
      setSaveOptions(optionNone);
      const result = await getSaveOptionsOfAllSaves();
      if (!ignore) {
        setSaveOptions(result);
      }
    }

    let ignore = false;
    startFetching();
    return () => {
      ignore = true;
    };
  }, []);

  return saveOptions;
};

export const getSaveEntitiesForMainScreen = (
  saveNumber: string,
): [IDBPDatabase, SaveOptions, Array<Player>, Array<LeagueTableRow>] => {
  const [db, setDB] = useState<IDBPDatabase | null>(null);
  const [saveOptions, setSaveOptions] = useState<SaveOptions | null>(null);
  const [players, setPlayers] = useState<Array<Player>>([]);
  const [leagueTableRows, setLeagueTableRows] = useState<Array<LeagueTableRow>>(
    [],
  );

  useEffect(() => {
    async function startFetching() {
      setDB(null);
      setSaveOptions(null);
      const db = await defaultOpenDB(saveNumber);
      if (!ignore) {
        const options = await db.get("SaveOptions", saveNumber);
        setSaveOptions(options);
        setDB(db);
      }
    }

    let ignore = false;
    startFetching();
    return () => {
      ignore = true;
    };
  }, [saveNumber]);

  useEffect(() => {
    async function startFetching() {
      setPlayers([]);
      setLeagueTableRows([]);
      if (!ignore && db && saveOptions) {
        const clubNumber = getUserClubNumberFromSaveOptions(saveOptions);
        const clubPlayers: Array<Player> = await (
          db as IDBPDatabase
        ).getAllFromIndex("Players", "PlayerClubNumber", clubNumber);
        setPlayers(clubPlayers);

	const domesticLeagueNumber = getUserLeagueFromSaveOptions(saveOptions)
        const {CurrentSeason, Countries} = saveOptions
	const domesticLeague: DomesticLeague = await await (db as IDBPDatabase).get("DomesticLeagues", domesticLeagueNumber)
	
        const matchLogs: ReadonlyNonEmptyArray<MatchLog> = await (db as IDBPDatabase).getAllFromIndex(
          "MatchLogs",
	  "MatchLeagueNumber.MatchSeason",
	  [domesticLeagueNumber, CurrentSeason]
        ) as unknown as ReadonlyNonEmptyArray<MatchLog>;
	
	const rows = createArrayOfLeagueTableRows(Countries, domesticLeague, matchLogs)
	setLeagueTableRows(rows)
      }
    }

    let ignore = false;
    startFetching();
    return () => {
      ignore = true;
    };
  }, [db, saveOptions]);

  return [
    db as IDBPDatabase,
    saveOptions as SaveOptions,
    players,
    leagueTableRows
  ];
};
