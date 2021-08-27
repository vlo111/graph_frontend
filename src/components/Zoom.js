import React, { Component } from 'react';
import * as d3 from 'd3';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Icon from './form/Icon';
import Chart from '../Chart';
import ChartUtils from '../helpers/ChartUtils';
import { toggleGraphMap } from '../store/actions/app';
import ReactChartMap from './chart/ReactChartMap';
import { ReactComponent as FullScreenSvg } from '../assets/images/icons/full-screen.svg';
import { ReactComponent as FullScreenCloseSvg } from '../assets/images/icons/full-screen-close.svg';
import { ReactComponent as ScaleSvg } from '../assets/images/icons/scale-to-full.svg';
import { ReactComponent as MapSvg } from '../assets/images/icons/map-icon.svg';

class Zoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMap: false,
      zoom: 100,
      fullScreen: false,
    };
  }

  static propTypes = {
    activeButton: PropTypes.string.isRequired,
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
    Chart.event.on('render', this.autoScale);
    Chart.event.on('zoom', this.handleChartZoom);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    Chart.event.removeListener('render', this.autoScale);
    Chart.event.removeListener('zoom', this.handleChartZoom);
  }

  handleChartZoom = (ev, d) => {
    this.setState({ zoom: Math.round(d.transform.k * 100) });
  }

  autoScale = () => {
    
    ChartUtils.autoScale();
  }

  handleKeyDown = (ev) => {
    ChartUtils.keyEvent(ev);
    if (ev.chartEvent && ev.ctrlPress) {
      if (ev.keyCode === 187) {
        ev.preventDefault();
        this.zoomIn();
      } else if (ev.keyCode === 189) {
        ev.preventDefault();
        this.zoomOut();
      } else if (ev.keyCode === 48) {
        ev.preventDefault();
        this.zoom();
      }
    }
  }

  zoom = (scale = 1, x = 0, y = 0) => {
    Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
  }

  zoomIn = () => {
    let scale = +Chart.wrapper.attr('data-scale') || 1;
    let x = +Chart.wrapper.attr('data-x') || 0;
    let y = +Chart.wrapper.attr('data-y') || 0;
    if (scale >= 2.4) {
      scale = 2.5
    } else if (scale > 0.9) {
      scale += 0.1;
      x -= 100 * scale;
      y -= 100 * scale;
    } else {
      scale += 0.01;
      x -= 10 * scale;
      y -= 10 * scale;
    }
    this.zoom(scale, x, y);
  }

  zoomOut = () => {
    let scale = +Chart.wrapper.attr('data-scale') || 1;
    let x = +Chart.wrapper.attr('data-x') || 0;
    let y = +Chart.wrapper.attr('data-y') || 0;
    if (scale < 0.04) {
      return;
    }
    if (scale < 0.2) {
      scale -= 0.01;
      x += 10 * scale;
      y += 10 * scale;
    } else {
      scale -= 0.1;
      x += 100 * scale;
      y += 100 * scale;
    }

    this.zoom(scale, x, y);
  }

  toggleGraphMap = () => {
    const { showMap } = this.state;
    this.setState({ showMap: !showMap });
    this.props.toggleGraphMap(showMap)
  }

  toggleFullScreen = async () => {
    const { fullScreen } = this.state;

    if (fullScreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      this.setState({ fullScreen: false });
    } else {
      const el = document.documentElement;
      try {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.mozRequestFullScreen) {
          await el.mozRequestFullScreen();
        } else if (el.webkitRequestFullScreen) {
          await el.webkitRequestFullScreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        }
        this.setState({ fullScreen: true });
      } catch (e) {
        this.setState({ fullScreen: false });
      }
    }
  }

  render() {
    const { showMap, zoom, fullScreen } = this.state;
    const { showGraphMap } = this.props
    return (
      <>
        <div className={`graphControlPanel ${showGraphMap ? 'showMap' : ''} ${fullScreen ? 'fullScreen' : ''}`}>
          {showGraphMap ? (
            <div className="reactChartMapWrapper">
              <ReactChartMap />
            </div>
          ) : null}
          <div className="buttons">
            <Icon
              value={fullScreen ? <FullScreenCloseSvg /> : <FullScreenSvg />}
              onClick={this.toggleFullScreen}
              className="button"
            />
            <Icon value={<MapSvg />} onClick={this.toggleGraphMap} className="button map" />
            <Icon value={<ScaleSvg />} onClick={this.autoScale} className="button" />
            <Icon value="fa-minus" onClick={this.zoomOut} className="button plus" />
            <Icon value="fa-plus" onClick={this.zoomIn} className="button minus" />

            <span className="zoomLevel" onClick={() => this.zoom()}>
              {`${zoom}%`}
            </span>
          </div>

        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  showGraphMap: state.app.showGraphMap,
  singleGraph: state.graphs.singleGraph,
});
const mapDispatchToProps = {
  toggleGraphMap,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Zoom);

export default Container;
