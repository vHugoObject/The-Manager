// @vitest-environment jsdom
import { fc, test } from "@fast-check/vitest";
import { cleanup, screen } from "@testing-library/react";
import "fake-indexeddb/auto";
import { describe, expect } from "vitest";
import {
  fastCheckNLengthUniqueStringArrayGenerator,
  fastCheckNonSpaceRandomCharacterGenerator,
  fastCheckTestBaseCountriesGenerator,
  fastCheckTestCompletelyRandomBaseClub,
  fastCheckGet2RandomItemsFromArray,
  fastCheckGet2RandomBaseCountries,
  fastCheckGet2RandomBaseDomesticLeagues,
  fastCheckGet2RandomBaseClubs
} from "../../../Common/TestDataGenerators";
import { BaseCountries } from "../../../Common/Types";
import {
  setup,
} from "../../UITestingUtilities";
import {
  CreateClubOptions,
  CreateCountryOptions,
  CreateDomesticLeagueOptions,
  CreateEntityOptions,
  NewSaveForm,
} from "../NewSaveForm";

describe("NewSaveForm", async () => {


  test.skip("Test CreateEntityOptions", async () => {
    await fc.assert(
      fc.asyncProperty(
	fc.gen(),
	fc.integer({ min: 2, max: 100 }),
	async(fcGen, testOptionsCount) => {

          const testOptions: Array<string> =
            fastCheckNLengthUniqueStringArrayGenerator(fcGen, testOptionsCount);
      
      const [testValue, testValueToClick] = fastCheckGet2RandomItemsFromArray(fcGen, testOptions)
      
      const {user} = setup(
        <div>
          <select
	    onChange={(e) => e}
	    value={testValue}>	    
            <CreateEntityOptions
              strings={testOptions}
            />
          </select>
        </div>,
      );


	  await user.click(screen.getByText(testValue))
	  await user.click(screen.getByText(testValueToClick))
	})
	.beforeEach(async () => {
	  cleanup();
	}),
      {numRuns: 50}
    );
  });

  test.skip("Test CreateCountryOptions", async () => {
    await fc.assert(
      fc.asyncProperty(
	fc.gen(),
	fc.tuple(
	  fc.integer({ min: 2, max: 5 }),
	  fc.integer({ min: 1, max: 8 }),
	  fc.integer({ min: 1, max: 20 }),
	),
	async(fcGen, testCountriesDomesticsLeaguesClubsCount) => {

	  const testBaseCountries: BaseCountries =
		fastCheckTestBaseCountriesGenerator(
		  fcGen,
		  testCountriesDomesticsLeaguesClubsCount,
		);

	  const [testCountryValue, testCountryToClick] = fastCheckGet2RandomBaseCountries(fcGen, testBaseCountries)

	  const {user} = setup(
	    <div>
	      <select
		value={testCountryValue}
		onChange={(e) => e}>
		<CreateCountryOptions countriesLeaguesClubs={testBaseCountries} />
	      </select>
	    </div>
	  );

	  await user.click(screen.getByText(testCountryValue))
	  await user.click(screen.getByText(testCountryToClick))

	  
	})
	.beforeEach(async () => {
	  cleanup();
	})
      ,{numRuns: 50});
  });

  test.skip("Test CreateClubOptions", async () => {
    await fc.assert(
      fc.asyncProperty(fc.tuple(
	fc.integer({ min: 1, max: 3 }),
	fc.integer({ min: 1, max: 8 }),
	fc.integer({ min: 3, max: 3 })),
	fc.gen(),
	async(testCountriesDomesticsLeaguesClubsCount, fcGen) => {
	  const testBaseCountries: BaseCountries =
		fastCheckTestBaseCountriesGenerator(
		  fcGen,
		  testCountriesDomesticsLeaguesClubsCount,
		);

	  const [[testCountryIndex, testDomesticLeagueIndex], [testClubValue, testClubToClick]] = fastCheckGet2RandomBaseClubs(fcGen, testBaseCountries)

	  const {user} = setup(
	<div>
	  <select
	    value={testClubValue}
	    onChange={(e) => e}
	  >
	    <CreateClubOptions
              countriesLeaguesClubs={testBaseCountries}
              countryIndex={testCountryIndex}
	      domesticLeagueIndex={testDomesticLeagueIndex}
            />
	  </select>
	</div>
      );

	  await user.click(screen.getByText(testClubValue))

	  await user.click(screen.getByText(testClubToClick))
	  
	})
	.beforeEach(async () => {
	  cleanup();
	}),
      {numRuns: 50}
      
    );
  });


  test.skip("Test CreateDomesticLeagueOptions", async () => {
    await fc.assert(
      fc.asyncProperty(fc.tuple(
	fc.integer({ min: 1, max: 3 }),
	fc.integer({ min: 3, max: 8 }),
	fc.integer({ min: 1, max: 20 })),
	fc.gen(),
	async(testCountriesDomesticsLeaguesClubsCount, fcGen) => {
	  const testBaseCountries: BaseCountries =
		fastCheckTestBaseCountriesGenerator(
		  fcGen,
		  testCountriesDomesticsLeaguesClubsCount,
		);

	  
      const [testCountryIndex, [testLeagueValue, testLeagueToClick]] = fastCheckGet2RandomBaseDomesticLeagues(fcGen, testBaseCountries)
      
      const {user} = setup(
	<div>
	  <select
	    value={testLeagueValue}
	    onChange={(e) => e}
	  >
	    <CreateDomesticLeagueOptions	      
	      countriesLeaguesClubs={testBaseCountries}
	      countryIndex={testCountryIndex}/>
	  </select>
	</div>
      );


	  await user.click(screen.getByText(testLeagueValue))
	  await user.click(screen.getByText(testLeagueToClick))
	  
	})
	.beforeEach(async () => {
	  cleanup();
	}),
      {numRuns: 50}
    );
  });
    

    test("Test NewSaveForm", async () => {
    await fc.assert(
      fc.asyncProperty(
	fc.tuple(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 2 }),
          fc.integer({ min: 1, max: 2 }),
	),
      fc.gen(),
	async(testCountriesDomesticsLeaguesClubsCount, fcGen) => {
	  const testBaseCountries: BaseCountries =
		fastCheckTestBaseCountriesGenerator(
		  fcGen,
		  testCountriesDomesticsLeaguesClubsCount,
		);

      const testName: string = fastCheckNonSpaceRandomCharacterGenerator(fcGen);
      const [,[
        testCountryNameValue,
        testDomesticLeagueNameValue,
        testClubNameValue,
      ]] = fastCheckTestCompletelyRandomBaseClub(fcGen, testBaseCountries);

	  const { user } = setup(
            <NewSaveForm countriesLeaguesClubs={testBaseCountries} />,
	  );

	  const actualNameTextArea: HTMLInputElement = screen.getByRole("textbox", {
            name: "Choose a name:",
	  });

	  await user.type(actualNameTextArea, testName);
	  expect(actualNameTextArea.value).toBe(testName);

	  const actualCountryOptions: HTMLSelectElement = screen.getByLabelText(
            "Choose a country:",
            { selector: "select" },
	  );
	
	  await user.selectOptions(actualCountryOptions, testCountryNameValue);

	  const actualDomesticLeagueOptions: HTMLSelectElement =
		screen.getByLabelText("Choose a domestic league:", {
		  selector: "select",
		});

	  await user.selectOptions(
            actualDomesticLeagueOptions,
            testDomesticLeagueNameValue,
	  );

	  const actualClubOptions: HTMLSelectElement = screen.getByLabelText(
            "Choose a club:",
            { selector: "select" },
	  );
	  
	  await user.selectOptions(actualClubOptions, testClubNameValue);
	  await user.click(screen.getByRole("button", { name: "Submit" }))

	})
	.beforeEach(async () => {
	  cleanup();
	}),
      {numRuns: 1}
    );
    });
  

});
