import { describe, expect, expectTypeOf, test } from "vitest";
import { simpleFaker } from "@faker-js/faker";
import { range } from "lodash";
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
  calculatePlayerRating,
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
  createGoalkeepers,
  createDefenders,
  createMidfielders,
  createAttackers,
  playerIsGoalkeeper,
  playerIsNotGoalkeeper,
  playerIsDefender,
  playerIsMidfielder,
  playerIsAttacker,
  filterGoalkeepers,
  filterDefenders,
  filterMidfielders,
  filterAttackers,
  filterOutfieldPlayers,
  getAverageOfSetOfSkillCategories,
  getListOfAveragesOfSetOfSkillCategories,
  getPlayerSkills,
  getListOfPlayerSkills,
  getOutfieldPlayersDefendingRatings,
  getGoalkeepingRating,
  getAttackingRatings,
} from "../PlayerUtilities";

describe("Player utilities tests", async () => {
  const testSeason: string = "2024";

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
    [testSeason]: emptyStatistics,
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

  const testPlayerSkills = (): Record<string, SkillSet> => {
    return Object.fromEntries(
      Object.entries(playerSkills).map(([name, set]) => [
        name,
        Object.fromEntries(
          set.map((skill: string) => [skill, getRandomNumberInRange(25, 100)]),
        ),
      ]),
    );
  };

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
    Skills: testPlayerSkills(),
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

  const testMidfielderOne: Player = {
    ID: "0",
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
    Skills: testPlayerSkills(),
  };

  const testDefenderOne: Player = {
    ID: "1",
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
    Skills: testPlayerSkills(),
  };

  const testAttackerOne: Player = {
    ID: "2",
    Name: "Pepe",
    PositionGroup: PositionGroup.Attacker,
    Position: Attacker.RW,
    PreferredFoot: Foot.Right,
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Spain",
    Club: "Arsenal",
    Contract: expectedContract,
    Value: 1,
    Rating: 80,
    Skills: testPlayerSkills(),
  };

  const testGoalkeeperOne: Player = {
    ID: "3",
    Name: "Ederson",
    PositionGroup: PositionGroup.Goalkeeper,
    Position: Goalkeeper.GK,
    PreferredFoot: Foot.Right,
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "England",
    Club: "Manchester City",
    Contract: expectedContract,
    Value: 1,
    Rating: 80,
    Skills: testPlayerSkills(),
  };

  const testPlayersArray: Array<Player> = [
    testMidfielderOne,
    testDefenderOne,
    testAttackerOne,
    testGoalkeeperOne,
  ];

  const testOutfieldPlayersArray: Array<Player> = [
    testMidfielderOne,
    testDefenderOne,
    testAttackerOne,
  ];

  const defenseCategories = new Set([
    "defenseSkills",
    "mentalSkills",
    "physicalSkills",
  ]);

  const goalkeepingCategories = new Set([
    "defenseSkills",
    "mentalSkills",
    "physicalSkills",
    "goalkeepingSkills",
  ]);
  const attackCategories = new Set([
    "ballSkills",
    "mentalSkills",
    "physicalSkills",
    "passingSkills",
    "shootingSkills",
  ]);

  const testCategories: Array<Set<string>> = [
    defenseCategories,
    goalkeepingCategories,
    attackCategories,
  ];

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

  test("Test playerIs predicates", async () => {
    expect(playerIsGoalkeeper(testGoalkeeperOne)).toBeTruthy();
    expect(playerIsGoalkeeper(testDefenderOne)).toBeFalsy();

    expect(playerIsNotGoalkeeper(testGoalkeeperOne)).toBeFalsy();
    expect(playerIsNotGoalkeeper(testDefenderOne)).toBeTruthy();

    expect(playerIsDefender(testDefenderOne)).toBeTruthy();
    expect(playerIsDefender(testMidfielderOne)).toBeFalsy();

    expect(playerIsMidfielder(testMidfielderOne)).toBeTruthy();
    expect(playerIsMidfielder(testAttackerOne)).toBeFalsy();

    expect(playerIsAttacker(testAttackerOne)).toBeTruthy();
    expect(playerIsAttacker(testMidfielderOne)).toBeFalsy();
  });

  test("Test position group filters", async () => {
    expect(filterGoalkeepers(testPlayersArray)).toStrictEqual([
      testGoalkeeperOne,
    ]);
    expect(filterDefenders(testPlayersArray)).toStrictEqual([testDefenderOne]);
    expect(filterMidfielders(testPlayersArray)).toStrictEqual([
      testMidfielderOne,
    ]);
    expect(filterAttackers(testPlayersArray)).toStrictEqual([testAttackerOne]);

    expect(filterOutfieldPlayers(testPlayersArray).toSorted()).toStrictEqual([
      testMidfielderOne,
      testDefenderOne,
      testAttackerOne,
    ]);
  });

  test("Test getPlayerSkills", async () => {
    await Promise.all(
      testPlayersArray.map(async (testPlayer: Player) => {
        const actualPlayerSkills: Record<string, SkillSet> =
          await getPlayerSkills(testPlayer);
        expect(actualPlayerSkills).toBeTruthy();
      }),
    );
  });

  test("Test getListOfPlayerSkills ", async () => {
    const actualPlayerSkills: Array<Record<string, SkillSet>> =
      await getListOfPlayerSkills(testPlayersArray);
    expect(actualPlayerSkills.length).toBe(testPlayersArray.length);
  });

  test("Test getAverageOfSetOfSkillCategories", async () => {
    await Promise.all(
      testCategories.map(async (testCategory: Set<string>) => {
        const testSkills: Record<string, SkillSet> = testPlayerSkills();
        const actualAverage: number = await getAverageOfSetOfSkillCategories(
          testCategory,
          testSkills,
        );
        expect(actualAverage).toBeGreaterThanOrEqual(25);
        expect(actualAverage).toBeLessThan(100);
      }),
    );
  });

  test("Test getListOfAveragesOfSetOfSkillCategories", async () => {
    await Promise.all(
      testCategories.map(async (testCategory: Set<string>) => {
        const testSkills: Array<Record<string, SkillSet>> = range(0, 10).map(
          () => testPlayerSkills(),
        );
        const actualAverages: Array<number> =
          await getListOfAveragesOfSetOfSkillCategories(
            testCategory,
            testSkills,
          );
        await Promise.all(
          actualAverages.map((actualAverage: number) => {
            expect(actualAverage).toBeGreaterThanOrEqual(25);
            expect(actualAverage).toBeLessThan(100);
          }),
        );
      }),
    );
  });

  test("Test getGoalkeepingRating", async () => {
    const actualGoalkeepingRating: Array<number> = await getGoalkeepingRating([
      testGoalkeeperOne,
    ]);

    expect(actualGoalkeepingRating.length).toBe(1);

    actualGoalkeepingRating.forEach((actualRating: number) => {
      expect(actualRating).toBeGreaterThanOrEqual(25);

      expect(actualRating).toBeLessThanOrEqual(100);
    });
  });

  test("Test getOutfieldPlayersDefendingRatings", async () => {
    const actualOutfieldPlayersRatings: Array<number> =
      await getOutfieldPlayersDefendingRatings(testPlayersArray);
    expect(actualOutfieldPlayersRatings.length).toBe(
      testOutfieldPlayersArray.length,
    );
    actualOutfieldPlayersRatings.forEach((actualRating: number) => {
      expect(actualRating).toBeGreaterThanOrEqual(25);

      expect(actualRating).toBeLessThanOrEqual(100);
    });
  });

  test("Test getAttackingRatings", async () => {
    const actualPlayersRatings: Array<number> =
      await getAttackingRatings(testPlayersArray);
    expect(actualPlayersRatings.length).toBe(testPlayersArray.length);
    actualPlayersRatings.forEach((actualRating: number) => {
      expect(actualRating).toBeGreaterThanOrEqual(25);

      expect(actualRating).toBeLessThanOrEqual(100);
    });
  });

  test("test generatePlayerSkills", async () => {
    await Promise.all(
      testPositionGroups.map(async (position) => {
        const actualPlayerSkills: Record<string, SkillSet> =
          await generatePlayerSkills(position);
        Object.values(actualPlayerSkills).forEach((skillSet: SkillSet) => {
          Object.values(skillSet).forEach((skill: number) => {
            expect(skill).toBeGreaterThanOrEqual(25);
            expect(skill).toBeLessThan(100);
          });
        });
      }),
    );
  });

  test("test generatePosition", async () => {
    await Promise.all(
      testPositionGroups.map(async (testPosition) => {
        const actualPosition = await generatePosition(testPosition);
        const expectedPositionGroup = positions[testPosition];
        expect(
          expectedPositionGroup.hasOwnProperty(actualPosition),
        ).toBeTruthy();
      }),
    );
  });

  test("test generateBiographicalDetails", async () => {
    const expectedBiographicalDetails: BiographicalDetails = {
      Name: "",
      PreferredFoot: Foot.Right,
      Height: 0,
      Weight: 0,
      Age: 0,
      NationalTeam: "",
    };

    await Promise.all(
      testPositionGroups.map(async (testPosition) => {
        const actualBiographicalDetail: BiographicalDetails =
          await generateBiographicalDetails(testPosition);
        expectTypeOf(expectedBiographicalDetails).toEqualTypeOf(
          actualBiographicalDetail,
        );
      }),
    );
  });

  test("test generateContract", async () => {
    await Promise.all(
      testPositionGroups.map(async (testPosition) => {
        const actualContract: ContractType = await generateContract();
        expect(actualContract.Years).toBeGreaterThanOrEqual(1);
        expect(actualContract.Years).toBeLessThanOrEqual(5);
      }),
    );
  });

  test("test calculateValue", () => {});

  test("test calculatePlayerRating", async () => {
    await Promise.all(
      testPositionGroups.map(async (testPosition) => {
        const testSkills: Record<string, SkillSet> = testPlayerSkills();
        const actualRating: number = await calculatePlayerRating(
          testSkills,
          testPosition,
        );
        expect(actualRating).toBeGreaterThanOrEqual(25);
        expect(actualRating).toBeLessThan(100);
      }),
    );
  });

  test("test generatePlayerStatisticsObject", async () => {
    const actualStatistics: StatisticsType =
      await generatePlayerStatisticsObject(testSeason);
    expect(actualStatistics).toMatchObject(expectedStatistics);
  });

  test("test createPlayer", async () => {
    await Promise.all(
      testPositionGroups.map(async (testPosition: PositionGroup) => {
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
      }),
    );
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

  test("test createGoalkeepers", async () => {
    const testPosition: PositionGroup = PositionGroup.Goalkeeper;
    const randomPlayerCount: number = simpleFaker.number.int({
      min: 4,
      max: 25,
    });
    const actualPlayers: Array<Player> = await createGoalkeepers(
      randomPlayerCount,
      ["2024", "Arsenal"],
    );
    expect(actualPlayers.length).toBe(randomPlayerCount);
    const expectedPositionGroup = positions[testPosition];
    await Promise.all(
      actualPlayers.map(async (actualPlayer) => {
        expect(
          expectedPositionGroup.hasOwnProperty(actualPlayer.Position),
        ).toBeTruthy();
      }),
    );
  });

  test("test createDefenders", async () => {
    const testPosition: PositionGroup = PositionGroup.Defender;
    const randomPlayerCount: number = simpleFaker.number.int({
      min: 4,
      max: 25,
    });
    const actualPlayers: Array<Player> = await createDefenders(
      randomPlayerCount,
      ["2024", "Arsenal"],
    );
    expect(actualPlayers.length).toBe(randomPlayerCount);
    const expectedPositionGroup = positions[testPosition];
    await Promise.all(
      actualPlayers.map(async (actualPlayer) => {
        expect(
          expectedPositionGroup.hasOwnProperty(actualPlayer.Position),
        ).toBeTruthy();
      }),
    );
  });

  test("test createMidfielders", async () => {
    const testPosition: PositionGroup = PositionGroup.Midfielder;
    const randomPlayerCount: number = simpleFaker.number.int({
      min: 4,
      max: 25,
    });
    const actualPlayers: Array<Player> = await createMidfielders(
      randomPlayerCount,
      ["2024", "Arsenal"],
    );
    expect(actualPlayers.length).toBe(randomPlayerCount);
    const expectedPositionGroup = positions[testPosition];
    await Promise.all(
      actualPlayers.map(async (actualPlayer) => {
        expect(
          expectedPositionGroup.hasOwnProperty(actualPlayer.Position),
        ).toBeTruthy();
      }),
    );
  });

  test("test createAttackers", async () => {
    const testPosition: PositionGroup = PositionGroup.Attacker;
    const randomPlayerCount: number = simpleFaker.number.int({
      min: 4,
      max: 25,
    });
    const actualPlayers: Array<Player> = await createAttackers(
      randomPlayerCount,
      ["2024", "Arsenal"],
    );
    expect(actualPlayers.length).toBe(randomPlayerCount);
    const expectedPositionGroup = positions[testPosition];
    await Promise.all(
      actualPlayers.map(async (actualPlayer) => {
        expect(
          expectedPositionGroup.hasOwnProperty(actualPlayer.Position),
        ).toBeTruthy();
      }),
    );
  });
});
