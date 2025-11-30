import React, {useState} from "react";
import { property, curry, map } from "lodash/fp";
import { Player } from "../../GameLogic/Types";
import {
  getPlayerFirstName,
  getPlayerLastName,
  getPlayerCountryName,
  getPlayerPositionGroupName,
} from "../../GameLogic/Getters";
import TableWithDraggableRows from "./TableWithDraggableRows";
import "./stylesheet.css"

export const SQUADTABLEHEADERSGETTERSMAPPING: Record<
  string,
  (player: Player) => string
> = {
  "First Name": getPlayerFirstName,
  "Last Name": getPlayerLastName,
  Country: getPlayerCountryName,
  Age: property("PlayerAge"),
  Wage: property("PlayerWage"),
  "Position Group": getPlayerPositionGroupName,
};

const getPlayerCellValue = (player: Player, columnHeader: string): string =>
  property(columnHeader, SQUADTABLEHEADERSGETTERSMAPPING)(player);

export const SQUADTABLEHEADERS: Array<string> = Object.keys(
  SQUADTABLEHEADERSGETTERSMAPPING,
);


export const SquadTable = ({ players }: { players: Record<string, Player> }) => {

  const [itemIDs, setItemIDs] = useState(Object.keys(players))
  
  return (
    <div>
      <div aria-describedby="squad-table" id="squad">	
      <TableWithDraggableRows
	cellValueGetter={getPlayerCellValue}
	columnHeaders={SQUADTABLEHEADERS}
	rowsObject={players}
	itemIDs={itemIDs}
	setItemIDs={setItemIDs}/>
      </div>      
      <div role="tooltip" id="squad-table">
	<p>The first 11 players in this table will play in your next match</p>	
      </div>
    </div>
  );
};
