import * as React from 'react';
import { ArrayTableModel } from '../array_table_model';
import { HeaderCell } from '../header_cell';
import { SortedTableModel } from '../sorted_table_model';
import { SortOrder } from '../sort_order';
import { TableView } from '../table_view';

interface State {
  headerCells: HeaderCell[];
  highestPriorityHeader: number;
}

/** Demo that displays the TableView. */
export class TableViewDemo extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      headerCells: this.generateHeaderCells(),
      highestPriorityHeader: -1
    }
    this.sourceModel = new ArrayTableModel();
    this.sourceModel.insert([0, 0, 0, 0], 0);
    this.sortedModel = new SortedTableModel(this.sourceModel);
  }
  public render(): JSX.Element {
    return <TableView model={this.sortedModel}
      style={TableViewDemo.someStyle}
      headerCells={this.state.headerCells} 
      highestPriorityHeader={this.state.highestPriorityHeader}
      height={700}/>;
  }

  public componentDidMount(): void {
    for(let row = 0; row < 1000; ++row) {
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
      this.sourceModel.push(r);
    }
    setInterval(() => this.changeValues(), 2000);
  }

  private changeValues = () => {
    const diceRoll = Math.floor(Math.random() * 4);
    const testRow = Math.floor(Math.random() * (this.sourceModel.rowCount - 5));
    if(this.sourceModel.rowCount > 500 && diceRoll === 0) {
    } else if(diceRoll === 1) {
      const num = Math.floor(Math.random() * 90) + 100.5;
      this.sourceModel.insert([this.sourceModel.rowCount + 0.5, num, num, num], 0);
    } else {
      const testValue = Math.floor(Math.random() * this.sourceModel.rowCount) + 0.5;
      const testColumn = Math.floor(Math.random() * 4);
      this.sourceModel.set(testRow, testColumn, testValue);
    }
  }

  private onSort = (column: number, sortOrder: SortOrder) => {
    this.sortedModel.updateSort(column, sortOrder);
    this.setState({
      headerCells: this.state.headerCells,
      highestPriorityHeader: column
    });
    this.sourceModel.remove(326);
    this.sourceModel.insert([999.5, 125.5, 125.5, 125.5], 0);
  }

  private generateHeaderCells = () => {
    return [
      new HeaderCell('Distance', 'Dist.', SortOrder.NONE,
        (sortOrder: SortOrder) => {this.onSort(0, sortOrder)}),
      new HeaderCell('Unsortable', 'No Sort.', SortOrder.UNSORTABLE,
        (sortOrder: SortOrder) => {this.onSort(1, sortOrder)}),
      new HeaderCell('Volume', 'Vol.', SortOrder.NONE,
        (sortOrder: SortOrder) => {this.onSort(2, sortOrder)}),
      new HeaderCell('Length', 'Len.', SortOrder.NONE,
        (sortOrder: SortOrder) => {this.onSort(3, sortOrder)})
    ];
  }

  private static someStyle = {
    table: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '12px',
      borderCollapse: 'collapse',
      border: '5px solid #000000'
    },
    td: {
      border: '2px solid #000000',
      paddingLeft: '10px',
      paddingRight: '30px',
      textAlign: 'left',
      boxSizing: 'border-box',
      width: '150px',
      color: '#4b23a0'
    }
  };
  private sourceModel: ArrayTableModel;
  private sortedModel: SortedTableModel;
  private interval: NodeJS.Timer;
}
