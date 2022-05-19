import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HeaderCellView } from './header_cell/header_cell_view';
import { ArrayTableModel } from './array_table_model';
import { Sorting } from './sorting';
import { TableView } from './table_view';

class TableViewDemo extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
    this.model = new ArrayTableModel();
    this.header = ['one', 'two', 'three', 'four'];
  }

  render(): JSX.Element {
    return  <TableView model={this.model} style={this.someStyle}
      labels={this.header} height={700}/>;
  }

  componentDidMount(): void {
    for(let row = 0; row < 10000; ++row) {
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
      this.model.push(r);
      }
  }

  changeValues = () => {
    const diceRoll = Math.floor(Math.random() * 4);
    const testRow = Math.floor(Math.random() * this.model.rowCount);
    if(this.model.rowCount > 500 && diceRoll === 0) {
      this.model.remove(testRow);
    } else if(diceRoll === 1) {
      const num = Math.floor(Math.random() * 90) + 100;
      this.model.insert([this.model.rowCount, num, num, num], 0);
    } else {
      const testValue = Math.floor(Math.random() * this.model.rowCount) + 0.5;
      const testColumn = Math.floor(Math.random() * 4);
      this.model.set(testRow, testColumn, testValue);
    }
  }

  header = ['one', 'two', 'three', 'four'];
  someStyle = {
    table: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '20px',
      borderCollapse: 'collapse',
      border: '5px solid #000000'
    },
    th: {
      border: '2px solid #000000',
      color: '#4b23a0'
    },
    td: {
      border: '2px solid #000000',
      paddingLeft: '30px',
      paddingRight: '30px',
      color: '#4b23a0'
    }
  };
  model: ArrayTableModel;
}

interface HeaderCellViewDemoState {
  sortValue: Sorting;
  width: number;
}

class HeaderCellViewDemo extends React.Component<{}, HeaderCellViewDemoState> {
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

interface State {
  currentDemo: string;
}

class MainDemo extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      currentDemo: 'HeaderCellViewDemo'
    }
  }

  render(): JSX.Element {
    const demo = (() => {
      if(this.state.currentDemo === 'TableViewDemo') {
        return <TableViewDemo/>;
      } else if(this.state.currentDemo === 'HeaderCellViewDemo') {
        return <HeaderCellViewDemo/>;
      }else {
        return <div>Please select a demo</div>;
      }
    })();
    return(
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <button onClick={() => this.onButtonClick('TableViewDemo')}>
            TableViewDemo
          </button>
          <button onClick={() => this.onButtonClick('HeaderCellViewDemo')}>
            HeaderCellViewDemo
          </button>
        </div>
        {demo}
      </div>
    );
  }

  onButtonClick(newDemo: string) {
    this.setState({currentDemo: newDemo});
  }
}

ReactDOM.render(<MainDemo/>, document.getElementById('main'));
