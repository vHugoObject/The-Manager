import { describe, expect, test, expectTypeOf } from "vitest";
import { simpleFaker } from "@faker-js/faker";
import { Club } from "../../Clubs/ClubTypes";
import { Match, SquadStatus } from "../MatchTypes";
import {  Player } from "../../Players/PlayerTypes";
import { Save, SaveID } from "../../StorageUtilities/SaveTypes";
import { BaseCountries } from "../../Countries/CountryTypes";
import { entityReferencesCreator } from "../../Common/simulationUtilities"
import { createSave } from "../../StorageUtilities/SaveCreator";
import { getClubPlayerObjects } from "../MatchCreationUtilities";

describe("simulateMatch test suite", async () => {

  const testSeason: string = "2024"
  const testPlayerCountry: string = "England";
  const testPlayerCompetitionName: string = "English Premier League";
  const testPlayerClub: string = "Arsenal";
  const testPlayerName: string = "Mikel Arteta";  
  const testCountryOne: string = "England";
  const testMatchDate: Date = new Date("September 21, 2024"); 


  const testCompetitionsOne: Record<string, Record<string, string>> = {
    "English Premier League": {
      [simpleFaker.string.numeric(6)]: "Arsenal",
      [simpleFaker.string.numeric(6)]: "Brentford",
      [simpleFaker.string.numeric(6)]: "Manchester United",
      [simpleFaker.string.numeric(6)]: "Liverpool",
    },
    "The Championship": {
      [simpleFaker.string.numeric(6)]: "Watford",
      [simpleFaker.string.numeric(6)]: "Stoke City",
      [simpleFaker.string.numeric(6)]: "Manchester City",
      [simpleFaker.string.numeric(6)]: "Hull City",
    },
    "League One": {
      [simpleFaker.string.numeric(6)]: "Walsall",
      [simpleFaker.string.numeric(6)]: "Swindon",
      [simpleFaker.string.numeric(6)]: "Farnham",
      [simpleFaker.string.numeric(6)]: "Cambridge",
    },
  };

  const testCountryTwo: string = "Spain";

  // add more teams
  const testCompetitionsTwo: Record<string, Record<string, string>> = {
    "Primera Division": {
      [simpleFaker.string.numeric(6)]: "Real Madrid CF",
      [simpleFaker.string.numeric(6)]: "FC Barcelona",
    },
    "Segunda Division": {
      [simpleFaker.string.numeric(6)]: "Almeria",
      [simpleFaker.string.numeric(6)]: "Granada",
    },
    "Primera Federacion": {
      [simpleFaker.string.numeric(6)]: "Andorra",
      [simpleFaker.string.numeric(6)]: "Atzeneta",
    },
  }

  const testCountriesLeaguesClubs: BaseCountries = {
    [testCountryOne]: testCompetitionsOne,
    [testCountryTwo]: testCompetitionsTwo,
  }

  const testSave: Save = await createSave(
      testPlayerName,
      testPlayerCountry,
      testPlayerCompetitionName,
      testSeason,
      { clubID: simpleFaker.string.numeric(6), clubName: testPlayerClub },
      testCountriesLeaguesClubs,
  );
  
        
  test("test getClubPlayerObjects", async () => {

    const testClubs: Record<string, Club> = testSave.allClubs;
    const testPlayers: Record<string, Player> = testSave.allPlayers;

    await Promise.all(Object.values(testClubs).map(async(testClub: Club) => {
      
      const expectedClubPlayerIDs: Array<string> = Object.keys(testClub.Squad).toSorted()
      const actualClubPlayers: Record<string, Player> = await getClubPlayerObjects(testSave, expectedClubPlayerIDs)      
      const actualClubPlayerIDs: Array<string> = Object.keys(actualClubPlayers).toSorted()
      expect(expectedClubPlayerIDs).toStrictEqual(actualClubPlayerIDs)
      expect(Object.values(actualClubPlayers).length).toBe(25)
      
    })
    )
  });


  test("test createMatch", async () => {


  })



});
