import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import fastCartesian from 'fast-cartesian'
import { map, over, at, mean, min, max, range, sum, eq, filter, concat, zip, zipAll, toString, last, curry, spread, flatten, uniq, size } from "lodash/fp"
import { flowAsync } from "futil-js";
import { PositionGroup, PLAYERSKILLSANDPHYSICALDATAKEYS } from "../../Players/PlayerTypes"
import { POSSIBLEGOALS } from "../MatchConstants"
import { divideByTwo } from "../../Common/CommonUtilities"
import { generateSkillsAndPhysicalDataForMultiplePositionGroups } from "../../Players/PlayerUtilities"
import {
  calculateMeanCategoryStrengthForPlayer,
  calculateMeanCategoryStrengthForGroupOfPlayers,
  calculateDefenseStrength,
  calculateAttackStrength,
  calculateAwayStrength,
  calculateHomeStrength,
  weibullCDFGoals,
  weibullCDFGoalsList,
  calculateJointProbability,
  createJointProbabilitiesMatrixForGoals,
  calculateClubStrengths,
  calculateMatchStrengths,
  generateMatchGoals
  } from "../MatchSimulationUtilities";

describe("MatchSimulationUtilities test suite", async () => {


  const COUNTOFPLAYERSKILLS: number = flowAsync(Object.values, size, divideByTwo, Math.floor)(PLAYERSKILLSANDPHYSICALDATAKEYS)


  const generateTestOutfieldPlayers = (fcGen: fc.GeneratorValue): Array<number> => {    
    return flowAsync((nums: Array<number>) => fastCartesian([nums, nums, nums]),
      filter(flowAsync(sum, eq(10))),
      (compositons: Array<Array<number>>) => fcGen(fc.constantFrom, ...compositons)
    )(range(1,11))
  }

  const generateTuplesForPlayerSkills = curry((startingIndex: number, positionGroupCountTuples: Array<[number, number]>): Array<[number, number, number]> => {
    return map(([positionGroup, count]: [number, number]): [number, number, number] => [positionGroup, count, startingIndex])(positionGroupCountTuples)
  })
  
  const generateTestComposition = curry(async(startingIndex: number, fcGen: fc.GeneratorValue): Promise<Array<[number, number, number]>> => {
    return flowAsync(
      generateTestOutfieldPlayers,
      concat([1]),
      zip(Object.values(PositionGroup)),
      generateTuplesForPlayerSkills(startingIndex)
    )(fcGen)
    
  })

  const generateTestStartingEleven = flowAsync(generateTestComposition(0), generateSkillsAndPhysicalDataForMultiplePositionGroups)
  const generateTwoTestStartingElevens = flowAsync(
    zip([0,11]),
    map(spread(generateTestComposition)),
    flowAsync(map(generateSkillsAndPhysicalDataForMultiplePositionGroups))
  )  

  const getSumOfScores = flowAsync(
    flatten,
    sum
  )

  const convertListOfIntegersToListOfUniqueString = flowAsync(uniq, map(toString))
  
  test.prop([
    fc.array(fc.integer({min: 0, max: COUNTOFPLAYERSKILLS}), {minLength: 5, maxLength: 25})
      .chain((nums: Array<number>) => {
	return fc.constant(convertListOfIntegersToListOfUniqueString(nums))
      }),
      fc.tuple(fc.string(), fc.array(fc.nat({max: 100}), {minLength: 21, maxLength: 21}))
    ])(
    "calculateMeanCategoryStrengthForPlayer",
      async (testSkills, testPlayer) => {

	const testCalculateMeanCategoryStrengthForPlayer = calculateMeanCategoryStrengthForPlayer(testSkills)
	
	const actualMeanCategoryStrength: number = testCalculateMeanCategoryStrengthForPlayer(testPlayer)
	
	const [expectedMin, expectedMax] = flowAsync(last, over([min, max]))(testPlayer)
	expect(actualMeanCategoryStrength).toBeGreaterThanOrEqual(expectedMin)
	expect(actualMeanCategoryStrength).toBeLessThanOrEqual(expectedMax)

      });

  
  test.prop([
    fc.array(fc.integer({min: 0, max: COUNTOFPLAYERSKILLS}), {minLength: 5, maxLength: 25})
      .chain((nums: Array<number>) => {
	return fc.constant(convertListOfIntegersToListOfUniqueString(nums))
      }),
    fc.array(fc.tuple(fc.string(), fc.array(fc.nat({max: 100}), {minLength: 21, maxLength: 21})), {minLength: 11, maxLength: 11})    
    ])(
    "calculateMeanCategoryStrengthForGroupOfPlayers",
      async (testSkills, testPlayers) => {

	const testCalculateMeanCategoryStrength = calculateMeanCategoryStrengthForGroupOfPlayers(testSkills)
	const actualMeanCategoryStrength: number = testCalculateMeanCategoryStrength(testPlayers)
	const meanCalculator = flowAsync(at(testSkills), mean)
	const [expectedMin, expectedMax] = flowAsync(map(last), map(meanCalculator), over([min, max]))(testPlayers)
	expect(actualMeanCategoryStrength).toBeGreaterThanOrEqual(expectedMin)
	expect(actualMeanCategoryStrength).toBeLessThanOrEqual(expectedMax)

      });

  test.prop([
    fc.gen()
  ])(
    "calculateDefenseStrength",
    async (fcGen) => {

      const testPlayers: Record<string, Array<number>> = await generateTestStartingEleven(fcGen)
      const actualDefenseStrength: number =
            await calculateDefenseStrength(testPlayers);
      expect(actualDefenseStrength).toBeGreaterThan(0);
      expect(actualDefenseStrength).toBeLessThan(100);
      
      
  });


  test.prop([
    fc.gen()
  ])(
    "calculateAttackStrength",
    async (fcGen) => {

      const testPlayers: Record<string, Array<number>> = await generateTestStartingEleven(fcGen)
      const actualAttackStrength: number =
            await calculateAttackStrength(testPlayers);
      expect(actualAttackStrength).toBeGreaterThan(0);
      expect(actualAttackStrength).toBeLessThan(100);
      
  });


  
  test.prop([
   fc.gen()
  ])(
    "calculateClubStrength",
    async (fcGen) => {

      const testPlayers: Record<string, Array<number>> = await generateTestStartingEleven(fcGen)
      const actualStrengths: Array<number> =
            await calculateClubStrengths(testPlayers);
      expect(actualStrengths.length).toEqual(2)
      map((actualStrength: number) => {
	expect(actualStrength).toBeGreaterThan(0);
        expect(actualStrength).toBeLessThan(100);
      })(actualStrengths)
        
      
    });

  test.prop([
    fc.tuple(
    fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
    }),
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
    }),
    )
  ])(
    "calculateHomeStrength",
    async (testHomeAttackAndAwayDefense) => {
      const actualHomeStrength: number = calculateHomeStrength(testHomeAttackAndAwayDefense)
      expect(actualHomeStrength).toBeGreaterThan(0)
      expect(actualHomeStrength).toBeLessThan(1)
      
    });

  test.prop([
    fc.tuple(
    fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
    }),
    fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
    }))
  ])(
    "calculateAwayStrength",
    async (testAwayAttackAndHomeDefense) => {
      const actualAwayStrength: number = calculateAwayStrength(testAwayAttackAndHomeDefense)
      expect(actualAwayStrength).toBeGreaterThan(0)
      expect(actualAwayStrength).toBeLessThan(1)
  });

  
  test.prop([
    fc.tuple(fc.gen(),
      fc.gen())
  ])(
    "calculateMatchStrengths",
    async (fcGens) => {

	const testStartingElevens = await generateTwoTestStartingElevens(fcGens)

	const actualStrengths: [number, number] =
	      await calculateMatchStrengths(testStartingElevens);

	expect(actualStrengths.length).toBe(2);
	const [actualHomeStrength, actualAwayStrength] = actualStrengths
	
      expect(actualHomeStrength).not.toEqual(actualAwayStrength)

	map((actualStrength: number) => {
	  expect(actualStrength).toBeGreaterThan(0);
	  expect(actualStrength).toBeLessThan(1);	
	})(actualStrengths)			
    
  });

  test.prop([
    fc.double({
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 2,
    }),
    fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
    }),
    fc.nat({max: 5})
  ])(
    "weibullCDFGoals",
    async (testShape, testClubStrength, testGoals) => {

      const testWeibullCDFGoals = weibullCDFGoals(testShape)
      const actualCDF: number = await testWeibullCDFGoals(testClubStrength, testGoals)
      
      expect(actualCDF).toBeGreaterThan(0);
      expect(actualCDF).toBeLessThan(1);

  });

  test.prop([
    fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
    }),
  ])(
    "weibullCDFGoalsList",
    async (testClubStrength) => {
      
      const actualCDFGoalsList: Array<number> = await weibullCDFGoalsList(testClubStrength)
      expect(actualCDFGoalsList.length).toEqual(POSSIBLEGOALS.length)
      
    });

  test.prop([
    fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
    }),
    fc.tuple(
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
      }),
      fc.double({
        maxExcluded: true,
        noDefaultInfinity: true,
        noNaN: true,
        min: 0.1,
        max: 1,
    }),
    )    
  ])(
    "calculateJointProbability",
    async (testTheta, testProbabilities) => {

      const testCalculateJointProbability = calculateJointProbability(testTheta)
      const actualJointProbability: number = await testCalculateJointProbability(testProbabilities)
      expect(actualJointProbability).toBeGreaterThan(0)
      expect(actualJointProbability).toBeLessThan(1)
      
  });


    test.prop([
    fc.tuple(fc.gen(),
      fc.gen())
  ])(
    "createJointProbabilitiesMatrixForGoals",
    async (fcGens) => {

      const getTestWeibullCDFGoalsList = flowAsync(
	generateTwoTestStartingElevens,
	calculateMatchStrengths,
	flowAsync(map(weibullCDFGoalsList))
      )
      const testWeibullCDFGoalsList: [Array<number>, Array<number>] = await getTestWeibullCDFGoalsList(fcGens)


      const actualProbabilitiesGoalsTuples: Array<[number, [number, number]]> =
	    await createJointProbabilitiesMatrixForGoals(testWeibullCDFGoalsList);
      
      const [actualProbabilities, actualScores]: [Array<number>, Array<[number, number]>] = zipAll(actualProbabilitiesGoalsTuples)
      const expectedPossibleScores: Array<[number, number]> = fastCartesian([POSSIBLEGOALS, POSSIBLEGOALS])

      const [actualSum, expectedSum] = map(getSumOfScores)([expectedPossibleScores, actualScores])

      
      expect(actualSum).toEqual(expectedSum)
      
      
    });


  test.prop([
    fc.tuple(fc.gen(),
      fc.gen())
      ])(
    "generateMatchGoals",
    async (fcGens) => {

      const testStartingElevens = await generateTwoTestStartingElevens(fcGens)
      const actualGoals = await generateMatchGoals(testStartingElevens)
      const [expectedMin, expectedMax]: [number, number] = over([min, max])(POSSIBLEGOALS) as [number, number]

      expect(actualGoals.length).toBe(2)

      map((actualGoals: number) => {
	  expect(actualGoals).toBeGreaterThanOrEqual(expectedMin);
	  expect(actualGoals).toBeLessThanOrEqual(expectedMax);
	})(actualGoals)      
           
      
      
  });


  
});

