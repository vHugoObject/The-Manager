import { describe, expect, test } from "vitest";
import { advanceNDays } from "../simulationUtilities";

describe("simulationUtilities test suite", async () => {

  
  
  
  test("advanceNDays", async () => {

    
    const expectedOneDay: Date = new Date("08/19/24");
    const expectedOneWeek: Date = new Date("08/25/24")
    const expectedOneMonth: Date = new Date("09/18/24")
    const expectedOneYear: Date = new Date("8/19/25")
    const tests: Array<[number, Date]> = [
      [1, expectedOneDay],
      [7, expectedOneWeek],
      [31, expectedOneMonth],
      [365, expectedOneYear]
    ]


    
    
  });

})
