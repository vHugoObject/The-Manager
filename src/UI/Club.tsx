import {
  ExtendedHeader,
  TableColumnHeaders,
  TableRow,
  BaseTable,
} from "./BaseComponents";

export const ClubStandardStats = ({ tableClub, date }) => {
  const playerStatistics = tableClub.Players.map((player) => {
    const statisticsOnly = player.Statistics.BySeason[date];
    statisticsOnly["Name"] = player["Name"];
    statisticsOnly["NationalTeam"] = player["NationalTeam"];
    statisticsOnly["Position"] = player["Position"];
    return statisticsOnly;
  });

  return (
    <div>
      <ExtendedHeader
        entity={tableClub}
        paragraphs={tableClub.ComponentKeys.clubSummaryStatsHeaders}
      />
      <BaseTable
        rows={playerStatistics}
        columnHeaders={tableClub.ComponentKeys.clubStandardStatsHeaders}
      />
    </div>
  );
};
