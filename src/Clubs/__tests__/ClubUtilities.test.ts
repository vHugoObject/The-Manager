import { simpleFaker } from "@faker-js/faker";
import { countBy } from 'lodash'
import { describe, expect, test, expectTypeOf } from "vitest";
import { Club } from "../ClubTypes";
import {
  Player,
  PositionGroup,
  Midfielder,
  Defender,
  Attacker,
  Goalkeeper,
  SkillSet,
  Foot,
  ContractType,
} from "../../Players/PlayerTypes";
import { StatisticsObject, StatisticsType } from "../../Common/CommonTypes";
import { entityObjectsCreator } from '../../Common/simulationUtilities'
import { playerSkills } from "../../Players/PlayerSkills";
import {
  generateSquad,
  generateClubStatisticsObject,
  createClub,
  getBestStarting11
} from "../ClubUtilities";


describe("Club Utilities tests", async () => {
  const testSeason: string = "2024";
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
     [testSeason]: testClubStatisticsOne
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
    Statistics: expectedStatistics,
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
    Statistics: expectedStatistics,
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
    Statistics: expectedStatistics,
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
    Statistics: expectedStatistics,
  };

  const testPlayersArray: Array<Player> = [testMidfielderOne, testDefenderOne, testAttackerOne, testGoalkeeperOne];
  const testPlayersObject: Record<string, string> = Object.fromEntries(
    testPlayersArray.map((player: Player, index) => {
      return [index.toString(), player.Name];
    }),
  );

  const expectedClubOne: Club = {
    ID: expect.any(String),
    Name: "Arsenal",
    Statistics: expectedStatistics,
    Squad: testPlayersObject,
    Starting11: {},
    Bench: {},
  };

  const expectedClubTwo: Club = {
    ID: expect.any(String),
    Name: "Arsenal",
    Statistics: expectedStatistics,
    Squad: expect.anything(),
    Starting11: expect.anything(),
    Bench: expect.anything(),
  };

  const testTeamName: string = "Arsenal";
  const testTeamID: string = "0";

  const getPositionCounts = (players: Record<string, Player> | Array<Player>) => {
    const actualPlayerPositions: Array<PositionGroup> = Object.values(players)
      .map((player: Player) => player.PositionGroup)
    return countBy<PositionGroup>(actualPlayerPositions)
  }
  

          

  test("test generateClubStatisticsObject", async () => {
    const testSeason: string = "2024";
    const actualStatistics: StatisticsType =
      await generateClubStatisticsObject(testSeason);
    expect(actualStatistics).toMatchObject(expectedStatistics);
  });

  test("Test generateSquad", async () => {
    const actualPlayers: Array<Player> = await generateSquad(
      testTeamName,
      testTeamID,
      testSeason,
    );

    const actualPlayerObjects: Record<string, Player> = await entityObjectsCreator(actualPlayers)
    
    const actualPlayerPositionCounts = getPositionCounts(actualPlayerObjects);
    
    expect(actualPlayerPositionCounts[PositionGroup.Goalkeeper]).toBe(4)
    const outfieldPositionGroups: Array<PositionGroup> = [PositionGroup.Defender, PositionGroup.Midfielder, PositionGroup.Attacker]
    outfieldPositionGroups.forEach((positionGroup: PositionGroup) => {
      expect(actualPlayerPositionCounts[positionGroup]).toBe(7)
    })

    expect(actualPlayers.length).toBe(25);
    
  });

  test("Test createClub with given players", async () => {
    const [actualClub, actualPlayers] = await createClub(
      simpleFaker.string.numeric(6),
      testTeamName,
      testSeason,
      testPlayersArray,
    );
  
    expect(actualClub).toStrictEqual(expectedClubOne);
  });

  

  test("Test getBestStarting11", async () => {
    const [_,testPlayers] = await createClub(
      simpleFaker.string.numeric(6),
      testTeamName,
      testSeason,
    );
    
    const [actualPlayerReferences, actualPlayerObjects] = await getBestStarting11(testPlayers);
    const actualStarting11IDs: Array<string> = Object.keys(actualPlayerReferences)

    
    const actualPlayerPositionCounts = getPositionCounts(actualPlayerObjects)
    expect(actualPlayerPositionCounts[PositionGroup.Goalkeeper]).toBe(1)
    const outfieldPositionGroups: Array<PositionGroup> = [PositionGroup.Defender, PositionGroup.Midfielder, PositionGroup.Attacker]
    outfieldPositionGroups.forEach((positionGroup: PositionGroup) => {
      expect(actualPlayerPositionCounts[positionGroup]).toBeGreaterThanOrEqual(3)
    })
    expect(actualStarting11IDs.length).toBe(11)
   
    
  })

  
  
  test("Test createClub with no players", async () => {
    const [actualClub, actualPlayers] = await createClub(
      simpleFaker.string.numeric(6),
      testTeamName,
      testSeason,
    );

    expect(actualClub).toStrictEqual(expectedClubTwo);

    const actualPlayersArray: Array<Player> = Object.values(actualPlayers);
    expect(actualPlayersArray.length).toBe(25);
    expectTypeOf(actualPlayersArray).toEqualTypeOf(testPlayersArray);

    const actualClubPlayers: Array<String> = Object.values(actualClub.Squad);
    expect(actualClubPlayers.length).toBe(25);

  });
  
});
