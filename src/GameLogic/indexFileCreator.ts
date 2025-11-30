import { writeFileSync } from "node:fs";
import { flow, map, isString } from "lodash";
import { indexesCreator } from "./Transformers";

const indexFileCreator = ([baseIndices, name]: [
  Array<string>,
  string,
]): void => {
  // [name, keyPath]

  const mapper = (index: string | Array<string>) =>
    map(index, (x: string | Array<string>): [string, string | Array<string>] =>
      isString(x) ? [x, x] : [x.join("."), x],
    );
  const indexes: string = flow([indexesCreator, mapper, JSON.stringify])(
    baseIndices,
  );
  const variableName = name.toUpperCase();
  const fileString: string = `export const ${variableName} = ${indexes}`;
  const fullFileName: string = `src/GameLogic/${name}.ts`;
  writeFileSync(fullFileName, fileString, { flag: "w+" });
};

const BASEPLAYERINDEXES: Array<string> = [
  "PlayerFirstName",
  "PlayerLastName",
  "PlayerCountry",
  "PlayerAge",
  "PositionGroup",
  "PlayerLeagueCountry",
  "PlayerDomesticLeagueLevel",
  "PlayerDomesticLeagueNumber",
  "PlayerClubNumber",
];

const BASECLUBINDEXES: Array<string> = [
  "ClubCountry",
  "ClubDomesticLeagueLevel",
  "ClubDomesticLeagueNumber",
  "ClubScheduleNumber",
];

const BASEDOMESTICLEAGUEINDEXES: Array<string> = [
  "LeagueCountry",
  "LeagueLevel",
  "LeagueClubs",
];

const BASEMATCHLOGINDEXES: Array<string> = [
  "MatchLeagueNumber",
  "MatchSeason",
  "MatchWeek",
  "MatchResult",
];

const BASEARGUMENTS: Array<[Array<string>, string]> = [
  [BASEPLAYERINDEXES, "PlayerIndexes"],
  [BASECLUBINDEXES, "ClubIndexes"],
  [BASEDOMESTICLEAGUEINDEXES, "DomesticLeagueIndexes"],
  [BASEMATCHLOGINDEXES, "MatchLogIndexes"],
];

map(BASEARGUMENTS, indexFileCreator);
