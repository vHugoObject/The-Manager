// @vitest-environment jsdom
import React from "react";
import { useReducer } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, test, afterEach } from "vitest";
import "fake-indexeddb/auto";
import { openDB, deleteDB } from "idb";
import { setup } from "../../UITestingUtilities";
import {
  SimMenu,
  SimStopButton,
  SimForwardOptions,
  SimMenuDropdown,
} from "../SimMenu";
import {
  SimulationContext,
  SimulationDispatchContext,
  SimulationState,
  simulationReducer,
} from "../../SimulationManagement";

describe("Menu test suites", async () => {
  afterEach(async () => {
    cleanup();
  });

  const simButtonNames: Array<string> = [
    "one-day",
    "one-week",
    "one-month",
    "until-deadline",
    "until-season-end",
  ];
  const testInitialSimulationStatus = SimulationState.initializing;

  test("Test SimForwardOptions", async () => {
    render(<SimForwardOptions />);

    simButtonNames.forEach((buttonName: string) => {
      expect(screen.getByRole("button", { name: buttonName })).toBeTruthy();
    });
  });

  test("Test SimStopButton", async () => {
    render(<SimStopButton />);
    expect(screen.getByRole("button", { name: "sim-stop" })).toBeTruthy();
  });

  test("Test SimMenuDropDown with non-simming context", async () => {
    
    
    const testDispatcher = () => {
      return;
    };
    const TestSimMenuDropdown = () => {
      return (
        <div id="test-menu">
          <SimulationContext.Provider value={testInitialSimulationStatus}>
            <SimulationDispatchContext.Provider value={testDispatcher}>
              <SimMenuDropdown />
            </SimulationDispatchContext.Provider>
          </SimulationContext.Provider>
        </div>
      );
    };

    const { user } = setup(<TestSimMenuDropdown />);

    simButtonNames.forEach((buttonName: string) => {
      expect(screen.getByRole("button", { name: buttonName })).toBeTruthy();
    });
  });

  test("Test SimMenuDropDown with simming context", async () => {

    const testDispatcher = () => {
      return;
    };
    const TestSimMenuDropdown = () => {
      return (
        <div id="test-menu">
          <SimulationContext.Provider value={testInitialSimulationStatus}>
            <SimulationDispatchContext.Provider value={testDispatcher}>
              <SimMenuDropdown />
            </SimulationDispatchContext.Provider>
          </SimulationContext.Provider>
        </div>
      );
    };

    const { user } = setup(<TestSimMenuDropdown />);

    expect(screen.getByRole("button", { name: "sim-stop" })).toBeTruthy();
  });

  test("Test the full menu component", async () => {

    const TestSimMenu = ({ testInitialSimulationStatus }) => {
      const [currentSimulationStatus, testDispatcher] = useReducer(
        simulationReducer,
        testInitialSimulationStatus,
      );
      return (
        <div id="test-menu">
          <SimulationContext.Provider value={testInitialSimulationStatus}>
            <SimulationDispatchContext.Provider value={testDispatcher}>
              <SimMenu />
            </SimulationDispatchContext.Provider>
          </SimulationContext.Provider>
        </div>
      );
    };

    const { user } = setup(
      <TestSimMenu testInitialSimulationStatus={testInitialSimulationStatus} />,
    );
    expect(screen.getByRole("button", { name: "sim-button" }));

    // buttons should only be visible when we click
    simButtonNames.forEach((buttonName: string) => {
      expect(() =>
        screen.getByRole("button", { name: buttonName }),
      ).toThrowError();
    });

    // Click Sim
    await user.click(screen.getByRole("button", { name: "sim-button" }));

    simButtonNames.forEach((buttonName: string) => {
      expect(screen.getByRole("button", { name: buttonName })).toBeTruthy();
    });

    // Buttons should disappear after another click
    await user.click(screen.getByRole("button", { name: "sim-button" }));
    simButtonNames.forEach((buttonName: string) => {
      expect(() =>
        screen.getByRole("button", { name: buttonName }),
      ).toThrowError();
    });

    await user.click(screen.getByRole("button", { name: "sim-button" }));

    // Stop should be dispatched when we click the sim button
    await user.click(screen.getByRole("button", { name: "one-week" }));

    // Can't test stop button until it actually does something
    //expect(screen.getByRole("button", {name: "stop-sim"})).toBeTruthy();
  });
});
