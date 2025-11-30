import { multiply, subtract } from "lodash/fp";
import { BaseCountries, ClubMatchResult } from "./Types";
import { ENGLAND } from "./England";

export const NONSPACESCHARACTERRANGE: [number, number] = [96, 10000];
export const JANUARY: number = 0;
export const FEBRUARY: number = 1;
export const JUNE: number = 5;
export const AUGUST: number = 7;
export const SEPTEMBER: number = 8;
export const DECEMBER: number = 11;

export enum BaseCountriesIndices {
  COUNTRYINDEX = 0,
  DOMESTICLEAGUESINDEX = 1,
  CLUBSINDEX = 2,
}

export const DEFAULTMATCHESPERDOMESTICLEAGUE: number = 38;
export const DEFAULTDOMESTICLEAGUESPERCOUNTRY: number = 5;
export const DEFAULTDOMESTICLEAGUESPERCOUNTRYNUMBERRANGE: [number, number] = [
  0, 4,
];
export const DEFAULTCLUBSPERDOMESTICLEAGUE = 20;
export const DEFAULTMATCHESPERWEEKPERDOMESTICLEAGUE =
  DEFAULTCLUBSPERDOMESTICLEAGUE / 2 - 1;
export const DEFAULTSQUADSIZE: number = 25;

export const DEFAULTOTALCOUNTRIES: number = 5;

export const DEFAULTCLUBSPERCOUNTRY = multiply(
  DEFAULTCLUBSPERDOMESTICLEAGUE,
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
);
export const DEFAULTPLAYERSPERDOMESTICLEAGUE = multiply(
  DEFAULTCLUBSPERDOMESTICLEAGUE,
  DEFAULTSQUADSIZE,
);
export const DEFAULTPLAYERSPERCOUNTRY = multiply(
  DEFAULTCLUBSPERCOUNTRY,
  DEFAULTSQUADSIZE,
);

export const DEFAULTTOTALDOMESTICLEAGUES = multiply(
  DEFAULTDOMESTICLEAGUESPERCOUNTRY,
  DEFAULTOTALCOUNTRIES,
);

export const DEFAULTTOTALCLUBS = multiply(
  DEFAULTCLUBSPERCOUNTRY,
  DEFAULTOTALCOUNTRIES,
);

export const DEFAULTTOTALPLAYERS = multiply(
  DEFAULTPLAYERSPERCOUNTRY,
  DEFAULTOTALCOUNTRIES,
);

export const DEFAULTPLAYERSPEROUTFIELDPOSITIONGROUP: number = 7;
export const DEFAULTGOALKEEPERPERCLUB: number = 4;
// aligned with NumberPREFIXES/PositionGroup enum
export const DEFAULTPLAYERSPERPOSITIONGROUP: Array<number> = [7, 7, 7, 4];

export const DEFAULTMATCHCOMPOSITION: Array<number> = [1, 4, 3, 3];
export const DEFAULTPLAYERSONFIELDPERSQUAD: number = 11;
export const DEFAULTPLAYERSONBENCH = subtract(
  DEFAULTSQUADSIZE,
  DEFAULTPLAYERSONFIELDPERSQUAD,
);
export const DEFAULTMATCHLENGTH: number = 90;

export const DEFENSESTRENGTHBALANCE: [number, number] = [5, 95];
export const HOMEEFFECT: number = 0.383;
export const U: number = -1.035;
export const THETA: number = 0.562;
export const SHAPE: number = 1.864;
export const POSSIBLEGOALS: Array<number> = [0, 1, 2, 3, 4, 5];

export const COMPETITIONSDEPTH: number = 1;
export const CLUBSDEPTH: number = 2;
export const PLAYERSDEPTH: number = 3;

export const DEFAULTTESTCOUNTRIES: number = 2;
export const DEFAULTTESTCOMPETITIONSPERCOUNTRY: number = 5;
export const DEFAULTTESTCLUBSPERCOMPETITION: number = 20;
export const DEFAULTTESTMATCHESCOUNT: number = 20;
export const DEFAULTPLAYERSPERTESTMATCHES: number = 22;
export const TESTRANDOMSEASONRANGE: [number, number] = [2000, 2100];
export const DOUBLEBETWEENZEROAND1RANGE: [number, number] = [0.1, 1];
export const TESTROUNDROBINCLUBSRANGE: [number, number] = [18, 100];

export const DEFAULTATTENDANCERANGE: [number, number] = [10_000, 50_000];
export const DEFAULTFACILITIESCOSTSRANGE: [number, number] = [200_000, 350_000];
export const DEFAULTSPONSORREVENUERANGE: [number, number] = [
  5_000_000, 80_000_000,
];
export const DEFAULTTICKETSPRICERANGE: [number, number] = [30, 100];

export const DEFAULTMANAGERPAYRANGE: [number, number] = [1_000_000, 30_000_000];
export const DEFAULTSCOUTINGCOSTRANGE: [number, number] = [250_000, 5_000_000];
export const DEFAULTHEALTHCOSTRANGE: [number, number] = [250_000, 5_000_000];
export const DEFAULTPLAYERDEVELOPMENTCOSTRANGE: [number, number] = [
  250_000, 5_000_000,
];
export const DEFAULTWAGEBILLTOREVENUERATIO: [number, number] = [50, 95];

export const DEFAULTCLUBDATARANGES: Array<[number, number]> = [
  DEFAULTATTENDANCERANGE,
  DEFAULTFACILITIESCOSTSRANGE,
  DEFAULTSPONSORREVENUERANGE,
  DEFAULTTICKETSPRICERANGE,
  DEFAULTMANAGERPAYRANGE,
  DEFAULTSCOUTINGCOSTRANGE,
  DEFAULTHEALTHCOSTRANGE,
  DEFAULTPLAYERDEVELOPMENTCOSTRANGE,
  DEFAULTWAGEBILLTOREVENUERATIO,
];

export const INFLATION: number = 0.2;
export const DEFAULTADJUSTMENTPERDIVISION: Array<number> = [
  1, 0.75, 0.5, 0.25, 0.1,
];
export const DEFAULTCYCLESPERDOMESTICLEAGUE: number = 1.25;
export const DEFAULTSTEPS: number = multiply(
  DEFAULTCLUBSPERDOMESTICLEAGUE,
  DEFAULTCYCLESPERDOMESTICLEAGUE,
);

export const BASECOUNTRIES: BaseCountries = [ENGLAND];

export const CLUBKEYS: Array<string> = [
  "ClubNumber",
  "ClubCountry",
  "ClubDomesticLeagueLevel",
  "ClubDomesticLeagueNumber",
  "ClubScheduleNumber",
  "ClubAttendance",
  "ClubFaciltiesCosts",
  "ClubSponsorPayment",
  "ClubTicketPrice",
  "ClubManagerPay",
  "ClubScoutingCosts",
  "ClubHealthCosts",
  "ClubPlayerDevelopmentCosts",
  "ClubPlayers",
];

export const LEAGUEKEYS: Array<string> = [
  "LeagueNumber",
  "LeagueCountry",
  "LeagueLevel",
  "LeagueClubs",
];

export const MATCHLOGKEYS: Array<string> = [
  "MatchID",
  "MatchLeagueNumber",
  "MatchSeason",
  "MatchWeek",
  "MatchResult",
  "ClubMatchLogs",
];

export const EMPTYMATCHRESULT: ClubMatchResult = {
  Home: 0,
  Wins: 0,
  Losses: 0,
  Draws: 0,
  "Goals For": 0,
  "Goals Against": 0,
  Points: 0,
};
