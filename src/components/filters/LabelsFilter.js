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


  formatLabels = memoizeOne((labels, nodes, d) => {
    const labelsFormatted = _.chain(labels)
      .map((l) => ({
        color: l.color,
        name: l.name || l.color,
        length: nodes.filter((d) => (d.labels || []).includes(l.name || l.color)).length,
      }))
      .orderBy('length', 'desc')
      .value();
    return labelsFormatted;
  }, _.isEqual);


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

  render() {
    const { labels, nodes, filters } = this.props;
    const labelsFormatted = this.formatLabels(labels, nodes);
    // if (labelsFormatted.length < 2) {
    //   return null;
    // }
    return (
      <div className="labelsFilter graphFilter">
        <h4 className="title">Labels</h4>
        <ul className="list">
          {labelsFormatted.map((item) => (
            <Tooltip key={item.color} overlay={item.name}>
              <li className="item">
                <Checkbox
                  label={(
                    <div className="colorBox" style={{ borderColor: item.color }}>
                      <div style={{ backgroundColor: item.color }} />
                    </div>
                  )}
                  checked={filters.labels.includes(item.name)}
                  onChange={() => this.handleChange(item.name)}
                >
                  <span className="badge">
                    {item.length}
                  </span>
                </Checkbox>
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
