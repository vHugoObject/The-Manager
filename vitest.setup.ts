import "vitest-browser-react";
import { expect as baseExpect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { fc } from "@fast-check/vitest";

export const VitestTimeoutMs = 120000; // 120s

export const expect = baseExpect.extend(matchers);
fc.configureGlobal({
  interruptAfterTimeLimit: VitestTimeoutMs,
  markInterruptAsFailure: true,
});
