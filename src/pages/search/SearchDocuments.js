import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getDocumentsByTagRequest } from '../../store/actions/document';
import NodeIcon from '../../components/NodeIcon';
import Loading from '../../components/Loading';
import ChartUtils from '../../helpers/ChartUtils';

class SearchDocuments extends Component {
    static propTypes = {
      setLimit: PropTypes.bool,
      documentSearch: PropTypes.object.isRequired,
      getDocumentsByTagRequest: PropTypes.func.isRequired,
      currentUserId: PropTypes.number.isRequired,
    };

    constructor() {
      super();
      this.state = { loading: true };
    }

    static defaultProps = {
      setLimit: false,
    }

    searchDocuments = memoizeOne((searchParam) => {
      this.props.getDocumentsByTagRequest(searchParam);
    })

    goToNodeTab = (graphId, node, userId) => {
      const { currentUserId } = this.props;
      const mode = currentUserId === userId ? 'update' : 'view';
      this.props.history.replace(`/graphs/${mode}/${graphId}?info=${node.id}`);
      ChartUtils.findNodeInDom(node);
    }

    componentDidMount() {
      if (this.state.loading) {
        const { documentSearch } = this.props;
        if (documentSearch && documentSearch.length) {
          this.setState({ loading: false });
        }
      }
    }

    render() {
      const { setLimit, documentSearch } = this.props;
      const { loading } = this.state;
      const { s: searchParam } = queryString.parse(window.location.search);
      this.searchDocuments(searchParam);
      let users = {};
      if (documentSearch.length) {
        documentSearch.sort((a, b) => a.nodeType.localeCompare(b.nodeType));

        const groupByUserId = (array, key) => array.reduce((result, obj) => {
          (result[obj[key]] = result[obj[key]] || []).push(obj);

          if (obj.user && !result[obj[key]].user) {
            result[obj[key]].user = obj.user;
          }

          obj.graphName = obj.graphs.title;
          obj.graphCreated = obj.graphs.createdAt;

          obj.node = obj.graphs.nodes.filter((p) => p.id === obj.nodeId)[0];

          return result;
        }, {});

        const groupByGraphId = (array, key) => array.reduce((result, obj) => {
          (result[obj[key]] = result[obj[key]] || []).push(obj);
          return result;
        }, {});

        users = groupByUserId(documentSearch, 'userId');

        Object.keys(users).map((item) => {
          const { user } = users[item];
          users[item] = groupByGraphId(users[item], 'graphName');
          users[item].user = user;
        });
      }

      return (
        <div className="searchData">
          {Object.keys(users) && Object.keys(users).length ? (
            <div className="searchData__wrapper">
              <h3>Documents</h3>
              {Object.keys(users).map((item) => (
                <div>
                  {Object.keys(users[item]).map((graph) => (
                      users[item].user?.id && users[item][graph].length
                        ? (
                          <div className="searchMediaContent">
                            <article key={users[item].user.id} className="searchData__graph">
                              <div className="searchData__graphInfo">
                                <div>
                                  <h3>{users[item][graph][0].graphName}</h3>
                                </div>
                                <div className="searchData__graphInfo-details">
                                  <p className="createdBy">
                                    <span>created by </span>
                                    <Link to={`/profile/${users[item].user.id}`}>
                                      {`${users[item].user.firstName} ${users[item].user.lastName}`}
                                    </Link>
                                  </p>
                                  <p className="createdBy">{moment(users[item][graph][0].graphCreated).calendar()}</p>
                                </div>
                              </div>
                              <hr className="line" />
                              <div className="searchDocumentContent">
                                {users[item][graph].map((document, index, array) => (
                                  document.id && (
                                  <div
                                    style={document.nodeType !== array[index === 0 ? index : index - 1].nodeType
                                      ? { gridColumnEnd: 2 } : {}}
                                    className="nodeTabs tabDoc"
                                  >
                                    <p
                                      className="nodeLink"
                                      onClick={() => this.goToNodeTab(
                                        document.graphId,
                                        document.node,
                                        users[item].user.id,
                                      )}
                                    >
                                      <div className="left">
                                        <NodeIcon node={document.node} />
                                      </div>
                                      <div className="right">
                                        <span className="name">{document.node.name}</span>
                                        <span className="type">{document.node.type}</span>
                                      </div>
                                    </p>
                                    {
                                        document.altText
                                          ? <a download={document.altText} href={document.data}>{document.altText}</a>
                                          : (
                                            <a download={document.name} href={document.data}>{document.name}</a>
                                          )
                                      }
                                  </div>
                                  )
                                ))}
                              </div>
                            </article>
                          </div>
                        ) : <div />
                  ))}
                </div>
              ))}
              {
                  setLimit && document.length > 5
                  && <div className="viewAll"><Link to={`search-documents?s=${searchParam}`}>View all</Link></div>
              }
            </div>
          ) : ((!setLimit && (!loading
            ? <Loading />
            : <h3 className="mediaNotFound">No Documents Found</h3>)) || null)}
        </div>
      );
    }
}

const mapStateToProps = (state) => ({
  currentUserId: state.account.myAccount.id,
  userSearch: state.account.userSearch,
  documentSearch: state.document.documentSearch,
});
const mapDispatchToProps = {
  getDocumentsByTagRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchDocuments);

export default withRouter(Container);
