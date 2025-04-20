import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { zipAll, over } from "lodash/fp";
import { fakerToArb } from "../../TestingUtilities/TestDataGenerationUtilities";
import { convertArrayOfArraysToArrayOfSets } from "../../Common/Transformers";
import { Entity } from "../../Common/CommonTypes";
import {
  createCompetition,
  getCompetitionName,
  getCompetitionClubs,
} from "../CompetitionUtilities";

describe("Competition Utilities tests", async () => {
  test.prop([
    fakerToArb((faker) => faker.company.name()),
    fc.array(fc.tuple(fc.uuid(), fc.string()), {
      minLength: 18,
      maxLength: 50,
    }),
  ])("createCompetition", async (testCompetitionName, testClubs) => {
    const actualCompetition: Entity = createCompetition(
      testCompetitionName,
      testClubs,
    );

    const [testCompetitionClubIDs] = zipAll(testClubs);

    const [actualCompetitionName, actualCompetitionClubIDs] = over([
      getCompetitionName,
      getCompetitionClubs,
    ])(actualCompetition);

    expect(actualCompetitionName).toMatch(testCompetitionName);

    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      testCompetitionClubIDs,
      actualCompetitionClubIDs,
    ]);

    expect(expectedIDs).toStrictEqual(actualIDs);
  });
});
