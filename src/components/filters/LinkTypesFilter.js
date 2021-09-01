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
  };

  checkAllLinks = memoizeOne((types) => {
    if (types.length) {
      this.props.setFilter('linkTypes', types.map((d) => d.type), true);
    }
    return types;
  }, _.isEqual);

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
  };

  toggleMore = () => {
    const { showMore } = this.state;
    this.setState({ showMore: !showMore });
  };

  toggleAll = (fullData, allChecked) => {
    if (allChecked) {
      this.props.setFilter('linkTypes', []);
    } else {
      this.props.setFilter(
        'linkTypes',
        fullData.map((d) => d.type),
      );
    }
  };

  render() {
    const { showMore } = this.state;
    const { filters, graphFilterInfo: { linkTypes = [] } } = this.props;
    this.checkAllLinks(linkTypes);
    const types = showMore ? linkTypes : _.chunk(linkTypes, 5)[0] || [];
    if (linkTypes.length < 2) {
      return null;
    }
    const allChecked = linkTypes.length === filters.linkTypes.length;
    return (
      <div className="linkTypesFilter graphFilter">
        <details open>
          <summary>
            Link Types
          </summary>
          <ul className="list">
            <li className="item">
              <div className="filterCheckBox">
                <Checkbox
                    label={allChecked ? 'Uncheck All' : 'Check All'}
                    checked={allChecked}
                    onChange={() => this.toggleAll(linkTypes, allChecked)}
                />
              </div>
              <span className="badge">{_.sumBy(linkTypes, 'length')}</span>
            </li>
            {types.map((item) => (
                <li
                    key={item.type}
                    className="item"
                    style={{ color: ChartUtils.linkColor(item) }}
                >
                  <div className="filterCheckBox">
                    <Checkbox
                        label={item.type}
                        checked={filters.linkTypes.includes(item.type)}
                        onChange={() => this.handleChange(item.type)}
                    />
                  </div>
                  <span className="badge">{item.length}</span>
                </li>
            ))}
          </ul>
        </details>
        {linkTypes.length > types.length || showMore ? (
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
  graphFilterInfo: state.graphs.graphFilterInfo,
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(LinkTypesFilter);

export default Container;
