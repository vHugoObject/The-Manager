import { test, fc } from "@fast-check/vitest";
import { zipAll, over } from "lodash/fp";
import { describe, expect } from "vitest";
import { fakerToArb } from "../../Common/testingUtilities";
import { convertArrayOfArraysToArrayOfSets } from "../../Common/CommonUtilities";
import { Entity } from "../../Common/CommonTypes";
import { createCountry, getCountryName, getCountryCompetitions } from "../CountryUtilities";

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
    const actualCountry: Entity = await createCountry(
      testCountryName,
      testCompetitions,
    );

    const [testCompetitionIDs, ] = zipAll(testCompetitions);
    
    const [actualCountryName, actualCountryCompetitionIDs] = over([getCountryName, getCountryCompetitions])(actualCountry)

    expect(actualCountryName).toMatch(testCountryName);
        
    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      testCompetitionIDs,
      actualCountryCompetitionIDs,
    ]);
    
    expect(expectedIDs).toStrictEqual(actualIDs);
  });
});
