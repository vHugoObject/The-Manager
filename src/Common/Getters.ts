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
  zipWith,
  pickBy,
  startsWith,
  overSome,
  sortBy,
  reverse,
  mean,
  uniq,
  isNumber,
  tail,
  partialRight,
} from "lodash/fp";
import {
  PositionGroup,
  Save,
  Entity,
  CountryArrayIndices,
  CompetitionArrayIndices,
  ClubArrayIndices,
  BaseCountries
} from "./Types";
import {
  DEFAULTMATCHCOMPOSITION,
  CLUBSDEPTH,
  COMPETITIONSDEPTH,
  IDPREFIXES,
  BASECOUNTRIESDOMESTICLEAGUESINDEX,
  BASECOUNTRIESCLUBSINDEX,
  BASECOUNTRIESCOUNTRIESINDEX
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

export const countByIDPrefix = countBy(getIDPrefix);

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

export const isClubID = startsWith(IDPREFIXES.Club);
export const isCountryID = startsWith(IDPREFIXES.Country);
export const isDomesticLeagueID = startsWith(IDPREFIXES.DomesticLeague);
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

export const filterCountriesByID = filter(isCountryID);
export const filterDomesticLeaguesByID = filter(isDomesticLeagueID);
export const filterClubsByID = filter(isClubID);
export const filterGoalkeepersByID = filter(isGoalkeeperID);
export const filterDefendersByID = filter(isDefenderID);
export const filterMidfieldersByID = filter(isMidfielderID);
export const filterAttackersByID = filter(isAttackerID);
export const filterPlayersByID = filter(isPlayerID);

export const pickCountries = pickBy((_: Entity, entityID: string): boolean =>
  isCountryID(entityID),
);

export const pickDomesticLeagues = pickBy((_: Entity, entityID: string) =>
  isDomesticLeagueID(entityID),
);

export const pickClubs = pickBy((_: Entity, entityID: string) =>
  isClubID(entityID),
);

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

export const getCountryName = property([CountryArrayIndices.Name]);
export const getCountryDomesticLeagues = property(
  CountryArrayIndices.Competitions,
);

export const getCompetitionName = property([CompetitionArrayIndices.Name]);
export const getCompetitionClubs = property(CompetitionArrayIndices.Clubs);

export const getClubName = property([ClubArrayIndices.Name]);
export const getClubSquad = property([ClubArrayIndices.Squad]);

export const getPlayerPositionGroupFromID = property([0]);

export const getClubsSliceLengths = over([
  pipe([flatMapDepth(map(size), CLUBSDEPTH)]),
  map(size),
]);

export const getCountryIDsCount = pipe([filterCountriesByID, size]);
export const getDomesticLeagueIDsCount = pipe([
  filterDomesticLeaguesByID,
  size,
]);
export const getClubIDsCount = pipe([filterClubsByID, size]);

export const getCountOfNonPlayerEntitiesByTypeFromArray = over([
  getCountryIDsCount,
  getDomesticLeagueIDsCount,
  getClubIDsCount
])

export const getAttackerIDsCount =
  getCountOfItemsFromArrayForPredicate(isAttackerID);
export const getMidfielderIDsCount =
  getCountOfItemsFromArrayForPredicate(isMidfielderID);
export const getDefenderIDsCount =
  getCountOfItemsFromArrayForPredicate(isDefenderID);
export const getGoalkeeperIDsCount =
  getCountOfItemsFromArrayForPredicate(isGoalkeeperID);
export const getPlayerIDsCount =
  getCountOfItemsFromArrayForPredicate(isPlayerID);

export const getCountOfPlayersByPositionFromArray = over([
  getAttackerIDsCount,
  getMidfielderIDsCount,
  getDefenderIDsCount,
  getGoalkeeperIDsCount,
]);

export const getEntityFromSaveEntities = (id: string, save: Save) =>
  pipe([property(["Entities", id])])(save);
export const getGroupOfPlayerSkillsFromSave = (
  ids: Array<string>,
  save: Save,
) => pipe([property(["Entities"]), pick(ids)])(save);
export const getClubSquadFromSave = pipe([
  getEntityFromSaveEntities,
  getClubSquad,
]);

export const getClubPlayerSkillsFromSave = ([save, clubID]: [
  Save,
  string,
]): Record<string, Array<number>> => {
  return pipe([
    getClubSquadFromSave,
    (players: Array<string>) => [save, players],
    getGroupOfPlayerSkillsFromSave,
  ])([save, clubID]);
};

export const getClubBestStarting11FromSave = curry(
  (
    composition: Array<number>,
    [save, clubID]: [Save, string],
  ): Record<string, Array<number>> => {
    return pipe([
      getClubPlayerSkillsFromSave,
      groupPlayersByPosition,
      map(sortPlayersByRatings),
      zipWith(
        (
          positionCount: number,
          positionPlayers: Array<Record<string, Array<number>>>,
        ): Array<Record<string, Array<number>>> => {
          return pipe([Object.entries, take(positionCount)])(positionPlayers);
        },
        composition,
      ),
      flatten,
      Object.fromEntries,
    ])([save, clubID]);
  },
);

export const getClubBestStarting11FromSaveWithDefault433 =
  getClubBestStarting11FromSave(DEFAULTMATCHCOMPOSITION);

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


export const getDomesticLeaguesOfCountryFromBaseCountries = curry((countryIndex: string, countriesLeaguesClubs: BaseCountries): Array<string> => {
  return property([countryIndex, BASECOUNTRIESDOMESTICLEAGUESINDEX])(countriesLeaguesClubs)
})

export const getClubsOfDomesticLeagueFromBaseCountries = curry(([countryIndex, domesticLeagueIndex]: [string, string], countriesLeaguesClubs: BaseCountries): Array<string> => {
  return property([countryIndex, BASECOUNTRIESCLUBSINDEX, domesticLeagueIndex])(countriesLeaguesClubs)
});
  

export const getCountryNameFromBaseCountries = curry((countryIndex: string, countriesLeaguesClubs: BaseCountries): string => {
  return property([countryIndex, BASECOUNTRIESCOUNTRIESINDEX])(countriesLeaguesClubs)
})

export const getDomesticLeagueNameFromBaseCountries = curry(([countryIndex, domesticLeagueIndex]: [string, string], countriesLeaguesClubs: BaseCountries): string => {
  return pipe([getDomesticLeaguesOfCountryFromBaseCountries(countryIndex),property(domesticLeagueIndex)])(countriesLeaguesClubs)
})


export const getClubNameFromBaseCountries = curry(([countryIndex, domesticLeagueIndex, clubIndex]: [string, string, string], countriesLeaguesClubs: BaseCountries): string => {
  return pipe([getClubsOfDomesticLeagueFromBaseCountries([countryIndex, domesticLeagueIndex]), property(clubIndex)])(countriesLeaguesClubs)
})


