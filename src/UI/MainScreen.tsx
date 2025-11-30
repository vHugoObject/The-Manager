import React from "react";
import { useParams } from "react-router";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { getSaveEntitiesForMainScreen } from "./Hooks/SaveHooks";
import MainScreenNavBar from "./Components/MainScreenNavBar";
import { SquadTable } from "./Components/SquadTable";
import { PartialLeagueTable } from "./Components/LeagueTable";

export const MainScreen = () => {
  const params = useParams();
  const { saveNumber } = params;
  const [db, saveOptions, players, leagueTableRowsAndHeader] =
    getSaveEntitiesForMainScreen(saveNumber as string);

  return (
    <div>
      <MainScreenNavBar saveNumber={saveNumber as string} />
      <Container>
        <Row>
          <Col md={{ span: 4 }}>
            {(leagueTableRowsAndHeader.length && (
              <PartialLeagueTable
                leagueTableRowsAndHeader={leagueTableRowsAndHeader}
              />
            )) || <div>Loading..</div>}
          </Col>
          <Col></Col>
          <Col md={{ span: 4 }}>
            {(Object.keys(players).length && <SquadTable players={players} />) || (
              <div>Loading..</div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};
