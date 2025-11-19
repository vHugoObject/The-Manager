import { BaseCountry } from "./Types";

export const premierLeagueClubs: Array<string> = [
  'Arsenal',                'Aston Villa',
  'Bournemouth',            'Brentford',
  'Brighton & Hove Albion', 'Burnley',
  'Chelsea',                'Crystal Palace',
  'Everton',                'Fulham',
  'Leeds United',           'Liverpool',
  'Manchester City',        'Manchester United',
  'Newcastle United',       'Nottingham Forest',
  'Sunderland',             'Tottenham',
  'West Ham',               'Wolverhampton'
]

export const championshipClubs: Array<string> = [
  'Coventry City',     'Middlesbrough',
  'Stoke City',        'Preston North End',
  'Hull City',         'Millwall',
  'Ipswich Town',      'Bristol City',
  'Charlton Athletic', 'Derby County',
  'Birmingham City',   'Leicester City',
  'Wrexham',           'West Bromwich Albion',
  'Watford',           'Queens Park Rangers',
  'Southampton',       'Swansea City',
  'Blackburn Rovers',  'Portsmouth'
]

export const leagueOneClubs: Array<string> = [
  'Stockport County', 'Lincoln City',
  'Bradford City',    'Bolton Wanderers',
  'Cardiff City',     'Stevenage',
  'AFC Wimbledon',    'Luton Town',
  'Mansfield Town',   'Huddersfield Town',
  'Rotherham United', 'Burton Albion',
  'Barnsley',         'Wycombe Wanderers',
  'Northampton Town', 'Leyton Orient',
  'Wigan Athletic',   'Reading',
  'Doncaster Rovers', 'Exeter City',
  'Blackpool'
];

export const leagueTwoClubs: Array<string> = [
  'Swindon Town',       'Walsall',
  'Milton Keynes Dons', 'Notts County',
  'Bromley',            'Chesterfield',
  'Gillingham',         'Crewe Alexandra',
  'Salford City',       'Grimsby Town',
  'Barnet',             'Cambridge United',
  'Fleetwood Town',     'Colchester United',
  'Oldham Athletic',    'Tranmere Rovers',
  'Barrow',             'Accrington Stanley',
  'Bristol Rovers',     'Crawley Town'
]

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
