import { AllCompetitions } from "../Competitions/CompetitionTypes";

export type SaveID = number | IDBValidKey;

export interface Save {
 Name: string;
 Country: string;
 MainCompetition: string;
 Club: string;
 Seasons: number;
 CurrentSeason: string;
 allCompetitions: AllCompetitions;
 saveID?: SaveID
}
