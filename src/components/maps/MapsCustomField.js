import React, { Component } from 'react';
import PropTypes from 'prop-types';

class MapsCustomField extends Component {
  static propTypes = {
    data: PropTypes.oneOfType(PropTypes.string).isRequired,
  }

  render() {
    const { data } = this.props;
    return (
      <>
        {data.address ? (
          <p>
            <strong>Address: </strong>
            {data.address}
          </p>
        ) : null}
        {data.phone ? (
          <p>
            <strong>Phone: </strong>
            <a href={`tel:${data.phone}`}>
              {data.phone}
            </a>
          </p>
        ) : null}
        {data.website ? (
          <p>
            <strong>Website: </strong>
            <a href={data.website} target="_blank" rel="noopener noreferrer">
              {data.website}
            </a>
          </p>
        ) : null}
      </>
    );
  }
}

export default MapsCustomField;
