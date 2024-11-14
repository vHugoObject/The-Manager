import { describe, expect, test, expectTypeOf } from "vitest";
import { simpleFaker } from "@faker-js/faker";
import { StatisticsObject, StatisticsType } from "../../Common/CommonTypes";
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
import { Competition } from "../CompetitionTypes";
import {
  createCompetitionClubsWithGeneratedPlayers,
  createCompetitionClubsWithGivenPlayers,
  generateCompetitionStatisticsObject,
  createCompetitionScheduler,
  createCompetition,
} from "../CompetitionUtilities";

describe("Competition Utilities tests", async () => {
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
    Statistics: expectedPlayerStatistics,
  };

  const testPlayerTwo: Player = {
    ID: "1",
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
    ID: "2",
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
    Skills: testPlayerSkills(),
    Statistics: expectedPlayerStatistics,
  };

  const testPlayerFour: Player = {
    ID: "4",
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
    Skills: testPlayerSkills(),
    Statistics: expectedPlayerStatistics,
  };

  const testPlayersOneArray: Array<Player> = [testPlayerOne, testPlayerTwo];
  const testPlayersTwoArray: Array<Player> = [testPlayerThree, testPlayerFour];
  

  const createPlayerReferences = async (
    players: Array<Player>,
  ): Promise<Record<string, string>> => {
    return Object.fromEntries(
      players.map((player: Player) => [player.ID, player.Name]),
    );
  };
  

  const testPlayersReferenceOne: Record<string, string> =
    await createPlayerReferences(testPlayersOneArray);
  const testPlayersReferenceTwo: Record<string, string> =
    await createPlayerReferences(testPlayersTwoArray);

  const testCompetitionName: string = "English Premier League";
  const testCompetitionCountry: string = "England";
  const testSeason: string = "2024";
  const testClubsNoPlayers: Record<string, string> = {
    [simpleFaker.string.numeric(6)]: "Arsenal",
    [simpleFaker.string.numeric(6)]: "Brentford"}

   interface ClubsWithPlayers {
    clubName: string;
    players: Array<Player>;
  }
  const testClubsWithPlayers: Record<string, ClubsWithPlayers> = {
    [simpleFaker.string.numeric(6)]: {clubName: "Arsenal", players: testPlayersOneArray},
    [simpleFaker.string.numeric(6)]: {clubName: "Brentford", players: testPlayersTwoArray}
  }
  

 
  test("test generateCompetitionStatisticsObject", async () => {
    const testSeason: string = "2024";

    const actualStatistics: StatisticsType =
      generateCompetitionStatisticsObject(testSeason);
    expect(actualStatistics).toMatchObject(expectedCompetitionStatistics);
  });

  test("Test createCompetitionClubsWithGeneratedPlayers", async () => {
    
    const expectedClubOne: Club = {
      ID: expect.any(String),
      Name: "Arsenal",
      Statistics: expectedClubStatistics,
      Squad: expect.anything(),
      Starting11: {},
      Bench: {},
    };

    const expectedClubTwo: Club = {
      ID: expect.any(String),
      Name: "Brentford",
      Statistics: expectedClubStatistics,
      Squad: expect.anything(),
      Starting11: {},
      Bench: {},
    };


    const expectedClubs: Array<Club> = [expectedClubOne, expectedClubTwo];

    const actualClubPlayerTuples: Array<[Club, Record<string, Player>]> =
      await createCompetitionClubsWithGeneratedPlayers(
        testSeason,
        testClubsNoPlayers,
      );


    expect(actualClubPlayerTuples.length).toBe(expectedClubs.length)
    actualClubPlayerTuples.forEach(([actualClub, players], index) => {
      expect(Object.values(actualClub.Squad).length).toBe(25);
    });
  });

  


  test("Test createCompetition - all players are randomly generated", async () => {
    const [actualCompetition, actualClubs, actualPlayers] =
      await createCompetition(
        testCompetitionName,
        testCompetitionCountry,
        testSeason,
        testClubsNoPlayers,
      );

    expect(actualCompetition.Name).toBe(testCompetitionName);
    expect(actualCompetition.Country).toBe(testCompetitionCountry);
    expect(actualCompetition.Statistics).toStrictEqual(
      expectedCompetitionStatistics,
    );

    const competitionClubNames: Array<string> = Object.values(
      actualCompetition.Clubs,
    );

    const expectedCompetitionClubNames: Array<string> = Object.values(
      testClubsWithPlayers).flatMap((club: ClubsWithPlayers) => club.clubName)


    expect(expectedCompetitionClubNames.toSorted()).toStrictEqual(
      competitionClubNames.toSorted(),
    );

    const actualClubObjects: Array<Club> = Object.values(actualClubs);
    const actualClubsObjectsNames: Array<string> = actualClubObjects.map(
      (club: Club) => club.Name,
    );
    expect(Object.values(testClubsNoPlayers).toSorted()).toStrictEqual(
      actualClubsObjectsNames.toSorted(),
    );

    actualClubObjects.forEach((actualClub: Club) => {
      const actualPlayers: Array<string> = Object.values(actualClub.Squad);
      expect(actualPlayers.length).toBe(25);
    });

    const expectedPlayersCount: number = actualClubObjects.length * 25;
    const actualPlayerValues: Array<Player> = Object.values(actualPlayers);
    expect(actualPlayerValues.length).toBe(expectedPlayersCount);
    actualPlayerValues.forEach((actualPlayer: Player) => {
      expectTypeOf(actualPlayer).toEqualTypeOf(testPlayerOne);
    });
  });

  
  });
