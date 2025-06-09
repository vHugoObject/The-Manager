import { COUNTRYNAMES, FIRSTNAMES, LASTNAMES } from "./Names";

export enum PositionGroup {
  Attacker = "0",
  Midfielder = "1",
  Defender = "2",
  Goalkeeper = "3",
}

export enum PLAYERDATAINDICES {
  FirstName = "0",
  LastName = "1",
  NationalTeam = "2",
  Position = "3",
  
  Tackling = "4",
  Passing = "5",
  Shooting = "6",
  Dribbling = "7",

  Marking = "8",
  Vision = "9",
  Strength = "10",

  AttackingWorkRate = "11",
  DefendingWorkRate = "12",
  PositionalAwareness = "13",
  SprintSpeed = "14",
  Agility = "15",

  GKPositioning = "16",
  GKDiving = "17",
  GKHandling = "18",
  GKReflexes = "19",

  Height = "20",
  Weight = "21",
  Age = "22",
  YearsLeftOnContract = "23",
  Wages = "24",
}

export enum ALLPOSITIONS {
  LW="0",
  RW="1",
  ST="2",
  CF="3",

  RCB="4",
  LCB="5",
  LB="6",
  RB="7",

  CDM="8",
  CM="9",
  RM="10",
  LM="11",
  
  
  GK="12",
}

export enum DEFENDINGSKILLS {
  Tackling = "0",
  Marking = "8",
  PositionalAwareness = "13",
  SprintSpeed = "14",
  Agility = "15",
  DefendingWorkRate = "12"
}

export enum GOALKEEPINGSKILLS {
  GKPositioning = "16",
  GKDiving = "17",
  GKHandling = "18",
  GKReflexes = "19",
}

export enum ATTACKINGSKILLS {
  Passing = "5",
  Shooting = "6",
  Dribbling = "7",
  Vision = "9",
  AttackingWorkRate = "11",
  PositionalAwareness = "13",
  SprintSpeed = "14"
}

export const POSITIONGROUPSCOUNT: number = 4

const FIRSTNAMESRANGE: [number, number] = [0, FIRSTNAMES.length]
const LASTNAMESRANGE: [number, number] = [0, LASTNAMES.length]
const COUNTRYNAMESRANGE: [number, number] = [0, COUNTRYNAMES.length]

const HEIGHTRANGE: [number, number] = [160, 200];
const WEIGHTRANGE: [number, number] = [60, 100];
const AGERANGE: [number, number] = [18, 40];
const YEARS: [number, number] = [1, 5];
const WAGES: [number, number] = [5_000, 1_000_000];

const POSITIONPRIMARYSKILLSRANGE: [number, number] = [50, 99];
const POSITIONSECONDARYSKILLSRANGE: [number, number] = [25, 75];
const BASICSKILLSRANGE: [number, number] = [25, 99];
const OTHERSKILLSRANGE: [number, number] = [25, 50];
const SKILLRANGEADJUSTMENTBYDIVISION: Array<number> = [0, -5, -10, -15, -20]
// ((PlayerDomesticLeagueLevel * PlayerNumber) % rangeAdjustedForDivision)
// Adjust Increase Via playerPositionTotal?
export const PLAYERSKILLSPHYSICALCONTRACTRANDOMPLUSORMINUS: number = 5;

// https://gist.github.com/mstn/5f75651100556dbe30e405691471afe3
type FixedSizeArray<N extends number, T, M extends string = "0"> = {
  readonly [k in M]: any;
} & { length: N } & ReadonlyArray<T>;

// LW, RW, ST, CF
const ATTACKERPOSITIONGROUPRANGES: [number, number] = [0,3]
// LM. RM, CM, CDM
const MIDFIELDERPOSITIONGROUPRANGES: [number, number] = [4,7]
// LB, RB, LCB, RCB
const DEFENDERPOSITIONGROUPRANGES: [number, number] = [8,11]
const GOALKEEPERPOSITIONGROUPRANGES: [number, number] = [12,12]


export const COUNTOFPLAYERDATACATEORIES: number = Object.keys(PLAYERDATAINDICES).length
export const PLAYERDATARANGESBYPOSITION: Record<
  PositionGroup,
  FixedSizeArray<25, [number, number]>
> = {
  [PositionGroup.Midfielder]: [
    FIRSTNAMESRANGE,
    LASTNAMESRANGE,
    COUNTRYNAMESRANGE,
    MIDFIELDERPOSITIONGROUPRANGES,
    
    POSITIONSECONDARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,

    POSITIONSECONDARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,

    POSITIONSECONDARYSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,
    BASICSKILLSRANGE,

    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,

    HEIGHTRANGE,
    WEIGHTRANGE,
    AGERANGE,
    YEARS,
    WAGES,
  ],
  [PositionGroup.Defender]: [
    FIRSTNAMESRANGE,
    LASTNAMESRANGE,
    COUNTRYNAMESRANGE,
    DEFENDERPOSITIONGROUPRANGES,
    
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,
    BASICSKILLSRANGE,
    BASICSKILLSRANGE,

    POSITIONPRIMARYSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,
    BASICSKILLSRANGE,

    BASICSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,
    BASICSKILLSRANGE,

    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,

    HEIGHTRANGE,
    WEIGHTRANGE,
    AGERANGE,
    YEARS,
    WAGES,
  ],
  [PositionGroup.Attacker]: [
    FIRSTNAMESRANGE,
    LASTNAMESRANGE,
    COUNTRYNAMESRANGE,
    ATTACKERPOSITIONGROUPRANGES,
    
    BASICSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,

    BASICSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,

    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,
    BASICSKILLSRANGE,

    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,

    HEIGHTRANGE,
    WEIGHTRANGE,
    AGERANGE,
    YEARS,
    WAGES,
  ],
  [PositionGroup.Goalkeeper]: [
    FIRSTNAMESRANGE,
    LASTNAMESRANGE,
    COUNTRYNAMESRANGE,
    GOALKEEPERPOSITIONGROUPRANGES,
    
    POSITIONSECONDARYSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,
    OTHERSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,

    POSITIONSECONDARYSKILLSRANGE,
    POSITIONSECONDARYSKILLSRANGE,
    BASICSKILLSRANGE,

    OTHERSKILLSRANGE,
    OTHERSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    BASICSKILLSRANGE,
    BASICSKILLSRANGE,

    POSITIONPRIMARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,
    POSITIONPRIMARYSKILLSRANGE,

    HEIGHTRANGE,
    WEIGHTRANGE,
    AGERANGE,
    YEARS,
    WAGES,
  ],
};
