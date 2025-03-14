import { zipAll } from "lodash/fp";
import { Competition } from "./CompetitionTypes";

export const createCompetition = async (
  [ID, Name]: [string, string],
  clubs: Array<[string, string]>,
): Promise<Competition> => {
  const [clubIDs] = zipAll(clubs) as [Array<string>, Array<string>];
  // shuffle clubIDs
  return {
    ID,
    Name,
    Clubs: clubIDs,
  };
};
