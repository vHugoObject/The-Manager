import {
  isEqual,
  filter,
  partial,
  property,
  map,
  reduce,
  over,
  first,
  identity,
  range,
  concat,
  zipObject,
  update,
  add,
  multiply,
  subtract,
  flatten,
  mean,
  curry,
  size,
  flattenDepth
} from "lodash/fp";
import { flowAsync } from "futil-js";
import { Player, PositionType, PositionGroup, Goalkeeper } from "./PlayerTypes";
import { BaseEntities } from "../Common/CommonTypes"
import { POSITIONS, GOALKEEPINGSKILLS, DEFENDINGSKILLS, ATTACKINGSKILLS } from "./PlayerBioConstants";
import { PLAYERSKILLSANDPHYSICALDATAKEYS, PLAYERSKILLSANDPHYSICALDATARANGESBYPOSITION, PLAYERSKILLSANDPHYSICALDATARANDOMPLUSORMINUS } from "./PlayerDataConstants";
import { modularAddition, BASECLUBCOMPOSITION, addOne } from "../Common/index";


export const isGoalkeeper = isEqual(PositionGroup.Goalkeeper);
export const isDefender = isEqual(PositionGroup.Defender);
export const isMidfielder = isEqual(PositionGroup.Midfielder);
export const isAttacker = isEqual(PositionGroup.Attacker);

export const playerIsGoalkeeper = (player: Player): boolean =>
  isGoalkeeper(player.PositionGroup);
export const playerIsNotGoalkeeper = (player: Player): boolean =>
  !isGoalkeeper(player.PositionGroup);
export const playerIsDefender = (player: Player): boolean =>
  isDefender(player.PositionGroup);
export const playerIsMidfielder = (player: Player): boolean =>
  isMidfielder(player.PositionGroup);
export const playerIsAttacker = (player: Player): boolean =>
  isAttacker(player.PositionGroup);

export const filterGoalkeepers = filter(playerIsGoalkeeper);
export const filterDefenders = filter(playerIsDefender);
export const filterMidfielders = filter(playerIsMidfielder);
export const filterAttackers = filter(playerIsAttacker);
export const filterOutfieldPlayers = filter(playerIsNotGoalkeeper);

export const getPlayerSkills = async (
  player: Player,
): Promise<Record<string, number>> => property(["Skills"])(player);

export const getListOfPlayerSkills = async (
  players: Array<Player>,
): Promise<Array<Record<string, number>>> => {
  return await Promise.all(
    players.map(async (player: Player) => getPlayerSkills(player)),
  );
};

//stubbed
export const getAverageOfSetOfSkillCategories = async (
  skillCategories: Set<string>,
  skills: Record<string, number>,
): Promise<number> => {
  return 1;
};
//stubbed
export const getListOfAveragesOfSetOfSkillCategories = async (
  skillCategories: Set<string>,
  listOfSkillSets: Array<Record<string, number>>,
): Promise<Array<number>> => {
  return [];
};
export const goalkeepingRating = partial(
  getListOfAveragesOfSetOfSkillCategories,
  [GOALKEEPINGSKILLS],
);
export const outfieldPlayersDefendingRatings = partial(
  getListOfAveragesOfSetOfSkillCategories,
  [DEFENDINGSKILLS],
);

export const attackingRatings = partial(
  getListOfAveragesOfSetOfSkillCategories,
  [ATTACKINGSKILLS],
);

export const getGoalkeepingRating = flowAsync(
  getListOfPlayerSkills,
  goalkeepingRating,
);
export const getOutfieldPlayersDefendingRatings = flowAsync(
  filterOutfieldPlayers,
  getListOfPlayerSkills,
  outfieldPlayersDefendingRatings,
);
export const getAttackingRatings = flowAsync(
  getListOfPlayerSkills,
  attackingRatings,
);

//everything above here needs to be rewritten

export const getRandomNumberInRange = async ([min, max]: [
  number,
  number,
]): Promise<number> => {
  const minCeiled = Math.ceil(min),
	maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

export const getRandomNumberInRanges = flowAsync(map(getRandomNumberInRange));

export const getRandomPlusOrMinus = flowAsync(
  over([multiply(-1),identity]),
  getRandomNumberInRange
)

export const getStepForASetOfModularRanges = flowAsync(
  map(([min, max]: [number, number]) => max - min),
  mean,
  Math.ceil,
)


export const getStepForASetOfModularRangesWithRandomPlusOrMinus = async(plusOrMinus: number, ranges: Array<[number, number]>) => {
  const randomPlusOrMinus: number = await getRandomPlusOrMinus(plusOrMinus)
  return flowAsync(getStepForASetOfModularRanges, add(randomPlusOrMinus))(ranges)
}

export const boundedModularAddition = curry(([[rangeMin, rangeMax], standardIncrease]:[[number, number], number], currentNumber: number): number => {
  return add(
    subtract(
      add(standardIncrease, currentNumber),
      rangeMin,
    ) % subtract(rangeMax, rangeMin),
    rangeMin,
  )
})

export const mapModularIncreasers = curry(async(plusOrMinus: number, ranges: Array<[number, number]>) => {
  const standardIncrease: number = await getStepForASetOfModularRangesWithRandomPlusOrMinus(plusOrMinus, ranges)
  return map((range: [number, number]) => {
    return boundedModularAddition([range, standardIncrease])
  })(ranges)
})


export const generateDataForAGroupOfPlayers = curry(async ([rangeNames, ranges, plusOrMinus]:
[Array<string>, Array<[number, number]>, number],[
  positionGroup,
  count,
  startingIndex,
]: [PositionGroup, number, number]): Promise<
  Array<[string, Record<string, number>]>
> => {
  
  const [modularIncreasers, minOfRangesOnly] = await flowAsync(
    over([mapModularIncreasers(plusOrMinus), map(first)]),
  )(ranges);
  
  const modularAdditionFuncForListOfRanges = modularAddition(
    minOfRangesOnly.length,
  );

  return flowAsync(
    reduce(
      (
        [playerData, currentRange, indexToUpdate]: [
          Array<[string, Record<string, number>]>,
          Array<number>,
          number,
        ],
        playerNumber: number,
      ): [Array<[string, Record<string, number>]>, Array<number>, number] => {
        const updatedSkillRange = update(
          indexToUpdate,
          property(indexToUpdate, modularIncreasers),
          currentRange,
        );
        return [
          concat(playerData, [
            [
              `${positionGroup}_${addOne(playerNumber)}`,
              zipObject(rangeNames, currentRange),
            ],
          ]),
          updatedSkillRange,
          modularAdditionFuncForListOfRanges(indexToUpdate),
        ];
      },
      [[], minOfRangesOnly, 0],
    ),
    first,
  )(range(startingIndex, startingIndex + count));
});

export const generateSkillsAndPhysicalDataForMultiplePositionGroups = flowAsync(
  map(generateDataForAGroupOfPlayers([PLAYERSKILLSANDPHYSICALDATAKEYS, PLAYERSKILLSANDPHYSICALDATARANGESBYPOSITION, PLAYERSKILLSANDPHYSICALDATARANDOMPLUSORMINUS])),
  flatten,
  Object.fromEntries,
);


// can't export getClubs and flattenClubs?
export const generatePlayerSkillsForListOfClubs = (startingIndex: number, entities: BaseEntities) => {
  return flowAsync(
    property(["clubs"]),
    flattenDepth(2),
    size,
    (totalClubs: number) => {
      return map(([positionGroup, count]: [PositionGroup, number]): [PositionGroup, number, number] => [
	positionGroup,
	multiply(count, totalClubs),
	startingIndex
      ])(BASECLUBCOMPOSITION)
    },
    generateSkillsAndPhysicalDataForMultiplePositionGroups
  )(entities);

}


