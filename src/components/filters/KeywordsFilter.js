import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import Button from '../form/Button';

class KeywordsFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
  }

  getKeywords = memoizeOne((nodes) => {
    const keywords = _.chain(nodes)
      .map((d) => d.keywords)
      .flatten(1)
      .groupBy()
      .map((d, key) => ({
        length: d.length,
        keyword: key,
      }))
      .value();

    const empty = nodes.filter((d) => _.isEmpty(d.keywords))?.length;
    if (empty && keywords.length) {
      keywords.push({
        length: empty,
        keyword: '[ No Keyword ]',
      });
    }
    if (keywords.length) {
      this.props.setFilter('nodeKeywords', keywords.map((d) => d.keyword), true);
    }

    return _.orderBy(keywords, 'length', 'desc');
  }, (a, b) => _.isEqual(a[0].map((d) => d.keyword), b[0].map((d) => d.keyword)));

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  handleChange = (value) => {
    const { filters } = this.props;
    const i = filters.nodeKeywords.indexOf(value);
    if (i > -1) {
      filters.nodeKeywords.splice(i, 1);
    } else {
      filters.nodeKeywords.push(value);
    }

    this.props.setFilter('nodeKeywords', filters.nodeKeywords);
  }

  toggleMore = () => {
    const { showMore } = this.state;
    this.setState({ showMore: !showMore });
  }

  toggleAll = (fullData, allChecked) => {
    if (allChecked) {
      this.props.setFilter('nodeKeywords', []);
    } else {
      this.props.setFilter('nodeKeywords', fullData.map((d) => d.keyword));
    }
  }

  render() {
    const { showMore } = this.state;
    const { nodes, filters } = this.props;
    const typesFull = this.getKeywords(nodes);
    const types = showMore ? typesFull : _.chunk(typesFull, 5)[0] || [];
    if (typesFull.length < 2) {
      return null;
    }
    const allChecked = typesFull.length === filters.nodeKeywords.length;
    return (
      <div className="tagsFilter graphFilter">
        <h4 className="title">Node Keywords</h4>
        <ul className="list">
          <li className="item">
            <div className="filterCheckBox">
              <input
                onChange={() => this.toggleAll(typesFull, allChecked)}
                checked={allChecked}
                className="graphsCheckbox"
                type="checkbox"
                name="layout"
                id="keywordCheckAll"
              />
              <label className="pull-left" htmlFor="keywordCheckAll">Check All</label>
            </div>
            <div className="dashed-border" />
            <span className="badge">
              {_.sumBy(typesFull, 'length')}
            </span>
          </li>
          {types.map((item) => (
            <li key={item.keyword} className="item">
              <div className="filterCheckBox">
                <input
                  onChange={() => this.handleChange(item.keyword)}
                  checked={filters.nodeKeywords.includes(item.keyword)}
                  className="graphsCheckbox"
                  type="checkbox"
                  name="layout"
                  id={item.keyword}
                />
                <label className="pull-left" htmlFor={item.keyword}>{item.keyword}</label>
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
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(KeywordsFilter);

export default Container;
