import React from "react";
import { fc, test } from "@fast-check/vitest";
import { cleanup, screen } from "@testing-library/react"
import { describe, expect } from "vitest";
import { compact } from "fp-ts/ReadonlyArray"
import { pipe } from "lodash/fp"
import { renderWithRouter } from "../../UITestingUtilities"
import {
  fastCheckCreateArrayOfTestSaveOptions,
  fastCheckRandomItemFromArray
} from "../../../GameLogic/TestDataGenerators";
import {
  OldSavesCards,
} from "../OldSaves";


describe("OldSaves", async () => {
    
  test("OldSavesCards", async () => {
    await fc.assert(
      fc
        .asyncProperty(
          fc.gen(),
          fc.integer({ min: 2, max: 5 }),
          async (fcGen, testOptionsCount) => {


	    const testSaveOptionTuples = fastCheckCreateArrayOfTestSaveOptions(fcGen, testOptionsCount)
	    const TestElement = () => {
	      return <div>
		       <OldSavesCards saveOptionTuples={testSaveOptionTuples} />
		     </div>
	    }
	   
	    const { user } = renderWithRouter(<TestElement />)
	    screen.debug()
	    const [expectedRandomSaveName] = pipe([compact, fastCheckRandomItemFromArray(fcGen)])(testSaveOptionTuples)

	    expect(screen.getByText(expectedRandomSaveName)).toBeTruthy()	    
	    
          },
        )
        .beforeEach(async () => {
          cleanup();
        }),
      { numRuns: 1 },
    );
  });
});
