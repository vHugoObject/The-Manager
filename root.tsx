import { Route, Routes } from "react-router-dom";
import { StartScreen } from "./UI/StartScreen";
import { baseCompetitions } from "./Competitions/baseCompetitions";
import { MainScreen } from "./UI/MainScreen";

export const App = () => (
  <Routes>
    <Route
      path="/"
      element={<StartScreen countriesLeaguesClubs={baseCompetitions} />}
    />
    <Route path="/save/:saveID" element={<MainScreen />} />
  </Routes>
);
