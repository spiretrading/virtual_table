import * as React from 'react';
import { SortOrder } from '../sort_order';

interface Properties {

  /** The sort order of the column. */
  sortOrder: SortOrder;
}

interface State {
  isHovered: boolean;
}

/** Icon that displays sort information. */
export class SortIcon extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);
    this.state = {
      isHovered: false
    }
  }

  render(): JSX.Element {
    const icon = (() => {
      if(this.props.sortOrder === SortOrder.ASCENDING) {
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
      } else if(this.props.sortOrder === SortOrder.DESCENDING) {
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
      <div style={SortIcon.STYLE.container}>
        {icon}
      </div>);
  }

  private static readonly STYLE = {
    container: {
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      width: '5px',
      flexGrow: 0,
      flexShrink: 0
    } as React.CSSProperties
  }
}
