
export type BaseEntity = [string, string];

export interface BaseEntities {
  countries: Array<BaseEntity>;
  domesticLeagues: Array<Array<BaseEntity>>;
  clubs: Array<Array<Array<BaseEntity>>>;
  players?: Array<Array<Array<Array<BaseEntity>>>>;
}


export type Entity = Array<number|string|Array<string>>
