import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { map, over, zipAll, size, sum, flatten, flatMap } from "lodash/fp";
import { flowAsync } from "futil-js";
import { BaseEntity, BaseEntities, Entity } from "../CommonTypes";
import { PositionGroup } from "../../Players/PlayerTypes";
import { BASECLUBCOMPOSITION, DEFAULTSQUADSIZE } from "../Constants";
import {
  convertToSet,
  convertArrayOfArraysToArrayOfSets,
} from "../CommonUtilities";
import { fakerToArb } from "../testingUtilities";
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
  getTestBaseEntitiesCount,
  getExpectedPlayersCount,
  convertBaseCountriesToBaseEntities,
  getExpectedLastIDsForMultiplePositions,
  getTotalTestClubs,
} from "../BaseEntitiesUtilities";
import {
  getTotalPlayersToGenerateBasedOnGivenComposition,
  createEntities,
  createPlayerIDsForClubs,
} from "../CreateEntities";

describe("CreateEntities", async () => {
  const POSITIONGROUPSLIST = Object.values(PositionGroup);

  test.prop([
    fc.tuple(
      fc.tuple(fc.constant(PositionGroup.Goalkeeper), fc.nat()),
      fc.tuple(fc.constant(PositionGroup.Defender), fc.nat()),
      fc.tuple(fc.constant(PositionGroup.Midfielder), fc.nat()),
      fc.tuple(fc.constant(PositionGroup.Attacker), fc.nat()),
    ),
    fc.integer({ min: 3 }),
    fc.nat(),
  ])(
    "getTotalPlayersToGenerateBasedOnGivenComposition",
    async (testComposition, testTotalClubs, testStartingIndex) => {
      const testCompositionGenerator =
        getTotalPlayersToGenerateBasedOnGivenComposition(testComposition);
      const actualPlayers: Array<[PositionGroup, number, number]> =
        testCompositionGenerator(testStartingIndex, testTotalClubs);

      const [, startingCounts] = zipAll(testComposition);
      const [actualPositionGroups, actualCounts, actualStartingIndices] =
        zipAll(actualPlayers);
      const [
        expectedPositionGroupsSet,
        actualPositionGroupsSet,
        expectedStartingIndicesSet,
        actualStartingIndicesSet,
      ] = convertArrayOfArraysToArrayOfSets([
        POSITIONGROUPSLIST,
        actualPositionGroups,
        [testStartingIndex],
        actualStartingIndices,
      ]);

      expect(actualPositionGroupsSet).toStrictEqual(expectedPositionGroupsSet);
      expect(actualStartingIndicesSet).toStrictEqual(
        expectedStartingIndicesSet,
      );
      const actualSumOfStartingCounts: number = sum(startingCounts);
      if (actualSumOfStartingCounts > 0) {
        expect(sum(actualCounts)).toBeGreaterThan(actualSumOfStartingCounts);
      }
    },
  );

  test.prop([
    fc.array(
      fc.array(
        fc.array(fc.tuple(fc.string(), fc.string()), {
          minLength: 20,
          maxLength: 40,
        }),
        { minLength: 5, maxLength: 10 },
      ),
      { minLength: 5, maxLength: 10 },
    ),
  ])("createPlayerIDsForClubs", async (testClubs) => {
    const actualPlayerIDs: Array<Array<string>> =
      await createPlayerIDsForClubs(testClubs);

    const expectedClubsCount: number = getTotalTestClubs(testClubs);

    const expectedPositionCounts =
      getTotalPlayersToGenerateBasedOnGivenComposition(
        BASECLUBCOMPOSITION,
        0,
        expectedClubsCount,
      );

    const expectedLastPositionIDs = getExpectedLastIDsForMultiplePositions(
      expectedPositionCounts,
    );

    const actualClubSizesSet = flowAsync(
      map(size),
      convertToSet,
    )(actualPlayerIDs);

    expect(actualClubSizesSet).toStrictEqual(new Set([DEFAULTSQUADSIZE]));

    const [actualIDsSet, expectedIDsSet]: Array<Set<string>> =
      convertArrayOfArraysToArrayOfSets([
        flatten(actualPlayerIDs),
        expectedLastPositionIDs,
      ]);
    expect(actualIDsSet.isSupersetOf(expectedIDsSet)).toBeTruthy();
  });

  test.prop([
    fc.integer({ min: 2000, max: 2100 }),
    fc.constantFrom(1, 2, 3, 4, 5).chain((testDomesticLeaguesCount: number) => {
      return fc.array(
        fc.tuple(
          fakerToArb((faker) => faker.location.country()),
          fc.array(
            fakerToArb((faker) => faker.company.name()),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
          fc.array(
            fc.array(
              fakerToArb((faker) => faker.company.name()),
              { minLength: 20, maxLength: 20 },
            ),
            {
              minLength: testDomesticLeaguesCount,
              maxLength: testDomesticLeaguesCount,
            },
          ),
        ),
        { minLength: 1, maxLength: 5 },
      );
    }),
  ])("createEntities", async (testSeason, testCountriesLeaguesClubs) => {
    const testBaseEntities: BaseEntities =
      await convertBaseCountriesToBaseEntities(
        testSeason,
        testCountriesLeaguesClubs,
      );

    const actualEntities: Record<string, Entity> =
      await createEntities(testBaseEntities);

    const getActualCountriesCount = flowAsync(pickCountries, size);
    const getActualDomesticLeaguesCountFromCountries = flowAsync(
      pickCountries,
      flatMap(getCountryDomesticLeagues),
      filterDomesticLeaguesByID,
      size,
    );
    const getActualClubsCountFromDomesticLeagues = flowAsync(
      pickDomesticLeagues,
      flatMap(getCompetitionClubs),
      filterClubsByID,
      size,
    );
    const getActualPlayersCountFromClubs = flowAsync(
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
    ] = flowAsync(
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
