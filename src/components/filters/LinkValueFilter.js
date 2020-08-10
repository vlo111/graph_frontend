import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import InputRange from 'react-input-range';
import { setFilter } from '../../store/actions/app';

class LinkValueFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
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
      v.percentage = v.length * 100 / maxLength;
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

  handleChartClick = (value) => {
    const { filters } = this.props;
    console.log(value);
    const difMin = filters.linkValue.min - value;
    const difMax = filters.linkValue.max - value;
    if (difMin < difMax) {
      this.props.setFilter('linkValue.min', +value);
    } else {
      this.props.setFilter('linkValue.max', +value);
    }
    // if (value < filters.linkValue.min) {
    //   this.props.setFilter('linkValue.min', value);
    // } else if (value > filters.linkValue.max) {
    //   this.props.setFilter('linkValue.max', value);
    // }
  }

  handleChange = (values) => {
    this.props.setFilter('linkValue', values);
  }

  render() {
    const { links, filters } = this.props;
    const { values, max, min } = this.getLinkValue(links);
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
            name="hello"
            allowSameValues
            value={{
              min: filters.linkValue.min < 0 ? min : filters.linkValue.min,
              max: filters.linkValue.max < 0 ? max : filters.linkValue.max,
            }}
            onChange={this.handleChange}
          />
        </div>

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
)(LinkValueFilter);

export default Container;
