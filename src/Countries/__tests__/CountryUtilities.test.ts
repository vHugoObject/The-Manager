import { test, fc } from "@fast-check/vitest";
import { zipAll, over } from "lodash/fp";
import { describe, expect } from "vitest";
import { fakerToArb } from "../../TestingUtilities/TestDataGenerationUtilities";
import { convertArrayOfArraysToArrayOfSets } from "../../Common/Transformers";
import { Entity } from "../../Common/CommonTypes";
import {
  createCountry,
  getCountryName,
  getCountryDomesticLeagues,
} from "../CountryUtilities";

describe("Country Utilities tests", async () => {
  test.prop([
    fakerToArb((faker) => faker.location.country()),
    fc.array(
      fc.tuple(
        fc.uuid(),
        fakerToArb((faker) => faker.company.name()),
      ),
      { minLength: 3, maxLength: 8 },
    ),
  ])("createCountry", async (testCountryName, testCompetitions) => {
    const actualCountry: Entity = createCountry(
      testCountryName,
      testCompetitions,
    );

    const [testCompetitionIDs] = zipAll(testCompetitions);

    const [actualCountryName, actualCountryCompetitionIDs] = over([
      getCountryName,
      getCountryDomesticLeagues,
    ])(actualCountry);

    expect(actualCountryName).toMatch(testCountryName);

    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      testCompetitionIDs,
      actualCountryCompetitionIDs,
    ]);

    expect(expectedIDs).toStrictEqual(actualIDs);
  });
});
