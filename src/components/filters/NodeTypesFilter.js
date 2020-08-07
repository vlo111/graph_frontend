import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import Checkbox from '../form/Checkbox';
import ChartUtils from '../../helpers/ChartUtils';
import Button from "../form/Button";

class nodeTypessFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
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

    return types;
  }, _.isEqual);

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    }
  }

  handleChange = (value) => {
    const { nodes, filters } = this.props;
    if (!filters.nodeTypes.length) {
      filters.nodeTypes = this.getNodeTypes(nodes).map((d) => d.type);
    }
    const i = filters.nodeTypes.indexOf(value);
    if (i > -1) {
      filters.nodeTypes.splice(i, 1);
      if (!filters.nodeTypes.length) {
        filters.nodeTypes = this.getNodeTypes(nodes).map((d) => d.type).filter((d) => d !== value);
      }
    } else {
      filters.nodeTypes.push(value);
    }

    this.props.setFilter('nodeTypes', filters.nodeTypes);
  }

  toggleMore = () => {
    const { showMore } = this.state;
    this.setState({ showMore: !showMore });
  }

  render() {
    const { showMore } = this.state;
    const { nodes, filters } = this.props;
    const typesFull = this.getNodeTypes(nodes);
    const types = showMore ? typesFull : _.chunk(typesFull, 5)[0] || [];
    return (
      <div className="nodesTypesFilter graphFilter">
        <h4 className="title">Node Types</h4>
        <ul className="list">
          {types.map((item) => (
            <li key={item.type} className="item" style={{ color: ChartUtils.nodeColor()(item) }}>
              <Checkbox
                label={item.type}
                checked={_.isEmpty(filters.nodeTypes) || filters.nodeTypes.includes(item.type)}
                onChange={() => this.handleChange(item.type)}
              >
                <span className="badge">
                  {item.length}
                </span>
              </Checkbox>
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
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(nodeTypessFilter);

export default Container;
