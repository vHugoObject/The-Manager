import { Player } from "../Players/PlayerTypes";
import {
  StatisticsType,
} from "../Common/CommonTypes";

export interface Club {
  ID: string;
  Name: string;
  Statistics: StatisticsType;
  Squad: Record<string, Player>;
  Starting11: Record<string, Player>;
  Bench: Record<string, Player>;
}
