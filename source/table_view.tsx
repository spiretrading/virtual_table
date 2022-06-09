import * as React from 'react';
import {Filter} from './filter';
import {HeaderCell} from './header_cell';
import {HeaderCellView} from './header_cell_view';
import {AddRowOperation, MoveRowOperation, Operation,
  RemoveRowOperation, Transaction, UpdateOperation} from './operations';
import {SortOrder} from './sort_order';
import {TableModel} from './table_model';

interface Properties {

  /** The model to display. */
  model: TableModel;

  /** The headers for each column. */
  headerCells: HeaderCell[];

  /** The index of the header with the highest sort priority. */
  highestPriorityHeader: number;

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
}

/** Renders a TableModel to HTML. */
export class TableView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);
    this.state = {
      rowHeight: 1,
      rowsToShow: 1,
      topRow: 0
    };
    this.props.model.connect(this.tableUpdated.bind(this));
    this.firstRowRef = React.createRef<HTMLTableRowElement>();
    this.wrapperRef = React.createRef<HTMLDivElement>();
  }

  public render(): JSX.Element {
    console.log(this.state.topRow, this.props.model.rowCount);
    const header = [];
    for(let i = 0; i < this.props.headerCells.length; ++i) {
      header.push(
        <th key={'header' + i}>
          <HeaderCellView
            name={this.props.headerCells[i].name}
            shortName={this.props.headerCells[i].shortName}
            sortOrder={this.getSortOrderIconType(i)}
            filter={Filter.UNFILTERABLE}
            onSort={() => this.props.headerCells[i].sort()}/>
        </th>);
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
        row.push(
          <td style={this.props.style.td}
              className={this.props.className}
              key={(i * this.props.model.columnCount) + j}>
            {this.props.model.get(i, j)}
          </td>);
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
      <div style={{height: `${this.props.height}px`, overflow: 'auto'}}
          ref={this.wrapperRef}>
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
    this.forceUpdate();
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
  }

  private getSortOrderIconType = (index: number) => {
    if(this.props.highestPriorityHeader === index) {
      return this.props.headerCells[index].sortOrder;
    } else if(this.props.headerCells[index].sortOrder ===
        SortOrder.UNSORTABLE) {
      return SortOrder.UNSORTABLE;
    } else {
      return SortOrder.NONE;
    }
  }

  private tableUpdated = (operation: Operation) => {
    if(operation instanceof Transaction) {
      operation.operations.forEach(this.checkSignal);
    } else {
      this.checkSignal(operation);
    }
  }

  private checkSignal = (operation: Operation) => {
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

  private onScrollHandler = () => { 
    const adjustedScrollTop = this.wrapperRef.current.scrollTop -
      TableView.HEADER_HEIGHT;
    const adjustedScrollHeight = this.wrapperRef.current.scrollHeight -
      TableView.HEADER_HEIGHT
    const truePercent = (adjustedScrollTop) / (adjustedScrollHeight);
    let topRow = Math.max(0, Math.ceil(truePercent * this.props.model.rowCount));
    this.setState({topRow: topRow});
  }

  private firstRowRef: React.RefObject<HTMLTableRowElement>;
  private wrapperRef: React.RefObject<HTMLDivElement>;
  private static readonly HEADER_HEIGHT = 35;
}
