import * as React from 'react';
import {Sorting} from '../sorting';

interface Properties {

  /** The sort order of the column. */
  sortOrder: Sorting;

  /** Indicate if the button is clickable. */
  disabled?: boolean;

  /** The callback to use for a click. */
  onClick?: () => void;
}

interface State {
  isHovered: boolean;
}

/** Icon that displays sort information. */
export class SortIconButton extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);
    this.state = {
      isHovered: false
    }
  }

  render(): JSX.Element {
    const icon = (() => {
      if(this.props.sortOrder === Sorting.ASCENDING) {
        return (
          <svg xmlns="http://www.w3.org/2000/svg"
              width="5"
              height="6"
              viewBox="0 0 5 6">
            <path id="Polygon_2"
              data-name="Polygon 2"
              d="M2.5,0,5,6H0Z"
              fill="#4b23a0"/>
          </svg>);
      } else if(this.props.sortOrder === Sorting.DESCENDING) {
        return (
          <svg xmlns="http://www.w3.org/2000/svg"
              width="5"
              height="6"
              viewBox="0 0 5 6">
            <path id="Polygon_2"
              data-name="Polygon 2"
              d="M2.5,0,5,6H0Z"
              transform="translate(5 6) rotate(180)"
              fill="#4b23a0"/>
          </svg>);
      }
    })();
    return (
      <div style={SortIconButton.STYLE.container}>
        <div onMouseEnter={!this.props.disabled && this.onMouseEnter}
            onMouseLeave={!this.props.disabled && this.onMouseLeave}
            style={this.state.isHovered ?
              SortIconButton.STYLE.clickableAreaHovered :
              SortIconButton.STYLE.clickableArea}
            onClick={!this.props.disabled && this.onClick}>
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

  private onClick = () => {
    this.props.onClick();
  }

  private static readonly STYLE = {
    container: {
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      width: '16px',
      height: '16px',
      paddingLeft: '4px',
      paddingRight: '4px'
    } as React.CSSProperties,
    clickableArea: {
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center', 
      padding: '5px',
    } as React.CSSProperties,
    clickableAreaHovered: {
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center', 
      padding: '5px',
      backgroundColor: '#F2F2FF'
    } as React.CSSProperties
  }
}
