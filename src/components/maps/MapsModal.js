import React, { Component } from 'react';
import Modal from 'react-modal';
import { Marker, Map } from 'google-maps-react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import ReactDOMServer from 'react-dom/server';
import MapsSearch from './MapsSearch';
import markerImg from '../../assets/images/icons/marker.svg';
import ChartUtils from '../../helpers/ChartUtils';
import { toggleNodeModal } from '../../store/actions/app';
import Utils from '../../helpers/Utils';
import Loading from '../Loading';
import withGoogleMap from '../../helpers/withGoogleMap';
import CustomFields from '../../helpers/CustomFields';
import MapsContactCustomField from './MapsContactCustomField';

class MapsModal extends Component {
  static propTypes = {
    google: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      // map: null,
      markerDrag: false,
      selected: null,
      initialCenter: null,
      virtualMarkerPos: [],
    };
    this.events = {};
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove);
    this.setCurrentLocation();
  }

  componentWillUnmount() {
    const { google } = this.props;
    _.forEach(this.events, (ev) => {
      google.maps.event.removeListener(ev);
    });
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
  }

  setCurrentLocation = async () => {
    try {
      const { coords } = await Utils.getCurrentPosition();
      const initialCenter = { lat: coords.latitude, lng: coords.longitude };

      this.setState({ initialCenter });
    } catch (e) {
      this.setState({ initialCenter: undefined });
    }
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

  handleMouseUp = async (ev) => {
    const { customFields } = this.props;
    const { markerDrag } = this.state;
    let { selected } = this.state;
    if (!markerDrag) return;
    const { clientX, clientY } = ev;
    const { x, y } = ChartUtils.calcScaledPosition(clientX, clientY);

    this.setState({ markerDrag: false });
    this.props.onClose();

    if (!selected.name) {
      selected = await this.getPlaceInformation(selected.location);
    }
    const customField = CustomFields.get(customFields, selected.type);
    const contact = ReactDOMServer.renderToString(<MapsContactCustomField data={selected} />);

    let url = 'https://en.wikipedia.org/w/api.php';

    const params = {
      action: 'query',
      prop: 'extracts',
      titles: selected.name,
      exintro: 0,
      explaintext: 0,
      redirects: 1,
      format: 'json',
    };

    url += '?origin=*';

    Object.keys(params).forEach((key) => {
      url += `&${key}=${params[key]}`;
    });

    fetch(url)
      .then((response) => response.json())
      .then((response) => {
        if (Object.values(response.query.pages)[0].extract && customField) {
          if (contact) {
            customField.About = `<div>
<strong class="tabHeader">Contact</strong><br>
<br>${contact}<br>
</div>`;
          }
          customField.About += `<div>
<strong class="tabHeader">About</strong><br>
<br>${Object.values(response.query.pages)[0].extract}<br>
<a href="https://en.wikipedia.org/wiki/${selected.name}" target="_blank">
https://en.wikipedia.org/wiki/${selected.name}
</a></div>`;
        }
      })
      .catch((error) => {
        console.log(error);
      });

    this.props.toggleNodeModal({
      fx: x,
      fy: y,
      name: selected.name,
      icon: selected.photo,
      type: selected.type,
      location: [selected.location.lat, selected.location.lng].join(','),
      customField,
    });
  }

  handleMarkerMouseDown = (props, marker, ev) => {
    const { clientX, clientY } = ev.ub;
    this.setState({ markerDrag: true, virtualMarkerPos: [clientX, clientY] });
  }

  handleMapReady = (props, map) => {
    const { google } = props;
    this.placesService = new google.maps.places.PlacesService(map);
    this.geocoderService = new google.maps.Geocoder();
    // this.setState({ map });
  }

  handleSearchSelect = (selected) => {
    this.setState({ selected });
  }

  handleMouseMove = (ev) => {
    const { markerDrag } = this.state;
    if (!markerDrag) return;
    const { clientX, clientY } = ev;
    this.setState({ virtualMarkerPos: [clientX, clientY] });
  }

  handleClick = (props, map, ev) => {
    const location = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
    const selected = {
      location,
    };
    this.setState({ selected });
  }

  render() {
    const {
      selected, markerDrag, virtualMarkerPos, initialCenter,
    } = this.state;
    const { google } = this.props;
    return (
      <>
        <Modal
          isOpen
          className="ghModal ghMapsModal"
          overlayClassName={`ghModalOverlay ghMapsModalOverlay ${markerDrag ? 'hidden' : ''}`}
          onRequestClose={this.props.onClose}
        >
          {!_.isNull(initialCenter) ? (
            <Map
              google={google}
              zoom={17}
              streetViewControl={false}
              fullscreenControl={false}
              onClick={this.handleClick}
              center={selected?.autoCenter ? selected.location : undefined}
              initialCenter={initialCenter}
              onReady={this.handleMapReady}
            >
              {selected ? (
                <Marker
                  title={selected.name}
                  name={selected.name}
                  onMousedown={this.handleMarkerMouseDown}
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
          ) : <Loading />}
        </Modal>
        {markerDrag ? (
          <img
            src={markerImg}
            style={{ left: virtualMarkerPos[0], top: virtualMarkerPos[1] }}
            className="ghMapsModalVirtualMarker"
            alt="marker"
          />
        ) : null}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  toggleNodeModal,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapsModal);

export default withGoogleMap(Container);
