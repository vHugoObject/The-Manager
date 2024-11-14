import { describe, expect, expectTypeOf, test } from "vitest";
import { playerSkills } from "../PlayerSkills";
import { StatisticsObject, StatisticsType } from "../../Common/CommonTypes";
import {
  Player,
  SkillSet,
  PositionGroup,
  PositionType,
  Midfielder,
  Attacker,
  Goalkeeper,
  Defender,
  BiographicalDetails,
  Foot,
  ContractType,
} from "../PlayerTypes";
import {
  generatePlayerSkills,
  generatePlayerStatisticsObject,
  generatePosition,
  generateBiographicalDetails,
  generateContract,
  createPlayer,
  createGoalkeeper,
  createDefender,
  createMidfielder,
  createAttacker,
} from "../PlayerUtilities";

describe("Player utilities tests", async () => {
  const expectedPlayerStandardStatsHeaders: Array<string> = [
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

  const expectedBioParagraphs: Array<string> = [
    "Position",
    "Footed",
    "Height",
    "Weight",
    "Age",
    "National Team",
    "Club",
    "Wages",
  ];

  const testComponentKeys = {
    standardStatsHeaders: expectedPlayerStandardStatsHeaders,
    bioParagraphs: expectedBioParagraphs,
  };

  const emptyStatistics: StatisticsObject = {
    MatchesPlayed: 0,
    Starts: 0,
    Minutes: 0,
    Full90s: 0,
    Goals: 0,
    Assists: 0,
    GoalsPlusAssists: 0,
    NonPenaltyGoals: 0,
    PenaltyKicksMade: 0,
    PenaltyKicksAttempted: 0,
    YellowCards: 0,
    RedCards: 0,
  };

  const expectedStatistics: StatisticsType = {
    BySeason: { "2024": emptyStatistics },
    GameLog: {},
  };

  const expectedContract: ContractType = {
    Wage: 1,
    Years: 1,
  };

  const getRandomNumberInRange = (min: number, max: number): number => {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
  };

  const testPlayerSkills: Record<string, SkillSet> = Object.fromEntries(
    Object.entries(playerSkills).map(([name, set]) => [
      name,
      Object.fromEntries(
        set.map((skill: string) => [skill, getRandomNumberInRange(0, 100)]),
      ),
    ]),
  );

  const expectedPlayer: Player = {
    ID: expect.any(String),
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
  };

  const testPositionGroups: Array<PositionGroup> = [
    PositionGroup.Midfielder,
    PositionGroup.Attacker,
    PositionGroup.Defender,
    PositionGroup.Goalkeeper,
  ];

  const positions = {
    Attacker,
    Midfielder,
    Defender,
    Goalkeeper,
  };

  test("test getRandomNumberInRange", () => {
    const testRanges = [
      [1, 10],
      [5, 6],
      [8, 100],
      [100, 500],
    ];
    testRanges.forEach(([testMin, testMax]) => {
      const actualNumber = getRandomNumberInRange(testMin, testMax);
      expect(actualNumber).toBeGreaterThanOrEqual(testMin);
      expect(actualNumber).toBeLessThan(testMax);
    });
  });

  test("test generatePlayerSkills", () => {
    testPositionGroups.forEach((position) => {
      const actualPlayerSkills = generatePlayerSkills(position);
      expectTypeOf(actualPlayerSkills).toEqualTypeOf(testPlayerSkills);
    });
  });

  test("test generatePosition", () => {
    testPositionGroups.forEach((testPosition) => {
      const actualPosition = generatePosition(testPosition);
      const expectedPositionGroup = positions[testPosition];
      expect(expectedPositionGroup.hasOwnProperty(actualPosition)).toBeTruthy();
    });
  });

  test("test generateBiographicalDetails", () => {
    const expectedBiographicalDetails: BiographicalDetails = {
      Name: "",
      PreferredFoot: Foot.Right,
      Height: 0,
      Weight: 0,
      Age: 0,
      NationalTeam: "",
    };

    testPositionGroups.forEach((testPosition) => {
      const actualBiographicalDetail: BiographicalDetails =
        generateBiographicalDetails(testPosition);
      expectTypeOf(expectedBiographicalDetails).toEqualTypeOf(
        actualBiographicalDetail,
      );
    });
  });

  test("test generateContract", () => {
    testPositionGroups.forEach((testPosition) => {
      const actualContract: ContractType = generateContract();
      expectTypeOf(actualContract).toEqualTypeOf(expectedContract);
    });
  });

  test("test calculateValue", () => {});

  test("test calculateRating", () => {});

  test("test generatePlayerStatisticsObject", () => {
    const testSeason: string = "2024";
    const actualStatistics: StatisticsType =
      generatePlayerStatisticsObject(testSeason);
    expect(actualStatistics).toMatchObject(expectedStatistics);
  });

  test("test createPlayer", async () => {
    testPositionGroups.forEach(async (testPosition: PositionGroup) => {
      const actualPlayer: Player = await createPlayer(
        testPosition,
        "2024",
        "Arsenal",
      );
      const expectedPositionGroup = positions[testPosition];
      expect(
        expectedPositionGroup.hasOwnProperty(actualPlayer.Position),
      ).toBeTruthy();
      expectTypeOf(actualPlayer).toEqualTypeOf(expectedPlayer);
    });
  });

  test("test createGoalkeeper", async () => {
    const testPosition: PositionGroup = PositionGroup.Goalkeeper;
    const actualPlayer: Player = await createGoalkeeper("2024", "Arsenal");
    const expectedPositionGroup = positions[testPosition];
    expect(
      expectedPositionGroup.hasOwnProperty(actualPlayer.Position),
    ).toBeTruthy();
    expectTypeOf(actualPlayer).toEqualTypeOf(expectedPlayer);
  });

  test("test createDefender", async () => {
    const testPosition: PositionGroup = PositionGroup.Defender;
    const actualPlayer: Player = await createDefender("2024", "Arsenal");
    const expectedPositionGroup = positions[testPosition];
    expect(
      expectedPositionGroup.hasOwnProperty(actualPlayer.Position),
    ).toBeTruthy();
    expectTypeOf(actualPlayer).toEqualTypeOf(expectedPlayer);
  });

  test("test createMidfielder", async () => {
    const testPosition: PositionGroup = PositionGroup.Midfielder;
    const actualPlayer: Player = await createMidfielder("2024", "Arsenal");
    const expectedPositionGroup = positions[testPosition];
    expect(
      expectedPositionGroup.hasOwnProperty(actualPlayer.Position),
    ).toBeTruthy();
    expectTypeOf(actualPlayer).toEqualTypeOf(expectedPlayer);
  });

  test("test createAttacker", async () => {
    const testPosition: PositionGroup = PositionGroup.Attacker;
    const actualPlayer: Player = await createAttacker("2024", "Arsenal");
    const expectedPositionGroup = positions[testPosition];
    expect(
      expectedPositionGroup.hasOwnProperty(actualPlayer.Position),
    ).toBeTruthy();
    expectTypeOf(actualPlayer).toEqualTypeOf(expectedPlayer);
  });
});
