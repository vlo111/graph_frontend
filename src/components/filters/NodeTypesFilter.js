import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import Checkbox from '../form/Checkbox';
import ChartUtils from '../../helpers/ChartUtils';

class nodeTypessFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
  }

  getNodeTypes = memoizeOne((nodes) => {
    const types = nodes.filter((d) => d.type).map((d) => d.type);
    return _.uniq(types);
  }, _.isEqual)

  handleChange = (value) => {
    const { nodes, filters } = this.props;
    if (!filters.nodeTypes.length) {
      filters.nodeTypes = this.getNodeTypes(nodes);
    }
    const i = filters.nodeTypes.indexOf(value);
    if (i > -1) {
      filters.nodeTypes.splice(i, 1);
      if (!filters.nodeTypes.length) {
        filters.nodeTypes = this.getNodeTypes(nodes).filter((d) => d !== value);
      }
    } else {
      filters.nodeTypes.push(value);
    }

    this.props.setFilter('nodeTypes', filters.nodeTypes);
  }

  render() {
    const { nodes, filters } = this.props;
    const types = this.getNodeTypes(nodes);
    return (
      <div className="nodesTypesFilter graphFilter">
        <h4 className="title">Node Types</h4>
        <ul className="list">
          {types.map((type) => (
            <li key={type} className="item" style={{ color: ChartUtils.nodeColor()({ type }) }}>
              <Checkbox
                label={type}
                labelReverse
                checked={_.isEmpty(filters.nodeTypes) || filters.nodeTypes.includes(type)}
                onChange={() => this.handleChange(type)}
              />
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
)(nodeTypessFilter);

export default Container;
