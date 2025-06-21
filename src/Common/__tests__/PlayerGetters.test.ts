import { test, fc } from "@fast-check/vitest";
import { describe, expect, assert } from "vitest";
import { assertNumbers } from "../Asserters"
import { over } from "lodash/fp"
import { fastCheckRandomPositionGroup,
  fastCheckGenerateRandomPlayerIDDataIndex,
  fastCheckTestPlayerIDGenerator,
  fastCheckGenerateRandomSkillIndex
} from "../TestDataGenerators"
import { getPlayerIDDataRange, getValueFromID } from "../Getters"

describe("PlayerGetters test suite", () => {

  test.prop([fc.gen()])(
    "getPlayerIDDataRange",
    (fcGen) => {
      const [testPositionGroup, testPlayerDataIndex] = over([fastCheckRandomPositionGroup, fastCheckGenerateRandomSkillIndex])(fcGen)
      const actualRange: [number, number] = getPlayerIDDataRange(testPositionGroup, testPlayerDataIndex)

      assert.lengthOf(actualRange, 2)
      assertNumbers(actualRange)
    },
  );

    test.prop([fc.gen()], {numRuns: 0})(
    "getValueFromID",
    (fcGen) => {

      const testPlayerID: string = fastCheckTestPlayerIDGenerator(fcGen)
      const testValueNumber: string = fastCheckGenerateRandomPlayerIDDataIndex(fcGen)
      const actualValue: string = getValueFromID(testValueNumber, testPlayerID)      
      expect(actualValue).not.toBe("_")
      assert.include(testPlayerID, actualValue)
      
      },
    
    );
 
  
})
