import { createContext } from "react";

export enum DBActionType {
  delete = "delete",
  get = "get",
  put = "put",
  sync = "sync",
  initialized = "initialized",
}

export enum CurrentDBState {
  initializing = "initializing",
  initialized = "initialized",
  updating = "updating",
  updated = "updated",
  syncing = "syncing",
  synced = "synced",
  current = "current",
  empty = "empty",
}

export const DBContext = createContext(null);
export const SaveContext = createContext(null);
export const DBDispatchContext = createContext(null);

export interface SaveSummary {
  SaveID: number | IDBValidKey;
  Name: string;
  MainCompetition: string;
  Club: string;
  Seasons: number;
}

export type SaveID = number | IDBValidKey;

export interface DBAction {
  type: DBActionType;
}

export const dbReducer = (dbState: CurrentDBState, action: DBAction) => {
  switch (action.type) {
    case DBActionType.get: {
      return CurrentDBState.synced;
    }
    case DBActionType.put: {
      return CurrentDBState.updated;
    }
    case DBActionType.delete: {
      return CurrentDBState.updated;
    }
    case DBActionType.sync: {
      return CurrentDBState.synced;
    }
    case DBActionType.initialized: {
      return CurrentDBState.synced;
    }
  }
};
