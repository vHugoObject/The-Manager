import { Match, SquadStatus } from "./MatchTypes";
import { Club } from "../Clubs/ClubTypes";
import { createEmptyMatchStatistics } from "./MatchUtilities";

export const createMatch = async (
  MatchID: string,
  MatchDate: Date,
  Home: Club,
  Away: Club,
  Competition: string,
  Country: string,
): Promise<Match> => {
  const homeStatus: SquadStatus = {
    onField: Home.Starting11,
    onBench: Home.Bench,
    subbedOut: {},
    injured: {},
    suspended: {},
  };

  const awayStatus: SquadStatus = {
    onField: Away.Starting11,
    onBench: Away.Bench,
    subbedOut: {},
    injured: {},
    suspended: {},
  };

  return {
    MatchID,
    MatchDate,
    MatchScore: { [Home.Name]: 0, [Away.Name]: 0 },
    Competition,
    Country,
    Home,
    Away,
    HomeSquad: homeStatus,
    AwaySquad: awayStatus,
    HomeOverallStatistics: createEmptyMatchStatistics(),
    AwayOverallStatistics: createEmptyMatchStatistics(),
    Simulated: false,
  };
};
