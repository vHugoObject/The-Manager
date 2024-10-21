import { describe, expect, test, expectTypeOf } from "vitest";
import {
  generateSquad,
  generateClubStatisticsObject,
  createClub,
} from "../ClubUtilities";
import { Club } from "../ClubTypes";
import { playerSkills } from "../../Players/PlayerSkills";
import {
  Player,
  PositionGroup,
  Midfielder,
  Defender,
  SkillSet,
  Foot,
  ContractType,
} from "../../Players/PlayerTypes";
import { StatisticsObject, StatisticsType } from "../../Common/CommonTypes";

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

  const expectedPlayerComponentKeys = {
    standardStatsHeaders: expectedPlayerStandardStatsHeaders,
    bioParagraphs: expectedBioParagraphs,
  };

  const expectedContract: ContractType = {
    Wage: 1,
    Years: 1,
  };

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

  const expectedStatistics: StatisticsType = {
    BySeason: { "2024": testClubStatisticsOne },
    GameLog: {},
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
    Statistics: expectedStatistics,
    ComponentKeys: expectedPlayerComponentKeys,
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
    Club: "Manchester City",
    Contract: expectedContract,
    Value: 1,
    Rating: 80,
    Skills: testPlayerSkills,
    Statistics: expectedStatistics,
    ComponentKeys: expectedPlayerComponentKeys,
  };

  const testPlayers: Array<Player> = [testPlayerOne, testPlayerTwo];

  const testClubComponentKeys = {
    clubSummaryStatsHeaders: expectedClubSummaryStatsHeaders,
    clubStandardStatsHeaders: expectedClubStandardStatsHeaders,
  };

  const expectedClubOne: Club = {
    ID: 0,
    Name: "Arsenal",
    Statistics: expectedStatistics,
    Players: testPlayers,
    ComponentKeys: testClubComponentKeys,
  };

  const expectedClubTwo: Club = {
    ID: 0,
    Name: "Arsenal",
    Statistics: expectedStatistics,
    Players: expect.anything(),
    ComponentKeys: testClubComponentKeys,
  };

  const testTeamName: string = "Arsenal";
  const testTeamID: number = 0;
  const testStartingSeason: string = "2024";
  const testFirstPlayerID: number = 0;

  test("test generateClubStatisticsObject", () => {
    const testSeason = "2024";
    const actualStatistics = generateClubStatisticsObject(testSeason);
    expect(actualStatistics).toMatchObject(expectedStatistics);
  });

  test("Test generateSquad", () => {
    const actualPlayers: Array<Player> = generateSquad(
      testTeamName,
      testTeamID,
      testStartingSeason,
      testFirstPlayerID,
    );

    expect(actualPlayers.length).toBe(25);
    expectTypeOf(actualPlayers).toEqualTypeOf(testPlayers);
    actualPlayers.forEach((testPlayer) => {
      expectTypeOf(testPlayer).toEqualTypeOf(testPlayerOne);
    });
  });

  test("Test createClub with given players", () => {
    const actualClub: Club = createClub(
      testTeamName,
      testTeamID,
      testStartingSeason,
      testFirstPlayerID,
      testPlayers,
    );
    expect(actualClub).toStrictEqual(expectedClubOne);
  });

  test("Test createClub with no players", () => {
    const actualClub: Club = createClub(
      testTeamName,
      testTeamID,
      testStartingSeason,
      testFirstPlayerID,
    );

    expect(actualClub).toStrictEqual(expectedClubTwo);

    const actualPlayers: Array<Player> = actualClub.Players;
    expect(actualPlayers.length).toBe(25);
    expectTypeOf(actualPlayers).toEqualTypeOf(testPlayers);
    actualPlayers.forEach((testPlayer) => {
      expectTypeOf(testPlayer).toEqualTypeOf(testPlayerOne);
    });
  });
});
