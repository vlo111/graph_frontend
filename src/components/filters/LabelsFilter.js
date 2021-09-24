import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import Tooltip from 'rc-tooltip/es';
import { setFilter } from '../../store/actions/app';
import Checkbox from '../form/Checkbox';
import Button from '../form/Button';

class LabelsFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    labels: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
  }

  checkALlLabels = memoizeOne((labelsInfo) => {
    if (labelsInfo.length) {
      this.props.setFilter('labels', labelsInfo.map((d) => d.id), true);
    }
    return labelsInfo;
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

  toggleAll = (fullData, allChecked) => {
    if (allChecked) {
      this.props.setFilter('labels', []);
    } else {
      this.props.setFilter('labels', fullData.map((d) => d.id));
    }
  }

  render() {
    const {
      labels, nodes, filters, graphFilterInfo: { labelsInfo = [] },
    } = this.props;
    this.checkALlLabels(labelsInfo);
    if (labelsInfo.length < 1) {
      return null;
    }
    const allChecked = labelsInfo.length === filters.labels.length;

    return (
      <div className="labelsFilter graphFilter">
<<<<<<< HEAD
        <details open>
          <summary>
            Labels
          </summary>
          <ul className="list labelCheckAllBlock">
            <li className="item">
=======
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
>>>>>>> origin/master
              <div className="filterCheckBox">
                <Checkbox
                  onChange={() => this.toggleAll(labelsInfo, allChecked)}
                  checked={allChecked}
                  label="All"
                  id="labelCheckAll"
                />
              </div>
              <div className="dashed-border" />
              <span className="badge">
                {_.sumBy(labelsInfo, (d) => +d.length || 0)}
              </span>
            </li>
          </ul>
          <ul className="list ">
            {labelsInfo.map((item) => (
              <Tooltip key={item.id} overlay={item.name}>
                <li className="item labels-item">
                  <div className="filterCheckBox">
                    <div className="label-checkBox">
                      <input
                        className="labelsCheckInput"
                        checked={filters.labels.includes(item.id)}
                        onChange={() => this.handleChange(item.id)}
                        id={item.id}
                        type="checkbox"
                      />
                      <label className="labelsCheckbox" htmlFor={item.id}>
                        <div className="colorBox" style={{ borderColor: item.color }}>
                          <div style={{ backgroundColor: item.color }} />
                        </div>
                      </label>
                      <span className="badge">
                        {item.length}
                      </span>
                    </div>
<<<<<<< HEAD
                  </div>

                </li>
              </Tooltip>
            ))}
          </ul>
        </details>
=======
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
>>>>>>> origin/master
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  filters: state.app.filters,
  graphFilterInfo: state.graphs.graphFilterInfo,
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LabelsFilter);

export default Container;
