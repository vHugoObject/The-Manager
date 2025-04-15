import {
  property,
  map,
  reduce,
  over,
  first,
  identity,
  range,
  concat,
  update,
  flatten,
  zipWith,
  startsWith,
  filter,
  overSome,
  pickBy,
  curry,
  sortBy,
  last,
  mean,
  reverse,
  pipe
} from "lodash/fp";
import { PositionGroup } from "./PlayerTypes";
import { BaseEntities, Entity } from "../Common/CommonTypes";
import { PLAYERBIODATABYPOSITION } from "./PlayerBioConstants";
import {
  PLAYERSKILLSPHYSICALCONTRACTRANGESBYPOSITION,
  PLAYERSKILLSPHYSICALCONTRACTRANDOMPLUSORMINUS,
} from "./PlayerDataConstants";
import {
  FIRSTNAMES,
  LASTNAMES,
  COUNTRYNAMES,
  modularAddition,
  BASECLUBCOMPOSITION,
  getBaseEntitiesClubsCount,
  boundedModularAddition,
  mapModularIncreasersWithTheSameAverageStep,
  mapModularIncreasersWithDifferentStepsForARange,
  getRandomNumberInRanges,
  getTotalPlayersToGenerateBasedOnGivenComposition,
  getCountOfItemsFromArrayForPredicate
} from "../Common/index";

export const getPlayerPositionGroupFromID = property([0]);

export const isGoalkeeperID = startsWith(PositionGroup.Goalkeeper);
export const isDefenderID = startsWith(PositionGroup.Defender);
export const isMidfielderID = startsWith(PositionGroup.Midfielder);
export const isAttackerID = startsWith(PositionGroup.Attacker);
export const isPlayerID = overSome([
  isGoalkeeperID,
  isDefenderID,
  isMidfielderID,
  isAttackerID,
]);

export const getAttackerIDCount = getCountOfItemsFromArrayForPredicate(isAttackerID)

export const filterGoalkeepersByID = filter(isGoalkeeperID);
export const filterDefendersByID = filter(isDefenderID);
export const filterMidfieldersByID = filter(isMidfielderID);
export const filterAttackersByID = filter(isAttackerID);
export const filterPlayersByID = filter(isPlayerID);

export const playerPicker = curry(
  (picker: (id: string) => boolean, players: Record<string, Array<number>>) => {
    return pickBy((_: Entity, entityID: string) => picker(entityID))(players);
  },
);

export const pickGoalkeepers = playerPicker(isGoalkeeperID);
export const pickDefenders = playerPicker(isDefenderID);
export const pickMidfielders = playerPicker(isMidfielderID);
export const pickAttackers = playerPicker(isAttackerID);
export const pickPlayers = playerPicker(isPlayerID);

export const groupPlayersByPosition = over([
  pickGoalkeepers,
  pickDefenders,
  pickMidfielders,
  pickAttackers,
]);

export const sortPlayersByRatings = pipe([
  Object.entries,
  sortBy(pipe([last, mean])),
  reverse,
  Object.fromEntries,
]);

export const runModularIncreasersModularlyOverARangeOfPlayers = (
  [startingRange, modularIncreasers]: [Array<number>, Array<Function>],
  [positionGroup, count, startingIndex]: [PositionGroup, number, number],
): Array<[string, Array<number>]> => {
  const modularAdditionFuncForListOfRanges = modularAddition(
    startingRange.length,
  );

  return pipe([
    reduce(
      (
        [playerData, currentRange, indexToUpdate]: [
          Array<[string, Array<number>]>,
          Array<number>,
          number,
        ],
        playerNumber: number,
      ): [Array<[string, Array<number>]>, Array<number>, number] => {
        const updater: Function = property(indexToUpdate, modularIncreasers);
        const updatedRange = update(indexToUpdate, updater, currentRange);

        return [
          concat(playerData, [
            [`${positionGroup}_${playerNumber}`, currentRange],
          ]),
          updatedRange,
          modularAdditionFuncForListOfRanges(indexToUpdate),
        ];
      },
      [[], startingRange, 0],
    ),
    first,
  ])(range(startingIndex, startingIndex + count));
};

export const runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers = (
  [startingRange, modularIncreasers]: [Array<number>, Array<Function>],
  [positionGroup, count, startingIndex]: [PositionGroup, number, number],
): Array<[string, Array<number>]> => {
  return pipe([
    reduce(
      (
        [playerData, currentRange]: [
          Array<[string, Array<number>]>,
          Array<number>,
        ],
        playerNumber: number,
      ): [Array<[string, Array<number>]>, Array<number>] => {
        const updatedRange: Array<number> = zipWith(
          (func: Function, currentValue: number): number => {
            return func(currentValue);
          },
        )(modularIncreasers, currentRange);
        return [
          concat(playerData, [
            [`${positionGroup}_${playerNumber}`, currentRange],
          ]),
          updatedRange,
        ];
      },
      [[], startingRange],
    ),
    first,
  ])(range(startingIndex, startingIndex + count));
};

export const generateDataForAGroupOfPlayersByAveragingModularIncreases = curry(
   (
    [ranges, plusOrMinus]: [Array<[number, number]>, number],
    [positionGroup, count, startingIndex]: [PositionGroup, number, number],
  ): Promise<Array<[string, Array<number>]>> => {
    const [modularIncreasers, minOfRangesOnly] = pipe([
      over([
        mapModularIncreasersWithTheSameAverageStep([plusOrMinus, count]),
        map(first),
      ]),
    ])(ranges);

    return runModularIncreasersModularlyOverARangeOfPlayers(
      [minOfRangesOnly, modularIncreasers],
      [positionGroup, count, startingIndex],
    );
  },
);

export const generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers =
  curry(
     (
      [ranges, increasers]: [Array<[number, number]>, Array<Function>],
      [positionGroup, count, startingIndex]: [PositionGroup, number, number],
    ): Promise<Array<[string, Array<number>]>> => {
      const randomStarts: Array<number> = getRandomNumberInRanges(ranges);
      return runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers(
        [randomStarts, increasers],
        [positionGroup, count, startingIndex],
      );
    },
  );

export const generateSkillsPhysicalContractDataForMultiplePositionGroups = pipe([
  map(
     ([positionGroup, count, startingIndex]: [
      PositionGroup,
      number,
      number,
    ]) => {
      return generateDataForAGroupOfPlayersByAveragingModularIncreases(
        [
          property(
            [positionGroup],
            PLAYERSKILLSPHYSICALCONTRACTRANGESBYPOSITION,
          ),
          PLAYERSKILLSPHYSICALCONTRACTRANDOMPLUSORMINUS,
        ],
        [positionGroup, count, startingIndex],
      );
    },
  ),
  flatten,
  Object.fromEntries,
]);

export const generatePlayerBioDataForMultiplePositionGroups =  (
  positionGroupCountStartingIndexTuples: Array<[PositionGroup, number, number]>,
): Promise<Array<[string, Array<number>]>> => {
  const namesAndCountriesRanges: Array<[number, number]> =
    convertListOfListsToListOfRanges([FIRSTNAMES, LASTNAMES, COUNTRYNAMES]);
  return pipe([
    map(
       ([positionGroup, playerCount, startingIndex]: [
        PositionGroup,
        number,
        number,
      ]) => {
        const [positionRange, positionGroupRange] = property(
          [positionGroup],
          PLAYERBIODATABYPOSITION,
        );
        const ranges = concat(namesAndCountriesRanges, [
          positionRange,
          positionGroupRange,
        ]);
        const namesAndCountriesIncreasers =
          mapModularIncreasersWithDifferentStepsForARange(
            playerCount,
            namesAndCountriesRanges,
          );
        const increasers = concat(namesAndCountriesIncreasers, [
          identity,
          boundedModularAddition([positionGroupRange, 1]),
        ]);

        return generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers(
          [ranges, increasers],
          [positionGroup, playerCount, startingIndex],
        );
      },
    ),
    flatten,
  ])(positionGroupCountStartingIndexTuples);
};

// can't export getClubs and flattenClubs?
export const generatePlayerSkillsPhysicalContractDataForListOfClubs =  (
  startingIndex: number,
  entities: BaseEntities,
) => {
  return pipe([
    getBaseEntitiesClubsCount,
    getTotalPlayersToGenerateBasedOnGivenComposition(
      BASECLUBCOMPOSITION,
      startingIndex,
    ),
    generateSkillsPhysicalContractDataForMultiplePositionGroups,
  ])(entities);
};

export const generatePlayerBioDataForListOfClubs = (
  startingIndex: number,
  entities: BaseEntities,
) => {
  return pipe([
    getBaseEntitiesClubsCount,
    getTotalPlayersToGenerateBasedOnGivenComposition(
      BASECLUBCOMPOSITION,
      startingIndex,
    ),
    generatePlayerBioDataForMultiplePositionGroups,
  ])(entities);
};
