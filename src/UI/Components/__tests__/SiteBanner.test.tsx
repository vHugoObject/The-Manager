// @vitest-environment jsdom
import React from "react";
import { screen, render, cleanup } from "@testing-library/react";
import { describe, expect, test, afterEach } from "vitest";
import { SiteBanner } from "../SiteBanner";

describe("SiteBanner tests", async () => {
  afterEach(async () => {
    cleanup();
  });

  test("test SiteBanner button ", async () => {
    render(<SiteBanner />);
    expect(
      screen.getByText("The Manager", { selector: "h2[id='site-banner']" }),
    ).toBeTruthy();
  });
});
