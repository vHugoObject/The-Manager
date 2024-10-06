import { describe, expect, test } from "vitest";
import { createClub } from "../ClubUtilities";

describe("Club Utilities tests", () => {
  const expectedPlayerStandardStatsHeaders = [
    "Season",
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

  const expectedBioParagraphs = [
    "Position",
    "Footed",
    "Height",
    "Weight",
    "Age",
    "National Team",
    "Club",
    "Wages",
  ];

  const expectedClubStandardStatsHeaders = [
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

  const expectedClubSummaryStatsHeaders = [
    "Record",
    "Home Record",
    "Away Record",
    "Manager",
    "Country",
    "Domestic Competition",
    "Domestic Cups",
    "Continental Cup",
  ];

  const testPlayerComponentKeys = {
    standardStatsHeaders: expectedPlayerStandardStatsHeaders,
    bioParagraphs: expectedBioParagraphs,
  };

  const testClubStatisticsOne = {
    "2024": {
      ID: 0,
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
    },
  };

  const testStatisticsOne = {
    ID: 0,
    Season: 2024,
    MatchesPlayed: 3,
    Starts: 4,
    Minutes: 5,
    Full90s: 6,
    Goals: 7,
    Assists: 8,
    GoalsPlusAssists: 9,
    NonPenaltyGoals: 10,
    PenaltyKicksMade: 11,
    PenaltyKicksAttempted: 12,
    YellowCards: 13,
    RedCards: 14,
  };

  const testPlayerOne = {
    ID: 0,
    Name: "John Doe",
    Position: "Midfielder",
    Footed: "Right",
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Spain",
    Club: "Arsenal",
    Wages: 60_000,
    Statistics: {
      BySeason: { 2024: testStatisticsOne },
      GameLog: {},
    },
    ComponentKeys: testPlayerComponentKeys,
  };

  const testPlayerTwo = {
    ID: 1,
    Name: "Ederson",
    Position: "Midfielder",
    Footed: "Right",
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Spain",
    Club: "Arsenal",
    Wages: 60_000,
    Statistics: {
      BySeason: { 2024: testClubStatisticsOne },
      GameLog: {},
    },
    ComponentKeys: testPlayerComponentKeys,
  };

  const testPlayersOne = [testPlayerOne, testPlayerTwo];

  const testClubComponentKeys = {
    clubSummaryStatsHeaders: expectedClubSummaryStatsHeaders,
    clubStandardStatsHeaders: expectedClubStandardStatsHeaders,
  };

  const expectedClub = {
    ID: 0,
    Name: "Arsenal",
    Statistics: {
      BySeason: testClubStatisticsOne,
      GameLog: {},
    },
    Players: testPlayersOne,
    ComponentKeys: testClubComponentKeys,
  };

  const expectedClubTwo = {
    ID: 0,
    Name: "Arsenal",
    Statistics: {
      BySeason: testClubStatisticsOne,
      GameLog: {},
    },
    Players: expect.anything(),
    ComponentKeys: testClubComponentKeys,
  };

  const testStartingSeason = "2024";

  test("Test createClub with given players", () => {
    const actualClub = createClub(
      "Arsenal",
      0,
      testStartingSeason,
      testPlayersOne,
    );
    expect(actualClub).toStrictEqual(expectedClub);
  });

  test("Test createClub with no players", () => {
    const actualClub = createClub("Arsenal", 0, testStartingSeason);
    expect(actualClub).toStrictEqual(expectedClubTwo);
  });
});
