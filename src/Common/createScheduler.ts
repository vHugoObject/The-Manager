import { reduce, merge } from 'lodash/fp'
import {
  Manager as TournamentManager,
  Player as TournamentPlayer,
    Match as TournamentMatch,
    Tournament
} from 'tournament-organizer/components';

import {
    LoadableTournamentValues,
    MatchValues,
    PlayerValues,
    SettableMatchValues,
    SettablePlayerValues,
    SettableTournamentValues,
    StandingsValues,
    TournamentValues
} from 'tournament-organizer/interfaces';
import { Club } from "../Clubs/ClubTypes";
import { Competition, AllCompetitions } from '../Competitions/CompetitionTypes';

export const createScheduler = async(allCompetitions: AllCompetitions): Promise<TournamentManager> => {
  
  const scheduler: TournamentManager = new TournamentManager();
  const createTournamentClubs = (clubs: Record<string, Club>): Array<TournamentPlayer> => {
    return Object.values(clubs).map((club: Club) => {
      return new TournamentPlayer(club.ID, club.Name)
    }
    )
  }
  
  const createTournament = (scheduler: TournamentManager,
    competition: Competition): void => {
      const scoring: Record<string, number> = {
	win: 3,
	draw: 1,
	loss: 0,
	bye: 2
      }
      
      const tournamentValues: SettableTournamentValues = {
	players: createTournamentClubs(competition.Clubs),
	stageOne: {format: 'round-robin'},
	sorting: "descending",
	scoring
      }      
      scheduler.createTournament(competition.Name, tournamentValues, competition.ID).start()    
    }

  
  const mergeComps = (accumulator: Record<string, Competition>,
    value: Record<string, Competition>): Record<string, Competition> => {
      return merge(accumulator, value)
    
  }
  
  const competitions: Record<string, Competition> = reduce(mergeComps, {}, Object.values(allCompetitions))

  Promise.all(Object.values(competitions).map((competition: Competition) => createTournament(scheduler, competition)))
 
 
  return scheduler
}
