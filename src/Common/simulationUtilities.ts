import { eachDayOfInterval, addWeeks } from "date-fns";
import type { EachDayOfIntervalResult, Interval } from "date-fns";
import { reduce, merge } from 'lodash/fp'
import { CalendarEntry, Calendar } from './CommonTypes'

export const createCalendar = (start: Date): Calendar => {

  
  const end: Date = new Date("06/14/25");
  const seasonStartDate: Date = addWeeks(start,1)
  const summerTransferWindowClose: Date = new Date("08/30/24");
  const winterTransferWindowOpen: Date = new Date("01/01/25");
  const winterTransferWindowClose: Date = new Date("02/03/25");
  
  const allDatesInterval: Interval  = {
    start,
    end
    
  }

  const summerTransferWindowInterval: Interval  = {
    start,
    end: summerTransferWindowClose
  }

  
  const winterTransferWindowInterval: Interval  = {
    start: winterTransferWindowOpen,
    end: winterTransferWindowClose
    
  }
      

  const seasonStartDateValues: CalendarEntry = { 
      matches: [],
      seasonStartDate: true,
      seasonEndDate: false,
      transferWindowOpen: true
    };

  const seasonEndDateValues: CalendarEntry  = {
      matches: [],
      seasonStartDate: false,
      seasonEndDate: true,
      transferWindowOpen: false
    };

  const transferWindowOpenValues: CalendarEntry = {
      matches: [],
      seasonStartDate: false,
      seasonEndDate: false,
      transferWindowOpen: true
    };

  const transferWindowClosedValues: CalendarEntry  = {
      matches: [],
      seasonStartDate: false,
      seasonEndDate: false,
      transferWindowOpen: false
  };

  const addDayValues = (interval: EachDayOfIntervalResult<Interval, undefined>,
    dayValues: CalendarEntry) => {
    return Object.fromEntries(
      interval.map((date: Date) => [date.toDateString(), dayValues])
  )
  }

  const mergeIntervals = (accumulator: Calendar, value: Calendar): Calendar => {
    return merge(accumulator, value)
  };

  const createCalendarSection = (interval: Interval, dayValues: CalendarEntry): Calendar => {
    const fullDateRange: EachDayOfIntervalResult<Interval, undefined> = eachDayOfInterval(interval)
    return addDayValues(fullDateRange, dayValues)
  }
  

  const emptyCalendar: Calendar = createCalendarSection(allDatesInterval, transferWindowClosedValues)
  const summerTransferWindow: Calendar = createCalendarSection(summerTransferWindowInterval, transferWindowOpenValues)
  const winterTransferWindow: Calendar = createCalendarSection(winterTransferWindowInterval, transferWindowOpenValues)
  
  const seasonFirstDay: Calendar  = {[seasonStartDate.toDateString()]: seasonStartDateValues}
  const seasonEndDay: Calendar = {[end.toDateString()]: seasonEndDateValues}
  const calendarSections: Array<Calendar> = [summerTransferWindow,
    winterTransferWindow, seasonFirstDay, seasonEndDay
  ]


  return reduce(mergeIntervals, emptyCalendar, calendarSections)

};



export const totalDoubleRoundRobinGames = (clubs: number): number => {
  return 2*(clubs/2 * (clubs - 1))
}


export const advanceOneDay = () => {}
