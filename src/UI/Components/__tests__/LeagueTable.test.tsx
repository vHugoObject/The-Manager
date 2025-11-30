import React from "react";
import { fc, test } from "@fast-check/vitest";
import { cleanup, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import { pipe, property, forEach } from "lodash/fp";
import { setup } from "../../UITestingUtilities";
import {
  fastCheckCreateTestListOfRandomMatchLogs,
  fastCheckGenerateRandomBaseCountries,
  fastCheckRandomItemFromArray,
} from "../../../GameLogic/TestDataGenerators";
import { createArrayOfLeagueTableRows } from "../../../GameLogic/Transformers";
import {
  PartialLeagueTable,
  FullLeagueTable,
  PARTIALLEAGUETABLEHEADERS,
  FULLLEAGUETABLEHEADERS,
} from "../LeagueTable";

describe("LeagueTable", async () => {
  test("PartialLeagueTable", async () => {
    await fc.assert(
      fc
        .asyncProperty(fc.gen(), async (fcGen) => {
          const testBaseCountries = fastCheckGenerateRandomBaseCountries(fcGen);

          const [testMatchLogs, , , testDomesticLeague] =
            fastCheckCreateTestListOfRandomMatchLogs(testBaseCountries, fcGen);

          const testLeagueTable = createArrayOfLeagueTableRows(
            testBaseCountries,
            testDomesticLeague,
            testMatchLogs,
          );

          const TestElement = () => {
            return (
              <div>
                <PartialLeagueTable leagueTableRows={testLeagueTable} />
              </div>
            );
          };

          setup(<TestElement />);

          forEach((expectedHeader: string): void => {
            expect(screen.getByText(expectedHeader)).toBeTruthy();
          })(PARTIALLEAGUETABLEHEADERS);

          const expectedRandomClubName: string = pipe([
            fastCheckRandomItemFromArray(fcGen),
            property("Club Name"),
          ])(testLeagueTable);
          expect(screen.getByText(expectedRandomClubName)).toBeTruthy();
        })
        .beforeEach(async () => {
          cleanup();
        }),
      { numRuns: 10 },
    );
  });
  test("FullLeagueTable", async () => {
    await fc.assert(
      fc
        .asyncProperty(fc.gen(), async (fcGen) => {
          const testBaseCountries = fastCheckGenerateRandomBaseCountries(fcGen);

          const [testMatchLogs, , , testDomesticLeague] =
            fastCheckCreateTestListOfRandomMatchLogs(testBaseCountries, fcGen);

          const testLeagueTable = createArrayOfLeagueTableRows(
            testBaseCountries,
            testDomesticLeague,
            testMatchLogs,
          );

          const TestElement = () => {
            return (
              <div>
                <FullLeagueTable leagueTableRows={testLeagueTable} />
              </div>
            );
          };

          setup(<TestElement />);

          forEach((expectedHeader: string): void => {
            expect(screen.getByText(expectedHeader)).toBeTruthy();
          })(FULLLEAGUETABLEHEADERS);

          const expectedRandomClubName: string = pipe([
            fastCheckRandomItemFromArray(fcGen),
            property("Club Name"),
          ])(testLeagueTable);
          expect(screen.getByText(expectedRandomClubName)).toBeTruthy();
        })
        .beforeEach(async () => {
          cleanup();
        }),
      { numRuns: 10 },
    );
  });
});
