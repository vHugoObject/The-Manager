import { describe, expect, test } from "vitest";
import { simpleFaker } from "@faker-js/faker";
import { flow } from "lodash";
import { sampleSize, flatMap, sample, mergeAll } from "lodash/fp";
import { differenceInDays, isBefore, isAfter } from "date-fns";
import { CalendarEntry, Calendar, Entity } from "../CommonTypes";
import { BaseCountries } from "../../Countries/CountryTypes";
import { createCountries } from "../../Countries/CountryUtilities";
import { Club } from "../../Clubs/ClubTypes";
import { Player } from "../../Players/PlayerTypes";
import { Save } from "../../StorageUtilities/SaveTypes";
import { createSave } from "../../StorageUtilities/SaveCreator";
import {
  createCalendar,
  totalDoubleRoundRobinGames,
  entityObjectsMerger,
  entityObjectsReducer,
  entityObjectsCreator,
  entityReferencesCreator,
  getEntity,
  getEntityName,
  getEntitiesNames,
  getEntities,
  getEntityWithID,
  getEntitiesWithIDs,
  getCurrentDateAsObject,
} from "../simulationUtilities";

describe("simulationUtilities test suite", async () => {
  const testCountryOne: string = "England";

  const testCompetitionsOne: Record<string, Record<string, string>> = {
    "English Premier League": {
      [simpleFaker.string.numeric(6)]: "Arsenal",
      [simpleFaker.string.numeric(6)]: "Brentford",
    },
    "The Championship": {
      [simpleFaker.string.numeric(6)]: "Watford",
      [simpleFaker.string.numeric(6)]: "Stoke City",
    },
    "League One": {
      [simpleFaker.string.numeric(6)]: "Walsall",
      [simpleFaker.string.numeric(6)]: "Swindon",
    },
  };

  const testCountryTwo: string = "Spain";

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
  };

  const testSeason: string = "2024";

  const testCountriesLeaguesClubs: BaseCountries = {
    [testCountryOne]: testCompetitionsOne,
    [testCountryTwo]: testCompetitionsTwo,
  };

  const [testCountries, testCompetitions, testClubs, testPlayers] =
    await createCountries(testCountriesLeaguesClubs, testSeason);

  const threeRandom = sampleSize(3);
  const fiveRandom = sampleSize(5);
  const threeRandomKeys = flow(Object.keys, threeRandom);

  const threeRandomEntities = flow(threeRandom, Object.values);
  const [testClubOne, testClubTwo, testClubThree] =
    threeRandomEntities(testClubs);
  const [testPlayerOne, testPlayerTwo, testPlayerThree] =
    threeRandomEntities(testPlayers);

  const nestedObjectsToList = flatMap(
    (object: Record<string, any>): Array<any> => Object.values(object),
  );
  const expectedClubs: Array<[string, string]> = flow(
    Object.values,
    nestedObjectsToList,
    mergeAll,
    Object.entries,
  )(testCountriesLeaguesClubs);
  const [testPlayerClubID, testPlayerClub] = sample(expectedClubs);
  const testClubKeys: Array<string> = expectedClubs.flatMap(
    ([id]: [string, string]) => id,
  );
  const expectedClubNames: Array<string> = expectedClubs.flatMap(
    ([, name]: [string, string]) => name,
  );
  const setOfExpectedClubNames: Set<string> = new Set(expectedClubNames);
  const testPlayerCountry: string = "England";
  const testPlayerCompetitionName: string = "English Premier League";
  const testPlayerName: string = "Mikel Arteta";

  const testSave: Save = await createSave(
    testPlayerName,
    testPlayerCountry,
    testPlayerCompetitionName,
    testSeason,
    { clubID: testPlayerClubID, clubName: testPlayerClub },
    testCountriesLeaguesClubs,
  );

  test("test createCalendar", () => {
    const testFirstDay: Date = new Date("08/11/24");
    const expectedSeasonStartDate: Date = new Date("08/18/24");
    const expectedSeasonEndDate: Date = new Date("06/14/25");

    const expectedSummerTransferWindowCloseDate: Date = new Date("08/30/24");
    const expectedWinterTransferWindowOpenDate: Date = new Date("01/01/25");
    const expectedWinterTransferWindowCloseDate: Date = new Date("02/03/25");

    const expectedDays: number =
      differenceInDays(expectedSeasonEndDate, testFirstDay) + 1;

    const expectedSeasonStartDateValues: CalendarEntry = {
      matches: {},
      seasonStartDate: true,
      seasonEndDate: false,
      transferWindowOpen: true,
    };

    const expectedSeasonEndDateValues: CalendarEntry = {
      matches: {},
      seasonStartDate: false,
      seasonEndDate: true,
      transferWindowOpen: false,
    };

    const expectedTransferWindowOpenValues: CalendarEntry = {
      matches: {},
      seasonStartDate: false,
      seasonEndDate: false,
      transferWindowOpen: true,
    };

    const expectedTransferWindowClosedValues: CalendarEntry = {
      matches: {},
      seasonStartDate: false,
      seasonEndDate: false,
      transferWindowOpen: false,
    };

    const actualCalendar: Calendar = createCalendar(testFirstDay);

    expect(Object.keys(actualCalendar).length).toBe(expectedDays);
    expect(Object.keys(actualCalendar)[0]).toBe(testFirstDay.toDateString());
    expect(Object.keys(actualCalendar)[expectedDays - 1]).toBe(
      expectedSeasonEndDate.toDateString(),
    );
    expect(
      actualCalendar[expectedSeasonStartDate.toDateString()],
    ).toStrictEqual(expectedSeasonStartDateValues);
    expect(actualCalendar[expectedSeasonEndDate.toDateString()]).toStrictEqual(
      expectedSeasonEndDateValues,
    );

    Object.entries(actualCalendar).forEach(([date, dateValues]) => {
      const currentDate: Date = new Date(date);
      if (isBefore(currentDate, expectedSeasonStartDate)) {
        expect(dateValues).toStrictEqual(expectedTransferWindowOpenValues);
      }

      if (
        isAfter(currentDate, expectedSeasonStartDate) &&
        isBefore(currentDate, expectedSummerTransferWindowCloseDate)
      ) {
        expect(dateValues).toStrictEqual(expectedTransferWindowOpenValues);
      }

      if (
        isAfter(currentDate, expectedSummerTransferWindowCloseDate) &&
        isBefore(currentDate, expectedWinterTransferWindowOpenDate)
      ) {
        expect(dateValues).toStrictEqual(expectedTransferWindowClosedValues);
      }

      if (
        isAfter(currentDate, expectedWinterTransferWindowOpenDate) &&
        isBefore(currentDate, expectedWinterTransferWindowCloseDate)
      ) {
        expect(dateValues).toStrictEqual(expectedTransferWindowOpenValues);
      }

      if (
        isAfter(currentDate, expectedWinterTransferWindowCloseDate) &&
        isBefore(currentDate, expectedSeasonEndDate)
      ) {
        expect(dateValues).toStrictEqual(expectedTransferWindowClosedValues);
      }
    });
  });

  test("totalDoubleRoundRobinGames", () => {
    const tests: Array<[number, number]> = [
      [4, 12],
      [6, 30],
      [18, 306],
      [20, 380],
    ];
    tests.forEach(([clubs, expectedValue]) => {
      const actualValue: number = totalDoubleRoundRobinGames(clubs);
      expect(actualValue).toBe(expectedValue);
    });
  });

  test("entityObjectsCreator", async () => {
    const expectedClubOne: Record<string, Club> = {
      [testClubOne.ID]: testClubOne,
    };
    const expectedPlayerOne: Record<string, Player> = {
      [testPlayerOne.ID]: testPlayerOne,
    };
    const expectedEntityObjects: Array<Record<string, Entity>> = [
      expectedClubOne,
      expectedPlayerOne,
    ];
    const actualEntityObjects: Array<Record<string, Entity>> =
      await Promise.all(
        [testClubOne, testPlayerOne].map(
          async (entity: Entity) => await entityObjectsCreator([entity]),
        ),
      );
    expect(expectedEntityObjects.flat()).toStrictEqual(actualEntityObjects);
  });

  test("entityReferencesCreator", async () => {
    const expectedClubTwo: Record<string, string> = {
      [testClubTwo.ID]: testClubTwo.Name,
    };
    const expectedPlayerTwo: Record<string, string> = {
      [testPlayerTwo.ID]: testPlayerTwo.Name,
    };
    const expectedEntityReferences: Array<Record<string, string>> = [
      expectedClubTwo,
      expectedPlayerTwo,
    ];
    const actualEntityReferences: Array<Record<string, string>> =
      await Promise.all(
        [testClubTwo, testPlayerTwo].map(
          async (entity: Entity) => await entityReferencesCreator([entity]),
        ),
      );
    expect(expectedEntityReferences.flat()).toStrictEqual(
      actualEntityReferences,
    );
  });

  test("entityObjectsMerger", () => {
    const expectedClubs: Record<string, Club> = {
      [testClubOne.ID]: testClubOne,
      [testClubTwo.ID]: testClubTwo,
    };

    const expectedPlayers: Record<string, Player> = {
      [testPlayerOne.ID]: testPlayerOne,
      [testPlayerTwo.ID]: testPlayerTwo,
    };

    const testClubObjects: Array<Record<string, Club>> = [
      { [testClubOne.ID]: testClubOne },
      { [testClubTwo.ID]: testClubTwo },
    ];
    const testPlayerObjects: Array<Record<string, Player>> = [
      { [testPlayerOne.ID]: testPlayerOne },
      { [testPlayerTwo.ID]: testPlayerTwo },
    ];

    const actualClubs = entityObjectsMerger(...testClubObjects);
    expect(actualClubs).toStrictEqual(expectedClubs);
    const actualPlayers = entityObjectsMerger(...testPlayerObjects);
    expect(actualPlayers).toStrictEqual(expectedPlayers);
  });

  test("entityObjectsReducer", async () => {
    const expectedClubs: Record<string, Club> = {
      [testClubOne.ID]: testClubOne,
      [testClubTwo.ID]: testClubTwo,
      [testClubThree.ID]: testClubThree,
    };

    const expectedPlayers: Record<string, Player> = {
      [testPlayerOne.ID]: testPlayerOne,
      [testPlayerTwo.ID]: testPlayerTwo,
      [testPlayerThree.ID]: testPlayerThree,
    };

    const testClubObjects: Array<Record<string, Club>> = [
      { [testClubOne.ID]: testClubOne },
      { [testClubTwo.ID]: testClubTwo },
      { [testClubThree.ID]: testClubThree },
    ];
    const testPlayerObjects: Array<Record<string, Player>> = [
      { [testPlayerOne.ID]: testPlayerOne },
      { [testPlayerTwo.ID]: testPlayerTwo },
      { [testPlayerThree.ID]: testPlayerThree },
    ];

    const actualClubs = await entityObjectsReducer(testClubObjects);
    expect(actualClubs).toStrictEqual(expectedClubs);
    const actualPlayers = await entityObjectsReducer(testPlayerObjects);
    expect(actualPlayers).toStrictEqual(expectedPlayers);
  });

  test("getEntity", async () => {
    const threeRandomEntityKeys: Array<string> = threeRandomKeys(
      testSave.Entities,
    );
    await Promise.all(
      threeRandomEntityKeys.map(async (testEntityKey: string) => {
        const actualEntity: Entity = await getEntity(testSave, testEntityKey);
        expect(actualEntity).toBeDefined();
      }),
    );
  });

  test("getEntities", async () => {
    const threeRandomEntityKeys: Array<string> = threeRandomKeys(
      testSave.Entities,
    );
    const actualEntities: Array<Entity> = await getEntities(
      testSave,
      threeRandomEntityKeys,
    );
    actualEntities.forEach((actualEntity: Entity) => {
      expect(actualEntity).toBeDefined();
    });
  });

  test("getEntityName", async () => {
    const fiveRandomEntityKeys: Array<string> = threeRandomKeys(
      testSave.Entities,
    );

    await Promise.all(
      fiveRandomEntityKeys.map(async (testEntityKey: string) => {
        const actualEntityName: string = await getEntityName(
          testSave,
          testEntityKey,
        );
        expect(actualEntityName).toBeDefined();
      }),
    );

    await Promise.all(
      expectedClubs.flatMap(
        async ([testClubKey, expectedClubName]: [string, string]) => {
          const actualClubName: string = await getEntityName(
            testSave,
            testClubKey,
          );
          expect(actualClubName).toBe(expectedClubName);
        },
      ),
    );
  });

  test("getEntitiesNames", async () => {
    const threeRandomEntityKeys: Array<string> = threeRandomKeys(
      testSave.Entities,
    );

    const actualEntitiesNames: Array<string> = await getEntitiesNames(
      testSave,
      threeRandomEntityKeys,
    );

    actualEntitiesNames.forEach((actualEntityName: string) => {
      expect(actualEntityName).toBeDefined();
    });

    const actualClubNames: Array<string> = await getEntitiesNames(
      testSave,
      testClubKeys,
    );
    const setOfActualClubNames: Set<string> = new Set(actualClubNames);
    expect(setOfActualClubNames).toStrictEqual(setOfExpectedClubNames);
  });

  test("getEntityWithID", async () => {
    const threeRandomEntityKeys: Array<string> = threeRandomKeys(
      testSave.Entities,
    );
    await Promise.all(
      threeRandomEntityKeys.map(async (testEntityKey: string) => {
        const actualEntityWithID: Record<string, Entity> =
          await getEntityWithID(testSave, testEntityKey);
        expect(actualEntityWithID[testEntityKey]).toBeDefined();
      }),
    );
  });

  test("getEntitiesWithIDs", async () => {
    const threeRandomEntityKeys: Array<string> = threeRandomKeys(
      testSave.Entities,
    );

    const actualEntities: Record<string, Entity> = await getEntitiesWithIDs(
      testSave,
      threeRandomEntityKeys,
    );

    threeRandomEntityKeys.forEach((expectedEntityKey: string) => {
      expect(actualEntities[expectedEntityKey]).toBeDefined();
    });
  });

  test("test getCurrentDateAsObject", async () => {
    const { Date: actualCurrentDate } = await getCurrentDateAsObject(testSave);
    expect(actualCurrentDate).toBe(testSave.CurrentDate.toDateString());
  });
});
