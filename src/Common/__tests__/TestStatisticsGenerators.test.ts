import { describe, expect, assert } from "vitest";
import { it, fc } from "@fast-check/vitest";
import { fastCheckPlayerStatIndex,
  fastCheckPlayerMatchLog,
  
} from "../TestDataGenerators";

describe('playerStatistics', () => {

  it('fastCheckMatchLogObject', () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
	
      })
    )
  })
  
  it('fastCheckTestPlayerMatchStatistics', () => {
    fc.assert(
      fc.property(fc.gen(), (fcGen) => {
	
	
      })
    )
  })
  
})
