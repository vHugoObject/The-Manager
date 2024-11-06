import { simpleFaker } from "@faker-js/faker";
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

export const createCompetitionClubsWithGeneratedPlayers = (
  season: string,
  clubs: Array<string>,
): Array<Club> => {
  return clubs.map((clubName: string, index: number) => {
    return createClub(clubName, season);
  });
};

export const createCompetitionClubsWithGivenPlayers = (
  season: string,
  clubs: Record<string, Array<Player>>,
): Array<Club> => {
  return Object.entries(clubs).map(([clubName, players]) => {
    return createClub(clubName, season, players);
  });
};



export const createCompetition = (
  competition: string,
  season: string,
  clubs: Array<string> | Record<string, Array<Player>>,
): Competition => {

  const clubsArray: Array<Club> = Array.isArray(clubs)
    ? createCompetitionClubsWithGeneratedPlayers(
        season,
        clubs,
      )
    : createCompetitionClubsWithGivenPlayers(season, clubs);

  const clubsObjectCreator = (clubs: Array<Club>): Record<string, Club> => {
      return Object.fromEntries(
	clubs.map((club: Club) => [club.ID, club])
      )
    }
  
  const Clubs: Record<string, Club> = clubsObjectCreator(clubsArray);

  return {
    ID: simpleFaker.string.numeric(4),
    Name: competition,
    Clubs,
    Statistics: generateCompetitionStatisticsObject(season),

  };
};
