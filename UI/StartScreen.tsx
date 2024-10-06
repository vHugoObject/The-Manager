import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addSaveToDB } from "../StorageUtilities/SaveUtilities";
import { createClub } from "../Clubs/ClubUtilities";
import { createCompetition } from "../Competitions/CompetitionUtilities";

export const StartScreen = ({ countriesLeaguesClubs }) => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const handleCountrySelection = (e) => setSelectedCountry(e.target.value);
  const [selectedLeague, setSelectedLeague] = useState("");
  const handleLeagueSelection = (e) => setSelectedLeague(e.target.value);
  const [selectedClub, setSelectedClub] = useState("");
  const handleClubSelection = (e) => setSelectedClub(e.target.value);
  const navigate = useNavigate();

  const createNewGame = (formJSON) => {
    const playerName = formJSON["manager-name"];
    const currentSeason = "2024"; // will get this from the form eventually
    const domesticLeague = formJSON["domestic-league"];
    const country = formJSON["country"];
    const club = formJSON["club"];
    const allClubs = countriesLeaguesClubs[country][domesticLeague];
    const allClubsMinusPlayerClub = Array.from(
      new Set(allClubs).difference(new Set([club])),
    );
    const playerClub = createClub(
      club,
      allClubsMinusPlayerClub.length,
      currentSeason,
    );
    const playerMainCompetition = createCompetition(
      domesticLeague,
      currentSeason,
      allClubsMinusPlayerClub,
    );
    playerMainCompetition.Clubs.push(playerClub);
    return {
      playerName,
      currentSeason,
      playerClub,
      playerMainCompetition,
    };
  };

  const handleStartGame = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const formJSON = Object.fromEntries(formData.entries());
    const save = createNewGame(formJSON);
    addSaveToDB(save)
      .then((saveID) => {
        navigate(`/save/${saveID}`);
      })
      .catch((error) => console.error("Failed to save game to db", error));
  };

  const chooseName = (
    <div>
      <label htmlFor="save-name">
        {" "}
        Choose a name:
        <input
          type="text"
          id="save-name"
          aria-label="save-name"
          name="manager-name"
          required
        ></input>
      </label>
    </div>
  );

  const chooseCountry = (
    <div>
      <label htmlFor="country-options">
        {" "}
        Choose a country:
        <select
          aria-label="country-options"
          id="country-options"
          name="country"
          value={selectedCountry}
          onChange={handleCountrySelection}
        >
          <option value="">Select a country</option>
          {Object.keys(countriesLeaguesClubs).map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>
    </div>
  );

  const chooseLeague = (
    <div>
      <label htmlFor="domestic-league-options">
        {" "}
        Choose a domestic league:
        <select
          aria-label="domestic-league-options"
          id="domestic-league-options"
          name="domestic-league"
          value={selectedLeague}
          onChange={handleLeagueSelection}
        >
          {selectedCountry && (
            <>
              <option value="">Select a league</option>
              {Object.keys(countriesLeaguesClubs[selectedCountry]).map(
                (league, index) => (
                  <option key={index} value={league}>
                    {league}
                  </option>
                ),
              )}
            </>
          )}
        </select>
      </label>
    </div>
  );

  const chooseClub = (
    <div>
      <label htmlFor="club-options">
        {" "}
        Choose a club:
        <select
          aria-label="club-options"
          id="club-options"
          name="club"
          value={selectedClub}
          onChange={handleClubSelection}
        >
          {selectedLeague && (
            <>
              <option value="">Select a team</option>
              {countriesLeaguesClubs[selectedCountry][selectedLeague].map(
                (team, index) => (
                  <option key={index} value={team}>
                    {team}
                  </option>
                ),
              )}
            </>
          )}
        </select>
      </label>
    </div>
  );

  const startGameButton = (
    <div id="start-game">
      <button name="start-game" type="submit">
        Start Game
      </button>
    </div>
  );

  return (
    <form role="form" method="post" onSubmit={handleStartGame}>
      {chooseName}
      {chooseCountry}
      {chooseLeague}
      {chooseClub}
      {selectedCountry && selectedLeague && selectedClub && startGameButton}
    </form>
  );
};
