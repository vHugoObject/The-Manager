import React from "react";
import { useState, useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import { getSaveValue } from "../StorageUtilities/SaveUtilities";
import {
  SimpleCompetitionTable,
  SimpleSquadTable,
  ClubSummary,
  SideMenu,
  SimMenu,
  SiteBanner,
} from "./Components/index";
import {
  SimulationContext,
  SimulationDispatchContext,
  SimulationState,
  simulationReducer,
} from "./SimulationManagement";
import {
  SaveContext,
} from "./DatabaseManagement";
import { Save, SaveID } from '../StorageUtilities/SaveTypes'

export const MainScreen = () => {
  let saveID: SaveID = useParams().saveID
  const [currentSave, setCurrentSave] = useState(null);
  const [currentSimulationStatus, dispatch] = useReducer(
    simulationReducer,
    SimulationState.initializing,
  );

  const handleInitialized = () => {
    dispatch({
      type: SimulationState.initialized,
    });
  };

  useEffect(() => {
    if (currentSimulationStatus == SimulationState.initializing) {
      getSaveValue(saveID)
        .then((save: Save) => setCurrentSave(save))
        .catch((error) => console.error("Error fetching save:", error));
    }
    handleInitialized();
  }, [saveID, currentSimulationStatus]);

  useEffect(() => {
    if (currentSimulationStatus == SimulationState.simming) {
      getSaveValue(saveID)
        .then((save: Save) => setCurrentSave(save))
        .catch((error) => console.error("Error fetching save:", error));
    }
  }, [saveID, currentSimulationStatus]);

  // do we need to use context with 
  return (
    <div id="main-screen">
      <SiteBanner />
      <div id="main-screen-options">
      <SaveContext.Provider value={currentSave}>
        <SimulationContext.Provider value={currentSimulationStatus}>
          <SimulationDispatchContext.Provider value={dispatch}>
            <SideMenu />
            <SimMenu />
            {currentSave && <SimpleCompetitionTable 
			      season={currentSave.CurrentSeason}
	    />}
            {currentSave && <ClubSummary 
			      season={currentSave.CurrentSeason}
	    />}
            {currentSave && <SimpleSquadTable 
			      season={currentSave.CurrentSeason}
	    />}
          </SimulationDispatchContext.Provider>
          </SimulationContext.Provider>
	  </SaveContext.Provider>
      </div>
    </div>
  );
};
