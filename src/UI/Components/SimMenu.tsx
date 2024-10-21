import React from "react";
import { useState, useContext } from "react";
import {
  SimulationState,
  SimulationContext,
  SimulationDispatchContext,
} from "../SimulationManagement";

export const SimForwardOptions = () => {
  const dispatch = useContext(SimulationDispatchContext);

  const handleSimOneDay = () => {
    // simLength should most likely be dropped from dispatch and just passed to simulate
    dispatch({
      type: SimulationState.simming,
      simLength: "one-day",
    });
  };

  const handleSimOneWeek = () => {
    dispatch({
      type: SimulationState.simming,
      simLength: "one-week",
    });
  };

  const handleSimOneMonth = () => {
    dispatch({
      type: SimulationState.simming,
      simLength: "one-month",
    });
  };

  const handleSimUntilDeadline = () => {
    dispatch({
      type: SimulationState.simming,
      simLength: "until-deadline",
    });
  };

  const handleSimUntilSeasonEnd = () => {
    dispatch({
      type: SimulationState.simming,
      simLength: "until-season-end",
    });
  };

  return (
    <div id="sim-forward-options">
      <div
        class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
        tabindex="-1"
      >
        <button
          aria-label="one-day"
          class="block px-4 py-2 text-sm text-gray-700"
          tabindex="-1"
          onClick={handleSimOneDay}
        >
          One day
        </button>
        <button
          aria-label="one-week"
          class="block px-4 py-2 text-sm text-gray-700"
          tabindex="-1"
          onClick={handleSimOneWeek}
        >
          One week
        </button>
        <button
          aria-label="one-month"
          class="block px-4 py-2 text-sm text-gray-700"
          tabindex="-1"
          onClick={handleSimOneMonth}
        >
          One month
        </button>
        <button
          aria-label="until-deadline"
          class="block px-4 py-2 text-sm text-gray-700"
          tabindex="-1"
          onClick={handleSimUntilDeadline}
        >
          Until next transfer deadline
        </button>
        <button
          aria-label="until-season-end"
          class="block px-4 py-2 text-sm text-gray-700"
          tabindex="-1"
          onClick={handleSimUntilSeasonEnd}
        >
          Until the end of the season
        </button>
      </div>
    </div>
  );
};

export const SimStopButton = () => {
  const dispatch = useContext(SimulationDispatchContext);

  const handleSimStop = () => {
    dispatch({
      type: SimulationState.simStop,
    });
  };

  return (
    <div id="sim-stop">
      <button aria-label="sim-stop" onClick={handleSimStop}>
        Stop
      </button>
    </div>
  );
};

export const SimMenuDropdown = () => {
  const simulationContext = useContext(SimulationContext);
  return (
    <div id="sim-menu-dropdown">
      {simulationContext.simulationState == SimulationState.simming ? (
        <SimStopButton />
      ) : (
        <SimForwardOptions />
      )}
    </div>
  );
};

export const SimMenu = () => {
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = () => setShowMenu((show) => !show);

  return (
    <div class="absolute right-10 top-0 h-16 w-16">
      <button aria-label="sim-button" onClick={handleClick}>
        Sim
      </button>

      <div class="py-1" role="none">
        {showMenu && <SimMenuDropdown />}
      </div>
    </div>
  );
};
