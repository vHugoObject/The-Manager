export const DBVERSION: number = 1;

export const LEAGUETABLEHEADERS: Array<string> = ["Country", "Level", "Clubs"];

export const OBJECTSTORENAMES: Array<string> = [
  "SaveArguments",
  "Clubs",
  "Players",
  "Matches",
];

export const BASECLUBINDEXES: Array<string> = [
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

export const BASEDOMESTICLEAGUEINDEXES: Array<string> = [
  "LeagueCountry",
  "LeagueLevel",
  "LeagueClubs",
];

export const BASEMATCHLOGINDEXES: Array<string> = [
  "MatchLeagueNumber",
  "MatchSeason",
  "MatchWeek",
  "ClubMatchLogs",
];

export { PLAYERINDEXES } from "./PlayerIndexes";
export { CLUBINDEXES } from "./ClubIndexes";
export { DOMESTICLEAGUEINDEXES } from "./DomesticLeagueIndexes";
export { MATCHLOGINDEXES } from "./MatchLogIndexes";
