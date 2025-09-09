import { BaseCountry } from "./Types";

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

const COUNTRYPRIZEMONEYBASEDONMERIT = [
  33.8, 32.1, 30.4, 28.7, 27.0, 25.3, 23.6, 22.0, 20.3, 18.6, 16.9, 15.2, 13.5,
  11.8, 10.1, 8.4, 6.8, 5.1, 3.4, 1.7,
];

const INTERNATIONALPRIZEMONEYBASEDONMERIT = [
  22.6, 21.4, 20.3, 19.2, 18.1, 16.9, 15.8, 14.7, 13.5, 12.4, 11.3, 10.2, 9.0,
  7.9, 6.8, 5.6, 4.5, 3.4, 2.3, 1.1,
];

const COUNTRYEQUALSHAREOFPRIZEMONEYPERCLUB: number = 31.2;
const INTERNATIONALEQUALSHAREOFPRIZEMONEYPERCLUB: number = 55.7;
const EQUALSHAREPAYMENT: number =
  COUNTRYEQUALSHAREOFPRIZEMONEYPERCLUB +
  INTERNATIONALEQUALSHAREOFPRIZEMONEYPERCLUB;

const CENTRALCOMMERCIALPAYMENT: number = 8.2;
const MERITBASEDPAYMENTS: Array<Array<number>> = [
  COUNTRYPRIZEMONEYBASEDONMERIT,
  INTERNATIONALPRIZEMONEYBASEDONMERIT,
];
const PAYMENTADJUSTMENTPERDIVISION: Array<number> = [1, 0.15, 0.1, 0.05, 0.025];

export interface LeagueRevenues {
  CentralCommercialPayment: number;
  EqualSharePayment: number;
  MeritBasedPayments: Array<Array<number>>;
  PaymentAdjustmentPerDivision: Array<number>;
}

// Based On 2023/24
export const ENGLANDFINANCESETTINGS: LeagueRevenues = {
  CentralCommercialPayment: CENTRALCOMMERCIALPAYMENT,
  EqualSharePayment: EQUALSHAREPAYMENT,
  MeritBasedPayments: MERITBASEDPAYMENTS,
  PaymentAdjustmentPerDivision: PAYMENTADJUSTMENTPERDIVISION,
};

export const ENGLAND: BaseCountry = [
  "England",
  ["English Premier League", "The Championship", "League One", "League Two"],
  [premierLeagueClubs, championshipClubs, leagueOneClubs, leagueTwoClubs],
];
