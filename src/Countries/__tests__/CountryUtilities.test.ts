import { assert, describe, expect, test } from "vitest";
import { simpleFaker } from "@faker-js/faker";
import { Entity, StatisticsType } from "../../Common/CommonTypes";
import { Club } from "../../Clubs/ClubTypes";
import { Competition } from "../../Competitions/CompetitionTypes";
import { BaseCountries } from "../CountryTypes";
import {
  createCountry,
  createCountries,
  createIDsForClubs,
} from "../CountryUtilities";

describe("Country Utilities tests", async () => {
  const testSeason: string = "2024";
    const countryStatisticsArray: Array<string> = [
    "Wins",
    "Draws",
    "Losses",
    "GoalsFor",
    "GoalsAgainst",
    "GoalDifference",
    "Points",
    "MatchesPlayed",
    "Minutes",
    "NonPenaltyGoals",
    "PenaltyKicksMade",
    "PenaltyKicksAttempted",
    "YellowCards",
    "RedCards",
  ];

  const countryStatisticsObject: Record<string, number> =
    Object.fromEntries(countryStatisticsArray.map((entry) => [entry, 0]));

  const expectedCountryStatistics: StatisticsType = {
    [testSeason]: countryStatisticsObject ,
  };
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

  

  const testCountriesLeaguesClubs: BaseCountries = {
    [testCountryOne]: testCompetitionsOne,
    [testCountryTwo]: testCompetitionsTwo,
  };

  test("Test createCountry", async () => {
    const [actualCountry, actualCompetitions, actualClubs, actualPlayers] =
      await createCountry(testCountryOne, testCompetitionsOne, testSeason);

    const expectedCompetitionNames: Array<string> =
      Object.keys(testCompetitionsOne);

    expect(actualCountry.Name).toBe(testCountryOne);
    expect(actualCountry.CurrentSeason).toBe(testSeason);
    expect(actualCountry.Statistics).toStrictEqual(
      expectedCountryStatistics,
    );
    const actualCountryCompetitionNames: Array<string> = Object.values(
      actualCountry.Competitions,
    );
    expect(actualCountryCompetitionNames.toSorted()).toStrictEqual(
      expectedCompetitionNames.toSorted(),
    );

    Object.entries(actualCompetitions).forEach(([_, actualCompetition]) => {
      const expectedCompetitionClubNames: Array<string> = Object.values(
        testCompetitionsOne[actualCompetition.Name],
      );
      const actualCompetitionClubNames: Array<string> = Object.values(
        actualCompetition.Clubs,
      );
      expect(actualCompetitionClubNames.toSorted()).toStrictEqual(
        expectedCompetitionClubNames.toSorted(),
      );
    });

    const expectedClubNames: Array<string> = Object.values(
      testCompetitionsOne,
    ).flatMap((club: Record<string, string>) => Object.values(club));
    const actualClubNames: Array<string> = Object.values(actualClubs).map(
      (actualClub: Entity) => actualClub.Name,
    );
    expect(actualClubNames.toSorted()).toStrictEqual(
      expectedClubNames.toSorted(),
    );
    Object.values(actualClubs).forEach((actualClub: Club) => {
      expect(Object.values(actualClub.Squad).length).toBe(25);
    });

    const expectedPlayersCount: number = actualClubNames.length * 25;
    const actualPlayersCount: number = Object.values(actualPlayers).length;
    expect(actualPlayersCount).toBe(expectedPlayersCount);
  });

  test("Test createCountries", async () => {
    const [actualCountries, actualCompetitions, actualClubs, actualPlayers] =
      await createCountries(testCountriesLeaguesClubs, testSeason);

    Object.entries(actualCountries).forEach(([_, actualCountry]) => {
      expect(actualCountry.CurrentSeason).toBe(testSeason);

      expect(
        Object.values(actualCountry.Competitions).toSorted(),
      ).toStrictEqual(
        Object.keys(testCountriesLeaguesClubs[actualCountry.Name]).toSorted(),
      );
    });

    const expectedCompetitonNames: Array<string> = Object.values(
      testCountriesLeaguesClubs,
    )
      .map((competitions) => Object.keys(competitions))
      .flat();

    const actualCompetitionNames: Array<string> = Object.values(
      actualCompetitions,
    ).map((competition: Competition) => competition.Name);

    expect(actualCompetitionNames.toSorted()).toStrictEqual(
      expectedCompetitonNames.toSorted(),
    );

    const expectedClubNames: Array<string> = Object.values(
      testCountriesLeaguesClubs,
    )
      .flatMap((competition: Record<string, Record<string, string>>) =>
        Object.values(competition),
      )
      .flatMap((clubs: Record<string, string>) => Object.values(clubs));

    const actualClubNames: Array<string> = Object.values(actualClubs).map(
      (actualClub: Entity) => actualClub.Name,
    );

    expect(actualClubNames.toSorted()).toStrictEqual(
      expectedClubNames.toSorted(),
    );
    Object.values(actualClubs).forEach((actualClub: Club) => {
      expect(Object.values(actualClub.Squad).length).toBe(25);
    });

    const expectedPlayersCount: number = actualClubNames.length * 25;
    const actualPlayersCount: number = Object.values(actualPlayers).length;
    expect(actualPlayersCount).toBe(expectedPlayersCount);
  });

  test("Test createIDsForClubs", async () => {
    const testCompetitionsOne: Record<string, Array<string>> = {
      "English Premier League": ["Arsenal", "Brentford"],
      "The Championship": ["Watford", "Stoke City"],
      "League One": ["Walsall", "Swindon"],
    };

    const testCountryTwo: string = "Spain";

    const testCompetitionsTwo: Record<string, Array<string>> = {
      "Primera Division": ["Real Madrid CF", "FC Barcelona"],
      "Segunda Division": ["Almeria", "Granada"],
      "Primera Federacion": ["Andorra", "Atzeneta"],
    };

    const testSeason: string = "2024";

    const testCountriesLeaguesClubs: Record<
      string,
      Record<string, Array<string>>
    > = {
      [testCountryOne]: testCompetitionsOne,
      [testCountryTwo]: testCompetitionsTwo,
    };

    const actualClubs: Record<
      string,
      Record<string, Record<string, string>>
    > = createIDsForClubs(testCountriesLeaguesClubs);

    const actualClubIDS: Array<string> = Object.values(actualClubs)
      .flatMap((competition: Record<string, Record<string, string>>) =>
        Object.values(competition).flat(),
      )
      .flatMap((club: Record<string, string>) => Object.keys(club).flat());

    actualClubIDS.forEach((clubID: string) => {
      assert.isNotNaN(parseInt(clubID));
    });
  });
});
