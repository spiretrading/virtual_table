import * as React from 'react';
import { AddRowOperation, MoveRowOperation, Operation,
  RemoveRowOperation, UpdateOperation } from './operations';
import { TableModel } from './table_model';

interface Properties {
  /** Specifies the horizontal position of the floating column. */
  leftPosition: number;

  /** Specifies the horizontal position of the floating column. */
  topPosition: number;

  /** Specifies if the column should be shown. */
  show: boolean;

  /** The current width of the column. */
  width: number;

  /** The index of the floating column. */
  columnIndex: number;

  /** How many rows of the column should be shown. */
  rowsToShow: number;

  /** The model to display. */
  tableModel: TableModel;

  /** The label for the columns of the table. */
  labels?: string[];


  /** Specifies the CSS class. */
  className?: string;

  /** The CSS style to apply. */
  style?: any;

  /** Callback to tell the table to update the moving column's width. */
  updateWidth: (width: number) => void;
}

/** Renders a single column of a table. */
export class FloatingColumn extends React.Component<Properties> {
  constructor(props: Properties) {
    super(props);
    this.props.tableModel.connect(this.tableUpdated.bind(this));
    this.widthRef = React.createRef<HTMLTableCellElement>();
  }

  public render(): JSX.Element {
    if(!this.props.show) {
      return <div style={{display: 'none'}}/>;
    }
    const cells = [];
    for(let i = 0; i <= this.props.rowsToShow; ++i) {
      cells.push(
        <tr style={this.props.style.tr} key={i}>
          <td style={this.props.style.td}>
            {this.props.tableModel.get(i, this.props.columnIndex)}
          </td>
        </tr>);
    }
    return (
      <div style={{
          boxSizing: 'border-box',
          left: this.props.leftPosition,
          top: this.props.topPosition,
          position:'absolute'}}>
        <table style={{
            ...this.props.style.table,
            ...{opacity: 0.8,
              backgroundColor: 'white',
              border: 'none'}}}>
          <thead>{
            this.props.labels && 
            <tr style={this.props.style.tr}>
              <th style={this.props.style.th} ref={this.widthRef}>
                {this.props.labels[this.props.columnIndex]}
              </th>
            </tr>}
          </thead>
          <tbody>
            {cells}
          </tbody>
        </table>
      </div>);
  }

  public componentDidUpdate(): void {
    const shouldWidthUpdate = this.props.width !==
      this.widthRef.current?.getBoundingClientRect().width;
    if(this.props.show && shouldWidthUpdate) {
      const newWidth = this.widthRef.current?.getBoundingClientRect().width;
      this.props.updateWidth(newWidth);
    }
  }

  private tableUpdated = (operation: Operation) => {
    const start = 0;
    const end = this.props.rowsToShow;
    if(operation instanceof AddRowOperation ||
        operation instanceof RemoveRowOperation) {
      this.forceUpdate();
      return;
    } else if(operation instanceof UpdateOperation) {
      if(start <= operation.row && operation.row <= end) {
        this.forceUpdate();
        return;
      }
    } else if(operation instanceof MoveRowOperation) {
      if(!(operation.source < start && operation.destination < start) &&
          !(end < operation.source && end < operation.destination)) {
        this.forceUpdate();
        return;
      }
    }
  }

  private widthRef: React.RefObject<HTMLTableCellElement>
}
