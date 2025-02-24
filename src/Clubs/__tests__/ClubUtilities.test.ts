import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { fakerToArb } from "../../Common/testingUtilities";
import { convertArrayOfArraysToArrayOfSets } from "../../Common/CommonUtilities";
import { flowAsync } from "futil-js";
import { map, countBy, identity, flatten, zipAll } from "lodash/fp";
import { Player } from "../../Players/PlayerTypes";
import { Club } from "../ClubTypes";
import { createClub, getBestStarting11 } from "../ClubUtilities";

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
    const actualClub: Club = await createClub(testClubIDNameTuple, testPlayers);

    const [expectedClubID, expectedClubName] = testClubIDNameTuple;
    expect(actualClub.ID).toMatch(expectedClubID);
    expect(actualClub.Name).toMatch(expectedClubName);
    const [expectedPlayerIDs] = zipAll(testPlayers);
    const [expectedIDs, actualIDs] = convertArrayOfArraysToArrayOfSets([
      expectedPlayerIDs,
      actualClub.Squad,
    ]);
    expect(expectedIDs).toStrictEqual(actualIDs);
  });

  // test.prop([
  //   fc
  //     .tuple(
  //       fc.array(
  //         fc.tuple(fc.uuid(), fc.constantFrom(PositionGroup.Goalkeeper)),
  //         { minLength: 4, maxLength: 4 },
  //       ),

  //       fc.array(fc.tuple(fc.uuid(), fc.constantFrom(PositionGroup.Defender)), {
  //         minLength: 7,
  //         maxLength: 7,
  //       }),

  //       fc.array(
  //         fc.tuple(fc.uuid(), fc.constantFrom(PositionGroup.Midfielder)),
  //         { minLength: 7, maxLength: 7 },
  //       ),

  //       fc.array(fc.tuple(fc.uuid(), fc.constantFrom(PositionGroup.Attacker)), {
  //         minLength: 7,
  //         maxLength: 7,
  //       }),
  //     )
  //     .chain((entries) => fc.constant(flatten(entries))),
  // ])("getBestStarting11", async (testArgs) => {
  //   const testPlayers: Array<Player> = await flowAsync(map(createPlayer))(
  //     testArgs,
  //   );
  //   const actualPlayers = await getBestStarting11(testPlayers);

  //   const actualPlayerPositionCounts = getPositionCounts(actualPlayers);
  //   expect(actualPlayerPositionCounts[PositionGroup.Goalkeeper]).toBe(1);
  //   const outfieldPositionGroups: Array<PositionGroup> = [
  //     PositionGroup.Defender,
  //     PositionGroup.Midfielder,
  //     PositionGroup.Attacker,
  //   ];
  //   outfieldPositionGroups.forEach((positionGroup: PositionGroup) => {
  //     expect(actualPlayerPositionCounts[positionGroup]).toBeGreaterThanOrEqual(
  //       3,
  //     );
  //   });
  // });
});
