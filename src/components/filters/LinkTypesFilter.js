import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import ChartUtils from '../../helpers/ChartUtils';
import Button from '../form/Button';

class LinkTypesFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    links: PropTypes.array.isRequired,
  }

  getLinkTypes = memoizeOne((links) => {
    const types = _.chain(links)
      .groupBy('type')
      .map((d, key) => ({
        length: d.length,
        type: key,
      }))
      .orderBy('length', 'desc')
      .value();
    if (types.length) {
      this.props.setFilter('linkTypes', types.map((d) => d.type), true);
    }
    return types;
  }, (a, b) => _.isEqual(a[0].map((d) => d.type), b[0].map((d) => d.type)));

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  handleChange = (value) => {
    const { filters } = this.props;
    const i = filters.linkTypes.indexOf(value);
    if (i > -1) {
      filters.linkTypes.splice(i, 1);
    } else {
      filters.linkTypes.push(value);
    }
    this.props.setFilter('linkTypes', filters.linkTypes);
  }

  toggleMore = () => {
    const { showMore } = this.state;
    this.setState({ showMore: !showMore });
  }

  toggleAll = (fullData, allChecked) => {
    if (allChecked) {
      this.props.setFilter('linkTypes', []);
    } else {
      this.props.setFilter('linkTypes', fullData.map((d) => d.type));
    }
  }

  render() {
    const { showMore } = this.state;
    const { links, filters } = this.props;
    const typesFull = this.getLinkTypes(links);
    const types = showMore ? typesFull : _.chunk(typesFull, 5)[0] || [];
    if (typesFull.length < 2) {
      return null;
    }
    const allChecked = typesFull.length === filters.linkTypes.length;
    return (
      <div className="linkTypesFilter graphFilter">
        <h4 className="title">Link Types</h4>
        <ul className="list">
          <li className="item">
            <div className="filterCheckBox">
              <input
                onChange={() => this.toggleAll(typesFull, allChecked)}
                checked={allChecked}
                className="graphsCheckbox"
                type="checkbox"
                name="layout"
                id="linkCheckAll"
              />
              <label className="pull-left" htmlFor="linkCheckAll">Check All</label>
            </div>
            <div className="dashed-border" />
            <span className="badge">
              {_.sumBy(typesFull, 'length')}
            </span>
          </li>
          {types.map((item) => (
            <li key={item.type} className="item" style={{ color: ChartUtils.linkColor(item) }}>
              <div className="filterCheckBox">
                <input
                  onChange={() => this.handleChange(item.type)}
                  checked={filters.linkTypes.includes(item.type)}
                  className="graphsCheckbox"
                  type="checkbox"
                  name="layout"
                  id={item.type}
                />
                <label className="pull-left" htmlFor={item.type}>{item.type}</label>
              </div>
              <div className="dashed-border" />
              <span className="badge">
                {item.length}
              </span>
            </li>
          ))}
        </ul>
        {typesFull.length > types.length || showMore ? (
          <Button
            icon={showMore ? 'fa-chevron-up' : 'fa-chevron-down'}
            className="linkMoreButton"
            onClick={this.toggleMore}
          >
            {showMore ? 'less' : 'show more'}
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
)(LinkTypesFilter);

export default Container;
