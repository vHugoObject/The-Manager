// @vitest-environment jsdom
import React from "react";
import { screen, cleanup } from "@testing-library/react";
import { test, fc } from "@fast-check/vitest"
import { describe, expect } from "vitest";
import "fake-indexeddb/auto";
import { pipe, over } from "lodash/fp"
import { setup, getValuesOfElements, getTextOfElements, getIDsOfElements } from "../../UITestingUtilities";
import { pairArraysAndAssertStrictEqual, pairIntegersAndAssertEqual } from "../../../Common/Asserters"
import { BaseCountries } from "../../../Common/Types"
import { IDPREFIXES } from "../../../Common/Constants"
import { fastCheckTestBaseCountriesGenerator, fastCheckTestRandomBaseCountryIndex, fastCheckNLengthUniqueStringArrayGenerator, fastCheckRandomEntityIDPrefix, fastCheckTestCompletelyRandomBaseDomesticLeagueIndex} from "../../../Common/TestDataGenerationUtilities"
import { countByIDPrefix } from "../../../Common/Getters"
import { convertArrayToSetThenGetSize, isEveryIntegerInRange, convertArrayOfStringsIntoArrayOfIntegers, createStringID } from "../../../Common/Transformers"
import { getCountOfItemsFromArrayThatStartWithX } from "../../../Common/Getters"
import { CreateCountryOptions, CreateDomesticLeagueOptions, CreateClubOptions, NewSaveForm, CreateEntityOptions } from "../NewSaveForm"


describe("NewSaveForm", async () => {

  test.prop([
    fc.gen(),
    fc.integer({min: 2, max: 100}),
    fc.string()
  ])(
    "Test CreateEntityOptions",
    async(fcGen, testOptionsCount, testSelectName) => {

      const testOptions: Array<string> = fastCheckNLengthUniqueStringArrayGenerator(fcGen, testOptionsCount)
      const testIDPrefix: string = fastCheckRandomEntityIDPrefix(fcGen)
      
      
      setup(<div><CreateEntityOptions idCreator={createStringID(testIDPrefix)} selectName={testSelectName} strings={testOptions}/></div>);
      

      const actualCombobox: HTMLSelectElement = screen.getByRole("combobox")
      expect(actualCombobox.name).toBe(testSelectName)
      
      const actualOptions: Array<HTMLOptionElement> = screen.getAllByRole("option")
      const [actualIDs, actualValues, actualTextValues] = over([getIDsOfElements, getValuesOfElements, getTextOfElements])(actualOptions)
      const actualUniqueValues: number = convertArrayToSetThenGetSize(actualValues)
      const actualCorrectIDsCount: number = getCountOfItemsFromArrayThatStartWithX(testIDPrefix, actualIDs)
      
      pairIntegersAndAssertEqual([actualUniqueValues, testOptionsCount, actualCorrectIDsCount, testOptionsCount])      
      pairArraysAndAssertStrictEqual([actualTextValues, testOptions])
      const areAllValuesInRange = pipe([convertArrayOfStringsIntoArrayOfIntegers,isEveryIntegerInRange([0, testOptionsCount])])(actualValues)
      
      expect(areAllValuesInRange).toBeTruthy()
      cleanup();
    }
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 8 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "Test CreateCountryOptions",
    async(testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      
      const testBaseCountries: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticsLeaguesClubsCount,
        );

      const [expectedCountriesCount] = testCountriesDomesticsLeaguesClubsCount
      
      setup(<CreateCountryOptions countriesLeaguesClubs={testBaseCountries}/>);
            
      const options: Array<HTMLOptionElement> = screen.getAllByRole("option")
      pairIntegersAndAssertEqual([options.length, expectedCountriesCount])

      cleanup();
    }
  );

  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 8 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
  ])(
    "Test CreateDomesticLeagueOptions",
    async(testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      
      const testBaseCountries: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticsLeaguesClubsCount,
        );

      const testCountryIndex: number = fastCheckTestRandomBaseCountryIndex(fcGen, testBaseCountries)

      const [,expectedDomesticLeaguesPerCountryCount] = testCountriesDomesticsLeaguesClubsCount
      
      setup(<CreateDomesticLeagueOptions countriesLeaguesClubs={testBaseCountries} countryIndex={testCountryIndex}/>);
      
      const options: Array<HTMLOptionElement> = screen.getAllByRole("option")
      pairIntegersAndAssertEqual([options.length, expectedDomesticLeaguesPerCountryCount])
      cleanup();
    }
  );

    test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 8 }),
      fc.integer({ min: 1, max: 20 }),
    ),
    fc.gen(),
    ])(
    "Test CreateClubOptions",
    async(testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      
      const testBaseCountries: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticsLeaguesClubsCount,
        );

      const [testCountryIndex, testDomesticLeagueIndex]: [number, number] = fastCheckTestCompletelyRandomBaseDomesticLeagueIndex(fcGen, testBaseCountries)

      const [,,expectedClubsPerDomesticLeagues] = testCountriesDomesticsLeaguesClubsCount
      
      setup(<CreateClubOptions countriesLeaguesClubs={testBaseCountries}
	      countryIndex={testCountryIndex}
	      domesticLeagueIndex={testDomesticLeagueIndex}
      />)

      const options = screen.getAllByRole("option")
      pairIntegersAndAssertEqual([options.length, expectedClubsPerDomesticLeagues])
      cleanup();
	
    }
  );
  
  test.prop([
    fc.tuple(
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 10 }),
    ),
    fc.gen(),
  ])(
    "Test NewSaveForm with no options selected",
    async(testCountriesDomesticsLeaguesClubsCount, fcGen) => {
      
      const testBaseCountries: BaseCountries =
        fastCheckTestBaseCountriesGenerator(
          fcGen,
          testCountriesDomesticsLeaguesClubsCount,
        );

      const [expectedCountriesCount] = testCountriesDomesticsLeaguesClubsCount

      
      
      setup(<NewSaveForm countriesLeaguesClubs={testBaseCountries}/>);
      expect(screen.getByLabelText("Choose a name:", { selector: "textarea" })).toBeTruthy()
      expect(screen.getByLabelText("Choose a country:", { selector: "select" })).toBeTruthy()
      expect(screen.getByLabelText("Choose a domestic league:", { selector: "select" })).toBeTruthy()
      expect(screen.getByLabelText("Choose a domestic club:", { selector: "select" })).toBeTruthy()

      
      const options = screen.getAllByRole("option")
      const {[IDPREFIXES.Country]: actualCountriesCount} = pipe([getIDsOfElements, countByIDPrefix])(options)

      
      
      pairIntegersAndAssertEqual([actualCountriesCount, expectedCountriesCount])
      
      cleanup();
    }
  );



})
