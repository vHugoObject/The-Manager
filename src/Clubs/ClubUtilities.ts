import { simpleFaker } from "@faker-js/faker";
import { range } from "lodash";
import {
  StatisticsObject,
  StatisticsType,
} from "../Common/CommonTypes";
import { Player, PositionGroup } from "../Players/PlayerTypes";
import { createPlayer } from "../Players/PlayerUtilities";
import { Club } from "./ClubTypes";



const clubStatistics: StatisticsObject = {
  Wins: 0,
  Draws: 0,
  Losses: 0,
  GoalsFor: 0,
  GoalsAgainst: 0,
  GoalDifference: 0,
  Points: 0,
  Record: "",
  HomeRecord: "",
  AwayRecord: "",
  DomesticCompetition: "",
  DomesticCups: "",
  ContinentalCup: "",
  MatchesPlayed: 0,
  Minutes: 0,
  NonPenaltyGoals: 0,
  PenaltyKicksMade: 0,
  PenaltyKicksAttempted: 0,
  YellowCards: 0,
  RedCards: 0,
};

export const generateClubStatisticsObject = (
  season: string,
): StatisticsType => {
  return {
    BySeason: { [season]: clubStatistics },
    GameLog: {},
  };
};

export const generateSquad = (
  club: string,
  teamID: string,
  season: string,
): Array<Player> => {

  const goalies = range(4).map((_) => {
    return createPlayer(
      PositionGroup.Goalkeeper,
      season,
      club,
    );
  });

  const defenders = range(7).map((_) => {
    return createPlayer(
      PositionGroup.Defender,
      season,
      club,
    );
  });

 
  const midfielders = range(7).map((_) => {
    return createPlayer(
      PositionGroup.Midfielder,
      season,
      club,
    );
  });

  const attackers = range(7).map((_) => {
    return createPlayer(
      PositionGroup.Attacker,
      season,
      club,
    );
  });

  return [goalies, defenders, midfielders, attackers].flat();
};

export const createClub = (
  name: string,
  season: string,
  players?: Array<Player>,
): Club => {

  const ID: string = simpleFaker.string.numeric(4);

  const clubPlayers: Array<Player> = players
    ? players
    : generateSquad(name, ID, season);


  const createSquadObject = (players: Array<Player>) => {
    return Object.fromEntries(players.map((player: Player) => [player.ID, player]))
  }
  
  const Squad: Record<string, Player> = createSquadObject(clubPlayers)
  
  return {
    ID,
    Name: name,
    Statistics: generateClubStatisticsObject(season),
    Squad,
    Starting11: {},
    Bench: {},
  };
};
