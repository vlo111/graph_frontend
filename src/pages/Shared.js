import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import NoGraph from '../components/NoGraph';
import GraphListItem from '../components/GraphListItem';
import { getShareGraphListRequest } from '../store/actions/share';

class Shared extends Component {
  static propTypes = {
    shareGraphsList: PropTypes.array.isRequired,
    shareGraphsListStatus: PropTypes.string.isRequired,
    getShareGraphListRequest: PropTypes.func.isRequired,
  }

  getShareGraphsList = memoizeOne((page) => {
    this.props.getShareGraphListRequest(page);
  })

  render() {
    const { shareGraphsListStatus, shareGraphsList } = this.props;
    const { page = 1 } = queryString.parse(window.location.search);
    this.getShareGraphsList(page);
    return (
      <>
        <div className={`graphsList ${!shareGraphsList.length ? 'empty' : ''}`}>
          {_.isEmpty(shareGraphsList) && shareGraphsListStatus !== 'request' ? (
            <NoGraph />
          ) : null}
          {shareGraphsList.map((graph) => (
            <GraphListItem key={graph.id} graph={graph} />
          ))}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  shareGraphsList: state.share.shareGraphsList,
  shareGraphsListStatus: state.share.shareGraphsListStatus,
});

const mapDispatchToProps = {
  getShareGraphListRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Shared);

export default withRouter(Container);
