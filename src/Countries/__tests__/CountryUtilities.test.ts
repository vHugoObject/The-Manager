import { test, fc } from "@fast-check/vitest";
import { zipAll, over } from "lodash/fp";
import { describe, expect } from "vitest";
import { fakerToArb } from "../../Common/testingUtilities";
import { convertArrayOfArraysToArrayOfSets } from "../../Common/CommonUtilities";
import { Entity } from "../../Common/CommonTypes";
import { createCountry, getCountryID, getCountryName, getCountryCompetitions } from "../CountryUtilities";

describe("Country Utilities tests", async () => {
  test.prop([
    fc.tuple(
      fc.uuid(),
      fakerToArb((faker) => faker.location.country()),
    ),
    fc.array(
      fc.tuple(
        fc.uuid(),
        fakerToArb((faker) => faker.company.name()),
      ),
      { minLength: 3, maxLength: 8 },
    ),
  ])("createCountry", async (testCountryIDNameTuple, testCompetitions) => {
    const actualCountry: Entity = await createCountry(
      testCountryIDNameTuple,
      testCompetitions,
    );

    const [expectedCountryID, expectedCountryName] = testCountryIDNameTuple;
    const [testCompetitionIDs, ] = zipAll(testCompetitions);
    
    const [actualCountryID, actualCountryName, actualCountryCompetitionIDs] = over([getCountryID, getCountryName, getCountryCompetitions])(actualCountry)

    expect(actualCountryID).toMatch(expectedCountryID);
    expect(actualCountryName).toMatch(expectedCountryName);
        
    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      testCompetitionIDs,
      actualCountryCompetitionIDs,
    ]);
    
    expect(expectedIDs).toStrictEqual(actualIDs);
  });
});
