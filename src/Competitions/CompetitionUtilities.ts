import { simpleFaker } from "@faker-js/faker";
import { reduce, merge } from 'lodash/fp'
import { createClub } from "../Clubs/ClubUtilities";
import {
  StatisticsObject,
  StatisticsType,
} from "../Common/CommonTypes";
import { Club } from "../Clubs/ClubTypes";
import { Player } from "../Players/PlayerTypes";
import { Competition } from "./CompetitionTypes";



const competitionStatistics: StatisticsObject = {
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

export const generateCompetitionStatisticsObject = (
  season: string,
): StatisticsType => {
  return {
    BySeason: { [season]: competitionStatistics },
    GameLog: {},
  };
};

export const createCompetitionClubsWithGeneratedPlayers = async(
  season: string,
  clubs: Record<string, string>,
): Promise<Array<[Club, Record<string,Player>]>> => {
  
  return await Promise.all(Object.entries(clubs)
    .map(async([clubID, clubName]) => await createClub(clubID,
      clubName, season)))
};

interface ClubsWithPlayers {
    clubName: string;
    players: Array<Player>;
}


export const createCompetition = async(  
  competition: string,
  country: string,
  season: string,
  clubs: Record<string, string> 
): Promise<[Competition, Record<string, Club>, Record<string, Player>]> => {


  
  let clubAndPlayersArray: Array<[Club, Record<string,Player>]> = await createCompetitionClubsWithGeneratedPlayers(
        season,
        clubs,
  )
  


  
  const clubObjectsCreator = async(clubs: Array<Club>): Promise<Record<string, Club>> => {
      return Object.fromEntries(
	clubs.map((club: Club) => [club.ID, club])
      )
  }

  const clubReferencesCreator = async(clubs: Array<Club>): Promise<Record<string, string>> => {
      return Object.fromEntries(
	clubs.map((club: Club) => [club.ID, club.Name])
      )
    } 

  
  const mergeFunctionForPlayer = (accumulator: Record<string, Player>,
    value: Record<string, Player>): Record<string, Player> => {
      return merge(accumulator, value)
    
    }
  
  const mergePlayerObjects = async(players: Array<Record<string,Player>>): Promise<Record<string,Player>> => {
    return reduce(mergeFunctionForPlayer, {}, players)
  }
  
  const clubsArray: Array<Club> = clubAndPlayersArray.map(([club, _]) => club)
  const playersArray: Array<Record<string,Player>> = clubAndPlayersArray.map(([_, players]) => players);  

  const [clubsObject, clubReferences, playersObject] = await Promise.all([await clubObjectsCreator(clubsArray), await clubReferencesCreator(clubsArray), await mergePlayerObjects(playersArray)])



  
  const competitionObject: Competition = {
    ID: simpleFaker.string.numeric(4),
    Name: competition,
    Country: country,
    Clubs: clubReferences,
    Statistics: generateCompetitionStatisticsObject(season)
  };
  
  return [competitionObject, clubsObject, playersObject]
};
