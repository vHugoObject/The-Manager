import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { zipAll, over } from "lodash/fp";
import { fakerToArb } from "../../Common/testingUtilities";
import {
  convertArrayOfArraysToArrayOfSets,
} from "../../Common/CommonUtilities";
import { Entity } from "../../Common/CommonTypes";
import {
  createCompetition,
  getCompetitionID,
  getCompetitionName,
  getCompetitionClubs
} from "../CompetitionUtilities";

describe("Competition Utilities tests", async () => {

  test.prop([
    fc.tuple(
      fc.uuid(),
      fakerToArb((faker) => faker.company.name()),
    ),

    fc.array(fc.tuple(fc.uuid(), fc.string()), {
      minLength: 18,
      maxLength: 50,
    }),
  ])("createCompetition", async (testCompetitionIDNameTuple, testClubs) => {
    const actualCompetition: Entity = await createCompetition(
      testCompetitionIDNameTuple,
      testClubs,
    );
    const [expectedCompetitionID, expectedCompetitionName] =
	  testCompetitionIDNameTuple;
    const [testClubIDs] = zipAll(testClubs);

        const [actualCountryID, actualCountryName, actualCountryCompetitionIDs] = over([getCompetitionID, getCompetitionName, getCompetitionClubs])(actualCompetition)
    
    expect(actualCountryID).toMatch(expectedCompetitionID);
    expect(actualCountryName).toMatch(expectedCompetitionName);
    
    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      testClubIDs,
      actualCountryCompetitionIDs
    ]);
    
    expect(expectedIDs).toStrictEqual(actualIDs);
  });
});
