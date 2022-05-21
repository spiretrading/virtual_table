import * as React from 'react';
import { HeaderCell } from '../header_cell';
import { HeaderCellView } from '../header_cell_view';
import { SortOrder } from '../sort_order';

interface State {
  width: number;
  model: HeaderCell;
  isFilterable: boolean;
  hasFilter: boolean;
}

/** Demo that displays the HeaderCellView. */
export class HeaderCellViewDemo extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      width: 200,
      model: new HeaderCell('Distance', 'Dist.', SortOrder.NONE,
        this.simulateSort),
      isFilterable: true,
      hasFilter: false
    };
  }

  public render(): JSX.Element {
    return (
      <div style={HeaderCellViewDemo.STYLE.container}>
        <button onClick={this.onSortableClick}>
          Use SortableModel
        </button>
        <button onClick={this.onUnsortableClick}>
          Use UnSortableModel
        </button>
        <button onClick={this.toggleFilterable}>
          Toggle isFilterable
        </button>
        <button onClick={this.toggleHasFilter}>
          Toggle hasFilter
        </button>
        <span>Available Width</span>
        <input type='number' onChange={this.updateWidth}
          value={this.state.width}/>
        <div style={{maxWidth: `${this.state.width}px`,
            minWidth: `${this.state.width}px`, minHeight: '40px'}}>
          <HeaderCellView
            name={this.state.model.name}
            shortName={this.state.model.shortName}
            sortOrder={this.state.model.sortOrder}
            isSortable={this.state.model.sortOrder !== SortOrder.UNSORTABLE}
            isFilterable={this.state.isFilterable}
            hasFilter={this.state.hasFilter}
            onSort={this.updateSort}/>
        </div>
      </div>);
  }

  private onSortableClick = () => {
    const model = new HeaderCell('Distance', 'Dist.', SortOrder.NONE,
      this.simulateSort);
    this.setState({model: model});
  }

  private onUnsortableClick = () => {
    const model = new HeaderCell('Distance', 'Dist.', SortOrder.UNSORTABLE,
      this.simulateSort);
    this.setState({model: model});
  }

  private updateSort = () => {
    this.state.model.sort();
    this.setState({model: this.state.model});
    return true;
  }

  private simulateSort = () => {
    return true;
  }

  private toggleFilterable = () => {
    if(this.state.isFilterable) {
      this.setState({isFilterable: false});
    } else {
      this.setState({isFilterable: true});
    }
  }

  private toggleHasFilter = () => {
    if(this.state.hasFilter) {
      this.setState({hasFilter: false});
    } else {
      this.setState({hasFilter: true});
    }
  }

  private updateWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      alignItems: 'flex-start',
      border: '10px solid white'
    } as React.CSSProperties,
  };
}
