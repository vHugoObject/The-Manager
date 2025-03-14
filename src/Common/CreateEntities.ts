import { BaseEntity, BaseEntities, Entity } from "./CommonTypes";
import { BaseCountry } from "../Countries/CountryTypes";
import { createCountry } from "../Countries/CountryUtilities";
import { createCompetition } from "../Competitions/CompetitionUtilities";
import { createClub } from "../Clubs/ClubUtilities";
import { PositionGroup } from "../Players/PlayerTypes";
import { BASECLUBCOMPOSITION } from "./Constants";
import { flowAsync, updateAllPaths, updatePaths, mapIndexed } from "futil-js";
import {
  multiply,
  map,
  zipAll,
  zipObject,
  flattenDeep,
  partial,
  over,
  size,
  flip,
  slice,
  flattenDepth,
  last,
  reduce,
  concat,
  curry,
  add,
  zipWith,
  property,
  first,
  chunk,
  flatten,
  sum,
  split,
} from "lodash/fp";

export const getCountries = property(["countries"]);
export const getDomesticLeagues = property(["domesticLeagues"]);
export const getClubs = property(["clubs"]);
export const getPlayers = property(["players"]);


export const accumulate = curry(
  ([func, initial]: [Function, any], array: Array<any>): Array<any> => {
    return reduce(
      (previous: Array<any>, current: any): Array<any> => {
        return concat(previous, func(current, last(previous) || initial));
      },
      [],
      array,
    );
  },
);

export const getRunningSumOfList = accumulate([add, 0]);
export const multiplyAccumulate = accumulate([multiply, 1]);

export const sliceUpArray = curry(
  (listOfSliceLengths: Array<number>, array: Array<any>): Array<any> => {
    return flowAsync(
      reduce(
        (
          [slices, currentStartIndex]: [Array<any>, number],
          currentSliceLength: number,
        ) => {
          return flowAsync(sum, (currentEndIndex: number) => [
            concat(slices, [slice(currentStartIndex, currentEndIndex, array)]),
            currentEndIndex,
          ])([currentStartIndex, currentSliceLength]);
        },
        [[], 0],
      ),
      first,
    )(listOfSliceLengths);
  },
);

export const unflatten = curry(
  async (
    listOfListsOfSliceLengths: Array<Array<number>>,
    array: Array<any>,
  ) => {
    return reduce(flip(sliceUpArray), array)(listOfListsOfSliceLengths);
  },
);

export const flattenCompetitions = flattenDepth(1);
export const flattenClubs = flattenDepth(2);
export const flattenPlayers = flattenDepth(3);

export const getFirstLevelArrayLengths = map(size);
export const getSecondLevelArrayLengths = flowAsync(
  map(map(size)),
  flattenDeep,
);

export const getClubsSliceLengths = over([
  getSecondLevelArrayLengths,
  getFirstLevelArrayLengths,
]);

export const transformNestedAsFlat = curry(
  async (
    [flattener, sliceCounter, sliceCreator]: [Function, Function, Function],
    transformer: Function,
    nestedData: Array<any>,
  ): Promise<Array<any>> => {
    const levels = sliceCounter(nestedData);
    return await flowAsync(
      flattener,
      transformer,
      sliceCreator(levels),
    )(nestedData);
  },
);

const transformCompetitions = transformNestedAsFlat([
  flattenCompetitions,
  getFirstLevelArrayLengths,
  sliceUpArray,
]);

const transformClubs = transformNestedAsFlat([
  flattenClubs,
  getClubsSliceLengths,
  unflatten,
]);

export const getIDNumber = flowAsync(split("_"), last, parseInt);
export const getLastEntityIDNumber = flowAsync(last, getIDNumber);

export const convertBaseCountriesToBaseEntities = async (
  season: number,
  baseCountries: Array<BaseCountry>,
): Promise<BaseEntities> => {
  const updater = {
    countries: mapIndexed((countryName: string, index: number) => [
      `Country_${index + 1}`,
      countryName,
    ]),
    domesticLeagues: transformCompetitions(
      mapIndexed((competitionName: string, index: number) => [
        `Competition_${season}_${index + 1}`,
        competitionName,
      ]),
    ),
    clubs: transformClubs(
      mapIndexed((clubName: string, index: number) => [
        `Club_${season}_${index + 1}`,
        clubName,
      ]),
    ),
  };
  return await flowAsync(
    zipAll,
    zipObject(["countries", "domesticLeagues", "clubs"]),
    flowAsync(updatePaths(updater)),
  )(baseCountries);
};

export const getRunningSumOfListOfTuples = curry(
  (
    initialValue: number,
    listOfTuples: Array<[any, number]>,
  ): Array<[string, number, number]> => {
    const getTupleRunningRange = (
      [currentAny, currentCount]: [any, number],
      [previousAny, previousCount, previousRunningTotal]: [any, number, number],
    ) => {
      return [[currentAny, currentCount, currentCount + previousRunningTotal]];
    };

    return accumulate(
      [getTupleRunningRange, ["", 0, initialValue]],
      listOfTuples,
    );
  },
);

export const createPlayerReferencesForClubs = async (
  clubs: Array<Array<Array<BaseEntity>>>,
): Promise<Array<Array<[string, PositionGroup]>>> => {
  const totalClubs: number = flowAsync(flattenClubs, size)(clubs);

  return flowAsync(
    map(([positionGroup, count]: [PositionGroup, number]) => [
      positionGroup,
      multiply(count, totalClubs),
    ]),
    map(
      ([positionGroup, length]: [PositionGroup, number]): Array<
        Array<[string, PositionGroup]>
      > => {
        return chunk(
          length / totalClubs,
          Array.from(
            { length },
            (_, index: number): [string, PositionGroup] => [
              `${positionGroup}_${index + 1}`,
              positionGroup,
            ],
          ),
        );
      },
    ),
    zipAll,
    map(flatten),
  )(BASECLUBCOMPOSITION, clubs);
};

export const createEntities = async (
  baseEntities: BaseEntities,
): Promise<Record<string, Entity>> => {
  const baseEntitiesPlayers: Array<Array<[string, PositionGroup]>> =
    await flowAsync(getClubs, createPlayerReferencesForClubs)(baseEntities);

  return await flowAsync(
    updateAllPaths({
      countries: zipWith(
        (competitions: Array<BaseEntity>, [id, name]: BaseEntity) => {
          return [id, partial(createCountry, [[id, name], competitions])];
        },
        getDomesticLeagues(baseEntities),
      ),
      domesticLeagues: flowAsync(
        flattenCompetitions,
        zipWith((clubs: Array<BaseEntity>, [id, name]: BaseEntity) => {
          return [id, partial(createCompetition, [[id, name], clubs])];
        }, getClubs(baseEntities)),
      ),
      clubs: flowAsync(
        flattenClubs,
        zipWith(
          (players: Array<[string, PositionGroup]>, [id, name]: BaseEntity) => {
            return [id, partial(createClub, [[id, name], players])];
          },
          baseEntitiesPlayers,
        ),
      ),
      players: () =>
        flowAsync(
          flatten,
          map(([id, position]: [string, PositionGroup]) => [
            id,
            partial(createPlayer, [[id, position]]),
          ]),
        )(baseEntitiesPlayers),
    }),
    Object.values,
    flatten,
    Object.fromEntries
  )(baseEntities);
};
