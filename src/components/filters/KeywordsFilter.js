import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import Checkbox from '../form/Checkbox';
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
    return _.orderBy(keywords, 'length', 'desc');
  }, _.isEqual);

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  handleChange = (value) => {
    const { nodes, filters } = this.props;
    if (!filters.nodeKeywords.length) {
      filters.nodeKeywords = this.getKeywords(nodes).map((d) => d.keyword);
    }
    const i = filters.nodeKeywords.indexOf(value);
    if (i > -1) {
      filters.nodeKeywords.splice(i, 1);
      if (!filters.nodeKeywords.length) {
        filters.nodeKeywords = this.getKeywords(nodes).map((d) => d.keyword).filter((d) => d !== value);
      }
    } else {
      filters.nodeKeywords.push(value);
    }

    this.props.setFilter('nodeKeywords', filters.nodeKeywords);
  }

  toggleMore = () => {
    const { showMore } = this.state;
    this.setState({ showMore: !showMore });
  }

  render() {
    const { showMore } = this.state;
    const { nodes, filters } = this.props;
    const typesFull = this.getKeywords(nodes);
    const types = showMore ? typesFull : _.chunk(typesFull, 5)[0] || [];
    if (typesFull.length < 2) {
      return null;
    }
    return (
      <div className="tagsFilter graphFilter">
        <h4 className="title">Node Keywords</h4>
        <ul className="list">
          {types.map((item) => (
            <li key={item.keyword} className="item">
              <Checkbox
                label={item.keyword}
                checked={_.isEmpty(filters.nodeKeywords) || filters.nodeKeywords.includes(item.keyword)}
                onChange={() => this.handleChange(item.keyword)}
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
)(KeywordsFilter);

export default Container;
