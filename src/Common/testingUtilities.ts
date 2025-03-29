import { curry, property } from "lodash/fp";
import { flowAsync } from "futil-js";
import { Faker, Randomizer, en } from "@faker-js/faker";
import { fc } from "@fast-check/vitest";
import { BaseEntities } from "./CommonTypes";
import { Save, SaveArguments } from "../StorageUtilities/SaveTypes";
import { createSave } from "../StorageUtilities/createSave";
import { BaseCountries } from "../Countries/CountryTypes"
import {
  getBaseEntitiesCountries,
  getBaseEntitiesDomesticLeagues,
  getBaseEntitiesClubs,
  convertBaseCountriesToBaseEntities
} from "./BaseEntitiesUtilities";

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
export const fastCheckRandomFromList = curry(
  <TValue>(
    g: fc.GeneratorValue,
    testList: Array<TValue>,
  ): fc.Arbitrary<TValue> => {
    return g(fc.constantFrom, ...testList);
  },
);

export const randomPlayerCompetitonAndClub = (
  fcGen: fc.GeneratorValue,
  testBaseEntities: BaseEntities,
): [string, string] => {
  const randomCountryIndex: string = flowAsync(
    getBaseEntitiesCountries,
    Object.keys,
    fastCheckRandomFromList(fcGen),
  )(testBaseEntities);
  const randomCompetitionIndex: string = flowAsync(
    getBaseEntitiesDomesticLeagues,
    property([randomCountryIndex]),
    Object.keys,
    fastCheckRandomFromList(fcGen),
  )(testBaseEntities);
  const [randomClubID]: string = flowAsync(
    getBaseEntitiesClubs,
    property([randomCountryIndex, randomCompetitionIndex]),
    fastCheckRandomFromList(fcGen),
  )(testBaseEntities);
  const [randomCompetitionID] = property(
    ["domesticLeagues", randomCountryIndex, randomCompetitionIndex],
    testBaseEntities,
  );
  return [randomCompetitionID, randomClubID].toSorted();
};


export const createTestSave = curry(async(
  g: fc.GeneratorValue,
  [testPlayerName, testSeason,
  testCountriesLeaguesClubs]: [string, number, BaseCountries],
): Promise<Save> => {
  const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );

  const [testPlayerMainCompetition, testPlayerClub]: [string, string] =
        randomPlayerCompetitonAndClub(g, testBaseEntities);

  const testSaveArguments: SaveArguments = {
        Name: testPlayerName,
        UserMainCompetitionID: testPlayerMainCompetition,
        UserClubID: testPlayerClub,
        CurrentSeason: testSeason,
        BaseEntities: testBaseEntities,
  };
  
  return await createSave(testSaveArguments);
})

