import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { setLegendButton } from '../store/actions/app';
import ChartUtils from '../helpers/ChartUtils';
import { ReactComponent as DownSvg } from '../assets/images/icons/down.svg';
import { ReactComponent as LegendSvg } from '../assets/images/icons/legend.svg';

import { getSingleGraphRequest } from '../store/actions/graphs';
import Utils from '../helpers/Utils';

class Legend extends Component {
  static propTypes = {
    showLegendButton: PropTypes.string.isRequired,
    setLegendButton: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,

  }

  handleClick = () => {
    const { showLegendButton } = this.props;

    if (showLegendButton !== 'show') {
      this.props.setLegendButton('show');

      // this.props.getSingleGraphRequest(Utils.getGraphIdFormUrl());
    } else this.props.setLegendButton('close');
  }

  orderData = (data) => data.sort((a, b) => {
    if (a.type.toUpperCase() < b.type.toUpperCase()) return -1;
    if (a.type.toUpperCase() > b.type.toUpperCase()) return 1;
    return 0;
  })

  render() {
    const { showLegendButton, singleGraph: { nodesPartial, linksPartial } } = this.props;

    const nodes = this.orderData([...new Map(nodesPartial?.map((node) => [node.type, node])).values()]);

    const links = this.orderData([...new Map(linksPartial?.map((link) => [link.type, link])).values()]);

    const typeData = nodesPartial?.map((p) => ({
      name: p.name,
      type: p.type,
    }));
    const groupTypes = _.groupBy(typeData, 'type');
    const types = [];
    Object.keys(groupTypes).forEach((l) => {
      const currentType = groupTypes[l];
      types.push({ type: currentType[0].type, count: currentType.length });
    });

    const listNodeItems = nodes.map((node) => (
      <li className="node-item" key={node.id} style={{ backgroundColor: ChartUtils.nodeColor(node) }}>
        <a title={node.type} href="#">{`${node.type}`}</a>
        <a className="nodeCount">{`(${groupTypes[Object.keys(groupTypes).filter((p) => p === node.type)].length})`}</a>
      </li>

    ));

    const listLinkItems = links.map((link) => (
      <li className="connection-item" key={link.id} style={{ backgroundColor: link.color }}>
        <a title={link.type} className="linkColor">{link.type}</a>
      </li>
    ));

    return (
      <div className={showLegendButton === 'close' ? 'legends' : 'legends open'}>

        <button className="dropdown-btn legendButton" onClick={() => this.handleClick()}>
          <LegendSvg className="legendSvg" />
          <h6>  Legends</h6>
          <div className="carretNew">
            <DownSvg />
          </div>
        </button>

        <div className="dropdown">
          <div className="nodes">
            <h4>
              Nodes (
              {nodesPartial?.length}
              )
            </h4>
            <ul className="node-list">
              {listNodeItems}
            </ul>
          </div>
          <div className="borderLegends" />
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

const mapStateToProps = (state) => ({
  showLegendButton: state.app.legendButton,
  singleGraph: state.graphs.singleGraph,
});

const mapDispatchToProps = {
  setLegendButton,
  getSingleGraphRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Legend);

export default Container;
