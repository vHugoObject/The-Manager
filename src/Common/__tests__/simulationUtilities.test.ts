import { describe, expect, test } from "vitest";
import { simpleFaker } from "@faker-js/faker";
import { differenceInDays, isBefore, isAfter } from "date-fns";
import {
  CalendarEntry,
  Calendar,
  StatisticsType,
  StatisticsObject,
  Entity,
} from "../CommonTypes";
import { Club } from "../../Clubs/ClubTypes";
import {
  Player,
  PositionGroup,
  Midfielder,
  Defender,
  SkillSet,
  Foot,
  ContractType,
} from "../../Players/PlayerTypes";
import { playerSkills } from "../../Players/PlayerSkills";
import {
  createCalendar,
  totalDoubleRoundRobinGames,
  entityObjectsMerger,
  entityObjectsReducer,
  entityObjectsCreator,
  entityReferencesCreator,
} from "../simulationUtilities";

describe("simulationUtilities test suite", async () => {
  const testSeason: string = "2024"
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
    [testSeason]: playerStatisticsObject 
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

  const testPlayerOne: Player = {
    ID: simpleFaker.string.numeric(4),
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
    Statistics: expectedPlayerStatistics,
  };

  const testPlayerTwo: Player = {
    ID: simpleFaker.string.numeric(4),
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
    Skills: testPlayerSkills(),
    Statistics: expectedPlayerStatistics,
  };

  const testPlayerThree: Player = {
    ID: simpleFaker.string.numeric(4),
    Name: "Gabriel",
    PositionGroup: PositionGroup.Defender,
    Position: Defender.RCB,
    PreferredFoot: Foot.Right,
    Weight: 76,
    Height: 183,
    Age: 27,
    NationalTeam: "England",
    Club: "Arsenal",
    Contract: expectedContract,
    Value: 1,
    Rating: 80,
    Skills: testPlayerSkills(),
    Statistics: expectedPlayerStatistics,
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

  const expectedClubStatistics: StatisticsType = {
    [testSeason]: testClubStatisticsOne
  };

  const testClubOne: Club = {
    ID: simpleFaker.string.numeric(4),
    Name: "Arsenal",
    Statistics: expectedClubStatistics,
    Squad: {},
    Starting11: {},
    Bench: {},
  };

  const testClubTwo: Club = {
    ID: simpleFaker.string.numeric(4),
    Name: "Manchester United",
    Statistics: expectedClubStatistics,
    Squad: {},
    Starting11: {},
    Bench: {},
  };

  const testClubThree: Club = {
    ID: simpleFaker.string.numeric(4),
    Name: "Liverpool",
    Statistics: expectedClubStatistics,
    Squad: {},
    Starting11: {},
    Bench: {},
  };

  test("test createCalendar", () => {
    const testFirstDay: Date = new Date("08/11/24");
    const expectedSeasonStartDate: Date = new Date("08/18/24");
    const expectedSeasonEndDate: Date = new Date("06/14/25");

    const expectedSummerTransferWindowCloseDate: Date = new Date("08/30/24");
    const expectedWinterTransferWindowOpenDate: Date = new Date("01/01/25");
    const expectedWinterTransferWindowCloseDate: Date = new Date("02/03/25");

    const expectedDays: number =
      differenceInDays(expectedSeasonEndDate, testFirstDay) + 1;

    const expectedSeasonStartDateValues: CalendarEntry = {
      matches: {},
      seasonStartDate: true,
      seasonEndDate: false,
      transferWindowOpen: true,
    };

    const expectedSeasonEndDateValues: CalendarEntry = {
      matches: {},
      seasonStartDate: false,
      seasonEndDate: true,
      transferWindowOpen: false,
    };

    const expectedTransferWindowOpenValues: CalendarEntry = {
      matches: {},
      seasonStartDate: false,
      seasonEndDate: false,
      transferWindowOpen: true,
    };

    const expectedTransferWindowClosedValues: CalendarEntry = {
      matches: {},
      seasonStartDate: false,
      seasonEndDate: false,
      transferWindowOpen: false,
    };

    const actualCalendar: Calendar = createCalendar(testFirstDay);

    expect(Object.keys(actualCalendar).length).toBe(expectedDays);
    expect(Object.keys(actualCalendar)[0]).toBe(testFirstDay.toDateString());
    expect(Object.keys(actualCalendar)[expectedDays - 1]).toBe(
      expectedSeasonEndDate.toDateString(),
    );
    expect(
      actualCalendar[expectedSeasonStartDate.toDateString()],
    ).toStrictEqual(expectedSeasonStartDateValues);
    expect(actualCalendar[expectedSeasonEndDate.toDateString()]).toStrictEqual(
      expectedSeasonEndDateValues,
    );

    Object.entries(actualCalendar).forEach(([date, dateValues]) => {
      const currentDate: Date = new Date(date);
      if (isBefore(currentDate, expectedSeasonStartDate)) {
        expect(dateValues).toStrictEqual(expectedTransferWindowOpenValues);
      }

      if (
        isAfter(currentDate, expectedSeasonStartDate) &&
        isBefore(currentDate, expectedSummerTransferWindowCloseDate)
      ) {
        expect(dateValues).toStrictEqual(expectedTransferWindowOpenValues);
      }

      if (
        isAfter(currentDate, expectedSummerTransferWindowCloseDate) &&
        isBefore(currentDate, expectedWinterTransferWindowOpenDate)
      ) {
        expect(dateValues).toStrictEqual(expectedTransferWindowClosedValues);
      }

      if (
        isAfter(currentDate, expectedWinterTransferWindowOpenDate) &&
        isBefore(currentDate, expectedWinterTransferWindowCloseDate)
      ) {
        expect(dateValues).toStrictEqual(expectedTransferWindowOpenValues);
      }

      if (
        isAfter(currentDate, expectedWinterTransferWindowCloseDate) &&
        isBefore(currentDate, expectedSeasonEndDate)
      ) {
        expect(dateValues).toStrictEqual(expectedTransferWindowClosedValues);
      }
    });
  });

  test("totalDoubleRoundRobinGames", () => {
    const tests: Array<[number, number]> = [
      [4, 12],
      [6, 30],
      [18, 306],
      [20, 380],
    ];
    tests.forEach(([clubs, expectedValue]) => {
      const actualValue: number = totalDoubleRoundRobinGames(clubs);
      expect(actualValue).toBe(expectedValue);
    });
  });

  test("entityObjectsCreator", async () => {
    const expectedClubOne: Record<string, Club> = {
      [testClubOne.ID]: testClubOne,
    };
    const expectedPlayerOne: Record<string, Player> = {
      [testPlayerOne.ID]: testPlayerOne,
    };
    const expectedEntityObjects: Array<Record<string, Entity>> = [
      expectedClubOne,
      expectedPlayerOne,
    ];
    const actualEntityObjects: Array<Record<string, Entity>> =
      await Promise.all(
        [testClubOne, testPlayerOne].map(
          async (entity: Entity) => await entityObjectsCreator([entity]),
        ),
      );
    expect(expectedEntityObjects.flat()).toStrictEqual(actualEntityObjects);
  });

  test("entityReferencesCreator", async () => {
    const expectedClubTwo: Record<string, string> = {
      [testClubTwo.ID]: testClubTwo.Name,
    };
    const expectedPlayerTwo: Record<string, string> = {
      [testPlayerTwo.ID]: testPlayerTwo.Name,
    };
    const expectedEntityReferences: Array<Record<string, string>> = [
      expectedClubTwo,
      expectedPlayerTwo,
    ];
    const actualEntityReferences: Array<Record<string, string>> =
      await Promise.all(
        [testClubTwo, testPlayerTwo].map(
          async (entity: Entity) => await entityReferencesCreator([entity]),
        ),
      );
    expect(expectedEntityReferences.flat()).toStrictEqual(
      actualEntityReferences,
    );
  });

  test("entityObjectsMerger", () => {
    const expectedClubs: Record<string, Club> = {
      [testClubOne.ID]: testClubOne,
      [testClubTwo.ID]: testClubTwo,
    };

    const expectedPlayers: Record<string, Player> = {
      [testPlayerOne.ID]: testPlayerOne,
      [testPlayerTwo.ID]: testPlayerTwo,
    };

    const testClubObjects: Array<Record<string, Club>> = [
      { [testClubOne.ID]: testClubOne },
      { [testClubTwo.ID]: testClubTwo },
    ];
    const testPlayerObjects: Array<Record<string, Player>> = [
      { [testPlayerOne.ID]: testPlayerOne },
      { [testPlayerTwo.ID]: testPlayerTwo },
    ];

    const actualClubs = entityObjectsMerger(...testClubObjects);
    expect(actualClubs).toStrictEqual(expectedClubs);
    const actualPlayers = entityObjectsMerger(...testPlayerObjects);
    expect(actualPlayers).toStrictEqual(expectedPlayers);
  });

  test("entityObjectsReducer", async () => {
    const expectedClubs: Record<string, Club> = {
      [testClubOne.ID]: testClubOne,
      [testClubTwo.ID]: testClubTwo,
      [testClubThree.ID]: testClubThree,
    };

    const expectedPlayers: Record<string, Player> = {
      [testPlayerOne.ID]: testPlayerOne,
      [testPlayerTwo.ID]: testPlayerTwo,
      [testPlayerThree.ID]: testPlayerThree,
    };

    const testClubObjects: Array<Record<string, Club>> = [
      { [testClubOne.ID]: testClubOne },
      { [testClubTwo.ID]: testClubTwo },
      { [testClubThree.ID]: testClubThree },
    ];
    const testPlayerObjects: Array<Record<string, Player>> = [
      { [testPlayerOne.ID]: testPlayerOne },
      { [testPlayerTwo.ID]: testPlayerTwo },
      { [testPlayerThree.ID]: testPlayerThree },
    ];

    const actualClubs = await entityObjectsReducer(testClubObjects);
    expect(actualClubs).toStrictEqual(expectedClubs);
    const actualPlayers = await entityObjectsReducer(testPlayerObjects);
    expect(actualPlayers).toStrictEqual(expectedPlayers);
  });
});
