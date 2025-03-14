import { curry, property, size, multiply, last, first } from "lodash/fp";
import { flowAsync, updatePaths } from "futil-js";
import { Faker, Randomizer, en } from "@faker-js/faker";
import { fc } from "@fast-check/vitest";
import { BaseEntities } from "./CommonTypes"
import { DEFAULTSQUADSIZE } from "./Constants"
import{ getCountries, getDomesticLeagues, getClubs, getIDNumber, flattenCompetitions, flattenClubs } from "./CreateEntities"

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
export const fastCheckRandomFromList = curry(<TValue>(g: fc.GeneratorValue, testList: Array<TValue>): fc.Arbitrary<TValue> => {
  return g(fc.constantFrom, ...testList)
})
export const randomPlayerCompetitonAndClub = (
  g: fc.GeneratorValue,
  testBaseEntities: BaseEntities
): [string, string] => {

  const randomCountryIndex: string = flowAsync(getCountries, Object.keys, fastCheckRandomFromList(g))(testBaseEntities)
  const randomCompetitionIndex: string = flowAsync(getDomesticLeagues, property([randomCountryIndex]), Object.keys, fastCheckRandomFromList(g))(testBaseEntities)
  const [randomClubID, ]: string = flowAsync(getClubs, property([randomCountryIndex, randomCompetitionIndex]), fastCheckRandomFromList(g))(testBaseEntities)
  const [randomCompetitionID, ] = property(["domesticLeagues" ,randomCountryIndex, randomCompetitionIndex], testBaseEntities)
  return [randomCompetitionID, randomClubID].toSorted()
  
  };


  export const getLastIDNumberOutOfIDNameTuple = flowAsync(last, first, getIDNumber);
  export const getTotalActualDomesticLeagues = flowAsync(
    flattenCompetitions,
    getLastIDNumberOutOfIDNameTuple,
  );
  export const getTotalActualClubs = flowAsync(
    flattenClubs,
    getLastIDNumberOutOfIDNameTuple,
  );

  export const getActualBaseEntitiesCount = updatePaths({
    countries: getLastIDNumberOutOfIDNameTuple,
    domesticLeagues: getTotalActualDomesticLeagues,
    clubs: getTotalActualClubs,
  });

  export const getTotalTestDomesticLeagues = flowAsync(flattenCompetitions, size);
  export const getTotalTestClubs = flowAsync(flattenClubs, size);

  export const getTestBaseEntitiesCount = updatePaths({
    countries: size,
    domesticLeagues: getTotalTestDomesticLeagues,
    clubs: getTotalTestClubs,
  });

  export const getExpectedPlayersCount = flowAsync(
    getClubs,
    flattenClubs,
    size,
    multiply(DEFAULTSQUADSIZE),
  );
