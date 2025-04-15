import { test, fc  } from "@fast-check/vitest";
import { describe, assert } from "vitest";
import { charCodeOfCharacter, integerToCharacter } from "../StringUtilities"

describe("StringUtilities test suite", async () => {

  test.prop([fc.string({minLength: 1, maxLength: 1})])(
    "charCodeOfCharacter",
    async (testChar) => {

      const actualCharCode: number = charCodeOfCharacter(testChar)
      assert.isNumber(actualCharCode)
      
    }
  );
  
  test.prop([fc.integer({min: 1, max: 100})])(
    "integerToCharacter",
    async (testInteger) => {
      
      const actualChar: string = integerToCharacter(testInteger)
      assert.isString(actualChar)
      
    }
  );




});
