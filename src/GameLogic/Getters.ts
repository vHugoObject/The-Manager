import {
  sum,
  map,
  last,
  takeRight,
  take,
  min,
  max,
  flatten,
  pipe,
  compact,
  property,
  flatMapDepth,
  size,
  over,
  first,
  isEqual,
  isString,
  isInteger,
  isBoolean,
  countBy,
  identity,
  curry,
  filter,
  isArray,
  pick,
  flattenDepth,
  startsWith,
  sortBy,
  reverse,
  mean,
  uniq,
  isNumber,
  tail,
  partialRight,
  inRange,
  chunk,
  lt,
  spread,
  subtract,
  add,
  multiply,
  divide,
} from "lodash/fp";
import { BaseCountries, Player } from "./Types";
import { FIRSTNAMES, LASTNAMES, COUNTRYNAMES } from "./Names";
import {
  DEFAULTPLAYERSPERPOSITIONGROUP,
  CLUBSDEPTH,
  COMPETITIONSDEPTH,
  BaseCountriesIndices,
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
  DEFAULTCLUBSPERDOMESTICLEAGUE,
  DEFAULTSQUADSIZE,
} from "./Constants";
import {
  PositionGroup,
  PLAYERBIODATARANGESBYPOSITION,
  PLAYERBIODATA,
  PREMIERLEAGUEPAYROLLPERPOSITIONGROUP,
} from "./PlayerDataConstants";

export const isTrue = isEqual(true);
export const isFalse = isEqual(false);

export const countByIdentity = countBy(identity);
export const countByStartsWith = countBy(startsWith);

export const getEventTargetValue = property(["target", "value"]);

export const getEventTargetValueAsNumber = pipe([
  property(["target", "value"]),
  parseInt,
]);

export const getFirstAndTailOfArray = over([first, tail]);
export const getSizeMinAndMaxOfArray = over<number>([
  size,
  min<number>,
  max<number>,
]);
export const getSizeOfFlattenedArray = pipe([flatten, size]);

export const getFirstLevelArrayLengths = map(size);
export const getFirstLevelArrayMinValues = map(min);
export const getFirstLevelArrayMaxValues = map(max);

export const getSecondArrayValue = property([1]);
export const getSecondArrayValuesOfNestedArrays = map(getSecondArrayValue);
export const getSizeOfCompactedArray = pipe([compact, size]);
export const getFirstLevelArrayLengthsAsSet = pipe([getFirstLevelArrayLengths]);
export const getSecondLevelArrayLengths = pipe([flatMapDepth(map(size), 2)]);

export const getFirstAndLastItemsOfArray = over([first, last]);
export const getMinAndMaxOfArray = over<number>([min<number>, max<number>]);

export const getLastTwoArrayValues = takeRight(2);
export const getFirstTwoArrayValues = take(2);
export const getSumOfFlattenedArray = pipe([flatten, sum]);

export const getCountOfObjectKeys = pipe([Object.keys, size]);
export const getCountOfObjectValues = pipe([Object.values, size]);

export const getCountOfItemsFromArrayForPredicateWithTransformation = curry(
  <T, V>(
    transformation: (args: Array<T>) => V,
    predicate: (arg: V) => boolean,
    array: Array<T>,
  ): number => {
    return pipe([filter(predicate), transformation, size])(array);
  },
);

export const getCountOfItemsFromArrayForPredicate = curry(
  getCountOfItemsFromArrayForPredicateWithTransformation(identity),
);

export const getCountOfUniqueItemsFromArrayForPredicate = curry(
  getCountOfItemsFromArrayForPredicateWithTransformation(uniq),
);

export const betweenZeroAndOne = inRange(0, 1);
export const getCountOfFloatsBetweenZeroAndOne = pipe([
  filter(betweenZeroAndOne),
  size,
]);

export const getCountOfStringsFromArray =
  getCountOfItemsFromArrayForPredicate(isString);
export const getCountOfIntegersFromArray =
  getCountOfItemsFromArrayForPredicate(isInteger);

export const getCountOfNumbersFromArray =
  getCountOfItemsFromArrayForPredicate(isNumber); // includes doubles
export const getCountOfArraysFromArrays =
  getCountOfItemsFromArrayForPredicate(isArray);
export const getCountOfBooleansFromArray =
  getCountOfItemsFromArrayForPredicate(isBoolean);
export const getCountOfTrueFromArray =
  getCountOfItemsFromArrayForPredicate(isTrue);
export const getCountOfFalseFromArray =
  getCountOfItemsFromArrayForPredicate(isTrue);
export const getCountOfStringsFromFlattenedArray = pipe([
  flatten,
  getCountOfStringsFromArray,
]);

export const getCountOfUniqueStringsFromArray =
  getCountOfUniqueItemsFromArrayForPredicate(isString);
export const getCountOfUniqueIntegersFromArray =
  getCountOfUniqueItemsFromArrayForPredicate(isInteger);
export const getCountOfItemsFromArrayThatStartWithX = curry(
  (prefix: string, array: Array<string>) =>
    pipe([
      startsWith,
      partialRight(getCountOfItemsFromArrayForPredicate, [array]),
    ])(prefix),
);

export const getCountOfItemsFromArrayThatAreGreaterThanZero =
  getCountOfItemsFromArrayForPredicate(lt(0));

export const getCountOfItemsForPredicatePerArrayChunk = curry(
  <T>(
    predicate: (arg: T) => boolean,
    chunkSize: number,
    array: Array<T>,
  ): Array<number> => {
    return pipe([
      chunk(chunkSize),
      map(getCountOfItemsFromArrayForPredicate(predicate)),
    ])(array);
  },
);

export const getCountOfUniqueItemsPerArrayChunk = curry(
  <T>(chunkSize: number, array: Array<T>): Array<number> => {
    return pipe([chunk(chunkSize), map(pipe([uniq, size]))])(array);
  },
);

export const getLengthOfLinearRange = pipe([
  pipe([reverse, spread(subtract)]),
  add(-1),
]);

export const getRangeStep = curry(
  (range: [number, number], cycles: number, itemsCount: number): number => {
    return pipe([
      getLengthOfLinearRange,
      multiply(cycles),
      partialRight(divide, [itemsCount]),
    ])(range);
  },
);

export const getEntityFromSaveEntities = (id: string, save: Save) =>
  pipe([property(["Entities", id])])(save);

export const getGroupOfPlayerSkillsFromSave = (
  ids: Array<string>,
  save: Save,
) => pipe([property(["Entities"]), pick(ids)])(save);

export const sortPlayersByRatings = pipe([
  Object.entries,
  sortBy(pipe([last, mean])),
  reverse,
  Object.fromEntries,
]);

export const getBaseCountryName = property([BaseCountriesIndices.COUNTRYINDEX]);
export const getBaseCountryDomesticLeagues = property([
  BaseCountriesIndices.DOMESTICLEAGUESINDEX,
]);
export const getBaseCountryClubs = property([BaseCountriesIndices.CLUBSINDEX]);

export const getCountriesCountFromBaseCountries = pipe([
  map(getBaseCountryName),
  size,
]);

export const getDomesticLeaguesCountFromBaseCountries = pipe([
  getCountriesCountFromBaseCountries,
  multiply(DEFAULTDOMESTICLEAGUESPERCOUNTRY),
]);

export const getClubsCountFromBaseCountries = pipe([
  getDomesticLeaguesCountFromBaseCountries,
  multiply(DEFAULTCLUBSPERDOMESTICLEAGUE),
]);

export const getPlayersCountForBaseCountries = pipe([
  getClubsCountFromBaseCountries,
  multiply(DEFAULTSQUADSIZE),
]);

export const getDomesticLeaguesPerCountryCountFromBaseCountries = pipe([
  map(getBaseCountryDomesticLeagues),
  getFirstLevelArrayLengths,
  flattenDepth(COMPETITIONSDEPTH),
  first,
]);

export const getClubsPerDomesticLeaguesCountFromBaseCountries = pipe([
  map(getBaseCountryClubs),
  getSecondLevelArrayLengths,
  flattenDepth(CLUBSDEPTH),
  first,
]);

export const getCountriesDomesticLeaguesAndClubsCounts = over([
  getCountriesCountFromBaseCountries,
  getDomesticLeaguesPerCountryCountFromBaseCountries,
  getClubsPerDomesticLeaguesCountFromBaseCountries,
]);

export const getDomesticLeaguesOfCountryFromBaseCountries = curry(
  (
    countryIndex: number,
    countriesLeaguesClubs: BaseCountries,
  ): Array<string> => {
    return property([countryIndex, BaseCountriesIndices.DOMESTICLEAGUESINDEX])(
      countriesLeaguesClubs,
    );
  },
);

export const getClubsOfDomesticLeagueFromBaseCountries = curry(
  (
    [countryIndex, domesticLeagueIndex]: [number, number],
    countriesLeaguesClubs: BaseCountries,
  ): Array<string> => {
    return property([
      countryIndex,
      BaseCountriesIndices.CLUBSINDEX,
      domesticLeagueIndex,
    ])(countriesLeaguesClubs);
  },
);

export const getCountryNameFromBaseCountries = curry(
  (countryIndex: number, countriesLeaguesClubs: BaseCountries): string => {
    return property([countryIndex, BaseCountriesIndices.COUNTRYINDEX])(
      countriesLeaguesClubs,
    );
  },
);

export const getDomesticLeagueNameFromBaseCountries = curry(
  (
    [countryIndex, domesticLeagueIndex]: [number, number],
    countriesLeaguesClubs: BaseCountries,
  ): string => {
    return pipe([
      getDomesticLeaguesOfCountryFromBaseCountries(countryIndex),
      property(domesticLeagueIndex),
    ])(countriesLeaguesClubs);
  },
);

export const getClubNameFromBaseCountries = curry(
  (
    [countryIndex, domesticLeagueIndex, clubIndex]: [number, number, number],
    countriesLeaguesClubs: BaseCountries,
  ): string => {
    return pipe([
      getClubsOfDomesticLeagueFromBaseCountries([
        countryIndex,
        domesticLeagueIndex,
      ]),
      property(clubIndex),
    ])(countriesLeaguesClubs);
  },
);

export const playerNameGetter = curry(
  ([key, nameList]: [string, Array<string>], player: Player) =>
    pipe([property(key), partialRight(property, [nameList])])(player),
);
export const [
  getPlayerFirstName,
  getPlayerLastName,
  getPlayerCountryName,
  getPlayerPositionGroupName,
] = map<[string, Array<string>], (player: Player) => string>(playerNameGetter)([
  ["PlayerFirstName", FIRSTNAMES],
  ["PlayerLastName", LASTNAMES],
  ["PlayerCountry", COUNTRYNAMES],
  ["PositionGroup", Object.keys(PositionGroup)],
]);

export const getPlayerBioDataRange = curry(
  (
    dataIndex: PLAYERBIODATA,
    positionGroup: PositionGroup,
  ): [number, number] => {
    return property([positionGroup, dataIndex])(PLAYERBIODATARANGESBYPOSITION);
  },
);

export const [
  getPositionGroupAgeRange,
  getPositionGroupYearsLeftOnContractRange,
  getPositionGroupWagesRange,
  getPositionGroupHeightRapppnge,
  getPositionGroupWeightRange,
  getPositionGroupManagerEffectRange,
  getPositionGroupTacklingRange,
  getPositionGroupPassingRange,
  getPositionGroupShootingRange,
  getPositionGroupDribblingRange,
  getPositionGroupMarkingRange,
  getPositionGroupVisionRange,
  getPositionGroupStrengthRange,
  getPositionGroupAttackingWorkRateRange,
  getPositionGroupDefendingWorkRateRange,
  getPositionGroupPositionalAwarenessRange,
  getPositionGroupSprintSpeedRange,
  getPositionGroupAgilityRange,
  getPositionGroupGKPositioningRange,
  getPositionGroupGKDivingRange,
  getPositionGroupGKHandlingRange,
  getPositionGroupGKReflexesRange,
] = pipe([
  Object.values,
  map<PLAYERBIODATA, (positionGroup: PositionGroup) => [number, number]>(
    getPlayerBioDataRange,
  ),
])(PLAYERBIODATA);

export const getPositionGroupPlayerCountPerSquad = partialRight(property, [
  DEFAULTPLAYERSPERPOSITIONGROUP,
]);

export const getPositionGroupBaseWageBillPercentageForLeague = curry(
  (payrollPerPosition: Array<number>, positionGroup: PositionGroup): number => {
    return pipe([over([property([positionGroup]), sum]), spread(divide)])(
      payrollPerPosition,
    );
  },
);

export const getPositionGroupBaseWageBillPercentage =
  getPositionGroupBaseWageBillPercentageForLeague(
    PREMIERLEAGUEPAYROLLPERPOSITIONGROUP,
  );

export const getPositionGroupPlayerCountAndWageBillPercentage = over<number>([
  getPositionGroupPlayerCountPerSquad,
  getPositionGroupBaseWageBillPercentage,
]);
