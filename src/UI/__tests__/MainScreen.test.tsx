import React from "react";
import "fake-indexeddb/auto";
import { test, fc } from "@fast-check/vitest";
import { describe, expect, assert } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { IDBPDatabase, deleteDB } from "idb";
import { forEach } from "lodash/fp";
import { renderWithRouter, reactCleanup } from "../UITestingUtilities";
import { fastCheckCreateTestSaveOptionsWithRandomCountries } from "../../GameLogic/TestDataGenerators";
import { SQUADTABLEHEADERS } from "../Components/SquadTable";
import { DEFAULTSQUADSIZE } from "../../GameLogic/Constants";
import { SaveSchema, SaveOptions } from "../../GameLogic/Types";
import { createSave } from "../../GameLogic/Save";
import { MainScreen } from "../MainScreen";

describe("MainScreen test suite", async () => {
  test("test Squad Table", async () => {
    await fc.assert(
      fc.asyncProperty(fc.gen(), async (fcGen) => {
        const testSaveOptions: SaveOptions =
          fastCheckCreateTestSaveOptionsWithRandomCountries(fcGen);

        const testSave: IDBPDatabase<SaveSchema> =
          await createSave(testSaveOptions);
        const testSaveName = testSave.name;
        const testDBRoute = `saves/${testSaveName}`;

        renderWithRouter(<MainScreen />, {
          route: testDBRoute,
        });

        forEach((header: string): void => {
          expect(screen.getByText(header)).toBeTruthy();
        })(SQUADTABLEHEADERS);

        await waitFor(() => {
          screen.getAllByTestId((id: string, _) => id.startsWith("player"));
        });

        const players = screen.getAllByTestId((id: string, _) =>
          id.startsWith("player"),
        );

        assert.lengthOf(players, DEFAULTSQUADSIZE);

        testSave.close();
        await deleteDB(testSave.name);
      }),
      { numRuns: 1 },
    );
  });
});
