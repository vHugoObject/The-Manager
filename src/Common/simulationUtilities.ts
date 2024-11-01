import { addDays, eachDayOfInterval } from "date-fns";

export const createCalendar = (start: Date) => {
  const end: Date = new Date("06/14/25");
  const intervalObject  = {
    start,
    end
    
  }
  const dayValue = {matches: []}
  const fullDateRange = eachDayOfInterval(intervalObject)
  return Object.fromEntries(
    fullDateRange.map((date: Date) => [date, dayValue])
  )
};




export const advanceNDays = () => {};
