import React from "react";
import { Competition } from "../../Competitions/CompetitionTypes";
import { Club } from "../../Clubs/ClubTypes";
import {  StatisticsObject } from "../../Common/CommonTypes";

export const ClubSummary = ({save, season}) => {

  const clubSummaryStats: Array<string> = [
    "Record",
    "Home Record",
    "Away Record",
    "Domestic Competition",
    "Domestic Cups",
    "Continental Cup",
  ];



  const playerCountry: string = save.Country;
  const playerMainCompetitonName: string = save.MainCompetition;
  const playerClubName = save.Club;
  const playerMainCompetiton: Competition = save.allCompetitions[playerCountry][playerMainCompetitonName];
  const playerClub: Club = playerMainCompetiton.Clubs.find((club) => club.Name === playerClubName)
  
  const playerClubStats: StatisticsObject = playerClub.Statistics.BySeason[season]
  
  return (
    <div id="team-summary">
      <h2>{save.Club}</h2>
      {clubSummaryStats.map((stat, index) => (
        <p key={index}>
        <strong>{`${stat}: ${playerClubStats[stat.replace(/\s/g, "")]}`}</strong>
        </p>
      ))}
    </div>
  );
};
