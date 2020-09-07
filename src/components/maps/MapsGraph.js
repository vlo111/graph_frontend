import React, { Component } from 'react';
import {
  GoogleApiWrapper, Map, Polyline, Marker, InfoWindow,
} from 'google-maps-react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import Button from '../form/Button';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { previousActiveButton } from '../../store/actions/app';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import Api from '../../Api';
import NodeIcon from '../NodeIcon';

const { REACT_APP_GOOGLE_MAP_API_KEY } = process.env;

class MapsGraph extends Component {
  static propTypes = {
    google: PropTypes.object.isRequired,
    previousActiveButton: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeNode: {},
    };
  }

  handleMapClick = () => {
    const { activeNode } = this.state;
    if (activeNode?.marker) {
      this.setState({ activeNode: {} });
    }
  }

  handleMarkerClick = (props, marker, ev, node) => {
    this.setState({
      activeNode: { marker, node },
    });
  }

  render() {
    const { activeNode } = this.state;
    const { google } = this.props;
    let nodes = [];
    const links = Chart.getLinks().map((d) => {
      const source = ChartUtils.getNodeByName(d.source);
      const target = ChartUtils.getNodeByName(d.target);
      if (source.location && target.location) {
        const l1 = source.location.split(',');
        const l2 = target.location.split(',');
        source.locationObj = { lat: +l1[0], lng: +l1[1] };
        target.locationObj = { lat: +l2[0], lng: +l2[1] };
        d.locations = [source.locationObj, target.locationObj];
        nodes.push(source);
        nodes.push(target);
      }
      return d;
    }).filter((d) => d.locations);
    nodes = _.uniqBy(nodes, 'name');
    console.log(activeNode);
    return (
      <div id="mapsGraph">
        <Map
          google={google}
          zoom={7}
          initialCenter={nodes[0].locationObj}
          streetViewControl={false}
          fullscreenControl={false}
          onClick={this.handleMapClick}
        >
          {links.map((d) => (
            <Polyline
              path={d.locations}
              strokeColor={ChartUtils.linkColor()(d)}
              strokeWeight={d.value * 2 || 2}
            />
          ))}
          {nodes.map((d) => (
            <Marker
              name={d.name}
              position={d.locationObj}
              title={d.name}
              onClick={(props, marker, ev) => this.handleMarkerClick(props, marker, ev, d)}
              icon={{
                url: `${Api.url}/public/markers/${ChartUtils.nodeColor()(d).replace('#', '')}.svg`,
                anchor: new google.maps.Point(25, 35),
                scaledSize: new google.maps.Size(50, 50),
              }}
            />
          ))}
          <InfoWindow visible={!!activeNode.marker} marker={activeNode.marker}>
            {activeNode?.node ? (
              <div className="googleMapDescription">
                <div className="left">
                  <NodeIcon node={activeNode.node} />
                </div>
                <div className="right">
                  <h3>{activeNode.node.name}</h3>
                  <h4>{activeNode.node.type}</h4>
                </div>
              </div>
            ) : null}
          </InfoWindow>
        </Map>
        <Button className="closeMap" icon={<CloseSvg />} onClick={this.props.previousActiveButton} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  previousActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapsGraph);

export default GoogleApiWrapper({
  apiKey: REACT_APP_GOOGLE_MAP_API_KEY,
})(Container);
