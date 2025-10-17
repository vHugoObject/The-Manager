import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes } from "react-router-dom";
import { StartScreen } from "./UI/StartScreen";
import { MainScreen } from "./UI/MainScreen";
import { NewSave } from "./UI/NewSave";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="saves/:saveNumber" element={<MainScreen />} />
      <Route path="newsave" element={<NewSave />} />
    </Routes>
  );
};
