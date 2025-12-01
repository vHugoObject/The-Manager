import React from "react";
import { fc, test } from "@fast-check/vitest";
import { cleanup, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import { zipWith, forEach } from "lodash/fp";
import { setup } from "../../UITestingUtilities";
import {
  fastCheckGenerateRandomBaseCountries,
  fastCheckTestCompletelyRandomBaseClub,  
} from "../../../GameLogic/TestDataGenerators";
import { convertClubRelativeIndexIntoAbsoluteNumber } from "../../../GameLogic/Transformers";
import {
  BasicClubStatus
} from "../ClubStatus"

describe("ClubStatus", async () => {
  test("BasicClubStatus", async () => {
    await fc.assert(
      fc
        .asyncProperty(fc.gen(), fc.array(fc.integer(), {minLength: 7, maxLength: 7}), async (fcGen, testNumbers) => {
	  
	  const [testWins, testDraws, testLosses, testAvgAttendance, testRevenue, testProfit, testCash] = testNumbers

	  const testBaseCountries = fastCheckGenerateRandomBaseCountries(fcGen);

	  const [testClubPath, [,,expectedClubName]] = fastCheckTestCompletelyRandomBaseClub(fcGen, testBaseCountries)
	  
	  const testClubNumber: number = convertClubRelativeIndexIntoAbsoluteNumber(testClubPath)
	  
	  const testClubRecord: string = `${testWins}-${testDraws}-${testLosses}`
	  const testBasicClubDetails: [number, string] = [testClubNumber, testClubRecord]
	  const testClubFinances: Array<number> = [
	    testAvgAttendance,
	    testRevenue,
	    testProfit,
	    testCash
	  ]
	  
	  const expectedClubFinanceNames: Array<string> = [
	    "Average Attendance",
	    "Revenue",
	    "Profit",
	    "Cash"
	  ]

	  const expectedValueCreator =  (expectedValueName: string, expectedValue: number): string => `${expectedValueName}: ${expectedValue}`

	  const expectedFinances: Array<string> = zipWith(expectedValueCreator, expectedClubFinanceNames, testClubFinances)
	  
          const TestElement = () => {
            return (
              <div>
                <BasicClubStatus baseCountries={testBaseCountries} clubDetails={testBasicClubDetails} clubFinances={testClubFinances} />
              </div>
            );
          };

          setup(<TestElement />);

	  expect(screen.getByText(testClubRecord)).toBeTruthy();
	  expect(screen.getByText(expectedClubName)).toBeTruthy();
	  forEach((expectedFinanceDetail: string): void => {
	    expect(screen.getByText(expectedFinanceDetail)).toBeTruthy();
	  })(expectedFinances)
	  


          
        })
        .beforeEach(async () => {
          cleanup();
        }),
      { numRuns: 10 },
    );
  });

});
