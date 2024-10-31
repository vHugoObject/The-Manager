import { describe, expect, test } from "vitest";
import { differenceInDays } from "date-fns";
import { createCalendar, advanceNDays } from "../simulationUtilities";

describe("simulationUtilities test suite", () => {

  test("test createCalendar",  () => {
    
    const testFirstDay: Date = new Date("08/11/24");
    // opening of the summer transferWindow
    const expectedLastDay: Date = new Date("06/14/25");

    const expectedDays: number = differenceInDays(expectedLastDay, testFirstDay) + 1

    const expectedValue = {matches: []};

    const actualCalendar = createCalendar(testFirstDay);

    expect(Object.keys(actualCalendar).length).toBe(expectedDays)
    
    Object.values(actualCalendar).forEach((day) => {
      expect(day).toStrictEqual(expectedValue)
    })
  })

  
  test("advanceNDays",  () => {
    const expectedOneDay: Date = new Date("08/19/24");
    const expectedOneWeek: Date = new Date("08/25/24");
    const expectedOneMonth: Date = new Date("09/18/24");
    const expectedOneYear: Date = new Date("8/19/25");
    const tests: Array<[number, Date]> = [
      [1, expectedOneDay],
      [7, expectedOneWeek],
      [31, expectedOneMonth],
      [365, expectedOneYear],
    ];
  });
});
