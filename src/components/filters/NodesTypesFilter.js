import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import Checkbox from '../form/Checkbox';
import ChartUtils from "../../helpers/ChartUtils";

class NodesTypesFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
  }

  getTypes = memoizeOne((nodes) => {
    const types = nodes.filter((d) => d.type).map((d) => d.type);
    return _.uniq(types);
  }, _.isEqual)

  handleChange = (value) => {
    const { nodes, filters } = this.props;
    if (!filters.nodeType.length) {
      filters.nodeType = this.getTypes(nodes);
    }
    const i = filters.nodeType.indexOf(value);
    if (i > -1) {
      filters.nodeType.splice(i, 1);
      if (!filters.nodeType.length) {
        filters.nodeType = this.getTypes(nodes).filter((d) => d !== value);
      }
    } else {
      filters.nodeType.push(value);
    }

    this.props.setFilter('nodeType', filters.nodeType);
  }

  render() {
    const { nodes, filters } = this.props;
    const types = this.getTypes(nodes);
    return (
      <div className="nodesTypesFilter">
        <ul className="list">
          {types.map((type) => (
            <li key={type} className="item" style={{ color: ChartUtils.nodeColor()({ type }) }}>
              <Checkbox
                label={type}
                labelReverse
                checked={_.isEmpty(filters.nodeType) || filters.nodeType.includes(type)}
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
)(NodesTypesFilter);

export default Container;
