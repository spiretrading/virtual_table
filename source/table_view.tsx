import * as React from 'react';
import { AddRowOperation, MoveRowOperation, Operation,
  RemoveRowOperation, UpdateOperation } from './operations';
import { TableModel } from './table_model';
import {FloatingColumn} from './floating_column';

interface Properties {

  /** The model to display. */
  model: TableModel;

  /** The labels for the columns of the table. */
  labels?: string[];

  /** Specifies the CSS class. */
  className?: string;

  /** The CSS style to apply. */
  style?: any;

  /** The height in pixels. */
  height: number;
}

interface State {
  rowHeight: number;
  rowsToShow: number;
  topRow: number;
  headerOrder: number[];
  isMoving: boolean;
  floatingColumnIndex: number;
  floatingColumnWidth: number;
  floatingColumnTop: number;
  floatingColumnLeft: number;
}

/** Renders a TableModel to HTML. */
export class TableView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);
    const headerOrder = [];
    for(let i = 0; i< this.props.labels.length; ++i) {
      headerOrder.push(i);
    }
    this.state = {
      rowHeight: 1,
      rowsToShow: 1,
      topRow: 0,
      isMoving: false,
      headerOrder: headerOrder,
      floatingColumnIndex: -1,
      floatingColumnWidth: 0,
      floatingColumnLeft: 0,
      floatingColumnTop: 0
    };
    this.props.model.connect(this.tableUpdated.bind(this));
    this.firstRowRef = React.createRef<HTMLTableRowElement>();
    this.wrapperRef = React.createRef<HTMLDivElement>();
    this.columnRefs = [];
    this.columnWidths = [];
    for(let i = 0; i< this.props.labels.length; ++i) {
      this.columnRefs.push(React.createRef<HTMLTableCellElement>());
      this.columnWidths[i] = 0;
    }
  }

  public render(): JSX.Element {
    const header = [];
    for(let i = 0; i < this.props.labels.length; ++i) {
      const index = this.state.headerOrder[i];
      if(this.state.isMoving && this.state.floatingColumnIndex === i) {
        header.push(
          <th style={{boxSizing: 'border-box',
              width: this.state.floatingColumnWidth}}
            key={this.props.labels[index]}/>);
      } else {
        header.push(
          <th style={this.props.style.th}
              className={this.props.className}
              key={this.props.labels[index]}
              onMouseDown={(event) => this.onLabelMouseDown(event, i)}>
            {this.props.labels[index]}
          </th>);
      }
    }
    const startRow = Math.max(0, this.state.topRow - 1);
    const endRow = Math.min(this.props.model.rowCount,
      Math.abs(this.props.model.rowCount - 1),
      this.state.topRow + this.state.rowsToShow);
    const tableRows = [];
    if(startRow > 0) {
      tableRows.push(
        <tr style ={{height: `${(startRow) * this.state.rowHeight}px`}}
          className={this.props.className}
          key={'topFiller'}/>);
      }
    for(let i = startRow; i <= endRow; ++i) {
      const row = [];
      for(let j = 0; j < this.props.model.columnCount; ++j) {
        const index = this.state.headerOrder[j];
        if(this.state.isMoving && this.state.floatingColumnIndex === j) {
          row.push(
            <td style={{boxSizing: 'border-box',
                width: this.state.floatingColumnWidth}}
              ref={i === startRow && this.columnRefs[j]}
              key={(i * this.props.model.columnCount) + j}/>);
        } else {
          row.push(
            <td style={{...this.props.style.td}}
                className={this.props.className}
                ref={i === startRow && this.columnRefs[j]}
                key={(i * this.props.model.columnCount) + j}>
              {this.props.model.get(i, index)}
            </td>);
        }
      }
      if(i === 0) {
        tableRows.push(
          <tr style={this.props.style.tr}
              ref={this.firstRowRef}
              className={this.props.className}
              key={i}>
            {row}
          </tr>);
      } else {
        tableRows.push(
          <tr style={this.props.style.tr}
              className={this.props.className}
              key={i}>
            {row}
          </tr>);
      }
    }
    if(endRow < this.props.model.rowCount - 1) {
      tableRows.push(
        <tr style = {{height: `${(this.props.model.rowCount - endRow - 1) *
            this.state.rowHeight}px`}}
          className={this.props.className}
          key={'bottomFiller'}/>);
    }
    return(
      <div style={{height: `${this.props.height}px`,
            overflow: 'auto', position: 'relative'}}
          ref={this.wrapperRef}>
        <FloatingColumn show={this.state.isMoving}
          topPosition={this.state.floatingColumnTop}
          leftPosition={this.state.floatingColumnLeft}
          width={this.state.floatingColumnWidth}
          columnIndex={this.state.headerOrder[this.state.floatingColumnIndex]}
          style={this.props.style}
          labels={this.props.labels}
          rowsToShow={this.state.topRow + this.state.rowsToShow}
          tableModel={this.props.model}
          updateWidth={this.updateMovingColumnWidth}/>
        <table style={{...this.props.style.table}}
            className={this.props.className}>
          <thead style={this.props.style.thead}
              className={this.props.className}>
            <tr style={this.props.style.tr}
                className={this.props.className}>
              {header}
            </tr>
          </thead>
          <tbody style={this.props.style.tbody}
              className={this.props.className}>
            {tableRows}
          </tbody>
        </table>
      </div>);
  }

  public componentDidMount(): void {
    this.wrapperRef.current.addEventListener('scroll', this.onScrollHandler);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
    this.forceUpdate();
    this.checkAndUpdateColumnWidths();
  }

  public componentDidUpdate(): void {
    if(this.firstRowRef.current !== null) {
      if(this.firstRowRef.current.offsetHeight !== this.state.rowHeight) {
        this.setState({rowHeight: this.firstRowRef.current.offsetHeight});
      }
      if(this.state.rowsToShow !==
          Math.ceil(this.props.height / this.state.rowHeight)) {
        this.setState({
          rowsToShow: Math.ceil(this.props.height / this.state.rowHeight)
        });
      }
    }
  }

  public componentWillUnmount(): void {
    this.wrapperRef.current.removeEventListener('scroll', this.onScrollHandler);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  private tableUpdated = (operation: Operation) => {
    const start = Math.max(0, this.state.topRow - 1);
    const end = Math.min(this.props.model.rowCount,
      Math.abs(this.props.model.rowCount - 1),
      this.state.topRow + this.state.rowsToShow);
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

  private checkAndUpdateColumnWidths = () => {
    const widths = [];
    let hasChanged = false;
    for(let i = 0; i < this.columnRefs.length; ++i) {
      const widthChanged = this.columnWidths[i] !==
        this.columnRefs[i].current?.getBoundingClientRect().width;
      if(widthChanged && this.columnRefs[i].current) {
        hasChanged = true;
      }
      if(i === this.state.floatingColumnIndex) {
        widths[i] = this.columnWidths[i];
      } else {
        widths[i] = this.columnRefs[i].current.getBoundingClientRect().width;
      }
    }
    console.log(widths)
    if(hasChanged) {
      this.columnWidths = widths;
    }
  }

  private onScrollHandler = () => {
    const percent =
      this.wrapperRef.current.scrollTop / this.wrapperRef.current.scrollHeight;
    this.setState({topRow: Math.floor(percent * this.props.model.rowCount)});
  }

  private onLabelMouseDown = (event: React.MouseEvent, index: number) => {
    this.checkAndUpdateColumnWidths();
    let initialLeft = 0;
    for(let i = 0; i < index; ++i) {
      initialLeft += this.columnWidths[i];
    }
    this.originalColumn = index;
    this.mouseXStart = event.clientX,
    this.mouseYStart = event.clientY,
    this.setState({
      isMoving: true,
      floatingColumnIndex: index,
      floatingColumnLeft: initialLeft,
      floatingColumnWidth: this.columnWidths[index]
    });
  }

  private onMouseMove = (event: MouseEvent) => {
    if(!this.state.isMoving) {
      return;
    }
    let originalLeft = 0;
    for(let i = 0; i < this.originalColumn; ++i) {
      originalLeft += this.columnWidths[i];
    }
    const newLeft = originalLeft + event.clientX - this.mouseXStart;
    this.checkForThresholdCross(newLeft);
    const newTop = Math.min(
      Math.max(0, event.clientY - this.mouseYStart),
      this.state.rowHeight);
    this.setState({
      floatingColumnLeft: newLeft,
      floatingColumnTop: newTop
    });
  }

  private checkForThresholdCross = (newLeft: number) => {
    const oldLeft = this.state.floatingColumnLeft;
    const delta = newLeft - oldLeft;
    let dest = -1;
    if(delta < 0) {
      let lower = 0;
      for(let i = 0; i < this.props.model.columnCount; ++i) {
        let upper = lower + (this.columnWidths[i] / 2);
        if(newLeft < upper) {
          dest = i;
          break;
        }
        lower = lower + (this.columnWidths[i]);
      }
    } else if(delta > 0) {
      const newRight = newLeft +
        this.columnWidths[this.state.floatingColumnIndex];
      let lower = 0;
      for(let i = 0; i < this.props.model.columnCount; ++i) {
        let threshold = lower + (this.columnWidths[i] / 2);
        if(threshold < newRight && newRight < lower + this.columnWidths[i] ) {
          dest = i;
          break;
        }
        lower = lower + (this.columnWidths[i]);
      }
    }
    if(dest >= 0 && this.state.floatingColumnIndex != dest) {
      this.swapColumns(this.state.floatingColumnIndex, dest)
    }
  }

  private swapColumns = (source: number, dest: number) => {
    if(dest >= this.state.headerOrder.length || dest < 0) {
      return;
    }
    const sourceValue = this.state.headerOrder[source];
    this.state.headerOrder.splice(source, 1);
    this.state.headerOrder.splice(dest, 0, sourceValue);
    this.setState({
      headerOrder: this.state.headerOrder,
      floatingColumnIndex: dest
    });
    this.checkAndUpdateColumnWidths();
  }

  private onMouseUp = () => {
    if(this.state.isMoving) {
      this.setState({isMoving: false, floatingColumnIndex: -1});
    }
  }

  private updateMovingColumnWidth = (width: number) => {
    if(this.columnWidths[this.state.floatingColumnIndex] !== width) {
      this.columnWidths[this.state.floatingColumnIndex] = width;
      this.setState({floatingColumnWidth: width});
    }
  }

  private firstRowRef: React.RefObject<HTMLTableRowElement>;
  private wrapperRef: React.RefObject<HTMLDivElement>;
  private columnRefs: React.RefObject<HTMLTableCellElement>[];
  private columnWidths: number[];
  private mouseXStart: number;
  private mouseYStart: number;
  private originalColumn: number;
}
