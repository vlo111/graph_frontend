import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import ChartUtils from '../../helpers/ChartUtils';
import Button from '../form/Button';

class NodeTypesFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
  }

  getNodeTypes = memoizeOne((nodes) => {
    const types = _.chain(nodes)
      .groupBy('type')
      .map((d, key) => ({
        length: d.length,
        type: key,
      }))
      .orderBy('length', 'desc')
      .value();
    if (types.length) {
      this.props.setFilter('nodeTypes', types.map((d) => d.type), true);
    }
    return types;
  }, (a, b) => _.isEqual(a[0].map((d) => d.type), b[0].map((d) => d.type)));

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
    const { filters } = this.props;

    const i = filters.nodeTypes.indexOf(value);
    if (i > -1) {
      filters.nodeTypes.splice(i, 1);
    } else {
      filters.nodeTypes.push(value);
    }

    this.props.setFilter('nodeTypes', filters.nodeTypes);
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

  toggleMore = () => {
    const { showMore } = this.state;
    this.setState({ showMore: !showMore });
  }

  toggleDropdown = (key) => {
    const { openList } = this.state;
    const i = openList.indexOf(key);
    if (i > -1) {
      openList.splice(i, 1);
    } else {
      openList.push(key);
    }
    this.setState({ openList });
  }

  toggleAll = (fullData, allChecked) => {
    if (allChecked) {
      this.props.setFilter('nodeTypes', []);
    } else {
      this.props.setFilter('nodeTypes', fullData.map((d) => d.type));
    }
  }

  render() {
    const { showMore, openList } = this.state;
    const { nodes, filters, customFields } = this.props;
    const typesFull = this.getNodeTypes(nodes);
    const types = showMore ? typesFull : _.chunk(typesFull, 5)[0] || [];
    if (typesFull.length < 2) {
      return null;
    }
    const allChecked = typesFull.length === filters.nodeTypes.length;

    return (
      <div className="nodesTypesFilter graphFilter">
        <h4 className="title">Node Types</h4>
        <ul className="list">
          <li className="item">
            <div className="filterCheckBox">
              <input
                onChange={() => this.toggleAll(typesFull, allChecked)}
                checked={allChecked}
                className="graphsCheckbox"
                type="checkbox"
                name="layout"
                id="nodeCheckAll"
              />
              <label className="pull-left" htmlFor="nodeCheckAll">Check All</label>
            </div>
            <div className="dashed-border" />
            <span className="badge">
              {_.sumBy(typesFull, 'length')}
            </span>
          </li>
          {types.map((item) => (
            <li key={item.type} className="item" style={{ color: ChartUtils.nodeColor(item) }}>
              <div className="filterCheckBox">
                <input
                  onChange={() => this.handleChange(item.type)}
                  checked={filters.nodeTypes.includes(item.type)}
                  className="graphsCheckbox"
                  type="checkbox"
                  name="layout"
                  id={item.type}
                />
                <label className="pull-left" htmlFor={item.type}>{item.type}</label>
                <div>
                  {!_.isEmpty(customFields[item.type]) ? (
                    <Button
                      className="dropdownArrow"
                      icon="fa-chevron-down"
                      onClick={() => this.toggleDropdown(item.type)}
                    />
                  ) : null}
                  {openList.includes(item.type) && customFields[item.type] ? (
                    <ul className="list subList">
                      {_.map(customFields[item.type], (val, key) => (
                        <li key={key} className="item">
                          <div className="filterCheckBox nestedCheckBox">
                            <input
                              onChange={() => this.handleFilterChange(key)}
                              checked={filters.nodeCustomFields.includes(key)}
                              className="graphsCheckbox"
                              type="checkbox"
                              name="layout"
                              id={key}
                            />
                            <label className="pull-left" htmlFor={key}>{key}</label>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
              <div className="dashed-border" />
              <span className="badge">
                {item.length}
              </span>
            </li>
          ))}
        </ul>
        {typesFull.length > types.length || showMore ? (
          <Button onClick={this.toggleMore}>
            {showMore ? '- Less' : '+ More'}
          </Button>
        ) : null}
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
)(NodeTypesFilter);

export default Container;
