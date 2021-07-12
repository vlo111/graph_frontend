import React, { Component } from 'react';
import Modal from 'react-modal';
import { Marker, Map } from 'google-maps-react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { toast } from 'react-toastify';
import MapsSearch from './MapsSearch';
import markerImg from '../../assets/images/icons/marker.svg';
import withGoogleMap from '../../helpers/withGoogleMap';
import Button from '../form/Button';
import Utils from '../../helpers/Utils';
import MapsStyle from './MapsStyle';
import { toast } from 'react-toastify';

class MapsLocationPicker extends Component {
  static propTypes = {
    google: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    edit: PropTypes.number,
  }

  static defaultProps = {
    value: '',
    edit: null,
  }

  initPosition = memoizeOne((value) => {
    if (_.isObject(value) && value?.length) {
      const { lat, lng } = value[0].location;
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
      initialCenter: null,
    };
  }

  componentDidMount() {
    this.setCurrentLocation();
  }

  setCurrentLocation = async () => {
    const { value } = this.props;
    if (_.isObject(value) && value?.length) {
      const { lat, lng } = value[0].location;
      this.setState({ initialCenter: { lat, lng } });
      return;
    }
    try {
      const { coords } = await Utils.getCurrentPosition();
      const initialCenter = { lat: coords.latitude, lng: coords.longitude };
      this.setState({ initialCenter });
    } catch (e) {
      this.setState({ initialCenter: undefined });
    }
  }

  handleSearchSelect = (selected) => {
    this.setState({ selected });
  }

  handleSelect = async () => {
    let { selected } = this.state;
    const { edit } = this.props;

    if (!selected.location) {
      toast.error('Don`t selected location ');
      return;
    }
    if (!selected.name) {
      selected = await this.getPlaceInformation(selected.location);
    }
    if (Number.isInteger(edit)) {
      this.props.onChange(selected, edit);
    } else {
      this.props.onChange(selected);
    }
    this.props.onClose();
  }

  getPlaceInformation = (location) => new Promise((resolve) => {
    this.geocoderService.geocode({ location }, (results) => {
      const { place_id: placeId } = results[0] || {};
      if (!placeId) {
        resolve({ location });
        return;
      }
      this.placesService.getDetails({
        placeId,
        fields: ['name', 'international_phone_number', 'types', 'formatted_address', 'website', 'photo'],
      }, (place, status) => {
        if (status !== 'OK') {
          resolve({ location });
          return;
        }
        const {
          name, website, photos,
          formatted_address: address,
          international_phone_number: phone,
          types,
        } = place;
        const photo = !_.isEqual(photos) ? photos[0].getUrl({ maxWidth: 250, maxHeight: 250 }) : null;
        const type = _.lowerCase(types[0] || '');
        const selected = {
          location, website, name, photo, address, type, phone,
        };
        resolve(selected);
      });
    });
  })

  handleLocationChange = (props, map, ev) => {
    const location = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
    this.setState({ selected: { location } });
  }

  handleMapReady = (props, map) => {
    const { google } = props;
    this.placesService = new google.maps.places.PlacesService(map);
    this.geocoderService = new google.maps.Geocoder();
  }

  render() {
    const { selected, initialCenter } = this.state;
    const { google, value, edit } = this.props;
    this.initPosition(value);
    return (
      <Modal
        isOpen
        className="ghModal ghMapsModal ghMapsLocationPicker"
        overlayClassName="ghModalOverlay ghMapsModalOverlay"
        onRequestClose={this.props.onClose}
      >
        {!_.isNull(initialCenter) ? (
          <>
            <Map
              styles={MapsStyle.mapStyle}
              google={google}
              zoom={17}
              streetViewControl={false}
              fullscreenControl={false}
              onClick={this.handleLocationChange}
              center={selected.autoCenter ? selected.location : undefined}
              initialCenter={initialCenter}
              onReady={this.handleMapReady}
            >
              {(!Number.isInteger(edit)) && (_.isObject(value) && value.map((p) => (
                <Marker
                  title={p.name}
                  name={p.name}
                  position={p.location}
                  draggable
                  onDragend={this.handleLocationChange}
                  icon={{
                    url: markerImg,
                    anchor: new google.maps.Point(25, 35),
                    scaledSize: new google.maps.Size(50, 50),
                  }}
                />
              )))}
              {!_.isEmpty(selected) ? (
                <Marker
                  title={selected.name}
                  name={selected.name}
                  position={selected.location}
                  draggable
                  onDragend={this.handleLocationChange}
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
          </>
        ) : null}
      </Modal>
    );
  }
}

export default withGoogleMap(MapsLocationPicker);
