export enum CountryArrayIndices {
  Name,
  Competitions,
}

export type BaseCountry = [string, Array<string>, Array<Array<string>>];
export type BaseCountries = Array<BaseCountry>;
