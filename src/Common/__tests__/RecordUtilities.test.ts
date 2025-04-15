import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest"
import  { getObjectKeysCount } from "../RecordUtilities"

describe("RecordUtilities test suite", async () => {

    test.prop([
    fc.nat({ max: 100 }).chain((expectedKeysCount: number) => {
      return fc.tuple(
        fc.constant(expectedKeysCount),
        fc.dictionary(fc.string(), fc.integer(), {
          minKeys: expectedKeysCount,
          maxKeys: expectedKeysCount,
        }),
      );
    }),
  ])("getObjectKeysCount", async (testTuple) => {
    const [expectedKeysCount, testRecord] = testTuple;
    const actualKeysCount: number = getObjectKeysCount(testRecord);
    expect(actualKeysCount).toEqual(expectedKeysCount);
  });


})
