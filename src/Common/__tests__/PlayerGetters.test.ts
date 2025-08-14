import { test, fc } from "@fast-check/vitest";
import { describe, assert } from "vitest";
import { assertNumbers } from "../Asserters";
import { over, partialRight } from "lodash/fp";
import { PositionGroup } from "../PlayerDataConstants";
import { assertBetweenZeroAndOneHundred } from "../Asserters";
import {
  fastCheckRandomPositionGroup,
  fastCheckRandomItemFromArray,
} from "../TestDataGenerators";
import {
  getPositionGroupAgeRange,
  getPositionGroupYearsLeftOnContractRange,
  getPositionGroupWagesRange,
  getPositionGroupHeightRange,
  getPositionGroupWeightRange,
  getPositionGroupManagerEffectRange,
  getPositionGroupTacklingRange,
  getPositionGroupPassingRange,
  getPositionGroupShootingRange,
  getPositionGroupDribblingRange,
  getPositionGroupMarkingRange,
  getPositionGroupVisionRange,
  getPositionGroupStrengthRange,
  getPositionGroupAttackingWorkRateRange,
  getPositionGroupDefendingWorkRateRange,
  getPositionGroupPositionalAwarenessRange,
  getPositionGroupSprintSpeedRange,
  getPositionGroupAgilityRange,
  getPositionGroupGKPositioningRange,
  getPositionGroupGKDivingRange,
  getPositionGroupGKHandlingRange,
  getPositionGroupGKReflexesRange,
  getPositionGroupBaseWageBillPercentage,
} from "../Getters";

describe("PlayerGetters test suite", () => {
  test("getPlayerBioDataRange", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const testGetters = [
          getPositionGroupAgeRange,
          getPositionGroupYearsLeftOnContractRange,
          getPositionGroupWagesRange,
          getPositionGroupHeightRange,
          getPositionGroupWeightRange,
          getPositionGroupManagerEffectRange,
          getPositionGroupTacklingRange,
          getPositionGroupPassingRange,
          getPositionGroupShootingRange,
          getPositionGroupDribblingRange,
          getPositionGroupMarkingRange,
          getPositionGroupVisionRange,
          getPositionGroupStrengthRange,
          getPositionGroupAttackingWorkRateRange,
          getPositionGroupDefendingWorkRateRange,
          getPositionGroupPositionalAwarenessRange,
          getPositionGroupSprintSpeedRange,
          getPositionGroupAgilityRange,
          getPositionGroupGKPositioningRange,
          getPositionGroupGKDivingRange,
          getPositionGroupGKHandlingRange,
          getPositionGroupGKReflexesRange,
        ];

        const [testGetter, testPositionGroup] = over<
          (positionGroup: PositionGroup) => [number, number] | PositionGroup
        >([
          partialRight(fastCheckRandomItemFromArray, [testGetters]),
          fastCheckRandomPositionGroup,
        ])(fcGen) as [
          (positionGroup: PositionGroup) => [number, number],
          PositionGroup,
        ];

        const actualRange: [number, number] = testGetter(testPositionGroup);
        assert.lengthOf(actualRange, 2);
        assertNumbers(actualRange);
      }),
    );
  });

  test("getPositionGroupBaseWageBillPercentage", () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
        const testPositionGroup = fastCheckRandomPositionGroup(fcGen);
        const actualWageBillPercentage: number =
          getPositionGroupBaseWageBillPercentage(testPositionGroup);
        assertBetweenZeroAndOneHundred(actualWageBillPercentage);
      }),
    );
  });
});
