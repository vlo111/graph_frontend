import React, { Component } from 'react';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Input from '../form/Input';

class SearchGraphs extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
    };
  }

  handleChange = (s = '') => {
    if (!s) {
      this.props.history.replace('/');
      return;
    }
    const query = queryString.stringify({ s });
    this.props.history.replace(`/search?${query}`);
  }

  render() {
    const queryObj = queryString.parse(window.location.search);
    return (
      <div className="searchInputWrapper">
        <Input
          placeholder="Search ..."
          autoComplete="off"
          value={queryObj.s}
          icon="fa-search"
          containerClassName="graphSearch"
          onChangeText={this.handleChange}
        />
      </div>
    );
  }
}

export default withRouter(SearchGraphs);
