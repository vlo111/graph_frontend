import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Chart from "../../Chart";

class NodeFullInfo extends Component {
  static propTypes = {
    infoNodeName: PropTypes.string.isRequired,
  }

  render() {
    const { infoNodeName } = this.props;
    if (!infoNodeName) {
      return null;
    }
    const node = Chart.getNodes().find((n) => n.name === infoNodeName);
    if (!node) {
      return null;
    }
    return (
      <div id="nodeFullInfo">
        <h2>{node.name}</h2>
        <h3>{node.type}</h3>
        <p>{node.description}</p>
        <div className="collaborate">
          <h4 className="collaborateTitle">Collaborate (24)</h4>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  infoNodeName: state.app.infoNodeName,
});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeFullInfo);

export default Container;
