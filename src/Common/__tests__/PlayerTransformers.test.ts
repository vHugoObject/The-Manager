import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  map,
  pipe,
} from "lodash/fp";
import { Entity, PositionGroup } from "../Types";
import { BASECLUBCOMPOSITION } from "../Constants";
import { convertArraysToSetsAndAssertStrictEqual } from "../Asserters";
import { countByIDPrefix } from "../Getters"
import {
  createPlayerIDsForClubs,
  joinOnUnderscores,
} from "../Transformers";

describe("PlayerTransformers test suite", () => {



  test.prop([fc.integer({ min: 2, max: 500 })])(
    "createPlayerIDsForClubs",
    (testTotalClubs) => {
      const actualPlayerIDs: Array<Array<string>> =
        createPlayerIDsForClubs(testTotalClubs);

      const expectedComposition: string = joinOnUnderscores(BASECLUBCOMPOSITION)
      
      const actualCompositions: Array<string> = pipe([
        map(pipe([countByIDPrefix, Object.values])),
        map(joinOnUnderscores),
      ])(actualPlayerIDs);

      
      convertArraysToSetsAndAssertStrictEqual([
        actualCompositions,
        [expectedComposition],
      ]);
    },
  );

});
