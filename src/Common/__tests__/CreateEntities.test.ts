import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  over,
  size,
  flatMap,
} from "lodash/fp";
import { flow } from "futil-js";
import {BaseEntities, Entity } from "../CommonTypes";
import {
  fastCheckTestBaseEntitiesGenerator,
} from "../../TestingUtilities/TestEntityGenerationUtilities";
import {
  getTestBaseEntitiesCount,
  getTestBaseEntitiesPlayersCount,
  convertBaseCountriesToBaseEntities,
} from "../BaseEntitiesUtilities";

import {
  getCountryDomesticLeagues,
  pickCountries,
} from "../../Countries/CountryUtilities";
import {
  getCompetitionClubs,
  pickDomesticLeagues,
  filterDomesticLeaguesByID,
} from "../../Competitions/CompetitionUtilities";
import {
  getClubSquad,
  pickClubs,
  filterClubsByID,
} from "../../Clubs/ClubUtilities";
import { filterPlayersByID } from "../../Players/PlayerUtilities";
import {
  createEntities,
} from "../CreateEntities";

describe("CreateEntities", () => {


  test.prop(
    [

    ],
    { numRuns: 0 },
  )("createEntities", (testSeason, testCountriesLeaguesClubs) => {
    const testBaseEntities: BaseEntities = convertBaseCountriesToBaseEntities(
      testSeason,
      testCountriesLeaguesClubs,
    );

    const actualEntities: Record<string, Entity> =
      createEntities(testBaseEntities);

    const getActualCountriesCount = flow(pickCountries, size);
    const getActualDomesticLeaguesCountFromCountries = flow(
      pickCountries,
      flatMap(getCountryDomesticLeagues),
      filterDomesticLeaguesByID,
      size,
    );
    const getActualClubsCountFromDomesticLeagues = flow(
      pickDomesticLeagues,
      flatMap(getCompetitionClubs),
      filterClubsByID,
      size,
    );
    const getActualPlayersCountFromClubs = flow(
      pickClubs,
      flatMap(getClubSquad),
      filterPlayersByID,
      size,
    );

    const [
      actualCountriesCount,
      actualDomesticLeaguesCountFromCountries,
      actualClubsCountFromDomesticLeagues,
      actualPlayersCountFromClubs,
    ] = flow(
      over([
        getActualCountriesCount,
        getActualDomesticLeaguesCountFromCountries,
        getActualClubsCountFromDomesticLeagues,
        getActualPlayersCountFromClubs,
      ]),
    )(actualEntities);

    const {
      countries: expectedCountriesCount,
      domesticLeagues: expectedDomesticLeaguesCount,
      clubs: expectedClubsCount,
    } = getTestBaseEntitiesCount(testBaseEntities);
    const expectedPlayersCount: number =
      getExpectedPlayersCount(testBaseEntities);

    expect(actualCountriesCount).toEqual(expectedCountriesCount);
    expect(actualDomesticLeaguesCountFromCountries).toEqual(
      expectedDomesticLeaguesCount,
    );
    expect(actualClubsCountFromDomesticLeagues).toEqual(expectedClubsCount);
    expect(actualPlayersCountFromClubs).toEqual(expectedPlayersCount);
  });
});
