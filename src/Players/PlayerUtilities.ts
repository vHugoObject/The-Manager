import { faker } from "@faker-js/faker/locale/en";
import {
  isEqual,
  filter,
  partial,
  property,
  sample,
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
  sum,
} from "lodash/fp";
import { promiseProps, flowAsync } from "futil-js";
import {
  PLAYERSKILLS,
  SKILLRANGESBYPOSITION,
  DEFENDINGSKILLS,
  GOALKEEPINGSKILLS,
  ATTACKINGSKILLS,
} from "./PlayerSkills";
import { BIORANGES, POSITIONS } from "./PlayerConstants";
import { modularAddition, modularArithmetic } from "../Common/index";
import { Player, PositionType, PositionGroup, Goalkeeper } from "./PlayerTypes";

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

export const generateGroupOfPlayerSkills = async ([
  positionGroup,
  count,
  startingIndex,
]: [PositionGroup, number, number]): Promise<
  Array<[string, Record<string, number>]>
> => {
  const randomPlusOrMinus: number = await getRandomNumberInRange([-5, 5]);
  const mapSkillIncreasers = flowAsync(
    over([
      flowAsync(
        map(([min, max]) => max - min),
        sum,
        multiply(1 / count),
        Math.ceil,
        add(randomPlusOrMinus),
      ),
      identity,
    ]),
    ([rateToIncreaseSkillLevel, skillRanges]: [
      number,
      Array<[number, number]>,
    ]) => {
      return map(
        ([skillRangeMin, skillRangeMax]: [number, number]): ((
          currentSkillLevel: number,
        ) => number) => {
          return (currentSkillLevel: number) =>
            add(
              subtract(
                add(rateToIncreaseSkillLevel, currentSkillLevel),
                skillRangeMin,
              ) % subtract(skillRangeMax, skillRangeMin),
              skillRangeMin,
            );
        },
      )(skillRanges);
    },
  );

  const [skillIncreasers, minOfSkillRangesOnly]: [
    Array<(currentSkillLevel: number) => number>,
    Array<number>,
  ] = flowAsync(
    property(positionGroup),
    over([mapSkillIncreasers, map(first)]),
  )(SKILLRANGESBYPOSITION);
  const modularAdditionForListOfSkills = modularAddition(
    minOfSkillRangesOnly.length,
  );

  return flowAsync(
    reduce(
      (
        [playerSkills, currentSkillRange, indexOfSkillToUpdate]: [
          Array<[string, Record<string, number>]>,
          Array<number>,
          number,
        ],
        playerNumber: number,
      ): [Array<[string, Record<string, number>]>, Array<number>, number] => {
        const updatedSkillRange: Array<number> = update(
          indexOfSkillToUpdate,
          property(indexOfSkillToUpdate, skillIncreasers),
          currentSkillRange,
        );
        return [
          concat(playerSkills, [
            [
              `${positionGroup}_${playerNumber + 1}`,
              zipObject(PLAYERSKILLS, currentSkillRange),
            ],
          ]),
          updatedSkillRange,
          modularAdditionForListOfSkills(indexOfSkillToUpdate),
        ];
      },
      [[], minOfSkillRangesOnly, 0],
    ),
    first,
  )(range(startingIndex, startingIndex + count));
};

export const generateSkillsForMultiplePositionGroups = flowAsync(
  map(generateGroupOfPlayerSkills),
  flatten,
  Object.fromEntries,
);

export const generatePosition = async (
  positionGroup: PositionGroup,
): Promise<PositionType> => {
  if (positionGroup == PositionGroup.Goalkeeper) {
    return Goalkeeper.GK;
  }
  return flowAsync(property([positionGroup]), sample)(POSITIONS);
};

export const createPlayer = async ([ID, PositionGroup]: [
  string,
  PositionGroup,
]): Promise<Player> => {
  const [Height, Weight, Age, Years, Wages]: [
    number,
    number,
    number,
    number,
    number,
  ] = await getRandomNumberInRanges(BIORANGES);
  return await promiseProps({
    ID,
    Name: faker.person.fullName({ sex: "male" }),
    PositionGroup,
    Position: await generatePosition(PositionGroup),
    Height,
    Weight,
    Age,
    NationalTeam: faker.location.country(),
    Contract: {
      Wages,
      Years,
    },
    Value: 1,
  });
};
