import { PositionGroup, BaseCountry } from "./Types";
import { ENGLAND } from "./England";

export const NONSPACESCHARACTERRANGE: [number, number] = [96, 3000];
export const JANUARY: number = 0;
export const FEBRUARY: number = 1;
export const JUNE: number = 5;
export const AUGUST: number = 7;
export const SEPTEMBER: number = 8;
export const DECEMBER: number = 11;

export enum IDPREFIXES {
  Attacker = "0",
  Midfielder = "1",
  Defender = "2",
  Goalkeeper = "3",
  Club = "4",
  DomesticLeague = "5",
  DomesticCup = "6",
  Country = "7",
  InternationalCup = "8",
}

export const DEFAULTSQUADSIZE: number = 25;
export const BASECLUBCOMPOSITION: Record<PositionGroup, number> = {
  [PositionGroup.Goalkeeper]: 4,
  [PositionGroup.Defender]: 7,
  [PositionGroup.Midfielder]: 7,
  [PositionGroup.Attacker]: 7,
};
export const PLAYERSPEROUTFIELDPOSITIONGROUP = 7;
export const MAXPLAYERIDPREFIXPLUSONE = 4;

export const DEFAULTMATCHCOMPOSITION: Array<number> = [1, 4, 3, 3];
export const DEFENSESTRENGTHBALANCE: [number, number] = [5, 95];
export const HOMEEFFECT: number = 0.383;
export const U: number = -1.035;
export const THETA: number = 0.562;
export const SHAPE: number = 1.864;
export const POSSIBLEGOALS: Array<number> = [0, 1, 2, 3, 4, 5];

export const DBNAME: string = "the-manager";
export const SAVESTORE: string = "save-games";
export const DBVERSION: number = 1;
export const KEYPATH: string = "SaveID";
export const startingCountries: Array<BaseCountry> = [ENGLAND];
export const COMPETITIONSDEPTH: number = 1;
export const CLUBSDEPTH: number = 2;
export const PLAYERSDEPTH: number = 3;

export const DEFAULTTESTCOUNTRIES: number = 2;
export const DEFAULTTESTCOMPETITIONSPERCOUNTRY: number = 5;
export const DEFAULTTESTCLUBSPERCOMPETITION: number = 20;
export const DEFAULTTESTMATCHESCOUNT: number = 20;
export const DEFAULTPLAYERSPERTESTMATCHES: number = 22;
export const TESTRANDOMSEASONRANGE = [2000, 2100];
export const DOUBLEBETWEENZEROAND1RANGE: [number, number] = [0.1, 1];
export const TESTROUNDROBINCLUBSRANGE: [number, number] = [18, 100];
