import { simpleFaker } from "@faker-js/faker";
import { Match, SquadStatus } from "./MatchTypes";
import { Club } from "../Clubs/ClubTypes";
import { createEmptyMatchStatistics } from "./MatchUtilities";

export const createMatch = async (
  MatchDate: Date,
  Home: Club,
  Away: Club,
  Competition: string,
): Promise<Match> => {
  const homeStatus: SquadStatus = {
    onField: Home.Starting11,
    onBench: Home.Bench,
    subbedOut: [],
    injured: [],
    suspended: [],
  };

  const awayStatus: SquadStatus = {
    onField: Away.Starting11,
    onBench: Away.Bench,
    subbedOut: [],
    injured: [],
    suspended: [],
  };

  return {
    MatchDate,
    MatchScore: { [Home.Name]: 0, [Away.Name]: 0 },
    Competition,
    Home,
    Away,
    HomeSquad: homeStatus,
    AwaySquad: awayStatus,
    HomeOverallStatistics: createEmptyMatchStatistics(),
    AwayOverallStatistics: createEmptyMatchStatistics(),
    Simulated: false,
  };
};
