export interface Competition {
  ID: string;
  Name: string;
  Clubs: Array<string>;
}

export type Competitions = Record<string, Record<string, Competition>>;
