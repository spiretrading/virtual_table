import * as React from 'react';
import { SortOrder } from '../sort_order';
import { FilterIconButton } from './filter_icon_button';
import { SortIcon } from './sort_icon';

interface Properties {

  /** The full name of the header cell */
  name: string;

  /** The condensed name to used. */
  shortName: string;

  /** The sort order of the column. */
  sortOrder: SortOrder;

  /** Indicates if the sort button should be shown. */
  isSortable: boolean;

  /** Indicates if the filter icon should be shown. */
  isFilterable: boolean;

  /** Indicates if the column is filtered */
  hasFilter: boolean;

  /** Callback to sort the column. */
  onSort?: () => void;
}

interface State {
  isHovered: boolean;
  isCondensed: boolean;
}

/** Component that displays a HeaderCell. */
export class HeaderCellView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);
    this.state = {
      isHovered: false,
      isCondensed: false
    };
    this.widthRef = React.createRef<HTMLDivElement>();
    this.lastWidth = 0;
  }

  render(): JSX.Element {
    return (
      <div style={HeaderCellView.STYLE.container}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onClick={this.onSortClick}>
        <div style={HeaderCellView.STYLE.padding4}/>
        <div style={this.state.isCondensed ?
            HeaderCellView.STYLE.textSpaceMinimal:
            HeaderCellView.STYLE.textSpace }>
          <div ref={this.widthRef}
            style={this.state.isHovered ? HeaderCellView.STYLE.textHovered :
              HeaderCellView.STYLE.text}>
            {this.state.isCondensed ? this.props.shortName : this.props.name}
          </div>
          <div style={this.state.isHovered ?
            HeaderCellView.STYLE.hoveredTextFooter :
            HeaderCellView.STYLE.textFooter}/>
        </div>
        <div style={HeaderCellView.STYLE.padding4}/>
        {!this.props.isSortable && !this.props.isFilterable &&
          <div style={HeaderCellView.STYLE.padding4}/>}
        {this.props.isSortable && 
          <>
            <div style={HeaderCellView.STYLE.padding4}/>
            <SortIcon sortOrder={this.props.sortOrder}/>
          </>}
        {this.props.isFilterable &&
          <> 
            <div style={HeaderCellView.STYLE.padding4}/>
            <FilterIconButton
              hasFilter={this.props.hasFilter}
              onMouseEnter={this.onFilterMouseEnter}
              onMouseLeave={this.onFilterMouseLeave}/>
          </>}
        <div style={HeaderCellView.STYLE.resizeLine}/>
      </div>);
  }

  componentDidUpdate(): void {
    if(!this.state.isCondensed &&
        this.widthRef.current.clientWidth < this.widthRef.current.scrollWidth) {
      this.lastWidth = this.widthRef.current.scrollWidth;
      this.setState({isCondensed: true});
    }
    if(this.state.isCondensed &&
        this.lastWidth === this.widthRef.current.clientWidth ) {
      this.setState({isCondensed: false});
    }
  }

  private onMouseEnter = () => {
    if(this.props.isSortable) {
      this.setState({isHovered: true});
    }
  }

  private onMouseLeave = () => {
    if(this.props.isSortable) {
      this.setState({isHovered: false});
    }
  }

  private onFilterMouseEnter = () => {
    if(!this.props.isSortable) {
      this.setState({isHovered: true});
    }
  }

  private onFilterMouseLeave = () => {
    if(!this.props.isSortable) {
      this.setState({isHovered: false});
    }
  }

  private onSortClick = () => {
    this.props.onSort();
  }

  private static readonly STYLE = {
    container: {
      fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
      fontWeight: '500',
      height: '30px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    } as React.CSSProperties,
    padding4: {
      flexGrow: 0,
      flexShrink: 0,
      width: '4px'
    } as React.CSSProperties,
    textSpace: {
      userSelect: 'none',
      paddingTop: '9px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      flexGrow: 1,
      flexShrink: 1
    } as React.CSSProperties,
    textSpaceMinimal: {
      userSelect: 'none',
      paddingTop: '9px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      flexGrow: 1,
      flexShrink: 0
    } as React.CSSProperties,
    text: {
      userSelect: 'none',
      fontSize: '12px',
      lineHeight: '14px',
      color: '#808080',
      flexGrow: 0,
      flexShrink: 0,
      overflow: 'hidden',
    } as React.CSSProperties,
    textHovered: {
      fontSize: '12px',
      lineHeight: '14px',
      color: '#4B23A0',
      flexGrow: 0,
      flexShrink: 0,
      overflow: 'hidden'
    } as React.CSSProperties,
    resizeLine: {
      width: '4px',
      height: '14px',
      flexGrow: 0,
      flexShrink: 0,
      borderRight: '1px solid #C8C8C8'
    } as React.CSSProperties,
    textFooter: {
      height: '8px',
      width: '18px',
    } as React.CSSProperties,
    hoveredTextFooter: {
      height: '6px',
      width: '18px',
      borderBottom: '2px solid #4B23A0'
    } as React.CSSProperties,
    hoveredLine: {
      border: '1px solid #C8C8C8'
    }
  };
  lastWidth: number;
  widthRef: React.RefObject<HTMLDivElement>;
}
