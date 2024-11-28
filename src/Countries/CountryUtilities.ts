import { simpleFaker } from "@faker-js/faker";
import { mapValues } from "lodash/fp";
import { Competition } from "../Competitions/CompetitionTypes";
import { Player } from "../Players/PlayerTypes";
import { Club } from "../Clubs/ClubTypes";
import { StatisticsType, StatisticsObject } from '../Common/CommonTypes'
import { Country, BaseCountries } from "./CountryTypes";
import { createCompetition } from "../Competitions/CompetitionUtilities";
import {
  entityObjectsReducer,
  entityObjectsCreator,
  entityReferencesCreator,
} from "../Common/simulationUtilities";


const countryStatistics: StatisticsObject = {
  Wins: 0,
  Draws: 0,
  Losses: 0,
  GoalsFor: 0,
  GoalsAgainst: 0,
  GoalDifference: 0,
  Points: 0,
  MatchesPlayed: 0,
  Minutes: 0,
  NonPenaltyGoals: 0,
  PenaltyKicksMade: 0,
  PenaltyKicksAttempted: 0,
  YellowCards: 0,
  RedCards: 0,
};

export const generateCountryStatisticsObject = (
  season: string,
): StatisticsType => {
  return {
    [season]: countryStatistics,
  };
};

export const createCountry = async (
  countryName: string,
  competitions: Record<string, Record<string, string>>,
  season: string,
): Promise<
  [
    Country,
    Record<string, Competition>,
    Record<string, Club>,
    Record<string, Player>,
  ]
> => {
  const createdCompetitions: Array<
    [Competition, Record<string, Club>, Record<string, Player>]
  > = await Promise.all(
    Object.entries(competitions).map(
      async ([competitionName, competitionClubs]) => {
        return await createCompetition(
          competitionName,
          countryName,
          season,
          competitionClubs,
        );
      },
    ),
  );

  const countryCompetitions: Array<Competition> = createdCompetitions.map(
    ([competition, ...rest]) => competition,
  );
  const clubs: Array<Record<string, Club>> = createdCompetitions.map(
    ([_, club, __]) => club,
  );
  const players: Array<Record<string, Player>> = createdCompetitions.map(
    ([_, __, player]) => player,
  );

  const [
    competitionsObject,
    competitionsReference,
    clubsObject,
    playersObject,
  ] = await Promise.all([
    await entityObjectsCreator<Competition>(countryCompetitions),
    await entityReferencesCreator<Competition>(countryCompetitions),
    await entityObjectsReducer<Club>(clubs),
    await entityObjectsReducer<Player>(players),
  ]);

  const countryObject: Country = {
    ID: simpleFaker.string.numeric(4),
    Name: countryName,
    Statistics: generateCountryStatisticsObject(season),
    Competitions: competitionsReference,
    CurrentSeason: season,
  };

  return [countryObject, competitionsObject, clubsObject, playersObject];
};

export const createCountries = async (
  countries: BaseCountries,
  season: string,
): Promise<
  [
    Record<string, Country>,
    Record<string, Competition>,
    Record<string, Club>,
    Record<string, Player>,
  ]
> => {
  const createdCountries: Array<
    [
      Country,
      Record<string, Competition>,
      Record<string, Club>,
      Record<string, Player>,
    ]
  > = await Promise.all(
    Object.entries(countries).map(async ([countryName, competitions]) => {
      return await createCountry(countryName, competitions, season);
    }),
  );

  const allCountries: Array<Country> = createdCountries.map(
    ([country, ...rest]) => country,
  );
  const countryCompetitions: Array<Record<string, Competition>> =
    createdCountries.map(([_, competition, ...rest]) => competition);
  const clubs: Array<Record<string, Club>> = createdCountries.map(
    ([_, __, club, ...rest]) => club,
  );
  const players: Array<Record<string, Player>> = createdCountries.map(
    ([_, __, ___, player]) => player,
  );

  const [countriesObject, competitionsObject, clubsObject, playersObject] =
    await Promise.all([
      await entityObjectsCreator<Country>(allCountries),
      await entityObjectsReducer<Competition>(countryCompetitions),
      await entityObjectsReducer<Club>(clubs),
      await entityObjectsReducer<Player>(players),
    ]);

  return [countriesObject, competitionsObject, clubsObject, playersObject];
};

export const createIDsForClubs = (
  countriesLeaguesClubs: Record<string, Record<string, Array<string>>>,
): BaseCountries => {
  const arrayOFClubsIDMapper = (
    clubNames: Array<string>,
  ): Record<string, string> => {
    return Object.fromEntries(
      clubNames.map((clubName: string) => [
        simpleFaker.string.numeric(6),
        clubName,
      ]),
    );
  };

  const countryClubsIDMapper = (
    country: Record<string, Array<string>>,
  ): Record<string, Record<string, string>> => {
    return mapValues(arrayOFClubsIDMapper, country);
  };

  return mapValues(countryClubsIDMapper, countriesLeaguesClubs);
};
