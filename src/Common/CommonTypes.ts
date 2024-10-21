export type ComponentKeysObject = Record<string, Array<string>>;
export type StatisticsObject = Record<string, number | string>;

export type StatisticsEntry = Record<string, StatisticsObject>;

export interface StatisticsType {
  BySeason: Record<string, StatisticsObject>;
  GameLog: Record<string, StatisticsObject>;
}
