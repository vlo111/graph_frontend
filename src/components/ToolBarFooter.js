import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { getGraphInfoRequest } from '../store/actions/graphs';
import { setActiveButton } from '../store/actions/app';
import Chart from '../Chart';
import Button from './form/Button';
import { ReactComponent as InfoSvg } from '../assets/images/icons/info.svg';
import { ReactComponent as ShowMapSvg } from '../assets/images/icons/show-map.svg';

class ToolBarFooter extends Component {
  static propTypes = {
    getGraphInfoRequest: PropTypes.func.isRequired,
    graphInfo: PropTypes.object.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    graphId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      totalNodes: 0,
      totalLinks: 0,
      totalLabels: 0,
    };
  }

  componentDidMount() {
    Chart.event.on('expandData', this.expandData);
  }

  componentWillUnmount() {
    Chart.event.on('expandData', this.expandData);
  }

  expandData = (ev) => {
    const nodes = Chart.getNodes(true);
    const links = Chart.getLinks(true);
    const labels = Chart.getLabels();
    this.setState({
      totalNodes: nodes?.length,
      totalLinks: links?.length,
      totalLabels: labels?.length,
    });
  }

  handleClick = (activeButton) => {
    this.props.setActiveButton(activeButton);
  }

  render() {
    const { totalNodes, totalLinks, totalLabels } = this.state;
    const { graphInfo, graphId, partOf } = this.props;
    const showInMap = Chart.getNodes().some((d) => (!Array.isArray(d.location) && d?.location));
    const updateLocation = window.location.pathname.startsWith('/graphs/update');

    return (!graphId ? null
      : (
        <>
          <footer id="graphs-data-info" style={updateLocation ? { left: '352px' } : { left: '15px' }}>
            <div
              onClick={() => {
                document.getElementsByClassName('info')[0].style.width = '28';
              }}
              className="info"
            >
              <div
                onClick={() => {
                  const infoElement = document.getElementsByClassName('info')[0];
                  const infoContentElement = infoElement.lastElementChild;

                  if (infoContentElement.style.position === '' || infoContentElement.style.position === 'fixed') {
                    const width = `${infoElement.offsetWidth + infoElement.lastElementChild.offsetWidth + 30}px`;

                    infoContentElement.style.position = 'relative';

                    infoElement.style.width = width;

                    setTimeout(() => {
                      infoContentElement.style.visibility = 'initial';
                    }, 140);
                  } else {
                    infoContentElement.style.position = 'fixed';

                    infoContentElement.style.visibility = 'hidden';

                    infoElement.style.width = '50px';
                  }
                }}
                className="info-icon"
              >
                <InfoSvg />
              </div>
              <div className="info-content">
                <div className="nodesMode">
                  <span>
                    {partOf ? `Nodes (${totalNodes} of ${graphInfo.totalNodes}) ` : `Nodes (${graphInfo.totalNodes || 0})`}
                  </span>
                </div>
                <div className="linksMode">
                  <span>
                    {partOf ? `Links (${totalLinks} of ${graphInfo.totalLinks}) ` : `Links (${graphInfo.totalLinks || 0})`}
                  </span>
                </div>
                <div className="labelsMode">
                  <span>
                    {partOf ? `Labels (${totalLabels} of ${graphInfo.totalLabels}) ` : `Labels (${graphInfo.totalLabels || 0})`}
                  </span>
                </div>
              </div>
            </div>
            {showInMap ? (
              <div onClick={(ev) => this.handleClick('maps-view')} className="mapMode">
                <ShowMapSvg />
                <span>Show on map</span>
              </div>
            ) : null}
          </footer>
        </>
      )
    );
  }
}

const mapStateToProps = (state) => ({
  graphInfo: state.graphs.graphInfo,
  graphId: state.graphs.singleGraph?.id,
});

const mapDispatchToProps = {
  getGraphInfoRequest,
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToolBarFooter);

export default Container;
