import { simpleFaker } from "@faker-js/faker";
import { BaseCountries } from "../Countries/CountryTypes";
import { Save, ClubReference } from "./SaveTypes";
import { createCountries } from "../Countries/CountryUtilities";
import { createSeasonCalendar } from "../Common/scheduler";

export const createSave = async (
  Name: string,
  Country: string,
  MainCompetition: string,
  startingSeason: string,
  Club: ClubReference,
  countriesLeaguesClubs: BaseCountries,
): Promise<Save> => {
  const [allCountries, allCompetitions, allClubs, allPlayers] =
    await createCountries(countriesLeaguesClubs, startingSeason);

  const [calendar, scheduleManager] = await createSeasonCalendar(
    allCompetitions,
    startingSeason,
  );

  const CurrentDate: Date = new Date(Object.keys(calendar)[0]);

  return {
    Name,
    Country,
    MainCompetition,
    Club,
    Seasons: 1,
    CurrentSeason: startingSeason,
    CurrentDate,
    countriesLeaguesClubs,
    allCountries,
    allCompetitions,
    allClubs,
    allPlayers,
    allMatches: {},
    saveID: simpleFaker.string.numeric(4),
    calendar,
    scheduleManager,
  };
};
