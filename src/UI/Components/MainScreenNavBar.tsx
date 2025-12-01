import React from "react";
import { useNavigate } from "react-router";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

const MainScreenNavBar = ({ saveNumber }: { saveNumber: string }) => {
  let navigate = useNavigate();

  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand>The Manager</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown title="Sim" id="collapsible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">
                Sim One Week
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Sim One Month
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">
                Sim Until The End of The Season
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link onClick={() => navigate(`LeagueTable`)}>
              LeagueTable
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainScreenNavBar;
