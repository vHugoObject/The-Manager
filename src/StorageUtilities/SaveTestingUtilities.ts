import { fc } from "@fast-check/vitest";
import { curry } from "lodash/fp";
import { BaseEntities } from "../Common/CommonTypes";
import {
  fastCheckTestBaseEntitiesGenerator,
  getCompletelyRandomClubIDAndDomesticLeagueID,
} from "../TestingUtilities/index";
import { Save, SaveArguments } from "../SaveTypes";
import { createSave } from "../createSave";

export const createTestSave = curry(
  async (
    fcGen: fc.GeneratorValue,
    [testPlayerName, testSeason, testCountriesDomesticsLeaguesClubsCount]: [
      string,
      number,
      [number, number, number],
    ],
  ): Promise<Save> => {
    const testBaseEntities: BaseEntities =
      await fastCheckTestBaseEntitiesGenerator(
        [testSeason, testCountriesDomesticsLeaguesClubsCount],
        fcGen,
      );

    const [testPlayerMainDomesticLeague, testPlayerClub]: [string, string] =
      getCompletelyRandomClubIDAndDomesticLeagueID(fcGen, testBaseEntities);

    const testSaveArguments: SaveArguments = {
      Name: testPlayerName,
      UserMainDomesticLeagueID: testPlayerMainDomesticLeague,
      UserClubID: testPlayerClub,
      CurrentSeason: testSeason,
      BaseEntities: testBaseEntities,
    };

    return await createSave(testSaveArguments);
  },
);
