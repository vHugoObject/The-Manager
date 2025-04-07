import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import { map } from "lodash/fp";
import { flowAsync } from "futil-js";

describe("HandleMatches test suite", async () => {
  test.prop([fc.gen()])("handleMatches", async (testSkills) => {});
});
