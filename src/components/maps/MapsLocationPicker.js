import React, { Component } from 'react';
import Modal from 'react-modal';
import { Marker, Map } from 'google-maps-react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import MapsSearch from './MapsSearch';
import markerImg from '../../assets/images/icons/marker.svg';
import withGoogleMap from '../../helpers/withGoogleMap';
import Button from '../form/Button';

class MapsLocationPicker extends Component {
  static propTypes = {
    google: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
  }

  static defaultProps = {
    value: '',
  }

  initPosition = memoizeOne((value) => {
    if (value) {
      const [lat, lng] = value.split(',').map((v) => +v);
      const { selected: { location } } = this.state;
      if (location?.lat !== lat || location?.lat !== lng) {
        this.setState({ selected: { location: { lat, lng } } });
      }
    }
  })

  constructor(props) {
    super(props);
    this.state = {
      selected: {},
    };
  }

  handleSearchSelect = (selected) => {
    this.setState({ selected });
  }

  handleSelect = () => {
    const { selected: { location } } = this.state;
    const value = !_.isEmpty(location) ? [location.lat, location.lng].join(',') : '';
    this.props.onChange(value);
    this.props.onClose();
  }

  handleClick = (props, map, ev) => {
    const location = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
    this.setState({ selected: { location } });
  }

  render() {
    const { selected } = this.state;
    const { google, value } = this.props;
    this.initPosition(value);
    return (
      <Modal
        isOpen
        className="ghModal ghMapsModal ghMapsLocationPicker"
        overlayClassName="ghModalOverlay ghMapsModalOverlay"
        onRequestClose={this.props.onClose}
      >
        <Map
          google={google}
          zoom={17}
          streetViewControl={false}
          fullscreenControl={false}
          onClick={this.handleClick}
          center={selected.autoCenter ? selected.location : undefined}
        >
          {!_.isEmpty(selected) ? (
            <Marker
              title={selected.name}
              name={selected.name}
              position={selected.location}
              draggable
              icon={{
                url: markerImg,
                anchor: new google.maps.Point(25, 35),
                scaledSize: new google.maps.Size(50, 50),
              }}
            />
          ) : null}
          <MapsSearch google={google} onSelect={this.handleSearchSelect} />
        </Map>
        <Button className="selectLocation" onClick={this.handleSelect}>Select</Button>
      </Modal>
    );
  }
}

export default withGoogleMap(MapsLocationPicker);
