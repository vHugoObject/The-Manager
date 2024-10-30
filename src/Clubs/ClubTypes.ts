import { Player } from "../Players/PlayerTypes";
import {
  StatisticsObject,
  StatisticsType,
  ComponentKeysObject,
} from "../Common/CommonTypes";

export interface Club {
  ID: number;
  Name: string;
  Statistics: StatisticsType;
  Squad: Array<Player>;
  Starting11: Array<Player>;
  Bench: Array<Player>;
}
