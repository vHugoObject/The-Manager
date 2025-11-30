import React from "react";
import { fc, test } from "@fast-check/vitest";
import { cleanup, screen } from "@testing-library/react";
import { describe, assert } from "vitest";
import { add } from "lodash/fp";
import { renderWithRouter } from "../../UITestingUtilities";
import {
  fastCheckCreateObjectWithNTestPlayers
} from "../../../GameLogic/TestDataGenerators";
import { DEFAULTSQUADSIZE } from "../../../GameLogic/Constants";
import { SquadTable } from "../SquadTable";

describe("SquadTable", async () => {
  test("SquadTable", async () => {
    await fc.assert(
      fc
        .asyncProperty(fc.gen(), async (fcGen) => {
          const testPlayers = fastCheckCreateObjectWithNTestPlayers(
            DEFAULTSQUADSIZE,
            fcGen,
          );
          const TestElement = () => {
            return (
              <div>
                <SquadTable players={testPlayers} />
              </div>
            );
          };

          renderWithRouter(<TestElement />);


	  const actualPlayerRows = screen.getAllByRole("row")
	  assert.lengthOf(actualPlayerRows, add(1, DEFAULTSQUADSIZE))
	  
        })
        .beforeEach(async () => {
          cleanup();
        }),
      { numRuns: 1 },
    );
  });
});
