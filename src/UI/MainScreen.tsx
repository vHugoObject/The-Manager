import React from "react";
import { useParams } from "react-router";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {
  getSaveEntitiesForMainScreen,
} from "./Hooks/SaveHooks";
import { SquadTable } from "./Components/SquadTable";
import { LeagueTable } from "./Components/LeagueTable";


export const MainScreen = () => {
  const params = useParams();
  const { saveNumber } = params;
  const [db, saveOptions, players, leagueTableRows] = getSaveEntitiesForMainScreen(
    saveNumber as string,
  );
  
  return (
    <div>
      <Container>
        <Row>
          <Col md={{span: 2}}>
            <LeagueTable leagueTableRows={leagueTableRows} />
          </Col>
	  <Col>
	    <div>
	    </div>
	  </Col>
          <Col md={{span: 2}}>	    
            <SquadTable players={players} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};
