import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { map, partial, zipAll } from "lodash/fp";
import { flowAsync } from "futil-js";
import { fakerToArb } from "../../Common/testingUtilities";
import {
  convertArrayOfArraysToArrayOfSets,
  convertToSet,
} from "../../Common/CommonUtilities";
import { Competition } from "../../Competitions/CompetitionTypes";
import {
  createCompetition,
  currentCompetitionTable,
} from "../CompetitionUtilities";

describe("Competition Utilities tests", async () => {
  test.prop([
    fc.uuid(),
    fc.array(fc.tuple(fc.uuid(), fc.string()), {
      minLength: 18,
      maxLength: 50,
    }),
  ])("currentCompetitionTable", async (testCompetitionID, testClubs) => {});

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
    const actualCompetition: Competition = await createCompetition(
      testCompetitionIDNameTuple,
      testClubs,
    );
    const [expectedCompetitionID, expectedCompetitionName] =
      testCompetitionIDNameTuple;
    expect(actualCompetition.ID).toMatch(expectedCompetitionID);
    expect(actualCompetition.Name).toMatch(expectedCompetitionName);
    const [testClubIDs] = zipAll(testClubs);
    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      testClubIDs,
      actualCompetition.Clubs,
    ]);
    expect(expectedIDs).toStrictEqual(actualIDs);
  });
});
