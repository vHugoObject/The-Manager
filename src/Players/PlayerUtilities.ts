import { faker } from "@faker-js/faker";
import { flow, mean, mapValues, isEqual, filter } from "lodash/fp";
import { partial, range } from "lodash";
import { promiseProps, flowAsync } from "futil-js";
import {
  playerSkills,
  defenseCategories,
  attackCategories,
  goalkeepingCategories,
} from "./PlayerSkills";
import { StatisticsType, StatisticsObject } from "../Common/CommonTypes";
import {
  Player,
  PositionType,
  PositionGroup,
  Foot,
  Midfielder,
  Attacker,
  Defender,
  Goalkeeper,
  BiographicalDetails,
  ContractType,
  SkillSet,
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

export const isGoalkeeper = isEqual(PositionGroup.Goalkeeper);
export const isDefender = isEqual(PositionGroup.Defender);
export const isMidfielder = isEqual(PositionGroup.Midfielder);
export const isAttacker = isEqual(PositionGroup.Attacker);

export const playerIsGoalkeeper = (player: Player): boolean =>
  isGoalkeeper(player.PositionGroup);
export const playerIsNotGoalkeeper = (player: Player): boolean =>
  !isGoalkeeper(player.PositionGroup);
export const playerIsDefender = (player: Player): boolean =>
  isDefender(player.PositionGroup);
export const playerIsMidfielder = (player: Player): boolean =>
  isMidfielder(player.PositionGroup);
export const playerIsAttacker = (player: Player): boolean =>
  isAttacker(player.PositionGroup);

export const filterGoalkeepers = filter(playerIsGoalkeeper);
export const filterDefenders = filter(playerIsDefender);
export const filterMidfielders = filter(playerIsMidfielder);
export const filterAttackers = filter(playerIsAttacker);
export const filterOutfieldPlayers = filter(playerIsNotGoalkeeper);

export const getPlayerSkills = async (
  player: Player,
): Promise<Record<string, SkillSet>> => player.Skills;

export const getListOfPlayerSkills = async (
  players: Array<Player>,
): Promise<Array<Record<string, SkillSet>>> => {
  return await Promise.all(
    players.map(async (player: Player) => getPlayerSkills(player)),
  );
};

export const getAverageOfSetOfSkillCategories = async (
  skillCategories: Set<string>,
  skillSets: Record<string, SkillSet>,
): Promise<number> => {
  const getSkillSetsFilterer = (
    skills: Record<string, SkillSet>,
  ): Record<string, SkillSet> => {
    return Object.fromEntries(
      Object.entries(skills).filter(([key, _]) => skillCategories.has(key)),
    );
  };

  const getMeanOfSkillValues = (
    skillValues: Record<string, number>,
  ): number => {
    return mean(Object.values(skillValues));
  };

  const getMeanSkillValuesMapper = (
    skills: Record<string, SkillSet>,
  ): Record<string, number> => {
    return mapValues(getMeanOfSkillValues, skills);
  };

  const getAverage = flow(
    getSkillSetsFilterer,
    getMeanSkillValuesMapper,
    getMeanOfSkillValues,
  );

  return getAverage(skillSets);
};

export const getListOfAveragesOfSetOfSkillCategories = async (
  skillCategories: Set<string>,
  listOfSkillSets: Array<Record<string, SkillSet>>,
): Promise<Array<number>> => {
  return await Promise.all(
    listOfSkillSets.map(
      async (skillSet) =>
        await getAverageOfSetOfSkillCategories(skillCategories, skillSet),
    ),
  );
};
export const goalkeepingRating = partial(
  getListOfAveragesOfSetOfSkillCategories,
  goalkeepingCategories,
);
export const outfieldPlayersDefendingRatings = partial(
  getListOfAveragesOfSetOfSkillCategories,
  defenseCategories,
);

export const attackingRatings = partial(
  getListOfAveragesOfSetOfSkillCategories,
  attackCategories,
);

export const getGoalkeepingRating = flowAsync(
  getListOfPlayerSkills,
  goalkeepingRating,
);
export const getOutfieldPlayersDefendingRatings = flowAsync(
  filterOutfieldPlayers,
  getListOfPlayerSkills,
  outfieldPlayersDefendingRatings,
);
export const getAttackingRatings = flowAsync(
  getListOfPlayerSkills,
  attackingRatings,
);

export const generatePlayerSkills = async (
  positionGroup: PositionGroup,
): Promise<Record<string, SkillSet>> => {
  const randomSkillValue = (skill: string) => [
    skill,
    getRandomNumberInRange(25, 100),
  ];
  const randomSkills = (skillSet: Array<string>) =>
    Object.fromEntries(skillSet.map(randomSkillValue));
  const randomSkillsMapper = mapValues(randomSkills);
  return randomSkillsMapper(playerSkills);
};

export const generatePosition = async (
  positionGroup: PositionGroup,
): Promise<PositionType> => {
  if (positionGroup == PositionGroup.Goalkeeper) {
    return Goalkeeper.GK;
  }
  const playerPositionGroup: Array<PositionType> = Object.values(
    positions[positionGroup],
  );
  const groupLength: number = playerPositionGroup.length;
  return playerPositionGroup[getRandomNumberInRange(0, groupLength)];
};

export const generateBiographicalDetails = async (
  positionGroup: PositionGroup,
): Promise<BiographicalDetails> => {
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

export const generateContract = async (): Promise<ContractType> => {
  const contractLengthRange: [number, number] = [1, 5];
  return {
    Wage: 1,
    Years: getRandomNumberInRange(...contractLengthRange),
  };
};

export const calculatePlayerRating = async (
  skills: Record<string, SkillSet>,
  positionGroup: PositionGroup,
): Promise<number> => {
  // positionRange will be used to calculate rating
  const skillAverage = (skillSet: Record<string, number>): number =>
    mean(Object.values(skillSet));
  const skillAverageMapper = mapValues(skillAverage);
  const calculateRating = flow(skillAverageMapper, skillAverage);
  return calculateRating(skills);
};

export const calculateValue = (
  playerRating: number,
  playerAge: number,
  positionGroup: PositionGroup,
): number => {
  return 1;
};

export const generatePlayerStatisticsObject = async (
  season: string,
): Promise<StatisticsType> => {
  return {
    [season]: emptySeasonStatisticsObject,
  };
};

export const createPlayer = async (
  positionGroup: PositionGroup,
  season: string,
  club?: string,
): Promise<Player> => {
  const [bio, Skills] = await Promise.all([
    await generateBiographicalDetails(positionGroup),
    await generatePlayerSkills(positionGroup),
  ]);
  return promiseProps({
    ID: faker.string.numeric(6),
    Name: bio.Name,
    PositionGroup: positionGroup,
    Position: await generatePosition(positionGroup),
    PreferredFoot: bio.PreferredFoot,
    Weight: bio.Weight,
    Height: bio.Height,
    Age: bio.Age,
    NationalTeam: bio.NationalTeam,
    Club: club ? club : null,
    Contract: await generateContract(),
    Value: 20_000_000,
    Rating: await calculatePlayerRating(Skills, positionGroup),
    Skills,
  });
};

export const createGoalkeeper = partial(createPlayer, PositionGroup.Goalkeeper);
export const createDefender = partial(createPlayer, PositionGroup.Defender);
export const createMidfielder = partial(createPlayer, PositionGroup.Midfielder);
export const createAttacker = partial(createPlayer, PositionGroup.Attacker);

export const createGoalkeepers = async (
  playerCount: number,
  [season, club]: [string, string],
): Promise<Array<Player>> => {
  return await Promise.all(
    range(0, playerCount).map(async (_) => {
      return await createGoalkeeper(season, club);
    }),
  );
};

export const createDefenders = async (
  playerCount: number,
  [season, club]: [string, string],
): Promise<Array<Player>> => {
  return await Promise.all(
    range(0, playerCount).map(async (_) => {
      return await createDefender(season, club);
    }),
  );
};

export const createMidfielders = async (
  playerCount: number,
  [season, club]: [string, string],
): Promise<Array<Player>> => {
  return await Promise.all(
    range(0, playerCount).map(async (_) => {
      return await createMidfielder(season, club);
    }),
  );
};

export const createAttackers = async (
  playerCount: number,
  [season, club]: [string, string],
): Promise<Array<Player>> => {
  return await Promise.all(
    range(0, playerCount).map(async (_) => {
      return await createAttacker(season, club);
    }),
  );
};
