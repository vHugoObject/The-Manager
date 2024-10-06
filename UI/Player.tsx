import React from "react";
import { ExtendedHeader, BaseTable } from "./BaseComponents";

export const PlayerStandardStats = ({ player }) => {
  return (
    <div>
      <ExtendedHeader
        entity={player}
        paragraphs={player.ComponentKeys.bioParagraphs}
      />
      <BaseTable
        rows={player.Statistics.BySeason}
        columnHeaders={player.ComponentKeys.standardStatsHeaders}
      />
    </div>
  );
};
