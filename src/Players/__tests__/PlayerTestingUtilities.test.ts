import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { zip } from "lodash/fp"
import { flowAsync } from "futil-js";
import { PositionGroup } from "../PlayerTypes";
import { countByIdentity, firstAndLastItemsOfList, convertListOfIntegersIntoListOfStrings } from "../../Common/index"
import { getPlayerPositionGroupFromID } from "../PlayerUtilities"
import {  getPositionGroupSetOfGroupOfPlayers,
  generateTestPositionGroupIDs,
  splitFirstPlayerIDIntoAList,
  getActualPositionCountStartingIndexTuplesSet
} from "../PlayerTestingUtilities"


describe("PlayerTestingUtilities tests", async () => {

  const POSITIONGROUPSLIST = Object.values(PositionGroup)

  // fc.tuple(
  //     fc.constantFrom(
  //       ...POSITIONGROUPSLIST
  //     ),
  //     fc.integer({ min: 100, max: 300 }),
  //     fc.nat(),
  //   ),
  // generateTestPositionCountStartingIndexTuples
  // generateAllTestPositionCountStartingIndexTuples

      
  test.prop([
    fc.array(fc.integer({min: 1, max: 25}), {minLength: 4, maxLength: 4})
  ])(
    "fastCheckGenerateTestPositionGroupIDs",
    async (testCounts) => {
      const testPositionGroupCountTuples = zip(POSITIONGROUPSLIST, testCounts)
      //expandStartingIndexAndCountIntoListOfStringIDs
      const testMixedPositionGroupsArray = (testPositionGroupCountTuples)
      
    }
  );
  

  
})
