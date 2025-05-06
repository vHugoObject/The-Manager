import React from "react";
import { useState, useEffect, useContext, useReducer } from "react";
import { useNavigate } from "react-router-dom";


export const StartScreen = () => {
  return (
    <div data-test>
      <button type="submit">
	Start New Save
      </button>
    </div>)
}
