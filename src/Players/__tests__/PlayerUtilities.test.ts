import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { fakerToArb } from "../../Common/index"
import { zipAll, map, flatMap, first, last, sum, min, max, over, size } from "lodash/fp";
import { flowAsync } from "futil-js";
import { Player, PositionGroup } from "../PlayerTypes";
import {
  PLAYERBIOKEYS,
  POSITIONGROUPSLIST as testPositionGroups,
  POSITIONS,
} from "../PlayerBioConstants";
import { PLAYERSKILLSANDPHYSICALDATAKEYS } from "../PlayerDataConstants"
import { convertToSet, convertBaseCountriesToBaseEntities, getExpectedPlayersCount } from "../../Common/index";
import { BaseEntities } from "../../Common/CommonTypes";
import {
  getRandomNumberInRange,
  getRandomPlusOrMinus,
  getStepForASetOfModularRanges,
  getStepForASetOfModularRangesWithRandomPlusOrMinus,
  boundedModularAddition,
  mapModularIncreasers,
  generateDataForAGroupOfPlayers,
  generateSkillsAndPhysicalDataForMultiplePositionGroups,
  generatePlayerSkillsForListOfClubs,
  generateBioDataForMultiplePositionGroups,
  generatePlayerBiosForListOfClubs
} from "../PlayerUtilities";

describe("Player utilities tests", async () => {


  test.prop([
    fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 })),
  ])("getRandomNumberInRange", async (testRange) => {
    const [expectedMin, expectedMax]: [number, number] = testRange;

    const actualNumber = await getRandomNumberInRange(testRange);
    expect(actualNumber).toBeGreaterThanOrEqual(expectedMin);
    expect(actualNumber).toBeLessThanOrEqual(expectedMax);
  });

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
    ])("getStepForASetOfModularRanges", async (testRanges) => {
      
      const [expectedMin, expectedMax]: [number, number] = over([flowAsync(map(first), min), flowAsync(map(last), max)])(testRanges);
      const actualStep: number = getStepForASetOfModularRanges(testRanges);
      expect(actualStep).toBeGreaterThan(0);
      expect(actualStep).toBeLessThan(expectedMax);
    
    
    })

test.prop([
    fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 }))
      .chain(([min, max]:[number, number]) => {
	return fc.tuple(fc.array(fc.tuple(fc.integer({ min, max }), fc.integer({ min: max })), {minLength: 3}), fc.integer({min, max: min*3}))
      })      
])("getStepForASetOfModularRangesWithRandomPlusOrMinus", async (testRangesAndRandomPlusMinus) => {
  
  const [testRanges, testRandomNumberToPlusMinus]: [Array<[number, number]>, number] = testRangesAndRandomPlusMinus
  const [expectedMin, expectedMax]: [number, number] = over([flowAsync(map(first), min), flowAsync(map(last), max)])(testRanges);

  const actualStep: number = await getStepForASetOfModularRangesWithRandomPlusOrMinus(testRandomNumberToPlusMinus, testRanges);

  expect(actualStep).toBeLessThan(expectedMax);
    
    
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
    expect(actualNumber).toBeLessThan(expectedMax);
  });


    test.prop([
    fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 }))
      .chain(([min, max]:[number, number]) => {
	return fc.tuple(fc.array(fc.tuple(fc.integer({ min, max }), fc.integer({ min: max })), {minLength: 3}), fc.integer({min, max: min*3}))
      }),
      	fc.gen()
    ])("mapModularIncreasers", async (testRangesAndRandomPlusMinus, g) => {
      
      const [testRanges, testRandomPlusMinus]: [Array<[number, number]>, number] = testRangesAndRandomPlusMinus

      const actualModularIncreasers = await mapModularIncreasers(testRandomPlusMinus, testRanges);
      
      
      map(([actualIncreaser, [testMin, testMax]]:[Function,[number, number]]) => {
	const testValue = g(fc.integer, {min: testMin, max: testMin*3})
	const actualValue = actualIncreaser(testValue)
	expect(actualValue).toBeGreaterThan(0)
      })(zipAll([actualModularIncreasers, testRanges]))
  });

  test.prop([
    fc.tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1001 }), fc.integer({min: 3, max: 30}))
      .chain(([min, max, minLength]:[number, number, number]) => {
	return fc.tuple(fc.array(fakerToArb((faker) => faker.word.noun()), {minLength, maxLength: minLength}),
	  fc.array(fc.tuple(fc.integer({ min, max }), fc.integer({ min: max })), {minLength, maxLength: minLength}), fc.integer({min, max: min*3}))    
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
    "generateDataForAGroupOfPlayers",
    async (testRangeNamesRangesAndRandomPlusOrMinus, testPositionCountStartingIndexAndRandomPlusOrMinusTuples) => {


      const [testRangeNames, , ]: [Array<string>, Array<[number, number]>, number] = testRangeNamesRangesAndRandomPlusOrMinus
      const expectedPlayerDataKeys: Set<string> = new Set(testRangeNames);
      const actualPlayers: Array<[string, Record<string, number>]> =
            await generateDataForAGroupOfPlayers(testRangeNamesRangesAndRandomPlusOrMinus, testPositionCountStartingIndexAndRandomPlusOrMinusTuples);
      
      const [expectedPosition, expectedCount, expectedStartingIndex]: [PositionGroup, number, number] =
            testPositionCountStartingIndexAndRandomPlusOrMinusTuples;
      
      const expectedLastID: string = `${expectedPosition}_${expectedStartingIndex + expectedCount}`;
      const actualPlayerDataKeys = flowAsync(
        flatMap(flowAsync(last, Object.keys)),
        convertToSet,
      )(actualPlayers);

      expect(actualPlayerDataKeys).toStrictEqual(expectedPlayerDataKeys);
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
      > = await generateSkillsAndPhysicalDataForMultiplePositionGroups(
        testPositionCountStartingIndexTuples,
      );
      const expectedPlayerDataKeys: Set<string> = new Set(PLAYERSKILLSANDPHYSICALDATAKEYS);
      const actualPlayerDataKeys: Set<string> = flowAsync(
	Object.values,
	flatMap(Object.keys),
	convertToSet
      )(actualPlayers)
      expect(actualPlayerDataKeys).toStrictEqual(expectedPlayerDataKeys)
      
      expect(Object.keys(actualPlayers).length).toEqual(sum(expectedCounts));
    },
  );

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
	  { minLength: 1, maxLength: 5 },
	)
      })    
    ])("generatePlayerSkillsForListOfClubs", async (testSeason, testStartingIndex, testCountriesLeaguesClubs) => {

      const testBaseEntities: BaseEntities = await convertBaseCountriesToBaseEntities(testSeason,
	testCountriesLeaguesClubs)

    const expectedPlayersCount: number = getExpectedPlayersCount(testBaseEntities)


    const actualPlayers: Record<
        string,
        Record<string, number>
    > = await generatePlayerSkillsForListOfClubs(testStartingIndex, testBaseEntities)

    const actualPlayersCount: number = flowAsync(Object.keys, size)(actualPlayers)
    
    expect(actualPlayersCount).toEqual(expectedPlayersCount)
    
  });

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
    ], {numRuns: 0})(
    "generateBioDataForMultiplePositionGroups",
    async (testPositionCountStartingIndexTuples) => {
      const [_, expectedCounts, __]: [
        Array<PositionGroup>,
        Array<number>,
        Array<number>,
      ] = zipAll(testPositionCountStartingIndexTuples);

      const actualPlayers: Record<
        string,
        Record<string, number>
      > = await generateBioDataForMultiplePositionGroups(
        testPositionCountStartingIndexTuples,
      );
      
      const expectedPlayerBioKeys: Set<string> = new Set(PLAYERBIOKEYS);
      
      const actualPlayerBioKeys: Set<string> = flowAsync(
	Object.values,
	flatMap(Object.keys),
	convertToSet
      )(actualPlayers)
      
      expect(actualPlayerBioKeys).toStrictEqual(expectedPlayerBioKeys)
      
      expect(Object.keys(actualPlayers).length).toEqual(sum(expectedCounts));
    },
  );

      test.prop([
    fc.integer({min: 2000, max: 2100}),
    fc.constantFrom(1,2,3,4,5)
      .chain((testCompetitionsCount: number) => {
	return fc.array(
	  fc.tuple(
            fakerToArb((faker) => faker.location.country()),
            fc.array(fakerToArb((faker) => faker.company.name()), { minLength: testCompetitionsCount, maxLength: testCompetitionsCount }),
	    fc.array(fc.array(fakerToArb((faker) => faker.company.name()), { minLength: 20, maxLength: 20}), { minLength: testCompetitionsCount, maxLength: testCompetitionsCount })
	  ),
	  { minLength: 1, maxLength: 5 },
	)
      })    
      ],{numRuns: 0})("generatePlayerBiosForListOfClubs", async (testSeason, testCountriesLeaguesClubs) => {

    const testBaseEntities: BaseEntities = await convertBaseCountriesToBaseEntities(testSeason, testCountriesLeaguesClubs)

    const expectedPlayersCount: number = getExpectedPlayersCount(testBaseEntities)


    const actualPlayers: Record<
        string,
        Record<string, number>
    > = await generatePlayerBiosForListOfClubs(testBaseEntities)

    const actualPlayersCount: number = flowAsync(Object.keys, size)(actualPlayers)
    
    expect(actualPlayersCount).toEqual(expectedPlayersCount)
    
  });



});
