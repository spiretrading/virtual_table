import * as React from 'react';
import { AddRowOperation, MoveRowOperation, Operation,
  RemoveRowOperation, UpdateOperation } from './operations';
import { TableModel } from './table_model';

interface Properties {

  /** The model to display. */
  model: TableModel;

  /** The label for the columns of the table. */
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
  //states for column resize
  isMoving: boolean;
  movingColumnIndex: number;
  colTop: number;
  colLeft: number;
  mouseXStart: number;
  mouseYStart: number;
}

/** Renders a TableModel to HTML. */
export class TableView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);
    this.state = {
      rowHeight: 1,
      rowsToShow: 1,
      topRow: 0,
      isMoving: false,
      movingColumnIndex: 0,
      colLeft: 0,
      colTop: 0,
      mouseXStart: 0,
      mouseYStart: 0
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
      if(this.state.isMoving && this.state.movingColumnIndex === i) {
        header.push(<th key='filler'
              style={{...this.props.style.th,
                ...{opacity: 0, border: 'none'}}}
              className={this.props.className}>{this.props.labels[i]}</th>);
      } else {
        header.push(
          <th style={this.props.style.th}
              className={this.props.className}
              key={this.props.labels[i]}
              ref={this.columnRefs[i]}
              onMouseDown={(event) => this.onLabelMouseDown(event, i)}>
            {this.props.labels[i]}
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
        if(this.state.isMoving && this.state.movingColumnIndex === j) {
          row.push(
            <td style={{...this.props.style.td,
                  ...{opacity: 0, border: 'none'}}}
                className={this.props.className}
                key={(i * this.props.model.columnCount) + j}>
              {this.props.model.get(i, j)}
            </td>);
        } else {
          row.push(
            <td style={{...this.props.style.td}}
                className={this.props.className}
                key={(i * this.props.model.columnCount) + j}>
              {this.props.model.get(i, j)}
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
        <MovingColumn show={this.state.isMoving}
          topPosition={this.state.colTop}
          leftPosition={this.state.colLeft}
          height={this.props.height}
          width={this.columnWidths[this.state.movingColumnIndex]}
          columnIndex={this.state.movingColumnIndex}
          style={this.props.style}
          label={this.props.labels}
          rowsToShow={this.state.rowsToShow}
          tableModel={this.props.model}/>
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
    this.checkColumnWidths();
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

  private checkColumnWidths = () => {
    const widths = [];
    let hasChanged = false;
    for(let i = 0; i < this.columnRefs.length; ++i) {
      const widthChanged = this.columnWidths[i] !==
        this.columnRefs[i].current.getBoundingClientRect().width;
      if(widthChanged) {
        widths[i] = this.columnRefs[i].current.getBoundingClientRect().width;
        hasChanged = true;
      }
    }
    if(hasChanged) {
      this.columnWidths = widths;
    }
  }

  private onScrollHandler = () => {
    if(this.state.isMoving) {
      throw new Error('No scroll allowed.');
    }
    const percent =
      this.wrapperRef.current.scrollTop / this.wrapperRef.current.scrollHeight;
    this.setState({topRow: Math.floor(percent * this.props.model.rowCount)});
  }

  private onLabelMouseDown = (event: React.MouseEvent, index: number) => {
    let initialLeft = 0;
    for(let i = 0; i < index; ++i) {
      initialLeft += this.columnWidths[i];
    }
    this.setState({
      isMoving: true,
      movingColumnIndex: index,
      colLeft: initialLeft,
      mouseXStart: event.clientX,
      mouseYStart: event.clientY
    });
  }

  private onMouseMove = (event: MouseEvent) => {
    if(!this.state.isMoving) {
      return;
    }
    let initialLeft = 0;
    for(let i = 0; i < this.state.movingColumnIndex; ++i) {
      initialLeft += this.columnWidths[i];
    }
    const newLeft = initialLeft + event.clientX - this.state.mouseXStart;
    const newTop = Math.min(
      Math.max(0, event.clientY - this.state.mouseYStart),
      this.state.rowHeight);
    this.setState({
      colLeft: newLeft,
      colTop: newTop
    });
  }

  private onMouseUp = () => {
    if(this.state.isMoving) {
      this.setState({isMoving: false});
    }
  }

  private firstRowRef: React.RefObject<HTMLTableRowElement>;
  private wrapperRef: React.RefObject<HTMLDivElement>;
  private columnRefs: React.RefObject<HTMLTableCellElement>[];
  private columnWidths: number[];
}

interface SlidingColProperties {
  leftPosition: number;
  topPosition: number;
  show: boolean;
  height: number;
  width: number;
  columnIndex: number;
  label: string[];
  rowsToShow: number;
  tableModel: TableModel;
  className?: string;
  style?: any;
}

class MovingColumn extends React.Component<SlidingColProperties> {
  public render(): JSX.Element {
    if(!this.props.show) {
      return <div style={{display: 'none'}}/>
    }
    const cells = [];
    for(let i = 0; i < this.props.rowsToShow; ++i) {
      cells.push(
        <tr style={this.props.style.tr} key={i}>
          <td style={this.props.style.td}>
            {this.props.tableModel.get(i, this.props.columnIndex)}
          </td>
        </tr>);
    }
    return (
      <div style={{
          left: this.props.leftPosition,
          top: this.props.topPosition,
          position:'absolute',
          border: '3px solid blue',
          height: this.props.height}}>
        <table style={{
            ...this.props.style.table,
            ...{opacity: 0.8,
              backgroundColor: 'white',
              width: this.props.width,
              border: 'none'}}}>
          <thead>
            <tr style={this.props.style.tr}>
              <th style={this.props.style.th}>
                {this.props.label[this.props.columnIndex]}
              </th>
            </tr>
          </thead>
          <tbody>
            {cells}
          </tbody>
        </table>
      </div>);
  }
}
