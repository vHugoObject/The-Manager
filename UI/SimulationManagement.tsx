import { createContext } from "react";

export enum SimulationState {
  initializing = "initializing",
  initialized = "initialized",
  simming = "simming",
  simStop = "simStop",
}

export const SimulationContext = createContext(null);
export const SimulationDispatchContext = createContext(null);

export interface SimulationAction {
  type: SimulationState;
  simLength?: string;
}

export const simulationReducer = (
  currentSimulationStatus: SimulationState,
  action: SimulationAction,
) => {
  switch (action.type) {
    case SimulationState.initialized: {
      return SimulationState.initialized;
    }
    case SimulationState.initializing: {
      return SimulationState.initializing;
    }
    case SimulationState.simming: {
      return SimulationState.simming;
    }
    case SimulationState.simStop: {
      return SimulationState.simStop;
    }
  }
};
