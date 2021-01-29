import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import ChartUtils from '../../helpers/ChartUtils';
import LabelUtils from '../../helpers/LabelUtils';
import { setFilter } from '../../store/actions/app';

class LabelStatusFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    labels: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
  }


  formatLabels = memoizeOne((labels) => {

    const labelsFormatted = _.chain(labels)
      .groupBy('status')
      .map((d, key) => ({
        length: d.length,
        status: key
      }))
      .orderBy('length', 'desc')
      .value();
    if (labelsFormatted.length) {
      this.props.setFilter('labelStatus', labelsFormatted.map((d) => d.status), true);
    }
    return labelsFormatted;
  }, (a, b) => _.isEqual(a[0].map((d) => d.status), b[0].map((d) => d.status)));

  handleChange = (value) => {
    const { filters } = this.props;
    const i = filters.labelStatus.indexOf(value);

    if (i > -1) {
      filters.labelStatus.splice(i, 1);
    } else {
      filters.labelStatus.push(value);
    }
    this.props.setFilter('labelStatus', filters.labelStatus);
  }

  toggleAll = (fullData, allChecked) => {

    if (allChecked) {
      this.props.setFilter('labelStatus', []);
    } else {
      this.props.setFilter('labelStatus', fullData.map((d) => d.status));
    }

  }
  statusName = (label) => {
    return LabelUtils.lableStatusNane(label);
  }
  render() {
    const { labels, filters } = this.props;
    const labelStatusFull = this.formatLabels(labels);
    const allChecked = labelStatusFull.length === filters.labelStatus.length;
    if (labelStatusFull.length < 1) {
      return null;
    }

    return (
      <div className="nodesStatusFilter graphFilter">
        <h4 className="title">Label status</h4>
        <ul className="list">
          <li className="item">
            <div className="filterCheckBox">
              <input
                onChange={() => this.toggleAll(labelStatusFull, allChecked)}
                checked={allChecked}
                className="graphsCheckbox"
                type="checkbox"
                name="layout"
                id="labelStatusCheckAll"
              />
              <label className="pull-left" htmlFor="labelStatusCheckAll">Check All</label>
            </div>
            <div className="dashed-border" />
            <span className="badge">
              {_.sumBy(labelStatusFull, 'length')}
            </span>
          </li>
          {labelStatusFull.map((item) => (
            <li key={item.status} className="item" style={{ color: ChartUtils.nodeColor(item) }}>

              <div className="filterCheckBox">
                <input
                  onChange={() => this.handleChange(item.status)}
                  checked={filters.labelStatus.includes(item.status)}
                  className="graphsCheckbox"
                  type="checkbox"
                  name="layout"
                  id={this.statusName(item.status)}
                />
                <label
                  className="pull-left"
                  htmlFor={this.statusName(item.status)}
                >
                  {this.statusName(item.status)}
                </label>
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
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LabelStatusFilter);

export default Container;
