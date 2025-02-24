import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  zipAll,
  map,
  min,
  max,
  over,
  flatMap,
  sum,
  multiply,
  flatten,
} from "lodash/fp";
import { flowAsync } from "futil-js";
import {
  Player,
  PositionGroup,
  PositionType,
  Midfielder,
  Attacker,
  Goalkeeper,
  Defender,
  BiographicalDetails,
  ContractType,
} from "../PlayerTypes";
import {
  POSITIONGROUPSLIST as testPositionGroups,
  POSITIONS,
  BIORANGES,
} from "../PlayerConstants";
import {
  PLAYERSKILLS,
  DEFENDINGSKILLS,
  GOALKEEPINGSKILLS,
  ATTACKINGSKILLS,
} from "../PlayerSkills";
import {
  convertArrayOfArraysToArrayOfSets,
  convertToSet,
} from "../../Common/CommonUtilities";
import {
  generatePlayerSkills,
  generatePosition,
  createPlayer,
  getAverageOfSetOfSkillCategories,
  getListOfAveragesOfSetOfSkillCategories,
  getPlayerSkills,
  getListOfPlayerSkills,
  getOutfieldPlayersDefendingRatings,
  getGoalkeepingRating,
  getAttackingRatings,
  getRandomNumberInRange,
} from "../PlayerUtilities";

describe("Player utilities tests", async () => {
  const testCategories: Array<Set<string>> = [
    DEFENDINGSKILLS,
    GOALKEEPINGSKILLS,
    ATTACKINGSKILLS,
  ];

  test.prop([
    fc.array(fc.tuple(fc.nat(), fc.nat({ max: 1000 })), {
      minLength: 2000,
      maxLength: 10000,
    }),
  ])("getRandomNumberInRange", async (testRanges) => {
    await flowAsync(
      map(async (testTuple: [number, number]) => {
        const testRange = over([min, max])(testTuple) as [number, number];
        const [expectedMin, expectedMax]: [number, number] = testRange;

        const actualNumber = await getRandomNumberInRange(testTuple);
        expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
        expect(actualNumber).toBeLessThanOrEqual(expectedMax);
      }),
    )(testRanges);
  });

  test.prop([
    fc.array(fc.constantFrom(...testPositionGroups), {
      minLength: 2000,
      maxLength: 10000,
    }),
  ])("generatePlayerSkills", async (testPositions) => {
    const expectedPlayerSkillsSet = new Set(PLAYERSKILLS);
    const actualPlayerSkills: Array<Record<string, number>> = await flowAsync(
      map(generatePlayerSkills),
    )(testPositions);
    const actualPlayerSkillSets = flowAsync(
      flatMap(Object.keys),
      convertToSet,
    )(actualPlayerSkills);
    expect(actualPlayerSkillSets).toStrictEqual(expectedPlayerSkillsSet);
  });

  test.prop([
    fc.array(fc.constantFrom(...testPositionGroups), {
      minLength: 1,
      maxLength: 1,
    }),
  ])("generatePosition", async (testPositions) => {
    await flowAsync(
      map(async (testPosition: PositionGroup) => {
        const actualPosition = await generatePosition(testPosition);
        const expectedPositionGroup = POSITIONS[testPosition];
        expect(
          expectedPositionGroup.hasOwnProperty(actualPosition),
        ).toBeTruthy();
      }),
    )(testPositions);
  });

  test.prop([
    fc.array(
      fc.tuple(
        fc.string(),
        fc.constantFrom(
          ...[
            PositionGroup.Midfielder,
            PositionGroup.Defender,
            PositionGroup.Attacker,
            PositionGroup.Goalkeeper,
          ],
        ),
      ),
      { minLength: 2000, maxLength: 10000 },
    ),
  ])("createPlayer", async (testIDPositionGroupTuples) => {
    const expectedPlayerKeys: Set<string> = new Set([
      "ID",
      "Name",
      "PositionGroup",
      "Position",
      "Height",
      "Weight",
      "Age",
      "NationalTeam",
      "Contract",
      "Value",
      "Skills",
    ]);

    const actualPlayers: Array<Player> = await flowAsync(
      map(async (testIDPositionGroupTuple: [string, PositionGroup]) => {
        return await createPlayer(testIDPositionGroupTuple);
      }),
    )(testIDPositionGroupTuples);

    const actualPlayerKeys: Array<string> = flowAsync(
      flatMap(Object.keys),
      convertToSet,
    )(actualPlayers);
    expect(actualPlayerKeys).toStrictEqual(expectedPlayerKeys);
  });
});
