import { simpleFaker } from "@faker-js/faker";
import { Manager as TournamentManager } from 'tournament-organizer/components';
import { createCompetition } from "../Competitions/CompetitionUtilities";
import { createSeasonCalendar } from "../Common/scheduler";
import { Calendar } from "../Common/CommonTypes";
import {
  Competition,
  BaseCompetitions,
} from "../Competitions/CompetitionTypes";
import { Save } from "./SaveTypes";

export const createSave = async(
  Name: string,
  Country: string,
  MainCompetition: string,
  startingSeason: string,
  firstDay: string,
  Club: string,
  countriesLeaguesClubs: BaseCompetitions,
): Promise<Save> => {
  const allCompetitions: Record<
    string,
    Record<string, Competition>
  > = Object.fromEntries(
    Object.entries(countriesLeaguesClubs).map(([country, competitions]) => {
      return [
        country,
        Object.fromEntries(
          Object.entries(competitions).map(([competitionName, clubs]) => {
            return [
              competitionName,
              createCompetition(competitionName, startingSeason, clubs),
            ];
          }),
        ),
      ];
    }),
  );

  const [calendar, scheduleManager] = await createSeasonCalendar(allCompetitions,
      startingSeason);

  return {
    Name,
    Country,
    MainCompetition,
    Club,
    Seasons: 1,
    CurrentSeason: startingSeason,
    CurrentDate: new Date(firstDay),
    allCompetitions,
    saveID: simpleFaker.string.numeric(4),
    calendar,
    scheduleManager
  };
};
