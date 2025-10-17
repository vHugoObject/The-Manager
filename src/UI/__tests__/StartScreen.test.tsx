import React from "react";
import "fake-indexeddb/auto";
import { test, fc } from "@fast-check/vitest";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect } from "vitest";
import { property } from "lodash/fp";
import { renderWithRouter, reactCleanup } from "../UITestingUtilities";
import { fastCheckCreateTestSaveArguments } from "../../GameLogic/TestDataGenerators";
import { createNewDBForSave } from "../../GameLogic/Save";
import { StartScreen } from "../StartScreen";

describe("StartScreen test suite", async () => {
  test("Test StartScreen with no save", async () => {
    await fc.assert(
      fc.asyncProperty(fc.gen(), async (fcGen) => {
        const { user } = renderWithRouter(<StartScreen />);

        expect(screen.getByText("Start New Game")).toBeTruthy();
        await reactCleanup();
      }),
      { numRuns: 1 },
    );
  });

  test("Test StartScreen with save", async () => {
    await fc.assert(
      fc.asyncProperty(fc.gen(), async (fcGen) => {
        const { user, rerender } = renderWithRouter(<StartScreen />);

        const [testSaveArguments] = fastCheckCreateTestSaveArguments(fcGen);
        const testSave = await createNewDBForSave(testSaveArguments);
        const expectedSeason = property(
          ["SaveOptions", "StartSeason"],
          testSaveArguments,
        );

        expect(screen.getByText(expectedSeason)).toBeTruthy();
        await reactCleanup();
      }),
      { numRuns: 1 },
    );
  });
});
