import { BaseEntities } from "./CommonTypes"
import { curry, property, flatten } from "lodash/fp";
import { flowAsync } from "futil-js";
import { Faker, Randomizer, en } from "@faker-js/faker";
import { fc } from "@fast-check/vitest";
import{ getCountries, getDomesticLeagues, getClubs } from "./CreateEntities"

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



