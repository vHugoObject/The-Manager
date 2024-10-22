import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addSaveToDB } from "../StorageUtilities/SaveUtilities";
import { createSave } from "../StorageUtilities/SaveCreator";
import { Save, SaveID } from "../StorageUtilities/SaveTypes";
import { SideMenu, SiteBanner } from "./Components/index";

export const NewGame = ({ countriesLeaguesClubs }) => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const handleCountrySelection = (e) => setSelectedCountry(e.target.value);
  const [selectedLeague, setSelectedLeague] = useState("");
  const handleLeagueSelection = (e) => setSelectedLeague(e.target.value);
  const [selectedClub, setSelectedClub] = useState("");
  const handleClubSelection = (e) => setSelectedClub(e.target.value);
  const navigate = useNavigate();

  const createNewGame = (formJSON): Save => {
    const playerName: string = formJSON["manager-name"];    
    const domesticLeague: string = formJSON["domestic-league"];
    const country: string = formJSON["country"];
    const club: string = formJSON["club"];
    const currentSeason: string = "2024"; // will get this from the form eventually
    const firstDay: string = "8/18/24"; 
    return createSave(playerName, country, domesticLeague, currentSeason, firstDay, club, countriesLeaguesClubs)    
  };

  const handleStartGame = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const formJSON = Object.fromEntries(formData.entries());
    const save: Save = createNewGame(formJSON);
    addSaveToDB(save)
      .then((saveID: SaveID) => {	
        navigate(`/save/${saveID}`);
      })
      .catch((error) => console.error("Failed to save game to db", error));
  };

  const chooseName = (
    <div>
    <label htmlFor="save-name"
	   class="grid grid-cols-1 gap-2"
    >
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
    <label htmlFor="country-options"
	   class="grid grid-cols-1 gap-2"
    >
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
    <label htmlFor="domestic-league-options"
	   class="grid grid-cols-1 gap-3"
    >
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
    <label htmlFor="club-options"
	   class="grid grid-cols-1 gap-2"
    >
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
    <div id="start-game"
      class="grid grid-cols-1 gap-2"
    >
      <button name="start-game" type="submit">
        Start Game
      </button>
    </div>
  );

  return (
    <div id="new-game"
      class="grid grid-cols-1 gap-5"
    >
      <SiteBanner />
      <div id="new-game-form">
        <SideMenu />
        <form role="form" method="post" onSubmit={handleStartGame}
		      class="grid grid-cols-4 gap-4">
          {chooseName}
          {chooseCountry}
          {chooseLeague}
          {chooseClub}
          {selectedCountry && selectedLeague && selectedClub && startGameButton}
        </form>
      </div>
    </div>
  );
};
