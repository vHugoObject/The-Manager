import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  zipAll,
  map,
  sum,
  min,
  max,
  over,
  size,
  add,
  multiply, 
} from "lodash/fp";
import { flowAsync } from "futil-js";
import { PositionGroup } from "../PlayerTypes";
import { BaseEntities, Entity } from "../../Common/CommonTypes";
import { convertBaseCountriesToBaseEntities, getExpectedPlayersCount, getExpectedLastID } from "../../Common/BaseEntitiesUtilities"
import { boundedModularAddition,  getAverageModularStepForRangeOfData, } from "../../Common/Arithmetic"
import { convertToSet } from "../../Common/Transformers"
import {
  getSumOfFlattenedArray
} from "../../Common/Getters";
import { fakerToArb } from "../../TestingUtilities/TestDataGenerationUtilities";
import {  
  generateDataForAGroupOfPlayersByAveragingModularIncreases,
  generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers,
  runModularIncreasersModularlyOverARangeOfPlayers,
  runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers,
  generateSkillsPhysicalContractDataForMultiplePositionGroups,
  generatePlayerSkillsPhysicalContractDataForListOfClubs,
  generatePlayerBioDataForMultiplePositionGroups,
  generatePlayerBioDataForListOfClubs,
  sortPlayersByRatings,
  getTotalPlayersToGenerateBasedOnGivenComposition,
} from "../PlayerUtilities";

describe("Player utilities tests", async () => {

  const POSITIONGROUPSLIST = Object.values(PositionGroup)
  
  test.prop([
    fc.integer({min: 5, max: 25})
      .chain((totalTestSkills: number) => {
	return fc.dictionary(fc.string(), fc.array(fc.integer({min: 0, max: 100}), {minLength: totalTestSkills, maxLength: totalTestSkills}), { minKeys: 5})
      })
  ])(
    "sortPlayersByRatings",
    async (testPlayers) => {
      
      const actualSortedPlayers: Record<string, Array<number>> = sortPlayersByRatings(testPlayers)

      expect(actualSortedPlayers).toMatchObject(testPlayers)      
      
      
    }
  );
      
  test.prop([
    fc.dictionary(fc.constantFrom(
        ...POSITIONGROUPSLIST
    ),
      fc.array(fc.nat({max: }), {minLength: })
    )
  ], {numRuns: 0})(
    "getPositionBreakdownOfRecordOfPlayers",
    async (testPlayers) => {
      
      const actualSortedPlayers: Record<string, Array<number>> = sortPlayersByRatings(testPlayers)

      expect(actualSortedPlayers).toMatchObject(testPlayers)      
      
      
    }
  );

  
  test.prop([
    fc.integer({ min: 3, max: 10 }),
    fc.integer({ min: 3, max: 100 }),
    fc.integer({ min: 3 }),
    fc.nat(),
    fc.gen(),
  ])(
    "getTotalPlayersToGenerateBasedOnGivenComposition",
    (
      testMinItemCount,
      testRangeSize,
      testTotalClubs,
      testStartingIndex,
      fcGen,
    ) => {
      const testComposition =
        fastCheckNLengthArrayOfItemCountTuplesGivenItemsAndRangeOfCountsGenerator(
          POSITIONGROUPSLIST,
          fcGen,
          [testMinItemCount, testRangeSize],
        );

      const testCompositionGenerator =
        getTotalPlayersToGenerateBasedOnGivenComposition(testComposition);

      const actualPlayers: Array<[PositionGroup, number, number]> =
        testCompositionGenerator(testStartingIndex, testTotalClubs);
      const [
        [actualPositions, actualCounts, actualStartingIndices],
        [expectedPositions, expectedCountsPerClub],
      ] = map(zipAll)([actualPlayers, testComposition]);

      pairArraysAndAssertStrictEqual([
        actualPositions,
        expectedPositions,
        actualStartingIndices,
        [testStartingIndex],
      ]);
      expect(sum(actualCounts)).toBeGreaterThanOrEqual(
        sum(expectedCountsPerClub),
      );
    },
  );

  test.prop(
    [
      fc.integer({ min: 2, max: 50 }),
      fc.integer({ min: 2, max: 10 }),
      fc.integer({ min: 1, max: 500 }),
      fc.gen(),
    ],
    { numRuns: 0 },
  )(
    "createPlayerIDsForClubs",
    (testTotalClubs, testMinItemCount, testRangeSize, fcGen) => {
      const testTuples: Array<[string, number, number]> =
        fastCheckNLengthArrayOfItemCountIndexTuplesGivenItemsAndRangeOfCountsGenerator(
          POSITIONGROUPSLIST,
          fcGen,
          [testMinItemCount, testRangeSize],
        );

      //Array<Array<Array<Array<BaseEntity>>>>
      const actualPlayerIDs = createPlayerIDsForClubs(
        testTotalClubs,
        testTuples,
      );
      expect(actualPlayerIDs.length).toEqual(testTotalClubs);
      const expectedTotalPlayers: number = zipAllAndGetSumOfArrayAtIndex(
        1,
        testTuples,
      );
      const actualPlayersCount: number =
        getTestBaseEntitiesPlayersCount(actualPlayerIDs);
      expect(actualPlayersCount).toEqual(expectedTotalPlayers);
    },
  );

  
  test.prop([
    fc
      .tuple(
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 1001 }),
      )
      .chain(([min, max]: [number, number]) => {
        return fc.tuple(
          fc.array(fc.integer({ min, max }), {
            minLength: 3            
          }),
          fc.integer({ min: Math.floor(max / 10), max: Math.floor(max / 5) }),            
        );
      }),
    fc.tuple(
      fc.constantFrom(
        ...POSITIONGROUPSLIST
      ),
      fc.integer({ min: 100, max: 300 }),
      fc.nat(),
    ),
  ])(
    "runModularIncreasersModularlyOverARangeOfPlayers",
    async (
      testStartingRangeAndIncrease,
      testPositionCountStartingIndex,
    ) => {
      const [testStartingRange, testIncrease]: [
        Array<number>,
        number
      ] = testStartingRangeAndIncrease;

      const testIncreasers = map((_:number) => add(testIncrease))(testStartingRange)
      
      
      const actualPlayers: Array<[string, Array<number>]> =
        runModularIncreasersModularlyOverARangeOfPlayers(
          [testStartingRange, testIncreasers],
          testPositionCountStartingIndex,
        );

      const [expectedPosition, expectedCount, expectedStartingIndex]: [
        PositionGroup,
        number,
        number,
      ] = testPositionCountStartingIndex;
      
      expect(actualPlayers.length).toEqual(expectedCount);

      const expectedLastID = getExpectedLastID([expectedPosition, expectedCount, expectedStartingIndex])
      
      const [actualPlayersIDs, actualPlayerDataValues] = zipAll(actualPlayers);      
      const actualPlayersIDsSet: Set<string> = convertToSet(actualPlayersIDs);
      expect(actualPlayersIDsSet.has(expectedLastID)).toBeTruthy();

      const expectedPositionGroupSet: Set<PositionGroup> = new Set([expectedPosition])
      const actualPositionGroupSet: Set<string> = getActualPositionGroupSet(actualPlayersIDs)
      expect(actualPositionGroupSet).toStrictEqual(expectedPositionGroupSet)

      const sumOfActualPlayerDataValues: number = getSumOfFlattenedArray(actualPlayerDataValues);

      const expectedStartingRangeMultipliedByPlayerCount = flowAsync(
        sum,
        multiply(expectedCount),
      )(testStartingRange);
      expect(sumOfActualPlayerDataValues).toBeGreaterThan(
        expectedStartingRangeMultipliedByPlayerCount,
      );
    },
  );

  test.prop([
    fc
      .tuple(
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 1001 }),
        fc.integer({ min: 3, max: 30 }),
      )
      .chain(([min, max, minLength]: [number, number, number]) => {
        return fc.tuple(
          fc.array(fc.integer({ min, max }), {
            minLength,
            maxLength: minLength,
          }),
          fc.array(
            fc.integer({ min: Math.floor(max / 10), max: Math.floor(max / 5) }),
            { minLength, maxLength: minLength },
          ),
        );
      }),
    fc.tuple(
      fc.constantFrom(
        ...POSITIONGROUPSLIST
      ),
      fc.integer({ min: 100, max: 300 }),
      fc.nat(),
    ),
  ])(
    "runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers",
    async (
      testStartingRangeAndIncreases,
      testPositionCountStartingIndex,
    ) => {
      const [testStartingRange, testIncreases]: [
        Array<number>,
        Array<number>,
      ] = testStartingRangeAndIncreases;

      
      const testIncreasers = map((testIncrease: number) => add(testIncrease))(
        testIncreases,
      );
      const actualPlayers: Array<[string, Array<number>]> =
        runAMixOfModularAndLinearIncreasersLinearlyOverARangeOfPlayers(
          [testStartingRange, testIncreasers],
          testPositionCountStartingIndex,
        );

      const [expectedPosition, expectedCount, expectedStartingIndex]: [
        PositionGroup,
        number,
        number,
      ] = testPositionCountStartingIndex;

      expect(actualPlayers.length).toEqual(expectedCount);

      const expectedLastID = getExpectedLastID([expectedPosition, expectedCount, expectedStartingIndex])



      const [actualPlayersIDs, actualPlayerDataValues] = zipAll(actualPlayers);
      const actualPlayersIDsSet: Set<string> = convertToSet(actualPlayersIDs);
      expect(actualPlayersIDsSet.has(expectedLastID)).toBeTruthy();

      const expectedPositionGroupSet: Set<PositionGroup> = new Set([expectedPosition])
      const actualPositionGroupSet: Set<string> = getActualPositionGroupSet(actualPlayersIDs)
      expect(actualPositionGroupSet).toStrictEqual(expectedPositionGroupSet)

      const sumOfActualPlayerDataValues: number = getSumOfFlattenedArray(actualPlayerDataValues);

      const expectedStartingRangeMultipliedByPlayerCount = flowAsync(
        sum,
        multiply(expectedCount),
      )(testStartingRange);
      expect(sumOfActualPlayerDataValues).toBeGreaterThan(
        expectedStartingRangeMultipliedByPlayerCount,
      );
    },
  );

  test.prop([
    fc.array(
          fc.tuple(
            fc.integer({ min: 0, max: 50 }),
            fc.integer({ min: 51, max: 100 }),
          ),
      { minLength: 3 },
    ),
    fc.tuple(
      fc.constantFrom(
        ...POSITIONGROUPSLIST
      ),
      fc.integer({ min: 100, max: 300 }),
      fc.nat(),
    ),
    fc.gen(),
  ])(
    "generateDataForAGroupOfPlayersByAveragingModularIncreases",
    async (testRanges, testPositionCountAndStartingIndex, g) => {
      const [, expectedCount]: [PositionGroup, number, number] =
        testPositionCountAndStartingIndex;

      const testRandomPlusOrMinusMax: number =
        getAverageModularStepForRangeOfData(testRanges, expectedCount);
      const testRandomPlusOrMinus: number = g(fc.integer, {
        min: 0,
        max: testRandomPlusOrMinusMax - 1,
      });
      
      const actualPlayers: Array<[string, Array<number>]> =
        await generateDataForAGroupOfPlayersByAveragingModularIncreases(
          [testRanges, testRandomPlusOrMinus],
          testPositionCountAndStartingIndex,
        );

      const [, actualPlayerDataValues] = zipAll(actualPlayers);
      const sumOfActualPlayerDataValues: number = getSumOfFlattenedArray(actualPlayerDataValues);


      const [sumOfExpectedMinOfSkillRanges, sumOfExpectedMaxOfSkillRanges] =
        flowAsync(
          over([map(min), map(max)]),
          map(sum),
          map(multiply(expectedCount)),
        )(testRanges);

      expect(sumOfActualPlayerDataValues).toBeGreaterThan(
        sumOfExpectedMinOfSkillRanges,
      );
      expect(sumOfActualPlayerDataValues).toBeLessThan(
        sumOfExpectedMaxOfSkillRanges,
      );
    },
  );

  test.prop([    
        fc.array(
          fc.tuple(
            fc.integer({ min: 0, max: 50 }),
            fc.integer({ min: 51, max: 100 }),
          ),
          { minLength: 3}
        ),
    fc.tuple(
      fc.constantFrom(
        ...POSITIONGROUPSLIST
      ),
      fc.integer({ min: 100, max: 300 }),
      fc.nat(),
    ),
  ])(
    "generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers",
    async (testRanges, testPositionCountAndStartingIndex) => {
      const [, expectedCount]: [PositionGroup, number, number] =
        testPositionCountAndStartingIndex;


      const testIncreasers = map(([min, max]: [number, number]) => {
        const testIncrease: number = (max - min) / expectedCount;
        return boundedModularAddition([[min, max], testIncrease]);
      })(testRanges);

      const actualPlayers: Array<[string, Array<number>]> =
        await generateDataForAGroupOfPlayersLinearlyWithRandomStartsAndGivenIncreasers(
          [testRanges, testIncreasers],
          testPositionCountAndStartingIndex,
        );

      const [, actualPlayerDataValues] = zipAll(actualPlayers);
      const sumOfActualPlayerDataValues: number = getSumOfFlattenedArray(actualPlayerDataValues);

      const [sumOfExpectedMinOfSkillRanges, sumOfExpectedMaxOfSkillRanges] =
        flowAsync(
          over([map(min), map(max)]),
          map(sum),
          map(multiply(expectedCount)),
        )(testRanges);

      expect(sumOfActualPlayerDataValues).toBeGreaterThan(
        sumOfExpectedMinOfSkillRanges,
      );
      expect(sumOfActualPlayerDataValues).toBeLessThan(
        sumOfExpectedMaxOfSkillRanges,
      );
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
    "generateSkillsPhysicalContractDataForMultiplePositionGroups",
    async (testPositionCountStartingIndexTuples) => {

      const expectedPositionCountStartingIndexTuplesSet = convertToSet(testPositionCountStartingIndexTuples);

      const actualPlayers: Record<
        string,
        Entity
      > = await generateSkillsPhysicalContractDataForMultiplePositionGroups(
        testPositionCountStartingIndexTuples,
      );

      
      const [actualPlayerIDs, actualPlayerDataValues] = flowAsync(Object.entries, zipAll)(actualPlayers)

      
      const actualPositionCountStartingIndexTuplesSet = getActualPositionCountStartingIndexTuplesSet(actualPlayerIDs)

      expect(actualPositionCountStartingIndexTuplesSet).toStrictEqual(expectedPositionCountStartingIndexTuplesSet)


      const sumOfActualPlayerDataValues: number = getSumOfFlattenedArray(actualPlayerDataValues);

      expect(sumOfActualPlayerDataValues).toBeGreaterThan(0);
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
      const expectedPositionCountStartingIndexTuplesSet = convertToSet(testPositionCountStartingIndexTuples)

      const actualPlayers: Array<
        [string,
	Array<number>]
      > = await generatePlayerBioDataForMultiplePositionGroups(
        testPositionCountStartingIndexTuples,
      );

      const [actualPlayerIDs, actualPlayerDataValues] = zipAll(actualPlayers)

                              
      const actualPositionCountStartingIndexTuplesSet = getActualPositionCountStartingIndexTuplesSet(actualPlayerIDs)

      expect(actualPositionCountStartingIndexTuplesSet).toStrictEqual(expectedPositionCountStartingIndexTuplesSet)

  
      const sumOfActualPlayerDataValues: number = getSumOfFlattenedArray(actualPlayerDataValues);

      expect(sumOfActualPlayerDataValues).toBeGreaterThan(0);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.nat(),
    fc.constantFrom(1, 2, 3, 4, 5).chain((testCompetitionsCount: number) => {
      return fc.array(
        fc.tuple(
          fakerToArb((faker) => faker.location.country()),
          fc.array(
            fakerToArb((faker) => faker.company.name()),
            {
              minLength: testCompetitionsCount,
              maxLength: testCompetitionsCount,
            },
          ),
          fc.array(
            fc.array(
              fakerToArb((faker) => faker.company.name()),
              { minLength: 20, maxLength: 20 },
            ),
            {
              minLength: testCompetitionsCount,
              maxLength: testCompetitionsCount,
            },
          ),
        ),
        { minLength: 1, maxLength: 3 },
      );
    }),
  ])(
    "generatePlayerSkillsPhysicalContractDataForListOfClubs",
    async (testSeason, testStartingIndex, testCountriesLeaguesClubs) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );

      const expectedPlayersCount: number =
        getExpectedPlayersCount(testBaseEntities);

      const actualPlayers: Record<
        string,
        Entity
      > = await generatePlayerSkillsPhysicalContractDataForListOfClubs(
        testStartingIndex,
        testBaseEntities,
      );

      const actualPlayersCount: number = flowAsync(
        Object.keys,
        size,
      )(actualPlayers);

      expect(actualPlayersCount).toEqual(expectedPlayersCount);
    },
  );

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.nat(),
    fc.constantFrom(1, 2, 3, 4, 5).chain((testCompetitionsCount: number) => {
      return fc.array(
        fc.tuple(
          fakerToArb((faker) => faker.location.country()),
          fc.array(
            fakerToArb((faker) => faker.company.name()),
            {
              minLength: testCompetitionsCount,
              maxLength: testCompetitionsCount,
            },
          ),
          fc.array(
            fc.array(
              fakerToArb((faker) => faker.company.name()),
              { minLength: 20, maxLength: 20 },
            ),
            {
              minLength: testCompetitionsCount,
              maxLength: testCompetitionsCount,
            },
          ),
        ),
        { minLength: 1, maxLength: 3 },
      );
    }),
  ])(
    "generatePlayerBioDataForListOfClubs",
    async (testSeason, testStartingIndex, testCountriesLeaguesClubs) => {
      const testBaseEntities: BaseEntities =
        await convertBaseCountriesToBaseEntities(
          testSeason,
          testCountriesLeaguesClubs,
        );

      const expectedPlayersCount: number =
        getExpectedPlayersCount(testBaseEntities);

      const actualPlayers: Array<[string, Entity]> =
        await generatePlayerBioDataForListOfClubs(
          testStartingIndex,
          testBaseEntities,
        );

      expect(actualPlayers.length).toEqual(expectedPlayersCount);
    },
  );

  

  
});
