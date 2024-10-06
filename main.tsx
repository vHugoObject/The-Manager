import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, BrowserRouter } from "react-router-dom";
import { App } from "./root";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      {" "}
      <App />{" "}
    </BrowserRouter>
  </StrictMode>,
);