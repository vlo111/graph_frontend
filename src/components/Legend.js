import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setLegendButton } from '../store/actions/app';
import Chart from '../Chart';
import { ReactComponent as Arrow } from '../assets/images/arrow.svg';
import ChartUtils from '../helpers/ChartUtils';

class Legend extends Component {
    static propTypes = {
      showLegendButton: PropTypes.string.isRequired,
      setLegendButton: PropTypes.func.isRequired,
    }

    handleClick = () => {
      const { showLegendButton } = this.props;

      if (showLegendButton !== 'show') {
        this.props.setLegendButton('show');
      } else this.props.setLegendButton('close');
    }

    orderData = (data) => data.sort((a, b) => {
      if (a.type.toUpperCase() < b.type.toUpperCase()) return -1;
      if (a.type.toUpperCase() > b.type.toUpperCase()) return 1;
      return 0;
    })

    render() {
      const { showLegendButton } = this.props;

      const nodes = this.orderData([...new Map(Chart.getNodes().map((node) => [node.type, node])).values()]);

      const links = this.orderData([...new Map(Chart.getLinks().map((link) => [link.type, link])).values()]);

      const listNodeItems = nodes.map((node) => (
        <li className="node-item">
          <span className="indicator" style={{ backgroundColor: ChartUtils.nodeColor(node) }} />
          <a title={node.type} href="#">{node.type}</a>
        </li>
      ));

      const listLinkItems = links.map((link) => (
        <li className="connection-item">
          <span className="indicator" style={{ backgroundColor: link.color }} />
          <a title={link.type} href="#">{link.type}</a>
        </li>
      ));

      return (
        <div className={showLegendButton === 'close' ? 'legends' : 'legends open'}>
          <button className="dropdown-btn" onClick={() => this.handleClick()}>
            Show Legends
            <span className="carret">
              <Arrow />
            </span>
          </button>
          <div className="dropdown">
            <div className="nodes">
              <h4>
                Nodes (
                {nodes.length}
                )
              </h4>
              <ul className="node-list">
                {listNodeItems}
              </ul>
            </div>
            <div className="connections">
              <h4>
                Connections (
                {links.length}
                )
              </h4>
              <ul className="connection-list">
                {listLinkItems}
              </ul>
            </div>
          </div>
        </div>
      );
    }
}

const mapStateToProps = (state) => (
  {
    showLegendButton: state.app.legendButton,
  });

const mapDispatchToProps = {
  setLegendButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Legend);

export default Container;
