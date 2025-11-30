import React from "react";
import Table from "react-bootstrap/Table";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSwappingStrategy
} from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import { property } from "lodash/fp";
import { mapIndexed } from "futil-js";


export interface DraggableTableRowProps<T> {
  id: string;
  cellValueGetter: (rowValue: T, columnHeader: string) => string;
  columnHeaders: Array<string>;
  rowID: string;
  rowsObject: Record<string, T>;
}
export function DraggableTableRow<T>({
  id,
  cellValueGetter,
  columnHeaders,
  rowID,
  rowsObject
}: DraggableTableRowProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition } =
	useSortable({ id: rowID, attributes: {role: "row"} });


  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const rowValue = property(rowID, rowsObject)
  return (
    <tr id={id} ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {mapIndexed((columnHeader: string, index: number) => {
        return (
          <td key={index}>
            {cellValueGetter(rowValue, columnHeader)}
          </td>
        );
      })(columnHeaders)}
    </tr>
  );
}


export interface TableWithDraggableRowsProps<T> {
  cellValueGetter: (rowValue: T, columnHeader: string) => string;
  columnHeaders: Array<string>;
  rowsObject: Record<string, T>;
  itemIDs: Array<string>
  setItemIDs: Function;
}

export default function TableWithDraggableRows<T>({cellValueGetter, columnHeaders, rowsObject, itemIDs, setItemIDs}: TableWithDraggableRowsProps<T>) {  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    if (active.id !== over.id) {
      setItemIDs((oldItemIDs: Array<string>) => {
        const oldIndex = oldItemIDs.indexOf(active.id);
        const newIndex = oldItemIDs.indexOf(over.id);
        
        return arrayMove(oldItemIDs, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={itemIDs}
	strategy={rectSwappingStrategy}>
	<Table bordered hover>
	  <thead>
	    <tr>
	      {mapIndexed((header: string, key: number) => <th key={key}>{header}</th>)(columnHeaders)}
	    </tr>
	  </thead>
	  <tbody>
            {mapIndexed((rowID: string, rowIndex: number) => <DraggableTableRow id={rowIndex.toString()} key={rowIndex} cellValueGetter={cellValueGetter} columnHeaders={columnHeaders} rowID={rowID} rowsObject={rowsObject}/>)(itemIDs)}
	  </tbody>
	</Table>
      </SortableContext>
    </DndContext>
  );
 
}

