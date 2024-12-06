import { describe, expect, test, expectTypeOf } from "vitest";
import { simpleFaker } from "@faker-js/faker";
import { map } from "lodash/fp";
import { StatisticsType, Entity } from "../../Common/CommonTypes";
import { Player } from "../../Players/PlayerTypes";
import { BaseCountries } from "../../Countries/CountryTypes";
import { Club } from "../../Clubs/ClubTypes";
import { Competition } from "../../Competitions/CompetitionTypes";
import { createSave } from "../SaveCreator";
import { Save } from "../SaveTypes";

describe("Competition Utilities tests", async () => {
  const testCountry: string = "England";
  const testCompetitionName: string = "English Premier League";
  const testClub: string = "Arsenal";
  const testPlayerName: string = "Mikel Arteta";

  const testCountryOne: string = "England";

  const testCompetitionsOne: Record<string, Record<string, string>> = {
    "English Premier League": {
      [simpleFaker.string.numeric(6)]: "Arsenal",
      [simpleFaker.string.numeric(6)]: "Brentford",
    },
    "The Championship": {
      [simpleFaker.string.numeric(6)]: "Watford",
      [simpleFaker.string.numeric(6)]: "Stoke City",
    },
    "League One": {
      [simpleFaker.string.numeric(6)]: "Walsall",
      [simpleFaker.string.numeric(6)]: "Swindon",
    },
  };

  const testCountryTwo: string = "Spain";

  const testCompetitionsTwo: Record<string, Record<string, string>> = {
    "Primera Division": {
      [simpleFaker.string.numeric(6)]: "Real Madrid CF",
      [simpleFaker.string.numeric(6)]: "FC Barcelona",
    },
    "Segunda Division": {
      [simpleFaker.string.numeric(6)]: "Almeria",
      [simpleFaker.string.numeric(6)]: "Granada",
    },
    "Primera Federacion": {
      [simpleFaker.string.numeric(6)]: "Andorra",
      [simpleFaker.string.numeric(6)]: "Atzeneta",
    },
  };

  const testSeason: string = "2024";

  const testCountriesLeaguesClubs: BaseCountries = {
    [testCountryOne]: testCompetitionsOne,
    [testCountryTwo]: testCompetitionsTwo,
  };

  const expectedCountryNames: Array<string> = [testCountryOne, testCountryTwo];

  const expectedClubNames: Array<string> = Object.values(
    testCountriesLeaguesClubs,
  )
    .flatMap((competition: Record<string, Record<string, string>>) =>
      Object.values(competition),
    )
    .flatMap((clubs: Record<string, string>) => Object.values(clubs));

  const expectedCompetitonNames: Array<string> = Object.values(
    testCountriesLeaguesClubs,
  )
    .map((competitions) => Object.keys(competitions))
    .flat();

  const expectedPlayersCount: number = expectedClubNames.length * 25;
  const expectedEntityCount: number =
    expectedPlayersCount +
    expectedClubNames.length +
    expectedCountryNames.length +
    expectedCompetitonNames.length;

  test("Test createSave", async () => {
    const actualSave: Save = await createSave(
      testPlayerName,
      testCountry,
      testCompetitionName,
      testSeason,
      { clubID: simpleFaker.string.numeric(6), clubName: testClub },
      testCountriesLeaguesClubs,
    );

    const actualEntities: Record<string, Entity> = actualSave.Entities;
    const actualEntityNames: Set<string> = new Set(
      Object.values(actualEntities).map((entity: Entity) => entity.Name),
    );

    expect(actualEntityNames.size).toBe(expectedEntityCount);
    const nameAsserter = map(
      (name: string) => expect(actualEntityNames.has(name)).toBeTruthy,
    );

    await Promise.all(
      [expectedCountryNames, expectedCompetitonNames, expectedClubNames].map(
        async (setOfExpectedNames: Array<string>) => {
          nameAsserter(setOfExpectedNames);
        },
      ),
    );
  });
});
