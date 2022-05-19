import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HeaderCellView } from '../header_cell/header_cell_view';
import { Sorting } from '../sorting';

interface State {
  sortValue: Sorting;
  width: number;
}

export class HeaderCellViewDemo extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      sortValue: Sorting.NONE,
      width: 200
    };
  }

  render(): JSX.Element {
    return (
      <div style={HeaderCellViewDemo.STYLE.container}>
          <span>Available Width</span>
          <input type='number' onChange={this.updateWidth}
            value={this.state.width}/>
        <div style={{maxWidth: `${this.state.width}px`,
            minWidth: `${this.state.width}px`, minHeight: '40px'}}>
          <HeaderCellView name='Distance' shortName='Dist.'
            sortOrder={this.state.sortValue}
            isSortable={true}
            isFilterable={true}
            sort={this.updateSort}/>
        </div>
      </div>);
  }

  updateSort = (value: Sorting) => {
    this.setState({sortValue: value});
  }

  updateWidth = (event: React.ChangeEvent<HTMLInputElement>)  => {
    const value = (() => {
      if(event.target.value.length === 0) {
        return 0;
      } else {
        return parseInt(event.target.value);
      }
    })();
    if(value > 0) {
      this.setState({width: value});
    } else {
      this.setState({width: 0});
    }
  }

  private static readonly STYLE = {
    container: {
      boxSizing: 'border-box',
      fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
      fontWeight: '500',
      height: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    } as React.CSSProperties,
  }
}
