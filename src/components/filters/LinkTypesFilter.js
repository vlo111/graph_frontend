import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import Checkbox from '../form/Checkbox';
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

    return types;
  }, _.isEqual);

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  handleChange = (value) => {
    const { links, filters } = this.props;
    if (!filters.linkTypes.length) {
      filters.linkTypes = this.getLinkTypes(links).map((d) => d.type);
    }
    const i = filters.linkTypes.indexOf(value);
    if (i > -1) {
      filters.linkTypes.splice(i, 1);
      if (!filters.linkTypes.length) {
        filters.linkTypes = this.getLinkTypes(links).map((d) => d.type).filter((d) => d !== value);
      }
    } else {
      filters.linkTypes.push(value);
    }

    this.props.setFilter('linkTypes', filters.linkTypes);
  }

  toggleMore = () => {
    const { showMore } = this.state;
    this.setState({ showMore: !showMore });
  }

  render() {
    const { showMore } = this.state;
    const { links, filters } = this.props;
    const typesFull = this.getLinkTypes(links);
    const types = showMore ? typesFull : _.chunk(typesFull, 5)[0] || [];
    return (
      <div className="linkTypesFilter graphFilter">
        <h4 className="title">Link Types</h4>
        <ul className="list">
          {types.map((item) => (
            <li key={item.type} className="item" style={{ color: ChartUtils.linkColor()(item) }}>
              <Checkbox
                label={item.type}
                checked={_.isEmpty(filters.linkTypes) || filters.linkTypes.includes(item.type)}
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
)(LinkTypesFilter);

export default Container;
