export interface Country {
  ID: string;
  Name: string;
  Competitions: Array<string>;
}

export type BaseCountry = [string, Array<string>, Array<Array<string>>];
