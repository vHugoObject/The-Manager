// @vitest-environment jsdom
import React from "react";
import { screen, cleanup, waitFor, render } from "@testing-library/react";
import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import "fake-indexeddb/auto";
import { renderWithRouter, setup } from "../UITestingUtilities";
import { StartScreen } from "../StartScreen"

describe("StartScreen test suite", async() => {

  test.prop([
    fc.gen(),
  ])("click on NewGame", async() => {

    const { user } = renderWithRouter(<StartScreen />)

    await user.click(screen.getByRole('button', {name: "New Game"}))
    expect(screen.getByText("Select a country:")).toBeTruthy()
    cleanup()
  });

  
})
