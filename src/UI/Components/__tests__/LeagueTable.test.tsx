import React from "react";
import { fc, test } from "@fast-check/vitest";
import { cleanup, screen } from "@testing-library/react"
import { describe, expect } from "vitest";
import { renderWithRouter } from "../../UITestingUtilities"
import {
} from "../../../GameLogic/TestDataGenerators";
import {
  LeagueTable
} from "../LeagueTable";


describe("LeagueTable", async () => {
    
  test("LeagueTable", async () => {
    await fc.assert(
      fc
        .asyncProperty(
          fc.gen(),
          async (fcGen) => {

	    

	    
	    const TestElement = () => {
	      return <div>
		       <LeagueTable clubs={testClubs} />
		     </div>
	    }

	    
	    const { user } = renderWithRouter(<TestElement />)	    

          },
        )
        .beforeEach(async () => {
          cleanup();
        }),
      { numRuns: 1 },
    );
  });
});
