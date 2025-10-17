import React from "react";
import { renderHook, cleanup } from "vitest-browser-react";
import { describe, expect } from "vitest";
import { fc, test } from "@fast-check/vitest";
import { fastCheckCreateTestSaveArguments } from "../../../GameLogic/TestDataGenerators";
import { createNewDBForSave } from "../../../GameLogic/Save";
import { getAllSaveOptionsHook } from "../SaveHooks";

describe("SaveHooks", async () => {
  test("getAllSaveOptionsHook", async () => {
    await fc.assert(
      fc
        .asyncProperty(fc.gen(), async (fcGen) => {
          const { result, rerender, unmount } = await renderHook(() =>
            getAllSaveOptionsHook(),
          );

          const [testSaveArguments] = fastCheckCreateTestSaveArguments(fcGen);
          const testSave = await createNewDBForSave(testSaveArguments);

          rerender();
          expect(result.current.length).toEqual(1);
          unmount();
        })
        .afterEach(cleanup),
      { numRuns: 1 },
    );
  });
});
