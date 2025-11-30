import React, { ReactNode } from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useNavigate } from "react-router";
import { matchW } from "fp-ts/Option";
import { OldSavesCards } from "./Components/OldSaves";
import { getAllSaveOptionsHook } from "./Hooks/SaveHooks";
import { SaveOptions } from "../GameLogic/Types";

export const StartScreen = () => {
  let navigate = useNavigate();
  const options = getAllSaveOptionsHook();
  return (
    <Container>
      <Row>
        <Col xs={4}>
          <Card style={{ width: "18rem" }} onClick={() => navigate("newsave")}>
            <Card.Header>Start New Game</Card.Header>
          </Card>
        </Col>
        <Col>
          {matchW<ReactNode, Array<[string, SaveOptions]>, ReactNode>(
            () => <div></div>,
            (saveOptions) => <OldSavesCards saveOptionTuples={saveOptions} />,
          )(options)}
        </Col>
      </Row>
    </Container>
  );
};
