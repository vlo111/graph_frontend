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
    return status;
  }, _.isEqual);

  getCustomFields = memoizeOne((customFields) => {
    const keys = [];
    _.forEach(customFields, (d) => {
      keys.push(...Object.keys(d));
    });
    return _.uniq(keys);
  }, _.isEqual);

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
      openList: [],
    };
  }

  handleChange = (value) => {
    const { nodes, filters } = this.props;
    console.log(filters.nodeStatus, 'filters');
    if (!filters.nodeStatus.length) {
      
      filters.nodeStatus = this.getNodeStatus(nodes).map((d) => d.status);
      console.log(filters.nodeStatus, 'filters.nodeStatus');
    }
    const i = filters.nodeStatus.indexOf(value);
    console.log(i, 'iiiiii', filters.nodeStatus.splice(i, 1));
    /*if (i > -1) {
      filters.nodeStatus.splice(i, 1); //console.log(filters.nodeStatus.length, 'filters.nodeStatus.length');
      if (!filters.nodeStatus.length) {
        filters.nodeStatus = this.getNodeStatus(nodes).map((d) => d.status).filter((d) => d !== value);
      }
    } else {
      filters.nodeStatus.push(value);
    }
    
    this.props.setFilter('status', filters.nodeStatus);*/
  }

  handleFilterChange = (value) => {
    const { filters } = this.props;
    const i = filters.nodeCustomFields.indexOf(value);
   
    if (i > -1) {
      filters.nodeCustomFields.splice(i, 1);
    } else {
      filters.nodeCustomFields.push(value);
    }

    this.props.setFilter('nodeCustomFields', filters.nodeCustomFields);
  }

  render() {
    const { showMore } = this.state;
    const { nodes, filters } = this.props;
    const statusFull = this.getNodeStatus(nodes);
    console.log(filters.nodeStatus, 'statusFull') 
    return (
      <div className="nodesStatusFilter graphFilter">
        <h4 className="title">Status</h4>
        <ul className="list">
          {statusFull.map((item) => (
            <li key={item.status} className="item" style={{ color: ChartUtils.nodeColor(item) }}>
             <Checkbox
                label={item.status}
                checked={_.isEmpty(filters.nodeStatus) || filters.nodeStatus.includes(item.status)}
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
