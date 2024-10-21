import { createCompetition } from '../Competitions/CompetitionUtilities';
import { Competition, BaseCompetitions } from '../Competitions/CompetitionTypes';
import { Save } from "./SaveTypes";

export const createSave = (
  Name: string,
  Country: string,
  MainCompetition: string,
  startingSeason: string,
  Club: string,
  countriesLeaguesClubs: BaseCompetitions
): Save => {

  
  const allCompetitions: Record<string, Record<string, Competition>> = Object.fromEntries(
    Object.entries(countriesLeaguesClubs).map(([country, competitions]) => {
      return [country, Object.fromEntries(
    Object.entries(competitions).map(([competitionName, clubs]) => {
      return [competitionName, createCompetition(
	competitionName, startingSeason, clubs
      )]
    })
      )]
    }))

  return {
    Name,    
    Country,
    MainCompetition,
    Club,
    Seasons: 1,
    CurrentSeason: startingSeason,
    allCompetitions
  }
};
