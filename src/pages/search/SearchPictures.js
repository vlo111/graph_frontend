import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getPicturesByTagRequest } from '../../store/actions/document';

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
      pictureSearch.sort((a, b) => a.nodeType.localeCompare(b.nodeType));

      const groupByUserId = (array, key) => array.reduce((result, obj) => {
        (result[obj[key]] = result[obj[key]] || []).push(obj);
        if (obj.user && !result[obj[key]].user) {
          result[obj[key]].user = obj.user;
        }
        return result;
      }, {});

      users = groupByUserId(pictureSearch, 'userId');
    }

    return (
      <div className="searchData">
        {Object.keys(users) && Object.keys(users).length ? (
          <div className="searchData__wrapper">
            <h3>Pictures</h3>
            {Object.keys(users).slice(0, 5).map((item) => (
              <div className="searchMediaContent">
                <article key={users[item].user.id} className="searchData__graph">
                  <div className="searchData__graphInfo">
                    <img
                      className="avatar"
                      src={users[item].user.avatar}
                      alt={users[item].user.firstName}
                    />
                    <div className="searchData__graphInfo-details">
                      <Link to={`/profile/${users[item].user.id}`}>
                        {`${users[item].user.firstName} ${users[item].user.lastName}`}
                      </Link>
                      <span className="description">
                        {users[item].user.email}
                      </span>
                    </div>
                  </div>
                  <div className="searchDocumentContent">
                    {users[item].map((document, index, array) => (
                      document.id && (
                        <div
                          style={document.nodeType !== array[index === 0 ? index : index - 1].nodeType
                            ? { gridColumnEnd:2 } : {}}
                          className="nodeTabs tabDoc"
                        >
                          <p
                            onClick={() => this.goToNodeTab(document.graphId, document.nodeId, users[item].user.id)}
                            className="nodeName"
                          >
                            {document.nodeName}
                          </p>

                          <p className="nodeType">{document.nodeType}</p>
                          <p>{moment(document.updatedAt).calendar()}</p>
                          {
                                document.altText
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
                                  )
                              }
                        </div>
                      )
                    ))}
                  </div>

                </article>
              </div>
            ))}
            {
              setLimit && document.length > 5
              && <div className="viewAll"><Link to={`search-pictures?s=${searchParam}`}>View all</Link></div>
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
