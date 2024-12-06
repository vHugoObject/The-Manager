import { simpleFaker } from "@faker-js/faker";
import { mergeAll } from "lodash/fp";
import { BaseCountries } from "../Countries/CountryTypes";
import { Save, ClubReference } from "./SaveTypes";
import { Entity } from "../Common/CommonTypes";
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

  const Entities: Record<string, Entity> = mergeAll([
    allCountries,
    allCompetitions,
    allClubs,
    allPlayers,
  ]);

  return {
    Name,
    Country,
    MainCompetition,
    Club,
    Seasons: 1,
    CurrentSeason: startingSeason,
    CurrentDate: new Date(Object.keys(calendar)[0]),
    Entities,
    EntityStatistics: {},
    saveID: simpleFaker.string.numeric(4),
    calendar,
    scheduleManager,
  };
};
