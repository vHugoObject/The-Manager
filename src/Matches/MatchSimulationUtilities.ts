import "lodash.product";
import _ from "lodash";
import { mean, range, partial } from "lodash";
import { concat, sortBy, multiply, map, reverse } from 'lodash/fp'
import { flowAsync } from 'futil-js'
import { U, HOMEEFFECT, POSSIBLEGOALS, THETA, SHAPE, EMPTYSCOREMATRIX } from './MatchConstants' 
import { Player } from "../Players/PlayerTypes";
import { StatisticsObject } from "../Common/CommonTypes";
import { normalizePercentages, weightedMean, weightedRandom } from '../Common/CommonUtilities'
import { getGoalkeepingRating, getOutfieldPlayersDefendingRatings,
  getAttackingRatings, filterGoalkeepers
} from '../Players/PlayerUtilities'


export const calculateDefenseStrength = async(players: Array<Player>): Promise<number> => {

  let playerRatings: Array<number> = await getOutfieldPlayersDefendingRatings(players)
  const goalkeeper: Array<Player> = filterGoalkeepers(players) 

  if (goalkeeper.length == 1){
    const addGoalkeeper = concat(playerRatings)
    return await flowAsync(getGoalkeepingRating, addGoalkeeper, mean)(players)
  }

  return mean(playerRatings);
};


export const calculateAttackStrength = async(players: Array<Player>): Promise<number> => {

  return await flowAsync(getAttackingRatings, mean)(players)

};

export const convertStrengthToCoefficient = multiply(0.01)

export const calculateClubStrengths = async(players: Array<Player>): Promise<Array<number>> => {
  type calculatorFunction = (arg1: Array<Player>) => Promise<number>
  const calculators: [calculatorFunction, calculatorFunction] = [calculateDefenseStrength, calculateAttackStrength]
  return await Promise.all(calculators
    .map(async(calculator: Function): Promise<number> => await calculator(players)))
}

export const calculateAttackCoefficient = flowAsync(calculateAttackStrength, convertStrengthToCoefficient)
export const calculateDefenseCoefficient = flowAsync(calculateDefenseStrength, convertStrengthToCoefficient)

export const calculateCoefficients = async(attackingClub: Array<Player>,
  defendingClub: Array<Player>) => {
    return await Promise.all([await calculateAttackCoefficient(attackingClub),
      await calculateDefenseCoefficient(defendingClub)])
  }

export const calculateHomeStrength = async(
  homePlayers: Array<Player>,
  awayPlayers: Array<Player>
): Promise<number> => {
  const getHomeStrength = ([homeAttack, awayDefense]: [number, number]): number => {
    return Math.exp(-Math.exp(U + HOMEEFFECT + homeAttack + awayDefense));
  }

  return await flowAsync(calculateCoefficients,getHomeStrength)(homePlayers, awayPlayers)
};

export const calculateAwayStrength = async(
  homePlayers: Array<Player>,
  awayPlayers: Array<Player>
): Promise<number> => {
  const getAwayStrength = ([awayAttack, homeDefense]: [number, number]): number => {
    return Math.exp(-Math.exp(U + awayAttack + homeDefense))
  }
  return await flowAsync(calculateCoefficients, getAwayStrength)(awayPlayers, homePlayers)
};

export const calculateMatchStrengths = async(
  [homePlayers, awayPlayers]: [Array<Player>, Array<Player>]
): Promise<[number, number]> => {
  return await Promise.all([ await calculateHomeStrength(homePlayers, awayPlayers),
    await calculateAwayStrength(homePlayers, awayPlayers)
  ])
  
};

export const weibullCDFGoals = async(
  shape: number,
  clubStrength: number,
  goals: number,
): Promise<number> => {
  return 1 - Math.exp(-Math.pow((goals + 1) * clubStrength, shape));
};

export const getBaseWeibullCDFGoals = partial(weibullCDFGoals, SHAPE)

export const weibullCDFGoalsList = async(clubStrength: number): Promise<Array<number>> => {
  return await Promise.all(POSSIBLEGOALS.map(async(goals: number) => {
    return await getBaseWeibullCDFGoals(clubStrength, goals);
  }))
};


export const calculateJointProbability = async(
  theta: number,
  [homeProb, awayProb]: [number, number] 
) => {
  
  return (
    Math.log(
      1 +
        ((Math.exp(-theta * homeProb) - 1) * (Math.exp(-theta * awayProb) - 1)) /
          (Math.exp(-theta) - 1),
    ) * -(1 / theta)
  );
};

export const getBaseJointProbability = partial(calculateJointProbability, THETA)


export const getClubsScoreProbabilities = async(homeClubStrengthAndScore: [number, number],
  awayClubStrengthAndScore: [number, number],
): Promise<Array<number>> => {
  return await Promise.all([homeClubStrengthAndScore, awayClubStrengthAndScore]
    .map(async(clubStrengthAndScore: [number, number]) => {
      return await getBaseWeibullCDFGoals(...clubStrengthAndScore)
    })
  )
}

export const createJointProbabilitiesMatrixForGoals = async(
  [homeClubStrength, awayClubStrength]: [number, number]
): Promise<Array<[[number, number], number]>> => {

 return await Promise.all(EMPTYSCOREMATRIX.map(async([homeScore, awayScore]) => {

   const jointProbability = await flowAsync(getClubsScoreProbabilities,
     normalizePercentages, getBaseJointProbability)([homeClubStrength, homeScore],
     [awayClubStrength, awayScore])

       return [[homeScore, awayScore], jointProbability];
  }))

};

export const playersToJointProbabilitiesMatrixForGoals = flowAsync(calculateMatchStrengths, createJointProbabilitiesMatrixForGoals)


export const sortProbabilityMatrix = (goalsMatrix: Array<[[number, number], number]>): Array<[[number, number], number]> => {
  return sortBy(([a, b]) => b, goalsMatrix);
}

export const splitJointProbabilitiesMatrixIntoTwoLists = async(jointProbabilitiyMatrix: Array<[[number, number], number]>): Promise<(number|[number, number])[][]> => {
  const tupleLength: number = jointProbabilitiyMatrix[0].length;
  return await Promise.all(range(tupleLength).map(async(index: number) => {
    return map((value) => value[index],jointProbabilitiyMatrix)
  }))
}

export const convertJointProbabilitiesMatrixToLists = async(jointProbabilitiyMatrix: Array<[[number, number], number]>): Promise<Array<Array<number>>> => {
  const tupleLength: number = jointProbabilitiyMatrix[0].flat().length;
  return await Promise.all(range(tupleLength).map(async(index: number) => {
    return map((value) => value.flat()[index],jointProbabilitiyMatrix)
  }))
}

export const matchActualGoals = async(
  goalsMatrix: Array<[[number, number], number]>,
): Promise<[number, number]> => {

  const getScore = flowAsync(sortProbabilityMatrix, splitJointProbabilitiesMatrixIntoTwoLists,
    reverse, weightedRandom)

  return await getScore(goalsMatrix)
};



export const matchExpectedGoals = async(
  goalsMatrix: Array<[[number, number], number]>,
): Promise<Array<number>> => {

  const [homeScores, awayScores, weights] = await convertJointProbabilitiesMatrixToLists(goalsMatrix)
  return await Promise.all([homeScores, awayScores]
    .map(async(scores: Array<number>) => await weightedMean(weights, scores))
  )
};

export const matchStatistics = async(goalsMatrix: Array<[[number, number], number]>):
  Promise<[StatisticsObject, StatisticsObject]> => {
    
  const funcs = [matchActualGoals, matchExpectedGoals]
  const [[homeActualGoals,awayActualGoals], [homeExpectedGoals, awayExpectedGoals]] = await Promise.all(funcs.map(async(func) => {
    return func(goalsMatrix)
  })
  )
  return [
    {"Goals": homeActualGoals, "Expected Goals": homeExpectedGoals},
    {"Goals": awayActualGoals, "Expected Goals": awayExpectedGoals},
  ]
}

export const generateMatchStatistics = flowAsync(playersToJointProbabilitiesMatrixForGoals, matchStatistics)

