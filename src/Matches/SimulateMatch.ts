import { Match, SquadStatus, GoalMatrix, MatchScore } from './MatchTypes'
import { StatisticsObject } from '../Common/CommonTypes';
import { Player } from '../Players/PlayerTypes';
import { randomScore, calculateDefenseStrength,
  calculateAttackStrength, calculateHomeStrength,
  calculateAwayStrength, createJointProbabilitiesMatrixForGoals,
  matchExpectedGoals, createEmptyMatchStatistics
} from './MatchUtilities'
import { merge } from 'lodash/fp'

export const simulateMatch = async(match: Match): Promise<Match> => {

  const calculateStrengths = (homePlayers: Array<Player>,
    awayPlayers: Array<Player>
  ): [number, number] => {
    const homeAttack: number = calculateAttackStrength(homePlayers);    
    const homeDefense: number = calculateDefenseStrength(homePlayers);
    const awayAttack: number = calculateAttackStrength(awayPlayers);
    const awayDefense: number = calculateDefenseStrength(awayPlayers);
    const homeStrength: number = calculateHomeStrength(homeAttack, awayDefense);
    const awayStrength: number = calculateAwayStrength(awayAttack, homeDefense);    
    return [homeStrength, awayStrength];
  }

  
  const createMatchScore = (scoreBoard: MatchScore, scores: [number, number]): MatchScore => {
    return Object.fromEntries(
      Object.keys(scoreBoard)
	.map((side: string, index: number) => [side, scores[index]])
    )
  }

  
  const [homeStrength, awayStrength] = calculateStrengths(match.HomeSquad.onField, match.AwaySquad.onField);

  const goalMatrix: GoalMatrix = createJointProbabilitiesMatrixForGoals(homeStrength, awayStrength);

  const finalScore: [number, number] = randomScore(goalMatrix);
  const matchScore: Record<string, number> = createMatchScore(match.MatchScore,finalScore);  
  const [homeExpectedGoals, awayExpectedGoals]: [number, number] = matchExpectedGoals(goalMatrix);

  const homeStats: StatisticsObject = merge(createEmptyMatchStatistics(), {
    "Expected Goals" : homeExpectedGoals,
  })

  const awayStats: StatisticsObject = merge(createEmptyMatchStatistics(), {
    "Expected Goals" : awayExpectedGoals,
  })
  
 
  return merge(match, {Simulated: true,
    MatchScore: matchScore, 
    HomeOverallStatistics: homeStats,
    AwayOverallStatistics: awayStats
  })
}
