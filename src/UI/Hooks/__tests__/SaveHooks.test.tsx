import React from "react";
import { describe, expect } from "vitest";
import { renderHook, cleanup, waitFor } from "@testing-library/react";
import "fake-indexeddb/auto";
import { deleteDB } from "idb";
import { fc, test } from "@fast-check/vitest";
import {
  fastCheckCreateTestSaveArguments,
  fastCheckRandomItemFromArray,
  fastCheckCreateTestSaveOptionsWithRandomCountries,
} from "../../../GameLogic/TestDataGenerators";
import { createNewDBForSave, createSave } from "../../../GameLogic/Save";
import {
  assertIsSaveOptions,
  assertIsPlayerObject,
  assertIsLeagueTableRow,
} from "../../../GameLogic/Asserters";
import {
  getSaveEntitiesForMainScreen,
  getAllSaveOptionsHook,
} from "../SaveHooks";

describe("SaveHooks", async () => {
  test.skip("getAllSaveOptionsHook some weird error leads to  this test does not work", async () => {
    await fc.assert(
      fc
        .asyncProperty(fc.gen(), async (fcGen) => {
          const { result, rerender, unmount } = renderHook(() =>
            getAllSaveOptionsHook(),
          );

          const [testSaveArguments] = fastCheckCreateTestSaveArguments(fcGen);
          const testSave = await createNewDBForSave(testSaveArguments);

          rerender();

          const { current: actualResult } = result;
          
          expect(actualResult.length).toBe(1);

          testSave.close();
          await deleteDB(testSave.name);
          unmount();
        })
        .afterEach(async () => {
          cleanup();
        }),
      { numRuns: 1 },
    );
  });

  test("getSaveEntitiesForMainScreen", async () => {
    await fc.assert(
      fc
        .asyncProperty(fc.gen(), async (fcGen) => {
          const testSaveOptions =
            fastCheckCreateTestSaveOptionsWithRandomCountries(fcGen);

          const testSave = await createSave(testSaveOptions);

          const { result, rerender, unmount } = renderHook(
            (initialProps) => {
              return getSaveEntitiesForMainScreen(initialProps);
            },
            { initialProps: testSave.name },
          );

          rerender(testSave.name);

          await waitFor(() => expect(result.current).toBeTruthy());

          const [
            actualDB,
            actualSaveOptions,
            actualClubPlayers,
            actualLeagueTableRows,
          ] = result.current;

          expect(actualDB.name).toBe(testSave.name);
          assertIsSaveOptions(actualSaveOptions);

          const actualRandomPlayer = fastCheckRandomItemFromArray(
            fcGen,
            actualClubPlayers,
          );

          const actualRandomLeagueTableRow = fastCheckRandomItemFromArray(
            fcGen,
            actualLeagueTableRows,
          );

          assertIsPlayerObject(actualRandomPlayer);
          assertIsLeagueTableRow(actualRandomLeagueTableRow);

          testSave.close();
          await deleteDB(testSave.name);

          unmount();
        })
        .afterEach(cleanup),
      { numRuns: 1 },
    );
  });
});
