import * as React from 'react';
import { ArrayTableModel } from '../array_table_model';
import { HeaderCell } from '../header_cell';
import { SortOrder } from '../sort_order';
import { TableView } from '../table_view';

/** Demo that displays the TableView. */
export class TableViewDemo extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
    this.model = new ArrayTableModel();
  }

  public render(): JSX.Element {
    return <TableView model={this.model} style={TableViewDemo.someStyle}
      headerCells={this.headerCells} height={700}/>;
  }

  public componentDidMount(): void {
    for(let row = 0; row < 10000; ++row) {
      const r = [];
      for(let column = 0; column < 4; ++column) {
        if(column === 0) {
          r.push(row);
        } else if(column === 2 || column === 3) {
          r.push(Math.floor(Math.random() * 10));
        } else {
          r.push(Math.floor(Math.random() * 50));
        }
      }
      this.model.push(r);
    }
    setInterval(this.changeValues, 2000);
  }

  private changeValues = () => {
    const diceRoll = Math.floor(Math.random() * 4);
    const testRow = Math.floor(Math.random() * this.model.rowCount);
    if(this.model.rowCount > 500 && diceRoll === 0) {
      this.model.remove(testRow);
    } else if(diceRoll === 1) {
      const num = Math.floor(Math.random() * 90) + 100;
      this.model.insert([this.model.rowCount, num, num, num], 0);
    } else {
      const testValue = Math.floor(Math.random() * this.model.rowCount) + 0.5;
      const testColumn = Math.floor(Math.random() * 4);
      this.model.set(testRow, testColumn, testValue);
    }
  }

  private headerCells = [
    new HeaderCell('Distance', 'Dist.', SortOrder.NONE,
      () => {}),
    new HeaderCell('Unsortable', 'No Sort.', SortOrder.UNSORTABLE,
      () => {}),
    new HeaderCell('Volume', 'Vol.', SortOrder.NONE,
      () => {}),
    new HeaderCell('Length', 'Len.', SortOrder.NONE,
      () => {})
  ];
  private static someStyle = {
    table: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '20px',
      borderCollapse: 'collapse',
      border: '5px solid #000000'
    },
    td: {
      border: '2px solid #000000',
      paddingLeft: '30px',
      paddingRight: '30px',
      color: '#4b23a0'
    }
  };
  private model: ArrayTableModel;
}
