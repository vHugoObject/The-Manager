import { faker } from "@faker-js/faker";
import { playerSkills } from "./PlayerSkills";
import {
  Player,
  PositionGroup,
  Position,
  Foot,
  Midfielder,
  Attacker,
  Defender,
  Goalkeeper,
  PlayerStatistics,
  BiographicalDetails,
  ContractType,
  SkillSet,
  StatisticsObject,
} from "./PlayerTypes";

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

const playerComponentKeys = {
  standardStatsHeaders: expectedPlayerStandardStatsHeaders,
  bioParagraphs: expectedBioParagraphs,
};

const emptySeasonStatisticsObject: StatisticsObject = {
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

const positions = {
  Attacker,
  Midfielder,
  Defender,
  Goalkeeper,
};

export const getRandomNumberInRange = (min: number, max: number): number => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

export const generatePlayerSkills = (
  positionGroup: PositionGroup,
): Record<string, SkillSet> => {
  // skills will be based on positionGroup
  return Object.fromEntries(
    Object.entries(playerSkills).map(([name, set]) => [
      name,
      set.map((skill) => [skill, Math.round(Math.random() * 100)]),
    ]),
  );
};

export const generatePosition = (positionGroup: PositionGroup): Position => {
  if (positionGroup == PositionGroup.Goalkeeper) {
    return Goalkeeper.GK;
  }
  const playerPositionGroup: Array<Position> = Object.values(
    positions[positionGroup],
  );
  const groupLength: number = playerPositionGroup.length;
  return playerPositionGroup[getRandomNumberInRange(0, groupLength)];
};

export const generateBiographicalDetails = (
  positionGroup: PositionGroup,
): BiographicalDetails => {
  // height, weight and age will be based off position group
  const randomFoot: number = getRandomNumberInRange(0, 2);
  const heightRange: [number, number] = [160, 200];
  const weightRange: [number, number] = [60, 100];
  const ageRange: [number, number] = [18, 40];
  return {
    Name: faker.person.fullName({ sex: "male" }),
    PreferredFoot: [Foot.Right, Foot.Left][randomFoot],
    Height: getRandomNumberInRange(...heightRange),
    Weight: getRandomNumberInRange(...weightRange),
    Age: getRandomNumberInRange(...ageRange),
    NationalTeam: faker.location.country(),
  };
};

export const generateContract = (): ContractType => {
  const contractLengthRange: [number, number] = [1, 5];
  return {
    Wage: 1,
    Years: getRandomNumberInRange(...contractLengthRange),
  };
};

export const calculateValue = (
  playerRating: number,
  playerAge: number,
  positionGroup: PositionGroup,
): number => {
  return 1;
};

export const calculateRating = (positionGroup: PositionGroup): number => {
  // positionRange will be used to calculate rating
  return 1;
};

export const generatePlayerStatisticsObject = (
  startingSeason: string,
): PlayerStatistics => {
  return {
    BySeason: { [startingSeason]: emptySeasonStatisticsObject },
    GameLog: {},
  };
};

export const createPlayer = (
  id: number,
  positionGroup: PositionGroup,
  season: string,
  club?: string,
): Player => {
  const bio = generateBiographicalDetails(positionGroup);
  return {
    ID: id,
    Name: bio.Name,
    PositionGroup: positionGroup,
    PreferredPosition: generatePosition(positionGroup),
    PreferredFoot: bio.PreferredFoot,
    Weight: bio.Weight,
    Height: bio.Height,
    Age: bio.Age,
    NationalTeam: bio.NationalTeam,
    Club: club ? club : null,
    Contract: generateContract(),
    Value: 20_000_000,
    Rating: 80,
    Skills: generatePlayerSkills(positionGroup),
    Statistics: generatePlayerStatisticsObject(season),
    ComponentKeys: playerComponentKeys,
  };
};
