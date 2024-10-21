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
  Players: Array<Player>;
}
