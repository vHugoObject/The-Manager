import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { pipe, over, add, first, last, map, property } from "lodash/fp";
import { LeagueTableRow } from "../Types";
import {
  assertIsLeagueTableRow,
  pairIntegersAndAssertEqual,
  pairStringsAndAssertEqual,
  assertSetHas,
} from "../Asserters";
import {
  fastCheckCreateTestListOfRandomMatchLogs,
  fastCheckRandomItemFromArray,
  fastCheckRandomClubMatchResultForLeagueTable,
  fastCheckGenerateRandomBaseCountries,
  fastCheckTestCompletelyRandomBaseClub,
  fastCheckTestCompletelyRandomBaseDomesticLeagueNameWithPath,
  fastCheckTestCompletelyRandomBaseDomesticLeaguePath,
} from "../TestDataGenerators";
import { getClubsOfDomesticLeagueFromBaseCountries } from "../Getters";
import {
  convertDomesticLeaguePathIntoDomesticLeague,
  convertClubRelativeIndexIntoAbsoluteNumber,
  createArrayOfLeagueTableRows,
  createLeagueTableRow,
  convertToSet,
} from "../Transformers";

describe("LeagueStatistics test suite", async () => {
  describe("league table", async () => {
    test("createLeagueTableRow", () => {
      fc.assert(
        fc.property(fc.gen(), (fcGen) => {
          const testBaseCountries = fastCheckGenerateRandomBaseCountries(fcGen);
          const [testClubRelativeIndex, [, , testClubName]] =
            fastCheckTestCompletelyRandomBaseClub(fcGen, testBaseCountries);

          const testClubNumber = convertClubRelativeIndexIntoAbsoluteNumber(
            testClubRelativeIndex,
          );
          const [
            testClubMatchResult,
            expectedGoalDifference,
            expectedMatchesPlayed,
          ] = fastCheckRandomClubMatchResultForLeagueTable(fcGen);

          const actualLeagueTableRow: LeagueTableRow = createLeagueTableRow(
            testBaseCountries,
            testClubMatchResult,
            testClubNumber,
          );

          assertIsLeagueTableRow(actualLeagueTableRow);

          const [actualClubName, actualGoalDifference, actualMatchesPlayed] =
            over([
              property(["Club Name"]),
              property(["Goal Difference"]),
              property(["Matches Played"]),
            ])(actualLeagueTableRow);
          pairIntegersAndAssertEqual([
            actualGoalDifference,
            expectedGoalDifference,
            actualMatchesPlayed,
            expectedMatchesPlayed,
          ]);
          expect(actualClubName).toBe(testClubName);
        }),
      );
    });

    describe("createLeagueTableRow", async () => {
      test("without MatchLogs", async () => {
        await fc.assert(
          fc.asyncProperty(fc.gen(), async (fcGen) => {
            const testBaseCountries =
              fastCheckGenerateRandomBaseCountries(fcGen);

            const [[, expectedDomesticLeagueName], testDomesticLeaguePath] =
              fastCheckTestCompletelyRandomBaseDomesticLeagueNameWithPath(
                fcGen,
                testBaseCountries,
              );
            const testDomesticLeague =
              convertDomesticLeaguePathIntoDomesticLeague(
                testDomesticLeaguePath,
              );
            const expectedClubNames = pipe([
              getClubsOfDomesticLeagueFromBaseCountries,
              convertToSet,
            ])(testDomesticLeaguePath, testBaseCountries);

            const [actualLeagueTable, actualDomesticLeagueName] =
              createArrayOfLeagueTableRows(
                testBaseCountries,
                testDomesticLeague,
                [],
              );

            expect(actualDomesticLeagueName).toBe(expectedDomesticLeagueName);
            const [actualClubName, actualMatchesPlayed] = pipe([
              fastCheckRandomItemFromArray(fcGen),
              over([property("Club Name"), property("Matches Played")]),
            ])(actualLeagueTable);

            assertSetHas(expectedClubNames, actualClubName);
            expect(actualMatchesPlayed).toEqual(0);
          }),
        );
      });
      test("with MatchLogs", async () => {
        await fc.assert(
          fc.asyncProperty(fc.gen(), async (fcGen) => {
            const testBaseCountries =
              fastCheckGenerateRandomBaseCountries(fcGen);

            const [
              testMatchLogs,
              testMatchWeeksCount,
              testDomesticLeaguePath,
              testDomesticLeague,
            ] = fastCheckCreateTestListOfRandomMatchLogs(
              testBaseCountries,
              fcGen,
            );

            const expectedClubNames = pipe([
              getClubsOfDomesticLeagueFromBaseCountries,
              convertToSet,
            ])(testDomesticLeaguePath, testBaseCountries);

            const [actualLeagueTable] = createArrayOfLeagueTableRows(
              testBaseCountries,
              testDomesticLeague,
              testMatchLogs,
            );

            const [actualClubName, actualMatchesPlayed] = pipe([
              fastCheckRandomItemFromArray(fcGen),
              over([property("Club Name"), property("Matches Played")]),
            ])(actualLeagueTable);

            assertSetHas(expectedClubNames, actualClubName);
            expect(actualMatchesPlayed).toEqual(testMatchWeeksCount);

            const [actualBestTeamPoints, actualWorstTeamPoints] = pipe([
              over([first, last]),
              map(property("Points")),
            ])(actualLeagueTable);

            expect(actualBestTeamPoints).toBeGreaterThan(actualWorstTeamPoints);
          }),
          { timeout: 7000 },
        );
      });
    });
  });
});
