import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { sum, zipAll } from "lodash/fp";
import { convertArrayOfArraysToArrayOfSets } from "../../Common/Transformers";
import {
  generateTestOutfieldPlayersComposition,
  generateTestComposition,
  generateTestStartingEleven,
  generateTwoTestStartingElevens,
  generateTwoTestStartingElevenTuples,
} from "../MatchSimulationTestingUtilities";

describe("MatchSimulationTestingUtilities test suite", async () => {
  test.prop([fc.gen()])(
    "generateTestOutfieldPlayersComposition",
    async (fcGen) => {
      const actualTestOutfieldPlayers: Array<number> =
        generateTestOutfieldPlayersComposition(fcGen);
      expect(actualTestOutfieldPlayers.length).toEqual(3);
      expect(sum(actualTestOutfieldPlayers)).toEqual(10);
    },
  );

  test.prop([fc.nat(), fc.gen()])(
    "generateTestComposition",
    async (testStartingIndex, fcGen) => {
      const actualComposition: Array<[number, number, number]> =
        await generateTestComposition(testStartingIndex, fcGen);
      const [, actualPositionCounts, actualStartingIndices] =
        zipAll(actualComposition);
      const [actualStartingIndicesSet, expectedStartingIndicesSet] =
        convertArrayOfArraysToArrayOfSets([
          actualStartingIndices,
          [testStartingIndex],
        ]);
      expect(sum(actualPositionCounts)).toEqual(11);
      expect(actualStartingIndicesSet).toStrictEqual(
        expectedStartingIndicesSet,
      );
    },
  );

  test.prop([fc.nat(), fc.gen()])(
    "generateTestStartingEleven",
    async (testStartingIndex, fcGen) => {
      const actualTestStartingEleven: Record<
        string,
        Array<number>
      > = await generateTestComposition(testStartingIndex, fcGen);
      const actualTestStartingElevenKeys: Array<string> = Object.keys(
        actualTestStartingEleven,
      );
    },
  );
});
