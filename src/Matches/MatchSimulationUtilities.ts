import {
  map,
  reverse,
  at,
  mean,
  partition,
  first,
  curry,
  last,
  tail,
  over,
  zipAll,
  identity,
  flatten,
  concat,
  mapValues,
  update,
} from "lodash/fp";
import { flowAsync, mapIndexed, updatePaths } from "futil-js";
import {
  DEFENSESTRENGTHBALANCE,
  U,
  HOMEEFFECT,
  POSSIBLEGOALS,
  THETA,
  SHAPE,
} from "./MatchConstants";
import {
  DEFENDINGSKILLS,
  GOALKEEPINGSKILLS,
  ATTACKINGSKILLS,
} from "../Players/PlayerTypes";
import {
  weightedMean,
  weightedRandom,
  convertIntegersToPercentages,
  sortTuplesByFirstValueInTuple,
  runTwoFunctionsOnATuplePair,
} from "../Common/CommonUtilities";
import { isGoalkeeperID } from "../Players/PlayerUtilities";

export const calculateMeanCategoryStrengthForPlayer = curry(
  (skills: Array<string>, player: [string, Array<number>]): number => {
    return flowAsync(last, at(skills), mean)(player);
  },
);

export const calculateMeanAttackingStrengthForPlayer =
  calculateMeanCategoryStrengthForPlayer(Object.values(ATTACKINGSKILLS));

export const calculateMeanCategoryStrengthForGroupOfPlayers = curry(
  (skills: Array<string>, players: Array<[string, Array<number>]>): number => {
    return flowAsync(
      map(calculateMeanCategoryStrengthForPlayer(skills)),
      mean,
    )(players);
  },
);

// can we drop async?
export const calculateDefenseStrength = async (
  playerSkills: Record<string, Array<number>>,
): Promise<number> => {
  const [DEFENDINGSKILLSASLIST, GOALKEEPINGSKILLSASLIST] = map(
    flowAsync(Object.values),
  )([DEFENDINGSKILLS, GOALKEEPINGSKILLS]);

  return await flowAsync(
    Object.entries,
    partition(flowAsync(first, isGoalkeeperID)),
    over([
      flowAsync(
        first,
        first,
        calculateMeanCategoryStrengthForPlayer(GOALKEEPINGSKILLSASLIST),
      ),
      flowAsync(
        tail,
        first,
        calculateMeanCategoryStrengthForGroupOfPlayers(DEFENDINGSKILLSASLIST),
      ),
    ]),
    weightedMean(DEFENSESTRENGTHBALANCE),
  )(playerSkills);
};

export const calculateAttackStrength = async (
  playerSkills: Record<string, Array<number>>,
): Promise<number> => {
  const ATTACKINGSKILLSASLIST = Object.values(ATTACKINGSKILLS);
  return await flowAsync(
    Object.entries,
    calculateMeanCategoryStrengthForGroupOfPlayers(ATTACKINGSKILLSASLIST),
  )(playerSkills);
};

export const calculateClubStrengths = flowAsync(
  over([calculateAttackStrength, calculateDefenseStrength]),
);

export const calculateHomeStrength = ([homeAttack, awayDefense]: [
  number,
  number,
]): number => {
  return Math.exp(-Math.exp(U + HOMEEFFECT + homeAttack + awayDefense));
};

export const calculateAwayStrength = ([awayAttack, homeDefense]: [
  number,
  number,
]): number => {
  return Math.exp(-Math.exp(U + awayAttack + homeDefense));
};

export const calculateMatchStrengths = flowAsync(
  map(calculateClubStrengths),
  over([flowAsync(first, identity), flowAsync(last, reverse)]),
  zipAll,
  map(convertIntegersToPercentages),
  over([
    flowAsync(first, calculateHomeStrength),
    flowAsync(last, calculateAwayStrength),
  ]),
);

export const weibullCDFGoals = curry(
  async (
    shape: number,
    clubStrength: number,
    goals: number,
  ): Promise<number> => {
    return 1 - Math.exp(-Math.pow((goals + 1) * clubStrength, shape));
  },
);

export const getBaseWeibullCDFGoals = weibullCDFGoals(SHAPE);

export const weibullCDFGoalsList = async (
  clubStrength: number,
): Promise<Array<number>> => {
  return await flowAsync(map(getBaseWeibullCDFGoals(clubStrength)))(
    POSSIBLEGOALS,
  );
};

export const calculateJointProbability = curry(
  async (
    theta: number,
    [homeProb, awayProb]: [number, number],
  ): Promise<number> => {
    return (
      Math.log(
        1 +
          ((Math.exp(-theta * homeProb) - 1) *
            (Math.exp(-theta * awayProb) - 1)) /
            (Math.exp(-theta) - 1),
      ) * -(1 / theta)
    );
  },
);

export const getBaseJointProbability = calculateJointProbability(THETA);

export const createJointProbabilitiesMatrixForGoals = async ([
  homeWeibullCDFGoalsList,
  awayWeibullCDFGoalsList,
]: [Array<number>, Array<number>]): Promise<
  Array<[number, [number, number]]>
> => {
  return await flowAsync(
    mapIndexed(
      async (
        homeProbability: number,
        homeGoals: number,
      ): Promise<Array<[number, Array<[number, number]>]>> => {
        return await flowAsync(
          mapIndexed(async (awayProbability: number, awayGoals: number) => [
            await getBaseJointProbability([homeProbability, awayProbability]),
            [homeGoals, awayGoals],
          ]),
        )(awayWeibullCDFGoalsList);
      },
    ),
    flatten,
  )(homeWeibullCDFGoalsList);
};

export const generateMatchGoals = async (
  startingElevenTuples: Array<[number, Record<string, Array<number>>]>,
): Promise<
  [
    [Record<string, Array<number>>, Record<string, Array<number>>],
    [number, number],
  ]
> => {
  const [, elevens] = zipAll(startingElevenTuples);

  return await flowAsync(
    calculateMatchStrengths,
    flowAsync(map(weibullCDFGoalsList)),
    createJointProbabilitiesMatrixForGoals,
    sortTuplesByFirstValueInTuple,
    zipAll,
    weightedRandom,
    (score: [number, number]) => concat([elevens], [score]),
  )(elevens);
};

export const assignRandomScorer = flowAsync(
  Object.entries,
  over([map(calculateMeanAttackingStrengthForPlayer), map(first)]),
  weightedRandom,
);

export const generateMatchScorers = async (
  startingElevenTuplesAndScore: [
    [Record<string, Array<number>>, Record<string, Array<number>>],
    [number, number],
  ],
): Promise<
  [
    [Record<string, Array<number>>, Record<string, Array<number>>],
    [number, number],
  ]
> => {
  return;
};
