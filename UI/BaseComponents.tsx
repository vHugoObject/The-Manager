import React from "react";
export const SimpleHeader = ({ entityName }) => {
  return <h2>{entityName}</h2>;
};

const Loading = () => <h2> Loading... </h2>;

export const ExtendedHeader = ({ entity, paragraphs }) => {
  return (
    <div>
      <h2>{entity.Name}</h2>
      {paragraphs.map((paragraphName: string, index: number) => (
        <p key={index}>
          <strong>
            {`${paragraphName}: ${entity[paragraphName.replace(/\s/g, "")]}`}{" "}
          </strong>
        </p>
      ))}
    </div>
  );
};

export const TableColumnHeaders = ({ columnHeaders }) => {
  return (
    <thead>
      <tr>
        {columnHeaders.map((header: string, index: number) => (
          <th key={index} id={String(index)}>
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export const TableRow = ({ entity, tableColumnHeaders, rowKey }) => {
  return (
    <tr key={rowKey}>
      {tableColumnHeaders.map((columnHeader: string, index: number) => (
        <td
          key={index}
          id={`${columnHeader.replace(/\s/g, "").concat("_")}${rowKey}`}
        >
          {entity[columnHeader.replace(/\s/g, "")]}
        </td>
      ))}
    </tr>
  );
};

export const BaseTable = ({ rows, columnHeaders }) => {
  return (
    <div>
      <table>
        <TableColumnHeaders columnHeaders={columnHeaders} />
        <tbody>
          {Object.values(rows).map((rowValue, index) => (
            <TableRow
              key={index}
              entity={rowValue}
              tableColumnHeaders={columnHeaders}
              rowKey={index}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
