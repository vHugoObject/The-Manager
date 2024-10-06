import {
  TableColumnHeaders,
  TableRow,
  SimpleHeader,
  BaseTable,
} from "./BaseComponents";

export const CompetitionTable = ({ competition, season }) => {
  const clubStatistics = competition.Clubs.map((club) => {
    const statisticsOnly = club.Statistics.BySeason[season];
    statisticsOnly["Club"] = club["Name"];
    return statisticsOnly;
  });
  return (
    <div>
      <SimpleHeader entityName={competition.Name} />
      <BaseTable
        rows={clubStatistics}
        columnHeaders={competition.ComponentKeys.competitionTableRowHeaders}
      />
    </div>
  );
};
