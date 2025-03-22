export enum PositionGroup {
  Midfielder,
  Attacker,
  Defender,
  Goalkeeper
}


export enum PlayerBioArrayIndices {
  FirstName,
  LastName,
  NationalTeam,
  Position,
  PositionGroup,
}

export enum PLAYERSKILLSANDPHYSICALDATAKEYS {
  Tackling,
  Passing,
  Shooting,
  Dribbling,

  Marking,
  Vision,
  Strength,

  AttackingWorkRate,
  DefendingWorkRate,
  PositionalAwareness,
  SprintSpeed,
  Agility,

  GKPositioning,
  GKDiving,
  GKHandling,
  GKReflexes,

  Height,
  Weight,
  Age,
  YearsLeftOnContract,
  Wages,
}


export enum ALLPOSITIONS {
  GK,

  RCB,
  LCB,
  LB,
  RB,

  CDM,
  CM,
  RM,
  LM,

  LW,
  RW,
  ST,
  CF,
}


export enum DEFENDINGSKILLS {
  Tackling=0,
  PositionalAwareness=9,
  Marking=5,
  SprintSpeed=10,
  Agility=11,
  DefendingWorkRate=8,
}

export enum GOALKEEPINGSKILLS {
  GKPositioning=12,
  GKDiving=13,
  GKHandling=14,
  GKReflexes=15,
}

export enum ATTACKINGSKILLS {
  Passing=1,
  Shooting=2,
  Dribbling=3,
  Vision=5,
  SprintSpeed=10,
  PositionalAwareness=9,
  AttackingWorkRate=7,
}
