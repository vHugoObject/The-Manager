import { describe, expect, test } from "vitest";
import { differenceInDays, isBefore, isAfter } from "date-fns";
import type { EachDayOfIntervalResult, Interval } from "date-fns";
import { CalendarEntry, Calendar } from '../CommonTypes'
import { createCalendar, advanceOneDay, totalDoubleRoundRobinGames } from "../simulationUtilities";


describe("simulationUtilities test suite", () => {
  test("test createCalendar",  () => {
    
    const testFirstDay: Date = new Date("08/11/24");
    const expectedSeasonStartDate: Date = new Date("08/18/24");
    const expectedSeasonEndDate: Date = new Date("06/14/25");
    
    const expectedSummerTransferWindowCloseDate: Date = new Date("08/30/24");
    const expectedWinterTransferWindowOpenDate: Date = new Date("01/01/25");
    const expectedWinterTransferWindowCloseDate: Date = new Date("02/03/25");
    
    const expectedDays: number = differenceInDays(expectedSeasonEndDate, testFirstDay) + 1
    
    const expectedSeasonStartDateValues: CalendarEntry = { 
      matches: [],
      seasonStartDate: true,
      seasonEndDate: false,
      transferWindowOpen: true
    };

    const expectedSeasonEndDateValues: CalendarEntry  = {
      matches: [],
      seasonStartDate: false,
      seasonEndDate: true,
      transferWindowOpen: false
    };

    const expectedTransferWindowOpenValues: CalendarEntry = {
      matches: [],
      seasonStartDate: false,
      seasonEndDate: false,
      transferWindowOpen: true
    };

    const expectedTransferWindowClosedValues: CalendarEntry  = {
      matches: [],
      seasonStartDate: false,
      seasonEndDate: false,
      transferWindowOpen: false
    };
    
    const actualCalendar: Calendar = createCalendar(testFirstDay);
    


    expect(Object.keys(actualCalendar).length).toBe(expectedDays)
    expect(Object.keys(actualCalendar)[0]).toBe(testFirstDay.toDateString())
    expect(Object.keys(actualCalendar)[expectedDays-1]).toBe(expectedSeasonEndDate.toDateString())
    expect(actualCalendar[expectedSeasonStartDate.toDateString()]).toStrictEqual(expectedSeasonStartDateValues)
    expect(actualCalendar[expectedSeasonEndDate.toDateString()]).toStrictEqual(expectedSeasonEndDateValues)

    
    Object.entries(actualCalendar)
      .forEach(([date, dateValues]) => {
	const currentDate: Date = new Date(date);
	if (isBefore(currentDate, expectedSeasonStartDate)){	
	    expect(dateValues).toStrictEqual(expectedTransferWindowOpenValues)
	  }		
	
	if (isAfter(currentDate, expectedSeasonStartDate)
	  && isBefore(currentDate, expectedSummerTransferWindowCloseDate)) {
	    expect(dateValues).toStrictEqual(expectedTransferWindowOpenValues)
	  }
	
	if (isAfter(currentDate, expectedSummerTransferWindowCloseDate)
	  && isBefore(currentDate, expectedWinterTransferWindowOpenDate)) {
	    expect(dateValues).toStrictEqual(expectedTransferWindowClosedValues)
	  }
	
	if (isAfter(currentDate, expectedWinterTransferWindowOpenDate)
	  && isBefore(currentDate, expectedWinterTransferWindowCloseDate)) {
	    expect(dateValues).toStrictEqual(expectedTransferWindowOpenValues)
	  }


	if (isAfter(currentDate, expectedWinterTransferWindowCloseDate) &&
	  isBefore(currentDate, expectedSeasonEndDate)){
	    expect(dateValues).toStrictEqual(expectedTransferWindowClosedValues)
	}

      })

    
    
  })

  test("totalDoubleRoundRobinGames",  () => {

    const tests: Array<[number, number]> = [[4,12],[6, 30], [18, 306], [20,380]]
    tests.forEach(([clubs, expectedValue]) => {
      const actualValue: number = totalDoubleRoundRobinGames(clubs)
      expect(actualValue).toBe(expectedValue)
    });

    
  });

  
  
  test("advanceOneDays",  () => {
   
  });
});
