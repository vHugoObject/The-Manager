import React from "react";
import { fc, test } from "@fast-check/vitest";
import { cleanup, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import { pipe, property } from "lodash/fp"
import { setup } from "../../UITestingUtilities";
import {
  fastCheckCreateTestListOfRandomMatchLogs,
  fastCheckGenerateRandomBaseCountries,
  fastCheckRandomItemFromArray
} from "../../../GameLogic/TestDataGenerators";
import { createLeagueTable } from "../../../GameLogic/Transformers";
import { LeagueTable } from "../LeagueTable";

describe("LeagueTable", async () => {
  test("LeagueTable", async () => {
    await fc.assert(
      fc
        .asyncProperty(fc.gen(), async (fcGen) => {
	  
	  const testBaseCountries = fastCheckGenerateRandomBaseCountries(fcGen);          
          const [testMatchLogs] = fastCheckCreateTestListOfRandomMatchLogs(
	    testBaseCountries,
            fcGen,
          );

          const testLeagueTable = createLeagueTable(
            testBaseCountries,
            testMatchLogs,
          );
	  
          const TestElement = () => {
            return (
              <div>
                <LeagueTable leagueTableRows={testLeagueTable} />
              </div>
            );
          };

          setup(<TestElement />);
	  
	  const expectedRandomClubName: string = pipe([fastCheckRandomItemFromArray(fcGen), property("Club Name")])(testLeagueTable)
	  expect(screen.getByText(expectedRandomClubName)).toBeTruthy();
	  
	  
        })
        .beforeEach(async () => {
          cleanup();
        }),
      { numRuns: 10 },
    );
  });
});
