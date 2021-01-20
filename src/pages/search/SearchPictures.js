import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getPicturesByTagRequest } from '../../store/actions/document';
import NodeIcon from '../../components/NodeIcon';

class SearchPictures extends Component {
  static propTypes = {
    setLimit: PropTypes.bool,
    pictureSearch: PropTypes.object.isRequired,
    getPicturesByTagRequest: PropTypes.func.isRequired,
    currentUserId: PropTypes.number.isRequired,
  };

  static defaultProps = {
    setLimit: false,
  }

  searchPictures = memoizeOne((searchParam) => {
    this.props.getPicturesByTagRequest(searchParam);
  })

  goToNodeTab = (graphId, nodeId, userId) => {
    const { currentUserId } = this.props;
    const mode = currentUserId === userId ? 'update' : 'view';
    this.props.history.replace(`/graphs/${mode}/${graphId}?info=${nodeId}`);
  }

  render() {
    const { setLimit, pictureSearch } = this.props;
    const { s: searchParam } = queryString.parse(window.location.search);
    this.searchPictures(searchParam);
    let users = {};
    if (pictureSearch.length) {
      console.log('-------------------------------------')
      console.log(pictureSearch)
      console.log('-------------------------------------')
      pictureSearch.sort((a, b) => a.nodeType.localeCompare(b.nodeType));

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

      users = groupByUserId(pictureSearch, 'userId');

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
            <h3>Pictures</h3>
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
                                      document.nodeId,
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
                                  {document.altText
                                    ? <a download={document.altText} href={document.data}>{document.altText}</a>
                                    : (
                                      <table>
                                        <tbody>
                                          <tr>
                                            <td>
                                              <a href={document.data} download="graph_tab_img">
                                                <img
                                                  src={document.data}
                                                  width="300px"
                                                  download="graphTabImage"
                                                />
                                              </a>
                                              {document.description}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    )}
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
        ) : ((!setLimit && <h3>No Pictures Found</h3>) || null)}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUserId: state.account.myAccount.id,
  pictureSearch: state.document.pictureSearch,
});
const mapDispatchToProps = {
  getPicturesByTagRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchPictures);

export default withRouter(Container);
