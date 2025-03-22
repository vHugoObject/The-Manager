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
  multiply,
  flatten,
  curry,
  zipWith,
} from "lodash/fp";
import { flowAsync } from "futil-js";
import { PositionGroup } from "./PlayerTypes";
import { BaseEntities } from "../Common/CommonTypes";
import { PLAYERBIODATABYPOSITION } from "./PlayerBioConstants";
import {
  PLAYERSKILLSANDPHYSICALDATARANGESBYPOSITION,
  PLAYERSKILLSANDPHYSICALDATARANDOMPLUSORMINUS,
} from "./PlayerDataConstants";
import {
  FIRSTNAMES,
  LASTNAMES,
  COUNTRYNAMES,
  modularAddition,
  BASECLUBCOMPOSITION,
  addOne,
  getBaseEntitiesClubsCount,
  boundedModularAddition,
  mapModularIncreasersWithTheSameAverageStep,
  mapModularIncreasersWithDifferentStepsForARange,
  convertListOfListsToListOfRanges,
  getRandomNumberInRanges,
} from "../Common/index";

export const runModularIncreasersModularlyOverARangeOfPlayers = (
  [startingRange, modularIncreasers]: [
    Array<number>,
    Array<Function>,
  ],
  [positionGroup, count, startingIndex]: [PositionGroup, number, number],
): Array<[string, Array<number>]> => {
  const modularAdditionFuncForListOfRanges = modularAddition(
    startingRange.length,
  );

  return flowAsync(
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
            [
              `${positionGroup}_${addOne(playerNumber)}`,
	      currentRange
            ],
          ]),
          updatedRange,
          modularAdditionFuncForListOfRanges(indexToUpdate),
        ];
      },
      [[], startingRange, 0],
    ),
    first,
  )(range(startingIndex, startingIndex + count));
};

export const runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers = (
  [startingRange, modularIncreasers]: [
    Array<number>,
    Array<Function>,
  ],
  [positionGroup, count, startingIndex]: [PositionGroup, number, number],
): Array<[string, Array<number>]> => {
  return flowAsync(
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
            [
              `${positionGroup}_${addOne(playerNumber)}`,
              currentRange,
            ],
          ]),
          updatedRange,
        ];
      },
      [[], startingRange],
    ),
    first,
  )(range(startingIndex, startingIndex + count));
};

export const generateDataForAGroupOfPlayersByAveragingModularIncreases = curry(
  async (
    [ranges, plusOrMinus]: [
      Array<[number, number]>,
      number,
    ],
    [positionGroup, count, startingIndex]: [PositionGroup, number, number],
  ): Promise<Array<[string, Array<number>]>> => {
    const [modularIncreasers, minOfRangesOnly] = await flowAsync(
      over([
        mapModularIncreasersWithTheSameAverageStep([plusOrMinus, count]),
        map(first),
      ]),
    )(ranges);

    return runModularIncreasersModularlyOverARangeOfPlayers(
      [minOfRangesOnly, modularIncreasers],
      [positionGroup, count, startingIndex],
    );
  },
);

export const generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers =
  curry(
    async (
      [ranges, increasers]: [
        Array<[number, number]>,
        Array<Function>,
      ],
      [positionGroup, count, startingIndex]: [PositionGroup, number, number],
    ): Promise<Array<[string, Array<number>]>> => {
      const randomStarts: Array<number> = await getRandomNumberInRanges(ranges);
      return runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers(
        [randomStarts, increasers],
        [positionGroup, count, startingIndex],
      );
    },
  );

export const generateSkillsAndPhysicalDataForMultiplePositionGroups = flowAsync(
  map(
    async ([positionGroup, count, startingIndex]: [
      PositionGroup,
      number,
      number,
    ]) => {
      return await generateDataForAGroupOfPlayersByAveragingModularIncreases(
        [
          property(
            [positionGroup],
            PLAYERSKILLSANDPHYSICALDATARANGESBYPOSITION,
          ),
          PLAYERSKILLSANDPHYSICALDATARANDOMPLUSORMINUS,
        ],
        [positionGroup, count, startingIndex],
      );
    },
  ),
  flatten,
  Object.fromEntries,
);

export const generatePlayerBioDataForMultiplePositionGroups = async (
  positionGroupCountStartingIndexTuples: Array<[PositionGroup, number, number]>,
): Promise<Array<[string, Array<number>]>> => {
  const namesAndCountriesRanges: Array<[number, number]> =
    convertListOfListsToListOfRanges([FIRSTNAMES, LASTNAMES, COUNTRYNAMES]);
  return flowAsync(
    map(
      async ([positionGroup, playerCount, startingIndex]: [
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

        return await generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers(
          [ranges, increasers],
          [positionGroup, playerCount, startingIndex],
        );
      },
    ),
    flatten,
  )(positionGroupCountStartingIndexTuples);
};

export const getTotalPlayersToGenerateBasedOnGivenComposition = curry(
  (
    composition: Array<[PositionGroup, number]>,
    startingIndex: number,
    totalClubs: number,
  ): Array<[PositionGroup, number, number]> => {
    return map(
      ([positionGroup, count]: [PositionGroup, number]): [
        PositionGroup,
        number,
        number,
      ] => [positionGroup, multiply(count, totalClubs), startingIndex],
    )(composition);
  },
);

// can't export getClubs and flattenClubs?
export const generatePlayerSkillsAndPhysicalDataForListOfClubs = async (
  startingIndex: number,
  entities: BaseEntities,
) => {
  return flowAsync(
    getBaseEntitiesClubsCount,
    getTotalPlayersToGenerateBasedOnGivenComposition(
      BASECLUBCOMPOSITION,
      startingIndex,
    ),
    generateSkillsAndPhysicalDataForMultiplePositionGroups,
  )(entities);
};

export const generatePlayerBioDataForListOfClubs = async (
  startingIndex: number,
  entities: BaseEntities,
) => {
  return flowAsync(
    getBaseEntitiesClubsCount,
    getTotalPlayersToGenerateBasedOnGivenComposition(
      BASECLUBCOMPOSITION,
      startingIndex,
    ),
    generatePlayerBioDataForMultiplePositionGroups,
  )(entities);
};
