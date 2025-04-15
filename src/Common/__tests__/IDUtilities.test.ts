import { test, fc  } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { pipe, first, over } from "lodash/fp"
import { fastCheckNonSpaceRandomCharacterGenerator,
  fastCheckTestSingleStringCountTupleGenerator,
  fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator,
  fastCheckTestMixedArrayOfStringIDsGenerator
} from "../../TestingUtilities/TestDataGenerationUtilities"
import { spreadZipObject } from "../RecordUtilities"
import { zipAndGetSumOfArrayAtIndex, zipAllAndGetInitial  } from "../ArrayUtilities"
import { createStringID,
  unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs,
  getCountsForASetOfIDPrefixes,
  getIDPrefix,
  getIDSuffix
} from "../IDUtilities"

describe("StringUtilities test suite",  () => {


  test.prop([fc.gen(),
    fc.integer()
  ])(
    "createStringID",
     (fcGen, testIDNumber) => {
      
      const testString: string = fastCheckNonSpaceRandomCharacterGenerator(fcGen)
      const actualID: string = createStringID(testString, testIDNumber)
      expect(actualID.endsWith(testIDNumber.toString())).toBeTruthy()
      
    }
  );


  test.prop([fc.gen(),
    fc.integer()
  ])(
    "getIDPrefix",
     (fcGen) => {
      
      const [testString, testIDNumber]: [string, number] = fastCheckTestSingleStringCountTupleGenerator(fcGen)
      const testStringID: string = createStringID(testString, testIDNumber)
      const actualIDPrefix: string = getIDPrefix(testStringID)
      expect(actualIDPrefix).toEqual(testString)
      
    }
  );

  
    test.prop([fc.gen(),
    fc.integer()
  ])(
    "getIDSuffix",
     (fcGen) => {
      
       const [testString, testIDNumber]: [string, number] = fastCheckTestSingleStringCountTupleGenerator(fcGen)
       const testStringID: string = createStringID(testString, testIDNumber)
       const actualIDNumber: string = getIDSuffix(testStringID)
       const expectedIDNumber: string = testIDNumber.toString()
       expect(actualIDNumber).toBe(expectedIDNumber)
      
    }
  );
  
  test.prop([
    fc.integer({min: 2, max: 10}),
    fc.gen()
  ])(
    "unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs",
    (testArraySize, fcGen) => {
      const testTuples: Array<[string, number, number]> = fastCheckNLengthArrayOfStringCountStartingIndexTuplesGenerator(fcGen, testArraySize)      
      const expectedArraySize = zipAndGetSumOfArrayAtIndex(1, testTuples)
      const actualArray: Array<string> = unfoldStringStartingIndexAndCountTuplesIntoArrayOfStringIDs(testTuples)      
      expect(actualArray.length).toEqual(expectedArraySize)
    }
  );

  test.prop([
    fc.integer({min: 2, max: 10}),
    fc.gen()
  ])(
    "getCountsForASetOfIDPrefixes",
    (testIDPrefixes, fcGen) => {

      const [testStringIDs, testStringCountIndexTuples]: [Array<string>, Array<[string, number]>] = fastCheckTestMixedArrayOfStringIDsGenerator(fcGen, testIDPrefixes)
      const [testStrings, expectedCountsObject] = pipe([zipAllAndGetInitial, over([first, spreadZipObject])])(testStringCountIndexTuples)
      const actualCountsObject: Record<string, number> = getCountsForASetOfIDPrefixes(testStrings, testStringIDs)
      expect(actualCountsObject).toStrictEqual(expectedCountsObject)
      
    }
  );

  
  
});
