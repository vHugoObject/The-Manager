import { Player } from "../Players/PlayerTypes";
import { StatisticsType } from "../Common/CommonTypes";

export interface Club {
  ID: string;
  Name: string;
  Statistics: StatisticsType;
  Squad: Record<string, string>;
  Starting11: Record<string, string>;
  Bench: Record<string, string>;
}
