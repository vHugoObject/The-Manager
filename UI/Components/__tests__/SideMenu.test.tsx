// @vitest-environment jsdom
import React from "react";
import { screen, render, cleanup } from "@testing-library/react";
import { describe, expect, test, afterEach } from "vitest";
import { renderWithRouter } from "../../UITestingUtilities";
import { SwitchSave, SideMenuDropdown, SideMenu } from "../SideMenu";

describe("SideMenu tests", async () => {
  afterEach(async () => {
    cleanup();
  });

  const buttons = {
    "Switch Save": "a[href='/']",
  };

  test("test SwitchSave button ", async () => {
    renderWithRouter(<SwitchSave index={0} />);
    expect(
      screen.getByText("Switch Save", { selector: "a[href='/']" }),
    ).toBeTruthy();
  });

  test("test SideMenuDropdown ", async () => {
    renderWithRouter(<SideMenuDropdown />);
    Object.entries(buttons).forEach(([text, selector]) => {
      expect(screen.getByText(text, { selector })).toBeTruthy();
    });
  });

  test("test fullSideMenu", async () => {
    const { user } = renderWithRouter(<SideMenu />);
    expect(
      screen.getByRole("button", { name: "control-side-menu" }),
    ).toBeTruthy();
    expect(() => {
      screen.getByText("Switch Save", { selector: "a[href='/']" });
    }).toThrowError();
    await user.click(screen.getByRole("button", { name: "control-side-menu" }));

    expect(
      screen.getByText("Switch Save", { selector: "a[href='/']" }),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "control-side-menu" }));
    expect(
      screen.getByRole("button", { name: "control-side-menu" }),
    ).toBeTruthy();
    expect(() => {
      screen.getByText("Switch Save", { selector: "a[href='/']" });
    }).toThrowError();
  });
});
