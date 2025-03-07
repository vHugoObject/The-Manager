import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { zipAll, map, flatMap, first, last, sum } from "lodash/fp";
import { flowAsync } from "futil-js";
import { Player, PositionGroup } from "../PlayerTypes";
import {
  POSITIONGROUPSLIST as testPositionGroups,
  POSITIONS,
} from "../PlayerConstants";
import {
  PLAYERSKILLS,
  DEFENDINGSKILLS,
  GOALKEEPINGSKILLS,
  ATTACKINGSKILLS,
} from "../PlayerSkills";
import { convertToSet } from "../../Common/CommonUtilities";
import {
  generateGroupOfPlayerSkills,
  generateSkillsForMultiplePositionGroups,
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
    fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 })),
  ])("getRandomNumberInRange", async (testRange) => {
    const [expectedMin, expectedMax]: [number, number] = testRange;

    const actualNumber = await getRandomNumberInRange(testRange);
    expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
    expect(actualNumber).toBeLessThanOrEqual(expectedMax);
  });

  test.prop([
    fc.tuple(
      fc.constantFrom(
        ...[
          PositionGroup.Midfielder,
          PositionGroup.Defender,
          PositionGroup.Attacker,
          PositionGroup.Goalkeeper,
        ],
      ),
      fc.integer({ min: 100, max: 300 }),
      fc.nat(),
    ),
  ])(
    "generateGroupOfPlayerSkills",
    async (testPositionCountStartingIndexTuples) => {
      const expectedPlayerSkillsSet = new Set(PLAYERSKILLS);
      const actualPlayers: Array<[string, Record<string, number>]> =
        await generateGroupOfPlayerSkills(testPositionCountStartingIndexTuples);
      const [expectedPosition, expectedCount, expectedStartingIndex] =
        testPositionCountStartingIndexTuples;
      const expectedLastID: string = `${expectedPosition}_${expectedStartingIndex + expectedCount}`;
      const actualPlayerSkillSets = flowAsync(
        flatMap(flowAsync(last, Object.keys)),
        convertToSet,
      )(actualPlayers);

      expect(actualPlayerSkillSets).toStrictEqual(expectedPlayerSkillsSet);
      const actualPlayersIDsSet: Set<string> = flowAsync(
        zipAll,
        first,
        convertToSet,
      )(actualPlayers);
      expect(actualPlayers.length).toEqual(expectedCount);
      expect(actualPlayersIDsSet.has(expectedLastID)).toBeTruthy();
    },
  );

  test.prop([
    fc.tuple(
      fc.tuple(
        fc.constant(PositionGroup.Midfielder),
        fc.integer({ min: 100, max: 300 }),
        fc.nat(),
      ),
      fc.tuple(
        fc.constant(PositionGroup.Defender),
        fc.integer({ min: 100, max: 300 }),
        fc.nat(),
      ),
      fc.tuple(
        fc.constant(PositionGroup.Attacker),
        fc.integer({ min: 100, max: 300 }),
        fc.nat(),
      ),
      fc.tuple(
        fc.constant(PositionGroup.Goalkeeper),
        fc.integer({ min: 100, max: 300 }),
        fc.nat(),
      ),
    ),
  ])(
    "generateSkillsForMultiplePositionGroups",
    async (testPositionCountStartingIndexTuples) => {
      const [_, expectedCounts, __]: [
        Array<PositionGroup>,
        Array<number>,
        Array<number>,
      ] = zipAll(testPositionCountStartingIndexTuples);

      const actualPlayers: Record<
        string,
        Record<string, number>
      > = await generateSkillsForMultiplePositionGroups(
        testPositionCountStartingIndexTuples,
      );
      expect(Object.keys(actualPlayers).length).toEqual(sum(expectedCounts));
    },
  );

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
      { minLength: 100, maxLength: 200 },
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
