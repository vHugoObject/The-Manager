import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { fastCheckTestMixedArrayOfPositionGroupIDsGenerator } from "../TestDataGenerationUtilities";
import { zipAllAndGetSecondArray } from "../Transformers";
import {
  sortPlayersByRatings,
  getCountOfPlayersByPositionFromArray,
} from "../Getters";

describe("SaveEntitiesGetters test suite", () => {
  test.prop([
    fc.integer({ min: 5, max: 25 }).chain((totalTestSkills: number) => {
      return fc.dictionary(
        fc.string(),
        fc.array(fc.integer({ min: 0, max: 100 }), {
          minLength: totalTestSkills,
          maxLength: totalTestSkills,
        }),
        { minKeys: 5 },
      );
    }),
  ])("sortPlayersByRatings", (testPlayers) => {
    const actualSortedPlayers: Record<
      string,
      Array<number>
    > = sortPlayersByRatings(testPlayers);

    expect(actualSortedPlayers).toMatchObject(testPlayers);
  });

  test.prop([
    fc.tuple(
      fc.integer({ min: 2, max: 50 }),
      fc.integer({ min: 50, max: 100 }),
    ),
    fc.gen(),
  ])("getCountOfPlayersByPositionFromArray", (testRange, fcGen) => {
    const [testPlayerIDs, playerIDIndexCountTuples]: Array<string> =
      fastCheckTestMixedArrayOfPositionGroupIDsGenerator(fcGen, testRange);
    const actualCountsPerPosition: Array<number> =
      getCountOfPlayersByPositionFromArray(testPlayerIDs);
    const expectedCountsPerPosition = zipAllAndGetSecondArray(
      playerIDIndexCountTuples,
    );

    expect(actualCountsPerPosition).toStrictEqual(expectedCountsPerPosition);
  });
});
