import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import NoGraph from '../components/NoGraph';
import GraphListItem from '../components/graphData/GraphListItem';
import { getShareGraphListRequest } from '../store/actions/share';
import Pagination from '../components/Pagination';
import GraphCardItem from '../components/graphData/GraphCardItem';

class Shared extends Component {
  static propTypes = {
    shareGraphsList: PropTypes.array.isRequired,
    shareGraphsListStatus: PropTypes.string.isRequired,
    getShareGraphListRequest: PropTypes.func.isRequired,
    shareGraphsListInfo: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
  }

  componentDidMount() {
    const order = JSON.parse(localStorage.getItem('/shared')) || 'newest';
    const { page = 1, s } = queryString.parse(window.location.search);
    this.props.getShareGraphListRequest(page, { s, filter: order });
  }

  render() {
    const {
      shareGraphsListStatus, shareGraphsList, shareGraphsListInfo: { totalPages }, mode,
    } = this.props;
    return (
      <>
        <div
          className={`${mode === 'tab_card' ? 'graphsCard' : 'graphsList'} ${!shareGraphsList.length ? 'empty' : ''}`}
        >
          {shareGraphsListStatus !== 'request' && _.isEmpty(shareGraphsList) ? (
            <NoGraph />
          ) : mode === 'list'
            ? <GraphListItem graphs={shareGraphsList} headerTools="shared" />
            : <GraphCardItem graphs={shareGraphsList} headerTools="shared" />}
        </div>
        {shareGraphsList.length ? <Pagination totalPages={totalPages} /> : null}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  shareGraphsList: state.share.shareGraphsList,
  shareGraphsListStatus: state.share.shareGraphsListStatus,
  shareGraphsListInfo: state.share.shareGraphsListInfo,
});

const mapDispatchToProps = {
  getShareGraphListRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Shared);

export default withRouter(Container);

