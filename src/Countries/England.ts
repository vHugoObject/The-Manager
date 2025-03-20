import { BaseCountry } from "./CountryTypes";
export const premierLeagueClubs: Array<string> = [
  "Liverpool",
  "Man United",
  "Leeds United",
  "Arsenal",
  "Spurs",
  "Aston Villa",
  "Everton",
  "Nottm Forest",
  "Millwall",
  "Coventry",
  "West Ham",
  "Norwich",
  "Sheff Wed",
  "Derby",
  "Chelsea",
  "Newcastle",
];

export const championshipClubs: Array<string> = [
  "Watford",
  "Stoke City",
  "Brighton",
  "Barnsley",
  "Plymouth",
  "Hull City",
  "Notts Co",
  "Man City",
  "Shrewsbury",
  "Burnley",
  "Charlton",
  "Sunderland",
  "Bradford",
  "Bury",
  "Sheff United",
  "Huddersfield",
];

export const leagueOneClubs: Array<string> = [
  "Wolves",
  "Oxford",
  "Swindon",
  "Walsall",
  "Newport",
  "Wigan",
  "Wimbledon",
  "Mansfield",
  "Southend",
  "Grimsby",
  "Blackburn",
  "Reading",
  "Crewe",
  "Darlington",
  "Port Value",
  "Stockport",
];

export const leagueTwoClubs: Array<string> = [
  "Scunthorpe",
  "York",
  "Bournemouth",
  "Doncaster",
  "Lincoln",
  "Rochdale",
  "Hereford",
  "Hartlepool",
  "Halifax",
  "Tranmere",
  "Aldershot",
  "Bristol",
  "Wrexham",
  "Torquay",
  "Gillingham",
  "Exeter",
];

export const England: BaseCountry = [
  "England",
  ["English Premier League", "The Championship", "League One", "League Two"],
  [premierLeagueClubs, championshipClubs, leagueOneClubs, leagueTwoClubs],
];

