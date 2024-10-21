import React from "react";
import { Route, Routes } from "react-router-dom";
import { StartScreen } from "./UI/StartScreen";
import { NewGame } from "./UI/NewGame";
import { baseCompetitions } from "./Competitions/baseCompetitions";
import { MainScreen } from "./UI/MainScreen";

export const App = () => (
  <Routes>
    <Route path="/" element={<StartScreen />} />
    <Route
      path="/newGame"
      element={<NewGame countriesLeaguesClubs={baseCompetitions} />}
    />
    <Route path="/save/:saveID" element={<MainScreen />} />
  </Routes>
);
