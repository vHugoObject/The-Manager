export enum PositionGroup {
  Goalkeeper = "3",
  Defender = "2",
  Midfielder = "0",
  Attacker = "1",
}

export enum PLAYERBIOINDICES {
  FirstName="0",
  LastName="1",
  NationalTeam="2",
  Position="3",
  PositionGroup="4",
}

export enum PLAYERSKILLSPHYSICALCONTRACTINDICES {
  Tackling="0",
  Passing="1",
  Shooting="2",
  Dribbling="3",

  Marking="4",
  Vision="5",
  Strength="6",

  AttackingWorkRate="7",
  DefendingWorkRate="8",
  PositionalAwareness="9",
  SprintSpeed="10",
  Agility="11",

  GKPositioning="12",
  GKDiving="13",
  GKHandling="14",
  GKReflexes="15",

  Height="16",
  Weight="17",
  Age="18",
  YearsLeftOnContract="19",
  Wages="20",
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
  Tackling = "0",
  PositionalAwareness = "9",
  Marking = "5",
  SprintSpeed = "10",
  Agility = "11",
  DefendingWorkRate = "8",
}

export enum GOALKEEPINGSKILLS {
  GKPositioning = "12",
  GKDiving = "13",
  GKHandling = "14",
  GKReflexes = "15",
}

export enum ATTACKINGSKILLS {
  Passing = "1",
  Shooting = "2",
  Dribbling = "3",
  Vision = "5",
  SprintSpeed = "10",
  PositionalAwareness = "9",
  AttackingWorkRate = "7",
}
