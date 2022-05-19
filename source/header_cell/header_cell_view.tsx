import * as React from 'react';
import {Sorting} from '../sorting';
import {FilterIconButton} from './filter_icon_button';
import {SortIcon} from './sort_icon';

interface Properties {

  /** The full name of the header cell */
  name: string;

  /** The condensed name to used. */
  shortName: string;

  /** The sort order of the column. */
  sortOrder: Sorting;

  /** Indicates if the sort button should be shown. */
  isSortable: boolean;

  /** Indicates if the sort button should be shown. */
  isFilterable: boolean;

  /** Callback to sort the column. */
  sort?: (order: Sorting) => void;
}

interface State {
  isHovered: boolean;
}

/** Component that displays a HeaderCell. */
export class HeaderCellView extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);
    this.state = {
      isHovered: false
    }
  }

  render(): JSX.Element {
    return (
      <div style={HeaderCellView.STYLE.container}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onClick={this.onSortClick}>
        <div style={HeaderCellView.STYLE.textSpace}>
          <div 
            style={this.state.isHovered ? HeaderCellView.STYLE.textHovered :
              HeaderCellView.STYLE.text}>
            {this.props.name}
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
            <FilterIconButton isFiltered={this.props.isFilterable}/>
          </>}
        <div style={HeaderCellView.STYLE.resizeLine}/>
      </div>);
  }

  private onMouseEnter = () => {
    this.setState({isHovered: true});
  }

  private onMouseLeave = () => {
    this.setState({isHovered: false});
  }

  private onSortClick = (event: React.MouseEvent) => {
    if(this.props.sortOrder === Sorting.NONE ||
        this.props.sortOrder === Sorting.DESCENDING) {
      this.props.sort(Sorting.ASCENDING);
    } else {
      this.props.sort(Sorting.DESCENDING);
    }
  }

  private static readonly STYLE = {
    container: {
      boxSizing: 'border-box',
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
    padding8: {
      flexGrow: 0,
      flexShrink: 0,
      width: '8px'
    } as React.CSSProperties,
    textSpace: {
      userSelect: 'none',
      paddingTop: '9px',
      display: 'flex',
      flexDirection: 'column'
    } as React.CSSProperties,
    text: {
      userSelect: 'none',
      fontSize: '12px',
      lineHeight: '14px',
      color: '#808080'
    } as React.CSSProperties,
    textHovered: {
      fontSize: '12px',
      lineHeight: '14px',
      color: '#4B23A0'
    } as React.CSSProperties,
    resizeLine: {
      width: '4px',
      height: '14px',
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
  }
}
