import React from "react";
import Card from "react-bootstrap/Card"
import { useNavigate } from "react-router";
import { OldSavesCards } from "./Components/OldSaves"
import { getAllSaveOptionsHook } from "./Hooks/SaveHooks"

export const StartScreen = () => {
  let navigate = useNavigate();
  const saves = getAllSaveOptionsHook();
  console.log(saves)
  return (
    <div>
      <OldSavesCards saveOptionTuples={saves}/>
      <Card onClick={() => navigate("newsave")}>
	<Card.Header>Start New Game</Card.Header>  	
      </Card>
    </div>
  );
};
