import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import InputRange from 'react-input-range';
import { setFilter } from '../../store/actions/app';

class NodeConnectionFilter extends Component {
  static propTypes = {
    linkConnection: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    links: PropTypes.array.isRequired,
  }

  getNodeConnections = memoizeOne((links) => {
    let connections = _.chain(links)
      .groupBy((l) => _.orderBy([l.source, l.target]).join('_'))
      .map((d, group) => ({
        count: d.length,
        group,
      }))
      .groupBy('count')
      .map((d, count) => ({
        count: +count,
        length: d.length,
      }))
      .orderBy('length', 'desc')
      .value();

    const max = _.maxBy(connections, (v) => v.count)?.count || 1;
    const maxLength = _.maxBy(connections, (v) => v.length)?.length || 1;

    //todo
    // const min = _.minBy(connections, (v) => v.count)?.count || 1;
    const min = 0;
    const minLength = _.minBy(connections, (v) => v.length)?.length || 1;

    connections = connections.map((v) => {
      v.percentage = (v.length / maxLength) * 100;
      return v;
    });
    return {
      connections,
      max,
      min,
      minLength,
      maxLength,
    };
  }, _.isEqual);


  handleChange = (values) => {
    this.props.setFilter('linkConnection', values);
  }

  render() {
    const { links, linkConnection } = this.props;
    const { connections, max, min } = this.getNodeConnections(links);
    if (min === max) {
      return null;
    }
    return (
      <div className="nodeConnectionFilter graphFilter">
        <h4 className="title">Node Connections</h4>
        <div className="rangeDataChart">
          {_.range(min, max + 1).map((num) => {
            const connection = connections.find((v) => v.count === num);
            return (
              <div
                key={num}
                style={{ height: connection ? `${connection.percentage}%` : 0 }}
                className="item"
                title={connection?.value}
              />
            );
          })}
        </div>
        <div className="ghRangeSelect">
          <InputRange
            minValue={min}
            maxValue={max}
            allowSameValues
            value={{
              min: linkConnection.min < 0 ? min : linkConnection.min,
              max: linkConnection.max < 0 ? max : linkConnection.max,
            }}
            onChange={this.handleChange}
          />
        </div>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  linkConnection: state.app.filters.linkConnection,
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeConnectionFilter);

export default Container;
