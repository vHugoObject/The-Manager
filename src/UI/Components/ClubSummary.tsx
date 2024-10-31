import React from "react";
import { useContext } from "react";
import { SaveContext } from "../DatabaseManagement";
import { Competition } from "../../Competitions/CompetitionTypes";
import { Club } from "../../Clubs/ClubTypes";
import { StatisticsObject } from "../../Common/CommonTypes";

export const ClubSummary = ({ season }) => {
  const currentSave = useContext(SaveContext);

  const clubSummaryStats: Array<string> = [
    "Record",
    "Home Record",
    "Away Record",
    "Domestic Competition",
    "Domestic Cups",
    "Continental Cup",
  ];

  const playerCountry: string = currentSave.Country;
  const playerMainCompetitonName: string = currentSave.MainCompetition;
  const playerClubName = currentSave.Club;
  const playerMainCompetiton: Competition =
    currentSave.allCompetitions[playerCountry][playerMainCompetitonName];
  const playerClub: Club = playerMainCompetiton.Clubs.find(
    (club) => club.Name === playerClubName,
  );

  const playerClubStats: StatisticsObject =
    playerClub.Statistics.BySeason[season];

  return (
    <div id="team-summary">
      <h2>{currentSave.Club}</h2>
      {clubSummaryStats.map((stat, index) => (
        <p key={index}>
          <strong>{`${stat}: ${playerClubStats[stat.replace(/\s/g, "")]}`}</strong>
        </p>
      ))}
    </div>
  );
};
