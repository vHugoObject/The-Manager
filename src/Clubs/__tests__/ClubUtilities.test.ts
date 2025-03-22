import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { fakerToArb } from "../../Common/testingUtilities";
import { convertArrayOfArraysToArrayOfSets } from "../../Common/CommonUtilities";
import { zipAll, over } from "lodash/fp";
import { Entity } from "../../Common/CommonTypes";
import { createClub, getClubID, getClubName, getClubSquad } from "../ClubUtilities";

describe("Club Utilities tests", async () => {
  test.prop([
    fc.tuple(
      fc.uuid(),
      fakerToArb((faker) => faker.company.name()),
    ),
    fc.array(fc.tuple(fc.uuid(), fc.string()), {
      minLength: 25,
      maxLength: 25,
    }),
  ])("createClub", async (testClubIDNameTuple, testPlayers) => {
    const actualClub: Entity = await createClub(testClubIDNameTuple, testPlayers);

    const [expectedClubID, expectedClubName] = testClubIDNameTuple;
    const [expectedPlayerIDs] = zipAll(testPlayers);
    const [actualClubID, actualClubName, actualClubSquad] = over([getClubID, getClubName, getClubSquad])(actualClub)
    expect(actualClubID).toMatch(expectedClubID);
    expect(actualClubName).toMatch(expectedClubName);
    
    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      expectedPlayerIDs,
      actualClubSquad,
    ]);
    expect(expectedIDs).toStrictEqual(actualIDs);
  });


});
