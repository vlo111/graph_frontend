import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Input from '../form/Input';

class LocationInputs extends Component {
  static propTypes = {
    value: PropTypes.string,
    error: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }

  static defaultProps = {
    value: '',
    error: undefined,
  }

  handleChange = (i, val) => {
    const { value } = this.props;
    const valueArr = value.split(',');
    valueArr[i] = val;
    this.props.onChange(valueArr.join(','));
  }

  render() {
    const { value, error } = this.props;
    const [lat, lng] = value.split(',');
    return (
      <div className="locationInputsWrapper">
        <Input
          label="Geolocation"
          placeholder="latitude"
          type="number"
          name="longitude"
          onWheel={(ev) => ev.target.blur()}
          value={lat}
          error={error}
          onChangeText={(v) => this.handleChange(0, v)}
        />
        <Input
          placeholder="longitude"
          type="number"
          name="latitude"
          onWheel={(ev) => ev.target.blur()}
          value={lng}
          onChangeText={(v) => this.handleChange(1, v)}
        />
      </div>
    );
  }
}

export default LocationInputs;
