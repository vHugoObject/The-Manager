import React from "react";
import { useState, useEffect, useContext, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import {
  dbReducer,
  DBContext,
  DBDispatchContext,
  DBActionType,
  SaveSummary,
  CurrentDBState,
} from "./DatabaseManagement";
import {
  deleteSave,
  getAllSaveValues,
} from "../StorageUtilities/SaveUtilities";
import { Save } from "../StorageUtilities/SaveTypes";
import { SiteBanner } from "./Components/index";

export const PlayButton = ({ saveID, index }) => {
  const navigate = useNavigate();
  const handlePlay = () => {
    navigate(`/save/${saveID}`);
  };

  return (
    <button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      id={`Play_${index}`}
      aria-label={`Play_${index}`}
      onClick={handlePlay}
    >
      Play
    </button>
  );
};

export const DeleteButton = ({ saveID, index }) => {
  const dispatch = useContext(DBDispatchContext);
  const sendDelete = () => {
    dispatch({
      type: DBActionType.delete,
    });
  };
  const handleDelete = async () => {
    await deleteSave(saveID);
    sendDelete();
  };

  return (
    <button
      class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      id={`Delete_${index}`}
      aria-label={`Delete_${index}`}
      color="red"
      onClick={async (event) => {
        await handleDelete();
      }}
    >
      Delete
    </button>
  );
};

export const NewGameButton = () => {
  const navigate = useNavigate();
  const handleNewGame = () => {
    navigate("/newGame");
  };

  return (
    <button
      aria-label="new-game"
      onClick={handleNewGame}
      class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
    >
      Start a New Game
    </button>
  );
};

export const SaveGamesTableRow = ({ saveSummary, rowIndex }) => {
  const rowSaveID = saveSummary.SaveID;
  return (
    <tr aria-label={`save_games_table_row_${rowIndex}`} key={rowIndex}>
      <td id={`Play_${rowIndex}`} key={0}>
        <PlayButton saveID={rowSaveID} index={rowIndex} />
      </td>
      <td id={`Name_${rowIndex}`} key={1} class="text-center p-4">
        {saveSummary.Name}
      </td>
      <td id={`MainCompetition_${rowIndex}`} key={2} class="text-center p-4">
        {saveSummary.MainCompetition}
      </td>
      <td id={`Club_${rowIndex}`} key={3} class="text-center p-4">
        {saveSummary.Club}
      </td>
      <td id={`Seasons_${rowIndex}`} key={4} class="text-center p-4">
        {saveSummary.Seasons}
      </td>
      <td id={`Delete_${rowIndex}`} key={5} class="text-center p-4">
        <DeleteButton saveID={rowSaveID} index={rowIndex} />
      </td>
    </tr>
  );
};

export const SaveGamesTable = ({ saves }) => {
  const tableHeaders: Array<string> = [
    "",
    "Name",
    "Main Competition",
    "Club",
    "Seasons",
    "",
  ];
  const saveSummaryCreator = (save: Save): SaveSummary => {
    return {
      SaveID: save.saveID,
      Name: save.Name,
      MainCompetition: save.MainCompetition,
      Club: save.Club,
      Seasons: 1,
    };
  };

  const SavesTableHead = ({ headers }) => {
    return (
      <thead>
        <tr>
          {headers.map((header: string, index: number) => (
            <th key={index} id={`${header}_${index}`}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  const SavesTableBody = ({ saves }) => {
    return (
      <tbody>
      {saves.map((saveData: Save, index: number) => (
          <SaveGamesTableRow
            saveSummary={saveSummaryCreator(saveData)}
            rowIndex={index}
            key={index}
          />
        ))}
      </tbody>
    );
  };

  return (
    <div id="saveGames">
      <table aria-label="save-games-table" role="table" class="table-auto">
        <SavesTableHead headers={tableHeaders} />
        <SavesTableBody saves={saves} />
      </table>
    </div>
  );
};

// if saves, send synced, else send empty?
export const StartScreen = () => {
  const [availableSaves, setAvailableSaves] = useState(null);

  const [dbState, dispatch] = useReducer(
    dbReducer,
    CurrentDBState.initializing,
  );

  const handleDBState = () => {
    dispatch({
      type: DBActionType.sync,
    });
  };

  useEffect(() => {
    if (
      dbState == CurrentDBState.initializing ||
      dbState == CurrentDBState.updated
    ) {
      getAllSaveValues()
        .then((saves: Array<Save>) => setAvailableSaves(saves))
        .catch((error) => console.error("Database error", error));
    }
    handleDBState();
  }, [dbState]);

  return (
    <div id="start-screen" class="flex flex-col gap-5">
      <DBContext.Provider value={dbState}>
        <DBDispatchContext.Provider value={dispatch}>
          <SiteBanner />
          <NewGameButton />
          {availableSaves && availableSaves.length > 0 && (
            <SaveGamesTable saves={availableSaves} />
          )}
        </DBDispatchContext.Provider>
      </DBContext.Provider>
    </div>
  );
};
