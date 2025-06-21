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
  split,
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
  inRange
} from "lodash/fp";
import { Save, BaseCountries } from "./Types";
import { PositionGroup, PLAYERIDDATARANGESBYPOSITION, PLAYERIDINDICES } from "./PlayerDataConstants"
import {
  DEFAULTMATCHCOMPOSITION,
  CLUBSDEPTH,
  COMPETITIONSDEPTH,
  IDPREFIXES,
  BASECOUNTRIESDOMESTICLEAGUESINDEX,
  BASECOUNTRIESCLUBSINDEX,
  BASECOUNTRIESCOUNTRIESINDEX,
} from "./Constants";

export const isTrue = isEqual(true);
export const isFalse = isEqual(false);

export const countByIdentity = countBy(identity);
export const countByStartsWith = countBy(startsWith);

export const getFirstAndTailOfArray = over([first, tail]);
export const getSizeMinAndMaxOfArray = over([size, min, max]);
export const getSizeOfFlattenedArray = pipe([flatten, size]);

export const getFirstLevelArrayLengths = map(size);
export const getFirstLevelArrayMinValues = map(min);
export const getFirstLevelArrayMaxValues = map(max);

export const getSecondArrayValue = property([1]);
export const getSecondArrayValuesOfNestedArrays = map(getSecondArrayValue);
export const getSizeOfCompactedAray = pipe([compact, size]);
export const getFirstLevelArrayLengthsAsSet = pipe([getFirstLevelArrayLengths]);
export const getSecondLevelArrayLengths = pipe([flatMapDepth(map(size), 2)]);

export const getFirstAndLastItemsOfArray = over([first, last]);
export const getMinAndMaxOfArray = over([min, max]);

export const getLastTwoArrayValues = takeRight(2);
export const getFirstTwoArrayValues = take(2);
export const getSumOfFlattenedArray = pipe([flatten, sum]);

export const getCountOfObjectKeys = pipe([Object.keys, size]);
export const getCountOfObjectValues = pipe([Object.values, size]);

export const getPartsOfIDAsArray = split("_");
export const getIDPrefix = pipe([getPartsOfIDAsArray, first]);
export const getIDPrefixes = map(getIDPrefix);
export const getIDSuffix = pipe([getPartsOfIDAsArray, last]);
export const getLastEntityIDNumber = pipe([last, getIDSuffix]);
export const getLastIDNumberOutOfIDNameTuple = pipe([last, first, getIDSuffix]);

export const getFirstNPartsOfID = curry((parts: number, id: string) => {
  return pipe([getPartsOfIDAsArray, take(parts)])(id)
})

export const getFirstTwoPartsOfID = getFirstNPartsOfID(2)
export const getFirstThreePartsOfID = getFirstNPartsOfID(3)
export const getFirstFourPartsOfID = getFirstNPartsOfID(4)

export const countByIDPrefix = countBy(getIDPrefix);
export const countByFirstTwoIDParts = countBy(getFirstTwoPartsOfID);
export const countByFirstThreeIDParts = countBy(getFirstThreePartsOfID);
export const countByFirstFourIDParts = countBy(getFirstFourPartsOfID);


export const getCountsForASetOfIDPrefixes = (
  idPrefixes: Array<string>,
  ids: Array<string>,
): Record<string, number> => {
  return pipe([countByIDPrefix, pick(idPrefixes)])(ids);
};

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

export const betweenZeroAndOne = inRange(0,1)
export const getCountOfFloatsBetweenZeroAndOne = pipe([filter(betweenZeroAndOne), size])

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

export const getCountriesCountFromBaseCountries = pipe([map(first), size]);

export const getDomesticLeaguesPerCountryCountFromBaseCountries = pipe([
  map(property([1])),
  getFirstLevelArrayLengths,
  flattenDepth(COMPETITIONSDEPTH),
]);
export const getClubsPerDomesticLeaguesCountFromBaseCountries = pipe([
  map(last),
  getSecondLevelArrayLengths,
  flattenDepth(CLUBSDEPTH),
]);

export const getCountriesDomesticLeaguesAndClubsCounts = over([
  getCountriesCountFromBaseCountries,
  getDomesticLeaguesPerCountryCountFromBaseCountries,
  getClubsPerDomesticLeaguesCountFromBaseCountries,
]);

export const getDomesticLeaguesOfCountryFromBaseCountries = curry(
  (
    countryIndex: string,
    countriesLeaguesClubs: BaseCountries,
  ): Array<string> => {
    return property([countryIndex, BASECOUNTRIESDOMESTICLEAGUESINDEX])(
      countriesLeaguesClubs,
    );
  },
);

export const getClubsOfDomesticLeagueFromBaseCountries = curry(
  (
    [countryIndex, domesticLeagueIndex]: [string, string],
    countriesLeaguesClubs: BaseCountries,
  ): Array<string> => {
    return property([
      countryIndex,
      BASECOUNTRIESCLUBSINDEX,
      domesticLeagueIndex,
    ])(countriesLeaguesClubs);
  },
);

export const getCountryNameFromBaseCountries = curry(
  (countryIndex: string, countriesLeaguesClubs: BaseCountries): string => {
    return property([countryIndex, BASECOUNTRIESCOUNTRIESINDEX])(
      countriesLeaguesClubs,
    );
  },
);

export const getDomesticLeagueNameFromBaseCountries = curry(
  (
    [countryIndex, domesticLeagueIndex]: [string, string],
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
    [countryIndex, domesticLeagueIndex, clubIndex]: [string, string, string],
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

export const getPlayerIDDataRange = curry((positionGroup: PositionGroup, dataIndex: PLAYERIDINDICES): [number, number] => {
  return property([positionGroup, dataIndex])(PLAYERIDDATARANGESBYPOSITION)
})

export const getValueFromID = curry((index: string, id: string): string => {
  return pipe([split("_"), property([index])])(id)
})

export const getPositionGroupFromPlayerID = getValueFromID(PLAYERIDINDICES.PositionGroup)
export const getSeasonFromPlayerID = getValueFromID(PLAYERIDINDICES.Season)
export const getPlayerNumberFromPlayerID = getValueFromID(PLAYERIDINDICES.PlayerNumber)
export const getDomesticLeagueLevelFromPlayerID = getValueFromID(PLAYERIDINDICES.DomesticLeagueLevel)


