import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import ChartUtils from '../../helpers/ChartUtils';

class NodesStatusFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
  }

  getNodeStatus = memoizeOne((nodes) => {
    const status = _.chain(nodes)
      .groupBy('status')
      .map((d, key) => ({
        length: d.length,
        status: key,
      }))
      .orderBy('length', 'desc')
      .value();
    if (status.length) {
      this.props.setFilter('nodeStatus', status.map((d) => d.status), true);
    }
    return status;
  }, (a, b) => _.isEqual(a[0].map((d) => d.status), b[0].map((d) => d.status)));

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
      openList: [],
    };
  }

  handleChange = (value) => {
    const { filters } = this.props;
    const i = filters.nodeStatus.indexOf(value);
    if (i > -1) {
      filters.nodeStatus.splice(i, 1);
    } else {
      filters.nodeStatus.push(value);
    }
    this.props.setFilter('nodeStatus', filters.nodeStatus);
  }

  toggleAll = (fullData, allChecked) => {
    if (allChecked) {
      this.props.setFilter('nodeStatus', []);
    } else {
      this.props.setFilter('nodeStatus', fullData.map((d) => d.status));
    }
  }

  render() {
    const { nodes, filters } = this.props;
    const statusFull = this.getNodeStatus(nodes);
    const allChecked = statusFull.length === filters.nodeStatus.length;
    return (
      <div className="nodesStatusFilter graphFilter">
        <h4 className="title">Status</h4>
        <ul className="list">
          <li className="item">
            <div className="filterCheckBox">
              <input
                onChange={() => this.toggleAll(statusFull, allChecked)}
                checked={allChecked}
                className="graphsCheckbox"
                type="checkbox"
                name="layout"
                id="statusCheckAll"
              />
              <label className="pull-left" htmlFor="statusCheckAll">Check All</label>
            </div>
            <div className="dashed-border" />
            <span className="badge">
              {_.sumBy(statusFull, 'length')}
            </span>
          </li>
          {statusFull.map((item) => (
            <li key={item.status} className="item" style={{ color: ChartUtils.nodeColor(item) }}>
              <div className="filterCheckBox">
                <input
                  onChange={() => this.handleChange(item.status)}
                  checked={filters.nodeStatus.includes(item.status)}
                  className="graphsCheckbox"
                  type="checkbox"
                  name="layout"
                  id={item.status}
                />
                <label className="pull-left" htmlFor={item.status}>{item.status}</label>
              </div>
              <div className="dashed-border" />
              <span className="badge">
                {item.length}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  filters: state.app.filters,
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodesStatusFilter);

export default Container;
