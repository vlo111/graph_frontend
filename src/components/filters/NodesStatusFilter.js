<<<<<<< HEAD
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import ChartUtils from '../../helpers/ChartUtils';
import Button from '../form/Button';
import Checkbox from '../form/Checkbox';
=======
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import memoizeOne from "memoize-one";
import _ from "lodash";
import { setFilter } from "../../store/actions/app";
import Checkbox from "../form/Checkbox";
import ChartUtils from "../../helpers/ChartUtils";
import Button from "../form/Button";
>>>>>>> origin/master

class NodesStatusFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
  };

<<<<<<< HEAD
  checkAllNodes = memoizeOne((status) => {
    if (status.length) {
      this.props.setFilter('nodeStatus', status.map((d) => d.status), true);
    }
  }, _.isEqual);
=======
  getNodeStatus = memoizeOne(
    (nodes) => {
      const status = _.chain(nodes)
        .groupBy("status")
        .map((d, key) => ({
          length: d.length,
          status: key,
        }))
        .orderBy("length", "desc")
        .value();
      if (status.length) {
        this.props.setFilter(
          "nodeStatus",
          status.map((d) => d.status),
          true
        );
      }
      return status;
    },
    (a, b) =>
      _.isEqual(
        a[0].map((d) => d.status),
        b[0].map((d) => d.status)
      )
  );

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
      openList: [],
    };
  }
>>>>>>> origin/master

  handleChange = (value) => {
    const { filters } = this.props;
    const i = filters.nodeStatus.indexOf(value);
    if (i > -1) {
      filters.nodeStatus.splice(i, 1);
    } else {
      filters.nodeStatus.push(value);
    }
<<<<<<< HEAD
    this.props.setFilter('nodeStatus', filters.nodeStatus);
=======
    this.props.setFilter("nodeStatus", filters.nodeStatus);
>>>>>>> origin/master
  };

  toggleAll = (fullData, allChecked) => {
    if (allChecked) {
      this.props.setFilter("nodeStatus", []);
    } else {
      this.props.setFilter(
<<<<<<< HEAD
        'nodeStatus',
        fullData.map((d) => d.status),
=======
        "nodeStatus",
        fullData.map((d) => d.status)
>>>>>>> origin/master
      );
    }
  };

  render() {
    const { filters, graphFilterInfo: { nodeStatus = [] } } = this.props;
    this.checkAllNodes(nodeStatus);
    const allChecked = nodeStatus.length === filters.nodeStatus.length;
    return (
      <div className="nodesStatusFilter graphFilter">
<<<<<<< HEAD
        <details open>
          <summary>
            Node Status
          </summary>
          <ul className="list">
            <li className="item">
              <div className="filterCheckBox">
                <Checkbox
                  label="All"
                  id="allnodeStatus"
                  checked={allChecked}
                  onChange={() => this.toggleAll(nodeStatus, allChecked)}
                />
              </div>
              <span className="badge">{_.sumBy(nodeStatus, 'length')}</span>
=======
        <h4 className="title">Status</h4>
        <ul className="list">
          <li className="item">
            <div className="filterCheckBox">
              <Checkbox
                label={allChecked ? "Uncheck All" : "Check All"}
                checked={allChecked}
                onChange={() => this.toggleAll(statusFull, allChecked)}
                className="graphsCheckbox"  /> 
            </div>
            <span className="badge">{_.sumBy(statusFull, "length")}</span>
          </li>
          {statusFull.map((item) => (
            <li
              key={item.status}
              className="item"
              style={{ color: ChartUtils.nodeColor(item) }}
            >
              <div className="filterCheckBox">
                <Checkbox
                  label={item.status}
                  checked={filters.nodeStatus.includes(item.status)}
                  onChange={() => this.handleChange(item.status)}
                  className="graphsCheckbox" /> 
              </div>
              <span className="badge">{item.length}</span>
>>>>>>> origin/master
            </li>
            {nodeStatus.map((item) => (
              <li
                key={item.status}
                className="item"
                style={{ color: ChartUtils.nodeColor(item) }}
              >
                <div className="filterCheckBox">

                  <div className="checkWithLabel">
                    <Checkbox
                      id={item.status}
                      checked={filters.nodeStatus.includes(item.status)}
                      onChange={() => this.handleChange(item.status)}
                    />
                    <label className="check-label pull-left" htmlFor={item.status}>{item.status}</label>
                  </div>
                </div>
                <span className="badge">{item.length}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  filters: state.app.filters,
  customFields: state.graphs.singleGraph.customFields || {},
  graphFilterInfo: state.graphs.graphFilterInfo,
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps
)(NodesStatusFilter);

export default Container;
