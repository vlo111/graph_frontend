import React, { Component } from 'react';
import withGoogleMap from '../../helpers/withGoogleMap';
import { Map, Marker } from "google-maps-react";
import markerImg from "../../assets/images/icons/marker.svg";
import MapsLocationPicker from "./MapsLocationPicker";
import Button from "../form/Button";

class MapsInfo extends Component {
  render() {
    const { node, google } = this.props;
    const [lat, lng] = node.location.split(',');
    const location = { lat, lng };
    return (
      <div data-field-name="_location" className="contentWrapper previewWrapper mapWrapper">
        <div className="content">
          <Map
            google={google}
            zoom={17}
            streetViewControl={false}
            fullscreenControl={false}
            onClick={this.handleClick}
            initialCenter={location}
          >
            <Marker
              title={node.name}
              name={node.name}
              position={location}
              draggable={true}
              icon={{
                url: markerImg,
                anchor: new google.maps.Point(25, 35),
                scaledSize: new google.maps.Size(50, 50),
              }}
            />
          </Map>
          <Button className="selectLocation" onClick={this.handleSelect}>Save</Button>
        </div>
      </div>
    );
  }
}

export default withGoogleMap(MapsInfo);
