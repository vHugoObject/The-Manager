import { describe, expect, assert } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { fakerToArb } from "../../Common/index"
import { zipAll, map, flatMap, first, last, sum, min, max, over, size, add, multiply, mean } from "lodash/fp";
import { flowAsync } from "futil-js";
import { PositionGroup } from "../PlayerTypes";
import {
  PLAYERBIOKEYS,
  POSITIONGROUPSLIST,
} from "../PlayerBioConstants";
import { PLAYERSKILLSANDPHYSICALDATAKEYS } from "../PlayerDataConstants"
import { convertToSet, convertArrayOfArraysToArrayOfSets ,convertBaseCountriesToBaseEntities, getExpectedPlayersCount,addOne } from "../../Common/index";
import { BaseEntities } from "../../Common/CommonTypes";
import {
  getRandomNumberInRange,
  getRandomPlusOrMinus,  
  boundedModularAddition,
  mapModularIncreasersWithTheSameAverageStep,
  mapModularIncreasersWithDifferentStepsForARange,
  convertListOfStringsIntoRange,
  convertListOfListsOfStringsIntoListOfRanges,
  generateDataForAGroupOfPlayersByAveragingModularIncreases,
  generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers,
  runModularIncreasersModularlyOverARangeOfPlayers,
  runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers,
  getAverageModularStepForRangeOfData,
  generateSkillsAndPhysicalDataForMultiplePositionGroups,
  generatePlayerSkillsAndPhysicalDataForListOfClubs,
  generatePlayerBioDataForMultiplePositionGroups,
  generatePlayerBioDataForListOfClubs,
  getTotalPlayersToGenerateBasedOnGivenComposition
} from "../PlayerUtilities";

describe("Player utilities tests", async () => {

  const getUndadjustedAverageStepForASetOfModularRanges = flowAsync(
    map(([min, max]: [number, number]) => addOne(max - min)),
    mean,
    Math.ceil,
  )


  test.prop([
    fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1000 })),
  ])("getRandomNumberInRange", async (testRange) => {
    const [expectedMin, expectedMax]: [number, number] = testRange;

    const actualNumber = await getRandomNumberInRange(testRange);    
    expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
    expect(actualNumber).toBeLessThanOrEqual(expectedMax);
  });

    test.prop([
    fc.array(fakerToArb((faker) => faker.word.noun()), {minLength: 10})
    ])("convertListOfStringsIntoRange", async (testListOfStrings) => {
    const [firstIndex, lastIndex]: [number, number] = convertListOfStringsIntoRange(testListOfStrings)
    expect(testListOfStrings[firstIndex]).toBe(first(testListOfStrings))
    expect(testListOfStrings[lastIndex]).toBe(last(testListOfStrings))
    
  })


  test.prop([
    fc.array(fc.array(fakerToArb((faker) => faker.word.noun()), {minLength: 10}), {minLength: 3})
  ])("convertListOfListsOfStringsIntoListOfRanges", async (testListOfListsOfStrings) => {
    
    const actualRanges: Array<[number, number]> = convertListOfListsOfStringsIntoListOfRanges(testListOfListsOfStrings)
    expect(actualRanges.length).toEqual(testListOfListsOfStrings.length)

    
  })
  
  test.prop([
    fc.integer({min: 1})
  ])("getRandomPlusOrMinus", async (testNumber) => {

    const actualNumber = await getRandomPlusOrMinus(testNumber);
    const expectedMin: number = -1 * testNumber
    expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
    expect(actualNumber).toBeLessThan(testNumber);
  });

  

    test.prop([
      fc.array(fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 })), {minLength: 3})
    ])("getUndadjustedAverageStepForASetOfModularRanges", async (testRanges) => {
      
      const [expectedMin, expectedMax]: [number, number] = over([flowAsync(map(first), min), flowAsync(map(last), max)])(testRanges);
      const actualStep: number = getUndadjustedAverageStepForASetOfModularRanges(testRanges);
      expect(actualStep).toBeGreaterThan(expectedMin);
      expect(actualStep).toBeLessThan(expectedMax);
    
    
    })


    test.prop([
    fc.array(fc.tuple(fc.integer({min: 0, max: 1000}), fc.integer({ min: 1001})), {minLength: 3}),
    fc.integer({min: 100, max: 1000})
  ])("getAverageModularStepForRangeOfData", async (testRanges, testPlayerCount) => {

    const actualAdjustedStep: number = getAverageModularStepForRangeOfData(testRanges, testPlayerCount)
    const unadjustedStep: number = getUndadjustedAverageStepForASetOfModularRanges(testRanges)
    expect(actualAdjustedStep).toBeLessThan(unadjustedStep)
    
    });


  test.prop([
    fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 }))
      .chain(([min, max]: [number, number]) => {
	return fc.tuple(fc.tuple(fc.tuple(fc.constant(min), fc.constant(max)), fc.integer({min, max})),fc.integer({min, max: min*3}))
      })
  ])("boundedModularAddition", async (testRangeIncreaseAndCurrentNumber) => {

    const [testRangeAndIncrease, testCurrentNumber]: [[[number, number], number], number] = testRangeIncreaseAndCurrentNumber
    const testPartialBoundedModularAdditionFunction = boundedModularAddition(testRangeAndIncrease)
    const actualNumber: number = testPartialBoundedModularAdditionFunction(testCurrentNumber)
    const [[expectedMin, expectedMax], ]: [[number, number], number] = testRangeAndIncrease
    expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
    expect(actualNumber).toBeLessThanOrEqual(expectedMax);
  });



  test.prop([
    fc.array(fc.tuple(fc.integer({min: 0, max: 50}), fc.integer({ min: 51, max: 100})), {minLength: 3}
    ),
    fc.integer({min: 5, max: 10}),
    fc.integer({min: 100, max: 1000})
  ])("mapModularIncreasersWithTheSameAverageStep", async (testRanges, testRandomPlusOrMinus, testPlayerCount) => {

      const actualModularIncreasers = await mapModularIncreasersWithTheSameAverageStep([testRandomPlusOrMinus, testPlayerCount], testRanges);


    map(([[min, max], actualFunction]: [[number, number], Function]) => {
      const actualValue = actualFunction(max)
      assert.isNumber(actualValue)
    })(zipAll([testRanges, actualModularIncreasers]))
                  
  });

    test.prop([
    fc.array(fc.tuple(fc.integer({min: 0, max: 50}), fc.integer({ min: 51, max: 100})), {minLength: 3}
    ),
    fc.integer({min: 100, max: 1000})
  ])("mapModularIncreasersWithDifferentStepsForARange", async (testRanges, testPlayerCount) => {

      const actualModularIncreasers = mapModularIncreasersWithDifferentStepsForARange(testPlayerCount, testRanges);

    map(([[min, max], actualFunction]: [[number, number], Function]) => {
      const actualValue = actualFunction(max)
      expect(actualValue).toBeLessThanOrEqual(max)
      expect(actualValue).toBeGreaterThanOrEqual(min)
    })(zipAll([testRanges, actualModularIncreasers]))
    

  });
      
  test.prop([
    fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 }), fc.integer({min: 3, max: 30}))
      .chain(([min, max, minLength]:[number, number, number]) => {
	return fc.tuple(fc.array(fakerToArb((faker) => faker.word.noun()), {minLength, maxLength: minLength}),
	  fc.array(fc.integer({ min, max }), {minLength, maxLength: minLength}),
	  fc.array(fc.integer({ min: Math.floor(max/10), max: Math.floor(max/5) }), {minLength, maxLength: minLength}),
	)    
      }),
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
    "runModularIncreasersModularlyOverARangeOfPlayers",
    async (testRangeNamesStartingRangeAndIncreases, testPositionCountStartingIndex) => {


      const [testRangeNames, testStartingRange, testIncreases]: [Array<string>, Array<number>, Array<number>] = testRangeNamesStartingRangeAndIncreases
      const expectedPlayerDataKeys: Set<string> = new Set(testRangeNames);

      const testIncreasers = map((testIncrease: number) => add(testIncrease))(testIncreases)
      const actualPlayers: Array<[string, Record<string, number>]> =
            runModularIncreasersModularlyOverARangeOfPlayers([testRangeNames, testStartingRange, testIncreasers],testPositionCountStartingIndex);
      
      const [expectedPosition, expectedCount, expectedStartingIndex]: [PositionGroup, number, number] =
            testPositionCountStartingIndex;
      
      expect(actualPlayers.length).toEqual(expectedCount);      
      const expectedLastID: string = `${expectedPosition}_${expectedStartingIndex + expectedCount}`;
      
      const actualPlayerDataKeys = flowAsync(
        flatMap(flowAsync(last, Object.keys)),
        convertToSet,
      )(actualPlayers);      
      expect(actualPlayerDataKeys).toStrictEqual(expectedPlayerDataKeys);

      
      const [actualPlayersIDs, actualPlayerDataValues] = zipAll(actualPlayers);            
      const actualPlayersIDsSet: Set<string> = convertToSet(actualPlayersIDs)
            
      expect(actualPlayersIDsSet.has(expectedLastID)).toBeTruthy();

      const sumOfActualPlayerDataValues: number = flowAsync(
	flatMap(Object.values),
	sum,
      )(actualPlayerDataValues)

      const expectedStartingRangeMultipliedByPlayerCount = flowAsync(sum, multiply(expectedCount))(testStartingRange)
      expect(sumOfActualPlayerDataValues).toBeGreaterThan(expectedStartingRangeMultipliedByPlayerCount)
      
    },
  );


    test.prop([
    fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 }), fc.integer({min: 3, max: 30}))
      .chain(([min, max, minLength]:[number, number, number]) => {
	return fc.tuple(fc.array(fakerToArb((faker) => faker.word.noun()), {minLength, maxLength: minLength}),
	  fc.array(fc.integer({ min, max }), {minLength, maxLength: minLength}),
	  fc.array(fc.integer({ min: Math.floor(max/10), max: Math.floor(max/5) }), {minLength, maxLength: minLength}),
	)    
      }),
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
    "runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers",
    async (testRangeNamesStartingRangeAndIncreases, testPositionCountStartingIndex) => {


      const [testRangeNames, testStartingRange, testIncreases]: [Array<string>, Array<number>, Array<number>] = testRangeNamesStartingRangeAndIncreases
      const expectedPlayerDataKeys: Set<string> = new Set(testRangeNames);

      const testIncreasers = map((testIncrease: number) => add(testIncrease))(testIncreases)
      const actualPlayers: Array<[string, Record<string, number>]> =
            runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers([testRangeNames, testStartingRange, testIncreasers],testPositionCountStartingIndex);
      
      const [expectedPosition, expectedCount, expectedStartingIndex]: [PositionGroup, number, number] =
            testPositionCountStartingIndex;
      
      expect(actualPlayers.length).toEqual(expectedCount);      
      const expectedLastID: string = `${expectedPosition}_${expectedStartingIndex + expectedCount}`;
      
      const actualPlayerDataKeys = flowAsync(
        flatMap(flowAsync(last, Object.keys)),
        convertToSet,
      )(actualPlayers);      
      expect(actualPlayerDataKeys).toStrictEqual(expectedPlayerDataKeys);

      
      const [actualPlayersIDs, actualPlayerDataValues] = zipAll(actualPlayers);            
      const actualPlayersIDsSet: Set<string> = convertToSet(actualPlayersIDs)
            
      expect(actualPlayersIDsSet.has(expectedLastID)).toBeTruthy();

      const sumOfActualPlayerDataValues: number = flowAsync(
	flatMap(Object.values),
	sum,
      )(actualPlayerDataValues)

      const expectedStartingRangeMultipliedByPlayerCount = flowAsync(sum, multiply(expectedCount))(testStartingRange)
      expect(sumOfActualPlayerDataValues).toBeGreaterThan(expectedStartingRangeMultipliedByPlayerCount)
      
    },
  );


  
  test.prop([
    fc.integer({min: 3, max: 30})
      .chain((minLength: number) => {
	return fc.tuple(fc.array(fakerToArb((faker) => faker.word.noun()), {minLength, maxLength: minLength}),
	  fc.array(fc.tuple(fc.integer({ min: 0, max: 50 }), fc.integer({ min: 51, max: 100 })), {minLength, maxLength: minLength}))    
      }),
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
    fc.gen()
  ])(
    "generateDataForAGroupOfPlayersByAveragingModularIncreases",
    async (testRangeNamesAndRanges, testPositionCountAndStartingIndex, g) => {

      const [, expectedCount, ]: [PositionGroup, number, number] =
            testPositionCountAndStartingIndex;


      const [testRangeNames,testRanges]: [Array<string>, Array<[number, number]>] = testRangeNamesAndRanges
      const testRandomPlusOrMinusMax: number = getAverageModularStepForRangeOfData(testRanges, expectedCount)
      const testRandomPlusOrMinus: number = g(fc.integer, {min: 0, max: testRandomPlusOrMinusMax-1})
      const actualPlayers: Array<[string, Record<string, number>]> =
            await generateDataForAGroupOfPlayersByAveragingModularIncreases([testRangeNames, testRanges, testRandomPlusOrMinus], testPositionCountAndStartingIndex);
      

      const [, actualPlayerDataValues] = zipAll(actualPlayers);                  
      const sumOfActualPlayerDataValues: number = flowAsync(
	flatMap(Object.values),
	sum,
      )(actualPlayerDataValues)

      const [sumOfExpectedMinOfSkillRanges, sumOfExpectedMaxOfSkillRanges] = flowAsync(over([map(min), map(max)]),map(sum), map(multiply(expectedCount)))(testRanges)
      
      expect(sumOfActualPlayerDataValues).toBeGreaterThan(sumOfExpectedMinOfSkillRanges)
      expect(sumOfActualPlayerDataValues).toBeLessThan(sumOfExpectedMaxOfSkillRanges)
      
    },
  );

    test.prop([
    fc.integer({min: 3, max: 30})
      .chain((minLength: number) => {
	return fc.tuple(fc.array(fakerToArb((faker) => faker.word.noun()), {minLength, maxLength: minLength}),
	  fc.array(fc.tuple(fc.integer({ min: 0, max: 50 }), fc.integer({ min: 51, max: 100 })), {minLength, maxLength: minLength}))    
      }),
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
    )
    ])(
    "generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers",
    async (testRangeNamesAndRanges, testPositionCountAndStartingIndex) => {

      const [, expectedCount, ]: [PositionGroup, number, number] =
            testPositionCountAndStartingIndex;


      const [testRangeNames,testRanges]: [Array<string>, Array<[number, number]>] = testRangeNamesAndRanges

      const testIncreasers = map(([min, max]: [number, number]) => {
	const testIncrease: number = (max - min)/expectedCount
	return boundedModularAddition([[min, max], testIncrease])
      })(testRanges)
      
      const actualPlayers: Array<[string, Record<string, number>]> =
            await generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers([testRangeNames, testRanges, testIncreasers], testPositionCountAndStartingIndex);
      

      const [, actualPlayerDataValues] = zipAll(actualPlayers);                  
      const sumOfActualPlayerDataValues: number = flowAsync(
	flatMap(Object.values),
	sum,
      )(actualPlayerDataValues)

      const [sumOfExpectedMinOfSkillRanges, sumOfExpectedMaxOfSkillRanges] = flowAsync(over([map(min), map(max)]),map(sum), map(multiply(expectedCount)))(testRanges)
      
      expect(sumOfActualPlayerDataValues).toBeGreaterThan(sumOfExpectedMinOfSkillRanges)
      expect(sumOfActualPlayerDataValues).toBeLessThan(sumOfExpectedMaxOfSkillRanges)
      
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
    "generateSkillsAndPhysicalDataForMultiplePositionGroups",
    async (testPositionCountStartingIndexTuples) => {
      const [_, expectedCounts, __]: [
        Array<PositionGroup>,
        Array<number>,
        Array<number>,
      ] = zipAll(testPositionCountStartingIndexTuples);

      const actualPlayers: Record<
        string,
        Record<string, number>
      > = await generateSkillsAndPhysicalDataForMultiplePositionGroups(
        testPositionCountStartingIndexTuples,
      );
      const expectedPlayerDataKeys: Set<string> = new Set(PLAYERSKILLSANDPHYSICALDATAKEYS);
      const actualPlayerDataKeys: Set<string> = flowAsync(
	Object.values,
	flatMap(Object.keys),
	convertToSet
      )(actualPlayers)
      
      const sumOfActualPlayerDataValues: number = flowAsync(
	Object.values,
	flatMap(Object.values),
	sum
      )(actualPlayers)
      
      expect(actualPlayerDataKeys).toStrictEqual(expectedPlayerDataKeys)
      expect(sumOfActualPlayerDataValues).toBeGreaterThan(0)
      expect(Object.keys(actualPlayers).length).toEqual(sum(expectedCounts));
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
    "generatePlayerBioDataForMultiplePositionGroups",
    async (testPositionCountStartingIndexTuples) => {
      
      const [_, expectedCounts, __]: [
        Array<PositionGroup>,
        Array<number>,
        Array<number>,
      ] = zipAll(testPositionCountStartingIndexTuples);

      const actualPlayers: Record<
        string,
        Record<string, number>
      > = await generatePlayerBioDataForMultiplePositionGroups(
        testPositionCountStartingIndexTuples
      );

      const expectedPlayerDataKeys: Set<string> = new Set(PLAYERBIOKEYS);
      const actualPlayerDataKeys: Set<string> = flowAsync(
	map(last),
	flatMap(Object.keys),
	convertToSet
      )(actualPlayers)
      
      const sumOfActualPlayerDataValues: number = flowAsync(
	map(last),
	flatMap(Object.values),
	sum,	
      )(actualPlayers)
      
      expect(actualPlayerDataKeys).toStrictEqual(expectedPlayerDataKeys)
      expect(sumOfActualPlayerDataValues).toBeGreaterThan(0)
      expect(Object.keys(actualPlayers).length).toEqual(sum(expectedCounts));
    },
  );

  test.prop([
    fc.tuple(
      fc.tuple(fc.constant(PositionGroup.Goalkeeper), fc.nat()),
      fc.tuple(fc.constant(PositionGroup.Defender), fc.nat()),
      fc.tuple(fc.constant(PositionGroup.Midfielder), fc.nat()),
      fc.tuple(fc.constant(PositionGroup.Attacker), fc.nat())
    ),
    fc.integer({min: 3}),
    fc.nat()
  ])("getTotalPlayersToGenerateBasedOnGivenComposition", async (testComposition, testTotalClubs, testStartingIndex) => {
    const testCompositionGenerator = getTotalPlayersToGenerateBasedOnGivenComposition(testComposition)
    const actualPlayers: Array<[PositionGroup, number, number]> = testCompositionGenerator(testStartingIndex, testTotalClubs)
    
    const [, startingCounts] = zipAll(testComposition)
    const [actualPositionGroups, actualCounts, actualStartingIndices] = zipAll(actualPlayers)
    const [expectedPositionGroupsSet, actualPositionGroupsSet, expectedStartingIndicesSet, actualStartingIndicesSet] = convertArrayOfArraysToArrayOfSets([POSITIONGROUPSLIST, actualPositionGroups, [testStartingIndex], actualStartingIndices])

    expect(actualPositionGroupsSet).toStrictEqual(expectedPositionGroupsSet)
    expect(actualStartingIndicesSet).toStrictEqual(expectedStartingIndicesSet)
    const actualSumOfStartingCounts: number = sum(startingCounts)
    if (actualSumOfStartingCounts > 0) {
      expect(sum(actualCounts)).toBeGreaterThan(actualSumOfStartingCounts)
    }    
    
  });

    test.prop([
      fc.integer({min: 2000, max: 2100}),
      fc.nat(),
      fc.constantFrom(1,2,3,4,5)
      .chain((testCompetitionsCount: number) => {
	return fc.array(
	  fc.tuple(
            fakerToArb((faker) => faker.location.country()),
            fc.array(fakerToArb((faker) => faker.company.name()), { minLength: testCompetitionsCount, maxLength: testCompetitionsCount }),
	    fc.array(fc.array(fakerToArb((faker) => faker.company.name()), { minLength: 20, maxLength: 20}), { minLength: testCompetitionsCount, maxLength: testCompetitionsCount })
	  ),
	  { minLength: 1, maxLength: 3 },
	)
      })    
    ])("generatePlayerSkillsAndPhysicalDataForListOfClubs", async (testSeason, testStartingIndex, testCountriesLeaguesClubs) => {

      const testBaseEntities: BaseEntities = await convertBaseCountriesToBaseEntities(testSeason,
	testCountriesLeaguesClubs)

    const expectedPlayersCount: number = getExpectedPlayersCount(testBaseEntities)


    const actualPlayers: Record<
        string,
        Record<string, number>
    > = await generatePlayerSkillsAndPhysicalDataForListOfClubs(testStartingIndex, testBaseEntities)
      
      const actualPlayersCount: number = flowAsync(Object.keys, size)(actualPlayers)
      
      expect(actualPlayersCount).toEqual(expectedPlayersCount)
            
    
    });


      
  test.prop([
      fc.integer({min: 2000, max: 2100}),
      fc.nat(),
      fc.constantFrom(1,2,3,4,5)
      .chain((testCompetitionsCount: number) => {
	return fc.array(
	  fc.tuple(
            fakerToArb((faker) => faker.location.country()),
            fc.array(fakerToArb((faker) => faker.company.name()), { minLength: testCompetitionsCount, maxLength: testCompetitionsCount }),
	    fc.array(fc.array(fakerToArb((faker) => faker.company.name()), { minLength: 20, maxLength: 20}), { minLength: testCompetitionsCount, maxLength: testCompetitionsCount })
	  ),
	  { minLength: 1, maxLength: 3 },
	)
      })    
    ])("generatePlayerBioDataForListOfClubs", async (testSeason, testStartingIndex, testCountriesLeaguesClubs) => {

      const testBaseEntities: BaseEntities = await convertBaseCountriesToBaseEntities(testSeason,
	testCountriesLeaguesClubs)

      const expectedPlayersCount: number = getExpectedPlayersCount(testBaseEntities)


      const actualPlayers: Array<[
        string,
        Record<string, number>]
      > = await generatePlayerBioDataForListOfClubs(testStartingIndex, testBaseEntities)


      expect(actualPlayers.length).toEqual(expectedPlayersCount)
            
    
  });




});
