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
  headerOrder: number[];
  isMoving: boolean;
  movingColumnIndex: number;
  movingColumnWidth: number;
  colTop: number;
  colLeft: number;
  mouseXStart: number;
  mouseYStart: number;
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
      headerOrder: [1, 2, 3, 0],
      movingColumnIndex: -1,
      movingColumnWidth: 0,
      colLeft: 0,
      colTop: 0,
      mouseXStart: 0,
      mouseYStart: 0
    };
    this.props.model.connect(this.tableUpdated.bind(this));
    this.firstRowRef = React.createRef<HTMLTableRowElement>();
    this.wrapperRef = React.createRef<HTMLDivElement>();
    this.labelRefs = [];
    this.columnRefs = [];
    this.columnWidths = [];
    for(let i = 0; i< this.props.labels.length; ++i) {
      this.labelRefs.push(React.createRef<HTMLTableCellElement>());
      this.columnRefs.push(React.createRef<HTMLTableCellElement>());
      this.columnWidths[i] = 0;
    }
  }

  public render(): JSX.Element {
    const header = [];
    for(let i = 0; i < this.props.labels.length; ++i) {
      const index = this.state.headerOrder[i];
      if(this.state.isMoving && this.state.movingColumnIndex === i) {
        header.push(<th key='filler'
              ref={this.labelRefs[i]}
              style={{...this.props.style.th,
                ...{opacity: 0, border: 'none', width: this.state.movingColumnWidth}}}
              className={this.props.className}/>);
      } else {
        header.push(
          <th style={this.props.style.th}
              className={this.props.className}
              key={this.props.labels[index]}
              ref={this.labelRefs[i]}
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
        if(this.state.isMoving && this.state.movingColumnIndex === j) {
          row.push(
            <td style={{...this.props.style.td,
                  ...{opacity: 0, border: 'none'}}}
                className={this.props.className}
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
        <MovingColumn show={this.state.isMoving}
          topPosition={this.state.colTop}
          leftPosition={this.state.colLeft}
          height={this.props.height}
          width={this.state.movingColumnWidth}
          columnIndex={this.state.headerOrder[this.state.movingColumnIndex]}
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
    for(let i = 0; i < this.labelRefs.length; ++i) {
      const widthChanged = this.columnWidths[i] !==
        this.labelRefs[i].current?.getBoundingClientRect().width;
      if(widthChanged && this.labelRefs[i].current) {
        hasChanged = true;
      }
      if(i === this.state.movingColumnIndex) {
        widths[i] = this.columnWidths[i];
      } else {
        widths[i] = this.labelRefs[i].current.getBoundingClientRect().width;
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
    this.checkAndUpdateColumnWidths();
    let initialLeft = 0;
    for(let i = 0; i < index; ++i) {
      initialLeft += this.columnWidths[i];
    }
    this.originalColumn = index;
    this.setState({
      isMoving: true,
      movingColumnIndex: index,
      colLeft: initialLeft,
      mouseXStart: event.clientX,
      mouseYStart: event.clientY,
      movingColumnWidth: this.columnWidths[index]
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
    const newLeft = originalLeft + event.clientX - this.state.mouseXStart;
    this.checkForThresholdCross(newLeft);
    const newTop = Math.min(
      Math.max(0, event.clientY - this.state.mouseYStart),
      this.state.rowHeight);
    this.setState({
      colLeft: newLeft,
      colTop: newTop
    });
  }

  private checkForThresholdCross = (newLeft: number) => {
    const oldLeft = this.state.colLeft;
    const delta = newLeft - oldLeft;
    let dest = -1;
    if(delta < 0) { //move left
      let lower = 0;
      for(let i = 0; i < this.props.model.columnCount; ++i) {
        let upper = lower + (this.columnWidths[i] / 2);
        if(newLeft <= upper) {
          dest = i;
          break;
        }
        lower = lower + (this.columnWidths[i]);
      }
    } else if(delta > 0) {
      const newRight = newLeft + this.columnWidths[this.state.movingColumnIndex];
      let lower = 0;
      for(let i = 0; i < this.props.model.columnCount; ++i) {
        let bar = lower + (this.columnWidths[i] / 2);
        if(bar <= newRight && newRight <= lower + this.columnWidths[i] ) {
          dest = i;
          break;
        }
        lower = lower + (this.columnWidths[i]);
      }
    }
    if(dest >= 0 && this.state.movingColumnIndex != dest) {
      this.swapColumns(this.state.movingColumnIndex, dest)
    }
  }

  private swapColumns = (source: number, dest: number) => {
    if(dest >= this.state.headerOrder.length || dest < 0) {
      return;
    }
    const sourceValue = this.state.headerOrder[source];
    const destValue = this.state.headerOrder[dest];
    this.state.headerOrder[source] = destValue;
    this.state.headerOrder[dest] = sourceValue;
    this.setState({headerOrder: this.state.headerOrder,
      movingColumnIndex: dest});
    this.checkAndUpdateColumnWidths();
    //this.startAnimation(dest, source);
  }

  private onMouseUp = () => {
    if(this.state.isMoving) {
      this.setState({isMoving: false});
    }
  }

  private startAnimation = (dest: number, source: number) => {
    const width = this.columnWidths[this.state.movingColumnIndex];
    const growFrames = this.getGrowKeyFrames(width);
    this.labelRefs[dest].current?.animate(growFrames, this.widthTiming);
    this.columnRefs[dest].current?.animate(growFrames, this.widthTiming);
    const headerElement = document.createElement('th');
    headerElement.style
    const rowElement = document.createElement('td');
    rowElement.rowSpan = 0;
    if(source < dest) {
      const shrinkKeyframes = this.getShrinkKeyFrames(width);
      const currentHeader = this.labelRefs[source].current.insertAdjacentElement('beforebegin', headerElement);
      const shrinkAnimation1 = currentHeader.animate(shrinkKeyframes, this.widthTiming)
      const current = this.columnRefs[source].current.insertAdjacentElement('beforebegin', rowElement);
      const shrinkAnimation2 = current.animate(shrinkKeyframes, this.widthTiming);
      shrinkAnimation1.onfinish = () => this.onAnimationFinish(headerElement);
      shrinkAnimation2.onfinish = () => this.onAnimationFinish(rowElement);
    } else if(dest > source ) {
    
    }
  }

  onAnimationFinish(element: Element) {
    element.parentNode.removeChild(element);
  }

  private getGrowKeyFrames = (width: number) => {
    return[
      { width: '0px'},
      { width: width + 'px'}
    ] as Keyframe[];
  }

  private getShrinkKeyFrames = (width: number) => {
    return[
      {width: width + 'px', padding: 0},
      {width: '0px', padding: 0}
    ] as Keyframe[];
  }

  // private updateMovingColumnWidth = (width: number) => {
  //   if(this.columnWidths[this.state.movingColumnIndex] !== width) {
  //     this.columnWidths[this.state.movingColumnIndex] = width;
  //     this.setState({movingColumnIndex: width});
  //   }
  // }

  private widthTiming = {
    duration: 500,
    iterations: 1,
    fill: 'forwards'
  } as KeyframeAnimationOptions;

  private firstRowRef: React.RefObject<HTMLTableRowElement>;
  private wrapperRef: React.RefObject<HTMLDivElement>;
  private labelRefs: React.RefObject<HTMLTableCellElement>[];
  private columnRefs: React.RefObject<HTMLTableCellElement>[];
  private columnWidths: number[];
  private originalColumn: number;
}

interface MovingColProperties {
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

class MovingColumn extends React.Component<MovingColProperties> {
  constructor(props: MovingColProperties) {
    super(props);
    this.props.tableModel.connect(this.tableUpdated.bind(this));
  }

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
          boxSizing: 'border-box',
          left: this.props.leftPosition,
          top: this.props.topPosition,
          position:'absolute',
          border: '3px solid blue',
          height: this.props.height}}>
        <table style={{
            ...this.props.style.table,
            ...{opacity: 0.8,
              backgroundColor: 'white',
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
}
