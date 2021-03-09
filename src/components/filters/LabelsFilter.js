import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import Tooltip from 'rc-tooltip/es';
import { setFilter } from '../../store/actions/app';
import Checkbox from '../form/Checkbox';

class LabelsFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    labels: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
  }

  formatLabels = memoizeOne((labels, nodes) => {
    const labelsFormatted = _.chain(labels)
      .map((l) => ({
        id: l.id,
        color: l.color,
        name: l.name || l.color,
        length: nodes.filter((d) => (d.labels || []).includes(l.id)).length,
      }))
      .orderBy('length', 'desc')
      .value();
    // labelsFormatted.push({
    //   id: -1,
    //   color: '#8dc5f0',
    //   name: 'No Label',
    //   length: 'No Label',
    // });
    if (labelsFormatted.length) {
      this.props.setFilter('labels', labelsFormatted.map((d) => d.id), true);
    }
    return labelsFormatted;
  }, (a, b) => _.isEqual(a[0].map((d) => d.id), b[0].map((d) => d.id)));

  handleChange = (value) => {
    const { filters } = this.props;
    const i = filters.labels.indexOf(value);
    if (i > -1) {
      filters.labels.splice(i, 1);
    } else {
      filters.labels.push(value);
    }
    this.props.setFilter('labels', filters.labels);
  }

  toggleAll = (fullData, allChecked) => {
    if (allChecked) {
      this.props.setFilter('labels', []);
    } else {
      this.props.setFilter('labels', fullData.map((d) => d.id));
    }
  }

  render() {
    const { labels, nodes, filters } = this.props;
    const labelsFormatted = this.formatLabels(labels, nodes);
    if (labelsFormatted.length < 1) {
      return null;
    }
    const allChecked = labelsFormatted.length === filters.labels.length;

    return (
      <div className="labelsFilter graphFilter">
        <h4 className="title">Labels</h4>
        
        <ul className="list labelCheckAllBlock">
          <li className="item">
            <div className="filterCheckBox">
              <input
                  onChange={() => this.toggleAll(labelsFormatted, allChecked)}
                  checked={allChecked}
                  className="graphsCheckbox"
                  type="checkbox"
                  name="layout"
                  id="labelCheckAll"
              />
              <label className="pull-left" htmlFor="labelCheckAll">{allChecked ? 'Uncheck All' : 'Check All'}</label>
            </div>
            <div className="dashed-border" />
            <span className="badge">
            {_.sumBy(labelsFormatted, (d) => +d.length || 0)}
          </span>
          </li>
        </ul>
        <ul className="list ">
          {labelsFormatted.map((item) => (
            <Tooltip key={item.id} overlay={item.name}>
              <li className="item">
              <div className="filterCheckBox">
                <Checkbox
                  label={(
                    <div className="colorBox" style={{ borderColor: item.color }}>
                      <div style={{ backgroundColor: item.color }} />
                    </div>
                  )}
                  checked={filters.labels.includes(item.id)}
                  onChange={() => this.handleChange(item.id)}
                 
                >     
                <span className="badge">
                    {item.length}
                  </span>             
                </Checkbox>
                </div>
                
              </li>
            </Tooltip>
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
)(LabelsFilter);

export default Container;
