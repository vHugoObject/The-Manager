import { createClub } from "../Clubs/ClubUtilities";

const fullCompetitionTableRowHeaders = [
  "Club",
  "Wins",
  "Draws",
  "Losses",
  "Goals For",
  "Goals Against",
  "Goal Difference",
  "Points",
];

const simpleCompetitionTableRowHeaders = [
  "Club",
  "Wins",
  "Draws",
  "Losses",
  "Points",
];

export const createCompetition = (
  competitionName: string,
  startingSeason: string,
  clubs,
) => {
  const Clubs = clubs.map((club, index) => {
    return club.Name
      ? createClub(club.Name, index, startingSeason, club.Players)
      : createClub(club, index, startingSeason);
  });

  return {
    Name: competitionName,
    Clubs,
    ComponentKeys: {
      simpleCompetitionTableRowHeaders,
      fullCompetitionTableRowHeaders,
    },
  };
};
