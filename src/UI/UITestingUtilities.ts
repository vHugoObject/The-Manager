import { render, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";
import { map, get } from "lodash/fp";
import { indexedDBCleanup } from "../GameLogic/Save"

export const setup = (jsx: JSX.Element) => {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
};

export const renderWithRouter = (ui: React.ReactNode, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: BrowserRouter }),
  };
};


export const reactCleanup = async(): Promise<void> => {
  cleanup()
  await indexedDBCleanup()
}

export const getElementID = get("id");
export const getElementValue = get("value");
export const getElementText = get("text");
export const getElementName = get("name");
export const getElementType = get("submit");

export const getIDsOfElements = map(getElementID);
export const getValuesOfElements = map(getElementValue);
export const getTextOfElements = map(getElementText);
