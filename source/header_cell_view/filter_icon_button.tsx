import * as React from 'react';

interface Properties {

  /** Determines if there is a filter applied. */
  hasFilter: boolean;
}

interface State {
  isHovered: boolean;
}

/** Icon that displays filter information. */
export class FilterIconButton extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);
    this.state = {
      isHovered: false
    }
  }

  render(): JSX.Element {
    const icon = (() => {
      if(this.props.hasFilter) {
        return (
          <svg id="Group_1542" data-name="Group 1542"
              xmlns="http://www.w3.org/2000/svg"
              width="6" height="6" viewBox="0 0 6 6">
            <path id="Path_108" data-name="Path 108"
              d={`M5.5,1H.5A.5.5,0,0,1,0,.5H0A.5.5,0,0,1,.5,
                0h5A.5.5,0,0,1,6,.5H6A.5.5,0,0,1,5.5,1Z`}
              fill="#4b23a0"/>
            <path id="Path_109" data-name="Path 109"
              d="M5,2H1L2.5,3.5v2a.5.5,0,0,0,1,0v-2Z"
              fill="#4b23a0"/>
          </svg>);
      } else {
        return (
          <svg id="Group_1542" data-name="Group 1542"
              xmlns="http://www.w3.org/2000/svg"
              width="6" height="6" viewBox="0 0 6 6">
            <path id="Path_108" data-name="Path 108"
              d={`M5.5,1H.5A.5.5,0,0,1,0,.5H0A.5.5,0,0,1,.5,
                0h5A.5.5,0,0,1,6,.5H6A.5.5,0,0,1,5.5,1Z`}
              fill="#c8c8c8"/>
            <path id="Path_109" data-name="Path 109"
              d="M5,2H1L2.5,3.5v2a.5.5,0,0,0,1,0v-2Z"
              fill="#c8c8c8"/>
          </svg>);
      }
    })();
    return (
      <div style={FilterIconButton.STYLE.container}>
        <div onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
            onClick={this.onClick}
            style={this.state.isHovered ?
              FilterIconButton.STYLE.clickableAreaHovered :
              FilterIconButton.STYLE.clickableArea}>
          {icon}
        </div>
      </div>);
  }

  private onMouseEnter = () => {
    this.setState({isHovered: true});
  }

  private onMouseLeave = () => {
    this.setState({isHovered: false});
  }

  private onClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  private static readonly STYLE = {
    container: {
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      flexGrow: 0,
      flexShrink: 0
    } as React.CSSProperties,
    clickableArea: {
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      width: '16px',
      height: '16px',
      padding: '5px',
    } as React.CSSProperties,
    clickableAreaHovered: {
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      width: '16px',
      height: '16px', 
      padding: '5px',
      backgroundColor: '#F2F2FF'
    } as React.CSSProperties
  }
}
