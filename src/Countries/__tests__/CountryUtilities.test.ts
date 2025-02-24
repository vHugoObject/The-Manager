import { test, fc } from "@fast-check/vitest";
import { zipAll } from "lodash/fp";
import { describe, expect } from "vitest";
import { fakerToArb } from "../../Common/testingUtilities";
import { convertArrayOfArraysToArrayOfSets } from "../../Common/CommonUtilities";

import { Country } from "../CountryTypes";
import { createCountry } from "../CountryUtilities";

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
    const actualCountry: Country = await createCountry(
      testCountryIDNameTuple,
      testCompetitions,
    );

    const [expectedCountryID, expectedCountryName] = testCountryIDNameTuple;
    expect(actualCountry.ID).toMatch(expectedCountryID);
    expect(actualCountry.Name).toMatch(expectedCountryName);
    const [testCompetitionIDs] = zipAll(testCompetitions);
    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      testCompetitionIDs,
      actualCountry.Competitions,
    ]);
    expect(expectedIDs).toStrictEqual(actualIDs);
  });
});
