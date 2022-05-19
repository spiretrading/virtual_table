import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {HeaderCellViewDemo, TableViewDemo} from './demo';


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
