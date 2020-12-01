import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import Checkbox from '../form/Checkbox';
import ChartUtils from '../../helpers/ChartUtils';
import Button from '../form/Button';

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
            <Checkbox
              label={allChecked ? 'Uncheck All' : 'Check All'}
              checked={allChecked}
              onChange={() => this.toggleAll(statusFull, allChecked)}
            >
              <span className="badge">
                {_.sumBy(statusFull, 'length')}
              </span>
            </Checkbox>
          </li>
          {statusFull.map((item) => (
            <li key={item.status} className="item" style={{ color: ChartUtils.nodeColor(item) }}>
              <Checkbox
                label={item.status}
                checked={filters.nodeStatus.includes(item.status)}
                onChange={() => this.handleChange(item.status)}
              >
                <span className="badge">
                  {item.length}
                </span>
              </Checkbox>
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
