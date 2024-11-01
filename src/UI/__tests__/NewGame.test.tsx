// @vitest-environment jsdom
import React from "react";
import { screen, cleanup } from "@testing-library/react";
import { describe, expect, test, afterEach, expectTypeOf } from "vitest";
import "fake-indexeddb/auto";
import {
  ComponentKeysObject,
  StatisticsObject,
  StatisticsType,
} from "../../Common/CommonTypes";
import {
  Player,
  PositionGroup,
  Midfielder,
  Defender,
  SkillSet,
  Foot,
  ContractType,
} from "../../Players/PlayerTypes";
import { Club } from "../../Clubs/ClubTypes";
import { playerSkills } from "../../Players/PlayerSkills";
import {
  Competition,
  BaseCompetitions,
} from "../../Competitions/CompetitionTypes";
import { deleteDB } from "idb";
import { Save } from "../../StorageUtilities/SaveTypes";
import { getAllSaveValues } from "../../StorageUtilities/SaveUtilities";
import { renderWithRouter } from "../UITestingUtilities";
import { NewGame } from "../NewGame";

describe("NewGame Components", async () => {
  afterEach(async () => {
    cleanup();
  });

  const fullCompetitionTableRowHeaders: Array<string> = [
    "Club",
    "Wins",
    "Draws",
    "Losses",
    "Goals For",
    "Goals Against",
    "Goal Difference",
    "Points",
  ];

  const simpleCompetitionTableRowHeaders: Array<string> = [
    "Club",
    "Wins",
    "Draws",
    "Losses",
    "Points",
  ];

  const competitionStatisticsArray: Array<string> = [
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

  const competitionStatisticsObject: Record<string, number> =
    Object.fromEntries(competitionStatisticsArray.map((entry) => [entry, 0]));

  const expectedCompetitionStatistics: StatisticsType = {
    BySeason: { "2024": competitionStatisticsObject },
    GameLog: {},
  };

  const expectedCompetitionComponentKeys: ComponentKeysObject = {
    simpleCompetitionTableRowHeaders,
    fullCompetitionTableRowHeaders,
  };

  const clubStandardStatsHeaders: Array<string> = [
    "Name",
    "National Team",
    "Position",
    "Matches Played",
    "Starts",
    "Minutes",
    "Full 90s",
    "Goals",
    "Assists",
    "Goals Plus Assists",
    "Non Penalty Goals",
    "Penalty Kicks Made",
    "Penalty Kicks Attempted",
    "Yellow Cards",
    "Red Cards",
  ];

  const clubSummaryStatsHeaders: Array<string> = [
    "Record",
    "Home Record",
    "Away Record",
    "Manager",
    "Country",
    "Domestic Competition",
    "Domestic Cups",
    "Continental Cup",
  ];

  const testClubStatisticsOne: StatisticsObject = {
    Wins: 0,
    Draws: 0,
    Losses: 0,
    GoalsFor: 0,
    GoalsAgainst: 0,
    GoalDifference: 0,
    Points: 0,
    Record: "",
    HomeRecord: "",
    AwayRecord: "",
    DomesticCompetition: "",
    DomesticCups: "",
    ContinentalCup: "",
    MatchesPlayed: 0,
    Minutes: 0,
    NonPenaltyGoals: 0,
    PenaltyKicksMade: 0,
    PenaltyKicksAttempted: 0,
    YellowCards: 0,
    RedCards: 0,
  };

  const expectedClubStatistics: StatisticsType = {
    BySeason: { "2024": testClubStatisticsOne },
    GameLog: {},
  };

  const expectedClubComponentKeys: ComponentKeysObject = {
    clubStandardStatsHeaders,
    clubSummaryStatsHeaders,
  };

  const playerStandardStatsHeaders: Array<string> = [
    "Matches Played",
    "Starts",
    "Minutes",
    "Full 90s",
    "Goals",
    "Assists",
    "Goals Plus Assists",
    "Non Penalty Goals",
    "Penalty Kicks Made",
    "Penalty Kicks Attempted",
    "Yellow Cards",
    "Red Cards",
  ];

  const playerBioParagraphs: Array<string> = [
    "Position",
    "Footed",
    "Height",
    "Weight",
    "Age",
    "National Team",
    "Club",
    "Wages",
  ];

  const playerStatisticsArray: Array<string> = [
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

  const playerStatisticsObject: Record<string, number> = Object.fromEntries(
    playerStatisticsArray.map((entry) => [entry, 0]),
  );

  const expectedPlayerStatistics: StatisticsType = {
    BySeason: { "2024": playerStatisticsObject },
    GameLog: {},
  };

  const expectedPlayerComponentKeys: ComponentKeysObject = {
    playerStandardStatsHeaders,
    playerBioParagraphs,
  };

  const expectedContract: ContractType = {
    Wage: 1,
    Years: 1,
  };

  const testPlayerSkills: Record<string, SkillSet> = Object.fromEntries(
    Object.entries(playerSkills).map(([name, set]) => [
      name,
      set.map((skill: string) => [skill, 0]),
    ]),
  );

  const testPlayerOne: Player = {
    ID: 0,
    Name: "John Doe",
    PositionGroup: PositionGroup.Midfielder,
    Position: Midfielder.CDM,
    PreferredFoot: Foot.Right,
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Spain",
    Club: "Arsenal",
    Contract: expectedContract,
    Value: 1,
    Rating: 80,
    Skills: testPlayerSkills,
    Statistics: expectedPlayerStatistics,
  };

  const testPlayerTwo: Player = {
    ID: 1,
    Name: "John Stones",
    PositionGroup: PositionGroup.Defender,
    Position: Defender.LCB,
    PreferredFoot: Foot.Right,
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "England",
    Club: "Arsenal",
    Contract: expectedContract,
    Value: 1,
    Rating: 80,
    Skills: testPlayerSkills,
    Statistics: expectedPlayerStatistics,
  };

  const testPlayerThree: Player = {
    ID: 2,
    Name: "Luis Enrique",
    PositionGroup: PositionGroup.Midfielder,
    Position: Midfielder.CDM,
    PreferredFoot: Foot.Right,
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Spain",
    Club: "Manchester City",
    Contract: expectedContract,
    Value: 1,
    Rating: 80,
    Skills: testPlayerSkills,
    Statistics: expectedPlayerStatistics,
  };

  const testPlayerFour: Player = {
    ID: 3,
    Name: "Bernardo Silva",
    PositionGroup: PositionGroup.Defender,
    Position: Defender.LCB,
    PreferredFoot: Foot.Right,
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "England",
    Club: "Manchester City",
    Contract: expectedContract,
    Value: 1,
    Rating: 80,
    Skills: testPlayerSkills,
    Statistics: expectedPlayerStatistics,
  };

  const testPlayersOne: Array<Player> = [testPlayerOne, testPlayerTwo];
  const testPlayersTwo: Array<Player> = [testPlayerThree, testPlayerFour];

  const testCountry: string = "England";
  const testName = "Jose Mourinho";
  const testCompetitionName: string = "English Premier League";
  const testSeason: string = "2024";
  const testClub: string = "Arsenal";

  const testDBName: string = "the-manager";
  const saves: string = "save-games";

  const testAvailableCountriesLeaguesClubs = {
    England: {
      "English Premier League": ["Arsenal", "Brentford"],
      "The Championship": ["Burnley", "Stoke City"],
    },
    France: {
      "La Ligue 1": ["Paris Saint Germain", "Olympique Lyonnais"],
      "La Ligue 2": ["Metz", "Stade Laval"],
    },
  };

  const expectedCountries = Object.keys(testAvailableCountriesLeaguesClubs);

  test("test NewGame with nothing selected", async () => {
    renderWithRouter(
      <NewGame countriesLeaguesClubs={testAvailableCountriesLeaguesClubs} />,
    );

    expect(screen.getByLabelText("Choose a name:")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "save-name" }));

    expect(screen.getByLabelText("Choose a country:")).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "country-options" }),
    ).toBeTruthy();

    expect(screen.getByLabelText("Choose a domestic league:")).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "domestic-league-options" }),
    ).toBeTruthy();

    expect(screen.getByLabelText("Choose a club:")).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "club-options" })).toBeTruthy();

    // Can only start game when all info has been entered
    expect(() =>
      screen.getByText("Start Game", { selector: "button[name=start-game]" }),
    ).toThrowError();
  });

  test("test NewGame countries options", async () => {
    const { user } = renderWithRouter(
      <NewGame countriesLeaguesClubs={testAvailableCountriesLeaguesClubs} />,
    );

    const element = screen.getByRole("combobox", { name: "country-options" });
    expect(element.length).toBe(expectedCountries.length + 1);
    await user.selectOptions(element, expectedCountries[0]);

    expect(
      screen.getByRole("option", { name: expectedCountries[0] }).selected,
    ).toBeTruthy();

    await user.selectOptions(element, expectedCountries[1]);

    expect(
      screen.getByRole("option", { name: expectedCountries[1] }).selected,
    ).toBeTruthy();
  });

  test("test select country and then league", async () => {
    const testCountry = expectedCountries[0];

    const { user } = renderWithRouter(
      <NewGame countriesLeaguesClubs={testAvailableCountriesLeaguesClubs} />,
    );
    // select a country
    const countryElement = screen.getByRole("combobox", {
      name: "country-options",
    });
    const leaguesElement = screen.getByRole("combobox", {
      name: "domestic-league-options",
    });
    expect(countryElement.length).toBe(expectedCountries.length + 1);
    expect(leaguesElement.length).toBe(0);

    await user.selectOptions(countryElement, testCountry);
    expect(
      screen.getByRole("option", { name: testCountry }).selected,
    ).toBeTruthy();

    // assert that there are league options and that they are correct for the country
    const expectedLeagues = Object.keys(
      testAvailableCountriesLeaguesClubs[expectedCountries[0]],
    );

    expectedLeagues.forEach((expectedLeague) => {
      expect(screen.getByRole("option", { name: expectedLeague })).toBeTruthy();
    });
  });

  test("test start new game", async () => {
    const expectedLeagues = Object.keys(
      testAvailableCountriesLeaguesClubs[testCountry],
    );

    const { user } = renderWithRouter(
      <NewGame countriesLeaguesClubs={testAvailableCountriesLeaguesClubs} />,
    );

    expect(
      screen.getByText("The Manager", { selector: "h2[id='site-banner']" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "control-side-menu" }),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "control-side-menu" }));

    expect(
      screen.getByText("Switch Save", { selector: "a[href='/']" }),
    ).toBeTruthy();

    const form = screen.getByRole("form");
    const saveNameElement = screen.getByRole("textbox", { name: "save-name" });
    const countryElement = screen.getByRole("combobox", {
      name: "country-options",
    });
    const leaguesElement = screen.getByRole("combobox", {
      name: "domestic-league-options",
    });
    const teamsElement = screen.getByRole("combobox", { name: "club-options" });

    expect(countryElement.length).toBe(expectedCountries.length + 1);
    expect(leaguesElement.length).toBe(0);
    expect(teamsElement.length).toBe(0);
    // Can only start game when all info has been entered
    expect(() =>
      screen.getByText("Start Game", { selector: "button[name=start-game]" }),
    ).toThrowError();

    //enter a name
    await user.type(saveNameElement, testName);

    await user.selectOptions(countryElement, expectedCountries[0]);
    expect(
      screen.getByRole("option", { name: testCountry }).selected,
    ).toBeTruthy();

    await user.selectOptions(leaguesElement, testCompetitionName);
    expect(
      screen.getByRole("option", { name: testCompetitionName }).selected,
    ).toBeTruthy();

    await user.selectOptions(teamsElement, testClub);
    expect(
      screen.getByRole("option", { name: testClub }).selected,
    ).toBeTruthy();

    // press start game
    await user.click(
      screen.getByText("Start Game", { selector: "button[type='submit']" }),
    );

    const expectedClub: Club = {
      ID: 0,
      Name: testClub,
      Statistics: expectedClubStatistics,
      Squad: testPlayersOne,
      Starting11: [],
      Bench: [],
    };

    const expectedCompetition: Competition = {
      Name: "English Premier League",
      Clubs: [expectedClub],
      Statistics: expectedCompetitionStatistics,
    };

    const testFirstDay: Date = new Date("8/11/24");

    const expectedSave: Save = {
      Name: testName,
      Country: testCountry,
      MainCompetition: testCompetitionName,
      Club: testClub,
      Seasons: 1,
      CurrentSeason: "2024",
      CurrentDate: testFirstDay,
      allCompetitions: expect.anything(),
      saveID: expect.any(String),
    };

    const actualSaves: Array<Save> = await getAllSaveValues();
    const actualSave: Save = actualSaves[0];
    expect(actualSave).toStrictEqual(expectedSave);
    const actualCompetitions: Array<Competition> = Object.values(
      actualSave.allCompetitions,
    ).flatMap((actualComp) => Object.values(actualComp));

    actualCompetitions.forEach((actualCompetition) => {
      expectTypeOf(actualCompetition).toEqualTypeOf(expectedCompetition);
      actualCompetition.Clubs.forEach((actualClub: Club) => {
        expectTypeOf(actualClub).toEqualTypeOf(expectedClub);
        const actualPlayers: Array<Player> = actualClub.Squad;
        expect(actualPlayers.length).toBe(25);
        expectTypeOf(actualPlayers).toEqualTypeOf(testPlayersOne);
        actualPlayers.forEach((testPlayer) => {
          expectTypeOf(testPlayer).toEqualTypeOf(testPlayerOne);
        });
      });
    });
    await deleteDB(testDBName);
  });
});
