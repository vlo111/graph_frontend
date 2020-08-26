import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import Checkbox from '../form/Checkbox';
import Button from '../form/Button';

class TagsFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
  }

  getTags = memoizeOne((nodes) => {
    const tags = _.chain(nodes)
      .map((d) => d.tags)
      .flatten(1)
      .groupBy()
      .map((d, key) => ({
        length: d.length,
        tag: key,
      }))
      .orderBy('length', 'desc')
      .value();
    return tags;
  }, _.isEqual);

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  handleChange = (value) => {
    const { nodes, filters } = this.props;
    if (!filters.nodeTags.length) {
      filters.nodeTags = this.getTags(nodes).map((d) => d.tag);
    }
    const i = filters.nodeTags.indexOf(value);
    if (i > -1) {
      filters.nodeTags.splice(i, 1);
      if (!filters.nodeTags.length) {
        filters.nodeTags = this.getTags(nodes).map((d) => d.tag).filter((d) => d !== value);
      }
    } else {
      filters.nodeTags.push(value);
    }

    this.props.setFilter('nodeTags', filters.nodeTags);
  }

  toggleMore = () => {
    const { showMore } = this.state;
    this.setState({ showMore: !showMore });
  }

  render() {
    const { showMore } = this.state;
    const { nodes, filters } = this.props;
    const typesFull = this.getTags(nodes);
    const types = showMore ? typesFull : _.chunk(typesFull, 5)[0] || [];
    if (!typesFull.length) {
      return null;
    }
    return (
      <div className="tagsFilter graphFilter">
        <h4 className="title">Node Tags</h4>
        <ul className="list">
          {types.map((item) => (
            <li key={item.tag} className="item">
              <Checkbox
                label={item.tag}
                checked={_.isEmpty(filters.nodeTags) || filters.nodeTags.includes(item.tag)}
                onChange={() => this.handleChange(item.tag)}
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
)(TagsFilter);

export default Container;
