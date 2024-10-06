// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, afterEach } from "vitest";
import { zip } from "lodash";
import { Match } from "../Match";

describe("Match Components", async () => {
  const testMatchDate = "September 21, 2024";

  const expectedTeamStatistics = [
    "Possession",
    "Shots on target",
    "Saves",
    "Fouls",
    "Corners",
    "Crosses",
    "Touches",
    "Tackles",
    "Interceptions",
    "Aerials Won",
    "Clearances",
    "Offsides",
    "Goal Kicks",
    "Throw Ins",
    "Long Balls",
  ];

  const testEmptyTeamStatistics = Object.fromEntries(
    expectedTeamStatistics.map((header) => [header.replace(/\s/g, ""), 0]),
  );

  const expectedPlayerGameStandardStatsHeaders = [
    "Player",
    "Minutes",
    "Goals",
    "Assists",
    "Goals Plus Assists",
    "Non Penalty Goals",
    "Penalty Kicks Made",
    "Penalty Kicks Attempted",
    "Yellow Cards",
    "Red Cards",
    "Passes",
    "Carries",
    "Touches",
    "Tackles",
    "Interception",
    "Blocks",
  ];

  const testEmptyPlayerGameStandardStats = (name) => {
    const stats = Object.fromEntries(
      expectedPlayerGameStandardStatsHeaders.map((header) => [
        header.replace(/\s/g, ""),
        0,
      ]),
    );
    stats.Player = name;
    return stats;
  };

  const testPlayerMatchComponentKeys = {
    matchStatisticsHeaders: expectedPlayerGameStandardStatsHeaders,
  };
  // add componentKeys to players
  const testPlayerOne = {
    ID: 1,
    Name: "John Doe",
    Position: "Midfielder",
    Footed: "Right",
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Spain",
    Club: "Arsenal",
    Wages: 60_000,
    Statistics: {
      gameLog: {
        [testMatchDate]: testEmptyPlayerGameStandardStats("John Doe"),
      },
    },
    ComponentKeys: testPlayerMatchComponentKeys,
  };

  const testPlayerTwo = {
    ID: 2,
    Name: "Ederson",
    NationalTeam: "Brazil",
    Position: "Goalkeeper",
    Footed: "Right",
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Spain",
    Club: "Arsenal",
    Wages: 60_000,
    Statistics: {
      gameLog: { [testMatchDate]: testEmptyPlayerGameStandardStats("Ederson") },
    },
    ComponentKeys: testPlayerMatchComponentKeys,
  };

  const testClubOne = {
    ID: 1,
    Name: "Arsenal",
    Manager: "Mikel Arteta",
    MatchDaySquad: {
      starting11: { MF: testPlayerOne },
      bench: { GK: testPlayerTwo },
    },
    Statistics: { gameLog: { [testMatchDate]: testEmptyTeamStatistics } },
  };

  const testPlayerThree = {
    ID: 3,
    Name: "Harvey Elliot",
    Position: "Midfielder",
    Footed: "Right",
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Spain",
    Club: "Arsenal",
    Wages: 60_000,
    Statistics: {
      gameLog: {
        [testMatchDate]: testEmptyPlayerGameStandardStats("Harvey Elliot"),
      },
    },
    ComponentKeys: testPlayerMatchComponentKeys,
  };

  const testPlayerFour = {
    ID: 4,
    Name: "Allison",
    NationalTeam: "Brazil",
    Position: "Goalkeeper",
    Footed: "Right",
    Weight: 76,
    Height: 183,
    Age: 25,
    NationalTeam: "Spain",
    Club: "Arsenal",
    Wages: 60_000,
    Statistics: {
      gameLog: { [testMatchDate]: testEmptyPlayerGameStandardStats("Allison") },
    },
    ComponentKeys: testPlayerMatchComponentKeys,
  };

  const testClubTwo = {
    ID: 2,
    Name: "Tottenham",
    Manager: "Ange Postecolugu",
    MatchDaySquad: {
      starting11: { MF: testPlayerThree },
      bench: { GK: testPlayerFour },
    },
    Statistics: { gameLog: { [testMatchDate]: testEmptyTeamStatistics } },
  };

  const testMatchComponentKeys = {
    matchSubHeadings: ["MatchDate", "Competition"],
    teamStatisticsHeaders: expectedTeamStatistics,
    playerStatisticsHeaders: expectedPlayerGameStandardStatsHeaders,
  };

  const testMatch = {
    Name: "Arsenal vs. Tottenham",
    MatchDate: testMatchDate,
    MatchScore: { Arsenal: 0, Tottenham: 0 },
    Competition: "English Premier League",
    HomeTeam: testClubOne,
    AwayTeam: testClubTwo,
    HomeTeamManager: testClubOne.Manager,
    AwayTeamManager: testClubTwo.Manager,
    HomeTeamSquad: testClubOne.MatchDaySquad,
    AwayTeamSquad: testClubTwo.MatchDaySquad,
    HomeTeamOverallStatistics: testEmptyTeamStatistics,
    AwayTeamOverallStatistics: testEmptyTeamStatistics,
    ComponentKeys: testMatchComponentKeys,
  };

  const expectedTeamNames = [testMatch.HomeTeam.Name, testMatch.AwayTeam.Name];

  const testHomeTeamPlayers = [testPlayerOne, testPlayerTwo];

  const testAwayTeamPlayers = [testPlayerThree, testPlayerFour];

  test("test Match", async () => {
    render(<Match match={testMatch} />);

    testMatch.ComponentKeys.matchSubHeadings.forEach((header) => {
      expect(
        screen.getByText(testMatch[header], { selector: "h2" }),
      ).toBeTruthy();
    });

    zip(expectedTeamNames, ["homeTeamScore", "awayTeamScore"]).forEach(
      ([expectedTeamName, id]) => {
        expect(
          screen.getByText(expectedTeamName, { selector: `th[id=${id}]` }),
        ).toBeTruthy();
      },
    );

    zip(Object.values(testMatch.MatchScore), [
      "homeTeamScore",
      "awayTeamScore",
    ]).forEach(([score, id]) => {
      expect(
        screen.getByText(score, { selector: `strong[id=${id}]` }),
      ).toBeTruthy();
    });

    expect(screen.getAllByText("Bench", { selector: "th" })).toBeTruthy();

    const awayTeamStarters = Object.values(testMatch.AwayTeamSquad.starting11);
    Object.values(testMatch.HomeTeamSquad.starting11).forEach(
      (player, index) => {
        const testHomeTeamPlayerName = player.Name;
        const testAwayTeamPlayerName = awayTeamStarters[index].Name;
        [testHomeTeamPlayerName, testAwayTeamPlayerName].forEach(
          (playerCellText) => {
            expect(
              screen.getByText(playerCellText, { selector: "strong" }),
            ).toBeTruthy();
          },
        );
      },
    );

    const awayTeamBench = Object.values(testMatch.AwayTeamSquad.bench);
    Object.values(testMatch.HomeTeamSquad.bench).forEach((player, index) => {
      const testHomeTeamPlayerName = player.Name;
      const testAwayTeamPlayerName = awayTeamBench[index].Name;
      [testHomeTeamPlayerName, testAwayTeamPlayerName].forEach(
        (playerCellText) => {
          expect(
            screen.getByText(playerCellText, { selector: "strong" }),
          ).toBeTruthy();
        },
      );
    });

    expect(
      screen.getAllByText("Team Stats", { selector: "th[colSpan='3']" }),
    ).toBeTruthy();

    zip(expectedTeamNames, ["home_team_stats", "away_team_stats"]).forEach(
      ([expectedTeamName, id]) => {
        expect(
          screen.getAllByText(expectedTeamName, { selector: `th[id=${id}]` }),
        ).toBeTruthy();
      },
    );

    const expectedTeamStatisticsCells = expectedTeamStatistics.map(
      (statName) => [0, statName, 0],
    );

    expectedTeamStatisticsCells.forEach(
      ([homeStat, statName, awayStat], index) => {
        expect(
          screen.getAllByText(homeStat, {
            selector: `td[id=home_team_stat_${index}]`,
          }),
        ).toBeTruthy();

        expect(
          screen.getAllByText(statName, { selector: `td[id=stat_${index}]` }),
        ).toBeTruthy();

        expect(
          screen.getAllByText(awayStat, {
            selector: `td[id=away_team_stat_${index}]`,
          }),
        ).toBeTruthy();
      },
    );

    const expectedPlayerStatsHeaders = expectedTeamNames.map(
      (name) => `${name} Player Stats`,
    );
    const expectedIDS = ["homeTeamPlayerStats", "awayTeamPlayerStats"];
    zip(expectedPlayerStatsHeaders, expectedIDS).forEach(
      ([expectedTeamName, id]) => {
        expect(
          screen.getAllByText(expectedTeamName, { selector: `h2[id=${id}]` }),
        ).toBeTruthy();
      },
    );

    expectedPlayerGameStandardStatsHeaders.forEach(
      (expectedColumnHeader, index) => {
        const query = screen.getAllByText(expectedColumnHeader, {
          selector: `th[id='${index}']`,
        });
        expect(query.length).toBe(2);
      },
    );

    // seperate so we try to test if they come after a specific div?
    testHomeTeamPlayers.forEach((testPlayer, index) => {
      const testPlayerSeason = testPlayer.Statistics.gameLog[testMatchDate];
      expectedPlayerGameStandardStatsHeaders.forEach((columnHeader) => {
        const expectedKey = columnHeader.replace(/\s/g, "");
        expect(
          screen.getAllByText(testPlayerSeason[expectedKey], {
            selector: `td[id='${expectedKey}_${index}']`,
          }),
        ).toBeTruthy();
      });
    });

    testAwayTeamPlayers.forEach((testPlayer, index) => {
      const testPlayerSeason = testPlayer.Statistics.gameLog[testMatchDate];
      expectedPlayerGameStandardStatsHeaders.forEach((columnHeader) => {
        const expectedKey = columnHeader.replace(/\s/g, "");
        expect(
          screen.getAllByText(testPlayerSeason[expectedKey], {
            selector: `td[id='${expectedKey}_${index}']`,
          }),
        ).toBeTruthy();
      });
    });
  });
});
