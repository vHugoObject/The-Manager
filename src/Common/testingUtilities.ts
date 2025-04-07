import {
  curry,
  toString,
  concat,
  property,
  map,
  first,
  last,
  size,
  times,
  multiply,
  chunk,
  zipWith,
  zipAll,
  forEach,
} from "lodash/fp";
import { flowAsync } from "futil-js";
import { Faker, Randomizer, en } from "@faker-js/faker";
import { fc } from "@fast-check/vitest";
import { expect } from "vitest";
import { BaseEntities } from "./CommonTypes";
import { BaseCountries } from "../Countries/CountryTypes";
import { Save, SaveArguments } from "../StorageUtilities/SaveTypes";
import { createSave } from "../StorageUtilities/createSave";
import {
  minusOne,
  convertArrayOfArraysToArrayOfSets,
  getFirstLevelArrayLengths,
  getSecondLevelArrayLengths,
  basicSort,
} from "./CommonUtilities";
import {
  getBaseEntitiesCountries,
  getBaseEntitiesDomesticLeagues,
  getBaseEntitiesDomesticLeagueIDsForACountryIndex,
  getBaseEntitiesClubs,
  convertBaseCountriesToBaseEntities,
  getBaseEntitiesClubIDsForADomesticLeagueIndex,
  getBaseEntitiesDomesticLeagueIDAtSpecificIndex,
  getBaseEntitiesClubIDAtSpecificIndex,
  flattenCompetitions,
  flattenClubs,
} from "./BaseEntitiesUtilities";

export const DEFAULTTESTCOUNTRIES: number = 2;
export const DEFAULTTESTCOMPETITIONSPERCOUNTRY: number = 5;
export const DEFAULTTESTCLUBSPERCOMPETITION: number = 20;

export const DEFAULTTESTMATCHESCOUNT: number = 20;
export const DEFAULTPLAYERSPERTESTMATCHES: number = 22;

class FakerBuilder<TValue> extends fc.Arbitrary<TValue> {
  constructor(private readonly generator: (faker: Faker) => TValue) {
    super();
  }
  generate(mrng: fc.Random, biasFactor: number | undefined): fc.Value<TValue> {
    const randomizer: Randomizer = {
      next: (): number => mrng.nextDouble(),
      seed: () => {}, // no-op, no support for updates of the seed, could even throw
    };
    const customFaker = new Faker({ locale: en, randomizer });
    return new fc.Value(this.generator(customFaker), undefined);
  }
  canShrinkWithoutContext(value: unknown): value is TValue {
    return false;
  }
  shrink(value: TValue, context: unknown): fc.Stream<fc.Value<TValue>> {
    return fc.Stream.nil();
  }
}

export function fakerToArb<TValue>(
  generator: (faker: Faker) => TValue,
): fc.Arbitrary<TValue> {
  return new FakerBuilder(generator);
}

export const fastCheckRandomIntegerInRange = curry(
  (fcGen: fc.GeneratorValue, rangeMax: number): number => {
    return fcGen(fc.integer, { min: 0, max: minusOne(rangeMax) });
  },
);

export const fastCheckRandomIntegerInRangeAsString = curry(
  (fcGen: fc.GeneratorValue, rangeMax: number): string => {
    return toString(fcGen(fc.integer, { min: 0, max: minusOne(rangeMax) }));
  },
);

export const fastCheckRandomNumber = (fcGen: fc.GeneratorValue) =>
  fcGen(fc.integer);

export const fastCheckRandomString = curry(
  (fcGen: fc.GeneratorValue): string => {
    return fcGen(fc.string);
  },
);

export const fastCheckRandomFromList = curry(
  <TValue>(
    fcGen: fc.GeneratorValue,
    testList: Array<TValue>,
  ): fc.Arbitrary<TValue> => {
    return fcGen(fc.constantFrom, ...testList);
  },
);

export const fastCheckRandomObjectKey = curry(
  (fcGen: fc.GeneratorValue, object: Record<string, any>): string => {
    return flowAsync(Object.keys, fastCheckRandomFromList(fcGen))(object);
  },
);

export const convertArraysToSetsAndAssert = flowAsync(
  convertArrayOfArraysToArrayOfSets,
  chunk(2),
  forEach(([actual, expected]: [Set<any>, Set<any>]) => {
    expect(actual).toStrictEqual(expected);
  }),
);

export const getCountriesCountFromBaseCountries = flowAsync(map(first), size);
export const getDomesticLeaguesPerCountryCountFromBaseCountries = flowAsync(
  map(property([1])),
  getFirstLevelArrayLengths,
  flattenCompetitions,
);
export const getClubsPerDomesticLeaguesCountFromBaseCountries = flowAsync(
  map(last),
  getSecondLevelArrayLengths,
  flattenClubs,
);

export const fastCheckTestCountriesGenerator = (
  fcGen: fc.GeneratorValue,
  countriesCount: number,
): Array<string> =>
  fcGen(fc.array, fc.string(), {
    minLength: countriesCount,
    maxLength: countriesCount,
  });

export const fastCheckTestDomesticLeaguesGenerator = (
  fcGen: fc.GeneratorValue,
  [countriesCount, competitionsPerCountryCount]: [number, number],
) => {
  return flowAsync(
    multiply(countriesCount),
    times(() => fastCheckRandomString(fcGen)),
    chunk(competitionsPerCountryCount),
  )(competitionsPerCountryCount);
};

export const fastCheckTestClubsGenerator = (
  fcGen: fc.GeneratorValue,
  [countriesCount, competitionsPerCountryCount, clubsPerDomesticLeaguesCount]: [
    number,
    number,
    number,
  ],
) => {
  return flowAsync(
    multiply(competitionsPerCountryCount),
    multiply(clubsPerDomesticLeaguesCount),
    times(() => fastCheckRandomString(fcGen)),
    chunk(clubsPerDomesticLeaguesCount),
    chunk(competitionsPerCountryCount),
  )(countriesCount);
};

export const fastCheckTestBaseCountriesGenerator = (
  [countriesCount, competitionsPerCountryCount, clubsPerDomesticLeaguesCount]: [
    number,
    number,
    number,
  ],
  fcGen: fc.GeneratorValue,
): BaseCountries => {
  return flowAsync(
    zipWith(
      (func: Function, args) => {
        return func(fcGen, args);
      },
      [
        fastCheckTestCountriesGenerator,
        fastCheckTestDomesticLeaguesGenerator,
        fastCheckTestClubsGenerator,
      ],
    ),
    zipAll,
  )([
    countriesCount,
    [countriesCount, competitionsPerCountryCount],
    [countriesCount, competitionsPerCountryCount, clubsPerDomesticLeaguesCount],
  ]);
};

export const fastCheckTestBaseEntitiesGenerator = async (
  [testSeason, testCountriesDomesticsLeaguesClubsCount]: [
    number,
    [number, number, number],
  ],
  fcGen: fc.GeneratorValue,
): Promise<BaseEntities> => {
  return await flowAsync(
    fastCheckTestBaseCountriesGenerator,
    convertBaseCountriesToBaseEntities(testSeason),
  )(testCountriesDomesticsLeaguesClubsCount, fcGen);
};

export const getRandomCountryIndex = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): string => {
  return flowAsync(
    getBaseEntitiesCountries,
    fastCheckRandomObjectKey(fcGen),
  )(testBaseEntities);
};

export const getRandomDomesticLeagueIndex = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): [string, string] => {
  const randomCountryIndex: string = getRandomCountryIndex(
    fcGen,
    testBaseEntities,
  );
  return flowAsync(
    getBaseEntitiesDomesticLeagues,
    property([randomCountryIndex]),
    fastCheckRandomObjectKey(fcGen),
    concat([randomCountryIndex]),
  )(testBaseEntities);
};

export const getRandomClubIndex = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): [string, string, string] => {
  const randomClubIndex: [string, string] = getRandomDomesticLeagueIndex(
    fcGen,
    testBaseEntities,
  );
  return flowAsync(
    getBaseEntitiesClubs,
    property(randomClubIndex),
    fastCheckRandomObjectKey(fcGen),
    concat(randomClubIndex),
  )(testBaseEntities);
};

export const getRandomDomesticLeagueIndexFromSpecificCountryIndex = curry(
  (
    [fcGen, testBaseEntities]: [fc.GeneratorValue, BaseEntities],
    countryIndex: string,
  ): [string, string] => {
    return flowAsync(
      getBaseEntitiesDomesticLeagueIDsForACountryIndex,
      fastCheckRandomObjectKey(fcGen),
      concat([countryIndex]),
    )(testBaseEntities, countryIndex);
  },
);

export const getRandomClubIndexFromSpecificCountryDomesticLeagueIndex = curry(
  (
    [fcGen, testBaseEntities]: [fc.GeneratorValue, BaseEntities],
    countryDomesticLeagueIndicesTuple: [string, string],
  ): [string, string, string] => {
    return flowAsync(
      getBaseEntitiesClubIDsForADomesticLeagueIndex,
      fastCheckRandomObjectKey(fcGen),
      concat(countryDomesticLeagueIndicesTuple),
    )(testBaseEntities, countryDomesticLeagueIndicesTuple);
  },
);

export const getCompletelyRandomDomesticLeagueID = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): string => {
  return flowAsync(
    getRandomDomesticLeagueIndex,
    getBaseEntitiesDomesticLeagueIDAtSpecificIndex(testBaseEntities),
  )(fcGen, testBaseEntities);
};

export const getCompletelyRandomClubID = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): string => {
  return flowAsync(
    getRandomClubIndex,
    getBaseEntitiesClubIDAtSpecificIndex(testBaseEntities),
  )(fcGen, testBaseEntities);
};

export const getCompletelyRandomClubIDAndDomesticLeagueID = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): [string, string] => {
  const [randomCountryIndex, randomCompetitionIndex, randomClubIndex] =
    getRandomClubIndex(fcGen, testBaseEntities);
  const randomCompetitionID: string =
    getBaseEntitiesDomesticLeagueIDAtSpecificIndex(testBaseEntities, [
      randomCountryIndex,
      randomCompetitionIndex,
    ]);
  const randomClubID: string = getBaseEntitiesClubIDAtSpecificIndex(
    testBaseEntities,
    [randomCountryIndex, randomCompetitionIndex, randomClubIndex],
  );

  return basicSort([randomClubID, randomCompetitionID]) as [string, string];
};

export const getAListOfRandomClubIDs = curry(
  (
    [fcGen, testBaseEntities]: [fc.GeneratorValue, BaseEntities],
    clubsCount: number,
  ): Array<string> => {
    return times(() => getCompletelyRandomClubID(fcGen, testBaseEntities))(
      clubsCount,
    );
  },
);

export const getAListOfRandomMatches = curry(
  (
    matchCount: number,
    [fcGen, testBaseEntities]: [fc.GeneratorValue, BaseEntities],
  ): Array<[string, string]> => {
    return flowAsync(
      multiply(2),
      getAListOfRandomClubIDs([fcGen, testBaseEntities]),
      chunk(2),
    )(matchCount);
  },
);

export const defaultGetAListOfRandomMatches = getAListOfRandomMatches(
  DEFAULTTESTMATCHESCOUNT,
);

export const createTestSave = curry(
  async (
    fcGen: fc.GeneratorValue,
    [testPlayerName, testSeason, testCountriesDomesticsLeaguesClubsCount]: [
      string,
      number,
      [number, number, number],
    ],
  ): Promise<Save> => {
    const testBaseEntities: BaseEntities =
      await fastCheckTestBaseEntitiesGenerator(
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
        fcGen,
      );

    const [testPlayerMainDomesticLeague, testPlayerClub]: [string, string] =
      getCompletelyRandomClubIDAndDomesticLeagueID(fcGen, testBaseEntities);

    const testSaveArguments: SaveArguments = {
      Name: testPlayerName,
      UserMainDomesticLeagueID: testPlayerMainDomesticLeague,
      UserClubID: testPlayerClub,
      CurrentSeason: testSeason,
      BaseEntities: testBaseEntities,
    };

    return await createSave(testSaveArguments);
  },
);
