import { split, join, map } from "lodash/fp"

export const joinOnUnderscores = join("_");
export const splitOnUnderscores = split("_");
export const charCodeOfCharacter = (character: string): number => character.charCodeAt(0)
export const integerToCharacter = (integer: number): string => String.fromCharCode(integer)
export const integersToCharacters = map(integerToCharacter)

