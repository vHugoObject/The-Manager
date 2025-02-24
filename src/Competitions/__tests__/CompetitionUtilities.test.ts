import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { map, partial, zipAll } from "lodash/fp";
import { flowAsync } from "futil-js";
import {
  Manager as TournamentManager,
  Tournament,
} from "tournament-organizer/components";
import {
  TournamentValues,
  StandingsValues,
} from "tournament-organizer/interfaces";
import { fakerToArb } from "../../Common/testingUtilities";
import {
  convertArrayOfArraysToArrayOfSets,
  convertToSet,
} from "../../Common/CommonUtilities";
import { Competition } from "../../Competitions/CompetitionTypes";
import { entityObjectsCreator } from "../../Common/entityUtilities";
import {
  createTournament,
  serializeCompetitionState,
  serializeCompetitionStates,
} from "../../Common/scheduleManagementUtilities";
import {
  createCompetition,
  updateCompetitionState,
  updateCompetitionStates,
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

  // test.prop([
  //   fc.record({
  //     ID: fc.uuid(),
  //     Name: fakerToArb((faker) => faker.location.country()),
  //     Clubs: fc.dictionary(
  //       fc.uuid(),
  //       fakerToArb((faker) => faker.company.name()),
  //       { minKeys: 18, maxKeys: 20 },
  //     ),
  //     CurrentState: fc.constant([]),
  //   }),
  // ])("updateCompetitionState", async (testCompetition) => {
  //   const testScheduler: TournamentManager = new TournamentManager();
  //   const testCompetitionState: Tournament = await createTournament(
  //     testScheduler,
  //     testCompetition,
  //   );
  //   const [testCompetitionKey, testSerializedCompetitionState]: [
  //     string,
  //     [TournamentValues, StandingsValues[]],
  //   ] = await serializeCompetitionState(testCompetitionState);

  //   const actualCompetitionWithUpdatedState: Competition =
  //     await updateCompetitionState(
  //       testSerializedCompetitionState,
  //       testCompetition,
  //     );

  //   expect(actualCompetitionWithUpdatedState.CurrentState).toStrictEqual(
  //     testSerializedCompetitionState,
  //   );
  // });

  // test.prop([
  //   fc.array(
  //     fc.record({
  //       ID: fc.uuid(),
  //       Name: fakerToArb((faker) => faker.location.country()),
  //       Clubs: fc.dictionary(
  //         fc.uuid(),
  //         fakerToArb((faker) => faker.company.name()),
  //         { minKeys: 18, maxKeys: 20 },
  //       ),
  //       CurrentState: fc.constant([]),
  //     }),
  //     { minLength: 3 },
  //   ),
  // ])("updateCompetitionStates", async (testCompetitions) => {
  //   const testScheduler: TournamentManager = new TournamentManager();
  //   const testCompetitionsObject: Record<string, Competition> =
  //     await entityObjectsCreator(testCompetitions);
  //   const testCompetitionStates: Array<Tournament> = await flowAsync(
  //     map(partial(createTournament, [testScheduler])),
  //   )(testCompetitions);

  //   const testSerializedCompetitionStates: Record<
  //     string,
  //     [TournamentValues, StandingsValues[]]
  //   > = await serializeCompetitionStates(testCompetitionStates);

  //   const actualCompetitionWithUpdatedStates: Record<string, Competition> =
  //     await updateCompetitionStates(
  //       testSerializedCompetitionStates,
  //       testCompetitionsObject,
  //     );

  //   Object.entries(testSerializedCompetitionStates).forEach(
  //     ([testKey, expectedSerializedCompetitionState]: [
  //       string,
  //       [TournamentValues, StandingsValues[]],
  //     ]) => {
  //       expect(
  //         actualCompetitionWithUpdatedStates[testKey].CurrentState,
  //       ).toStrictEqual(expectedSerializedCompetitionState);
  //     },
  //   );
  // });
});
