import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import moment from 'moment';
import memoizeOne from 'memoize-one';
import { searchGraphsListRequest } from '../../store/actions/shareGraphs';
import Tooltip from 'rc-tooltip';
import GraphListFooter from '../../components/graphData/GraphListFooter';
import GraphDashboardSubMnus from '../../components/graphData/GraphListHeader';
import NotFound from '../../assets/images/NotFound.png';

class SearchSharedGraphs extends Component {
  static propTypes = {
    setLimit: PropTypes.bool,
    searchGraphsListRequest: PropTypes.func.isRequired,
    shareGraphsList: PropTypes.array.isRequired,
  };

  static defaultProps = {
    setLimit: false,
  }

  getGraphs = memoizeOne((page, searchParam) => {
    this.props.searchGraphsListRequest(page, { s: searchParam });
  })

  showCardOver = (id) => {
    document.getElementsByClassName(`graph-card_${id}`)[0].style.display = 'flex';
  }

  hideCardOver = (id) => {
    document.getElementsByClassName(`graph-card_${id}`)[0].style.display = 'none';
  }

  updateGraph = (graph) => {
    const { graphsList } = this.props;

    graphsList.map((p) => {
      if (p.id === graph.id) {
        p.title = graph.title;
        p.description = graph.description;
      }
    });

    this.setState({
      graphsList,
    });
  }

  render() {
    const { setLimit, shareGraphsList } = this.props;
    const { page = 1, s: searchParam } = queryString.parse(window.location.search);
    this.getGraphs(page, searchParam);
    return (
      <>
        {shareGraphsList && shareGraphsList.length ? (
          <>
            {shareGraphsList.slice(0, 5).map((shGraph) => (
              <article key={shGraph.graph.id} className="graphs">
                <div className="top">
                  <div className="infoContent">
                    <img
                      className="avatar"
                      src={shGraph.graph.user.avatar}
                      alt={shGraph.graph.user.name}
                    />
                    <div className="infoWrapper">
                      <Link to={`/profile/${shGraph.graph.user.id}`}>
                        <span className="author">{`${shGraph.graph.user.firstName} ${shGraph.graph.user.lastName}`}</span>
                      </Link>
                      <div className="info">
                        <span>{moment(shGraph.graph.updatedAt).format('YYYY.MM.DD HH:mm')}</span>
                        <span className="nodesCount">{` ${shGraph.graph.nodesCount} nodes `}</span>
                      </div>
                    </div>
                  </div>
                  <div className="sub-menus">
                    <GraphDashboardSubMnus updateGraph={this.updateGraph} shGraph={shareGraphsList} headerTools="shared"/>
                  </div>
                </div>
                <div>
                  <Tooltip overlay={shGraph.graph.title} placement="bottom" >
                    <h3 className="sharGraphSearch">
                      {' '}
                      {shGraph.graph.title.length > 25 ? `${shGraph.graph.title.substring(0, 25)}...` : shGraph.graph.title}
                    </h3>
                  </Tooltip>
                  <div className="descriptionGraph">
                    <Tooltip overlay={shGraph.graph.description} placement="bottom" >
                      <span>
                        {' '}
                        {shGraph.graph.description.length > 40 ? `${shGraph.graph.description.substring(0, 40)}...` : shGraph.graph.description}
                      </span>
                    </Tooltip>
                  </div>
                </div>

                <div
                  onMouseOver={() => this.showCardOver(shGraph.graph.id)}
                  onMouseOut={() => this.hideCardOver(shGraph.graph.id)}
                  className="graph-image"
                >

                  <div className={`buttonView graph-card_${shGraph.graph.id}`}>
                    <Link className="btn-edit view" to={`/graphs/update/${shGraph.graph.id}`} replace> Edit </Link>
                    <Link className="btn-preview view" to={`/graphs/view/${shGraph.graph.id}`} replace> Preview</Link>
                  </div>
                  <img
                    className="thumbnail"
                    src={`${shGraph.graph.thumbnail}?t=${moment(shGraph.graph.updatedAt).unix()}`}
                    alt={shGraph.graph.title}
                  />
                </div>
                <GraphListFooter graph={shGraph.graph} />

              </article>
            ))}

          </>
        ) : ((!setLimit && <div className='not_found'>
          <img src={NotFound} />
          <h3>Not Found</h3>
        </div>) || null)}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  shareGraphsList: state.shareGraphs.shareGraphsList,
});
const mapDispatchToProps = {
  searchGraphsListRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchSharedGraphs);

export default withRouter(Container);
