import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import InputRange from 'react-input-range';
import { setFilter } from '../../store/actions/app';

class LinkValueFilter extends Component {
  static propTypes = {
    linkValue: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    links: PropTypes.array.isRequired,
  }

  getLinkValue = memoizeOne((links) => {
    let values = _.chain(links)
      .groupBy('value')
      .map((d, key) => ({
        length: d.length,
        value: +key,
      }))
      .orderBy('value', 'desc')
      .value();
    const max = _.maxBy(values, (v) => v.value)?.value || 1;
    const maxLength = _.maxBy(values, (v) => v.length)?.length || 1;

    const min = _.minBy(values, (v) => v.value)?.value || 1;
    const minLength = _.minBy(values, (v) => v.length)?.length || 1;

    values = values.map((v) => {
      v.percentage = (v.length / maxLength) * 100;
      return v;
    });
    return {
      values,
      max,
      min,
      minLength,
      maxLength,
    };
  }, _.isEqual);

  handleChange = (values) => {
    this.props.setFilter('linkValue', values);
  }

  render() {
    const { links, linkValue } = this.props;
    const { values, max, min } = this.getLinkValue(links);
    if (min === max) {
      return null;
    }
    return (
      <div className="linkValueFilter graphFilter">
        <h4 className="title">Link Values</h4>
        <div className="rangeDataChart">
          {_.range(min, max + 1).map((num) => {
            const value = values.find((v) => v.value === num);
            return (
              <div
                key={num}
                style={{ height: value ? `${value.percentage}%` : 0 }}
                className="item"
                title={value?.value}
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
              min: linkValue.min < 0 ? min : linkValue.min,
              max: linkValue.max < 0 ? max : linkValue.max,
            }}
            onChange={this.handleChange}
          />
        </div>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  linkValue: state.app.filters.linkValue,
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LinkValueFilter);

export default Container;
