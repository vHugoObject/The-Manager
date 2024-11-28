import { describe, expect, test, expectTypeOf } from "vitest";
import { simpleFaker } from "@faker-js/faker";
import "lodash.product";
import _ from "lodash";
import { range, countBy } from "lodash";
import { StatisticsObject } from "../../Common/CommonTypes";
import {  Player } from "../../Players/PlayerTypes";
import { createClub, getBestStarting11 } from "../../Clubs/ClubUtilities";
import {
  calculateDefenseStrength,
  calculateAttackStrength,
  calculateHomeStrength,
  calculateAwayStrength,
  weibullCDFGoals,
  weibullCDFGoalsList,
  calculateJointProbability,
  createJointProbabilitiesMatrixForGoals,
  matchActualGoals,
  matchExpectedGoals,
  calculateClubStrengths,
  calculateMatchStrengths,
  calculateAttackCoefficient,
  calculateDefenseCoefficient,
  calculateCoefficients,
  getClubsScoreProbabilities,
  sortProbabilityMatrix,
  splitJointProbabilitiesMatrixIntoTwoLists,
  convertJointProbabilitiesMatrixToLists,
  playersToJointProbabilitiesMatrixForGoals,
  matchStatistics,
  generateMatchStatistics
} from "../MatchSimulationUtilities";

describe("MatchSimulationUtilities test suite", async() => {

  const testSeason: string = "2024"
  
  const attackCategories = new Set([
    "ballSkills",
    "mentalSkills",
    "physicalSkills",
    "passingSkills",
    "shootingSkills",
  ]);

  const defenseCategories = new Set([
    "defenseSkills",
    "mentalSkills",
    "physicalSkills",
  ]);

  const goalkeepingCategories = new Set([
    "defenseSkills",
    "mentalSkills",
    "physicalSkills",
    "goalkeepingSkills",
  ]);
  
  
  const testClubNameOne: string = "Arsenal F.C."
  const testClubNameTwo: string = "Nottingham Forest F.C."
  const testClubNames: Array<string> = [testClubNameOne, testClubNameTwo];

  const [[,testHomePlayers],[,testAwayPlayers]] = await Promise.all(
    testClubNames.map(async(testClubName: string) => {
      return await createClub(
      simpleFaker.string.numeric(6),
      testClubName,
      testSeason,
    );
    })
    
  )

  const [[,testHomeStarting11], [,testAwayStarting11]] = await Promise.all(
    [testHomePlayers, testAwayPlayers].map(async(testPlayers: Record<string,Player>) => {
      return getBestStarting11(testPlayers)
    })
  )

  const testStartingElevens: [Array<Player>,Array<Player>] = [testHomeStarting11, testAwayStarting11]


  test("test calculateDefenseStrength with a goalkeeper", async() => {

    await Promise.all(testStartingElevens.map(async(testPlayers: Array<Player>) => {
      const actualDefenseStrength: number = await calculateDefenseStrength(testPlayers);
      expect(actualDefenseStrength).toBeGreaterThan(0)
      expect(actualDefenseStrength).toBeLessThan(100)
    }))    
  });


  test("test calculateAttackStrength", async() => {

    await Promise.all(testStartingElevens.map(async(testPlayers: Array<Player>) => {
      const actualAttackStrength: number = await calculateAttackStrength(testPlayers);
      expect(actualAttackStrength).toBeGreaterThan(0)
      expect(actualAttackStrength).toBeLessThan(100)
    }))
  
  });

  test("test calculateClubStrengths", async() => {

    await Promise.all(testStartingElevens.map(async(testPlayers: Array<Player>) => {
      const [actualDefenseStrength, actualAttackStrength] = await calculateClubStrengths(testPlayers);
      expect(actualDefenseStrength).toBeGreaterThan(0)
      expect(actualDefenseStrength).toBeLessThan(100)
      
      expect(actualAttackStrength).toBeGreaterThan(0)
      expect(actualAttackStrength).toBeLessThan(100)
    }))
  
  });
  
  test("test 'coefficient' calculators", async() => {

    await Promise.all(testStartingElevens.map(async(testPlayers: Array<Player>) => {
       await Promise.all([calculateDefenseCoefficient,
	calculateAttackCoefficient]
	.map(async(calculator: Function) => {
	  const actualStrength: number = await calculator(testPlayers)
	  expect(actualStrength).toBeGreaterThan(0)
	  expect(actualStrength).toBeLessThan(1)
	})

       )}    

    ))
  });

  test("test calculate coefficients", async() => {

    
    const actualCoefficients = await calculateCoefficients(testHomeStarting11, testAwayStarting11)
    await Promise.all(actualCoefficients.map((actualCoefficient: number) => {
      expect(actualCoefficient).toBeGreaterThan(0)
      expect(actualCoefficient).toBeLessThan(1)
    }))
    

  })
  

  test("test calculateHomeStrength", async() => {

    const actualHomeStrength: number = await calculateHomeStrength(
      testHomeStarting11, testAwayStarting11
    );

      expect(actualHomeStrength).toBeGreaterThan(0);
      expect(actualHomeStrength).toBeLessThan(1);

    
  });

  test("test calculateAwayStrength", async() => {

      const actualAwayStrength: number = await calculateAwayStrength(
      testHomeStarting11, testAwayStarting11
    );

	expect(actualAwayStrength).toBeGreaterThan(0);
	expect(actualAwayStrength).toBeLessThan(1);
  
  });


  test("test calculateMatchStrengths", async() => {

    const actualStrengths: [number, number] = await calculateMatchStrengths(testStartingElevens);

    expect(actualStrengths.length).toBe(2)

    await Promise.all(actualStrengths.map(async(actualStrength: number) => {

      expect(actualStrength).toBeGreaterThan(0);
	expect(actualStrength).toBeLessThan(1);
    }))
    
  });

  test("test weibullCDFGoals", async() => {

    const possibleGoals: Array<number> = [0, 1, 2, 3, 4, 5];
    const testShape: number = 1.864;
    const [testHomeStrength, _] = await calculateMatchStrengths(testStartingElevens);
    await Promise.all(possibleGoals.map(async(goals) => {
      const actualCDF: number = await weibullCDFGoals(
        testShape,
        testHomeStrength,
        goals,
      );
	expect(actualCDF).toBeGreaterThan(0);
	expect(actualCDF).toBeLessThan(1);
      }))
  })
  
  test("test weibullCDFGoalsList", async() => {

    const actualStrengths: [number, number] = await calculateMatchStrengths(testStartingElevens);

    await Promise.all(actualStrengths.map(async(testStrength: number) => {

      const testRange: Array<number> = [0, 1, 2, 3, 4, 5];
      const testShape: number = 1.864;
      const expectedRange: Array<number> = await Promise.all(testRange.map(async(goals) => {
	return await weibullCDFGoals(testShape, testStrength, goals);
      }));

      const actualRange: Array<number> = await weibullCDFGoalsList(testStrength);
      expect(actualRange).toStrictEqual(expectedRange)


    })
      
    )
    
  })

  test("test getClubsScoreProbabilities", async() => {
    
    const [testHomeStrength, testAwayStrength] = await calculateMatchStrengths(testStartingElevens);

    const randomHomeScore: number = simpleFaker.number.int({min: 0, max: 5})
    const randomAwayScore: number = simpleFaker.number.int({min: 0, max: 5})

    const testArguments: [[number, number],[number, number]] = [[randomHomeScore, testHomeStrength]
      ,[randomAwayScore, testAwayStrength]]


    const actualProbabilities: Array<number> = await getClubsScoreProbabilities(...testArguments)

    expect(actualProbabilities.length).toBe(2)

    
    await Promise.all(actualProbabilities.map(async(actualProbability: number) => {
      expect(actualProbability).toBeGreaterThanOrEqual(0)
      expect(actualProbability).toBeLessThan(1)
    }))
  
  })

  test("test calculateJointProbability ", async() => {


    const [testHomeStrength, testAwayStrength] = await calculateMatchStrengths(testStartingElevens);

    const testTheta: number = Math.random();
    
    const testShape: number = 1.864;
    
    const possibleGoals: Array<number> = [0, 1, 2, 3, 4, 5];
    const testGoalsMatrix: Array<number[]> = _.product(possibleGoals, possibleGoals);
    
    await Promise.all(testGoalsMatrix.map(async([testHomeGoals, testAwayGoals]) => {
      const [testHomeProb, testAwayProb] = await Promise.all(
	[await weibullCDFGoals(
	  testShape,
        testHomeStrength,
          testHomeGoals,
	),
	  await weibullCDFGoals(
	    testShape,
            testAwayStrength,
           testAwayGoals,
	  )
	]	
      )
      
      const testTotalProb: number = testHomeProb + testAwayProb;
      const testNormalizedHomeProb: number = testHomeProb / testTotalProb;
      const testNormalizedAwayProb: number = testAwayProb / testTotalProb;
      const actualJointProbability = await calculateJointProbability(
	testTheta,
        [testNormalizedHomeProb,
        testNormalizedAwayProb]
      );

      expect(actualJointProbability).toBeGreaterThan(0);
      expect(actualJointProbability).toBeLessThan(1);
    })
    );
  });

  test("test createJointProbabilitiesMatrix", async() => {

    const testClubStrengths = await calculateMatchStrengths(testStartingElevens);

    
    const actualGoalsMatrix: Array<[[number, number], number]> =
      await createJointProbabilitiesMatrixForGoals(testClubStrengths);

    const actualGoalsMatrixSet = new Set(actualGoalsMatrix);
    expect(actualGoalsMatrixSet.size).toBe(36);

    actualGoalsMatrix.forEach(([scores, probability]) => {
      scores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(5);
      });
      expect(probability).toBeGreaterThan(0);
      expect(probability).toBeLessThan(1);
    });
  });

  test("test playersToJointProbabilitiesMatrixForGoals ", async() => {
    
    const actualGoalsMatrix: Array<[[number, number], number]> =
      await playersToJointProbabilitiesMatrixForGoals(testStartingElevens);
    
    const actualGoalsMatrixSet = new Set(actualGoalsMatrix);
    expect(actualGoalsMatrixSet.size).toBe(36);

    expect(actualGoalsMatrixSet.size).toBe(36);

    actualGoalsMatrix.forEach(([scores, probability]) => {
      scores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(5);
      });
      expect(probability).toBeGreaterThan(0);
      expect(probability).toBeLessThan(1);
    });
  });



  test("test matchExpectedGoals", async() => {

    
    const testGoalsMatrix: Array<[[number, number], number]> =
        await playersToJointProbabilitiesMatrixForGoals(testStartingElevens);
    
    const actualScore: Array<number> = await matchExpectedGoals(testGoalsMatrix);

    actualScore.forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(5);
    });
  });

  test("test sortProbabilityMatrix", async() => {

    const testGoalsMatrix: Array<[[number, number], number]> =
        await playersToJointProbabilitiesMatrixForGoals(testStartingElevens);
    

    const actualSortedGoalsMatrix: Array<[[number, number], number]> = sortProbabilityMatrix(testGoalsMatrix)
    await Promise.all(actualSortedGoalsMatrix
      .map(async([,actualProbability]) => {
	return expect(actualProbability).toBeGreaterThanOrEqual(actualSortedGoalsMatrix[0][1])
      })
    )
    
  })

  test("test convertJointProbabilitiesMatrixToLists", async() => {


    const testGoalsMatrix: Array<[[number, number], number]> =
        await playersToJointProbabilitiesMatrixForGoals(testStartingElevens);

    const actualConvertedMatrix: Array<Array<number>> =
      await convertJointProbabilitiesMatrixToLists(testGoalsMatrix);

    expect(actualConvertedMatrix.length).toBe(3)
    await Promise.all(actualConvertedMatrix.map((actualArray) => {
      expect(actualArray.length).toBe(testGoalsMatrix.length)
    }))
    
  })


  test("test splitJointProbabilitiesMatrixToLists", async() => {

    const testGoalsMatrix: Array<[[number, number], number]> =
        await playersToJointProbabilitiesMatrixForGoals(testStartingElevens);

    const actualConvertedMatrix: (number|[number, number])[][] =
      await splitJointProbabilitiesMatrixIntoTwoLists(testGoalsMatrix);

    expect(actualConvertedMatrix.length).toBe(2)
    await Promise.all(actualConvertedMatrix.map((actualArray) => {
      expect(actualArray.length).toBe(testGoalsMatrix.length)
    }))
    
  })

  

  test("test matchActualGoals", async() => {

    enum MatchResult {
      betterClubWin = "betterClubWin",
      draw = "draw",
      underDogWin = "underDogWin"
    }
    
    const testMatchResults: Array<MatchResult> = await Promise.all(
      range(0, 1000).map(async(_) => {

	const testGoalsMatrix: Array<[[number, number], number]> =
        await playersToJointProbabilitiesMatrixForGoals(testStartingElevens);

	const actualScore: [number, number] = await matchActualGoals(testGoalsMatrix);
	actualScore.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(5);
	});

	if (actualScore[0] > actualScore[1]) {
          return MatchResult.betterClubWin
	}

	if (actualScore[0] < actualScore[1]) {
	  return MatchResult.underDogWin
	}

        return MatchResult.draw

      })
    )

    const {betterClubWin, draw, underDogWin} = countBy(testMatchResults)
    console.log(betterClubWin, draw, underDogWin)
    expect(betterClubWin).toBeGreaterThan(underDogWin);
    
  });


  
    
  test("test matchStatistics", async() => {

    const testGoalsMatrix: Array<[[number, number], number]> =
        await playersToJointProbabilitiesMatrixForGoals(testStartingElevens);

    const actualGoals: [StatisticsObject, StatisticsObject] =
      await matchStatistics(testGoalsMatrix)

    expect(actualGoals.length).toBe(2)

    const expectedObjectKeys: Set<string>  = new Set(["Goals","Expected Goals"])

    await Promise.all(actualGoals.map(async(actualGoalsObject) => {
      const actualObjectKeys: Set<string> = new Set(Object.keys(actualGoalsObject))
      expect(actualObjectKeys).toStrictEqual(expectedObjectKeys)
      Object.values(actualGoalsObject).forEach((actualStatValue: number) => {
	expect(actualStatValue).toBeGreaterThanOrEqual(0)
	expect(actualStatValue).toBeLessThanOrEqual(5)
      })
    }))

    

  })

  test("test generateMatchStatistics", async() => {

    const actualMatchStatisticsObjects: [StatisticsObject, StatisticsObject] =
      await generateMatchStatistics(testStartingElevens)

    console.log(actualMatchStatisticsObjects)

    const expectedObjectKeys: Set<string>  = new Set(["Goals","Expected Goals"])

    await Promise.all(actualMatchStatisticsObjects.map(async(actualMatchStatisticsObject) => {
      const actualObjectKeys: Set<string> = new Set(Object.keys(actualMatchStatisticsObject))
      expect(actualObjectKeys).toStrictEqual(expectedObjectKeys)
    })

    )
  })


  
});
