import "lodash.product";
import _ from "lodash";
import { sum } from "lodash";
import { Player, PositionGroup } from "../Players/PlayerTypes";
import { StatisticsObject } from "../Common/CommonTypes";

export const calculateDefenseStrength = (players: Array<Player>): number => {
  const defenseCategories = new Set([
    "defenseSkills",
    "mentalSkills",
    "physicalSkills",
  ]);

  const goalkeepingCategories = new Set([
    "defenseSkills",
    "mentalSkills",
    "physicalSkills",
    "goalkeepingSkills",
  ]);

  const averageByCategory = (
    player: Player,
    categories: Set<string>,
  ): Array<number> => {
    return Object.entries(player.Skills)
      .filter(([key, value]) => categories.has(key))
      .map(
        ([key, value]) =>
          sum(Object.values(value)) / Object.values(value).length,
      );
  };

  const playerRating = (player: Player, categories: Set<string>): number => {
    return sum(averageByCategory(player, categories)) / categories.size;
  };
  

  const outfieldPlayerDefenseRatings: Array<number> = players
    .filter((player) => player.PositionGroup != PositionGroup.Goalkeeper)
    .map((player: Player) => {
      return playerRating(player, defenseCategories);
    });

  const goalkeeper: Player = players.filter(
    (player) => player.PositionGroup == PositionGroup.Goalkeeper,
  )[0];
  

  let playerRatings: Array<number> = goalkeeper ? outfieldPlayerDefenseRatings.concat(playerRating(
    goalkeeper,
    goalkeepingCategories,
  )) : outfieldPlayerDefenseRatings


  return (
    sum(playerRatings) / players.length
  );
};

export const calculateAttackStrength = (players: Array<Player>): number => {
  const attackCategories = new Set([
    "ballSkills",
    "mentalSkills",
    "physicalSkills",
    "passingSkills",
    "shootingSkills",
  ]);

  const averageByCategory = (
    player: Player,
    categories: Set<string>,
  ): Array<number> => {
    return Object.entries(player.Skills)
      .filter(([key, _]) => categories.has(key))
      .map(([_, value]) => {
        return sum(Object.values(value)) / Object.values(value).length;
      });
  };

  const playerRating = (player: Player, categories: Set<string>): number => {
    return sum(averageByCategory(player, categories)) / categories.size;
  };

  const allAttackRatings: Array<number> = players.map((player: Player) => {
    return playerRating(player, attackCategories);
  });

  return sum(allAttackRatings) / players.length;
};

export const calculateHomeStrength = (
  homeAtt: number,
  awayDef: number,
): number => {
  const U = -1.035;
  const HOMEEFFECT = 0.383;
  const homeAttack: number = homeAtt * 0.01;
  const awayDefense: number = awayDef * 0.01;
  return Math.exp(-Math.exp(U + HOMEEFFECT + homeAttack + awayDefense));
};

export const calculateAwayStrength = (
  awayAtt: number,
  homeDef: number,
): number => {
  const U = -1.035;
  const awayAttack: number = awayAtt * 0.01;
  const homeDefense: number = homeDef * 0.01;
  return Math.exp(-Math.exp(U + awayAttack + homeDefense));
};

export const weibullCDFGoals = (
  shape: number,
  teamStrength: number,
  goals: number,
): number => {
  return 1 - Math.exp(-Math.pow((goals + 1) * teamStrength, shape));
};

export const weibullCDFGoalsList = (teamStrength: number): Array<number> => {
  const possibleGoals: Array<number> = [0, 1, 2, 3, 4, 5];
  const shape: number = 1.864;
  return possibleGoals.map((goals: number) => {
    return weibullCDFGoals(shape, teamStrength, goals);
  });
};

export const calculateJointProbability = (
  homeProb: number,
  awayProb: number,
  theta: number,
) => {
  const home = homeProb;
  const away = awayProb;
  return (
    Math.log(
      1 +
        ((Math.exp(-theta * home) - 1) * (Math.exp(-theta * away) - 1)) /
          (Math.exp(-theta) - 1),
    ) * -(1 / theta)
  );
};

export const createJointProbabilitiesMatrixForGoals = (
  homeTeamStrength: number,
  awayTeamStrength: number,
): Array<[[number, number], number]> => {
  const theta: number = 0.562;
  const shape: number = 1.864;
  const possibleGoals: Array<number> = [0, 1, 2, 3, 4, 5];
  const scoreMatrix: Array<number[]> = _.product(possibleGoals, possibleGoals);

  const normalizePercentages = (percentages: Array<number>): Array<number> => {
    const sumOfPercentages: number = sum(percentages);
    return percentages.map((percent: number) => percent / sumOfPercentages);
  };

  return scoreMatrix.map(([homeScore, awayScore]) => {
    const homeProb: number = weibullCDFGoals(
      shape,
      homeTeamStrength,
      homeScore,
    );
    const awayProb: number = weibullCDFGoals(
      shape,
      awayTeamStrength,
      awayScore,
    );

    const [normalizedHomeProb, normalizedAwayProb] = normalizePercentages([
      homeProb,
      awayProb,
    ]);
    const jointProbability: number = calculateJointProbability(
      normalizedHomeProb,
      normalizedAwayProb,
      theta,
    );
    return [[homeScore, awayScore], jointProbability];
  });
};

export const randomScore = (
  scoreMatrix: Array<[[number, number], number]>,
): [number, number] => {
  const sortedScoreMatrix = scoreMatrix.sort((a, b) => b[1] - a[1]);

  const weights: Array<number> = sortedScoreMatrix.map(
    ([_, probability]) => probability,
  );
  const weightedRandom = (items: any[], weights: number[]) => {
    const initialValue: number = 0;
    const cumulativeWeights: number[] = [];
    const _: number = weights.reduce((accumulator, currentValue) => {
      accumulator += currentValue;
      cumulativeWeights.push(accumulator);
      return accumulator;
    }, initialValue);

    const maxCumulativeWeight: number = Math.max(...cumulativeWeights);
    const randomNumber: number = maxCumulativeWeight * Math.random();
    const randomIndex: number = cumulativeWeights.findIndex(
      (weight) => weight >= randomNumber,
    );
    return items[randomIndex];
  };

  return weightedRandom(sortedScoreMatrix, weights)[0];
};

export const matchExpectedGoals = (
  scoreMatrix: Array<[[number, number], number]>,
): [number, number] => {
  const weightedMean = (arrValues: number[], arrWeights: number[]) => {
    // add normalizePercentages,
    const weightSum: number = sum(arrWeights);
    const normalizedWeights: Array<number> = arrWeights.map(
      (weight) => weight / weightSum,
    );
    const result = arrValues
      .map((value, i) => {
        const weight = normalizedWeights[i];
        const sum = value * weight;
        return [sum, weight];
      })
      .reduce((p, c) => [p[0] + c[0], p[1] + c[1]], [0, 0]);

    return result[0] / result[1];
  };

  let homeScores: Array<number> = [];
  let awayScores: Array<number> = [];
  let weights: Array<number> = [];
  let _ = scoreMatrix.forEach(([score, probability]) => {
    homeScores.push(score[0]);
    awayScores.push(score[1]);
    weights.push(probability);
  });

  const homeExpectedGoals: number = weightedMean(homeScores, weights);
  const awayExpectedGoals: number = weightedMean(awayScores, weights);
  return [homeExpectedGoals, awayExpectedGoals];
};

export const createEmptyMatchStatistics = (): StatisticsObject => {
  const teamStatistics: Array<string> = [
    "Possession",
    "Shots on target",
    "Expected Goals",
    "Saves",
    "Fouls",
    "Corners",
    "Crosses",
    "Touches",
    "Tackles",
    "Interceptions",
    "Aerials Won",
    "Clearances",
    "Offsides",
    "Goal Kicks",
    "Throw Ins",
    "Long Balls",
  ];
  return Object.fromEntries(
    teamStatistics.map((header) => [header.replace(/\s/g, ""), 0]),
  );
};
