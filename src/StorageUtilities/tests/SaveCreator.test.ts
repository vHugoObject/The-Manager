import { describe, expect, test, expectTypeOf } from "vitest";
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
import { Competition, BaseCompetitions, AllCompetitions } from "../../Competitions/CompetitionTypes";
import { createSave } from "../SaveCreator";
import { Save } from "../SaveTypes";

describe("Competition Utilities tests", () => {
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
    Club: "Arsenal",
    Contract: expectedContract,
    Value: 1,
    Rating: 80,
    Skills: testPlayerSkills,
    Statistics: expectedPlayerStatistics,
    ComponentKeys: expectedPlayerComponentKeys,
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
    ComponentKeys: expectedPlayerComponentKeys,
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
    ComponentKeys: expectedPlayerComponentKeys,
  };

  const testPlayersOne: Array<Player> = [testPlayerOne, testPlayerTwo];
  const testPlayersTwo: Array<Player> = [testPlayerThree, testPlayerFour];

  const testCountry: string = "England";
  const testCompetitionName: string = "English Premier League";
  const testSeason: string = "2024";
  const testClub: string = "Arsenal";
  const testPlayerName: string = "Mikel Arteta";
  const testCompetitions: BaseCompetitions = {
      England: { "English Premier League": [testClub] },
    }


  test("Test createSave", () => {
    const expectedClub: Club = {
      ID: 0,
      Name: testClub,
      Statistics: expectedClubStatistics,
      Players: expect.anything(),
      ComponentKeys: expectedClubComponentKeys,
    };

    const expectedCompetition: Competition = {
      Name: "English Premier League",
      Clubs: expect.anything(),
      Statistics: expectedCompetitionStatistics,
      ComponentKeys: expectedCompetitionComponentKeys,
    };    
        

    const expectedSave: Save = {
      Name: testPlayerName,
      Country: testCountry,
      MainCompetition: testCompetitionName,
      Club: testClub,
      Seasons: 1,
      CurrentSeason: "2024",
      allCompetitions: expect.anything()
    }; 

    const actualSave: Save = createSave(
      testPlayerName,
      testCountry,
      testCompetitionName,
      testSeason,
      testClub,
      testCompetitions
    );
    const actualCompetitions: Array<Competition> = Object.values(
      actualSave.allCompetitions,
    ).flatMap((actualComp) => Object.values(actualComp));

    expect(actualSave).toStrictEqual(expectedSave);

    actualCompetitions.forEach((actualCompetition, index) => {
      expect(actualCompetition).toStrictEqual(expectedCompetition);
      expectTypeOf(actualCompetition).toEqualTypeOf(expectedCompetition)
      actualCompetition.Clubs.forEach((actualClub: Club) => {
	expect(actualClub).toStrictEqual(expectedClub)
	expectTypeOf(actualClub).toEqualTypeOf(expectedClub)
	const actualPlayers: Array<Player> = actualClub.Players;
	expect(actualPlayers.length).toBe(25);
	expectTypeOf(actualPlayers).toEqualTypeOf(testPlayersOne);
	actualPlayers.forEach((testPlayer) => {
          expectTypeOf(testPlayer).toEqualTypeOf(testPlayerOne);
      });
      });
    });      
    });
  });

