import React from "react";
import { fc, test } from "@fast-check/vitest";
import { cleanup, screen } from "@testing-library/react"
import { describe, expect } from "vitest";
import { pipe, property } from "lodash/fp"
import { renderWithRouter } from "../../UITestingUtilities"
import {
  fastCheckRandomItemFromArray,
  fastCheckCreateNTestPlayers
} from "../../../GameLogic/TestDataGenerators";
import { DEFAULTSQUADSIZE } from "../../../GameLogic/Constants";
import {
  SquadTable
} from "../SquadTable";


describe("SquadTable", async () => {
    
  test("SquadTable", async () => {
    await fc.assert(
      fc
        .asyncProperty(
          fc.gen(),
          async (fcGen) => {


	    const testPlayers = fastCheckCreateNTestPlayers(DEFAULTSQUADSIZE, fcGen)
	    const TestElement = () => {
	      return <div>
		       <SquadTable players={testPlayers} />
		     </div>
	    }

	    
	    const { user } = renderWithRouter(<TestElement />)
	    const expectedRandomPlayerWage = pipe([fastCheckRandomItemFromArray, property("Wage")])(fcGen, testPlayers)
	    
	    expect(screen.getByText(expectedRandomPlayerWage)).toBeTruthy()
	    

          },
        )
        .beforeEach(async () => {
          cleanup();
        }),
      { numRuns: 1 },
    );
  });
});
